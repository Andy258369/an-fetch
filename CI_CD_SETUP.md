# CI/CD 设置指南

本文档介绍如何为 an-fetch 项目设置完整的 CI/CD 流水线。

## 🎯 概述

我们设置了以下自动化流程：

1. **代码质量检查** - 每次 PR 时运行
2. **持续集成** - 每次 push 到主分支时运行
3. **自动发布** - 版本更新时自动发布到 npm
4. **手动发布** - 支持手动触发版本发布

## 🔧 必需的配置

### 1. GitHub Secrets 设置

在你的 GitHub 仓库中，需要设置以下 Secrets：

> 📚 **详细设置指南：**
> - [📋 完整设置指南](./SETUP_SECRETS_GUIDE.md) - 详细的图文教程
> - [⚡ 快速设置指南](./QUICK_SETUP.md) - 5分钟快速完成
> - [📸 可视化指南](./VISUAL_SETUP_GUIDE.md) - 图解版设置步骤

#### 前往 GitHub 仓库设置
1. 打开你的 GitHub 仓库
2. 点击 `Settings` 标签页
3. 在左侧菜单中选择 `Secrets and variables` > `Actions`
4. 点击 `New repository secret`

#### 必需的 Secrets

##### NPM_TOKEN
```
名称: NPM_TOKEN
值: 你的 npm 访问令牌
```

**获取 npm 访问令牌：**
1. 登录 [npmjs.com](https://www.npmjs.com/)
2. 点击右上角头像，选择 `Access Tokens`
3. 点击 `Generate New Token`
4. 选择 `Automation` 类型
5. 复制生成的令牌

##### CODECOV_TOKEN (可选)
```
名称: CODECOV_TOKEN
值: 你的 Codecov 令牌
```

**获取 Codecov 令牌：**
1. 注册 [codecov.io](https://codecov.io/)
2. 连接你的 GitHub 仓库
3. 复制提供的令牌

### 2. npm 包配置

确保你的 npm 包配置正确：

#### package.json 检查
```json
{
  "name": "an-fetch",
  "version": "2.0.0",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

#### .npmignore 文件
确保 `.npmignore` 文件存在并正确配置。

## 🚀 工作流程说明

### 1. 代码质量检查 (quality.yml)

**触发条件：** Pull Request 到 main/master 分支

**检查内容：**
- ESLint 代码检查
- TypeScript 类型检查
- Prettier 格式检查

### 2. 持续集成 (ci-cd.yml)

**触发条件：** Push 到 main/master 分支

**流程：**
1. **测试阶段**
   - 多版本 Node.js 测试 (18.x, 20.x)
   - 运行所有测试用例
   - 生成测试覆盖率报告
   
2. **构建阶段**
   - 构建项目
   - 验证构建产物
   
3. **发布阶段**（仅在主分支）
   - 检查版本是否需要发布
   - 自动发布到 npm
   - 创建 GitHub Release
   - 创建 Git 标签

### 3. 手动发布 (release.yml)

**触发方式：** 手动触发（GitHub Actions 页面）

**选项：**
- 版本类型：patch/minor/major
- 是否预发布版本

**流程：**
1. 运行测试
2. 更新版本号
3. 更新 CHANGELOG
4. 构建项目
5. 提交和推送更改
6. 发布到 npm
7. 创建 GitHub Release

## 📋 使用指南

### 自动发布流程

1. **开发和测试**
   ```bash
   # 开发功能
   git checkout -b feature/new-feature
   # ... 开发代码 ...
   git commit -m "feat: 添加新功能"
   git push origin feature/new-feature
   ```

2. **创建 Pull Request**
   - 代码质量检查会自动运行
   - 确保所有检查通过

3. **合并到主分支**
   ```bash
   # 合并 PR 后，更新本地版本
   npm version patch  # 或 minor/major
   git push --follow-tags
   ```

4. **自动发布**
   - CI/CD 会检测到新版本
   - 自动构建和发布到 npm
   - 创建 GitHub Release

### 手动发布流程

1. **前往 GitHub Actions**
   - 打开仓库的 Actions 页面
   - 选择 "Release Version" 工作流
   - 点击 "Run workflow"

2. **选择发布选项**
   - 选择版本类型（patch/minor/major）
   - 选择是否为预发布版本
   - 点击 "Run workflow"

3. **等待完成**
   - 工作流会自动完成所有发布步骤
   - 检查 npm 包是否发布成功

## 🔍 故障排除

### 常见问题

#### 1. npm 发布失败
```
Error: 403 Forbidden - PUT https://registry.npmjs.org/an-fetch
```

**解决方案：**
- 检查 NPM_TOKEN 是否正确设置
- 确认令牌有发布权限
- 检查包名是否已被占用

#### 2. 版本已存在
```
Error: Cannot publish over the previously published versions
```

**解决方案：**
- 更新 package.json 中的版本号
- 或者使用手动发布工作流

#### 3. 测试失败
```
Error: Tests failed
```

**解决方案：**
- 检查测试用例
- 确保所有依赖正确安装
- 检查测试环境配置

#### 4. 构建失败
```
Error: Build failed
```

**解决方案：**
- 检查 TypeScript 编译错误
- 确保所有依赖可用
- 检查构建配置

### 调试技巧

1. **查看工作流日志**
   - 前往 Actions 页面
   - 点击失败的工作流
   - 查看详细日志

2. **本地复现**
   ```bash
   # 运行和 CI 相同的命令
   npm ci
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

3. **分步调试**
   - 注释部分工作流步骤
   - 逐步启用以定位问题

## 📈 监控和维护

### 成功指标

- ✅ 所有测试通过
- ✅ 代码覆盖率 > 90%
- ✅ 构建成功
- ✅ 自动发布成功
- ✅ npm 包可正常安装

### 定期维护

1. **依赖更新**
   ```bash
   npm audit
   npm update
   ```

2. **工作流优化**
   - 监控构建时间
   - 优化缓存策略
   - 更新 Action 版本

3. **文档更新**
   - 保持文档与实际流程同步
   - 更新故障排除指南

## 🎉 完成设置

设置完成后，你将拥有：

- 🔄 **自动化测试** - 每次代码变更自动测试
- 📦 **自动化发布** - 版本更新自动发布到 npm
- 🏷️ **自动标签** - 自动创建 Git 标签和 GitHub Release
- 📊 **代码质量** - 自动代码检查和格式化
- 🔍 **测试覆盖率** - 监控测试覆盖率变化

现在你可以专注于开发，让 CI/CD 处理其余的工作！

---

**注意：** 首次设置后，建议先在测试分支进行验证，确保所有流程正常工作后再应用到生产环境。