# TypeScript 使用指南

## 概述

an-fetch 提供了完整的 TypeScript 支持，包括类型定义、智能提示和编译时类型检查。

## 安装

```bash
npm install an-fetch
```

## 基本使用

### 1. 导入和类型定义

```typescript
import service, { 
  GlobalConfig, 
  ApiConfig, 
  RequestConfig, 
  ServiceResult,
  Interceptors 
} from 'an-fetch';
```

### 2. 定义配置

```typescript
// 全局配置
const globalConfig: GlobalConfig = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retry: true,
  retryCount: 3,
  retryInterval: 1000,
  cancelRepeatedRequests: true,
  credentials: 'include',
};

// API配置
const apiConfig: Record<string, ApiConfig> = {
  login: {
    path: 'login',
    method: 'POST',
    dataType: 'json',
    query: {
      version: 'v1',
    },
  },
  getUser: {
    path: 'user',
    method: 'GET',
    dataType: 'json',
  },
  uploadFile: {
    path: 'upload',
    method: 'POST',
    dataType: 'form-data',
  },
};
```

### 3. 创建服务实例

```typescript
const api: ServiceResult = service(globalConfig, apiConfig);
```

### 4. 使用API方法

```typescript
// 登录请求
const { send: loginSend, abort: loginAbort } = api.login({
  body: {
    username: 'testuser',
    password: '123456',
  },
  headers: {
    Authorization: 'Bearer token',
  },
  timeout: 5000,
  retry: true,
  retryCount: 2,
});

// 发送请求
loginSend().then((result) => {
  console.log('Login success:', result);
}).catch((error) => {
  console.error('Login failed:', error);
});

// 中止请求
// loginAbort();
```

## 拦截器使用

### 请求拦截器

```typescript
// 添加认证token
service.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};
  config.headers['Authorization'] = 'Bearer your-token-here';
  return config;
});
```

### 响应拦截器

```typescript
// 处理响应
service.interceptors.response.use(
  (response) => {
    console.log('Response status:', response.status);
    return response.json();
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);
```

## 类型安全特性

### 1. 配置类型检查

```typescript
// ✅ 正确的配置
const config: GlobalConfig = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  credentials: 'include', // 只能是 'omit' | 'same-origin' | 'include'
};

// ❌ 错误的配置（TypeScript会报错）
const wrongConfig: GlobalConfig = {
  baseURL: 'https://api.example.com',
  timeout: '10000', // 错误：应该是number类型
  credentials: 'invalid', // 错误：不是有效的credentials值
};
```

### 2. API配置类型检查

```typescript
// ✅ 正确的API配置
const apiConfig: Record<string, ApiConfig> = {
  login: {
    path: 'login',
    method: 'POST',
    dataType: 'json', // 只能是预定义的数据类型
  },
};

// ❌ 错误的API配置
const wrongApiConfig: Record<string, ApiConfig> = {
  login: {
    path: 'login',
    method: 'INVALID', // 错误：不是有效的HTTP方法
    dataType: 'invalid', // 错误：不是有效的数据类型
  },
};
```

### 3. 请求配置类型检查

```typescript
// ✅ 正确的请求配置
const requestConfig: RequestConfig = {
  body: {
    username: 'testuser',
    password: '123456',
  },
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
};

// ❌ 错误的请求配置
const wrongRequestConfig: RequestConfig = {
  body: 'invalid', // 错误：body应该是对象或FormData
  headers: 'invalid', // 错误：headers应该是对象
  timeout: '5000', // 错误：timeout应该是number
};
```

## 高级用法

### 1. 泛型类型支持

```typescript
// 定义响应数据类型
interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

// 使用类型断言
const { send: loginSend } = api.login({
  body: {
    username: 'testuser',
    password: '123456',
  },
});

loginSend().then((result) => {
  const loginData = result as LoginResponse;
  console.log('Token:', loginData.token);
  console.log('User:', loginData.user);
});
```

### 2. 自定义拦截器类型

```typescript
// 定义自定义响应类型
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 自定义响应拦截器
service.interceptors.response.use(
  (response) => {
    return response.json().then((data: ApiResponse) => {
      if (data.code === 200) {
        return data.data;
      } else {
        throw new Error(data.message);
      }
    });
  },
  (error) => {
    console.error('Request failed:', error);
    return Promise.reject(error);
  }
);
```

### 3. 条件类型使用

```typescript
// 根据API配置动态创建类型
type ApiMethods<T extends Record<string, ApiConfig>> = {
  [K in keyof T]: (config?: RequestConfig) => RequestResult;
};

const apiConfig = {
  login: { path: 'login', method: 'POST' },
  getUser: { path: 'user', method: 'GET' },
} as const;

const api = service(globalConfig, apiConfig);
// 现在api的类型是 ApiMethods<typeof apiConfig>
```

## IDE 智能提示

### 1. 自动补全

在支持TypeScript的IDE中（如VS Code），你会获得：

- 配置属性的自动补全
- 方法名的自动补全
- 参数类型的自动提示
- 错误信息的实时显示

### 2. 类型检查

TypeScript编译器会在编译时检查：

- 配置对象的类型正确性
- 方法调用的参数类型
- 返回值的使用方式
- 拦截器的回调函数签名

## 常见问题

### 1. 类型错误处理

```typescript
// 如果遇到类型错误，可以这样处理
const { send } = api.login({
  body: {
    username: 'testuser',
    password: '123456',
  } as any, // 临时使用any类型（不推荐）
});
```

### 2. 动态API配置

```typescript
// 对于动态API配置，可以使用类型断言
const dynamicApiConfig = {
  [apiName]: {
    path: apiPath,
    method: apiMethod,
  },
} as Record<string, ApiConfig>;

const api = service(globalConfig, dynamicApiConfig);
```

### 3. 自定义类型扩展

```typescript
// 扩展全局配置类型
interface ExtendedGlobalConfig extends GlobalConfig {
  customOption?: string;
}

// 扩展API配置类型
interface ExtendedApiConfig extends ApiConfig {
  customField?: number;
}
```

## 最佳实践

1. **始终使用类型注解**：为配置对象和方法参数添加类型注解
2. **利用IDE功能**：使用自动补全和类型检查功能
3. **避免使用any**：尽量使用具体的类型而不是any
4. **使用接口定义**：为复杂的数据结构定义接口
5. **利用泛型**：使用泛型来提高代码的复用性

## 总结

an-fetch 的 TypeScript 支持提供了：

- ✅ 完整的类型安全
- ✅ 智能的IDE提示
- ✅ 编译时错误检查
- ✅ 良好的开发体验
- ✅ 详细的类型文档

这使得在使用该库时能够获得最佳的开发体验和代码质量保证。 