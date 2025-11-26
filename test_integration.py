#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Integrated System Test Script
Used to verify basic functionality of each module
"""

import sys
import os
import time
import requests
import subprocess
from typing import Dict, List

def test_python_dependencies():
    """Test Python dependencies"""
    print("🔍 Testing Python dependencies...")
    
    dependencies = [
        ('cv2', 'opencv-python'),
        ('numpy', 'numpy'),
        ('PyQt5', 'PyQt5'),
        ('pyzbar', 'pyzbar'),
        ('requests', 'requests'),
        ('PIL', 'Pillow')
    ]
    
    missing_deps = []
    for module, package in dependencies:
        try:
            __import__(module)
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} - Not installed")
            missing_deps.append(package)
    
    if missing_deps:
        print(f"\n📦 Please install missing dependencies:")
        print(f"pip3 install {' '.join(missing_deps)}")
        return False
    
    print("✅ All Python dependencies are installed")
    return True

def test_node_dependencies():
    """Test Node.js dependencies"""
    print("\n🔍 Testing Node.js dependencies...")
    
    # Check backend dependencies
    backend_path = "restaurant-ordering/backend"
    if os.path.exists(os.path.join(backend_path, "package.json")):
        if os.path.exists(os.path.join(backend_path, "node_modules")):
            print(f"  ✅ Backend dependencies installed")
        else:
            print(f"  ❌ Backend dependencies not installed")
            print(f"     Run: cd {backend_path} && npm install")
            return False
    else:
        print(f"  ❌ Backend package.json not found")
        return False
    
    # Check frontend dependencies
    frontend_path = "restaurant-ordering/frontend"
    if os.path.exists(os.path.join(frontend_path, "package.json")):
        if os.path.exists(os.path.join(frontend_path, "node_modules")):
            print(f"  ✅ Frontend dependencies installed")
        else:
            print(f"  ❌ Frontend dependencies not installed")
            print(f"     Run: cd {frontend_path} && npm install")
            return False
    else:
        print(f"  ❌ Frontend package.json not found")
        return False
    
    print("✅ All Node.js dependencies are installed")
    return True

def test_camera_access():
    """Test camera access"""
    print("\n🔍 Testing camera access...")
    
    try:
        import cv2
        
        # Try main camera
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            print("  ✅ Main camera accessible")
            cap.release()
        else:
            print("  ❌ Main camera not accessible")
            return False
            
    except Exception as e:
        print(f"  ❌ Camera test failed: {e}")
        return False
    
    return True

def test_barcode_generation():
    """Test barcode generation function"""
    print("\n🔍 Testing barcode generation...")
    
    if os.path.exists("generate_barcodes.py"):
        print("  ✅ Barcode generation script exists")
        # Test if it can be imported
        try:
            result = subprocess.run([sys.executable, "generate_barcodes.py"], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print("  ✅ Barcode generation successful")
                return True
            else:
                print("  ❌ Barcode generation failed")
                return False
        except Exception as e:
            print(f"  ❌ Barcode generation error: {e}")
            return False
    else:
        print("  ❌ generate_barcodes.py not found")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    print("\n🔍 Testing API endpoints...")
    
    base_url = "http://localhost:3001"
    
    # Check if backend is running
    try:
        response = requests.get(f"{base_url}/api/health", timeout=2)
        if response.status_code == 200:
            print("  ✅ Backend API is running")
        else:
            print(f"  ❌ Backend API returned error: {response.status_code}")
            print("     Please start the backend server")
            return False
    except requests.exceptions.ConnectionError:
        print("  ⚠️  Backend API not running")
        print("     This is normal if the system hasn't been started yet")
        return True
    except Exception as e:
        print(f"  ❌ API test error: {e}")
        return False
    
    return True

def test_file_structure():
    """Test file structure"""
    print("\n🔍 Testing file structure...")
    
    required_files = [
        "integrated_system.py",
        "start_integrated_system.sh",
        "requirements.txt",
        "README.md",
        "restaurant-ordering/backend/package.json",
        "restaurant-ordering/frontend/package.json",
        "barcode-reader/barcode_reader.py",
        "welcome_system/welcome_system.py"
    ]
    
    missing_files = []
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"  ✅ {file_path}")
        else:
            print(f"  ❌ {file_path} - File not found")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n⚠️  Missing files: {', '.join(missing_files)}")
        return False
    
    return True

def generate_test_barcodes():
    """Generate test barcodes"""
    print("\n🔍 Generating test barcodes...")
    
    try:
        result = subprocess.run([sys.executable, "generate_barcodes.py"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("  ✅ Test barcodes generated successfully")
            return True
        else:
            print(f"  ❌ Barcode generation failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"  ❌ Barcode generation error: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Smart Restaurant Integrated System Test")
    print("=" * 50)
    
    tests = [
        ("File Structure", test_file_structure),
        ("Python Dependencies", test_python_dependencies),
        ("Node.js Dependencies", test_node_dependencies),
        ("Camera Access", test_camera_access),
        ("Barcode Functionality", test_barcode_generation),
        ("API Endpoints", test_api_endpoints),
        ("Test Barcode Generation", generate_test_barcodes)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"  ❌ {test_name} test exception: {e}")
            results.append((test_name, False))
    
    # Display test results
    print("\n📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ Pass" if result else "❌ Fail"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! The system is ready to run.")
        print("\n🚀 Start the system:")
        print("   ./start_integrated_system.sh")
    else:
        print(f"\n⚠️  {total - passed} tests failed, please check the relevant configuration.")
        print("\n💡 Suggestions:")
        print("   1. Install missing dependencies")
        print("   2. Check camera permissions")
        print("   3. Start backend service")
        print("   4. Re-run tests")

if __name__ == "__main__":
    main() 