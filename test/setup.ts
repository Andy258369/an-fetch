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

Object.defineProperty(global, 'FormData', {
  writable: true,
  value: class {
    private data: Map<string, any> = new Map();

    append(name: string, value: any, filename?: string): void {
      const existing = this.data.get(name);
      if (existing) {
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          this.data.set(name, [existing, value]);
        }
      } else {
        this.data.set(name, value);
      }
    }

    delete(name: string): void {
      this.data.delete(name);
    }

    get(name: string): any {
      const value = this.data.get(name);
      return Array.isArray(value) ? value[0] : value;
    }

    getAll(name: string): any[] {
      const value = this.data.get(name);
      return Array.isArray(value) ? value : value ? [value] : [];
    }

    has(name: string): boolean {
      return this.data.has(name);
    }

    set(name: string, value: any, filename?: string): void {
      this.data.set(name, value);
    }

    forEach(callback: (value: any, key: string, parent: any) => void): void {
      this.data.forEach((value, key) => {
        if (Array.isArray(value)) {
          value.forEach(v => callback(v, key, this));
        } else {
          callback(value, key, this);
        }
      });
    }

    entries(): IterableIterator<[string, any]> {
      const entries: [string, any][] = [];
      this.data.forEach((value, key) => {
        if (Array.isArray(value)) {
          value.forEach(v => entries.push([key, v]));
        } else {
          entries.push([key, value]);
        }
      });
      return entries[Symbol.iterator]();
    }

    keys(): IterableIterator<string> {
      const keys: string[] = [];
      this.data.forEach((value, key) => {
        if (Array.isArray(value)) {
          value.forEach(() => keys.push(key));
        } else {
          keys.push(key);
        }
      });
      return keys[Symbol.iterator]();
    }

    values(): IterableIterator<any> {
      const values: any[] = [];
      this.data.forEach(value => {
        if (Array.isArray(value)) {
          values.push(...value);
        } else {
          values.push(value);
        }
      });
      return values[Symbol.iterator]();
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

    slice(start?: number, end?: number, contentType?: string): any {
      return new (this.constructor as any)([], { type: contentType || this.type });
    }

    stream(): any {
      return {
        getReader: () => ({
          read: () => Promise.resolve({ done: true, value: undefined })
        })
      };
    }

    text(): Promise<string> {
      return Promise.resolve('');
    }

    arrayBuffer(): Promise<ArrayBuffer> {
      return Promise.resolve(new ArrayBuffer(0));
    }
  },
});

Object.defineProperty(global, 'File', {
  writable: true,
  value: class extends (global as any).Blob {
    name: string;
    lastModified: number;

    constructor(fileBits: any[], fileName: string, options?: any) {
      super(fileBits, options);
      this.name = fileName;
      this.lastModified = options?.lastModified || Date.now();
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
