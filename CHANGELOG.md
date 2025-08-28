# 更新日志

本文档记录了 an-fetch 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [2.0.0] - 2025-08-28

### 新增
- 🚀 **便捷方法**：添加类似 axios 的 `get`、`post`、`put`、`delete`、`patch`、`head`、`options` 方法
- 🔄 **并发请求**：支持 `all()` 和 `race()` 方法进行并发处理
- 📊 **进度监控**：支持上传和下载进度监控
- 🛡️ **增强 TypeScript**：新增 40+ 个类型定义，完整的泛型支持
- 🔄 **数据转换器**：强大的请求/响应数据转换器系统
- ⚠️ **错误处理**：完善的错误分类和处理机制
- 🧪 **测试覆盖**：全面的测试用例覆盖所有新功能
- 📚 **文档完善**：详细的使用文档和 TypeScript 指南

### 改进
- 更好的错误信息和调试体验
- 优化的包大小和性能
- 增强的类型安全和智能提示
- 更灵活的配置选项

### 技术细节
- 新增模块：`axios-like.ts`、`error-handling.ts`、`transformers.ts`
- 扩展类型定义：支持泛型、联合类型、条件类型
- 完善测试：单元测试、集成测试、类型测试
- CI/CD：GitHub Actions 自动化流水线

## [1.0.1] - 2023-XX-XX

### 修复
- 修复了一些小问题
- 优化了文档

## [1.0.0] - 2023-XX-XX

### 新增
- 🎉 初始版本发布
- 基于原生 fetch 的请求封装
- 支持拦截器系统
- 支持重试机制
- 支持请求去重
- 基础的 TypeScript 支持

---

## 版本说明

### 主版本 (Major)
当进行不兼容的 API 更改时发布。

### 次版本 (Minor)
当以向后兼容的方式添加功能时发布。

### 修订版本 (Patch)
当进行向后兼容的错误修复时发布。

## 迁移指南

### 从 v1.x 到 v2.0

v2.0 完全向下兼容 v1.x，你可以继续使用原有的 API：

```typescript
// v1.x 方式（继续支持）
const api = service(globalConfig, apiConfig);
const result = await api.getUser().send();

// v2.0 新方式（推荐）
const user = await get<User>('/api/users/1');
```

### 新功能使用

```typescript
// 并发请求
const [users, posts] = await all([
  get<User[]>('/api/users'),
  get<Post[]>('/api/posts')
]);

// 进度监控
const response = await post('/api/upload', formData, {
  onUploadProgress: (event) => {
    console.log(`进度: ${event.percentage}%`);
  }
});

// 数据转换
const response = await post('/api/users', userData, {
  transformRequest: [RequestTransformers.camelToSnake],
  transformResponse: [ResponseTransformers.snakeToCamel]
});
```