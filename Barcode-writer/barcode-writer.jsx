// Input ve output klasörlerini seçtir
var inputFolder = Folder.selectDialog("Resimler klasörünü seçin");
var outputFolder = Folder.selectDialog("Kaydedilecek klasörü seçin");

if (!inputFolder || !outputFolder) {
    alert("Lütfen hem input hem output klasörlerini seçin!");
    exit();
}

// Input klasöründeki .tif dosyalarını listele
var files = inputFolder.getFiles("*.tif");

if (files.length === 0) {
    alert("Input klasöründe .tif dosyası bulunamadı!");
    exit();
}

// Her .tif dosyası için işlemleri başlat
for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var fileName = decodeURIComponent(file.name).replace(".tif", ""); // Dosya adını al

    try {
        // Photoshop'ta dosyayı aç
        var doc = app.open(file);
        
        // Katmanları kontrol et ve "BARKOD" geçenlerin içeriğini güncelle
        for (var j = 0; j < doc.artLayers.length; j++) {
            var layer = doc.artLayers[j];
            
            if (layer.name.indexOf("BARKOD") !== -1) { // "BARKOD" kelimesini içeriyor mu kontrol et
                if (layer.kind === LayerKind.TEXT) { // Katman bir metin katmanı mı kontrol et
                    layer.textItem.contents = fileName; // Katman yazısını güncelle
                } else {
                    alert("Katman '" + layer.name + "' bir metin katmanı değil, atlanıyor.");
                }
            }
        }

        // Dosyayı output klasörüne JPEG olarak kaydet
        var saveFile = new File(outputFolder + "/" + fileName + ".jpg");
        var jpegOptions = new JPEGSaveOptions();
        jpegOptions.quality = 12;

        doc.saveAs(saveFile, jpegOptions, true);
        doc.close(SaveOptions.DONOTSAVECHANGES);

    } catch (error) {
        alert("Hata Oluştu: " + file.name + " - " + error.message);
    }
}

alert("Tüm dosyalar başarıyla işlendi!");