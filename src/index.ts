import {
  GlobalConfig,
  ApiConfig,
  RequestConfig,
  RequestResult,
  ServiceResult,
  ServiceFunction,
} from './types';
import { formatData, parseQuery, omitObj } from './utils';
import {
  get,
  post,
  put,
  del as deleteMethod,
  patch,
  head,
  options,
  all,
  race,
} from './axios-like';

const interceptorsRequest: Array<
  (config: ApiConfig) => ApiConfig | Promise<ApiConfig>
> = [];
const interceptorsResponse: Array<
  (response: Response) => unknown | Promise<unknown>
> = [];
const interceptorsRequestError: Array<(error: unknown) => unknown> = [];
const interceptorsResponseError: Array<(error: unknown) => void> = [];

/**
 *
 * @param {object} globalConfig 全局基础配置对象
 * @param {object} apiConfig 请求接口配置对象
 * @description  封装fetch请求,想法是希望通过一些约定式的简单配置,但是不希望与原生fetch的配置产生太大的差异，减少学习成本，理论上会原生fetch就能快速上手使用,可以快速的使用，满足大部分使用场景
 *
 */
function service(
  globalConfig: GlobalConfig = {
    baseURL: '',
    timeout: 30000, // 超时时间
    timeoutRetry: false, // 超时重试
    timeoutRetryCount: 0, // 超时重试次数
    retry: false, // 重试
    retryCount: 0, // 重试次数
    retryInterval: 0, //重试间隔时间
    cancelRepeatedRequests: false, // 是否开启自动取消重复请求
    credentials: 'same-origin', // 携带cookies
  },
  apiConfig: Record<string, ApiConfig> = {}
): ServiceResult {
  const pendingMap = new Map<string, AbortController>(); // 记录正在进行中的请求
  return Object.keys(apiConfig).reduce((prev, key) => {
    let option = apiConfig[key] || {};
    option.method = option.method ?? 'GET';
    option.dataType = option.dataType ?? 'json';
    option.headers = option.headers || {};
    option.credentials = option.credentials || globalConfig.credentials;
    let errorCaptured = false;
    prev[key] = (config: RequestConfig = {}): RequestResult => {
      let controller: AbortController;
      return {
        abort: () => {
          if (!controller) {
            throw new Error('请先发送请求后再使用中止功能');
          }
          controller.abort();
        },
        send: async (info: RequestConfig = {}): Promise<unknown> => {
          info = Object.assign({}, config, info);
          controller = new AbortController();
          option.signal = controller.signal;
          // 请求拦截器
          for (let i = 0; i < interceptorsRequest.length; i++) {
            option = await interceptorsRequest[i](option);
          }
          const mergeGlobalConfig = {
            baseURL:
              info.baseURL || option.baseURL || globalConfig.baseURL || '', // baseURL
            timeout:
              info.timeout || option.timeout || globalConfig.timeout || 30000, // 超时时间
            retry: (info.retry ?? option.retry ?? globalConfig.retry) || false, // 重试
            retryCount:
              info.retryCount ||
              option.retryCount ||
              globalConfig.retryCount ||
              0, // 重试次数
            retryInterval:
              info.retryInterval ||
              option.retryInterval ||
              globalConfig.retryInterval ||
              0, // 重试间隔时间
            timeoutRetry:
              (info.timeoutRetry ??
                option.timeoutRetry ??
                globalConfig.timeoutRetry) ||
              false, // 超时重试
            timeoutRetryCount:
              info.timeoutRetryCount ||
              option.timeoutRetryCount ||
              globalConfig.timeoutRetryCount ||
              0, // 超时重试次数
            cancelRepeatedRequests:
              (info.cancelRepeatedRequests ??
                option.cancelRepeatedRequests ??
                globalConfig.cancelRepeatedRequests) ||
              false, // 是否需要自动取消重复请求
          };
          let url = mergeGlobalConfig.baseURL;
          let path = `/${option.path || ''}${info.path ? '/' + info.path : ''}`;
          path = path.replace(/^\/\//, '/');
          url += path;
          let param = '?';
          const query = Object.assign({}, option.query || {}, info.query || {});
          param += parseQuery(query);
          if (param.length > 1) {
            url += param;
          }
          const { data, type } = formatData(
            Object.assign({}, option.body || {}, info.body || {}),
            info.dataType || option.dataType || 'json'
          );
          const headers = Object.assign(
            {},
            option.headers || {},
            info.headers || {},
            { 'Content-Type': type }
          );
          const existBody = option.body || info.body;
          const bodyData = existBody ? { body: data } : {};
          const completeOption = omitObj(
            { ...option, ...info, ...{ headers, ...bodyData } },
            [
              'baseURL',
              'timeoutRetry',
              'timeoutRetryCount',
              'cancelRepeatedRequests',
              'path',
              'timeout',
              'retry',
              'retryCount',
              'retryInterval',
              'query',
              'dataType',
            ]
          );
          const pendingSign = `${url}+${completeOption.method}`;
          if (mergeGlobalConfig.cancelRepeatedRequests) {
            // 开启自动取消重复请求
            if (pendingMap.has(pendingSign)) {
              // 如果当前请求在等待中，取消它并将其从等待中移除
              const abortController = pendingMap.get(pendingSign);
              if (abortController) {
                abortController.abort();
              }
              pendingMap.delete(pendingSign);
            }
            if (!pendingMap.has(pendingSign)) {
              // 如果map中没有当前请求则添加到map里
              pendingMap.set(pendingSign, controller);
            }
          }
          let alreadyRetryCount = 0; // 记录已重试次数
          let alreadyTimeoutRetryCount = 0; //记录超时已重试次数
          let oldController = controller;
          const request = (
            resolve: (value: unknown) => void,
            reject: (reason?: unknown) => void
          ) => {
            const timer = setTimeout(() => {
              oldController = controller;
              controller.abort();
              controller = new AbortController();
              completeOption.signal = controller.signal;
              // 超时重试
              if (mergeGlobalConfig.timeoutRetry) {
                if (
                  alreadyTimeoutRetryCount >=
                  mergeGlobalConfig.timeoutRetryCount
                ) {
                  reject('接口已超时');
                  clearTimeout(timer);
                  return;
                }
                alreadyTimeoutRetryCount++;
                // eslint-disable-next-line no-console
                console.log(
                  `${alreadyTimeoutRetryCount} timeoutRetrying ${url}`
                );
                request(resolve, reject);
              }
              clearTimeout(timer);
            }, mergeGlobalConfig.timeout);
            let retryTimer: ReturnType<typeof setTimeout>;
            // 发起fetch请求
            fetch(url, completeOption)
              .then(async res => {
                let info: unknown;
                // 响应拦截器
                for (let i = 0; i < interceptorsResponse.length; i++) {
                  info = await interceptorsResponse[i](res.clone());
                }
                if (res.ok) {
                  resolve(info);
                } else {
                  throw (
                    (info as { message?: string })?.message ||
                    '网络或浏览器出现问题，请稍后再试'
                  );
                }
              })
              .catch(error => {
                // 在开启重试的情况下处理其他报错和abort的报错区别
                // 由于abort中止请求后也会触发这里的catch所以不进行其他操作
                if (oldController.signal.aborted) return;
                if (mergeGlobalConfig.retry) {
                  // 请求失败重试
                  if (alreadyRetryCount >= mergeGlobalConfig.retryCount) {
                    if (!errorCaptured) {
                      errorCaptured = true;
                      setTimeout(() => {
                        // 控制同一个请求多次触发报错时一定时间内只执行一次响应错误拦截器
                        errorCaptured = false;
                        // 响应错误拦截器 可在此做错误提示
                        interceptorsResponseError.forEach(interceptors => {
                          interceptors(error);
                        });
                      }, 2000);
                    }
                    reject(error);
                    return;
                  }
                  alreadyRetryCount++;
                  retryTimer = setTimeout(() => {
                    // eslint-disable-next-line no-console
                    console.log(`${alreadyRetryCount} retrying ${url}`);
                    request(resolve, reject);
                    clearTimeout(retryTimer);
                  }, mergeGlobalConfig.retryInterval);
                } else {
                  if (!errorCaptured) {
                    errorCaptured = true;
                    setTimeout(() => {
                      // 控制同一个请求多次触发报错时一定时间内只执行一次响应错误拦截器
                      errorCaptured = false;
                      // 响应错误拦截器 可在此做错误提示
                      interceptorsResponseError.forEach(interceptors => {
                        interceptors(error);
                      });
                    }, 2000);
                  }
                  reject(error);
                }
              })
              .finally(() => {
                clearTimeout(timer); // 清除超时任务
                if (
                  mergeGlobalConfig.cancelRepeatedRequests &&
                  pendingMap.has(pendingSign)
                ) {
                  // 当前请求完成，将其从等待中移除
                  pendingMap.delete(pendingSign);
                }
              });
          };
          return new Promise((resolve, reject) => {
            request(resolve, reject);
          });
        },
      };
    };
    return prev;
  }, {} as ServiceResult);
}

// 拦截器
(service as ServiceFunction).interceptors = {
  request: {
    use: (
      callback: (config: ApiConfig) => ApiConfig | Promise<ApiConfig>,
      errorCallback?: (error: unknown) => unknown
    ) => {
      interceptorsRequest.push(callback);
      if (!errorCallback) return;
      interceptorsRequestError.push(errorCallback);
    },
  },
  response: {
    use: (
      callback: (response: Response) => unknown | Promise<unknown>,
      errorCallback?: (error: unknown) => void
    ) => {
      interceptorsResponse.push(callback);
      if (!errorCallback) return;
      interceptorsResponseError.push(errorCallback);
    },
  },
};

// 便捷方法
(service as ServiceFunction).get = get;
(service as ServiceFunction).post = post;
(service as ServiceFunction).put = put;
(service as ServiceFunction).delete = deleteMethod;
(service as ServiceFunction).patch = patch;
(service as ServiceFunction).head = head;
(service as ServiceFunction).options = options;
(service as ServiceFunction).all = all;
(service as ServiceFunction).race = race;

export default service as ServiceFunction;
export { service };
export type {
  GlobalConfig,
  ApiConfig,
  RequestConfig,
  RequestResult,
  ServiceResult,
  ServiceFunction,
  Interceptors,
  AxiosLikeRequestConfig,
  AxiosLikeResponse,
  ProgressEvent,
  HttpError,
  RetryConfig,
  CacheConfig,
  RateLimitConfig,
  TypedRequestConfig,
  TypeSafeHttpMethods,
  ApiDefinition,
  TypedApiClient,
  ResponseInterceptor,
  RequestInterceptor,
  ErrorHandler,
  StatusValidator,
  DataTransformer,
  HttpMethod,
  ResponseType,
  ContentType,
  CredentialsType,
} from './types';
export {
  get,
  post,
  put,
  del as delete,
  patch,
  head,
  options,
  all,
  race,
} from './axios-like';
export {
  HTTP_STATUS,
  isInformational,
  isSuccess,
  isRedirection,
  isClientError,
  isServerError,
  isError,
  STATUS_MESSAGES,
  createHttpError,
  createErrorFromResponse,
  ErrorClassifier,
  ErrorRecoveryStrategy,
  ErrorReporter,
  defaultErrorHandlers,
  installDefaultErrorHandlers,
  createStatusValidator,
  getStatusMessage,
  isRedirectStatus,
  requiresAuth,
  isForbidden,
  isRateLimited,
} from './error-handling';
export {
  RequestTransformers,
  ResponseTransformers,
  CommonTransformers,
  PresetTransformers,
  TransformerFactory,
} from './transformers';
