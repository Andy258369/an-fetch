// Jest 测试环境设置
import 'core-js/stable';

// 全局 fetch mock 设置
global.fetch = jest.fn();

// 设置全局错误处理
global.console = {
  ...console,
  // 在测试中静默一些日志输出
  log: jest.fn(),
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// 设置测试超时
jest.setTimeout(10000);

beforeEach(() => {
  // 清理所有 mock
  jest.clearAllMocks();
  
  // 重置 fetch mock
  (global.fetch as jest.Mock).mockClear();
});