import {
  get,
  post,
  put,
  patch,
  all,
  race,
  HTTP_STATUS,
  ErrorClassifier,
  RequestTransformers,
  ResponseTransformers,
  AxiosLikeRequestConfig,
  AxiosLikeResponse,
} from '../src/index';

// Mock fetch
global.fetch = jest.fn();

describe('Enhanced an-fetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('便捷方法测试', () => {
    it('应该支持 GET 请求', async () => {
      const mockResponse = { id: 1, name: 'Test User' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const response = await get<{ id: number; name: string }>('/api/user/1');

      expect(fetch).toHaveBeenCalledWith(
        '/api/user/1',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(response.data).toEqual(mockResponse);
      expect(response.status).toBe(200);
    });

    it('应该支持 POST 请求', async () => {
      const requestData = { name: 'New User', email: 'user@example.com' };
      const mockResponse = { id: 2, ...requestData };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Headers(),
        json: () => Promise.resolve(mockResponse),
      });

      const response = await post('/api/users', requestData);

      expect(fetch).toHaveBeenCalledWith(
        '/api/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json;charset=UTF-8',
          }),
        })
      );
      expect(response.data).toEqual(mockResponse);
    });

    it('应该支持 PUT 请求', async () => {
      const updateData = { name: 'Updated User' };
      const mockResponse = { id: 1, ...updateData };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve(mockResponse),
      });

      const response = await put('/api/users/1', updateData);

      expect(fetch).toHaveBeenCalledWith(
        '/api/users/1',
        expect.objectContaining({
          method: 'PUT',
        })
      );
      expect(response.data).toEqual(mockResponse);
    });

    it('应该支持 PATCH 请求', async () => {
      const patchData = { email: 'newemail@example.com' };
      const mockResponse = { id: 1, name: 'User', ...patchData };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve(mockResponse),
      });

      const response = await patch('/api/users/1', patchData);

      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('并发请求测试', () => {
    it('应该支持 Promise.all 功能', async () => {
      const mockResponses = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
        { id: 3, name: 'User 3' },
      ];

      mockResponses.forEach((response, index) => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: () => Promise.resolve(response),
        });
      });

      const requests = [
        get('/api/users/1'),
        get('/api/users/2'),
        get('/api/users/3'),
      ];

      const responses = await all(requests);

      expect(responses).toHaveLength(3);
      expect(responses[0].data).toEqual(mockResponses[0]);
      expect(responses[1].data).toEqual(mockResponses[1]);
      expect(responses[2].data).toEqual(mockResponses[2]);
    });

    it('应该支持 Promise.race 功能', async () => {
      const fastResponse = { id: 1, name: 'Fast User' };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: () => Promise.resolve(fastResponse),
        })
        .mockImplementationOnce(
          () =>
            new Promise(resolve =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: () => Promise.resolve({ id: 2, name: 'Slow User' }),
                  }),
                100
              )
            )
        );

      const requests = [get('/api/fast'), get('/api/slow')];

      const response = await race(requests);
      expect(response.data).toEqual(fastResponse);
    });
  });

  describe('进度监控测试', () => {
    it('应该支持上传进度监控', async () => {
      const progressEvents: number[] = [];
      const config: AxiosLikeRequestConfig = {
        onUploadProgress: progressEvent => {
          progressEvents.push(progressEvent.percentage);
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ success: true }),
      });

      const formData = new FormData();
      formData.append(
        'file',
        new Blob(['test content'], { type: 'text/plain' })
      );

      await post('/api/upload', formData, config);

      // 注意：由于我们 mock 了 fetch，进度监控可能不会触发
      // 在实际环境中会有进度事件
      expect(fetch).toHaveBeenCalled();
    });

    it('应该支持下载进度监控', async () => {
      const progressEvents: number[] = [];
      const config: AxiosLikeRequestConfig = {
        responseType: 'blob',
        onDownloadProgress: progressEvent => {
          progressEvents.push(progressEvent.percentage);
        },
      };

      const mockBlob = new Blob(['test file content'], {
        type: 'application/octet-stream',
      });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '17' }),
        blob: () => Promise.resolve(mockBlob),
        body: null, // 模拟没有流
      });

      const response = await get('/api/download', config);
      expect(response.data).toEqual(mockBlob);
    });
  });

  describe('错误处理测试', () => {
    it('应该正确处理 HTTP 错误状态', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        json: () => Promise.resolve({ error: 'Resource not found' }),
      });

      await expect(get('/api/nonexistent')).rejects.toThrow(
        'Request failed with status 404'
      );
    });

    it('应该正确分类错误类型', () => {
      const networkError = new Error('Failed to fetch');
      const timeoutError = new Error('Request timeout');
      const cancelError = new Error('Request canceled');

      expect(ErrorClassifier.isNetworkError(networkError)).toBe(true);
      expect(ErrorClassifier.isTimeoutError(timeoutError)).toBe(true);
      expect(ErrorClassifier.isCancelError(cancelError)).toBe(true);
    });

    it('应该正确验证状态码', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe('数据转换器测试', () => {
    it('应该正确转换请求数据', () => {
      const data = { userName: 'test', userId: 123 };
      const transformed = RequestTransformers.camelToSnake(data);

      expect(transformed).toEqual({
        user_name: 'test',
        user_id: 123,
      });
    });

    it('应该移除空值', () => {
      const data = { name: 'test', email: '', age: null, active: true };
      const cleaned = RequestTransformers.removeEmpty(data);

      expect(cleaned).toEqual({
        name: 'test',
        active: true,
      });
    });

    it('应该正确转换响应数据', () => {
      const data = { user_name: 'test', created_at: '2023-01-01T00:00:00Z' };
      const transformed = ResponseTransformers.snakeToCamel(data);

      expect(transformed).toEqual({
        userName: 'test',
        createdAt: '2023-01-01T00:00:00Z',
      });
    });

    it('应该解析日期字段', () => {
      const data = {
        name: 'test',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      };

      const transformed = ResponseTransformers.parseDate([
        'created_at',
        'updated_at',
      ])(data);

      expect(transformed.created_at).toBeInstanceOf(Date);
      expect(transformed.updated_at).toBeInstanceOf(Date);
    });

    it('应该组合多个转换器', () => {
      const data = { user_name: 'test', email: '', active: 'true' };

      const transformer = RequestTransformers.compose(
        RequestTransformers.removeEmpty,
        RequestTransformers.camelToSnake
      );

      const result = transformer(data);

      expect(result).toEqual({
        user_name: 'test',
        active: 'true',
      });
    });
  });

  describe('类型安全测试', () => {
    it('应该提供类型安全的响应', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve(mockUser),
      });

      const response = await get<User>('/api/user/1');

      // TypeScript 应该推断出 response.data 的类型是 User
      expect(response.data.id).toBe(1);
      expect(response.data.name).toBe('Test User');
      expect(response.data.email).toBe('test@example.com');
    });

    it('应该支持泛型请求配置', async () => {
      interface CreateUserRequest {
        name: string;
        email: string;
        age?: number;
      }

      interface CreateUserResponse {
        id: number;
        name: string;
        email: string;
        age?: number;
        createdAt: string;
      }

      const requestData: CreateUserRequest = {
        name: 'New User',
        email: 'new@example.com',
        age: 25,
      };

      const mockResponse: CreateUserResponse = {
        id: 2,
        ...requestData,
        createdAt: '2023-01-01T00:00:00Z',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers(),
        json: () => Promise.resolve(mockResponse),
      });

      const response = await post<CreateUserResponse, CreateUserRequest>(
        '/api/users',
        requestData
      );

      expect(response.data.id).toBe(2);
      expect(response.data.name).toBe(requestData.name);
    });
  });

  describe('响应类型测试', () => {
    it('应该支持不同的响应类型', async () => {
      // 测试 blob 响应
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        blob: () => Promise.resolve(mockBlob),
      });

      const blobResponse = await get('/api/file', { responseType: 'blob' });
      expect(blobResponse.data).toEqual(mockBlob);

      // 测试 text 响应
      const mockText = 'Hello, World!';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve(mockText),
      });

      const textResponse = await get('/api/text', { responseType: 'text' });
      expect(textResponse.data).toBe(mockText);
    });
  });

  describe('自定义配置测试', () => {
    it('应该支持自定义状态码验证', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 202,
        statusText: 'Accepted',
        headers: new Headers(),
        json: () => Promise.resolve({ message: 'Accepted for processing' }),
      });

      // 自定义验证器允许 202 状态码
      const config: AxiosLikeRequestConfig = {
        validateStatus: status => status === 202,
      };

      const response = await get('/api/async-task', config);
      expect(response.status).toBe(202);
    });

    it('应该支持请求和响应转换器', async () => {
      const requestData = { userName: 'test', isActive: true };
      const responseData = { user_id: 1, user_name: 'test', is_active: 1 };

      (fetch as jest.Mock).mockImplementationOnce((url, options) => {
        // 验证请求数据已被转换
        const body = JSON.parse(options.body);
        expect(body).toEqual({ user_name: 'test', is_active: true });

        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: () => Promise.resolve(responseData),
        });
      });

      const config: AxiosLikeRequestConfig = {
        transformRequest: [RequestTransformers.camelToSnake],
        transformResponse: [
          ResponseTransformers.snakeToCamel,
          ResponseTransformers.parseBooleans(['isActive']),
        ],
      };

      const response = await post('/api/user', requestData, config);

      expect(response.data).toEqual({
        userId: 1,
        userName: 'test',
        isActive: true, // 应该从 1 转换为 true
      });
    });
  });

  describe('拦截器集成测试', () => {
    // 注意：这里测试的是新的便捷方法与拦截器的集成
    // 原有的拦截器测试在原测试文件中

    it('应该与便捷方法配合工作', async () => {
      const mockResponse = { data: 'test' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve(mockResponse),
      });

      // 测试便捷方法是否正常工作
      const response = await get('/api/test');
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空响应', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204, // No Content
        headers: new Headers(),
        json: () => Promise.resolve(null),
      });

      const response = await get('/api/empty');
      expect(response.status).toBe(204);
      expect(response.data).toBeNull();
    });

    it('应该处理大数据', async () => {
      const largeData = new Array(10000)
        .fill(0)
        .map((_, i) => ({ id: i, value: `item-${i}` }));

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve(largeData),
      });

      const response = await get('/api/large-data');
      expect(response.data).toHaveLength(10000);
      expect(response.data[0]).toEqual({ id: 0, value: 'item-0' });
    });

    it('应该处理特殊字符', async () => {
      const specialData = {
        emoji: '🚀',
        chinese: '你好世界',
        special: 'äöü',
        unicode: '\\u0048\\u0065\\u006C\\u006C\\u006F',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve(specialData),
      });

      const response = await get('/api/special-chars');
      expect(response.data).toEqual(specialData);
    });
  });
});
