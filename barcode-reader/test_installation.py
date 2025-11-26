#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
安装测试脚本
验证所有依赖包是否正确安装
"""

def test_imports():
    """测试所有必需的包导入"""
    print("正在测试依赖包...")
    
    try:
        import sys
        print(f"✓ Python版本: {sys.version}")
        
        import cv2
        print(f"✓ OpenCV版本: {cv2.__version__}")
        
        import numpy as np
        print(f"✓ NumPy版本: {np.__version__}")
        
        import tkinter as tk
        print("✓ Tkinter已安装 (Python内置)")
        
        from pyzbar import pyzbar
        print("✓ pyzbar已安装")
        
        from PIL import Image
        print("✓ Pillow已安装")
        
        print("\n🎉 所有依赖包安装成功！")
        print("条形码读取器可以正常运行。")
        return True
        
    except ImportError as e:
        print(f"❌ 导入错误: {e}")
        print("请运行以下命令安装缺失的包:")
        print("pip3 install -r requirements_latest.txt")
        return False
    except Exception as e:
        print(f"❌ 未知错误: {e}")
        return False

def test_camera():
    """测试摄像头是否可用"""
    print("\n正在测试摄像头...")
    
    try:
        import cv2
        camera = cv2.VideoCapture(0)
        
        if camera.isOpened():
            print("✓ 摄像头可以正常打开")
            ret, frame = camera.read()
            if ret:
                print("✓ 摄像头可以正常读取图像")
                print(f"  图像尺寸: {frame.shape[1]}x{frame.shape[0]}")
            else:
                print("⚠ 摄像头无法读取图像")
            camera.release()
        else:
            print("❌ 无法打开摄像头")
            print("请检查摄像头是否被其他程序占用")
            
    except Exception as e:
        print(f"❌ 摄像头测试失败: {e}")

def test_barcode_detection():
    """测试条形码检测功能"""
    print("\n正在测试条形码检测...")
    
    try:
        import cv2
        import numpy as np
        from pyzbar import pyzbar
        
        # 创建一个简单的测试图像
        test_image = np.ones((100, 300, 3), dtype=np.uint8) * 255
        
        # 尝试检测条形码
        barcodes = pyzbar.decode(test_image)
        print("✓ 条形码检测模块工作正常")
        
    except Exception as e:
        print(f"❌ 条形码检测测试失败: {e}")

def main():
    """主函数"""
    print("=" * 50)
    print("条形码读取器 - 安装测试")
    print("=" * 50)
    
    # 测试依赖包
    if test_imports():
        # 测试摄像头
        test_camera()
        
        # 测试条形码检测
        test_barcode_detection()
        
        print("\n" + "=" * 50)
        print("测试完成！")
        print("如果所有测试都通过，可以运行以下命令启动程序:")
        print("python3 barcode_reader_tkinter.py")
        print("或者:")
        print("./run.sh")
        print("=" * 50)
    else:
        print("\n❌ 测试失败，请先解决依赖包问题")

if __name__ == "__main__":
    main() 