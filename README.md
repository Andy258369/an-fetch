# an-fetch

一个基于原生 fetch 封装的强大请求库，具备完整的 TypeScript 支持，满足企业级应用的各种场景。

## 🚀 特性

### 🎯 核心功能
- ✅ **便捷方法**：提供类似 axios 的 `get`、`post`、`put`、`delete` 等便捷方法
- ✅ **并发请求**：支持 `all()` 和 `race()` 方法进行并发处理
- ✅ **进度监控**：支持上传和下载进度监控
- ✅ **TypeScript**：完整的类型安全支持
- ✅ **拦截器系统**：支持请求和响应拦截器
- ✅ **数据转换**：强大的请求/响应数据转换器
- ✅ **错误处理**：完善的错误分类和处理机制

### 🛠 高级功能
- ✅ **重试机制**：自动重试失败的请求
- ✅ **超时控制**：灵活的超时配置
- ✅ **请求去重**：自动取消重复请求
- ✅ **状态码验证**：自定义状态码验证规则
- ✅ **多种数据格式**：支持 JSON、FormData、URLEncoded 等
- ✅ **响应类型**：支持 JSON、Text、Blob、ArrayBuffer

## 📦 安装

```
npm install an-fetch
# 或
yarn add an-fetch
```

## 🏃 快速开始

### 基础使用

```
import { get, post, put, delete as del } from 'an-fetch';

// GET 请求
const user = await get('/api/user/1');
console.log(user.data);

// POST 请求
const newUser = await post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT 请求
const updatedUser = await put('/api/users/1', {
  name: 'Jane Doe'
});

// DELETE 请求
await del('/api/users/1');
```

### 类型安全

```
interface User {
  id: number;
  name: string;
  email: string;
}

// 类型安全的请求
const response = await get<User>('/api/user/1');
// response.data 的类型是 User

// 类型安全的 POST 请求
const createResponse = await post<User, Omit<User, 'id'>>(
  '/api/users',
  { name: 'John', email: 'john@example.com' }
);

```

## 🔧 高级配置

### 全局配置

```
import service from 'an-fetch';

const api = service({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retry: true,
  retryCount: 3,
  retryInterval: 1000,
  credentials: 'include',
  headers: {
    'Authorization': 'Bearer your-token'
  }
}, {
  getUsers: {
    path: 'users',
    method: 'GET'
  },
  createUser: {
    path: 'users',
    method: 'POST',
    dataType: 'json'
  }
});

// 使用配置好的 API
const users = await api.getUsers().send();
const newUser = await api.createUser().send({
  body: { name: 'John', email: 'john@example.com' }
});

```

### 拦截器

```
import service from 'an-fetch';

// 请求拦截器
service.interceptors.request.use(async (config) => {
  config.headers = config.headers || {};
  config.headers['Authorization'] = 'Bearer ' + getToken();
  return config;
});

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 处理成功响应
    return response.json();
  },
  (error) => {
    // 处理错误响应
    console.error('请求失败:', error);
    return Promise.reject(error);
  }
);

```

## 🔄 并发请求

```
import { get, post, all, race } from 'an-fetch';

// 并行执行多个请求
const [users, posts, comments] = await all([
  get('/api/users'),
  get('/api/posts'),
  get('/api/comments')
]);

// 竞速请求（返回最快的响应）
const fastestResponse = await race([
  get('/api/server1/data'),
  get('/api/server2/data'),
  get('/api/server3/data')
]);

```

## 📊 进度监控

### 上传进度

```
import { post } from 'an-fetch';

const formData = new FormData();
formData.append('file', file);

const response = await post('/api/upload', formData, {
  onUploadProgress: (progressEvent) => {
    const percent = progressEvent.percentage;
    console.log(`上传进度: ${percent}%`);
    // 更新 UI 进度条
    updateProgressBar(percent);
  }
});

```

### 下载进度

```
import { get } from 'an-fetch';

const response = await get('/api/download/large-file', {
  responseType: 'blob',
  onDownloadProgress: (progressEvent) => {
    const percent = progressEvent.percentage;
    console.log(`下载进度: ${percent}%`);
    updateProgressBar(percent);
  }
});

// 创建下载链接
const url = URL.createObjectURL(response.data as Blob);
const a = document.createElement('a');
a.href = url;
a.download = 'downloaded-file.zip';
a.click();

```

## 🔄 数据转换

### 请求数据转换

```
import { post, RequestTransformers } from 'an-fetch';

const response = await post('/api/users', {
  userName: 'john_doe',
  userEmail: 'john@example.com',
  emptyField: '',
  nullField: null
}, {
  transformRequest: [
    RequestTransformers.removeEmpty,    // 移除空值
    RequestTransformers.camelToSnake,   // 驼峰转下划线
  ]
});

```

### 响应数据转换

```
import { get, ResponseTransformers } from 'an-fetch';

const response = await get('/api/user/1', {
  transformResponse: [
    ResponseTransformers.snakeToCamel,           // 下划线转驼峰
    ResponseTransformers.parseDate(['created_at']), // 解析日期
    ResponseTransformers.parseBooleans(['is_active']) // 解析布尔值
  ]
});

```

### 预设转换器

```
import { post, PresetTransformers } from 'an-fetch';

// 使用预设的标准 API 响应转换器
const response = await post('/api/data', requestData, {
  transformRequest: [PresetTransformers.prepareJsonRequest],
  transformResponse: [PresetTransformers.standardizeApiResponse]
});

```

## ❌ 错误处理

### 状态码检查

