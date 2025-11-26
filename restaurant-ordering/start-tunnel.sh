#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 正在启动Kristy专属大饭店订餐系统...${NC}"

# 检查是否安装了 localtunnel
if ! command -v lt &> /dev/null; then
    echo -e "${YELLOW}⚠️  未检测到 localtunnel，正在安装...${NC}"
    npm install -g localtunnel
fi

# 启动后端服务
echo -e "${GREEN}📦 启动后端服务 (端口 3001)...${NC}"
cd backend
npm install
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端服务
echo -e "${GREEN}🎨 启动前端服务 (端口 3000)...${NC}"
cd ../frontend
npm install
npm start &
FRONTEND_PID=$!

# 等待前端启动
sleep 5

# 启动 localtunnel
echo -e "${GREEN}🌐 启动 localtunnel 隧道...${NC}"
lt --port 3001 --subdomain restaurant-api &
TUNNEL_PID=$!

# 等待隧道建立
sleep 3

echo -e "${GREEN}✅ 系统启动完成！${NC}"
echo -e "${YELLOW}📱 后端 API 地址: https://restaurant-api.loca.lt${NC}"
echo -e "${YELLOW}💻 前端本地地址: http://localhost:3000${NC}"
echo -e "${YELLOW}⚠️  注意: 访问时可能需要输入验证码${NC}"
echo ""
echo -e "${GREEN}按 Ctrl+C 停止所有服务${NC}"

# 捕获 Ctrl+C 信号
trap 'echo -e "\n${YELLOW}正在停止所有服务...${NC}"; kill $BACKEND_PID $FRONTEND_PID $TUNNEL_PID 2>/dev/null; exit' INT

# 保持脚本运行
wait 