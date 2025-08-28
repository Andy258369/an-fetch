/**
 * an-fetch 完整使用示例
 * 展示所有功能的使用方法
 */

import {
  // 便捷方法
  get,
  post,
  put,
  patch,
  del as delete_,
  all,
  race,
  // 原始服务
  service,
  // 类型定义
  AxiosLikeRequestConfig,
  AxiosLikeResponse,
  ProgressEvent,
  // 错误处理
  HTTP_STATUS,
  ErrorClassifier,
  ErrorReporter,
  createHttpError,
  installDefaultErrorHandlers,
  // 数据转换器
  RequestTransformers,
  ResponseTransformers,
  PresetTransformers,
  // 工具函数
  isSuccess,
  isClientError,
  isServerError,
} from '../src/index';

// ============= 基础使用 =============

// 1. 简单的 GET 请求
async function basicGetExample() {
  try {
    const response = await get('https://jsonplaceholder.typicode.com/users/1');
    console.log('用户信息:', response.data);
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);
  } catch (error) {
    console.error('请求失败:', error);
  }
}

// 2. 带类型的请求
interface User {
  id: number;
  name: string;
  email: string;
  website?: string;
}

async function typedRequestExample() {
  try {
    // TypeScript 会推断出 response.data 的类型是 User
    const response = await get<User>('https://jsonplaceholder.typicode.com/users/1');
    
    // 现在可以安全地访问属性
    console.log(`用户 ${response.data.name} 的邮箱是 ${response.data.email}`);
    
    // 类型安全的 POST 请求
    const newUser: Omit<User, 'id'> = {
      name: 'New User',
      email: 'new@example.com',
      website: 'https://newuser.com',
    };
    
    const createResponse = await post<User, typeof newUser>(
      'https://jsonplaceholder.typicode.com/users',
      newUser
    );
    
    console.log('创建的用户:', createResponse.data);
  } catch (error) {
    console.error('类型安全请求失败:', error);
  }
}

// ============= 配置和拦截器 =============

// 3. 高级配置示例
async function advancedConfigExample() {
  const config: AxiosLikeRequestConfig = {
    baseURL: 'https://api.example.com',
    timeout: 10000,
    headers: {
      'Authorization': 'Bearer your-token',
      'Content-Type': 'application/json',
      'X-API-Version': 'v1',
    },
    validateStatus: (status) => status < 500, // 接受所有非 5xx 错误
    transformRequest: [
      RequestTransformers.removeEmpty,
      RequestTransformers.camelToSnake,
    ],
    transformResponse: [
      ResponseTransformers.snakeToCamel,
      ResponseTransformers.parseDate(['created_at', 'updated_at']),
    ],
  };

  try {
    const response = await post('/api/data', { userName: 'test' }, config);
    console.log('高级配置响应:', response.data);
  } catch (error) {
    console.error('高级配置请求失败:', error);
  }
}

// 4. 使用原始 service 方式
async function serviceExample() {
  // 定义 API 配置
  const apiConfig = {
    getUsers: {
      path: 'users',
      method: 'GET',
    },
    createUser: {
      path: 'users',
      method: 'POST',
      dataType: 'json',
    },
    updateUser: {
      path: 'users/{id}',
      method: 'PUT',
    },
  };

  // 创建服务实例
  const api = service(
    {
      baseURL: 'https://jsonplaceholder.typicode.com',
      timeout: 5000,
      retry: true,
      retryCount: 3,
    },
    apiConfig
  );

  try {
    // 获取用户列表
    const { send: getUsers } = api.getUsers();
    const users = await getUsers();
    console.log('用户列表:', users);

    // 创建新用户
    const { send: createUser } = api.createUser();
    const newUser = await createUser({
      body: {
        name: 'Service User',
        email: 'service@example.com',
      },
    });
    console.log('创建的用户:', newUser);

    // 更新用户
    const { send: updateUser } = api.updateUser();
    const updatedUser = await updateUser({
      path: '1',
      body: {
        name: 'Updated User',
      },
    });
    console.log('更新的用户:', updatedUser);
  } catch (error) {
    console.error('Service 请求失败:', error);
  }
}