```
import { get, HTTP_STATUS, isClientError, isServerError } from 'an-fetch';

try {
  const response = await get('/api/data');
} catch (error: any) {
  if (error.status === HTTP_STATUS.NOT_FOUND) {
    console.log('资源不存在');
  } else if (isClientError(error.status)) {
    console.log('客户端错误');
  } else if (isServerError(error.status)) {
    console.log('服务器错误');
  }
}

```

### 错误分类

```
import { ErrorClassifier, ErrorReporter } from 'an-fetch';

// 添加全局错误处理器
ErrorReporter.addErrorHandler((error) => {
  if (ErrorClassifier.isNetworkError(error)) {
    showMessage('网络连接失败，请检查网络');
  } else if (ErrorClassifier.isTimeoutError(error)) {
    showMessage('请求超时，请稍后重试');
  } else if (ErrorClassifier.isAuthError(error)) {
    redirectToLogin();
  }
});

```

### 自定义状态码验证

```
import { get } from 'an-fetch';

// 自定义验证器：接受 200-299 和 400-499
const response = await get('/api/data', {
  validateStatus: (status) => {
    return (status >= 200 && status < 300) || (status >= 400 && status < 500);
  }
});

```

## 🎛 配置选项

### 全局配置

```
interface GlobalConfig {
  baseURL?: string;                    // 基础 URL
  timeout?: number;                    // 超时时间（毫秒）
  timeoutRetry?: boolean;              // 超时重试
  timeoutRetryCount?: number;          // 超时重试次数
  retry?: boolean;                     // 重试
  retryCount?: number;                 // 重试次数
  retryInterval?: number;              // 重试间隔（毫秒）
  cancelRepeatedRequests?: boolean;    // 取消重复请求
  credentials?: 'omit' | 'same-origin' | 'include'; // 凭据策略
}

```

### 请求配置

```
interface RequestConfig {
  url?: string;                        // 请求 URL
  method?: string;                     // HTTP 方法
  headers?: Record<string, string>;    // 请求头
  data?: unknown;                      // 请求数据
  params?: Record<string, unknown>;    // 查询参数
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer'; // 响应类型
  validateStatus?: (status: number) => boolean; // 状态码验证
  transformRequest?: DataTransformer[];  // 请求转换器
  transformResponse?: DataTransformer[]; // 响应转换器
  onUploadProgress?: (event: ProgressEvent) => void;   // 上传进度
  onDownloadProgress?: (event: ProgressEvent) => void; // 下载进度
}

```


## 📚 更多示例

### 文件上传

```
import { post } from 'an-fetch';

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', '文件描述');

  return await post('/api/upload', formData, {
    headers: {
      // 不要设置 Content-Type，让浏览器自动设置
    },
    onUploadProgress: (event) => {
      console.log(`上传进度: ${event.percentage}%`);
    }
  });

};

```

### 分页数据

```
import { get, ResponseTransformers } from 'an-fetch';

const fetchPaginatedData = async (page: number, pageSize: number) => {
  return await get('/api/users', {
    params: { page, page_size: pageSize },
    transformResponse: [
      ResponseTransformers.extractPagination,
      ResponseTransformers.snakeToCamel
    ]
  });

};

```

### 条件请求

```
import { get, all } from 'an-fetch';

const fetchUserDetails = async (userId: number) => {
  // 首先获取用户基本信息
  const user = await get(`/api/users/${userId}`);
  
  // 根据用户信息获取相关数据
  const [posts, albums, todos] = await all([
    get(`/api/users/${userId}/posts`),
    get(`/api/users/${userId}/albums`),
    get(`/api/users/${userId}/todos`)
  ]);
  
  return {
    user: user.data,
    posts: posts.data,
    albums: albums.data,
    todos: todos.data
  };

};

```

### 批量请求

```
import { get, all } from 'an-fetch';

const batchFetchUsers = async (userIds: number[]) => {
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    const requests = batch.map(id => get(`/api/users/${id}`));
    const batchResults = await all(requests);
    results.push(...batchResults.map(r => r.data));
    
    // 批次间延迟，避免服务器过载
    if (i + batchSize < userIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;

};

```


## 🔗 与 axios 的对比

| 功能 | an-fetch | axios |
|------|----------|-------|
| 基于 | 原生 fetch | XMLHttpRequest |
| 包大小 | 更小 | 较大 |
| TypeScript | 完整支持 | 支持 |
| 拦截器 | ✅ | ✅ |
| 请求/响应转换 | ✅ | ✅ |
| 进度监控 | ✅ | ✅ |
| 并发请求 | ✅ | ✅ |
| 错误处理 | 增强 | 基础 |
| 浏览器兼容性 | 现代浏览器 | 更广泛 |

## 🌐 浏览器兼容性

- Chrome 42+
- Firefox 39+
- Safari 10+
- Edge 14+
- Node.js 18+ (使用 node-fetch 或类似的 polyfill)

## 📄 许可证

ISC

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📖 更多文档

- [**📋 完整 API 参考文档**](./API_REFERENCE.md) - 详细的API说明和表格展示
- [完整 API 文档](./docs/api.md)
- [使用示例](./examples/)
- [TypeScript 类型定义](./src/types.ts)
- [TypeScript 使用指南](./TYPESCRIPT_USAGE.md)
- [CI/CD 设置指南](./CI_CD_SETUP.md)
- [GitHub Secrets 详细设置](./SETUP_SECRETS_GUIDE.md)
- [贡献指南](./CONTRIBUTING.md)
- [更新日志](./CHANGELOG.md)

---
```

```

```
