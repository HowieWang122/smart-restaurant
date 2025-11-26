# 部署指南 - Kristy专属大饭店

## 快速部署方案

### 方案1：使用 Vercel（推荐）

1. **安装 Vercel CLI**
   ```bash
   npx vercel
   ```

2. **部署前端**
   ```bash
   cd frontend
   npm run build
   npx vercel --yes
   ```

3. **部署后端到 Render**
   - 访问 https://render.com
   - 创建新的 Web Service
   - 连接你的 GitHub 仓库
   - 设置构建命令：`npm install`
   - 设置启动命令：`npm start`
   - 等待部署完成

### 方案2：使用 Netlify + Railway

1. **部署前端到 Netlify**
   ```bash
   cd frontend
   npm run build
   npx netlify deploy --dir=build --prod
   ```

2. **部署后端到 Railway**
   - 访问 https://railway.app
   - 创建新项目
   - 从 GitHub 导入
   - Railway 会自动检测并部署

### 方案3：临时分享（适合测试）

使用 ngrok 或 localtunnel：

```bash
# 启动后端
cd backend && npm start

# 在新终端启动前端
cd frontend && npm start

# 在新终端暴露后端
npx localtunnel --port 3001

# 在新终端暴露前端
npx localtunnel --port 3000
```

## 注意事项

1. 部署后需要更新前端的 API 地址
2. 确保后端的 CORS 设置允许前端域名访问
3. 生产环境建议使用环境变量管理敏感信息

## 环境变量配置

前端 `.env.production`:
```
REACT_APP_API_URL=https://your-backend-url.com
```

后端环境变量：
```
PORT=3001
NODE_ENV=production
``` 