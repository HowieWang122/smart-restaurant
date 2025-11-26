#!/bin/bash

# 条形码读取器启动脚本

echo "正在启动条形码读取器..."

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 检查依赖包是否安装
echo "检查依赖包..."
python3 -c "import PyQt5, cv2, pyzbar, PIL, numpy" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "正在安装依赖包..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "错误: 依赖包安装失败，请手动运行: pip3 install -r requirements.txt"
        exit 1
    fi
fi

# 启动程序
echo "启动程序..."
python3 barcode_reader.py 