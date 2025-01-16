// ExtendScript: Dinamik dosya işleme

// 1. Parametreleri al
var tiffFile = File(arguments[0]);  // Ana TIFF dosyası
var imageFile = File(arguments[1]);  // İşlenecek resim dosyası
var outputFolder = arguments[2];  // Çıktı klasörü
var barcodeText1 = arguments[3];  // Barkod yazısı 1
var barcodeText2 = arguments[4];  // Barkod yazısı 2

// 2. TIFF dosyasını aç ve bir kopyasını oluştur
if (!tiffFile.exists) {
    alert("TIFF dosyası bulunamadı: " + tiffFile.fsName);
    throw new Error("TIFF dosyası bulunamadı.");
}

var tiffCopy = File(outputFolder + "/temp_copy.tif");
tiffFile.copy(tiffCopy);
var doc = app.open(tiffCopy);
alert("TIFF dosyasının kopyası açıldı.");

// 3. Resim dosyasını aç
if (!imageFile.exists) {
    alert("Resim dosyası bulunamadı: " + imageFile.fsName);
    throw new Error("Resim dosyası bulunamadı.");
}
var imageDoc = app.open(imageFile);
alert("Resim dosyası açıldı.");

// Resmi TIFF dosyasına kopyala ve kapat
imageDoc.selection.selectAll();
imageDoc.selection.copy();
imageDoc.close(SaveOptions.DONOTSAVECHANGES);
doc.paste();
var pastedLayer1 = doc.activeLayer;
alert("Resim TIFF dosyasına yapıştırıldı.");

// 4. Resmi Rectangle 1 ile hizala ve boyutlandır
var rect1;
try {
    rect1 = doc.artLayers.getByName("Rectangle 1");
    alert("Rectangle 1 katmanı bulundu.");
} catch (e) {
    alert("Rectangle 1 katmanı bulunamadı: " + e.message);
    throw new Error("Rectangle 1 katmanı bulunamadı.");
}
var rect1Bounds = rect1.bounds;
pastedLayer1.resize(((rect1Bounds[2] - rect1Bounds[0]) / pastedLayer1.bounds[2]) * 100, ((rect1Bounds[3] - rect1Bounds[1]) / pastedLayer1.bounds[3]) * 100);
pastedLayer1.translate(rect1Bounds[0] - pastedLayer1.bounds[0], rect1Bounds[1] - pastedLayer1.bounds[1]);
alert("Resim Rectangle 1 ile hizalandı.");

// 5. Resmi kopyala ve Rectangle 1 Copy ile hizala
var pastedLayer2 = pastedLayer1.duplicate();
var rect1Copy;
try {
    rect1Copy = doc.artLayers.getByName("Rectangle 1 copy");
    alert("Rectangle 1 copy katmanı bulundu.");
} catch (e) {
    alert("Rectangle 1 copy katmanı bulunamadı: " + e.message);
    throw new Error("Rectangle 1 copy katmanı bulunamadı.");
}
var rect1CopyBounds = rect1Copy.bounds;
pastedLayer2.resize(((rect1CopyBounds[2] - rect1CopyBounds[0]) / pastedLayer2.bounds[2]) * 100, ((rect1CopyBounds[3] - rect1CopyBounds[1]) / pastedLayer2.bounds[3]) * 100);
pastedLayer2.translate(rect1CopyBounds[0] - pastedLayer2.bounds[0], rect1CopyBounds[1] - pastedLayer2.bounds[1]);
alert("Resmin kopyası Rectangle 1 copy ile hizalandı.");

// 6. Layer sıralamasını kontrol et ve düzenle
try {
    pastedLayer1.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
    pastedLayer2.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
    alert("Katman sıralaması düzenlendi. Katman 1 ve Katman 1 kopya en alta taşındı.");
} catch (e) {
    alert("Katman sıralaması yapılırken hata oluştu: " + e.message);
    throw new Error("Katman sıralaması yapılamadı.");
}

// 7. Barkod metinlerini güncelle
try {
    var barcodeLayer1 = doc.artLayers.getByName("BARKOD");
    barcodeLayer1.textItem.contents = barcodeText1;
    alert("BARKOD metni güncellendi: " + barcodeText1);
} catch (e) {
    alert("BARKOD katmanı bulunamadı: " + e.message);
    throw new Error("BARKOD katmanı bulunamadı.");
}

try {
    var barcodeLayer2 = doc.artLayers.getByName("BARKOD 2");
    barcodeLayer2.textItem.contents = barcodeText2;
    alert("BARKOD 2 metni güncellendi: " + barcodeText2);
} catch (e) {
    alert("BARKOD 2 katmanı bulunamadı: " + e.message);
    throw new Error("BARKOD 2 katmanı bulunamadı.");
}

// 8. Dosyaları kaydet
// Dosya adını al
var baseName = decodeURIComponent(imageFile.name).match(/([^\/]+)(?=\.\w+$)/)[0];

// JPEG olarak kaydet
var jpegSaveFile = File(outputFolder + "/" + baseName + "_result.jpg");
var jpegOptions = new JPEGSaveOptions();
jpegOptions.quality = 12;
try {
    doc.saveAs(jpegSaveFile, jpegOptions, true);
    alert("JPEG dosyası kaydedildi: " + jpegSaveFile.fsName);
} catch (e) {
    alert("JPEG kaydetme sırasında hata: " + e.message);
    throw new Error("JPEG kaydetme sırasında hata oluştu.");
}

// TIFF olarak kaydet
var tiffSaveFile = File(outputFolder + "/" + baseName + "_result.tif");
var tiffOptions = new TiffSaveOptions();
tiffOptions.layers = true;
try {
    doc.saveAs(tiffSaveFile, tiffOptions, true);
    alert("TIFF dosyası kaydedildi: " + tiffSaveFile.fsName);
} catch (e) {
    alert("TIFF kaydetme sırasında hata: " + e.message);
    throw new Error("TIFF kaydetme sırasında hata oluştu.");
}

// 9. TIFF dosyasını kapat
try {
    doc.close(SaveOptions.DONOTSAVECHANGES);
    alert("TIFF dosyası kapatıldı.");
} catch (e) {
    alert("TIFF dosyasını kapatırken hata: " + e.message);
    throw new Error("TIFF dosyasını kapatırken hata oluştu.");
}