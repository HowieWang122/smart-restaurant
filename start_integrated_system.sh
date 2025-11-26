#!/bin/bash

# Smart Restaurant Integrated System Startup Script
# Integrating barcode scanning, person detection, and order management systems

echo "🚀 Starting Smart Restaurant Integrated System..."

# Check Python dependencies
echo "📦 Checking Python dependencies..."
python3 -c "import cv2, numpy, PyQt5, pyzbar, requests" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Missing required Python dependencies"
    echo "Please run: pip3 install PyQt5 opencv-python pyzbar numpy requests"
    exit 1
fi

# Check Node.js dependencies
echo "📦 Checking Node.js dependencies..."
if [ ! -d "restaurant-ordering/backend/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd restaurant-ordering/backend
    npm install
    cd ../..
fi

if [ ! -d "restaurant-ordering/frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd restaurant-ordering/frontend
    npm install
    cd ../..
fi

# Create test user data (if not exists)
echo "👥 Initialising user data..."
if [ ! -f "restaurant-ordering/backend/data/users.json" ]; then
    mkdir -p restaurant-ordering/backend/data
    cat > restaurant-ordering/backend/data/users.json << 'EOF'
[
  {
    "id": "test_user_001",
    "username": "test_user",
    "password": "$2a$10$fYlFD.0kK8ddFLZ7Hf7N3e5/Aasljwg03PWOoHlHLwCVA7AP2Hvwm",
    "isAdmin": false,
    "heartValue": 100,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "barcodeId": "123456789"
  },
  {
    "id": "admin_001",
    "username": "admin",
    "password": "$2a$10$fYlFD.0kK8ddFLZ7Hf7N3e5/Aasljwg03PWOoHlHLwCVA7AP2Hvwm",
    "isAdmin": true,
    "heartValue": 9999,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "barcodeId": "admin_barcode"
  }
]
EOF
    echo "✅ User data initialised"
fi

# Start backend server
echo "🔧 Starting backend server..."
cd restaurant-ordering/backend
npm start &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
echo "⏳ Waiting for backend server to start..."
sleep 5

# Start frontend server
echo "🎨 Starting frontend server..."
cd restaurant-ordering/frontend
npm start &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to start
echo "⏳ Waiting for frontend server to start..."
sleep 10

# Start integrated system
echo "🎯 Starting integrated system..."
python3 integrated_system.py &
INTEGRATED_PID=$!

echo ""
echo "🎉 Smart Restaurant Integrated System has started!"
echo ""
echo "📱 System Access Addresses:"
echo "   - Integrated System Interface: Started (PyQt5 window)"
echo "   - Order System Frontend: http://localhost:3000"
echo "   - Order System Backend: http://localhost:3001"
echo "   - Admin Dashboard: http://localhost:3001/admin"
echo ""
echo "🔑 Test Accounts:"
echo "   - Regular User: test_user / kristy"
echo "   - Administrator: admin / kristy"
echo "   - Test Barcode: 123456789"
echo ""
echo "📋 Usage Instructions:"
echo "   1. Start person detection and barcode scanning in the integrated system interface"
echo "   2. When a visitor is detected, a welcome sound will play"
echo "   3. Scanning a barcode will automatically find the user and open the order system"
echo "   4. You can place orders, make payments, and other operations in the order system"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID $INTEGRATED_PID 2>/dev/null; exit 0' INT

# Keep script running
wait 