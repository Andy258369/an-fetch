import {
  AxiosLikeRequestConfig,
  AxiosLikeResponse,
  ProgressEvent,
  GlobalConfig,
} from './types';
import { formatData, parseQuery } from './utils';

// 默认全局配置
const defaultGlobalConfig: GlobalConfig = {
  baseURL: '',
  timeout: 30000,
  timeoutRetry: false,
  timeoutRetryCount: 0,
  retry: false,
  retryCount: 0,
  retryInterval: 0,
  cancelRepeatedRequests: false,
  credentials: 'same-origin',
};

// 拦截器存储
export const axiosLikeInterceptors = {
  request: [] as Array<
    (
      config: AxiosLikeRequestConfig
    ) => AxiosLikeRequestConfig | Promise<AxiosLikeRequestConfig>
  >,
  response: [] as Array<
    (
      response: AxiosLikeResponse
    ) => AxiosLikeResponse | Promise<AxiosLikeResponse>
  >,
  requestError: [] as Array<(error: unknown) => unknown>,
  responseError: [] as Array<(error: unknown) => void>,
};

// 解析响应头
function parseHeaders(response: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

// 创建进度事件
function createProgressEvent(loaded: number, total: number): ProgressEvent {
  return {
    loaded,
    total,
    lengthComputable: total > 0,
    percentage: total > 0 ? Math.round((loaded / total) * 100) : 0,
  };
}

// 模拟下载进度（因为 fetch API 不支持直接获取下载进度）
async function processResponseWithProgress(
  response: Response,
  config: AxiosLikeRequestConfig
): Promise<unknown> {
  if (!config.onDownloadProgress || !response.body) {
    // 如果没有进度回调或不支持流，直接处理响应
    return processResponse(response, config);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      loaded += value.length;

      const progressEvent = createProgressEvent(loaded, total);
      config.onDownloadProgress(progressEvent);
    }

    // 重建响应数据
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      combinedArray.set(chunk, offset);
      offset += chunk.length;
    }

    // 根据响应类型处理数据
    const responseType = config.responseType || 'json';
    switch (responseType) {
      case 'json': {
        const text = new TextDecoder().decode(combinedArray);
        return JSON.parse(text);
      }
      case 'text':
        return new TextDecoder().decode(combinedArray);
      case 'blob':
        return new Blob([combinedArray]);
      case 'arrayBuffer':
        return combinedArray.buffer;
      default:
        return new TextDecoder().decode(combinedArray);
    }
  } finally {
    reader.releaseLock();
  }
}

// 处理响应数据
async function processResponse(
  response: Response,
  config: AxiosLikeRequestConfig
): Promise<unknown> {
  const responseType = config.responseType || 'json';

  switch (responseType) {
    case 'json':
      return response.json();
    case 'text':
      return response.text();
    case 'blob':
      return response.blob();
    case 'arrayBuffer':
      return response.arrayBuffer();
    default:
      return response.json();
  }
}

// 验证状态码
function validateStatus(
  status: number,
  config: AxiosLikeRequestConfig
): boolean {
  if (config.validateStatus) {
    return config.validateStatus(status);
  }
  return status >= 200 && status < 300;
}

// 创建 AxiosLike 响应对象
async function createAxiosLikeResponse<T = unknown>(
  response: Response,
  config: AxiosLikeRequestConfig
): Promise<AxiosLikeResponse<T>> {
  let data: T;

  if (config.onDownloadProgress) {
    data = (await processResponseWithProgress(response, config)) as T;
  } else {
    data = (await processResponse(response, config)) as T;
  }

  // 应用响应转换器
  if (config.transformResponse) {
    for (const transform of config.transformResponse) {
      data = transform(data) as T;
    }
  }

  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: parseHeaders(response),
    config,
  };
}

