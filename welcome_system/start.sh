#!/bin/bash

# 入门欢迎系统启动脚本

echo "=== 入门欢迎系统 ==="
echo "正在启动系统..."

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误：未找到Python3，请先安装Python3"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "welcome_system.py" ]; then
    echo "错误：请在项目目录中运行此脚本"
    exit 1
fi

# 检查依赖是否安装
echo "检查依赖包..."
python3 -c "import cv2, pygame, numpy" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "正在安装依赖包..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "错误：依赖包安装失败"
        exit 1
    fi
fi

echo "依赖检查完成"
echo "启动欢迎系统..."
echo "按 'q' 键退出系统"
echo ""

# 运行主程序
python3 welcome_system.py 