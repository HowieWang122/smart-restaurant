#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Welcome System
Function: Play welcome sound when camera detects a person
"""

import cv2
import numpy as np
import pygame
import time
import os
from datetime import datetime
import config

class WelcomeSystem:
    def __init__(self):
        """Initialise welcome system"""
        self.camera = None
        self.face_cascade = None
        self.person_detected = False
        self.last_detection_time = 0
        self.detection_cooldown = config.DETECTION_COOLDOWN
        self.audio_played = False
        
        # Initialise audio system
        self.init_audio()
        
        # Initialise camera
        self.init_camera()
        
        # Initialise face detection
        self.init_face_detection()
        
    def init_audio(self):
        """Initialise audio system"""
        try:
            pygame.mixer.init()
            print("Audio system initialised successfully")
        except Exception as e:
            print(f"Audio system initialisation failed: {e}")
            
    def init_camera(self):
        """Initialise camera"""
        try:
            self.camera = cv2.VideoCapture(config.CAMERA_INDEX)
            if not self.camera.isOpened():
                print(f"Cannot open camera {config.CAMERA_INDEX}, trying other devices...")
                self.camera = cv2.VideoCapture(1)
            
            if self.camera.isOpened():
                print("Camera initialised successfully")
                # Set camera resolution
                self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, config.CAMERA_WIDTH)
                self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, config.CAMERA_HEIGHT)
            else:
                print("Cannot open camera")
        except Exception as e:
            print(f"Camera initialisation failed: {e}")
            
    def init_face_detection(self):
        """Initialise face detection"""
        try:
            # Use OpenCV's built-in face detector
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            if self.face_cascade.empty():
                print("Cannot load face detection model")
            else:
                print("Face detection model loaded successfully")
        except Exception as e:
            print(f"Face detection initialisation failed: {e}")
            
    def play_welcome_sound(self):
        """Play welcome sound"""
        if not config.AUDIO_ENABLED:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] {config.WELCOME_MESSAGE}")
            self.audio_played = True
            return
            
        try:
            # Create a simple welcome sound effect (using system sound)
            if os.name == 'nt':  # Windows
                import winsound
                winsound.Beep(800, 500)  # Frequency 800Hz, duration 500ms
            else:  # macOS/Linux
                os.system('afplay /System/Library/Sounds/Glass.aiff')
                
            print(f"[{datetime.now().strftime('%H:%M:%S')}] {config.WELCOME_MESSAGE}")
            self.audio_played = True
            
        except Exception as e:
            print(f"Failed to play sound: {e}")
            
    def detect_person(self, frame):
        """Detect person"""
        if self.face_cascade is None:
            return False
            
        # Convert to greyscale image
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=config.FACE_SCALE_FACTOR,
            minNeighbors=config.FACE_MIN_NEIGHBORS,
            minSize=config.FACE_MIN_SIZE
        )
        
        # If face detected, draw bounding box
        if config.SHOW_DETECTION_BOX:
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.putText(frame, 'Person', (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
            
        return len(faces) > 0
        
    def run(self):
        """Run welcome system"""
        if self.camera is None or not self.camera.isOpened():
            print("Camera not initialised, cannot run system")
            return
            
        print("Welcome system starting...")
        print("Press 'q' to quit system")
        
        while True:
            # Read camera frame
            ret, frame = self.camera.read()
            if not ret:
                print("Cannot read camera frame")
                break
                
            # Detect person
            person_detected = self.detect_person(frame)
            
            # Process detection result
            current_time = time.time()
            if person_detected and not self.person_detected:
                # New person detected
                self.person_detected = True
                self.audio_played = False
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Person detected")
                
            elif person_detected and not self.audio_played:
                # Play welcome sound
                if current_time - self.last_detection_time > self.detection_cooldown:
                    self.play_welcome_sound()
                    self.last_detection_time = current_time
                    
            elif not person_detected:
                # Person left
                self.person_detected = False
                self.audio_played = False
                
            # Display status info
            if config.SHOW_STATUS_TEXT:
                status_text = "Person detected" if person_detected else "Waiting..."
                cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if person_detected else (0, 0, 255), 2)
            
            # Display frame
            cv2.imshow(config.WINDOW_TITLE, frame)
            
            # Check for key press
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
                
        # Clean up resources
        self.cleanup()
        
    def cleanup(self):
        """Clean up resources"""
        if self.camera:
            self.camera.release()
        cv2.destroyAllWindows()
        pygame.mixer.quit()
        print("System closed")

def main():
    """Main function"""
    print("=== Welcome System ===")
    print("System functions:")
    print("1. Real-time camera detection")
    print("2. Person recognition")
    print("3. Automatic welcome sound playback")
    print("4. Detection cooldown: 3 seconds")
    print()
    
    # Create and run welcome system
    welcome_system = WelcomeSystem()
    welcome_system.run()

if __name__ == "__main__":
    main() 