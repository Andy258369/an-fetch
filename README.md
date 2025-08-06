# an-fetch

一个基于原生fetch封装的请求库，满足大多数业务场景，支持TypeScript。

## 特性

- ✅ 超时取消、超时重发、超时重试次数
- ✅ 失败重试、重试次数、重试间隔时间
- ✅ 同一时间多次相同的请求自动取消上一次请求（减少服务器压力）
- ✅ 请求拦截器和响应拦截器
- ✅ 同一接口同时请求多次都出现错误在一定时间内只提示最后一次错误（不能满屏飘红，用户体验）
- ✅ 完整的TypeScript支持
- ✅ 多种数据格式支持（JSON、Form Data、URL Encoded等）

## 安装

```bash
npm install an-fetch
```

## 使用方法

### 基本使用

```typescript
import service, { GlobalConfig, ApiConfig } from 'an-fetch';

// 定义API配置
const apiConfig: Record<string, ApiConfig> = {
  login: {
    path: 'login',
    method: 'POST',
    query: {
      loginType: 'admin',
    },
  },
  getUserInfo: {
    path: 'user/info',
    method: 'GET',
    dataType: 'json',
  },
};

// 全局配置
const globalConfig: GlobalConfig = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  timeoutRetry: true,
  timeoutRetryCount: 2,
  retry: true,
  retryCount: 3,
  retryInterval: 1000,
  cancelRepeatedRequests: true,
  credentials: 'include',
};

// 创建服务实例
const api = service(globalConfig, apiConfig);

// 使用API
const { send, abort } = api.login({
  body: {
    username: 'testuser',
    password: '123456',
  },
});

// 发送请求
send().then(result => {
  console.log('登录成功:', result);
}).catch(error => {
  console.error('登录失败:', error);
});

// 取消请求
abort();
```

### 拦截器使用

```typescript
// 请求拦截器
api.interceptors.request.use(async (config) => {
  // 添加认证token
  config.headers = config.headers || {};
  config.headers['Authorization'] = 'Bearer your-token-here';
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 处理成功响应
    if (response.status !== 200) {
      console.log('接口异常');
    }
    return response.json();
  },
  (error) => {
    // 处理错误响应
    console.log('请求错误:', error);
    return Promise.reject(error);
  }
);
```

### 配置选项

#### 全局配置 (GlobalConfig)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| baseURL | string | '' | 基础URL |
| timeout | number | 30000 | 超时时间（毫秒） |
| timeoutRetry | boolean | false | 是否开启超时重试 |
| timeoutRetryCount | number | 0 | 超时重试次数 |
| retry | boolean | false | 是否开启失败重试 |
| retryCount | number | 0 | 失败重试次数 |
| retryInterval | number | 0 | 重试间隔时间（毫秒） |
| cancelRepeatedRequests | boolean | false | 是否自动取消重复请求 |
| credentials | RequestCredentials | 'same-origin' | 携带cookies设置 |

#### API配置 (ApiConfig)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| path | string | - | 请求路径 |
| method | string | 'GET' | 请求方法 |
| query | object | - | 查询参数 |
| body | any | - | 请求体数据 |
| headers | object | - | 请求头 |
| dataType | string | 'json' | 数据类型（json/form-urlencoded/form-data/html/xml） |
| timeout | number | - | 超时时间 |
| timeoutRetry | boolean | - | 是否开启超时重试 |
| timeoutRetryCount | number | - | 超时重试次数 |
| retry | boolean | - | 是否开启失败重试 |
| retryCount | number | - | 失败重试次数 |
| retryInterval | number | - | 重试间隔时间 |
| cancelRepeatedRequests | boolean | - | 是否自动取消重复请求 |
| credentials | RequestCredentials | - | 携带cookies设置 |

### 数据类型支持

- **json**: `application/json;charset=UTF-8`
- **form-urlencoded**: `application/x-www-form-urlencoded;charset=UTF-8`
- **form-data**: `multipart/form-data;charset=UTF-8`
- **html**: `text/html;charset=UTF-8`
- **xml**: `application/xml;charset=UTF-8`

## 开发

### 安装依赖

```bash
npm install
```

### 构建

```bash
# 生产构建
npm run build

# 开发构建
npm run build:dev

# 开发模式（监听文件变化）
npm run dev
```

### 测试

```bash
# 运行测试
npm test

# 类型检查
npm run type-check
```

### 代码格式化

```bash
# 运行ESLint检查
npm run lint

# 自动修复ESLint问题
npm run lint:fix

# 格式化代码
npm run format
```

## TypeScript支持

本项目完全支持TypeScript，提供了完整的类型定义：

- `GlobalConfig`: 全局配置类型
- `ApiConfig`: API配置类型
- `RequestConfig`: 请求配置类型
- `RequestResult`: 请求结果类型
- `ServiceResult`: 服务结果类型
- `ServiceFunction`: 服务函数类型
- `Interceptors`: 拦截器类型

## 许可证

ISC

## 贡献

欢迎提交Issue和Pull Request！
