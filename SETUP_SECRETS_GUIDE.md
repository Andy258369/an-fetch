# GitHub Secrets 和 NPM_TOKEN 详细设置指南

本指南将详细说明如何设置 GitHub Secrets 和获取 NPM_TOKEN，确保 CI/CD 流水线能够正常工作。

## 🎯 概述

为了让 GitHub Actions 能够自动发布包到 npm，我们需要：
1. 在 npm 上创建一个访问令牌 (NPM_TOKEN)
2. 将这个令牌添加到 GitHub 仓库的 Secrets 中

## 📦 第一步：获取 NPM_TOKEN

### 1.1 登录或注册 npm 账户

**如果你还没有 npm 账户：**
1. 访问 [https://www.npmjs.com/](https://www.npmjs.com/)
2. 点击右上角的 "Sign Up" 按钮
3. 填写用户名、邮箱和密码
4. 验证邮箱地址

**如果你已有 npm 账户：**
1. 访问 [https://www.npmjs.com/](https://www.npmjs.com/)
2. 点击右上角的 "Sign In" 按钮
3. 输入用户名/邮箱和密码登录

### 1.2 访问 Access Tokens 页面

登录成功后：
1. 点击页面右上角的 **你的头像**
2. 在下拉菜单中选择 **"Access Tokens"**
3. 或者直接访问：[https://www.npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)

### 1.3 创建新的访问令牌

在 Access Tokens 页面：

1. **点击 "Generate New Token" 按钮**
   - 如果是新用户，页面可能显示 "Create New Token"

2. **选择令牌类型**
   
   你会看到三个选项：
   
   **🔹 Classic Token (推荐)**
   ```
   ✅ 选择这个选项
   适用于 CI/CD 自动化发布
   ```
   
   **🔹 Granular Access Token**
   ```
   ❌ 不推荐用于 CI/CD
   更复杂的权限设置
   ```

3. **配置令牌设置**

   选择 Classic Token 后，你需要配置：

   **Token Name (令牌名称)：**
   ```
   建议命名：an-fetch-cicd
   或者：github-actions-publish
   ```

   **Expiration (过期时间)：**
   ```
   ✅ 推荐选择：No Expiration (不过期)
   
   🔸 如果组织政策要求，可以选择：
   - 30 days (30天)
   - 90 days (90天)
   - 1 year (1年)
   - Custom (自定义)
   ```

   **Access Level (访问级别)：**
   ```
   ✅ 必须选择：Automation
   
   说明：
   - Automation: 允许发布和管理包（CI/CD 需要）
   - Read-only: 只能读取包信息（不够用）
   ```

4. **点击 "Generate Token" 按钮**

### 1.4 复制并保存令牌

⚠️ **重要提醒：**
- 令牌生成后只会显示一次
- 必须立即复制并保存
- 如果丢失，需要重新生成

**令牌格式示例：**
```
npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**保存令牌：**
1. 立即复制令牌到剪贴板
2. 临时保存到安全的地方（如密码管理器）
3. 不要将令牌提交到代码仓库

## 🐙 第二步：设置 GitHub Secrets

### 2.1 打开 GitHub 仓库

1. 访问你的 GitHub 仓库页面
   ```
   https://github.com/你的用户名/an-fetch
   ```

2. 确保你有仓库的管理员权限

### 2.2 进入 Settings 页面

在仓库页面：
1. 点击顶部导航栏的 **"Settings"** 标签页
   - 位置：Code | Issues | Pull requests | Actions | Projects | Security | **Settings**

2. 如果看不到 Settings 标签：
   - 检查你是否有仓库的管理员权限
   - 如果是 Fork 的仓库，需要在你自己的 Fork 中设置

### 2.3 导航到 Secrets 设置

在左侧导航栏中：
1. 找到 **"Security"** 部分
2. 点击 **"Secrets and variables"**
3. 选择 **"Actions"**

完整路径：
```
Settings → Secrets and variables → Actions
```

### 2.4 添加 NPM_TOKEN Secret

在 Secrets 页面：

1. **点击 "New repository secret" 按钮**
   - 按钮通常位于页面右上角，绿色背景

2. **填写 Secret 信息**

   **Name (名称)：**
   ```
   NPM_TOKEN
   ```
   ⚠️ 注意：名称必须完全匹配，区分大小写

   **Secret (值)：**
   ```
   npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   粘贴你在第一步复制的完整 npm 令牌

3. **点击 "Add secret" 按钮**

### 2.5 验证 Secret 已添加

成功添加后，你应该看到：
- Secret 名称：NPM_TOKEN
- 状态：✅ (绿色对勾)
- 值：****** (被隐藏)

## 🔧 第三步：可选的额外 Secrets

### 3.1 CODECOV_TOKEN (可选)

如果你想使用 Codecov 进行代码覆盖率分析：

**获取 Codecov 令牌：**
1. 访问 [https://codecov.io/](https://codecov.io/)
2. 使用 GitHub 账户登录
3. 添加你的仓库
4. 复制提供的令牌

**添加到 GitHub Secrets：**
```
Name: CODECOV_TOKEN
Secret: 你的 Codecov 令牌
```

### 3.2 GITHUB_TOKEN (自动提供)

这个令牌是 GitHub 自动提供的，不需要手动设置。

## ✅ 第四步：验证设置

### 4.1 检查 npm 权限

确保你的 npm 账户有发布包的权限：

**本地验证：**
```bash
# 登录 npm
npm login

# 验证身份
npm whoami

# 检查包名是否可用
npm view an-fetch
```

如果包名已存在且不属于你，需要：
1. 更改包名
2. 或者请求包的所有权

### 4.2 测试 GitHub Actions

**方法一：推送测试**
```bash
# 做一个小的更改
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger CI/CD"
git push origin main
```

**方法二：手动触发**
1. 前往 GitHub Actions 页面
2. 选择任一工作流
3. 点击 "Run workflow"

### 4.3 查看执行日志

在 GitHub Actions 页面：
1. 点击正在运行或已完成的工作流
2. 查看详细步骤和日志
3. 确认没有权限相关的错误

## 🚨 常见问题和解决方案

### 问题 1：npm 发布失败

**错误信息：**
```
Error: 403 Forbidden - PUT https://registry.npmjs.org/an-fetch
You do not have permission to publish "an-fetch"
```

**解决方案：**
1. 检查包名是否已被占用
2. 更改 package.json 中的包名
3. 或申请包的所有权

### 问题 2：NPM_TOKEN 无效

**错误信息：**
```
Error: 401 Unauthorized
Invalid authentication token
```

**解决方案：**
1. 重新生成 npm 令牌
2. 确保选择了 "Automation" 访问级别
3. 重新添加到 GitHub Secrets

### 问题 3：GitHub Secrets 不生效

**可能原因：**
- Secret 名称拼写错误（区分大小写）
- 令牌格式不正确
- 工作流文件中的变量名不匹配

**解决方案：**
1. 检查 Secret 名称是否为 `NPM_TOKEN`
2. 确认令牌以 `npm_` 开头
3. 检查工作流文件中的 `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`

### 问题 4：权限不足

**错误信息：**
```
Error: Resource not accessible by integration
```

**解决方案：**
1. 确保你有仓库的管理员权限
2. 检查 GitHub Actions 是否已启用
3. 检查仓库设置中的 Actions 权限

## 📋 设置检查清单

完成设置后，请确认：

### npm 配置 ✅
- [ ] npm 账户已创建并验证
- [ ] 生成了 Automation 类型的访问令牌
- [ ] 令牌已安全保存
- [ ] 确认包名可用或有发布权限

### GitHub 配置 ✅
- [ ] 仓库有管理员权限
- [ ] GitHub Actions 已启用
- [ ] NPM_TOKEN Secret 已正确添加
- [ ] Secret 名称完全匹配（NPM_TOKEN）

### 验证测试 ✅
- [ ] 本地可以正常 npm login
- [ ] GitHub Actions 工作流可以运行
- [ ] 没有权限相关错误
- [ ] 可以看到详细的执行日志

## 🔐 安全建议

### 保护你的令牌

1. **不要泄露令牌**
   - 不要将令牌提交到代码仓库
   - 不要在聊天或邮件中分享
   - 不要截图包含令牌的内容

2. **定期轮换令牌**
   - 建议每 6-12 个月更新一次
   - 如果怀疑泄露，立即重新生成

3. **最小权限原则**
   - 只为必需的仓库设置 Secrets
   - 定期审查和清理不需要的令牌

### 监控使用情况

1. **检查 npm 活动**
   - 定期查看 npm 包的下载统计
   - 关注异常的发布活动

2. **GitHub 审计日志**
   - 查看 Settings → Security → Audit log
   - 监控 Secrets 的访问和修改

## 🎉 完成！

设置完成后，你的 CI/CD 流水线就可以：

- 🔄 自动运行测试
- 📦 自动构建项目
- 🚀 自动发布到 npm
- 🏷️ 自动创建 GitHub Release

现在你可以专注于开发，让自动化处理发布流程！

---

**💡 提示：** 如果在设置过程中遇到问题，可以参考 GitHub 和 npm 的官方文档，或者在项目中创建 Issue 寻求帮助。