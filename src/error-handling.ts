import { AxiosLikeResponse, AxiosLikeRequestConfig, HttpError } from './types';

// HTTP 状态码常量
export const HTTP_STATUS = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,

  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,

  // 3xx Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

// 状态码分类
export const isInformational = (status: number): boolean =>
  status >= 100 && status < 200;
export const isSuccess = (status: number): boolean =>
  status >= 200 && status < 300;
export const isRedirection = (status: number): boolean =>
  status >= 300 && status < 400;
export const isClientError = (status: number): boolean =>
  status >= 400 && status < 500;
export const isServerError = (status: number): boolean =>
  status >= 500 && status < 600;
export const isError = (status: number): boolean => status >= 400;

// 状态码描述映射
export const STATUS_MESSAGES: Record<number, string> = {
  [HTTP_STATUS.CONTINUE]: 'Continue',
  [HTTP_STATUS.SWITCHING_PROTOCOLS]: 'Switching Protocols',
  [HTTP_STATUS.PROCESSING]: 'Processing',

  [HTTP_STATUS.OK]: 'OK',
  [HTTP_STATUS.CREATED]: 'Created',
  [HTTP_STATUS.ACCEPTED]: 'Accepted',
  [HTTP_STATUS.NO_CONTENT]: 'No Content',
  [HTTP_STATUS.RESET_CONTENT]: 'Reset Content',
  [HTTP_STATUS.PARTIAL_CONTENT]: 'Partial Content',

  [HTTP_STATUS.MULTIPLE_CHOICES]: 'Multiple Choices',
  [HTTP_STATUS.MOVED_PERMANENTLY]: 'Moved Permanently',
  [HTTP_STATUS.FOUND]: 'Found',
  [HTTP_STATUS.SEE_OTHER]: 'See Other',
  [HTTP_STATUS.NOT_MODIFIED]: 'Not Modified',
  [HTTP_STATUS.TEMPORARY_REDIRECT]: 'Temporary Redirect',
  [HTTP_STATUS.PERMANENT_REDIRECT]: 'Permanent Redirect',

  [HTTP_STATUS.BAD_REQUEST]: 'Bad Request',
  [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
  [HTTP_STATUS.PAYMENT_REQUIRED]: 'Payment Required',
  [HTTP_STATUS.FORBIDDEN]: 'Forbidden',
  [HTTP_STATUS.NOT_FOUND]: 'Not Found',
  [HTTP_STATUS.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
  [HTTP_STATUS.NOT_ACCEPTABLE]: 'Not Acceptable',
  [HTTP_STATUS.PROXY_AUTHENTICATION_REQUIRED]: 'Proxy Authentication Required',
  [HTTP_STATUS.REQUEST_TIMEOUT]: 'Request Timeout',
  [HTTP_STATUS.CONFLICT]: 'Conflict',
  [HTTP_STATUS.GONE]: 'Gone',
  [HTTP_STATUS.LENGTH_REQUIRED]: 'Length Required',
  [HTTP_STATUS.PRECONDITION_FAILED]: 'Precondition Failed',
  [HTTP_STATUS.PAYLOAD_TOO_LARGE]: 'Payload Too Large',
  [HTTP_STATUS.URI_TOO_LONG]: 'URI Too Long',
  [HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
  [HTTP_STATUS.RANGE_NOT_SATISFIABLE]: 'Range Not Satisfiable',
  [HTTP_STATUS.EXPECTATION_FAILED]: 'Expectation Failed',
  [HTTP_STATUS.IM_A_TEAPOT]: "I'm a teapot",
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HTTP_STATUS.LOCKED]: 'Locked',
  [HTTP_STATUS.FAILED_DEPENDENCY]: 'Failed Dependency',
  [HTTP_STATUS.TOO_EARLY]: 'Too Early',
  [HTTP_STATUS.UPGRADE_REQUIRED]: 'Upgrade Required',
  [HTTP_STATUS.PRECONDITION_REQUIRED]: 'Precondition Required',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HTTP_STATUS.REQUEST_HEADER_FIELDS_TOO_LARGE]:
    'Request Header Fields Too Large',
  [HTTP_STATUS.UNAVAILABLE_FOR_LEGAL_REASONS]: 'Unavailable For Legal Reasons',

  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HTTP_STATUS.NOT_IMPLEMENTED]: 'Not Implemented',
  [HTTP_STATUS.BAD_GATEWAY]: 'Bad Gateway',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [HTTP_STATUS.GATEWAY_TIMEOUT]: 'Gateway Timeout',
  [HTTP_STATUS.HTTP_VERSION_NOT_SUPPORTED]: 'HTTP Version Not Supported',
  [HTTP_STATUS.VARIANT_ALSO_NEGOTIATES]: 'Variant Also Negotiates',
  [HTTP_STATUS.INSUFFICIENT_STORAGE]: 'Insufficient Storage',
  [HTTP_STATUS.LOOP_DETECTED]: 'Loop Detected',
  [HTTP_STATUS.NOT_EXTENDED]: 'Not Extended',
  [HTTP_STATUS.NETWORK_AUTHENTICATION_REQUIRED]:
    'Network Authentication Required',
};

// 创建 HTTP 错误
export function createHttpError(
  message: string,
  status?: number,
  statusText?: string,
  response?: AxiosLikeResponse,
  config?: AxiosLikeRequestConfig,
  code?: string
): HttpError {
  const error = new Error(message) as HttpError;
  error.name = 'HttpError';
  error.status = status;
  error.statusText = statusText;
  error.response = response;
  error.config = config;
  error.code = code;
  return error;
}

