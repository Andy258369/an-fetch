import service, { GlobalConfig, ApiConfig } from '../src/index';

// 定义API配置
const apiConfig: Record<string, ApiConfig> = {
  getUser: {
    path: 'user',
    method: 'GET',
    dataType: 'json',
  },
  createUser: {
    path: 'user',
    method: 'POST',
    dataType: 'json',
  },
};

// 全局配置
const globalConfig: GlobalConfig = {
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  retry: true,
  retryCount: 2,
  retryInterval: 1000,
  cancelRepeatedRequests: true,
};

// 创建服务实例
const api = service(globalConfig, apiConfig);

// 添加响应拦截器
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

// 使用示例
async function demo() {
  try {
    // GET请求示例
    const { send: getUser } = api.getUser({
      query: { id: 1 },
    });

    const user = await getUser();
    console.log('User data:', user);

    // POST请求示例
    const { send: createUser } = api.createUser({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    });

    const newUser = await createUser();
    console.log('Created user:', newUser);

  } catch (error) {
    console.error('Demo error:', error);
  }
}

// 运行示例
demo(); 