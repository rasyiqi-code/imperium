import os
from PIL import Image

# Direktori proyek
root_dir = "/media/rasyiqi/PROJECT/imperium"
public_dir = os.path.join(root_dir, "public")
app_dir = os.path.join(root_dir, "app")

def optimize_icon():
    # 1. Optimasi app/icon.png
    icon_path = os.path.join(app_dir, "icon.png")
    if os.path.exists(icon_path):
        print(f"Mengoptimalkan {icon_path}...")
        img = Image.open(icon_path)
        # Resize ke 192x192 px
        img_resized = img.resize((192, 192), Image.Resampling.LANCZOS)
        # Simpan kembali sebagai PNG terkompresi
        img_resized.save(icon_path, "PNG", optimize=True)
        print(f"Selesai mengoptimalkan icon.png. Ukuran baru: {os.path.getsize(icon_path) / 1024:.2f} KB")

def convert_to_webp(filename, quality=80):
    # Konversi file gambar PNG/JPEG di folder public menjadi WebP
    src_path = os.path.join(public_dir, filename)
    name, _ = os.path.splitext(filename)
    dest_path = os.path.join(public_dir, f"{name}.webp")
    
    if os.path.exists(src_path):
        print(f"Mengonversi {src_path} ke WebP...")
        img = Image.open(src_path)
        # Konversi ke RGB jika format gambar adalah RGBA tetapi kita menyimpannya sebagai WebP (WebP mendukung RGBA, jadi aman)
        img.save(dest_path, "WEBP", quality=quality, method=6)
        print(f"Selesai mengonversi ke {dest_path}. Ukuran baru: {os.path.getsize(dest_path) / 1024:.2f} KB")
        # Hapus file lama jika berhasil dibuat
        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
            os.remove(src_path)
            print(f"Menghapus file asli {src_path}")

if __name__ == "__main__":
    optimize_icon()
    convert_to_webp("chart.png", quality=85)
    convert_to_webp("crypto_login.png", quality=80)
    convert_to_webp("logo.png", quality=85)
