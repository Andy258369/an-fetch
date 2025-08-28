# 🚀 CI/CD 快速设置指南

这是一个简化的设置指南，帮你快速完成 GitHub Secrets 和 NPM_TOKEN 的配置。

## ⏰ 预计用时：5-10 分钟

## 📝 第一步：获取 NPM_TOKEN

### 1️⃣ 登录 npm
- 打开 [https://www.npmjs.com/](https://www.npmjs.com/)
- 点击 "Sign In" 登录（没有账户的话先注册）

### 2️⃣ 创建访问令牌
```
登录后的操作步骤：
👤 点击头像 → Access Tokens → Generate New Token
```

### 3️⃣ 配置令牌
```
Token Type: ✅ Classic Token
Token Name: an-fetch-cicd
Expiration: ✅ No Expiration  
Access Level: ✅ Automation  （重要！必须选这个）
```

### 4️⃣ 复制令牌
```
⚠️ 重要：令牌只显示一次，立即复制！
格式：npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🐙 第二步：设置 GitHub Secrets

### 1️⃣ 打开仓库设置
```
GitHub仓库页面 → Settings → Secrets and variables → Actions
```

### 2️⃣ 添加 Secret
```
点击 "New repository secret"

Name:   NPM_TOKEN
Secret: npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx （粘贴你的令牌）

点击 "Add secret"
```

## ✅ 第三步：验证设置

### 测试方法 1：推送代码
```bash
# 创建一个测试提交
git add .
git commit -m "feat: setup CI/CD"
git push origin main
```

### 测试方法 2：手动触发
```
GitHub仓库 → Actions → 选择工作流 → Run workflow
```

### 查看结果
```
Actions 页面 → 点击运行中的工作流 → 查看日志
```

## 🔧 常见问题快速解决

### ❌ 403 Forbidden 错误
```
原因：包名已被占用或权限不足
解决：更改 package.json 中的包名
```

### ❌ 401 Unauthorized 错误  
```
原因：NPM_TOKEN 无效
解决：重新生成令牌，确保选择 "Automation" 类型
```

### ❌ Secret 不生效
```
原因：名称拼写错误
解决：确保 Secret 名称完全是 "NPM_TOKEN"
```

## 📞 需要帮助？

如果遇到问题：
1. 📖 查看详细指南：[SETUP_SECRETS_GUIDE.md](./SETUP_SECRETS_GUIDE.md)
2. 🐛 创建 Issue：描述具体错误信息
3. 📧 邮件联系：m18680602188@163.com

## 🎉 设置完成！

成功后你将看到：
- ✅ GitHub Actions 运行成功
- ✅ npm 包自动发布
- ✅ GitHub Release 自动创建

现在只需要 `git push` 就能自动发布新版本！