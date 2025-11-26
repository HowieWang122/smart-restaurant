# 远程访问配置说明

本文档介绍如何让其他终端/设备访问您的Kristy专属大饭店订餐系统。所有方案都是**免费**的。

## 方案一：使用 Localtunnel（推荐）

### 快速开始

```bash
# 运行完整版脚本（同时暴露前端和后端）
./start-tunnel-full.sh
```

### 手动步骤

1. **安装 localtunnel**
   ```bash
   npm install -g localtunnel
   ```

2. **启动后端服务**
   ```bash
   cd backend
   npm start
   ```

3. **在新终端中为后端创建隧道**
   ```bash
   lt --port 3001
   # 会得到类似 https://xxx.loca.lt 的地址
   ```

4. **启动前端服务**（使用上一步获得的后端地址）
   ```bash
   cd frontend
   REACT_APP_API_URL=https://xxx.loca.lt npm start
   ```

5. **在新终端中为前端创建隧道**（可选）
   ```bash
   lt --port 3000
   ```

### 特点
- ✅ 完全免费
- ✅ 无需注册
- ⚠️ 首次访问需要输入验证码（显示在网页上）
- ⚠️ 连接可能不稳定，需要重新建立

## 方案二：使用 Ngrok

### 安装 ngrok

**macOS (使用 Homebrew)**
```bash
brew install ngrok
```

**其他系统**
1. 访问 https://ngrok.com/download
2. 下载对应版本
3. 解压并添加到 PATH

### 使用方法

```bash
# 运行 ngrok 版本的脚本
./start-ngrok.sh
```

### 特点
- ✅ 免费版本足够使用
- ✅ 相对稳定
- ⚠️ 免费版有并发连接限制
- ⚠️ 需要注册账号（可选）

## 方案三：简单的局域网访问

如果只需要在同一局域网（WiFi）下访问：

1. **查看本机 IP 地址**
   ```bash
   # macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **修改前端配置**
   编辑 `frontend/src/config.js`，将 API_URL 改为您的局域网 IP：
   ```javascript
   API_URL: 'http://192.168.x.x:3001'
   ```

3. **启动服务**
   ```bash
   # 后端
   cd backend && npm start
   
   # 前端
   cd frontend && npm start
   ```

4. **其他设备访问**
   在同一 WiFi 下的设备访问：`http://192.168.x.x:3000`

## 常见问题

### Q: localtunnel 连接断开怎么办？
A: 重新运行脚本或手动执行 `lt --port 端口号` 命令。

### Q: 如何固定 localtunnel 的子域名？
A: 使用 `--subdomain` 参数：
```bash
lt --port 3001 --subdomain myrestaurant
```

### Q: 前端无法连接后端？
A: 确保：
1. 后端服务正在运行
2. 前端使用了正确的 API_URL（通过环境变量或配置文件）
3. 隧道服务正常工作

### Q: 访问速度很慢？
A: 这是免费隧道服务的限制。如需更好的性能，考虑：
- 使用付费版本的 ngrok
- 部署到云服务（如 Vercel、Netlify）
- 使用自己的服务器

## 安全提示

⚠️ **注意**：通过隧道暴露的服务是公开的，任何人都可以访问。建议：
- 仅在需要时开启
- 不要在生产环境使用
- 及时关闭不需要的隧道 