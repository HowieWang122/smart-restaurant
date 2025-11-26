#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 正在启动Kristy专属大饭店订餐系统 (完整版)...${NC}"

# 检查是否安装了 localtunnel
if ! command -v lt &> /dev/null; then
    echo -e "${YELLOW}⚠️  未检测到 localtunnel，正在安装...${NC}"
    npm install -g localtunnel
fi

# 清理之前的进程
echo -e "${YELLOW}🧹 清理之前的进程...${NC}"
pkill -f "node.*server.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
pkill -f "localtunnel" 2>/dev/null

# 启动后端服务
echo -e "${GREEN}📦 启动后端服务 (端口 3001)...${NC}"
cd backend
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动 localtunnel 为后端
echo -e "${GREEN}🌐 为后端启动 localtunnel 隧道...${NC}"
lt --port 3001 > /tmp/backend-tunnel.log 2>&1 &
BACKEND_TUNNEL_PID=$!

# 等待隧道建立并获取 URL
sleep 5
BACKEND_URL=$(grep -o 'https://[^ ]*' /tmp/backend-tunnel.log | head -1)

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ 无法获取后端隧道 URL${NC}"
    echo -e "${YELLOW}请手动运行: lt --port 3001${NC}"
    BACKEND_URL="http://localhost:3001"
fi

# 启动前端服务，使用获取到的后端 URL
echo -e "${GREEN}🎨 启动前端服务 (端口 3000)...${NC}"
cd ../frontend
REACT_APP_API_URL=$BACKEND_URL npm start &
FRONTEND_PID=$!

# 等待前端启动
sleep 8

# 启动 localtunnel 为前端
echo -e "${GREEN}🌐 为前端启动 localtunnel 隧道...${NC}"
lt --port 3000 > /tmp/frontend-tunnel.log 2>&1 &
FRONTEND_TUNNEL_PID=$!

# 等待隧道建立并获取 URL
sleep 5
FRONTEND_URL=$(grep -o 'https://[^ ]*' /tmp/frontend-tunnel.log | head -1)

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ 无法获取前端隧道 URL${NC}"
    echo -e "${YELLOW}请手动运行: lt --port 3000${NC}"
    FRONTEND_URL="http://localhost:3000"
fi

echo -e "${GREEN}✅ 系统启动完成！${NC}"
echo ""
echo -e "${BLUE}==== 本地访问 ====${NC}"
echo -e "前端: http://localhost:3000"
echo -e "后端: http://localhost:3001"
echo ""
echo -e "${BLUE}==== 远程访问 (分享给其他人) ====${NC}"
echo -e "前端: ${YELLOW}$FRONTEND_URL${NC}"
echo -e "后端 API: ${YELLOW}$BACKEND_URL${NC}"
echo ""
echo -e "${RED}⚠️  注意事项:${NC}"
echo -e "1. localtunnel 访问时需要输入验证码"
echo -e "2. 如果连接断开，请重新运行脚本"
echo -e "3. 免费服务可能会有速度限制"
echo ""
echo -e "${GREEN}按 Ctrl+C 停止所有服务${NC}"

# 创建一个简单的 HTML 文件，方便分享
cat > share-info.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Kristy专属大饭店访问信息</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .url-box { background: #f0f0f0; padding: 15px; margin: 10px 0; border-radius: 5px; word-break: break-all; }
        .note { color: #ff6b6b; margin-top: 20px; }
        a { color: #4285f4; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍽️ Kristy专属大饭店</h1>
        <h2>访问地址</h2>
        <div class="url-box">
            <strong>点餐系统:</strong><br>
            <a href="$FRONTEND_URL" target="_blank">$FRONTEND_URL</a>
        </div>
        <div class="url-box">
            <strong>API 地址:</strong><br>
            <a href="$BACKEND_URL" target="_blank">$BACKEND_URL</a>
        </div>
        <div class="note">
            <strong>⚠️ 注意:</strong><br>
            - 首次访问需要输入验证码<br>
            - 验证码会显示在网页上<br>
            - 输入验证码后即可正常使用
        </div>
    </div>
</body>
</html>
EOF

echo -e "${GREEN}📄 已生成分享信息文件: share-info.html${NC}"

# 捕获 Ctrl+C 信号
trap 'echo -e "\n${YELLOW}正在停止所有服务...${NC}"; kill $BACKEND_PID $FRONTEND_PID $BACKEND_TUNNEL_PID $FRONTEND_TUNNEL_PID 2>/dev/null; rm -f /tmp/*-tunnel.log share-info.html; exit' INT

# 保持脚本运行
wait 