// 从响应创建错误
export function createErrorFromResponse(
  response: AxiosLikeResponse,
  config: AxiosLikeRequestConfig
): HttpError {
  const statusText =
    STATUS_MESSAGES[response.status] || response.statusText || 'Unknown Error';
  const message = `Request failed with status ${response.status}: ${statusText}`;

  return createHttpError(
    message,
    response.status,
    statusText,
    response,
    config,
    `ERR_HTTP_${response.status}`
  );
}

// 错误分类器
export class ErrorClassifier {
  static isNetworkError(error: Error): boolean {
    return (
      error.name === 'TypeError' ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed') ||
      error.message.includes('ERR_NETWORK')
    );
  }

  static isTimeoutError(error: Error): boolean {
    return (
      error.name === 'AbortError' ||
      error.message.includes('timeout') ||
      error.message.includes('ERR_TIMEOUT')
    );
  }

  static isCancelError(error: Error): boolean {
    return (
      error.name === 'AbortError' ||
      error.message.includes('canceled') ||
      error.message.includes('cancelled')
    );
  }

  static isRetryableError(error: HttpError): boolean {
    // 网络错误或超时错误通常可重试
    if (this.isNetworkError(error) || this.isTimeoutError(error)) {
      return true;
    }

    // 某些 HTTP 状态码可重试
    if (error.status) {
      const retryableStatuses: number[] = [
        HTTP_STATUS.REQUEST_TIMEOUT,
        HTTP_STATUS.TOO_MANY_REQUESTS,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        HTTP_STATUS.GATEWAY_TIMEOUT,
      ];
      return retryableStatuses.includes(error.status);
    }

    return false;
  }

  static isAuthError(error: HttpError): boolean {
    return (
      error.status === HTTP_STATUS.UNAUTHORIZED ||
      error.status === HTTP_STATUS.FORBIDDEN
    );
  }

  static isClientError(error: HttpError): boolean {
    return error.status ? isClientError(error.status) : false;
  }

  static isServerError(error: HttpError): boolean {
    return error.status ? isServerError(error.status) : false;
  }
}

// 错误恢复策略
export class ErrorRecoveryStrategy {
  static async retryWithExponentialBackoff(
    requestFn: () => Promise<AxiosLikeResponse>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<AxiosLikeResponse> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        // 检查是否应该重试
        if (
          error instanceof Error &&
          !ErrorClassifier.isRetryableError(error as HttpError)
        ) {
          break;
        }

        // 指数退避延迟
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  static async retryWithLinearBackoff(
    requestFn: () => Promise<AxiosLikeResponse>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<AxiosLikeResponse> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        if (
          error instanceof Error &&
          !ErrorClassifier.isRetryableError(error as HttpError)
        ) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

// 错误报告器
export class ErrorReporter {
  private static errorHandlers: Array<(error: HttpError) => void> = [];

  static addErrorHandler(handler: (error: HttpError) => void): void {
    this.errorHandlers.push(handler);
  }

  static removeErrorHandler(handler: (error: HttpError) => void): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  static reportError(error: HttpError): void {
    // 记录错误
    console.error('HTTP Error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      url: error.config?.url,
      method: error.config?.method,
      timestamp: new Date().toISOString(),
    });

    // 通知错误处理器
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }
}

// 默认错误处理器
export const defaultErrorHandlers = {
  // 认证错误处理
  authErrorHandler: (error: HttpError) => {
    if (ErrorClassifier.isAuthError(error)) {
      console.warn('认证失败，请重新登录');
      // 可以在这里触发重新登录逻辑
    }
  },

  // 网络错误处理
  networkErrorHandler: (error: HttpError) => {
    if (ErrorClassifier.isNetworkError(error)) {
      console.warn('网络连接失败，请检查网络状态');
    }
  },

  // 服务器错误处理
  serverErrorHandler: (error: HttpError) => {
    if (ErrorClassifier.isServerError(error)) {
      console.warn('服务器内部错误，请稍后重试');
    }
  },

  // 客户端错误处理
  clientErrorHandler: (error: HttpError) => {
    if (ErrorClassifier.isClientError(error)) {
      console.warn('请求参数错误，请检查请求内容');
    }
  },
};

// 安装默认错误处理器
export function installDefaultErrorHandlers(): void {
  Object.values(defaultErrorHandlers).forEach(handler => {
    ErrorReporter.addErrorHandler(handler);
  });
}

// 验证状态码
export function createStatusValidator(
  validStatuses?: number[]
): (status: number) => boolean {
  if (validStatuses) {
    return (status: number) => validStatuses.includes(status);
  }

  // 默认验证器：2xx 状态码为成功
  return (status: number) => isSuccess(status);
}

// 获取状态码描述
export function getStatusMessage(status: number): string {
  return STATUS_MESSAGES[status] || 'Unknown Status';
}

// 检查是否为重定向状态码
export function isRedirectStatus(status: number): boolean {
  return isRedirection(status);
}

// 检查是否需要身份验证
export function requiresAuth(status: number): boolean {
  return status === HTTP_STATUS.UNAUTHORIZED;
}

// 检查是否被禁止访问
export function isForbidden(status: number): boolean {
  return status === HTTP_STATUS.FORBIDDEN;
}

// 检查是否为速率限制
export function isRateLimited(status: number): boolean {
  return status === HTTP_STATUS.TOO_MANY_REQUESTS;
}
