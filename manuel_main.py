import os
import pandas as pd
import time  # Zaman ölçmek için gerekli modül
from utils_photoshop import process_image_with_photoshop

# Girdi ve çıktı klasörlerini tanımlayın
input_folder = "/Users/dogualagoz/Desktop/input/design"
output_folder = "/Users/dogualagoz/Desktop/output"
excel_path = "/Users/dogualagoz/Desktop/input/barcodes.xlsx"  # Excel dosyasının yolu

# Gerekli TIFF dosyası
tiff_file = os.path.join(input_folder, "70X70.tif")

# Excel dosyasını oku
try:
    df = pd.read_excel(excel_path)
    df.columns = df.columns.str.strip()  # Sütun adlarındaki olası boşlukları temizle
except Exception as e:
    print(f"Excel dosyası okunamadı: {e}")
    exit()

# Girdi klasöründeki tüm JPG dosyalarını al
images = [f for f in os.listdir(input_folder) if f.endswith(".jpg")]

if not images:
    print("Girdi klasöründe işlem yapılacak JPG dosyası bulunamadı.")
    exit()

# İşleme başlamadan önce zaman damgasını al
start_time = time.time()

# Tüm resimleri sırayla işleyin
for image in images:
    image_file = os.path.join(input_folder, image)
    base_name = os.path.splitext(image)[0]  # Dosya adı (uzantısız)

    # Barkod bilgisi
    try:
        barcode_row = df[df["desen"] == image]
        if not barcode_row.empty:
            barcode_text = barcode_row["barkod"].values[0]
        else:
            raise ValueError("Barkod bilgisi bulunamadı.")
    except Exception as e:
        print(f"{image} için barkod alınırken hata oluştu: {e}")
        barcode_text = f"{base_name}_BARKOD"  # Varsayılan değer

    # İşleme başlama bilgisi
    print(f"{image} işleniyor...")

    # Photoshop işlemini çağır
    success = process_image_with_photoshop(tiff_file, image_file, output_folder, barcode_text)

    if success:
        print(f"{image} tamamlandı.")
    else:
        print(f"{image} işlenirken hata oluştu.")

# İşlem tamamlandıktan sonra zaman damgasını al
end_time = time.time()

# Toplam geçen süreyi hesapla ve yazdır
elapsed_time = end_time - start_time
print(f"Tüm dosyalar başarıyla işlendi ve output klasörüne kaydedildi. Toplam süre: {elapsed_time:.2f} saniye.")