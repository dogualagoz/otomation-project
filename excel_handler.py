import pandas as pd

def get_barcode_from_excel(excel_path, selected_beden, image_name):
    """
    Excel dosyasından barkod bilgisini getirir.

    :param excel_path: Excel dosyasının yolu
    :param selected_beden: Kullanıcının seçtiği beden
    :param image_name: İşlenecek resim adı
    :return: Barkod bilgisi
    """
    df = pd.read_excel(excel_path)
    df.columns = df.columns.str.strip()

    # Seçili bedene göre filtrele
    filtered_df = df[df["Beden"] == selected_beden]

    # Resim adıyla eşleşen barkodu al
    match = filtered_df[filtered_df["Desen"].str.strip() == image_name.strip()]
    if not match.empty:
        return match["Barkod"].values[0]
    else:
        raise ValueError(f"Barkod bulunamadı: {image_name}")