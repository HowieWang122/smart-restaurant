#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 正在启动Kristy专属大饭店订餐系统 (ngrok 版本)...${NC}"

# 检查是否安装了 ngrok
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}⚠️  未检测到 ngrok，请先安装 ngrok${NC}"
    echo -e "${BLUE}📥 安装方法:${NC}"
    echo "1. 访问 https://ngrok.com/download"
    echo "2. 下载对应版本"
    echo "3. 解压并移动到 /usr/local/bin"
    echo "   或者使用 Homebrew: brew install ngrok"
    exit 1
fi

# 启动后端服务
echo -e "${GREEN}📦 启动后端服务 (端口 3001)...${NC}"
cd backend
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端服务，使用环境变量设置 API 地址
echo -e "${GREEN}🎨 启动前端服务 (端口 3000)...${NC}"
cd ../frontend

# 启动 ngrok 并获取公开 URL
echo -e "${GREEN}🌐 启动 ngrok 隧道...${NC}"
ngrok http 3001 --log=stdout > /tmp/ngrok.log &
NGROK_PID=$!

# 等待 ngrok 启动并获取 URL
sleep 5
NGROK_URL=$(curl -s localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo -e "${YELLOW}⚠️  无法获取 ngrok URL，请检查 ngrok 是否正常运行${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 使用获取到的 ngrok URL 启动前端
REACT_APP_API_URL=$NGROK_URL npm start &
FRONTEND_PID=$!

# 等待前端启动
sleep 5

echo -e "${GREEN}✅ 系统启动完成！${NC}"
echo -e "${YELLOW}📱 后端 API 公开地址: $NGROK_URL${NC}"
echo -e "${YELLOW}💻 前端本地地址: http://localhost:3000${NC}"
echo -e "${YELLOW}🌐 ngrok 监控面板: http://localhost:4040${NC}"
echo ""
echo -e "${GREEN}您可以将以下地址分享给其他人:${NC}"
echo -e "${BLUE}前端访问地址: http://localhost:3000${NC}"
echo -e "${BLUE}API 地址: $NGROK_URL${NC}"
echo ""
echo -e "${GREEN}按 Ctrl+C 停止所有服务${NC}"

# 捕获 Ctrl+C 信号
trap 'echo -e "\n${YELLOW}正在停止所有服务...${NC}"; kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null; rm -f /tmp/ngrok.log; exit' INT

# 保持脚本运行
wait 