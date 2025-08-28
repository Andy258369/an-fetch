export interface GlobalConfig {
  baseURL?: string;
  timeout?: number;
  timeoutRetry?: boolean;
  timeoutRetryCount?: number;
  retry?: boolean;
  retryCount?: number;
  retryInterval?: number;
  cancelRepeatedRequests?: boolean;
  credentials?: 'omit' | 'same-origin' | 'include';
}

export interface ApiConfig {
  path?: string;
  method?: string;
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
  dataType?: 'json' | 'form-urlencoded' | 'form-data' | 'html' | 'xml';
  baseURL?: string;
  timeout?: number;
  timeoutRetry?: boolean;
  timeoutRetryCount?: number;
  retry?: boolean;
  retryCount?: number;
  retryInterval?: number;
  cancelRepeatedRequests?: boolean;
  credentials?: 'omit' | 'same-origin' | 'include';
  signal?: AbortSignal;
}

export interface RequestConfig extends ApiConfig {
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  dataType?: 'json' | 'form-urlencoded' | 'form-data' | 'html' | 'xml';
}

export interface RequestResult {
  abort: () => void;
  send: (config?: RequestConfig) => Promise<unknown>;
}

export interface ServiceResult {
  [key: string]: (config?: RequestConfig) => RequestResult;
}

export interface Interceptors {
  request: {
    use: (
      callback: (config: ApiConfig) => ApiConfig | Promise<ApiConfig>,
      errorCallback?: (error: unknown) => unknown
    ) => void;
  };
  response: {
    use: (
      callback: (response: Response) => unknown | Promise<unknown>,
      errorCallback?: (error: unknown) => void
    ) => void;
  };
}

export interface ServiceFunction {
  (
    globalConfig?: GlobalConfig,
    apiConfig?: Record<string, ApiConfig>
  ): ServiceResult;
  interceptors: Interceptors;
  get: (url: string, config?: RequestConfig) => Promise<unknown>;
  post: (
    url: string,
    data?: unknown,
    config?: RequestConfig
  ) => Promise<unknown>;
  put: (
    url: string,
    data?: unknown,
    config?: RequestConfig
  ) => Promise<unknown>;
  delete: (url: string, config?: RequestConfig) => Promise<unknown>;
  patch: (
    url: string,
    data?: unknown,
    config?: RequestConfig
  ) => Promise<unknown>;
  head: (url: string, config?: RequestConfig) => Promise<unknown>;
  options: (url: string, config?: RequestConfig) => Promise<unknown>;
  all: <T>(promises: Promise<T>[]) => Promise<T[]>;
  race: <T>(promises: Promise<T>[]) => Promise<T>;
}

export interface DataTypeConfig {
  'Content-Type'?: string;
  type?: string;
  format: (params: unknown) => unknown;
}

export interface DataTypeMap {
  [key: string]: DataTypeConfig;
}

export interface FormatDataResult {
  type: string;
  data: unknown;
}

export interface ProgressEvent {
  loaded: number;
  total: number;
  lengthComputable: boolean;
  percentage: number;
}

export interface UploadProgressConfig {
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

export interface DownloadProgressConfig {
  onDownloadProgress?: (progressEvent: ProgressEvent) => void;
}

export interface AxiosLikeRequestConfig extends RequestConfig {
  url?: string;
  data?: unknown;
  params?: Record<string, unknown>;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
  validateStatus?: (status: number) => boolean;
  transformRequest?: ((data: unknown) => unknown)[];
  transformResponse?: ((data: unknown) => unknown)[];
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  onDownloadProgress?: (progressEvent: ProgressEvent) => void;
}

export interface AxiosLikeResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosLikeRequestConfig;
}

// 响应拦截器类型
export type ResponseInterceptor<T = unknown> = (
  response: AxiosLikeResponse<T>
) => AxiosLikeResponse<T> | Promise<AxiosLikeResponse<T>>;

