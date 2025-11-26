# Welcome System

A Python-based intelligent welcome system that uses camera detection to automatically play welcome sounds when people are detected.

## Features

- 🎥 **Real-time Camera Detection**: Uses OpenCV for real-time video capture
- 👤 **Person Recognition**: Face detection based on Haar Cascade Classifier
- 🔊 **Automatic Sound Playback**: Plays welcome sounds when people are detected
- ⏱️ **Intelligent Cooldown**: Avoids repeated playback with 3-second cooldown
- 🖥️ **Visual Interface**: Real-time display of detection status and person bounding boxes

## System Requirements

- Python 3.7+
- macOS/Linux/Windows
- Camera device
- Audio output device

## Installation Steps

1. **Clone or download the project**
   ```bash
   cd ~/welcome_system
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the system**
   ```bash
   python welcome_system.py
   ```

## Usage Guide

1. After running the programme, the system will automatically initialise the camera and audio devices
2. The camera window will display the real-time feed
3. When a person is detected, the system will:
   - Mark the detected face on the screen
   - Play a welcome sound
   - Display detection information in the console
4. Press 'q' to exit the system

## Technical Implementation

### Core Components

- **OpenCV**: For camera control and image processing
- **Haar Cascade Classifier**: For face detection
- **pygame**: For audio system initialisation
- **System Audio**: Uses built-in system sound files

### Detection Algorithm

- Uses OpenCV's Haar Cascade Classifier for face detection
- Detection parameters:
  - `scaleFactor=1.1`: Image scaling factor
  - `minNeighbors=5`: Minimum neighbour count
  - `minSize=(30, 30)`: Minimum detection size

### Audio System

- **macOS**: Uses `afplay` to play system sounds
- **Windows**: Uses `winsound` to play beep sounds
- **Linux**: Uses `afplay` or system audio commands

## Configuration Options

You can modify the following parameters in the code:

```python
self.detection_cooldown = 3.0  # Detection cooldown time (seconds)
# Camera resolution
self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
```

## Troubleshooting

### Common Issues

1. **Camera Won't Open**
   - Check camera permissions
   - Ensure camera isn't being used by other programmes
   - Try different camera indices (0, 1, 2...)

2. **Audio Won't Play**
   - Check system volume settings
   - Ensure audio device is working properly
   - Check Python audio library installation

3. **Detection Not Accurate**
   - Adjust detection parameters
   - Ensure adequate lighting
   - Check camera angle

### Debug Mode

The programme outputs detailed initialisation information to the console, including:
- Camera status
- Audio system status
- Face detection model loading status
- Real-time detection logs

## Extended Features

Consider adding these features:
- Custom welcome audio files
- Multi-language support
- Detection statistics and logging
- Network camera support
- Motion detection (not just faces)

## Licence

This project is for learning and personal use only.

## Contributing

Welcome to submit issues and improvement suggestions! 