import os
import subprocess


def process_image_with_photoshop(tiff_file, image_file, output_folder, barcode_text):
    """
    Photoshop işlemlerini ExtendScript ile gerçekleştiren fonksiyon.
    """
    # Photoshop Script'in yolu
    photoshop_script = os.path.join(os.getcwd(), "scripts", "photoshop_script.jsx")

    # AppleScript komutunu oluştur
    apple_script = f"""
        osascript -e 'tell application "Adobe Photoshop 2025"
            do javascript file "{photoshop_script}" with arguments {{"{tiff_file}", "{image_file}", "{output_folder}", "{barcode_text}"}}
        end tell'
    """

    # Komutu çalıştır
    try:
        subprocess.run(apple_script, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"{image_file} işlenirken hata oluştu: {e}")
        return False

    return True