import service, { GlobalConfig, ApiConfig } from '../src/index';

// 定义API配置
const apiConfig: Record<string, ApiConfig> = {
  login: {
    path: 'login',
    method: 'POST',
    query: {
      loginType: 'admin',
    },
  },
  account: {
    path: 'account',
    query: {
      loginType: 'normal',
    },
    dataType: 'form-urlencoded',
  },
  getUserInfo: {
    path: 'user/info',
    method: 'GET',
    dataType: 'json',
  },
};

// 全局配置
const globalConfig: GlobalConfig = {
  baseURL: 'http://localhost:3000',
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

// 请求拦截器
service.interceptors.request.use(async (config) => {
  // 添加认证token
  config.headers = config.headers || {};
  config.headers['Authorization'] = 'Bearer your-token-here';
  return config;
});

// 响应拦截器
service.interceptors.response.use(
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

// 使用示例
async function example() {
  try {
    // 登录请求
    const { send: loginSend, abort: loginAbort } = api.login({
      body: {
        username: 'testuser',
        password: '123456',
      },
      timeout: 5000,
      retry: true,
      retryCount: 2,
    });

    const loginResult = await loginSend();
    console.log('登录成功:', loginResult);

    // 获取用户信息
    const { send: getUserInfoSend } = api.getUserInfo({
      query: {
        userId: '123',
      },
      headers: {
        'Custom-Header': 'custom-value',
      },
    });

    const userInfo = await getUserInfoSend();
    console.log('用户信息:', userInfo);

    // 账户信息请求
    const { send: accountSend } = api.account({
      body: {
        accountId: '456',
      },
      dataType: 'form-urlencoded',
    });

    const accountInfo = await accountSend();
    console.log('账户信息:', accountInfo);

  } catch (error) {
    console.error('请求失败:', error);
  }
}

// 导出示例函数
export { example, api }; 