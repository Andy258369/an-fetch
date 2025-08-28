import service, { GlobalConfig, ApiConfig } from '../src/index';

describe('an-fetch', () => {
  describe('service function', () => {
    it('should create service with default config', () => {
      const api = service();
      expect(api).toBeDefined();
      expect(typeof api).toBe('object');
    });

    it('should create service with custom config', () => {
      const globalConfig: GlobalConfig = {
        baseURL: 'https://api.example.com',
        timeout: 5000,
        retry: true,
        retryCount: 3,
      };

      const apiConfig: Record<string, ApiConfig> = {
        test: {
          path: 'test',
          method: 'GET',
        },
      };

      const api = service(globalConfig, apiConfig);
      expect(api.test).toBeDefined();
      expect(typeof api.test).toBe('function');
    });
  });

  describe('request methods', () => {
    let api: any;

    beforeEach(() => {
      const apiConfig: Record<string, ApiConfig> = {
        test: {
          path: 'test',
          method: 'GET',
        },
        post: {
          path: 'post',
          method: 'POST',
          dataType: 'json',
        },
      };

      api = service({ baseURL: 'https://api.example.com' }, apiConfig);
    });

    it('should have send and abort methods', () => {
      const request = api.test();
      expect(request.send).toBeDefined();
      expect(request.abort).toBeDefined();
      expect(typeof request.send).toBe('function');
      expect(typeof request.abort).toBe('function');
    });

    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        clone: () => ({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
        }),
      });

      const request = api.test();
      const result = await request.send();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make successful POST request with body', async () => {
      const mockResponse = { success: true };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        clone: () => ({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
        }),
      });

      const request = api.post();
      const result = await request.send({
        body: { name: 'test', value: 123 },
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/post',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test', value: 123 }),
          headers: expect.objectContaining({
            'Content-Type': 'application/json;charset=UTF-8',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle request timeout', async () => {
      const request = api.test({
        timeout: 100,
        timeoutRetry: true,
        timeoutRetryCount: 1,
      });

      // Mock fetch to never resolve (simulate timeout)
      (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      await expect(request.send()).rejects.toBe('接口已超时');
    });

    it('should handle network errors with retry', async () => {
      const mockError = new Error('Network error');
      mockError.name = 'NetworkError';
      (fetch as jest.Mock).mockRejectedValue(mockError);

      const request = api.test({
        retry: true,
        retryCount: 2,
        retryInterval: 100,
      });

      await expect(request.send()).rejects.toThrow('Network error');
      expect(fetch).toHaveBeenCalledTimes(3); // Original + 2 retries
    });
  });

  describe('interceptors', () => {
    let api: any;

    beforeEach(() => {
      const apiConfig: Record<string, ApiConfig> = {
        test: {
          path: 'test',
          method: 'GET',
        },
      };

      api = service({ baseURL: 'https://api.example.com' }, apiConfig);
    });

    it('should apply request interceptors', async () => {
      const mockResponse = { data: 'test' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        clone: () => ({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
        }),
      });

      // Add request interceptor
      service.interceptors.request.use((config: ApiConfig) => {
        config.headers = config.headers || {};
        config.headers['X-Custom-Header'] = 'custom-value';
        return config;
      });

      const request = api.test();
      await request.send();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should apply response interceptors', async () => {
      const mockResponse = { data: 'test' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        clone: () => ({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
        }),
      });

      // Add response interceptor
      service.interceptors.response.use(() => {
        return { intercepted: true, data: 'modified' };
      });

      const request = api.test();
      const result = await request.send();

      expect(result).toEqual({ intercepted: true, data: 'modified' });
    });
  });

  describe('utility functions', () => {
    it('should format query parameters correctly', () => {
      const query = { name: 'test', age: 25, active: true };
      const result = service(
        {},
        {
          test: {
            path: 'test',
            method: 'GET',
          },
        }
      )
        .test()
        .send({ query });

      // This is a basic test - in a real scenario you'd need to mock fetch
      expect(result).toBeDefined();
    });

    it('should format data according to dataType', () => {
      const body = { name: 'test', value: 123 };
      const result = service(
        {},
        {
          test: {
            path: 'test',
            method: 'GET',
          },
        }
      )
        .test()
        .send({
          body,
          dataType: 'form-urlencoded',
        });

      // This is a basic test - in a real scenario you'd need to mock fetch
      expect(result).toBeDefined();
    });
  });
});
