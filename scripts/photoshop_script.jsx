// ExtendScript: Photoshop işlemleri

// 1. Parametreleri al
var tiffFile = File(arguments[0]);  // Ana TIFF dosyası
var imageFile = File(arguments[1]);  // İşlenecek resim dosyası
var outputFolder = arguments[2];  // Çıktı klasörü
var barcodeText = arguments[3];  // Barkod yazısı
var bedenType = arguments[4];    // Seçili beden tipi

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

// İşlemler beden türüne göre ayrılıyor
if (bedenType === "70 x 70") {
    // İki rectangle kullan
    var rect1 = doc.artLayers.getByName("Rectangle 1");
    var rect1Copy = doc.artLayers.getByName("Rectangle 1 copy");

    // Rectangle 1 için hizalama
    pastedLayer1.resize(((rect1.bounds[2] - rect1.bounds[0]) / pastedLayer1.bounds[2]) * 100, 
                        ((rect1.bounds[3] - rect1.bounds[1]) / pastedLayer1.bounds[3]) * 100);
    pastedLayer1.translate(rect1.bounds[0] - pastedLayer1.bounds[0], 
                           rect1.bounds[1] - pastedLayer1.bounds[1]);

    // Rectangle 1 Copy için kopyalama ve hizalama
    var pastedLayer2 = pastedLayer1.duplicate();
    pastedLayer2.resize(((rect1Copy.bounds[2] - rect1Copy.bounds[0]) / pastedLayer2.bounds[2]) * 100, 
                        ((rect1Copy.bounds[3] - rect1Copy.bounds[1]) / pastedLayer2.bounds[3]) * 100);
    pastedLayer2.translate(rect1Copy.bounds[0] - pastedLayer2.bounds[0], 
                           rect1Copy.bounds[1] - pastedLayer2.bounds[1]);

    // Barkod güncelleme (10 adet)
    for (var i = 1; i <= 10; i++) {
        var barkodLayer = doc.artLayers.getByName("BARKOD " + i);
        barkodLayer.textItem.contents = barcodeText;
    }

    // Katmanları en alta taşı
    pastedLayer1.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
    pastedLayer2.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);

} else {
    // Tek rectangle kullan
    var rect1 = doc.artLayers.getByName("Rectangle 1");

    // Rectangle 1 için hizalama
    pastedLayer1.resize(((rect1.bounds[2] - rect1.bounds[0]) / pastedLayer1.bounds[2]) * 100, 
                        ((rect1.bounds[3] - rect1.bounds[1]) / pastedLayer1.bounds[3]) * 100);
    pastedLayer1.translate(rect1.bounds[0] - pastedLayer1.bounds[0], 
                           rect1.bounds[1] - pastedLayer1.bounds[1]);

    // Barkod güncelleme (4 adet)
    for (var i = 1; i <= 4; i++) {
        var barkodLayer = doc.artLayers.getByName("BARKOD " + i);
        barkodLayer.textItem.contents = barcodeText;
    }

    // Katmanı en alta taşı
    pastedLayer1.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
}

// 4. Dosyaları kaydet
var baseName = decodeURIComponent(imageFile.name).match(/([^\/]+)(?=\.\w+$)/)[0];

// JPEG olarak kaydet
var jpegSaveFile = File(outputFolder + "/" + barcodeText + ".jpg");
var jpegOptions = new JPEGSaveOptions();
jpegOptions.quality = 12;
doc.saveAs(jpegSaveFile, jpegOptions, true);



// TIFF dosyasını kapat
doc.close(SaveOptions.DONOTSAVECHANGES);