// ExtendScript: Photoshop işlemleri

// 1. Parametreleri al
var tiffFile = File(arguments[0]);  // Ana TIFF dosyası
var imageFile = File(arguments[1]);  // İşlenecek resim dosyası
var outputFolder = arguments[2];  // Çıktı klasörü
var barcodeText = arguments[3];  // Barkod yazısı

// 2. TIFF dosyasını aç ve bir kopyasını oluştur
if (!tiffFile.exists) {
    throw new Error("TIFF dosyası bulunamadı: " + tiffFile.fsName);
}

var tiffCopy = File(outputFolder + "/temp_copy.tif");
tiffFile.copy(tiffCopy);
var doc = app.open(tiffCopy);

// 3. Resim dosyasını aç
if (!imageFile.exists) {
    throw new Error("Resim dosyası bulunamadı: " + imageFile.fsName);
}
var imageDoc = app.open(imageFile);

// Resmi TIFF dosyasına kopyala ve kapat
imageDoc.selection.selectAll();
imageDoc.selection.copy();
imageDoc.close(SaveOptions.DONOTSAVECHANGES);
doc.paste();
var pastedLayer1 = doc.activeLayer;

// 4. Resmi Rectangle 1 ile hizala ve boyutlandır
var rect1;
try {
    rect1 = doc.artLayers.getByName("Rectangle 1");
} catch (e) {
    throw new Error("Rectangle 1 katmanı bulunamadı: " + e.message);
}
var rect1Bounds = rect1.bounds;
pastedLayer1.resize(((rect1Bounds[2] - rect1Bounds[0]) / pastedLayer1.bounds[2]) * 100, ((rect1Bounds[3] - rect1Bounds[1]) / pastedLayer1.bounds[3]) * 100);
pastedLayer1.translate(rect1Bounds[0] - pastedLayer1.bounds[0], rect1Bounds[1] - pastedLayer1.bounds[1]);

// 5. Resmi kopyala ve Rectangle 1 Copy ile hizala
var pastedLayer2 = pastedLayer1.duplicate();
var rect1Copy;
try {
    rect1Copy = doc.artLayers.getByName("Rectangle 1 copy");
} catch (e) {
    throw new Error("Rectangle 1 copy katmanı bulunamadı: " + e.message);
}
var rect1CopyBounds = rect1Copy.bounds;
pastedLayer2.resize(((rect1CopyBounds[2] - rect1CopyBounds[0]) / pastedLayer2.bounds[2]) * 100, ((rect1CopyBounds[3] - rect1CopyBounds[1]) / pastedLayer2.bounds[3]) * 100);
pastedLayer2.translate(rect1CopyBounds[0] - pastedLayer2.bounds[0], rect1CopyBounds[1] - pastedLayer2.bounds[1]);

// 6. Layer sıralamasını kontrol et ve düzelt
try {
    pastedLayer1.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
    pastedLayer2.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
} catch (e) {
    throw new Error("Katman sıralaması yapılamadı: " + e.message);
}

// 7. Barkod metinlerini güncelle
try {
    var barcodeLayers = [];
    for (var i = 1; i <= 10; i++) {
        try {
            var layerName = "BARKOD " + i;
            var barcodeLayer = doc.artLayers.getByName(layerName);
            barcodeLayer.textItem.contents = barcodeText;
            barcodeLayers.push(barcodeLayer);
        } catch (e) {
            // Eğer katman yoksa devam et
        }
    }
    if (barcodeLayers.length === 0) {
        throw new Error("Hiçbir BARKOD katmanı bulunamadı.");
    }
} catch (e) {
    throw new Error("Barkod metinleri güncellenirken hata oluştu: " + e.message);
}

// 8. Dosyaları kaydet
var baseName = decodeURIComponent(imageFile.name).match(/([^\/]+)(?=\.\w+$)/)[0];

// JPEG olarak kaydet
var jpegSaveFile = File(outputFolder + "/" + baseName + "_result.jpg");
var jpegOptions = new JPEGSaveOptions();
jpegOptions.quality = 12;
try {
    doc.saveAs(jpegSaveFile, jpegOptions, true);
} catch (e) {
    throw new Error("JPEG kaydetme sırasında hata: " + e.message);
}

// TIFF olarak kaydet
var tiffSaveFile = File(outputFolder + "/" + baseName + "_result.tif");
var tiffOptions = new TiffSaveOptions();
tiffOptions.layers = true;
try {
    doc.saveAs(tiffSaveFile, tiffOptions, true);
} catch (e) {
    throw new Error("TIFF kaydetme sırasında hata: " + e.message);
}

// 9. TIFF dosyasını kapat
try {
    doc.close(SaveOptions.DONOTSAVECHANGES);
} catch (e) {
    throw new Error("TIFF dosyasını kapatırken hata: " + e.message);
}