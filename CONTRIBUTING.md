# 贡献指南

感谢你对 an-fetch 的关注和贡献！

## 🚀 开始贡献

### 环境准备

1. Fork 本仓库
2. 克隆你的 fork：
   ```bash
   git clone https://github.com/你的用户名/an-fetch.git
   cd an-fetch
   ```
3. 安装依赖：
   ```bash
   npm install
   ```
4. 创建功能分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```

### 开发流程

1. **代码开发**：
   ```bash
   npm run dev  # 开发模式
   ```

2. **运行测试**：
   ```bash
   npm test           # 运行测试
   npm run test:watch # 监听模式
   npm run test:coverage # 测试覆盖率
   ```

3. **代码检查**：
   ```bash
   npm run lint       # 代码检查
   npm run type-check # 类型检查
   npm run format     # 代码格式化
   ```

4. **构建验证**：
   ```bash
   npm run build      # 构建项目
   ```

### 提交规范

我们使用 [约定式提交](https://www.conventionalcommits.org/zh-hans/) 规范：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式（不影响代码运行）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

示例：
```
feat: 添加文件上传进度监控
fix: 修复并发请求中的内存泄漏
docs: 更新TypeScript使用指南
```

### Pull Request

1. 确保所有测试通过
2. 确保代码覆盖率不降低
3. 更新相关文档
4. 填写详细的 PR 描述

## 📋 开发规范

### 代码风格

- 使用 ESLint 和 Prettier
- 遵循 TypeScript 最佳实践
- 优先使用 interface 而不是 type
- 为所有公共 API 添加 JSDoc 注释

### 测试要求

- 新功能必须有对应的测试用例
- 测试覆盖率应保持在 90% 以上
- 测试应包括正常情况和异常情况

### 文档要求

- 新功能需要更新 README.md
- 复杂功能需要提供使用示例
- TypeScript 相关功能需要更新类型指南

## 🐛 报告问题

### Bug 报告

请提供以下信息：
- 详细的问题描述
- 复现步骤
- 期望的行为
- 实际的行为
- 环境信息（Node.js 版本、浏览器版本等）
- 最小可复现示例

### 功能请求

请提供以下信息：
- 功能描述
- 使用场景
- 期望的 API 设计
- 相关的替代方案

## 🎯 开发指南

### 项目结构

```
src/
├── index.ts          # 主入口
├── types.ts          # 类型定义
├── utils.ts          # 工具函数
├── axios-like.ts     # 便捷方法
├── error-handling.ts # 错误处理
└── transformers.ts   # 数据转换器

test/
├── index.test.ts            # 原功能测试
└── enhanced-features.test.ts # 新功能测试

examples/
├── complete-usage.ts        # 完整示例
├── concurrent-requests.ts   # 并发请求示例
└── progress-monitoring.ts   # 进度监控示例
```

### 添加新功能

1. 在对应模块中添加实现
2. 更新 `types.ts` 中的类型定义
3. 在 `index.ts` 中导出新功能
4. 添加测试用例
5. 更新文档和示例

### 调试技巧

1. 使用 `npm run dev` 监听模式开发
2. 使用 `npm run test:watch` 监听测试
3. 在 VSCode 中设置断点调试
4. 使用 `console.log` 调试（记得删除）

## 💡 贡献想法

我们欢迎以下类型的贡献：

- Bug 修复
- 新功能开发
- 性能优化
- 文档完善
- 示例补充
- 测试用例
- 国际化支持

## 📞 联系我们

- GitHub Issues: 报告问题和功能请求
- Email: m18680602188@163.com
- 微信群: 加微信后邀请入群

感谢你的贡献！🎉