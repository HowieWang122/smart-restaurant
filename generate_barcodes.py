#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Barcode Generation Tool - Generate test barcodes for system demonstration
"""

import os
import sys
from datetime import datetime
from typing import List, Tuple

# Try importing required dependencies
try:
    from PIL import Image, ImageDraw, ImageFont
    from barcode import Code128
    from barcode.writer import ImageWriter
    import qrcode
except ImportError as e:
    print(f"Missing required dependency: {e}")
    print("Please run: pip install pillow python-barcode qrcode")
    sys.exit(1)

def generate_barcode(data: str, filename: str) -> bool:
    """Generate a 128-bit barcode"""
    try:
        # Set custom barcode format
        writer = ImageWriter()
        writer.set_options({
            'module_width': 0.5,
            'module_height': 15.0,
            'font_size': 12,
            'text_distance': 5.0,
            'quiet_zone': 6.5
        })
        
        # Generate barcode
        barcode = Code128(data, writer=writer)
        barcode.save(filename)
        
        print(f"✅ Barcode generated: {filename}.png")
        return True
    except Exception as e:
        print(f"❌ Failed to generate barcode {filename}: {str(e)}")
        return False

def generate_qrcode(data: str, filename: str) -> bool:
    """Generate QR code"""
    try:
        # Create QR code object
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        # Add data
        qr.add_data(data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(f"{filename}.png")
        
        print(f"✅ QR code generated: {filename}.png")
        return True
    except Exception as e:
        print(f"❌ Failed to generate QR code {filename}: {str(e)}")
        return False

def create_info_card(barcode_file: str, info: dict) -> bool:
    """Create an info card with barcode and user details"""
    try:
        # Open barcode image
        barcode_img = Image.open(barcode_file)
        
        # Create new canvas
        card_width = max(400, barcode_img.width + 40)
        card_height = barcode_img.height + 200
        card = Image.new('RGB', (card_width, card_height), 'white')
        
        # Paste barcode
        barcode_x = (card_width - barcode_img.width) // 2
        card.paste(barcode_img, (barcode_x, 20))
        
        # Add text info
        draw = ImageDraw.Draw(card)
        
        # Try loading fonts
        try:
            title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
            text_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
        except Exception:
            # Use default font
            title_font = ImageFont.load_default()
            text_font = ImageFont.load_default()
        
        # Add title
        title = f"{info['type']} - {info['username']}"
        draw.text((card_width//2, barcode_img.height + 40), title, 
                 fill='black', font=title_font, anchor='mm')
        
        # Add info
        y_offset = barcode_img.height + 80
        for key, value in info.items():
            if key not in ['type', 'username']:
                text = f"{key}: {value}"
                draw.text((20, y_offset), text, fill='black', font=text_font)
                y_offset += 30
        
        # Save card
        card_file = barcode_file.replace('.png', '_card.png')
        card.save(card_file)
        print(f"✅ Info card created: {card_file}")
        return True
    except Exception as e:
        print(f"❌ Failed to create info card: {str(e)}")
        return False

def generate_test_barcodes():
    """Generate a set of test barcodes"""
    # Create output directory
    output_dir = "test_barcodes"
    os.makedirs(output_dir, exist_ok=True)
    
    # Test data
    test_data = [
        {
            'type': 'Regular User',
            'username': 'test_user',
            'barcode_id': '123456789',
            'password': 'kristy'
        },
        {
            'type': 'Administrator', 
            'username': 'admin',
            'barcode_id': 'admin_barcode',
            'password': 'kristy'
        },
        {
            'type': 'VIP User',
            'username': 'vip_user',
            'barcode_id': 'VIP20240101',
            'password': 'kristy'
        }
    ]
    
    print("🔧 Generating test barcodes...")
    print("=" * 50)
    
    success_count = 0
    
    for data in test_data:
        barcode_id = data['barcode_id']
        username = data['username']
        
        # Generate barcode
        barcode_file = os.path.join(output_dir, f"{username}_barcode")
        if generate_barcode(barcode_id, barcode_file):
            success_count += 1
            
            # Create info card
            create_info_card(f"{barcode_file}.png", data)
        
        # Also generate QR code
        qr_file = os.path.join(output_dir, f"{username}_qrcode")
        if generate_qrcode(barcode_id, qr_file):
            success_count += 1
    
    print("=" * 50)
    print(f"✅ Generated {success_count} barcodes")
    print(f"📁 Saved to: {os.path.abspath(output_dir)}")
    
    # Verification hints
    print("\n📋 Verification steps:")
    print("1. Scan barcodes in the integrated system")
    print("2. Verify user auto-identification") 
    print("3. Check if order system opens correctly")

def verify_barcode(filepath: str) -> bool:
    """Verify barcode readability"""
    try:
        import cv2
        from pyzbar import pyzbar
        
        # Read image
        img = cv2.imread(filepath)
        # Detect barcodes
        barcodes = pyzbar.decode(img)
        
        if barcodes:
            for barcode in barcodes:
                data = barcode.data.decode('utf-8')
                print(f"✅ Verified: {filepath} - Data: {data}")
            return True
        else:
            print(f"❌ Verification failed: {filepath} - Unable to read barcode")
            return False
    except Exception as e:
        print(f"❌ Verification error: {filepath} - {e}")
        return False

if __name__ == "__main__":
    generate_test_barcodes() 