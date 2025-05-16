import os
import subprocess
import sys

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

    # AppleScript komutunu oluştur
    apple_script = f"""
        osascript -e 'tell application "Adobe Photoshop 2025"
            do javascript file "{photoshop_script}" with arguments {{"{tiff_file}", "{image_file}", "{output_folder}", "{barcode_text}", "{beden_type}"}}
        end tell'
    """

    # Komutu çalıştır
    try:

        
        subprocess.run(apple_script, shell=True, check=True)
        return True
    except subprocess.CalledProcessError:
        return False