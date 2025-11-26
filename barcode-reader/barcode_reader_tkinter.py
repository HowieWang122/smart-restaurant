#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Barcode Reader - Tkinter Version
A simple barcode scanner using camera and image files
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import cv2
import numpy as np
from PIL import Image, ImageTk
from pyzbar import pyzbar
import threading
import datetime
import os

class BarcodeReaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Barcode Reader System")
        self.root.geometry("900x700")
        
        # Camera variables
        self.camera = None
        self.camera_running = False
        self.camera_thread = None
        
        # Results storage
        self.scan_results = []
        
        self.setup_ui()
        
    def setup_ui(self):
        """Set up the user interface"""
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Title
        title_label = ttk.Label(main_frame, text="Barcode Scanner", 
                               font=('Helvetica', 20, 'bold'))
        title_label.grid(row=0, column=0, columnspan=2, pady=10)
        
        # Left panel - Controls
        control_frame = ttk.LabelFrame(main_frame, text="Controls", padding="10")
        control_frame.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        # Camera controls
        self.camera_btn = ttk.Button(control_frame, text="Start Camera", 
                                    command=self.toggle_camera)
        self.camera_btn.grid(row=0, column=0, pady=5, sticky=tk.W+tk.E)
        
        # File selection
        ttk.Button(control_frame, text="Select Image File", 
                  command=self.select_image_file).grid(row=1, column=0, pady=5, sticky=tk.W+tk.E)
        
        # Clear results
        ttk.Button(control_frame, text="Clear Results", 
                  command=self.clear_results).grid(row=2, column=0, pady=5, sticky=tk.W+tk.E)
        
        # Results display
        results_label = ttk.Label(control_frame, text="Scan Results:", 
                                 font=('Helvetica', 12, 'bold'))
        results_label.grid(row=3, column=0, pady=(20, 5), sticky=tk.W)
        
        # Results text area
        self.results_text = scrolledtext.ScrolledText(control_frame, width=30, height=15)
        self.results_text.grid(row=4, column=0, pady=5, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Right panel - Display
        display_frame = ttk.LabelFrame(main_frame, text="Camera/Image Display", padding="10")
        display_frame.grid(row=1, column=1, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Display label
        self.display_label = ttk.Label(display_frame, text="No image loaded")
        self.display_label.grid(row=0, column=0)
        
        # Status bar
        self.status_var = tk.StringVar()
        self.status_var.set("Ready")
        status_bar = ttk.Label(main_frame, textvariable=self.status_var, relief=tk.SUNKEN)
        status_bar.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(10, 0))
        
        # Configure grid weights
        self.root.rowconfigure(0, weight=1)
        self.root.columnconfigure(0, weight=1)
        main_frame.rowconfigure(1, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=2)
        control_frame.rowconfigure(4, weight=1)
        
    def toggle_camera(self):
        """Toggle camera on/off"""
        if not self.camera_running:
            self.start_camera()
        else:
            self.stop_camera()
            
    def start_camera(self):
        """Start camera capture"""
        try:
            self.camera = cv2.VideoCapture(0)
            if not self.camera.isOpened():
                raise Exception("Cannot open camera")
                
            self.camera_running = True
            self.camera_btn.config(text="Stop Camera")
            self.status_var.set("Camera running...")
            
            # Start camera thread
            self.camera_thread = threading.Thread(target=self.process_camera)
            self.camera_thread.daemon = True
            self.camera_thread.start()
            
        except Exception as e:
            messagebox.showerror("Error", "Cannot open camera")
            self.status_var.set("Camera error")
            
    def stop_camera(self):
        """Stop camera capture"""
        self.camera_running = False
        if self.camera:
            self.camera.release()
        self.camera_btn.config(text="Start Camera")
        self.status_var.set("Camera stopped")
        self.display_label.config(image='', text="Camera stopped")
        
    def process_camera(self):
        """Process camera frames in separate thread"""
        while self.camera_running:
            ret, frame = self.camera.read()
            if ret:
                # Detect barcodes
                barcodes = pyzbar.decode(frame)
                
                # Draw barcodes on frame
                for barcode in barcodes:
                    # Extract barcode data
                    barcode_data = barcode.data.decode('utf-8')
                    barcode_type = barcode.type
                    
                    # Draw rectangle
                    (x, y, w, h) = barcode.rect
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    
                    # Put text
                    text = f"{barcode_type}: {barcode_data}"
                    cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                               0.5, (0, 255, 0), 2)
                    
                    # Add to results
                    self.add_scan_result(barcode_data, barcode_type)
                
                # Convert frame to display
                self.display_frame(frame)
                
    def display_frame(self, frame):
        """Display frame in GUI"""
        # Convert colour space
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Resize if needed
        height, width = frame_rgb.shape[:2]
        max_height = 480
        if height > max_height:
            scale = max_height / height
            new_width = int(width * scale)
            frame_rgb = cv2.resize(frame_rgb, (new_width, max_height))
        
        # Convert to PhotoImage
        image = Image.fromarray(frame_rgb)
        photo = ImageTk.PhotoImage(image=image)
        
        # Update display
        self.display_label.config(image=photo, text='')
        self.display_label.image = photo  # Keep reference
        
    def select_image_file(self):
        """Select and process image file"""
        filename = filedialog.askopenfilename(
            title="Select Image File",
            filetypes=[("Image files", "*.jpg *.jpeg *.png *.bmp"), 
                      ("All files", "*.*")]
        )
        
        if filename:
            self.process_image_file(filename)
            
    def process_image_file(self, filename):
        """Process selected image file"""
        try:
            # Read image
            image = cv2.imread(filename)
            if image is None:
                raise Exception("Cannot read image file")
            
            # Detect barcodes
            barcodes = pyzbar.decode(image)
            
            if barcodes:
                self.status_var.set(f"Found {len(barcodes)} barcode(s)")
                
                # Draw barcodes on image
                for barcode in barcodes:
                    # Extract barcode data
                    barcode_data = barcode.data.decode('utf-8')
                    barcode_type = barcode.type
                    
                    # Draw rectangle
                    (x, y, w, h) = barcode.rect
                    cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    
                    # Put text
                    text = f"{barcode_type}: {barcode_data}"
                    cv2.putText(image, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                               0.5, (0, 255, 0), 2)
                    
                    # Add to results
                    self.add_scan_result(barcode_data, barcode_type)
            else:
                self.status_var.set("No barcodes found in image")
            
            # Display image
            self.display_frame(image)
            
        except Exception as e:
            messagebox.showerror("Error", f"Cannot process image file: {str(e)}")
            self.status_var.set("Error processing image")
            
    def add_scan_result(self, data, barcode_type):
        """Add scan result to list"""
        # Check if already scanned
        for result in self.scan_results:
            if result['data'] == data:
                return
        
        # Add new result
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        result = {
            'timestamp': timestamp,
            'type': barcode_type,
            'data': data
        }
        self.scan_results.insert(0, result)
        
        # Update display
        self.update_results_display()
        
        # Show notification
        self.status_var.set(f"Detected {barcode_type} barcode: {data}")
        
    def update_results_display(self):
        """Update results text display"""
        self.results_text.delete(1.0, tk.END)
        
        for result in self.scan_results:
            line = f"[{result['timestamp']}] {result['type']}\n"
            line += f"Data: {result['data']}\n"
            line += "-" * 40 + "\n"
            self.results_text.insert(tk.END, line)
            
    def clear_results(self):
        """Clear all scan results"""
        self.scan_results = []
        self.results_text.delete(1.0, tk.END)
        self.status_var.set("Results cleared")
        
    def on_closing(self):
        """Handle window closing"""
        if self.camera_running:
            self.stop_camera()
        self.root.destroy()

def main():
    root = tk.Tk()
    app = BarcodeReaderApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

if __name__ == "__main__":
    main() 