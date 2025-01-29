import os
import tkinter as tk
from tkinter import filedialog, messagebox
from utils_photoshop import process_image_with_photoshop
from excel_handler import get_barcode_from_excel
import pandas as pd
import time

class AutomationApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Photoshop Automation Tool")
        self.geometry("800x600")
        self.configure(padx=20, pady=20)

        # Klasör ve dosya seçim değişkenleri
        self.input_folder = tk.StringVar()
        self.output_folder = tk.StringVar()
        self.excel_path = tk.StringVar()
        self.beden_var = tk.StringVar()

        # Başlık
        title_label = tk.Label(self, text="Photoshop Automation Tool", font=("Arial", 20, "bold"))
        title_label.pack(pady=10)

        # Girdi klasörü seçimi
        input_frame = tk.Frame(self)
        input_frame.pack(fill="x", pady=5)
        tk.Label(input_frame, text="Input Folder:").pack(side="left", padx=5)
        tk.Entry(input_frame, textvariable=self.input_folder, width=50).pack(side="left", padx=5)
        tk.Button(input_frame, text="Browse", command=self.select_input_folder).pack(side="left", padx=5)

        # Çıktı klasörü seçimi
        output_frame = tk.Frame(self)
        output_frame.pack(fill="x", pady=5)
        tk.Label(output_frame, text="Output Folder:").pack(side="left", padx=5)
        tk.Entry(output_frame, textvariable=self.output_folder, width=50).pack(side="left", padx=5)
        tk.Button(output_frame, text="Browse", command=self.select_output_folder).pack(side="left", padx=5)

        # Excel dosyası seçimi
        excel_frame = tk.Frame(self)
        excel_frame.pack(fill="x", pady=5)
        tk.Label(excel_frame, text="Barcodes Excel file:").pack(side="left", padx=5)
        tk.Entry(excel_frame, textvariable=self.excel_path, width=50).pack(side="left", padx=5)
        tk.Button(excel_frame, text="Browse", command=self.select_excel_file).pack(side="left", padx=5)

        # Beden seçimi dropdown (GÜNCELLENDİ: Yeni bedenler eklendi)
        beden_frame = tk.Frame(self)
        beden_frame.pack(fill="x", pady=5)
        tk.Label(beden_frame, text="Processed size:").pack(side="left", padx=5)

        beden_options = [
            "70 x 70", "135 x 135", "150 x 150",
            "150 x 170", "150 x 200", "150 x 220", "150 x 250", "150 x 270"
        ]

        beden_dropdown = tk.OptionMenu(beden_frame, self.beden_var, *beden_options)
        beden_dropdown.pack(side="left", padx=5)

        # Tahmini süre
        self.estimate_label = tk.Label(self, text="Estimated Time: -- min", font=("Arial", 14))
        self.estimate_label.pack(pady=10)

        # Çalıştırma butonu
        run_button = tk.Button(self, text="Run", command=self.run_processing, state="disabled")
        run_button.pack(pady=20)
        self.run_button = run_button

        # İlerleme ekranı
        self.progress_text = tk.Text(self, state="disabled", height=15, wrap="word")
        self.progress_text.pack(fill="both", pady=10)

        # Değişkenlerin değişimlerini takip et
        self.input_folder.trace_add("write", self.check_ready)
        self.output_folder.trace_add("write", self.check_ready)
        self.excel_path.trace_add("write", self.check_ready)
        self.beden_var.trace_add("write", self.check_ready)

    def select_input_folder(self):
        folder = filedialog.askdirectory(title="Select Input Folder")
        if folder:
            self.input_folder.set(folder)

    def select_output_folder(self):
        folder = filedialog.askdirectory(title="Select Output Folder")
        if folder:
            self.output_folder.set(folder)

    def select_excel_file(self):
        file = filedialog.askopenfilename(title="Select Barcodes Excel File", filetypes=[("Excel Files", "*.xlsx")])
        if file:
            self.excel_path.set(file)

    def check_ready(self, *_):
        if self.input_folder.get() and self.output_folder.get() and self.excel_path.get() and self.beden_var.get():
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
        selected_beden = self.beden_var.get()  # Seçilen bedeni al

        try:
            df = pd.read_excel(excel_path)
            df.columns = df.columns.str.strip()

            images = [f for f in os.listdir(input_folder) if f.endswith(".jpg")]

            if not images:
                messagebox.showerror("Hata", "Girdi klasöründe işlem yapılacak JPG dosyası bulunamadı.")
                return

            tiff_file_map = {
                "70 x 70": "70X70.tif",
                "135 x 135": "135X135.tif",
                "150 x 150": "150X150.tif",
                "150 x 170": "150X170.tif",
                "150 x 200": "150X200.tif",
                "150 x 220": "150X220.tif",
                "150 x 250": "150X250.tif",
                "150 x 270": "150X270.tif"
            }

            if selected_beden not in tiff_file_map:
                messagebox.showerror("Hata", "Geçersiz beden seçildi!")
                return

            tiff_file = os.path.join(input_folder, tiff_file_map[selected_beden])
            if not os.path.exists(tiff_file):
                messagebox.showerror("Hata", f"TIFF dosyası bulunamadı: {tiff_file}")
                return

            estimated_time = len(images) * 10
            self.estimate_label.config(text=f"İşleniyor... Tahmini süre: {estimated_time // 60} dk {estimated_time % 60} sn")

            start_time = time.time()

            for index, image in enumerate(images, start=1):
                image_file = os.path.join(input_folder, image)

                try:
                    barcode_text = get_barcode_from_excel(excel_path, selected_beden, image)
                except Exception as e:
                    self.log_progress(f"{image} için barkod alınırken hata oluştu: {e}", is_error=True)
                    continue

                self.log_progress(f"{image} işleniyor...")

                process_start_time = time.time()

                success = process_image_with_photoshop(
                    tiff_file=tiff_file,
                    image_file=image_file,
                    output_folder=output_folder,
                    barcode_text=barcode_text,
                    beden_type=selected_beden,
                )

                if success:
                    self.log_progress(f"{image} tamamlandı.")
                else:
                    self.log_progress(f"{image} işlenirken hata oluştu.", is_error=True)

                process_elapsed_time = time.time() - process_start_time
                estimated_time -= process_elapsed_time
                self.estimate_label.config(text=f"İşleniyor... Tahmini süre: {int(estimated_time // 60)} dk {int(estimated_time % 60)} sn")
                self.update()

            elapsed_time = time.time() - start_time
            self.log_progress(f"Tüm dosyalar başarıyla işlendi! Toplam süre: {elapsed_time:.2f} saniye.")
            self.estimate_label.config(text="İşlem tamamlandı!")

        except Exception as e:
            messagebox.showerror("Hata", f"Bir hata oluştu: {e}")
            self.log_progress(f"HATA: {e}", is_error=True)