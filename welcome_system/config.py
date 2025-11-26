#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Welcome System Configuration
"""

# Camera settings
CAMERA_INDEX = 0  # Default camera index
CAMERA_WIDTH = 640
CAMERA_HEIGHT = 480

# Face detection parameters
FACE_SCALE_FACTOR = 1.1  # Image pyramid scaling factor
FACE_MIN_NEIGHBORS = 5   # Minimum neighbours for detection
FACE_MIN_SIZE = (30, 30) # Minimum face size

# System settings
DETECTION_COOLDOWN = 3.0  # Cooldown time between detections (seconds)
WINDOW_TITLE = "Welcome System - Real-time Detection"

# Display settings
SHOW_DETECTION_BOX = True  # Show bounding box around detected faces
SHOW_STATUS_TEXT = True    # Show status text on video

# Audio settings
AUDIO_ENABLED = True       # Enable/disable audio playback
WELCOME_MESSAGE = "Welcome! Nice to see you!"  # Welcome message

# Debug mode
DEBUG_MODE = False  # Debug mode 