// 核心请求函数
export async function axiosLikeRequest<T = unknown>(
  config: AxiosLikeRequestConfig
): Promise<AxiosLikeResponse<T>> {
  // 应用请求拦截器
  let requestConfig = { ...config };
  for (const interceptor of axiosLikeInterceptors.request) {
    try {
      requestConfig = await interceptor(requestConfig);
    } catch (error) {
      // 处理请求拦截器错误
      for (const errorInterceptor of axiosLikeInterceptors.requestError) {
        errorInterceptor(error);
      }
      throw error;
    }
  }

  // 合并配置
  const mergedConfig = {
    ...defaultGlobalConfig,
    ...requestConfig,
  };

  // 构建 URL
  let url = mergedConfig.url || '';
  if (mergedConfig.baseURL && !url.startsWith('http')) {
    url = `${mergedConfig.baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }

  // 处理查询参数
  if (mergedConfig.params || mergedConfig.query) {
    const params = { ...mergedConfig.params, ...mergedConfig.query };
    const queryString = parseQuery(params);
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // 处理请求数据
  let body: unknown = mergedConfig.data || mergedConfig.body;

  // 应用请求转换器
  if (mergedConfig.transformRequest && body !== undefined) {
    for (const transform of mergedConfig.transformRequest) {
      body = transform(body);
    }
  }

  // 格式化数据
  const { data: formattedData, type: contentType } = body
    ? formatData(body, mergedConfig.dataType || 'json')
    : { data: undefined, type: '' };

  // 构建请求头
  const headers: Record<string, string> = {
    ...mergedConfig.headers,
  };

  if (body && contentType) {
    headers['Content-Type'] = contentType;
  }

  // 创建 AbortController
  const controller = new AbortController();

  // 处理超时
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (mergedConfig.timeout) {
    timeoutId = setTimeout(() => {
      controller.abort();
    }, mergedConfig.timeout);
  }

  // 构建 fetch 选项
  const fetchOptions: Record<string, unknown> = {
    method: mergedConfig.method || 'GET',
    headers,
    credentials: mergedConfig.credentials,
    signal: controller.signal,
  };

  if (body && mergedConfig.method !== 'GET' && mergedConfig.method !== 'HEAD') {
    fetchOptions.body = formattedData as string | FormData | Blob;
  }

  try {
    // 发送请求
    const response = await fetch(url, fetchOptions);

    // 清除超时
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 验证状态码
    if (!validateStatus(response.status, mergedConfig)) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    // 创建响应对象
    const axiosResponse = await createAxiosLikeResponse<T>(
      response,
      mergedConfig
    );

    // 应用响应拦截器
    let finalResponse = axiosResponse;
    for (const interceptor of axiosLikeInterceptors.response) {
      try {
        finalResponse = (await interceptor(
          finalResponse
        )) as AxiosLikeResponse<T>;
      } catch (error) {
        // 处理响应拦截器错误
        for (const errorInterceptor of axiosLikeInterceptors.responseError) {
          errorInterceptor(error);
        }
        throw error;
      }
    }

    return finalResponse;
  } catch (error) {
    // 清除超时
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 处理响应错误拦截器
    for (const errorInterceptor of axiosLikeInterceptors.responseError) {
      errorInterceptor(error);
    }

    throw error;
  }
}

// 便捷方法
export const get = <T = unknown>(
  url: string,
  config: AxiosLikeRequestConfig = {}
): Promise<AxiosLikeResponse<T>> => {
  return axiosLikeRequest<T>({ ...config, method: 'GET', url });
};

export const post = <T = unknown>(
  url: string,
  data?: unknown,
  config: AxiosLikeRequestConfig = {}
): Promise<AxiosLikeResponse<T>> => {
  return axiosLikeRequest<T>({ ...config, method: 'POST', url, data });
};

export const put = <T = unknown>(
  url: string,
  data?: unknown,
  config: AxiosLikeRequestConfig = {}
): Promise<AxiosLikeResponse<T>> => {
  return axiosLikeRequest<T>({ ...config, method: 'PUT', url, data });
};

export const del = <T = unknown>(
  url: string,
  config: AxiosLikeRequestConfig = {}
): Promise<AxiosLikeResponse<T>> => {
  return axiosLikeRequest<T>({ ...config, method: 'DELETE', url });
};

export const patch = <T = unknown>(
  url: string,
  data?: unknown,
  config: AxiosLikeRequestConfig = {}
): Promise<AxiosLikeResponse<T>> => {
  return axiosLikeRequest<T>({ ...config, method: 'PATCH', url, data });
};

export const head = <T = unknown>(
  url: string,
  config: AxiosLikeRequestConfig = {}
): Promise<AxiosLikeResponse<T>> => {
  return axiosLikeRequest<T>({ ...config, method: 'HEAD', url });
};

export const options = <T = unknown>(
  url: string,
  config: AxiosLikeRequestConfig = {}
): Promise<AxiosLikeResponse<T>> => {
  return axiosLikeRequest<T>({ ...config, method: 'OPTIONS', url });
};

// 并发请求
export const all = <T>(promises: Promise<T>[]): Promise<T[]> => {
  return Promise.all(promises);
};

export const race = <T>(promises: Promise<T>[]): Promise<T> => {
  return Promise.race(promises);
};
