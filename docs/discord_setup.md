# Panduan Integrasi dan Konfigurasi Discord Bot & Role Server VIP

Dokumen ini menjelaskan langkah-langkah untuk menyiapkan, mengonfigurasi, dan menghubungkan Discord Bot serta Peran (Role) VIP ke aplikasi Imperium.

---

## 1. Cara Mengundang Bot Discord (Invite Bot)

Agar bot dapat memasukkan pengguna ke server dan memberikan role secara otomatis, bot harus diundang ke server VIP dengan izin yang sesuai.

### Langkah-langkah:
1. Dapatkan **Client ID** bot Anda dari Discord Developer Portal (saat ini: `1511566783566446683`).
2. Gunakan link undangan resmi di bawah ini (sudah dikonfigurasi dengan scope `bot` dan nilai izin `268436483`):
   👉 [Link Undang Bot Imperium](https://discord.com/oauth2/authorize?client_id=1511566783566446683&permissions=268436483&integration_type=0&scope=bot)
3. Pilih **Server VIP** Anda pada opsi dropdown yang muncul, lalu selesaikan proses otorisasi.

*Catatan: Izin `268436483` mencakup akses untuk mengelola peran (Manage Roles) dan membuat undangan instan (Create Instant Invite) yang dibutuhkan untuk alur otomatisasi.*

---

## 2. Cara Menambahkan Peran (Role) VIP

Peran VIP adalah identitas yang akan otomatis diberikan kepada pengguna yang membeli paket VIP di website Anda.

### Langkah-langkah:
1. Buka aplikasi Discord Anda, masuk ke Server VIP.
2. Klik nama server di sudut kiri atas -> pilih **Server Settings (Pengaturan Server)** -> **Roles (Peran)**.
3. Klik tombol **Create Role** (Buat Peran).
4. Beri nama peran tersebut (misal: `VIP`).
5. Klik **Save Changes** (Simpan Perubahan).
6. Aktifkan **Developer Mode** di pengaturan akun Discord Anda (jika belum aktif: *User Settings -> Advanced -> Developer Mode*).
7. Kembali ke halaman **Roles**, klik kanan peran `VIP` yang baru Anda buat, lalu pilih **Copy Role ID** (Salin ID Peran).
8. Tempelkan ID tersebut ke file `.env` proyek Anda pada variabel `DISCORD_VIP_ROLE_ID`.

---

## 3. Konfigurasi Tampilan (Display) Role VIP

Pengaturan ini bertujuan agar member VIP terlihat eksklusif dan merasa memiliki nilai lebih dibandingkan anggota gratis.

### Pengaturan di Tab "Display":
* **Role Color (Warna Peran):** Pilih warna premium seperti **Emas/Kuning Terang**, **Ungu**, atau **Biru Neon**.
* **Display role members separately from online members:** **Aktifkan (ON)**. Ini akan memisahkan nama member VIP di kolom kanan server dengan judul kategori khusus ("VIP").
* **Allow anyone to @mention this role:** **Matikan (OFF)**. Hal ini dilakukan untuk menghindari gangguan spam *mention* kepada member VIP dari pengguna biasa.

---

## 4. Konfigurasi Izin (Permissions) Role VIP

Memberikan hak akses yang aman bagi pelanggan VIP tanpa membahayakan keamanan server.

### Izin yang Disarankan (ON):
* **View Channels** (Melihat Saluran)
* **Send Messages** (Mengirim Pesan)
* **Embed Links & Attach Files** (Menyematkan Link & Melampirkan File)
* **Add Reactions & Use External Emojis** (Menambahkan Reaksi & Menggunakan Emoji Eksternal)
* **Read Message History** (Membaca Riwayat Pesan)
* **Connect, Speak, Video** (Izin untuk Saluran Suara/VC)

### Izin yang WAJIB Dimatikan (OFF):
* **Administrator** (Izin akses penuh server)
* **Manage Server** / **Manage Roles** / **Manage Channels**
* **Kick Members** / **Ban Members** / **Moderate Members**
* **Mention @everyone, @here, and All Roles**

---

## 5. Pengaturan Hierarki Peran (Role Hierarchy) ⚠️ CRITICAL

Discord menerapkan aturan hierarki yang ketat: **Bot hanya bisa memberikan peran yang berada di bawah posisi perannya sendiri.** Jika aturan ini dilanggar, server akan mengembalikan error `Missing Permissions (code 50013)`.

### Langkah-langkah Pengaturan:
1. Buka **Server Settings** -> **Roles**.
2. Anda akan melihat daftar peran di kolom kiri (termasuk peran khusus bot Anda, misalnya `Imperium Crypto`).
3. **Klik dan seret (drag) peran bot `Imperium Crypto` ke atas posisi peran `VIP`**.
4. Klik **Save Changes**.

*Setelah langkah ini selesai, bot akan memiliki wewenang penuh untuk memberikan peran VIP kepada pengguna secara otomatis.*

---

## 6. Konfigurasi File Environment (`.env`)

Pastikan semua variabel berikut terisi dengan benar di file `.env` root proyek Anda:

```env
DISCORD_CLIENT_ID="1511566783566446683"
DISCORD_CLIENT_SECRET="C2c_dh8SQqJNBb1ciBPyEc9e6a85wInW"
DISCORD_BOT_TOKEN="MTUxMTU2Njc4MzU2NjQ0NjY4Mw.G31_qW.KGkeiBVPTWx2txH0TKg9b8dHA5Wc4-0QcuEd1Q"
DISCORD_VIP_GUILD_ID="ID_SERVER_VIP_ANDA"
DISCORD_VIP_ROLE_ID="ID_ROLE_VIP_ANDA"
DISCORD_REDIRECT_URI="https://<domain-tunnel-anda>.trycloudflare.com/api/discord/callback"
```
