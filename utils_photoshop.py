import os
import subprocess
import sys
import logging

# Loglama ayarları
logging.basicConfig(
    filename=os.path.join(os.getcwd(), "logs", "errors.log"),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

def get_base_path():
    """PyInstaller ile paketlenmiş dosyalar için çalışma yolu."""
    if getattr(sys, 'frozen', False):  # PyInstaller ile paketlenmiş mi?
        return sys._MEIPASS  # Geçici çalışma dizini
    else:
        return os.path.dirname(os.path.abspath(__file__))

def process_image_with_photoshop(tiff_file, image_file, output_folder, barcode_text, beden_type):
    """
    Photoshop işlemlerini ExtendScript ile gerçekleştiren fonksiyon.
    """
    # Photoshop Script'in yolu
    photoshop_script = os.path.join(get_base_path(), "scripts", "photoshop_script.jsx")

    logging.info(f"Tiff File: {tiff_file}")
    logging.info(f"Image File: {image_file}")
    logging.info(f"Output Folder: {output_folder}")
    logging.info(f"Barcode Text: {barcode_text}")
    logging.info(f"Beden Type: {beden_type}")

    # AppleScript komutunu oluştur
    apple_script = f"""
        osascript -e 'tell application "Adobe Photoshop 2025"
            do javascript file "{photoshop_script}" with arguments {{"{tiff_file}", "{image_file}", "{output_folder}", "{barcode_text}", "{beden_type}"}}
        end tell'
    """

    logging.info(f"AppleScript Command: {apple_script}")

    # Komutu çalıştır
    try:
        subprocess.run(apple_script, shell=True, check=True)
        logging.info(f"{image_file} başarıyla işlendi.")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"{image_file} işlenirken hata oluştu: {e}")
        return False