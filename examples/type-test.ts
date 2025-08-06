/**
 * 类型提示测试文件
 * 用于验证在TypeScript项目中使用该包时的类型提示功能
 */

import service, {
  GlobalConfig,
  ApiConfig,
  RequestConfig,
  ServiceResult,
  Interceptors,
} from '../src/index';

// 测试全局配置类型提示
const globalConfig: GlobalConfig = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retry: true,
  retryCount: 3,
  retryInterval: 1000,
  cancelRepeatedRequests: true,
  credentials: 'include',
};

// 测试API配置类型提示
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

// 测试服务函数类型提示
const api: ServiceResult = service(globalConfig, apiConfig);

// 测试请求配置类型提示
const requestConfig: RequestConfig = {
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
};

// 测试拦截器类型提示
const interceptors: Interceptors = service.interceptors;

// 测试请求方法类型提示
const { send: loginSend, abort: loginAbort } = api.login(requestConfig);

// 测试发送请求
loginSend()
  .then(result => {
    console.log('Login result:', result);
  })
  .catch(error => {
    console.error('Login error:', error);
  });

// 测试中止请求
// loginAbort();

// 测试拦截器使用
interceptors.request.use(async config => {
  // 这里应该有完整的类型提示
  config.headers = config.headers || {};
  config.headers['X-Custom-Header'] = 'custom-value';
  return config;
});

interceptors.response.use(
  response => {
    // 这里应该有完整的类型提示
    console.log('Response status:', response.status);
    return response.json();
  },
  error => {
    // 这里应该有完整的类型提示
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

// 测试其他API方法
const { send: getUserSend } = api.getUser({
  query: { id: 123 },
});

getUserSend().then(user => {
  console.log('User data:', user);
});

// 测试文件上传
const { send: uploadSend } = api.uploadFile({
  body: {
    file: new File(['test'], 'test.txt'),
    description: 'Test file',
  },
});

uploadSend().then(result => {
  console.log('Upload result:', result);
});

// 导出用于测试
export {
  globalConfig,
  apiConfig,
  api,
  requestConfig,
  interceptors,
  loginSend,
  loginAbort,
  getUserSend,
  uploadSend,
};
