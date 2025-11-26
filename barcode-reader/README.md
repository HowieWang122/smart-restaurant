# Barcode Reader System

A modern barcode scanning application built with Python, supporting real-time camera scanning and image file processing.

## Features

- 🎥 **Real-time Camera Scanning** - Scan barcodes directly from your camera
- 📁 **Image File Support** - Load and scan barcode images from files
- 🔍 **Multiple Format Support** - Recognises various barcode formats (Code128, QR Code, EAN13, etc.)
- 💾 **Result History** - Keep track of all scanned barcodes
- 🎨 **Modern UI** - Clean and intuitive user interface

## Requirements

- Python 3.7 or higher
- Camera (for real-time scanning)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd barcode-reader
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

   Or install manually:
   ```bash
   pip install PyQt5 opencv-python pyzbar numpy Pillow
   ```

3. **Run the application**
   ```bash
   python barcode_reader.py
   ```

   Or use the convenience script:
   ```bash
   ./run.sh
   ```

## Usage Guide

### Starting the Application

1. Run the programme using one of the methods above
2. The main window will display with controls on the left and preview area on the right

### Camera Scanning

1. Click **"Start Camera"** to begin real-time scanning
2. Point the camera at a barcode
3. The barcode will be automatically detected and highlighted
4. Results appear in the results panel immediately

### Image File Scanning

1. Click **"Load Image File"** to select an image
2. Choose an image containing a barcode
3. The programme will scan and display any barcodes found

### Managing Results

- All scanned barcodes appear in the results panel
- Click **"Clear Results"** to remove all history

## Technical Details

### Supported Barcode Formats

- CODE128
- CODE39
- EAN13
- EAN8
- UPCA
- UPCE
- QR Code
- Data Matrix
- PDF417
- And more...

### Architecture

The application uses a multi-threaded architecture:
- Main thread handles the UI
- Separate thread for camera processing
- Asynchronous barcode detection

### Dependencies

- **PyQt5**: GUI framework
- **OpenCV**: Camera control and image processing
- **pyzbar**: Barcode detection (based on ZBar)
- **Pillow**: Image format support
- **NumPy**: Numerical operations

## Troubleshooting

### Common Issues

1. **Camera Won't Start**
   - Check camera permissions
   - Ensure camera isn't being used by another programme
   - Try different camera indices (modify code if needed)

2. **Barcode Not Detected**
   - Ensure barcode is clear and well-lit
   - Try adjusting camera distance
   - Check if barcode format is supported

3. **Programme Won't Start**
   - Verify all dependencies are installed
   - Check Python version (3.7+ required)
   - Look for error messages in console

### Error Messages

- `Cannot open camera`: Camera is in use or permissions denied
- `Cannot process image file`: Image format not supported or file corrupted
- `Detected [type] barcode`: Successful barcode detection

## Development

### Project Structure

```
barcode-reader/
├── barcode_reader.py       # Main PyQt5 application
├── barcode_reader_tkinter.py   # Alternative Tkinter version
├── requirements.txt        # Python dependencies
├── run.sh                 # Convenience startup script
├── test_installation.py   # Installation verification script
└── README.md             # This file
```

### Running Tests

Verify your installation:
```bash
python test_installation.py
```

## Version Information

- **Version**: 1.0
- **Python**: 3.7+
- **Licence**: MIT

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review existing issues
3. Create a new issue with details

## Licence

This project is licenced under the MIT Licence.