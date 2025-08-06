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
