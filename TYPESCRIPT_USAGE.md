# TypeScript 使用指南

an-fetch 提供了完整的 TypeScript 支持，让你在开发过程中享受强类型带来的安全性和便利性。

## 🎯 核心类型

### 请求配置类型

```typescript
import { AxiosLikeRequestConfig } from 'an-fetch';

const config: AxiosLikeRequestConfig = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  validateStatus: (status) => status < 500,
  transformRequest: [(data) => JSON.stringify(data)],
  transformResponse: [(data) => JSON.parse(data)],
  onUploadProgress: (event) => console.log(event.percentage),
  onDownloadProgress: (event) => console.log(event.percentage)
};
```

### 响应类型

```typescript
import { AxiosLikeResponse } from 'an-fetch';

interface User {
  id: number;
  name: string;
  email: string;
}

// 类型安全的响应
const response: AxiosLikeResponse<User> = await get<User>('/api/user/1');

// 响应对象包含以下属性
console.log(response.data);      // User 类型
console.log(response.status);    // number
console.log(response.statusText); // string
console.log(response.headers);   // Record<string, string>
console.log(response.config);    // AxiosLikeRequestConfig
```

### 进度事件类型

```typescript
import { ProgressEvent } from 'an-fetch';

const handleProgress = (event: ProgressEvent) => {
  console.log(`进度: ${event.percentage}%`);
  console.log(`已传输: ${event.loaded} / ${event.total} bytes`);
  console.log(`可计算长度: ${event.lengthComputable}`);
};
```

## 🔧 泛型支持

### 基础泛型用法

```typescript
import { get, post, put, del } from 'an-fetch';

// 定义接口
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

// GET 请求 - 指定响应类型
const user = await get<User>('/api/users/1');
// user.data 的类型是 User

// POST 请求 - 指定请求和响应类型
const newUser = await post<User, CreateUserRequest>(
  '/api/users',
  { name: 'John', email: 'john@example.com' }
);
// newUser.data 的类型是 User

// PUT 请求
const updatedUser = await put<User, Partial<User>>(
  '/api/users/1',
  { name: 'Jane' }
);

// DELETE 请求
const result = await del<{ success: boolean }>('/api/users/1');
```

### 高级泛型用法

```typescript
// 分页响应类型
interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// 使用泛型接口
const users = await get<PaginatedResponse<User>>('/api/users?page=1');
console.log(users.data.items);      // User[]
console.log(users.data.pagination); // 分页信息

// API 响应包装类型
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

const apiResponse = await get<ApiResponse<User>>('/api/users/1');
if (apiResponse.data.success) {
  console.log(apiResponse.data.data); // User 类型
}
```

## 🛠 类型安全的 API 客户端

### 定义 API 接口

```typescript
import { AxiosLikeRequestConfig, AxiosLikeResponse } from 'an-fetch';

// 定义 API 方法类型
interface UserApi {
  getUser(id: number): Promise<AxiosLikeResponse<User>>;
  createUser(data: CreateUserRequest): Promise<AxiosLikeResponse<User>>;
  updateUser(id: number, data: Partial<User>): Promise<AxiosLikeResponse<User>>;
  deleteUser(id: number): Promise<AxiosLikeResponse<{ success: boolean }>>;
  getUserList(page?: number, pageSize?: number): Promise<AxiosLikeResponse<PaginatedResponse<User>>>;
}

// 实现 API 客户端
class TypeSafeUserApi implements UserApi {
  private baseURL = 'https://api.example.com';

  async getUser(id: number): Promise<AxiosLikeResponse<User>> {
    return get<User>(`${this.baseURL}/users/${id}`);
  }

  async createUser(data: CreateUserRequest): Promise<AxiosLikeResponse<User>> {
    return post<User, CreateUserRequest>(`${this.baseURL}/users`, data);
  }

  async updateUser(id: number, data: Partial<User>): Promise<AxiosLikeResponse<User>> {
    return put<User, Partial<User>>(`${this.baseURL}/users/${id}`, data);
  }

  async deleteUser(id: number): Promise<AxiosLikeResponse<{ success: boolean }>> {
    return del<{ success: boolean }>(`${this.baseURL}/users/${id}`);
  }

  async getUserList(
    page = 1, 
    pageSize = 10
  ): Promise<AxiosLikeResponse<PaginatedResponse<User>>> {
    return get<PaginatedResponse<User>>(`${this.baseURL}/users`, {
      params: { page, page_size: pageSize }
    });
  }
}

// 使用类型安全的 API 客户端
const userApi = new TypeSafeUserApi();

async function example() {
  // 所有方法都有完整的类型推断
  const user = await userApi.getUser(1);
  console.log(user.data.name); // TypeScript 知道这是 string

  const newUser = await userApi.createUser({
    name: 'John Doe',
    email: 'john@example.com'
  });

  const users = await userApi.getUserList(1, 20);
  console.log(users.data.items[0].email); // 类型安全
}
```

