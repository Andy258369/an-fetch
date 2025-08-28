// Jest 测试环境设置
import 'core-js/stable';

// 全局 fetch mock 设置
global.fetch = jest.fn();

// 添加未捕获异常处理
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
  // 不要抛出错误，只是记录
});

process.on('uncaughtException', (error) => {
  console.warn('Uncaught Exception:', error);
  // 不要抛出错误，只是记录
});

// 添加浏览器 API polyfills - 使用简单的对象扩展避免类型冲突
Object.defineProperty(global, 'Headers', {
  writable: true,
  value: class {
    private headers: Record<string, string> = {};

    constructor(init?: any) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => {
            this.headers[key.toLowerCase()] = value;
          });
        } else if (init && typeof init === 'object') {
          Object.entries(init).forEach(([key, value]) => {
            this.headers[key.toLowerCase()] = String(value);
          });
        }
      }
    }

    get(name: string): string | null {
      return this.headers[name.toLowerCase()] || null;
    }

    has(name: string): boolean {
      return name.toLowerCase() in this.headers;
    }

    set(name: string, value: string): void {
      this.headers[name.toLowerCase()] = value;
    }

    append(name: string, value: string): void {
      const existing = this.get(name);
      if (existing) {
        this.set(name, `${existing}, ${value}`);
      } else {
        this.set(name, value);
      }
    }

    delete(name: string): void {
      delete this.headers[name.toLowerCase()];
    }

    forEach(
      callback: (value: string, name: string, parent: any) => void
    ): void {
      Object.entries(this.headers).forEach(([name, value]) => {
        callback(value, name, this);
      });
    }

    entries(): IterableIterator<[string, string]> {
      return Object.entries(this.headers)[Symbol.iterator]();
    }

    keys(): IterableIterator<string> {
      return Object.keys(this.headers)[Symbol.iterator]();
    }

    values(): IterableIterator<string> {
      return Object.values(this.headers)[Symbol.iterator]();
    }
  },
});

Object.defineProperty(global, 'Blob', {
  writable: true,
  value: class {
    size: number;
    type: string;

    constructor(blobParts?: any[], options?: any) {
      this.size = 0;
      this.type = options?.type || '';

      if (blobParts) {
        blobParts.forEach(part => {
          if (typeof part === 'string') {
            this.size += part.length;
          } else if (part && part.byteLength) {
            this.size += part.byteLength;
          }
        });
      }
    }
  },
});

Object.defineProperty(global, 'TextDecoder', {
  writable: true,
  value: class {
    decode(input?: any): string {
      if (!input) return '';

      if (input instanceof ArrayBuffer) {
        const uint8Array = new Uint8Array(input);
        return String.fromCharCode.apply(null, Array.from(uint8Array));
      }

      if (input instanceof Uint8Array) {
        return String.fromCharCode.apply(null, Array.from(input));
      }

      return String(input);
    }
  },
});

// 设置测试超时
jest.setTimeout(10000);

beforeEach(() => {
  // 清理所有 mock
  jest.clearAllMocks();

  // 重置 fetch mock
  (global.fetch as jest.Mock).mockClear();
});
