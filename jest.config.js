module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // 解决 Jest 兼容性问题
  maxWorkers: 1,
  // 设置测试超时
  testTimeout: 30000,
  // 启用详细输出
  verbose: true,
  // 强制退出以避免挂起
  forceExit: true,
  // 检测未处理的 Promise
  detectOpenHandles: true,
  // 环境变量设置
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // 忽略转换的模块
  transformIgnorePatterns: ['node_modules/(?!.*\.mjs$)'],
};
