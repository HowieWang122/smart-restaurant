#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Barcode Reader
Supports real-time camera and image file barcode reading
"""

import sys
import cv2
import numpy as np
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QLabel, QTextEdit, 
                             QFileDialog, QMessageBox, QGroupBox, QGridLayout)
from PyQt5.QtCore import QTimer, Qt, QThread, pyqtSignal
from PyQt5.QtGui import QImage, QPixmap, QFont
from pyzbar import pyzbar
from PIL import Image
import os

class BarcodeScannerThread(QThread):
    """Barcode scanning thread"""
    barcode_detected = pyqtSignal(str, str)  # Signal: barcode type, barcode content
    frame_ready = pyqtSignal(QImage)  # Signal: processed frame image
    
    def __init__(self):
        super().__init__()
        self.running = False
        self.camera = None
        
    def run(self):
        """Run scanning thread"""
        self.camera = cv2.VideoCapture(0)
        if not self.camera.isOpened():
            self.barcode_detected.emit("Error", "Cannot open camera")
            return
            
        self.running = True
        while self.running:
            ret, frame = self.camera.read()
            if not ret:
                continue
                
            # Process frame
            self.process_frame(frame)
            
        if self.camera:
            self.camera.release()
    
    def process_frame(self, frame):
        """Process video frame"""
        # Detect barcodes
        barcodes = pyzbar.decode(frame)
        
        for barcode in barcodes:
            # Extract barcode data
            barcode_data = barcode.data.decode('utf-8')
            barcode_type = barcode.type
            
            # Draw bounding box
            (x, y, w, h) = barcode.rect
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # Add text label
            text = f"{barcode_type}: {barcode_data}"
            cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.5, (0, 255, 0), 2)
            
            # Emit detection signal
            self.barcode_detected.emit(barcode_type, barcode_data)
        
        # Convert frame to QImage
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_frame.shape
        bytes_per_line = ch * w
        qt_image = QImage(rgb_frame.data, w, h, bytes_per_line, QImage.Format_RGB888)
        
        self.frame_ready.emit(qt_image)
        
    def stop(self):
        """Stop scanning thread"""
        self.running = False

class BarcodeReaderApp(QMainWindow):
    """Main barcode reader application"""
    
    def __init__(self):
        super().__init__()
        self.scanner_thread = None
        self.scan_results = []
        self.init_ui()
        
    def init_ui(self):
        """Initialise user interface"""
        self.setWindowTitle("Barcode Reader System")
        self.setGeometry(100, 100, 1000, 700)
        
        # Main widget
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        
        # Main layout
        main_layout = QHBoxLayout(main_widget)
        
        # Left panel - Controls
        control_panel = self.create_control_panel()
        main_layout.addWidget(control_panel, 1)
        
        # Right panel - Display
        display_panel = self.create_display_panel()
        main_layout.addWidget(display_panel, 2)
        
        # Status bar
        self.statusBar().showMessage("Ready")
        
    def create_control_panel(self):
        """Create control panel"""
        panel = QWidget()
        layout = QVBoxLayout(panel)
        
        # Title
        title_label = QLabel("Barcode Scanner")
        title_label.setFont(QFont("Arial", 16, QFont.Bold))
        title_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(title_label)
        
        # Camera controls
        camera_group = QGroupBox("Camera Control")
        camera_layout = QVBoxLayout(camera_group)
        
        self.start_camera_btn = QPushButton("Start Camera")
        self.start_camera_btn.clicked.connect(self.start_camera)
        camera_layout.addWidget(self.start_camera_btn)
        
        self.stop_camera_btn = QPushButton("Stop Camera")
        self.stop_camera_btn.clicked.connect(self.stop_camera)
        self.stop_camera_btn.setEnabled(False)
        camera_layout.addWidget(self.stop_camera_btn)
        
        layout.addWidget(camera_group)
        
        # File controls
        file_group = QGroupBox("File Input")
        file_layout = QVBoxLayout(file_group)
        
        self.load_image_btn = QPushButton("Load Image File")
        self.load_image_btn.clicked.connect(self.load_image_file)
        file_layout.addWidget(self.load_image_btn)
        
        layout.addWidget(file_group)
        
        # Results
        results_group = QGroupBox("Scan Results")
        results_layout = QVBoxLayout(results_group)
        
        self.results_text = QTextEdit()
        self.results_text.setReadOnly(True)
        results_layout.addWidget(self.results_text)
        
        self.clear_results_btn = QPushButton("Clear Results")
        self.clear_results_btn.clicked.connect(self.clear_results)
        results_layout.addWidget(self.clear_results_btn)
        
        layout.addWidget(results_group)
        
        return panel
        
    def create_display_panel(self):
        """Create display panel"""
        panel = QWidget()
        layout = QVBoxLayout(panel)
        
        # Display group
        display_group = QGroupBox("Camera Preview")
        display_layout = QVBoxLayout(display_group)
        
        self.video_label = QLabel("Camera not started")
        self.video_label.setAlignment(Qt.AlignCenter)
        self.video_label.setMinimumSize(640, 480)
        self.video_label.setStyleSheet("border: 1px solid gray;")
        display_layout.addWidget(self.video_label)
        
        layout.addWidget(display_group)
        
        return panel
        
    def start_camera(self):
        """Start camera scanning"""
        self.scanner_thread = BarcodeScannerThread()
        self.scanner_thread.barcode_detected.connect(self.on_barcode_detected)
        self.scanner_thread.frame_ready.connect(self.update_frame)
        self.scanner_thread.start()
        
        self.start_camera_btn.setEnabled(False)
        self.stop_camera_btn.setEnabled(True)
        self.statusBar().showMessage("Camera started")
        
    def stop_camera(self):
        """Stop camera scanning"""
        if self.scanner_thread:
            self.scanner_thread.stop()
            self.scanner_thread.wait()
            
        self.start_camera_btn.setEnabled(True)
        self.stop_camera_btn.setEnabled(False)
        self.video_label.setText("Camera stopped")
        self.statusBar().showMessage("Camera stopped")
        
    def load_image_file(self):
        """Load and process image file"""
        file_path, _ = QFileDialog.getOpenFileName(
            self, 
            "Select Image File",
            "",
            "Image Files (*.png *.jpg *.jpeg *.bmp);;All Files (*.*)"
        )
        
        if file_path:
            self.process_image_file(file_path)
            
    def process_image_file(self, file_path):
        """Process image file for barcodes"""
        try:
            # Read image
            image = cv2.imread(file_path)
            if image is None:
                QMessageBox.warning(self, "Error", "Cannot read image file")
                return
                
            # Detect barcodes
            barcodes = pyzbar.decode(image)
            
            if not barcodes:
                self.statusBar().showMessage("No barcodes found in image")
                QMessageBox.information(self, "Result", "No barcodes found in the image")
                return
                
            # Process each barcode
            for barcode in barcodes:
                barcode_data = barcode.data.decode('utf-8')
                barcode_type = barcode.type
                
                # Draw on image
                (x, y, w, h) = barcode.rect
                cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
                
                # Add to results
                self.add_scan_result(barcode_type, barcode_data)
                
            # Display image
            self.display_image(image)
            self.statusBar().showMessage(f"Found {len(barcodes)} barcode(s)")
            
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Error processing image: {str(e)}")
            
    def display_image(self, image):
        """Display image in the video label"""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_image.shape
        bytes_per_line = ch * w
        qt_image = QImage(rgb_image.data, w, h, bytes_per_line, QImage.Format_RGB888)
        
        # Scale image to fit label
        pixmap = QPixmap.fromImage(qt_image)
        scaled_pixmap = pixmap.scaled(self.video_label.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation)
        self.video_label.setPixmap(scaled_pixmap)
        
    def update_frame(self, qt_image):
        """Update video frame display"""
        pixmap = QPixmap.fromImage(qt_image)
        scaled_pixmap = pixmap.scaled(self.video_label.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation)
        self.video_label.setPixmap(scaled_pixmap)
        
    def on_barcode_detected(self, barcode_type, barcode_data):
        """Handle barcode detection"""
        self.add_scan_result(barcode_type, barcode_data)
        self.statusBar().showMessage(f"Detected {barcode_type}: {barcode_data}")
        
    def add_scan_result(self, barcode_type, barcode_data):
        """Add scan result to list"""
        # Check if already scanned
        for result in self.scan_results:
            if result['data'] == barcode_data:
                return
                
        # Add new result
        result = {
            'type': barcode_type,
            'data': barcode_data
        }
        self.scan_results.append(result)
        
        # Update display
        result_text = f"[{barcode_type}] {barcode_data}\n"
        self.results_text.insertPlainText(result_text)
        
    def clear_results(self):
        """Clear all scan results"""
        self.scan_results.clear()
        self.results_text.clear()
        self.statusBar().showMessage("Results cleared")
        
    def closeEvent(self, event):
        """Handle window close event"""
        if self.scanner_thread and self.scanner_thread.running:
            self.scanner_thread.stop()
            self.scanner_thread.wait()
        event.accept()

def main():
    """Main function"""
    app = QApplication(sys.argv)
    
    # Set application style
    app.setStyle('Fusion')
    
    # Create and show main window
    window = BarcodeReaderApp()
    window.show()
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    main() 