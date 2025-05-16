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
imageDoc.selection.selectAll();
imageDoc.selection.copy();
imageDoc.close(SaveOptions.DONOTSAVECHANGES);
doc.paste();
var pastedLayer1 = doc.activeLayer;

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

    // 3️⃣ Taşan kısmı kırp
    try {
        var cropBounds = doc.artBounds;
        if (cropBounds.length === 4) {
            doc.crop([0, cropBounds[1], doc.width, cropBounds[3]]);
        }
    } catch (e) {}

    // 4️⃣ Rectangle 1 Copy için kopyala
    var pastedLayer2 = pastedLayer1.duplicate();
    pastedLayer2.translate(rect1Copy.bounds[0] - pastedLayer2.bounds[0], rect1Copy.bounds[1] - pastedLayer2.bounds[1]);

    // 5️⃣ BARKOD1 ~ BARKOD10
    for (var i = 1; i <= 10; i++) {
        try {
            var barkodLayer = doc.artLayers.getByName("BARKOD" + i);
            barkodLayer.textItem.contents = barcodeText;
        } catch (e) {}
    }

    // 6️⃣ En alta taşı
    pastedLayer1.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
    pastedLayer2.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);

} else {
    // Rectangle 1'e göre resize ve ortalama işlemi (bütün diğer bedenler için)
    var rect1 = doc.artLayers.getByName("Rectangle 1");

    // Oran koruyarak en-boy oranı ile resize
    var targetW = rect1.bounds[2] - rect1.bounds[0];
    var targetH = rect1.bounds[3] - rect1.bounds[1];
    var layerW = pastedLayer1.bounds[2] - pastedLayer1.bounds[0];
    var layerH = pastedLayer1.bounds[3] - pastedLayer1.bounds[1];

    var ratioW = targetW / layerW;
    var ratioH = targetH / layerH;
    var finalRatio = Math.max(ratioW, ratioH); // fazlalık kalacak ama crop ile kesilecek

    pastedLayer1.resize(finalRatio * 100, finalRatio * 100);

    // Ortala
    var centerX = (rect1.bounds[0] + rect1.bounds[2]) / 2 - (pastedLayer1.bounds[0] + pastedLayer1.bounds[2]) / 2;
    var centerY = (rect1.bounds[1] + rect1.bounds[3]) / 2 - (pastedLayer1.bounds[1] + pastedLayer1.bounds[3]) / 2;
    pastedLayer1.translate(centerX, centerY);

    // Kırpma (yukarı ve aşağı)
    try {
        var cropBounds = doc.artBounds;
        if (cropBounds.length === 4) {
            doc.crop([0, cropBounds[1], doc.width, cropBounds[3]]);
        }
    } catch (e) {}

    // Barkod işlemi (135x135, 150x150 ve diğerleri): BARKOD1~BARKOD4
    for (var i = 1; i <= 4; i++) {
        try {
            var barkodLayer = doc.artLayers.getByName("BARKOD" + i);
            barkodLayer.textItem.contents = barcodeText;
        } catch (e) {}
    }

    // En alta taşı
    pastedLayer1.move(doc.artLayers[doc.artLayers.length - 1], ElementPlacement.PLACEAFTER);
}

// 4. JPEG olarak kaydet
var jpegSaveFile = File(outputFolder + "/" + barcodeText + ".jpg");
var jpegOptions = new JPEGSaveOptions();
jpegOptions.quality = 12;
doc.saveAs(jpegSaveFile, jpegOptions, true);

// 5. Kapat
doc.close(SaveOptions.DONOTSAVECHANGES);