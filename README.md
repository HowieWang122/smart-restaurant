# Smart Restaurant Integrated System

An integrated smart restaurant system combining barcode scanning, person detection, and order management.

## 🎯 System Overview

This system integrates three independent projects into a complete smart restaurant solution:

1. **Barcode Scanning System** - PyQt5-based barcode/QR code scanner
2. **Person Detection System** - OpenCV-based face detection welcome system
3. **Order Management System** - React + Node.js restaurant ordering system

## 🚀 Quick Start

### Method 1: Using the Startup Script (Recommended)

```bash
# Give execute permission to the startup script
chmod +x start_integrated_system.sh

# Start the entire system
./start_integrated_system.sh
```

### Method 2: Manual Startup

1. **Install Dependencies**
   ```bash
   # Python dependencies
   pip3 install PyQt5 opencv-python pyzbar numpy requests
   
   # Node.js dependencies
   cd restaurant-ordering/backend && npm install
   cd ../frontend && npm install
   ```

2. **Start Backend**
   ```bash
   cd restaurant-ordering/backend
   npm start
   ```

3. **Start Frontend**
   ```bash
   cd restaurant-ordering/frontend
   npm start
   ```

4. **Start Integrated System**
   ```bash
   python3 integrated_system.py
   ```

## 📱 System Access

After startup, you can access the systems through:

- **Integrated System Interface**: PyQt5 desktop application window
- **Order System Frontend**: http://localhost:3000
- **Order System Backend**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3001/admin

## 🔑 Test Accounts

The system comes with pre-configured test accounts:

| User Type | Username | Password | Barcode ID |
|-----------|----------|----------|------------|
| Regular User | test_user | kristy | 123456789 |
| Administrator | admin | kristy | admin_barcode |

## 🎮 Usage Flow

### 1. Person Detection Process
1. Click "Start Person Detection" in the integrated system interface
2. When a person is detected, the system automatically plays a welcome sound
3. Detection results are displayed in the system log

### 2. Barcode Login Process
1. Click "Start Barcode Scanning" in the integrated system interface
2. Scan the user's barcode (e.g., 123456789)
3. The system automatically finds the user and logs them in
4. Automatically opens the order system webpage

### 3. Order Management Process
1. Browse the menu in the order system
2. Select dishes and add to cart
3. Complete order payment
4. Administrators can view orders in the backend

## 🏗️ System Architecture

```
Smart Restaurant Integrated System
├── Integrated Control Centre (integrated_system.py)
│   ├── Person Detection Module
│   ├── Barcode Scanning Module
│   └── Order System API Interface
├── Order Management System (restaurant-ordering/)
│   ├── Frontend (React + TypeScript)
│   └── Backend (Node.js + Express)
├── Barcode Scanning System (barcode-reader/)
└── Person Detection System (welcome_system/)
```

## 🔧 Tech Stack

### Integrated System
- **Python 3.7+**
- **PyQt5** - Desktop application interface
- **OpenCV** - Image processing and camera control
- **pyzbar** - Barcode recognition
- **requests** - HTTP API calls

### Order System
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, JWT authentication
- **Data Storage**: JSON files (expandable to database)

### Person Detection
- **OpenCV** - Face detection
- **Haar Cascade Classifier** - Face recognition algorithm

## 📋 Features

### Integrated System Features
- ✅ Unified control interface
- ✅ Real-time person detection
- ✅ Barcode/QR code scanning
- ✅ Automatic user recognition
- ✅ System status monitoring
- ✅ Operation logging
- ✅ Welcome sound playback

### Order System Features
- ✅ User registration/login
- ✅ Category-based menu browsing
- ✅ Shopping cart management
- ✅ Order submission
- ✅ Heart value system
- ✅ Exclusive discounts
- ✅ Admin dashboard

### Barcode System Features
- ✅ Real-time camera scanning
- ✅ Image file reading
- ✅ Multi-format support
- ✅ Scan result recording

### Person Detection Features
- ✅ Real-time face detection
- ✅ Automatic welcome sound
- ✅ Detection cooldown mechanism
- ✅ Visual interface

## 🛠️ Development Guide

### Adding New Users
1. Edit `restaurant-ordering/backend/data/users.json`
2. Add user information including `barcodeId` field
3. Restart backend service

### Custom Barcodes
1. Generate barcode images (containing user ID or username)
2. Test scanning in the integrated system
3. Ensure barcode data matches user data

### Feature Extensions
- Add database support (MySQL/PostgreSQL)
- Integrate payment system
- Add inventory management
- Implement membership points system
- Add voice recognition functionality

## 🐛 Troubleshooting

### Common Issues

1. **Camera Won't Start**
   - Check camera permissions
   - Ensure camera isn't being used by other programmes
   - Try different camera indices

2. **Barcode Not Recognised**
   - Ensure barcode is clearly visible
   - Adjust camera distance and angle
   - Check if barcode format is supported

3. **Order System Not Accessible**
   - Check if ports are occupied
   - Confirm Node.js services are started
   - View console error messages

4. **Dependency Installation Failed**
   - Update pip: `pip3 install --upgrade pip`
   - Use domestic mirrors: `pip3 install -i https://pypi.tuna.tsinghua.edu.cn/simple/`
   - Check Python version compatibility

### Debug Mode

Add debug information when starting:
```bash
# Enable detailed logging
DEBUG=1 python3 integrated_system.py
```

## 📄 Licence

This project uses the MIT Licence.

## 🤝 Contributing

Welcome to submit issue reports and feature suggestions!

## 📞 Support

If you have questions, please check:
1. Troubleshooting section
2. README documents for each sub-project
3. Submit issues to the project repository 

## ☁️ Free Cloud Deployment (Render + GitHub)

You can host the backend API and React frontend on [Render](https://render.com/) for free, while keeping the PyQt 集成端在本地运行。流程如下：

1. **Push this repo to GitHub**  
   ```bash
   git init
   git remote add origin https://github.com/<your-account>/smart-restaurant.git
   git add .
   git commit -m "Initial import"
   git push -u origin main
   ```

2. **Render 一键部署**  
   - Fork/clone 仓库后，访问 `https://render.com/deploy?repo=https://github.com/<your-account>/smart-restaurant`.
   - Render 会读取根目录的 `render.yaml`，自动创建两个免费服务：
     - `smart-restaurant-backend`：Node.js Web Service（自动生成 `JWT_SECRET`，数据写在容器本地目录，免费方案会在实例重启时清空，如需持久化可升级付费磁盘或接云数据库）。
     - `smart-restaurant-frontend`：Static Site（构建 React）。
   - 首次部署需要 5~10 分钟，完成后 Render 会给出公共访问链接（例如 `https://smart-restaurant-frontend.onrender.com`）。
   - 前端部署完成后，到 Render Console → Frontend Service → Environment 手动添加 `REACT_APP_API_URL = https://<backend-service-host>`，再触发 “Deploy latest commit” 以加载正确的 API 地址。

3. **本地 PyQt 集成端**  
   - `integrated_system.py` 仍需在有摄像头的本地设备上运行，建议将 Render 后端 URL、前端 URL 填写到内部配置或说明文档中，便于现场演示。

4. **CI/CD**  
   - 每次向 GitHub `main` 推送代码，Render 会自动重新构建前端与后端，无需手动发布。

> 提示：Render 免费实例会在 15 分钟无访问后休眠，首次唤醒可能需要 30~60 秒；同时免费方案不提供持久磁盘，实例重启后 JSON 数据会重置。如需长期保存数据，建议升级付费磁盘或接云数据库。