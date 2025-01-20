import os
import tkinter as tk
from tkinter import filedialog, messagebox
from utils_photoshop import process_image_with_photoshop
import pandas as pd
import time


class AutomationApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Photoshop Otomasyon Aracı")
        self.geometry("800x600")
        self.configure(padx=20, pady=20)

        # Klasör ve dosya seçim değişkenleri
        self.input_folder = tk.StringVar()
        self.output_folder = tk.StringVar()
        self.excel_path = tk.StringVar()

        # Başlık
        title_label = tk.Label(self, text="Photoshop Otomasyon Aracı", font=("Arial", 20, "bold"))
        title_label.pack(pady=10)

        # Girdi klasörü seçimi
        input_frame = tk.Frame(self)
        input_frame.pack(fill="x", pady=5)
        tk.Label(input_frame, text="Girdi Klasörü:").pack(side="left", padx=5)
        tk.Entry(input_frame, textvariable=self.input_folder, width=50).pack(side="left", padx=5)
        tk.Button(input_frame, text="Gözat", command=self.select_input_folder).pack(side="left", padx=5)

        # Çıktı klasörü seçimi
        output_frame = tk.Frame(self)
        output_frame.pack(fill="x", pady=5)
        tk.Label(output_frame, text="Çıktı Klasörü:").pack(side="left", padx=5)
        tk.Entry(output_frame, textvariable=self.output_folder, width=50).pack(side="left", padx=5)
        tk.Button(output_frame, text="Gözat", command=self.select_output_folder).pack(side="left", padx=5)

        # Excel dosyası seçimi
        excel_frame = tk.Frame(self)
        excel_frame.pack(fill="x", pady=5)
        tk.Label(excel_frame, text="Barkod Tablosu:").pack(side="left", padx=5)
        tk.Entry(excel_frame, textvariable=self.excel_path, width=50).pack(side="left", padx=5)
        tk.Button(excel_frame, text="Gözat", command=self.select_excel_file).pack(side="left", padx=5)

        # Tahmini süre
        self.estimate_label = tk.Label(self, text="Tahmini süre: -- dk", font=("Arial", 14))
        self.estimate_label.pack(pady=10)

        # Çalıştırma butonu
        run_button = tk.Button(self, text="Çalıştır", command=self.run_processing, state="disabled")
        run_button.pack(pady=20)
        self.run_button = run_button

        # İlerleme ekranı
        self.progress_text = tk.Text(self, state="disabled", height=15, wrap="word")
        self.progress_text.pack(fill="both", pady=10)

        # Değişkenlerin değişimlerini takip et
        self.input_folder.trace_add("write", self.check_ready)
        self.output_folder.trace_add("write", self.check_ready)
        self.excel_path.trace_add("write", self.check_ready)

    def select_input_folder(self):
        folder = filedialog.askdirectory(title="Girdi Klasörünü Seçin")
        if folder:
            self.input_folder.set(folder)

    def select_output_folder(self):
        folder = filedialog.askdirectory(title="Çıktı Klasörünü Seçin")
        if folder:
            self.output_folder.set(folder)

    def select_excel_file(self):
        file = filedialog.askopenfilename(title="Barkod Tablosunu Seçin", filetypes=[("Excel Dosyaları", "*.xlsx")])
        if file:
            self.excel_path.set(file)

    def check_ready(self, *_):
        if self.input_folder.get() and self.output_folder.get() and self.excel_path.get():
            self.run_button.config(state="normal")
        else:
            self.run_button.config(state="disabled")

    def log_progress(self, message, is_error=False):
        self.progress_text.config(state="normal")
        if is_error:
            self.progress_text.insert("end", f"ERROR: {message}\n")
        else:
            self.progress_text.insert("end", f"{message}\n")
        self.progress_text.see("end")
        self.progress_text.config(state="disabled")

    def run_processing(self):
        input_folder = self.input_folder.get()
        output_folder = self.output_folder.get()
        excel_path = self.excel_path.get()

        try:
            # Barkod Excel dosyasını yükle
            df = pd.read_excel(excel_path)
            df.columns = df.columns.str.strip()

            # Sadece "Beden" sütununda "70 x 70" olanları filtrele
            df_filtered = df[df["Beden"] == "70 x 70"]

            # Girdi klasöründeki tüm JPG dosyalarını al
            images = [f for f in os.listdir(input_folder) if f.endswith(".jpg")]

            if not images:
                messagebox.showerror("Hata", "Girdi klasöründe işlem yapılacak JPG dosyası bulunamadı.")
                return

            # Tahmini süreyi hesapla
            estimated_time = len(images) * 8
            self.estimate_label.config(text=f"İşleniyor... Tahmini süre: {estimated_time // 60} dk {estimated_time % 60} sn")

            start_time = time.time()

            for index, image in enumerate(images, start=1):
                image_file = os.path.join(input_folder, image)

                # Barkod bilgisi al
                try:
                    barcode_row = df_filtered[df_filtered["Desen"] == image]
                    if not barcode_row.empty:
                        barcode_text = barcode_row["Barkod"].values[0]
                    else:
                        raise ValueError("Barkod bilgisi bulunamadı.")
                except Exception as e:
                    self.log_progress(f"{image} için barkod alınırken hata oluştu: {e}", is_error=True)
                    continue

                self.log_progress(f"{image} işleniyor...")

                # İşleme başlama süresi
                process_start_time = time.time()

                success = process_image_with_photoshop(
                    tiff_file=os.path.join(input_folder, "70X70.tif"),
                    image_file=image_file,
                    output_folder=output_folder,
                    barcode_text=barcode_text,
                )

                if success:
                    self.log_progress(f"{image} tamamlandı.")
                else:
                    self.log_progress(f"{image} işlenirken hata oluştu.", is_error=True)

                # Her resim işlendikten sonra tahmini süreyi güncelle
                process_elapsed_time = time.time() - process_start_time
                estimated_time -= process_elapsed_time
                self.estimate_label.config(text=f"İşleniyor... Tahmini süre: {int(estimated_time // 60)} dk {int(estimated_time % 60)} sn")
                self.update()

            elapsed_time = time.time() - start_time
            self.log_progress(f"Tüm dosyalar başarıyla işlendi. Toplam süre: {elapsed_time:.2f} saniye.")
            self.estimate_label.config(text="İşlem tamamlandı!")

        except Exception as e:
            messagebox.showerror("Hata", f"Bir hata oluştu: {e}")
            self.log_progress(f"HATA: {e}", is_error=True)
