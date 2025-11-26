#!/bin/bash

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 启动Kristy专属大饭店订餐系统 (局域网模式)...${NC}"

# 获取本机IP地址
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ifconfig | grep -E "inet.*broadcast|inet.*netmask" | grep -v 127.0.0.1 | head -1 | awk '{print $2}'
    else
        # Linux
        hostname -I | awk '{print $1}'
    fi
}

LOCAL_IP=$(get_local_ip)

if [ -z "$LOCAL_IP" ]; then
    echo -e "${RED}❌ 无法获取本机IP地址${NC}"
    exit 1
fi

echo -e "${BLUE}🌐 检测到本机IP地址: ${LOCAL_IP}${NC}"

# 停止现有进程
echo -e "${YELLOW}🔄 停止现有服务...${NC}"
pkill -f "node.*server.js" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
sleep 2

# 启动后端服务
echo -e "${GREEN}📦 启动后端服务...${NC}"
cd backend
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端服务
echo -e "${GREEN}🎨 启动前端服务...${NC}"
cd ../frontend
npm start &
FRONTEND_PID=$!

# 等待前端启动
sleep 5

echo -e "${GREEN}✅ 系统启动完成！${NC}"
echo ""
echo -e "${YELLOW}📱 访问地址:${NC}"
echo -e "${BLUE}   本机访问: http://localhost:3000${NC}"
echo -e "${BLUE}   局域网访问: http://${LOCAL_IP}:3000${NC}"
echo -e "${BLUE}   管理后台: http://${LOCAL_IP}:3001/admin/${NC}"
echo ""
echo -e "${YELLOW}📋 使用说明:${NC}"
echo -e "   • 在同一局域网内的其他设备可通过局域网地址访问"
echo -e "   • 手机、平板、其他电脑都可以直接打开上述网址"
echo -e "   • 默认管理员账号: admin / kristy"
echo ""
echo -e "${GREEN}按 Ctrl+C 停止所有服务${NC}"

# 捕获 Ctrl+C 信号
trap 'echo -e "\n${YELLOW}正在停止所有服务...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

# 保持脚本运行
wait 