import service, { get, post, all, race } from '../src/index';

// 并发请求示例
async function concurrentRequestsDemo() {
  console.log('=== 并发请求示例 ===');

  // 使用便捷方法发起多个请求
  const userRequest = get<{ id: number; name: string }>('/api/user/1');
  const postsRequest = get<Array<{ id: number; title: string }>>('/api/posts');
  const commentsRequest = get<Array<{ id: number; content: string }>>('/api/comments');

  try {
    // 使用 all() 等待所有请求完成
    console.log('使用 all() 等待所有请求完成...');
    const [userResponse, postsResponse, commentsResponse] = await all([
      userRequest,
      postsRequest,
      commentsRequest,
    ]);

    console.log('用户信息:', userResponse.data);
    console.log('文章列表:', postsResponse.data);
    console.log('评论列表:', commentsResponse.data);

    // 使用 race() 获取最快的响应
    console.log('\\n使用 race() 获取最快的响应...');
    const fastestResponse = await race([
      get('/api/fast-endpoint'),
      get('/api/slow-endpoint'),
      get('/api/medium-endpoint'),
    ]);

    console.log('最快的响应:', fastestResponse.data);

  } catch (error) {
    console.error('并发请求失败:', error);
  }
}

// 使用原有 service 方式的并发请求
async function serviceConcurrentDemo() {
  console.log('\\n=== Service 方式并发请求 ===');

  // 定义 API 配置
  const apiConfig = {
    getUser: {
      path: 'user/{id}',
      method: 'GET',
    },
    getPosts: {
      path: 'posts',
      method: 'GET',
    },
    createPost: {
      path: 'posts',
      method: 'POST',
      dataType: 'json',
    },
  };

  // 创建服务实例
  const api = service(
    {
      baseURL: 'https://jsonplaceholder.typicode.com',
      timeout: 10000,
    },
    apiConfig
  );

  try {
    // 准备多个请求
    const requests = [
      api.getUser().send({ path: '1' }),
      api.getPosts().send({ query: { _limit: 5 } }),
      api.createPost().send({
        body: {
          title: '测试文章',
          body: '这是一篇测试文章',
          userId: 1,
        },
      }),
    ];

    // 并发执行
    const results = await service.all(requests);
    console.log('所有请求结果:', results);

    // 竞速请求
    const raceRequests = [
      api.getUser().send({ path: '1' }),
      api.getUser().send({ path: '2' }),
      api.getUser().send({ path: '3' }),
    ];

    const raceResult = await service.race(raceRequests);
    console.log('竞速请求结果:', raceResult);

  } catch (error) {
    console.error('Service 并发请求失败:', error);
  }
}

// 高级并发模式
async function advancedConcurrentPatterns() {
  console.log('\\n=== 高级并发模式 ===');

  try {
    // 分批并发请求
    const batchSize = 3;
    const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    console.log('分批并发请求用户信息...');
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const batchRequests = batch.map(id => 
        get(`/api/user/${id}`)
      );
      
      const batchResults = await all(batchRequests);
      console.log(`批次 ${Math.floor(i / batchSize) + 1} 结果:`, batchResults.map(r => r.data));
      
      // 短暂延迟避免过载
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 条件并发 - 根据第一个请求的结果决定后续请求
    console.log('\\n条件并发请求...');
    const userResponse = await get('/api/user/1');
    
    if (userResponse.data && userResponse.data.id) {
      const conditionalRequests = [
        get(`/api/user/${userResponse.data.id}/posts`),
        get(`/api/user/${userResponse.data.id}/albums`),
        get(`/api/user/${userResponse.data.id}/todos`),
      ];
      
      const conditionalResults = await all(conditionalRequests);
      console.log('条件请求结果:', conditionalResults.map(r => r.data));
    }

    // 超时竞争 - 请求与超时竞争
    console.log('\\n超时竞争模式...');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('请求超时')), 5000)
    );
    
    try {
      const result = await race([
        get('/api/slow-endpoint'),
        timeoutPromise,
      ]);
      console.log('请求成功:', result.data);
    } catch (error) {
      console.log('请求超时或失败:', error.message);
    }

  } catch (error) {
    console.error('高级并发模式失败:', error);
  }
}

// 错误处理的并发请求
async function errorHandlingConcurrent() {
  console.log('\\n=== 错误处理并发请求 ===');

  try {
    // 部分失败的并发请求
    const mixedRequests = [
      get('/api/valid-endpoint').catch(e => ({ error: e, data: null })),
      get('/api/invalid-endpoint').catch(e => ({ error: e, data: null })),
      get('/api/another-valid-endpoint').catch(e => ({ error: e, data: null })),
    ];

    const results = await all(mixedRequests);
    
    // 分离成功和失败的请求
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    
    console.log('成功的请求:', successful.length);
    console.log('失败的请求:', failed.length);

  } catch (error) {
    console.error('错误处理并发请求失败:', error);
  }
}

// 性能监控的并发请求
async function performanceMonitoringConcurrent() {
  console.log('\\n=== 性能监控并发请求 ===');

  const startTime = Date.now();
  
  try {
    const requests = Array.from({ length: 10 }, (_, i) => 
      get(`/api/data/${i}`, {
        headers: { 'X-Request-ID': `req-${i}` }
      })
    );

    // 监控每个请求的完成情况
    const results = await Promise.allSettled(requests);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const fulfilled = results.filter(r => r.status === 'fulfilled').length;
    const rejected = results.filter(r => r.status === 'rejected').length;
    
    console.log('性能统计:');
    console.log(`- 总时间: ${totalTime}ms`);
    console.log(`- 成功请求: ${fulfilled}`);
    console.log(`- 失败请求: ${rejected}`);
    console.log(`- 成功率: ${(fulfilled / results.length * 100).toFixed(2)}%`);

  } catch (error) {
    console.error('性能监控失败:', error);
  }
}

// 导出所有示例函数
export {
  concurrentRequestsDemo,
  serviceConcurrentDemo,
  advancedConcurrentPatterns,
  errorHandlingConcurrent,
  performanceMonitoringConcurrent,
};

// 运行所有示例
async function runAllConcurrentExamples() {
  await concurrentRequestsDemo();
  await serviceConcurrentDemo();
  await advancedConcurrentPatterns();
  await errorHandlingConcurrent();
  await performanceMonitoringConcurrent();
}

export default runAllConcurrentExamples;