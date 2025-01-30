// ExtendScript: Photoshop işlemleri

// 1. Parametreleri al
var tiffFile = File(arguments[0]);  
var imageFile = File(arguments[1]);  
var outputFolder = arguments[2];  
var barcodeText = arguments[3];  
var bedenType = arguments[4];    

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
var pastedLayer1 = doc.activeLayer; // Yapıştırılan resim katmanı

// İşlemler beden türüne göre ayrılıyor
if (bedenType === "70 x 70") {
    var rect1 = doc.artLayers.getByName("Rectangle 1");
    var rect1Copy = doc.artLayers.getByName("Rectangle 1 copy");

    // 1️⃣ Genişliği Rectangle 1 ile eşitle
    var scaleFactor = ((rect1.bounds[2] - rect1.bounds[0]) / pastedLayer1.bounds[2]) * 100;
    pastedLayer1.resize(scaleFactor, scaleFactor);

    // 2️⃣ Ortala
    var centerX = (rect1.bounds[0] + rect1.bounds[2]) / 2 - (pastedLayer1.bounds[0] + pastedLayer1.bounds[2]) / 2;
    var centerY = (rect1.bounds[1] + rect1.bounds[3]) / 2 - (pastedLayer1.bounds[1] + pastedLayer1.bounds[3]) / 2;
    pastedLayer1.translate(centerX, centerY);

    // 3️⃣ Yukarı ve aşağı taşan kısımları kırp
    try {
        var cropBounds = doc.artBounds;
        if (cropBounds && cropBounds.length === 4) {
            doc.crop([0, cropBounds[1], doc.width, cropBounds[3]]);
        }
    } catch (e) {
        alert("Kırpma işlemi sırasında hata oluştu: " + e);
    }

    // 4️⃣ Rectangle 1’e oturmuş deseni kopyalayıp Rectangle 1 Copy’e yapıştır
    var pastedLayer2 = pastedLayer1.duplicate();
    var rect1Copy = doc.artLayers.getByName("Rectangle 1 copy");

    pastedLayer2.translate(rect1Copy.bounds[0] - pastedLayer2.bounds[0], rect1Copy.bounds[1] - pastedLayer2.bounds[1]);

    // 5️⃣ Barkod güncelleme (10 adet)
    for (var i = 1; i <= 10; i++) {
        try {
            var barkodLayer = doc.artLayers.getByName("BARKOD " + i);
            barkodLayer.textItem.contents = barcodeText;
        } catch (e) {
            continue;
        }
    }

    // 6️⃣ Katmanları en alta taşı
    pastedLayer1.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
    pastedLayer2.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);

} else if (bedenType === "135 x 135" || bedenType === "150 x 150") {
    var rect1 = doc.artLayers.getByName("Rectangle 1");

    // 1️⃣ Genişliği Rectangle 1 ile eşitle
    var scaleFactor = ((rect1.bounds[2] - rect1.bounds[0]) / pastedLayer1.bounds[2]) * 100;
    pastedLayer1.resize(scaleFactor, scaleFactor);

    // 2️⃣ Ortala
    var centerX = (doc.width - pastedLayer1.bounds[2] + pastedLayer1.bounds[0]) / 2;
    var centerY = (doc.height - pastedLayer1.bounds[3] + pastedLayer1.bounds[1]) / 2;
    pastedLayer1.translate(centerX - pastedLayer1.bounds[0], centerY - pastedLayer1.bounds[1]);

    // 3️⃣ Yukarı ve aşağı taşan kısımları kırp
    try {
        var cropBounds = doc.artBounds;
        if (cropBounds && cropBounds.length === 4) {
            doc.crop([0, cropBounds[1], doc.width, cropBounds[3]]);
        }
    } catch (e) {
        alert("Kırpma işlemi sırasında hata oluştu: " + e);
    }

    // Barkod güncelleme (4 adet)
    for (var i = 1; i <= 4; i++) {
        try {
            var barkodLayer = doc.artLayers.getByName("BARKOD " + i);
            barkodLayer.textItem.contents = barcodeText;
        } catch (e) {
            continue;
        }
    }

    // Katmanı en alta taşı
    pastedLayer1.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);

} else {
    // 1️⃣ Katmanı ortala (Align işlemi yerine manuel hesap)
    var centerX = (doc.width - pastedLayer1.bounds[2] + pastedLayer1.bounds[0]) / 2;
    var centerY = (doc.height - pastedLayer1.bounds[3] + pastedLayer1.bounds[1]) / 2;
    pastedLayer1.translate(centerX - pastedLayer1.bounds[0], centerY - pastedLayer1.bounds[1]);

    // 2️⃣ Kırpma işlemi (crop için alternatif kullanım)
    try {
        var cropBounds = doc.artBounds;
        if (cropBounds && cropBounds.length === 4) {
            doc.crop([cropBounds[0], cropBounds[1], cropBounds[2], cropBounds[3]]);
        }
    } catch (e) {
        // Hata olursa kırpma işlemini atla, ama hata mesajı gösterme
    }

    // Barkod güncelleme (4 adet)
    for (var i = 1; i <= 4; i++) {
        try {
            var barkodLayer = doc.artLayers.getByName("BARKOD " + i);
            barkodLayer.textItem.contents = barcodeText;
        } catch (e) {
            continue;
        }
    }

    // Katmanı en alta taşı
    pastedLayer1.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
}

// 4. Dosyaları kaydet
var jpegSaveFile = File(outputFolder + "/" + barcodeText + ".jpg");
var jpegOptions = new JPEGSaveOptions();
jpegOptions.quality = 12;
doc.saveAs(jpegSaveFile, jpegOptions, true);

// TIFF dosyasını kapat
doc.close(SaveOptions.DONOTSAVECHANGES);