## 🔄 转换器类型

### 数据转换器类型

```typescript
import { DataTransformer } from 'an-fetch';

// 自定义转换器
const customTransformer: DataTransformer = (data: unknown) => {
  // 转换逻辑
  return data;
};

// 类型安全的转换器
const typedTransformer = <T, R>(transformFn: (data: T) => R): DataTransformer => {
  return (data: unknown) => {
    return transformFn(data as T);
  };
};

// 使用类型安全的转换器
interface RawUser {
  user_name: string;
  user_email: string;
  is_active: string; // \"true\" 或 \"false\"
}

interface TransformedUser {
  userName: string;
  userEmail: string;
  isActive: boolean;
}

const userTransformer = typedTransformer<RawUser, TransformedUser>((raw) => ({
  userName: raw.user_name,
  userEmail: raw.user_email,
  isActive: raw.is_active === 'true'
}));
```

### 拦截器类型

```typescript
import { RequestInterceptor, ResponseInterceptor } from 'an-fetch';

// 请求拦截器
const authInterceptor: RequestInterceptor = async (config) => {
  const token = await getAuthToken();
  config.headers = config.headers || {};
  config.headers['Authorization'] = `Bearer ${token}`;
  return config;
};

// 响应拦截器
const responseInterceptor: ResponseInterceptor<ApiResponse<unknown>> = async (response) => {
  if (!response.data.success) {
    throw new Error(response.data.message || 'API Error');
  }
  return response;
};
```

## ⚠️ 错误处理类型

### HTTP 错误类型

```typescript
import { HttpError, ErrorClassifier } from 'an-fetch';

try {
  const response = await get('/api/data');
} catch (error) {
  if (error instanceof Error) {
    const httpError = error as HttpError;
    
    // 类型安全的错误处理
    if (httpError.status) {
      console.log('状态码:', httpError.status);
      console.log('状态文本:', httpError.statusText);
      console.log('响应数据:', httpError.response?.data);
      console.log('请求配置:', httpError.config);
    }
    
    // 错误分类
    if (ErrorClassifier.isNetworkError(error)) {
      console.log('网络错误');
    } else if (ErrorClassifier.isTimeoutError(error)) {
      console.log('超时错误');
    } else if (ErrorClassifier.isAuthError(httpError)) {
      console.log('认证错误');
    }
  }
}
```

### 自定义错误处理器

```typescript
import { ErrorHandler, ErrorReporter } from 'an-fetch';

// 类型安全的错误处理器
const customErrorHandler: ErrorHandler = (error: unknown) => {
  if (error instanceof Error) {
    const httpError = error as HttpError;
    
    // 发送到监控系统
    sendToMonitoring({
      message: httpError.message,
      status: httpError.status,
      url: httpError.config?.url,
      timestamp: new Date().toISOString()
    });
  }
};

// 注册错误处理器
ErrorReporter.addErrorHandler(customErrorHandler);
```

## 🎨 实用类型工具

### 条件类型

```typescript
// 根据 HTTP 方法确定是否需要 data 参数
type RequiresData<M extends string> = M extends 'GET' | 'HEAD' | 'DELETE' | 'OPTIONS'
  ? never
  : unknown;

// 类型安全的请求函数
function typedRequest<M extends string, T = unknown>(
  method: M,
  url: string,
  ...args: RequiresData<M> extends never ? [] : [data: unknown]
): Promise<AxiosLikeResponse<T>> {
  // 实现
  return {} as any;
}

// 使用
const getResponse = typedRequest('GET', '/api/users'); // 不需要 data 参数
const postResponse = typedRequest('POST', '/api/users', { name: 'John' }); // 需要 data 参数
```

### 类型守卫