// 请求拦截器类型
export type RequestInterceptor = (
  config: AxiosLikeRequestConfig
) => AxiosLikeRequestConfig | Promise<AxiosLikeRequestConfig>;

// 错误处理类型
export type ErrorHandler = (error: unknown) => void;

// 状态码验证函数类型
export type StatusValidator = (status: number) => boolean;

// 数据转换函数类型
export type DataTransformer = (data: unknown) => unknown;

// HTTP 方法类型
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

// 响应类型
export type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer';

// 内容类型
export type ContentType =
  | 'json'
  | 'form-urlencoded'
  | 'form-data'
  | 'html'
  | 'xml';

// 凭据类型
export type CredentialsType = 'omit' | 'same-origin' | 'include';

// 请求配置的泛型版本
export interface TypedRequestConfig<TRequest = unknown>
  extends Omit<AxiosLikeRequestConfig, 'data'> {
  data?: TRequest;
}

// 类型安全的便捷方法接口
export interface TypeSafeHttpMethods {
  get<TResponse = unknown>(
    url: string,
    config?: AxiosLikeRequestConfig
  ): Promise<AxiosLikeResponse<TResponse>>;

  post<TResponse = unknown, TRequest = unknown>(
    url: string,
    data?: TRequest,
    config?: TypedRequestConfig<TRequest>
  ): Promise<AxiosLikeResponse<TResponse>>;

  put<TResponse = unknown, TRequest = unknown>(
    url: string,
    data?: TRequest,
    config?: TypedRequestConfig<TRequest>
  ): Promise<AxiosLikeResponse<TResponse>>;

  delete<TResponse = unknown>(
    url: string,
    config?: AxiosLikeRequestConfig
  ): Promise<AxiosLikeResponse<TResponse>>;

  patch<TResponse = unknown, TRequest = unknown>(
    url: string,
    data?: TRequest,
    config?: TypedRequestConfig<TRequest>
  ): Promise<AxiosLikeResponse<TResponse>>;

  head<TResponse = unknown>(
    url: string,
    config?: AxiosLikeRequestConfig
  ): Promise<AxiosLikeResponse<TResponse>>;

  options<TResponse = unknown>(
    url: string,
    config?: AxiosLikeRequestConfig
  ): Promise<AxiosLikeResponse<TResponse>>;
}

// API 定义类型
export interface ApiDefinition {
  [key: string]: {
    url: string;
    method: HttpMethod;
    requestType?: string;
    responseType?: string;
  };
}

// 类型安全的 API 客户端
export type TypedApiClient<TApiDef extends ApiDefinition> = {
  [K in keyof TApiDef]: TApiDef[K]['method'] extends 'GET' | 'HEAD' | 'OPTIONS'
    ? (config?: AxiosLikeRequestConfig) => Promise<AxiosLikeResponse<unknown>>
    : (
        data?: unknown,
        config?: AxiosLikeRequestConfig
      ) => Promise<AxiosLikeResponse<unknown>>;
};

// 错误类型定义
export interface HttpError extends Error {
  status?: number;
  statusText?: string;
  response?: AxiosLikeResponse;
  config?: AxiosLikeRequestConfig;
  code?: string;
}

// 重试配置
export interface RetryConfig {
  retries: number;
  retryDelay: number | ((attempt: number) => number);
  retryCondition: (error: HttpError) => boolean;
  onRetry?: (attempt: number, error: HttpError) => void;
}

// 缓存配置
export interface CacheConfig {
  maxAge: number; // 缓存时间（毫秒）
  key?: string | ((config: AxiosLikeRequestConfig) => string);
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  ignoreParams?: string[]; // 忽略的查询参数
}

// 速率限制配置
export interface RateLimitConfig {
  maxRequests: number;
  perWindow: number; // 时间窗口（毫秒）
  queueSize?: number;
  onRateLimit?: (delayMs: number) => void;
}
