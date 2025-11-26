#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Integrated System - Linking barcode scanning, person detection, and order management
"""

import sys
import os
import json
import time
import threading
import subprocess
import requests
from datetime import datetime
from typing import Dict, List, Optional

# Add project paths to system path
sys.path.append(os.path.join(os.path.dirname(__file__), 'barcode-reader'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'welcome_system'))

try:
    import cv2
    import numpy as np
    from PyQt5.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, 
                                QHBoxLayout, QWidget, QPushButton, QLabel, 
                                QTextEdit, QTabWidget, QGroupBox, QGridLayout,
                                QMessageBox, QComboBox, QSpinBox, QCheckBox)
    from PyQt5.QtCore import QTimer, QThread, pyqtSignal, Qt
    from PyQt5.QtGui import QPixmap, QImage, QFont
    from pyzbar import pyzbar
except ImportError as e:
    print(f"Missing required dependencies: {e}")
    print("Please run: pip install PyQt5 opencv-python pyzbar numpy")
    sys.exit(1)

class PersonDetectionThread(QThread):
    """Person detection thread"""
    person_detected = pyqtSignal()
    frame_ready = pyqtSignal(np.ndarray)
    
    def __init__(self):
        super().__init__()
        self.running = False
        self.camera = None
        self.face_cascade = None
        self.last_detection_time = 0
        self.detection_cooldown = 3.0
        
    def run(self):
        self.running = True
        self.camera = cv2.VideoCapture(0)
        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # Load face detection model
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        while self.running:
            ret, frame = self.camera.read()
            if ret:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = self.face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
                )
                
                # Draw detection boxes
                for (x, y, w, h) in faces:
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                
                # Person detected and cooldown time exceeded
                current_time = time.time()
                if len(faces) > 0 and (current_time - self.last_detection_time) > self.detection_cooldown:
                    self.last_detection_time = current_time
                    self.person_detected.emit()
                
                self.frame_ready.emit(frame)
            
            time.sleep(0.1)
    
    def stop(self):
        self.running = False
        if self.camera:
            self.camera.release()

class BarcodeDetectionThread(QThread):
    """Barcode detection thread"""
    barcode_detected = pyqtSignal(str, str)
    frame_ready = pyqtSignal(np.ndarray)
    
    def __init__(self):
        super().__init__()
        self.running = False
        self.camera = None
        
    def run(self):
        self.running = True
        self.camera = cv2.VideoCapture(1)  # Use second camera
        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        while self.running:
            ret, frame = self.camera.read()
            if ret:
                # Detect barcodes
                barcodes = pyzbar.decode(frame)
                
                for barcode in barcodes:
                    # Extract barcode data
                    barcode_data = barcode.data.decode('utf-8')
                    barcode_type = barcode.type
                    
                    # Draw barcode info on image
                    (x, y, w, h) = barcode.rect
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    cv2.putText(frame, f"{barcode_type}: {barcode_data}", 
                              (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                    
                    # Send detection signal
                    self.barcode_detected.emit(barcode_data, barcode_type)
                
                self.frame_ready.emit(frame)
            
            time.sleep(0.1)
    
    def stop(self):
        self.running = False
        if self.camera:
            self.camera.release()

class OrderSystemAPI:
    """Order system API interface"""
    
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        
    def check_user_by_barcode(self, barcode_data: str) -> Optional[Dict]:
        """Find user by barcode"""
        try:
            response = requests.get(f"{self.base_url}/api/user/barcode/{barcode_data}")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"API call error: {e}")
            return None
    
    def create_order(self, user_id: str, items: List[Dict]) -> Optional[Dict]:
        """Create an order"""
        try:
            data = {
                "userId": user_id,
                "items": items,
                "timestamp": datetime.now().isoformat()
            }
            response = requests.post(f"{self.base_url}/api/orders", json=data)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Create order error: {e}")
            return None
    
    def get_menu(self) -> Optional[Dict]:
        """Get menu data"""
        try:
            response = requests.get(f"{self.base_url}/api/menu")
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Get menu error: {e}")
            return None

class IntegratedSystem(QMainWindow):
    """Integrated system main window"""
    
    def __init__(self):
        super().__init__()
        self.order_api = OrderSystemAPI()
        self.current_user = None
        self.menu_data = None
        self.init_ui()
        self.init_threads()
        
    def init_ui(self):
        """Initialise user interface"""
        self.setWindowTitle("Smart Restaurant Integrated System")
        self.setGeometry(100, 100, 1200, 800)
        
        # Create central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Main layout
        main_layout = QHBoxLayout(central_widget)
        
        # Left control panel
        control_panel = self.create_control_panel()
        main_layout.addWidget(control_panel, 1)
        
        # Right display area
        display_panel = self.create_display_panel()
        main_layout.addWidget(display_panel, 2)
        
        # Status bar
        self.statusBar().showMessage("System ready")
        
    def create_control_panel(self):
        """Create control panel"""
        panel = QWidget()
        layout = QVBoxLayout(panel)
        
        # System status
        status_group = QGroupBox("System Status")
        status_layout = QVBoxLayout(status_group)
        
        self.status_label = QLabel("System Status: Ready")
        self.status_label.setStyleSheet("font-weight: bold; color: green;")
        status_layout.addWidget(self.status_label)
        
        # Person detection status
        self.person_status = QLabel("Person Detection: Not started")
        status_layout.addWidget(self.person_status)
        
        # Barcode detection status
        self.barcode_status = QLabel("Barcode Scanning: Not started")
        status_layout.addWidget(self.barcode_status)
        
        layout.addWidget(status_group)
        
        # Control buttons
        control_group = QGroupBox("System Control")
        control_layout = QGridLayout(control_group)
        
        # Person detection control
        self.person_btn = QPushButton("Start Person Detection")
        self.person_btn.clicked.connect(self.toggle_person_detection)
        control_layout.addWidget(self.person_btn, 0, 0)
        
        # Barcode detection control
        self.barcode_btn = QPushButton("Start Barcode Scanning")
        self.barcode_btn.clicked.connect(self.toggle_barcode_detection)
        control_layout.addWidget(self.barcode_btn, 0, 1)
        
        # Start order system
        self.order_btn = QPushButton("Start Order System")
        self.order_btn.clicked.connect(self.start_order_system)
        control_layout.addWidget(self.order_btn, 1, 0)
        
        # Test API connection
        self.test_api_btn = QPushButton("Test API Connection")
        self.test_api_btn.clicked.connect(self.test_api_connection)
        control_layout.addWidget(self.test_api_btn, 1, 1)
        
        layout.addWidget(control_group)
        
        # User info
        user_group = QGroupBox("Current User")
        user_layout = QVBoxLayout(user_group)
        
        self.user_info_label = QLabel("No user logged in")
        user_layout.addWidget(self.user_info_label)
        
        layout.addWidget(user_group)
        
        # Spacer
        layout.addStretch()
        
        return panel
    
    def create_display_panel(self):
        """Create display panel"""
        panel = QWidget()
        layout = QVBoxLayout(panel)
        
        # Tab widget
        tab_widget = QTabWidget()
        
        # Person detection tab
        person_tab = QWidget()
        person_layout = QVBoxLayout(person_tab)
        self.person_video_label = QLabel("Person detection not started")
        self.person_video_label.setAlignment(Qt.AlignCenter)
        self.person_video_label.setStyleSheet("border: 1px solid gray;")
        self.person_video_label.setMinimumSize(640, 480)
        person_layout.addWidget(self.person_video_label)
        tab_widget.addTab(person_tab, "Person Detection")
        
        # Barcode detection tab
        barcode_tab = QWidget()
        barcode_layout = QVBoxLayout(barcode_tab)
        self.barcode_video_label = QLabel("Barcode scanning not started")
        self.barcode_video_label.setAlignment(Qt.AlignCenter)
        self.barcode_video_label.setStyleSheet("border: 1px solid gray;")
        self.barcode_video_label.setMinimumSize(640, 480)
        barcode_layout.addWidget(self.barcode_video_label)
        tab_widget.addTab(barcode_tab, "Barcode Scanning")
        
        # System log tab
        log_tab = QWidget()
        log_layout = QVBoxLayout(log_tab)
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        log_layout.addWidget(self.log_text)
        tab_widget.addTab(log_tab, "System Log")
        
        layout.addWidget(tab_widget)
        
        return panel
    
    def init_threads(self):
        """Initialise detection threads"""
        self.person_thread = None
        self.barcode_thread = None

    def create_person_thread(self):
        thread = PersonDetectionThread()
        thread.person_detected.connect(self.on_person_detected)
        thread.frame_ready.connect(self.update_person_video)
        return thread

    def create_barcode_thread(self):
        thread = BarcodeDetectionThread()
        thread.barcode_detected.connect(self.on_barcode_detected)
        thread.frame_ready.connect(self.update_barcode_video)
        return thread
        
    def toggle_person_detection(self):
        """Toggle person detection status"""
        if not self.person_thread or not self.person_thread.isRunning():
            self.person_thread = self.create_person_thread()
            self.person_thread.start()
            self.person_btn.setText("Stop Person Detection")
            self.person_status.setText("Person Detection: Running")
            self.log_message("Person detection started")
        else:
            self.person_thread.stop()
            self.person_thread.wait()
            self.person_thread = None
            self.person_btn.setText("Start Person Detection")
            self.person_status.setText("Person Detection: Stopped")
            self.log_message("Person detection stopped")
    
    def toggle_barcode_detection(self):
        """Toggle barcode detection status"""
        if not self.barcode_thread or not self.barcode_thread.isRunning():
            self.barcode_thread = self.create_barcode_thread()
            self.barcode_thread.start()
            self.barcode_btn.setText("Stop Barcode Scanning")
            self.barcode_status.setText("Barcode Scanning: Running")
            self.log_message("Barcode scanning started")
        else:
            self.barcode_thread.stop()
            self.barcode_thread.wait()
            self.barcode_thread = None
            self.barcode_btn.setText("Start Barcode Scanning")
            self.barcode_status.setText("Barcode Scanning: Stopped")
            self.log_message("Barcode scanning stopped")
    
    def start_order_system(self):
        """Start order system"""
        try:
            # Start backend
            backend_path = os.path.join(os.path.dirname(__file__), 'restaurant-ordering', 'backend')
            subprocess.Popen(['npm', 'start'], cwd=backend_path)
            
            # Start frontend
            frontend_path = os.path.join(os.path.dirname(__file__), 'restaurant-ordering', 'frontend')
            subprocess.Popen(['npm', 'start'], cwd=frontend_path)
            
            self.log_message("Order system started")
            QMessageBox.information(self, "System Started", "Order system started, please wait a moment and then visit http://localhost:3000")
            
        except Exception as e:
            self.log_message(f"Failed to start order system: {e}")
            QMessageBox.warning(self, "Start Failed", f"Failed to start order system: {e}")
    
    def test_api_connection(self):
        """Test API connection"""
        try:
            menu_data = self.order_api.get_menu()
            if menu_data:
                self.menu_data = menu_data
                self.log_message("API connection successful, menu data loaded")
                QMessageBox.information(self, "Connection Successful", "API connection successful!")
            else:
                self.log_message("API connection failed")
                QMessageBox.warning(self, "Connection Failed", "Unable to connect to order system API")
        except Exception as e:
            self.log_message(f"API connection error: {e}")
            QMessageBox.warning(self, "Connection Error", f"API connection error: {e}")
    
    def on_person_detected(self):
        """Person detection callback"""
        self.log_message("Person detected, playing welcome sound")
        self.play_welcome_sound()
        
        # Update status
        self.status_label.setText("System Status: Person detected")
        self.status_label.setStyleSheet("font-weight: bold; color: orange;")
        
        # Reset status after 3 seconds
        QTimer.singleShot(3000, self.reset_status)
    
    def on_barcode_detected(self, data: str, barcode_type: str):
        """Barcode detection callback"""
        self.log_message(f"Detected {barcode_type} barcode: {data}")
        
        # Find user
        user = self.order_api.check_user_by_barcode(data)
        if user:
            self.current_user = user
            self.user_info_label.setText(f"User: {user.get('username', 'Unknown')}")
            self.log_message(f"User login successful: {user.get('username', 'Unknown')}")
            
            # Auto-open order system
            self.open_order_system_for_user(user)
        else:
            self.log_message("No matching user found")
            QMessageBox.information(self, "User Search", f"No user found for barcode {data}")
    
    def play_welcome_sound(self):
        """Play welcome sound"""
        try:
            # macOS
            if sys.platform == "darwin":
                subprocess.run(['afplay', '/System/Library/Sounds/Glass.aiff'])
            # Windows
            elif sys.platform == "win32":
                import winsound
                winsound.MessageBeep()
            # Linux
            else:
                subprocess.run(['paplay', '/usr/share/sounds/freedesktop/stereo/complete.oga'])
        except Exception as e:
            self.log_message(f"Failed to play sound: {e}")
    
    def open_order_system_for_user(self, user: Dict):
        """Open order system for user"""
        try:
            # Open order system in browser
            import webbrowser
            webbrowser.open('http://localhost:3000')
            self.log_message(f"Opened order system for user {user.get('username')}")
        except Exception as e:
            self.log_message(f"Failed to open order system: {e}")
    
    def update_person_video(self, frame: np.ndarray):
        """Update person detection video display"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_frame.shape
        bytes_per_line = ch * w
        qt_image = QImage(rgb_frame.data, w, h, bytes_per_line, QImage.Format_RGB888)
        pixmap = QPixmap.fromImage(qt_image)
        scaled_pixmap = pixmap.scaled(self.person_video_label.size(), Qt.KeepAspectRatio)
        self.person_video_label.setPixmap(scaled_pixmap)
    
    def update_barcode_video(self, frame: np.ndarray):
        """Update barcode scanning video display"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_frame.shape
        bytes_per_line = ch * w
        qt_image = QImage(rgb_frame.data, w, h, bytes_per_line, QImage.Format_RGB888)
        pixmap = QPixmap.fromImage(qt_image)
        scaled_pixmap = pixmap.scaled(self.barcode_video_label.size(), Qt.KeepAspectRatio)
        self.barcode_video_label.setPixmap(scaled_pixmap)
    
    def reset_status(self):
        """Reset status"""
        self.status_label.setText("System Status: Ready")
        self.status_label.setStyleSheet("font-weight: bold; color: green;")
    
    def log_message(self, message: str):
        """Record log message"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_text.append(f"[{timestamp}] {message}")
    
    def closeEvent(self, event):
        """Close event"""
        # Stop all threads
        if self.person_thread:
            self.person_thread.stop()
            self.person_thread.wait()
            self.person_thread = None
        if self.barcode_thread:
            self.barcode_thread.stop()
            self.barcode_thread.wait()
            self.barcode_thread = None
        
        event.accept()

def main():
    """Main function"""
    app = QApplication(sys.argv)
    
    # Set app style
    app.setStyle('Fusion')
    
    # Create and show main window
    main_window = IntegratedSystem()
    main_window.show()
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    main() 