// ============= 并发请求 =============

// 5. 并发请求示例
async function concurrentExample() {
  try {
    console.log('开始并发请求...');
    
    // 并行获取多个用户的信息
    const userRequests = [1, 2, 3, 4, 5].map(id => 
      get<User>(`https://jsonplaceholder.typicode.com/users/${id}`)
    );
    
    // 等待所有请求完成
    const userResponses = await all(userRequests);
    const users = userResponses.map(response => response.data);
    console.log('所有用户:', users);
    
    // 竞速请求 - 获取最快的响应
    const raceRequests = [
      get('https://jsonplaceholder.typicode.com/posts/1'),
      get('https://jsonplaceholder.typicode.com/albums/1'),
      get('https://jsonplaceholder.typicode.com/todos/1'),
    ];
    
    const fastestResponse = await race(raceRequests);
    console.log('最快的响应:', fastestResponse.data);
    
  } catch (error) {
    console.error('并发请求失败:', error);
  }
}

// ============= 进度监控 =============

// 6. 文件上传进度监控
async function uploadProgressExample() {
  // 创建一个模拟文件
  const file = new File(['Hello, World!'], 'test.txt', { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', '测试文件上传');

  const config: AxiosLikeRequestConfig = {
    onUploadProgress: (progressEvent: ProgressEvent) => {
      console.log(`上传进度: ${progressEvent.percentage}%`);
      console.log(`已上传: ${progressEvent.loaded} / ${progressEvent.total} bytes`);
      
      // 更新 UI 进度条
      updateProgressBar(progressEvent.percentage);
    },
  };

  try {
    const response = await post('https://httpbin.org/post', formData, config);
    console.log('文件上传成功:', response.data);
  } catch (error) {
    console.error('文件上传失败:', error);
  }
}

// 7. 文件下载进度监控
async function downloadProgressExample() {
  const config: AxiosLikeRequestConfig = {
    responseType: 'blob',
    onDownloadProgress: (progressEvent: ProgressEvent) => {
      console.log(`下载进度: ${progressEvent.percentage}%`);
      console.log(`已下载: ${progressEvent.loaded} / ${progressEvent.total} bytes`);
      
      // 更新 UI 进度条
      updateProgressBar(progressEvent.percentage);
    },
  };

  try {
    const response = await get('https://httpbin.org/bytes/1048576', config); // 1MB
    console.log('文件下载完成，大小:', (response.data as Blob).size);
    
    // 可以创建下载链接
    const url = URL.createObjectURL(response.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'downloaded-file.bin';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('文件下载失败:', error);
  }
}

// 进度条更新函数（示例）
function updateProgressBar(percentage: number) {
  // 在实际应用中，这里会更新 DOM 元素
  const progressElement = document.getElementById('progress-bar');
  if (progressElement) {
    progressElement.style.width = `${percentage}%`;
    progressElement.textContent = `${percentage}%`;
  }
}

// ============= 错误处理 =============

// 8. 错误处理示例
async function errorHandlingExample() {
  // 安装默认错误处理器
  installDefaultErrorHandlers();
  
  // 添加自定义错误处理器
  ErrorReporter.addErrorHandler((error) => {
    // 发送错误到监控系统
    console.log('发送错误到监控系统:', {
      message: error.message,
      status: error.status,
      url: error.config?.url,
      timestamp: new Date().toISOString(),
    });
  });

  try {
    // 故意触发 404 错误
    await get('https://jsonplaceholder.typicode.com/nonexistent');
  } catch (error) {
    console.log('捕获到错误:', error);
    
    // 错误分类
    if (ErrorClassifier.isClientError(error as any)) {
      console.log('这是客户端错误');
    }
    
    if (ErrorClassifier.isServerError(error as any)) {
      console.log('这是服务器错误');
    }
    
    if (ErrorClassifier.isNetworkError(error as Error)) {
      console.log('这是网络错误');
    }
  }

  // 状态码检查
  try {
    const response = await get('https://httpbin.org/status/500');
  } catch (error: any) {
    if (error.status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      console.log('服务器内部错误，请稍后重试');
    }
  }
}

// ============= 数据转换 =============

// 9. 数据转换示例
async function dataTransformExample() {
  // 请求数据转换
  const requestData = {
    userName: 'testuser',
    userEmail: 'test@example.com',
    isActive: true,
    emptyField: '',
    nullField: null,
  };

  const config: AxiosLikeRequestConfig = {
    transformRequest: [
      RequestTransformers.removeEmpty, // 移除空值
      RequestTransformers.camelToSnake, // 驼峰转下划线
    ],
    transformResponse: [
      ResponseTransformers.snakeToCamel, // 下划线转驼峰
      ResponseTransformers.parseDate(['created_at', 'updated_at']), // 解析日期
      ResponseTransformers.parseBooleans(['is_active']), // 解析布尔值
    ],
  };

  try {
    const response = await post('https://httpbin.org/post', requestData, config);
    console.log('转换后的响应:', response.data);
  } catch (error) {
    console.error('数据转换失败:', error);
  }

  // 使用预设转换器
  try {
    const response = await post(
      'https://httpbin.org/post',
      requestData,
      {
        transformRequest: [PresetTransformers.prepareJsonRequest],
        transformResponse: [PresetTransformers.standardizeApiResponse],
      }
    );
    console.log('预设转换器响应:', response.data);
  } catch (error) {
    console.error('预设转换器失败:', error);
  }
}

// ============= 高级特性 =============

// 10. 自定义状态码验证
async function customValidationExample() {
  // 自定义验证器：接受 200-299 和 400-499
  const customValidator = (status: number) => {
    return isSuccess(status) || isClientError(status);
  };

  try {
    const response = await get('https://httpbin.org/status/404', {
      validateStatus: customValidator,
    });
    console.log('自定义验证通过，状态码:', response.status);
  } catch (error) {
    console.error('自定义验证失败:', error);
  }
}

// 11. 条件请求示例
async function conditionalRequestExample() {
  try {
    // 首先获取用户信息
    const userResponse = await get<User>('https://jsonplaceholder.typicode.com/users/1');
    
    // 根据用户信息决定后续请求
    if (userResponse.data.id) {
      const conditionalRequests = [
        get(`https://jsonplaceholder.typicode.com/users/${userResponse.data.id}/posts`),
        get(`https://jsonplaceholder.typicode.com/users/${userResponse.data.id}/albums`),
      ];
      
      const [postsResponse, albumsResponse] = await all(conditionalRequests);
      
      console.log('用户文章:', postsResponse.data);
      console.log('用户相册:', albumsResponse.data);
    }
  } catch (error) {
    console.error('条件请求失败:', error);
  }
}

// 12. 重试机制示例
async function retryExample() {
  const maxRetries = 3;
  let attempt = 0;

  const makeRequest = async (): Promise<AxiosLikeResponse> => {
    attempt++;
    console.log(`尝试第 ${attempt} 次请求...`);
    
    // 模拟不稳定的API
    if (Math.random() > 0.7) {
      throw createHttpError('模拟网络错误', 500);
    }
    
    return await get('https://jsonplaceholder.typicode.com/posts/1');
  };

  try {
    const response = await makeRequest();
    console.log('重试成功:', response.data);
  } catch (error) {
    if (attempt < maxRetries) {
      console.log('重试中...');
      // 延迟后重试
      setTimeout(() => retryExample(), 1000);
    } else {
      console.error('重试失败，已达到最大重试次数:', error);
    }
  }
}

// ============= 性能优化 =============

// 13. 请求缓存示例（简单实现）
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 默认5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

async function cachedRequestExample() {
  const cacheKey = 'users-list';
  
  // 检查缓存
  let cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('从缓存获取数据:', cachedData);
    return cachedData;
  }
  
  try {
    // 发起请求
    const response = await get('https://jsonplaceholder.typicode.com/users');
    
    // 缓存响应
    cache.set(cacheKey, response.data);
    
    console.log('从网络获取数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('缓存请求失败:', error);
    throw error;
  }
}

// ============= 实用工具函数 =============

// 14. 批量请求工具
async function batchRequests<T>(
  urls: string[],
  batchSize: number = 5,
  delay: number = 100
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchRequests = batch.map(url => get<T>(url));
    
    try {
      const batchResults = await all(batchRequests);
      results.push(...batchResults.map(response => response.data));
      
      // 批次间延迟
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`批次 ${Math.floor(i / batchSize) + 1} 失败:`, error);
      throw error;
    }
  }
  
  return results;
}

// 15. 带超时的请求
async function requestWithTimeout<T>(
  requestFn: () => Promise<AxiosLikeResponse<T>>,
  timeoutMs: number = 5000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`请求超时 (${timeoutMs}ms)`)), timeoutMs);
  });
  
  try {
    const response = await race([requestFn(), timeoutPromise]);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ============= 运行示例 =============

// 主函数：运行所有示例
export async function runAllExamples() {
  console.log('=== an-fetch 完整功能演示 ===\n');
  
  try {
    console.log('1. 基础 GET 请求');
    await basicGetExample();
    
    console.log('\n2. 带类型的请求');
    await typedRequestExample();
    
    console.log('\n3. 高级配置');
    await advancedConfigExample();
    
    console.log('\n4. Service 方式');
    await serviceExample();
    
    console.log('\n5. 并发请求');
    await concurrentExample();
    
    console.log('\n6. 文件上传进度');
    await uploadProgressExample();
    
    console.log('\n7. 文件下载进度');
    await downloadProgressExample();
    
    console.log('\n8. 错误处理');
    await errorHandlingExample();
    
    console.log('\n9. 数据转换');
    await dataTransformExample();
    
    console.log('\n10. 自定义验证');
    await customValidationExample();
    
    console.log('\n11. 条件请求');
    await conditionalRequestExample();
    
    console.log('\n12. 重试机制');
    await retryExample();
    
    console.log('\n13. 请求缓存');
    await cachedRequestExample();
    
    console.log('\n14. 批量请求');
    const urls = [
      'https://jsonplaceholder.typicode.com/posts/1',
      'https://jsonplaceholder.typicode.com/posts/2',
      'https://jsonplaceholder.typicode.com/posts/3',
    ];
    const batchResults = await batchRequests(urls, 2);
    console.log('批量请求结果:', batchResults);
    
    console.log('\n15. 超时请求');
    const timeoutResult = await requestWithTimeout(
      () => get('https://jsonplaceholder.typicode.com/posts/1'),
      5000
    );
    console.log('超时请求结果:', timeoutResult);
    
  } catch (error) {
    console.error('示例运行失败:', error);
  }
}

// 导出所有示例函数
export {
  basicGetExample,
  typedRequestExample,
  advancedConfigExample,
  serviceExample,
  concurrentExample,
  uploadProgressExample,
  downloadProgressExample,
  errorHandlingExample,
  dataTransformExample,
  customValidationExample,
  conditionalRequestExample,
  retryExample,
  cachedRequestExample,
  batchRequests,
  requestWithTimeout,
};

// 如果直接运行此文件
if (typeof window !== 'undefined') {
  // 浏览器环境
  (window as any).anFetchExamples = {
    runAllExamples,
    basicGetExample,
    typedRequestExample,
    // ... 其他示例函数
  };
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js 环境
  module.exports = {
    runAllExamples,
    basicGetExample,
    typedRequestExample,
    // ... 其他示例函数
  };
}