```typescript
// API 响应类型守卫
function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    'data' in data
  );
}

// 分页响应类型守卫
function isPaginatedResponse<T>(data: unknown): data is PaginatedResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    'pagination' in data &&
    Array.isArray((data as any).items)
  );
}

// 使用类型守卫
const response = await get('/api/users');
if (isApiResponse<User[]>(response.data)) {
  console.log(response.data.data); // 类型安全
}
```

## 🔧 配置类型扩展

### 扩展请求配置

```typescript
// 扩展请求配置以支持自定义字段
interface ExtendedRequestConfig extends AxiosLikeRequestConfig {
  customAuth?: boolean;
  retryStrategy?: 'exponential' | 'linear';
  cacheKey?: string;
}

// 使用扩展配置
const extendedGet = <T>(url: string, config?: ExtendedRequestConfig) => {
  // 处理自定义字段
  const { customAuth, retryStrategy, cacheKey, ...restConfig } = config || {};
  
  // 实现自定义逻辑
  if (customAuth) {
    // 添加自定义认证逻辑
  }
  
  return get<T>(url, restConfig);
};
```

### 环境特定类型

```typescript
// 开发环境和生产环境的不同配置
interface DevelopmentConfig {
  apiUrl: 'http://localhost:3000';
  debug: true;
}

interface ProductionConfig {
  apiUrl: 'https://api.production.com';
  debug: false;
}

type EnvironmentConfig = DevelopmentConfig | ProductionConfig;

// 环境特定的 API 客户端
class EnvironmentAwareApi<T extends EnvironmentConfig> {
  constructor(private config: T) {}

  async makeRequest<R>(endpoint: string): Promise<AxiosLikeResponse<R>> {
    if (this.config.debug) {
      console.log(`Making request to: ${this.config.apiUrl}${endpoint}`);
    }
    
    return get<R>(`${this.config.apiUrl}${endpoint}`);
  }
}
```

## 📚 最佳实践

### 1. 使用接口而不是类型别名

```typescript
// ✅ 推荐：使用接口
interface User {
  id: number;
  name: string;
  email: string;
}

// ❌ 不推荐：使用类型别名（除非必要）
type User = {
  id: number;
  name: string;
  email: string;
};
```

### 2. 使用严格的类型检查

```typescript
// tsconfig.json
{
  \"compilerOptions\": {
    \"strict\": true,
    \"noImplicitAny\": true,
    \"strictNullChecks\": true,
    \"strictFunctionTypes\": true
  }
}
```

### 3. 为异步操作使用 Promise 类型

```typescript
// ✅ 明确的 Promise 类型
const fetchUser = async (id: number): Promise<User> => {
  const response = await get<User>(`/api/users/${id}`);
  return response.data;
};

// ✅ 错误处理的类型安全
const fetchUserSafely = async (id: number): Promise<User | null> => {
  try {
    const response = await get<User>(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};
```

### 4. 使用泛型约束

```typescript
// 约束泛型参数
interface Identifiable {
  id: number;
}

const updateEntity = async <T extends Identifiable>(
  entity: T,
  updates: Partial<Omit<T, 'id'>>
): Promise<AxiosLikeResponse<T>> => {
  return put<T>(`/api/entities/${entity.id}`, updates);
};
```

### 5. 使用联合类型进行状态管理

```typescript
// API 状态类型
type ApiState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// 使用
const [userState, setUserState] = useState<ApiState<User>>({ status: 'idle' });

const fetchUser = async (id: number) => {
  setUserState({ status: 'loading' });
  
  try {
    const response = await get<User>(`/api/users/${id}`);
    setUserState({ status: 'success', data: response.data });
  } catch (error) {
    setUserState({ status: 'error', error: error.message });
  }
};
```

## 🔍 调试技巧

### 1. 使用类型断言进行调试

```typescript
// 临时类型断言（仅用于调试）
const response = await get('/api/unknown-endpoint');
console.log((response.data as any).someProperty);

// 更好的方式：使用类型守卫
function hasProperty<T extends object, K extends string>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return prop in obj;
}

if (hasProperty(response.data, 'someProperty')) {
  console.log(response.data.someProperty); // 类型安全
}
```

### 2. 使用 TypeScript 的满意度运算符

```typescript
// 检查必需属性的存在
const user = response.data;
user.id!; // 断言 id 存在（小心使用）

// 更好的方式：使用可选链
user?.id;
user?.profile?.avatar;
```

通过遵循这些 TypeScript 最佳实践，你可以充分利用 an-fetch 的类型安全特性，编写更可靠、更易维护的代码。