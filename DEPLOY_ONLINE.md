# 🌐 在线部署指南

## 方式一：Vercel 部署（推荐，最快）

### 1. 准备工作

确保你已经：
- ✅ 将代码推送到 GitHub
- ✅ 拥有 Vercel 账号（免费）

### 2. 一键部署

#### 方法 A：通过 GitHub 导入（推荐）

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库：`Drinkwater0922/hardware_insight`
4. 配置设置：
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: cd frontend && npm install && npm run build
   Output Directory: frontend/dist
   ```
5. 点击 "Deploy"

#### 方法 B：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 在项目根目录运行
cd /home/user/hardware_insight
vercel

# 按提示操作：
# - 选择你的 Vercel 账号
# - 选择项目名称
# - 自动部署
```

### 3. 访问 Demo

部署完成后，你会得到一个链接，类似：
```
https://hardware-insight-xxx.vercel.app
```

首次开机体验的完整链接：
```
https://hardware-insight-xxx.vercel.app/first-launch
```

---

## 方式二：Netlify 部署

### 1. 通过 Netlify Drop

1. 在本地构建：
   ```bash
   cd frontend
   npm run build
   ```

2. 访问 [Netlify Drop](https://app.netlify.com/drop)
3. 将 `frontend/dist` 文件夹拖拽上传
4. 获得即时链接

### 2. 通过 GitHub 自动部署

1. 访问 [Netlify](https://app.netlify.com)
2. 点击 "New site from Git"
3. 连接你的 GitHub 仓库
4. 配置：
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
5. 部署

---

## 方式三：GitHub Pages

### 1. 修改构建配置

在 `frontend/vite.config.ts` 中添加 base 路径：

```typescript
export default defineConfig({
  base: '/hardware_insight/',
  plugins: [react()],
  // ...
})
```

### 2. 构建并部署

```bash
cd frontend
npm run build

# 部署到 gh-pages 分支
npx gh-pages -d dist
```

### 3. 配置 GitHub Pages

1. 在 GitHub 仓库设置中
2. 找到 "Pages" 设置
3. 选择 "gh-pages" 分支
4. 保存

访问链接：
```
https://drinkwater0922.github.io/hardware_insight/first-launch
```

---

## 快速链接模板

部署完成后，你可以使用以下模板分享：

### 演示邀请

```
🚀 StepFun AI OS 首次开机体验 Demo

我为「灵感趋势×用户记忆×创作」三卡片联动系统做了一个可交互的 demo。

📱 在线体验：[你的部署链接]

💡 体验指南：
1. 填写兴趣问卷（建议选：旅行vlog + 美食探店）
2. 查看灵感推荐如何个性化
3. 完成创作任务，观察记忆积累
4. 切换 Day 0/1/3/7 查看系统演变

⏱️ 预计体验时间：5 分钟

期待你的反馈！
```

---

## 推荐部署平台对比

| 平台 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Vercel** | • 最快部署<br>• 自动 HTTPS<br>• CDN 加速<br>• GitHub 集成 | - 国内访问可能较慢 | ⭐⭐⭐⭐⭐ |
| **Netlify** | • 简单易用<br>• 拖拽上传<br>• 自定义域名 | - 构建时间稍长 | ⭐⭐⭐⭐ |
| **GitHub Pages** | • 完全免费<br>• 稳定可靠 | - 需要修改配置<br>- 部署稍复杂 | ⭐⭐⭐ |

---

## 常见问题

### Q: 部署后页面空白？
A: 检查路由配置，确保使用了 BrowserRouter 而不是 HashRouter

### Q: 样式丢失？
A: 确保 `vite.config.ts` 中的 `base` 路径正确

### Q: 首次开机体验页面 404？
A: 确保配置了路由重写规则（Vercel 已在 vercel.json 中配置）

### Q: 数据不持久化？
A: 这是正常的，demo 使用 localStorage，清除浏览器缓存会重置

---

## 下一步

部署完成后：

1. ✅ 测试所有功能是否正常
2. ✅ 分享链接给团队/投资人
3. ✅ 收集反馈并迭代

需要帮助？联系 Drinkwater0922
