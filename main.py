import os
from utils_photoshop import process_image_with_photoshop

# Girdi ve çıktı klasörlerini tanımlayın
input_folder = os.path.join(os.getcwd(), "input", "design")
output_folder = os.path.join(os.getcwd(), "output")

# Gerekli TIFF dosyası
tiff_file = os.path.join(input_folder, "70X70.tif")

# Girdi klasöründeki tüm JPG dosyalarını al
images = [f for f in os.listdir(input_folder) if f.endswith(".jpg")]

if not images:
    print("Girdi klasöründe işlem yapılacak JPG dosyası bulunamadı.")
    exit()

# Tüm resimleri sırayla işleyin
for image in images:
    image_file = os.path.join(input_folder, image)
    base_name = os.path.splitext(image)[0]  # Dosya adı (uzantısız)

    # Barkod bilgisi
    barcode_text1 = f"{base_name}_BARKOD"
    barcode_text2 = f"{base_name}_BARKOD_2"

    # İşleme başlama bilgisi
    print(f"{image} işleniyor...")

    # Photoshop işlemini çağır
    success = process_image_with_photoshop(tiff_file, image_file, output_folder, barcode_text1, barcode_text2)

    if success:
        print(f"{image} tamamlandı.")
    else:
        print(f"{image} işlenirken hata oluştu.")

# İşlem tamamlandı mesajı
print("Tüm dosyalar başarıyla işlendi ve output klasörüne kaydedildi.")