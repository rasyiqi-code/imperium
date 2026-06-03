# Perbandingan Integrasi Discord: Skenario A (Auto-Kick) vs Skenario B (Role Revocation)

Dokumen ini membandingkan dua pendekatan untuk mengelola keanggotaan Discord pada platform **Imperium Crypto**: **Skenario A (Auto-Kick)** yang mengeluarkan pengguna dari server saat masa aktif VIP habis, dan **Skenario B (Role Revocation)** yang hanya mencabut akses VIP namun membiarkan pengguna tetap berada di server sebagai anggota gratis.

---

## 📊 Matriks Perbandingan Ringkas

| Parameter | Skenario A (Auto-Kick) | Skenario B (Role Revocation) [Direkomendasikan] |
| :--- | :--- | :--- |
| **Akses Anggota Gratis** | Dilarang masuk server Discord sama sekali. | Boleh masuk server, hanya bisa melihat channel publik. |
| **Ketika VIP Expired** | Ditendang (kick) otomatis dari server. | Akun tetap di server, Role VIP dicabut otomatis. |
| **Saluran VIP (Private)** | Terkunci (karena tidak di server). | Tersembunyi otomatis dari pandangan mata. |
| **Friction Re-subscribe** | Tinggi (User harus klik link invite & masuk ulang). | Sangat Rendah (Role VIP langsung aktif kembali tanpa aksi user). |
| **Potensi Konversi (Marketing)**| Rendah (Tidak ada paparan konten setelah keluar).| Tinggi (Tetap terpapar info promo, testi, & edukasi gratis). |
| **Sentimen Pengguna** | Kurang baik (Terasa seperti "diusir secara kasar").| Baik (Dihargai sebagai bagian dari komunitas umum). |
| **Beban API Discord** | Rendah (Hanya 1 request DELETE member). | Sangat Rendah (Hanya 1 request DELETE role). |

---

## 🔍 Analisis Mendalam Kedua Skenario

### Skenario A: Auto-Kick (Total Removal)
Pada skenario ini, server Discord bersifat **100% Eksklusif**. Hanya orang yang memiliki keanggotaan VIP aktif yang diizinkan berada di dalam server.

* **Alur UI/UX Website:**
  * **Free Member:** Tombol Discord di dashboard terkunci (`disabled`) dengan tulisan "Link Terkunci".
  * **VIP Member:** Tombol aktif bertuliskan "Hubungkan Akun Discord VIP" (mengarahkan ke OAuth2).
  * **Expired Member:** Tombol otomatis terkunci kembali setelah ditendang oleh sistem cron job.
* **Kelebihan:**
  * Menjaga eksklusivitas server secara maksimal.
  * Manajemen server lebih rapi karena jumlah member sama persis dengan jumlah pelanggan aktif.
* **Kekurangan:**
  * **Kehilangan Peluang Marketing:** Begitu member keluar dari server, Anda kehilangan saluran komunikasi langsung untuk menawarkan promo perpanjangan.
  * **Friction Tinggi:** Jika pengguna ingin berlangganan lagi setelah beberapa bulan, mereka harus mengulangi proses otorisasi dan join server dari awal.

---

### Skenario B: Role Revocation (Downgrade ke Free Member)
Pada skenario ini, server Discord berfungsi sebagai **Hybrid Community**. Gabungan antara ruang publik (gratisan) dan ruang privat (VIP).

* **Alur UI/UX Website:**
  * **Free Member:** Tombol aktif bertuliskan **"Gabung Komunitas Discord"**. Badge status menampilkan `Akses: Anggota Gratis`.
  * **VIP Member:** Tombol aktif bertuliskan **"Hubungkan Discord & Klaim Role VIP"**. Badge status bersinar emas: `Akses: VIP Member (Aktif)`.
  * **Expired Member:** Badge status turun menjadi `Akses: Anggota Gratis`. Tombol di dashboard tetap aktif untuk mengarahkan pengguna masuk ke server biasa.
* **Kelebihan:**
  * **Marketing Funnel yang Kuat:** Anda dapat membuat saluran gratisan (seperti `#free-analysis`, `#testimoni-cuan`, `#promo-update`). Member gratis tetap berada di sana dan terpapar hasil profit dari member VIP, memicu mereka untuk melakukan upgrade.
  * **Frictionless Renewal:** Pengguna yang memperpanjang langganan VIP tidak perlu melakukan klik otorisasi ulang di website. Sistem backend secara otomatis mendeteksi pembayaran sukses dan langsung menyematkan kembali role VIP ke akun Discord mereka secara instan.
  * **Sentimen Positif:** Member merasa tetap dihargai sebagai bagian dari komunitas umum dan tidak merasa terusir secara sepihak.
* **Kekurangan:**
  * Membutuhkan pengaturan awal izin kategori saluran privat di Discord secara lebih teliti (menyembunyikan kategori VIP dari role `@everyone`).

---

## 💡 Rekomendasi Senior Engineer & Product Designer

Untuk kelangsungan bisnis **Imperium Crypto**, **Skenario B (Role Revocation)** jauh lebih unggul karena alasan-alasan berikut:

1. **Retensi & Konversi:** Server Discord gratisan bertindak sebagai wadah edukasi prospek (lead magnet). Menendang member gratisan berarti membuang calon pembeli potensial.
2. **Kemudahan Operasional:** Skenario B meminimalkan keluhan pengguna seperti *"Saya sudah bayar tapi kok belum bisa masuk server?"* karena mereka sudah berada di dalam server, sistem tinggal memberikan role secara instan di background.
3. **Fleksibilitas Skala Komunitas:** Memiliki ribuan member gratis di server Discord publik memberikan bukti sosial (*social proof*) bahwa komunitas Imperium Crypto dipercaya oleh banyak orang.
