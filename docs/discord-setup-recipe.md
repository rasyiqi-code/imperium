# Panduan Setup Role & Permission Discord: Imperium Crypto

Dokumen ini berisi panduan ("resep") konfigurasi Role dan Permission pada Server Discord Imperium Crypto untuk mengintegrasikan bot otomatisasi pendaftaran member VIP dan fitur auto-kick.

---

## 1. Setup Role 1: `VIP Member` (Untuk Pengguna Berbayar)

Role ini akan diberikan secara otomatis oleh Bot kepada pengguna yang sukses melakukan pembayaran VIP di website.

### 📝 Rekomendasi Nama Role
* `VIP Member` atau `VIP Inner Circle`

### ⚙️ Konfigurasi Permission (Role VIP Member)
Aktifkan hanya izin standar untuk anggota komunitas biasa. **Jangan berikan izin administratif.**

#### **General Server Permissions**
* [x] **View Channels** (Mengizinkan melihat channel default/umum)
* [ ] *Nonaktifkan yang lain (Manage Channels, Manage Roles, Manage Webhooks, dll.)*

#### **Membership Permissions**
* [x] **Change Nickname** (Mengizinkan mengubah nama panggilan mereka sendiri di server)
* [ ] *Nonaktifkan yang lain (Create Invite, Kick Members, Ban Members, Timeout Members)*

#### **Text Channel Permissions**
* [x] **Send Messages and Create Posts**
* [x] **Embed Links**
* [x] **Attach Files**
* [x] **Add Reactions**
* [x] **Use External Emoji & Stickers**
* [x] **Read Message History** (Sangat penting agar bisa melihat sinyal/pesan lama)
* [ ] *Nonaktifkan: Mention @everyone, @here, and All Roles*

---

## 2. Setup Role 2: `Imperium Bot` (Untuk Bot Discord)

Role ini biasanya otomatis dibuat saat Anda mengundang Bot menggunakan OAuth2 URL Generator. Namun, Anda harus memastikan izin-izin krusial berikut aktif.

### 📝 Rekomendasi Nama Role
* `Imperium Bot` atau `Imperium Crypto Bot`

### ⚙️ Konfigurasi Permission Penting (Role Bot)
Izin berikut **wajib diaktifkan** agar sistem otomatisasi web Next.js dapat bekerja tanpa error:

#### **General Server Permissions**
* [x] **Manage Roles** (Wajib! Untuk memberikan/mencabut role `VIP Member`)
* [x] **View Channels** (Wajib! Agar bot dapat melihat saluran)

#### **Membership Permissions**
* [x] **Create Invite** (Wajib! Agar bot bisa membuat link undangan sekali pakai jika diperlukan)
* [x] **Kick Members** (Wajib! Untuk menendang member yang masa VIP-nya habis/kedaluwarsa)

---

## 3. Cara Mengatur Hierarki Role (SANGAT PENTING ⚠️)

Discord menerapkan sistem keamanan hierarki. Bot **TIDAK BISA** mengelola, memberikan, atau mencabut role yang posisinya berada di atas level role Bot itu sendiri.

### **Langkah Pengaturan:**
1. Masuk ke **Server Settings** -> **Roles**.
2. Cari role Bot Anda (misal: `Imperium Bot` atau `Imperium Crypto`).
3. Klik dan tahan ikon titik-titik di sebelah kiri nama role Bot, lalu **seret (drag) ke atas** hingga posisinya berada di atas role `VIP Member`.
4. Klik **Save Changes** di bagian bawah.

```text
▲ LEVEL TINGGI (Dapat Mengelola Role di Bawahnya)
│
├── [Role] Imperium Bot (Bot Anda)
├── [Role] VIP Member (Role Anggota Berbayar)
├── [Role] @everyone (Anggota Biasa / Non-VIP)
│
▼ LEVEL RENDAH
```

---

## 4. Setup Saluran Private (VIP Private Channels)

Agar materi edukasi, sinyal, dan ruang obrolan VIP aman dari anggota non-VIP, ikuti panduan ini:

1. Buat Kategori baru bernama **"VIP AREA"**.
2. Klik kanan pada kategori tersebut -> pilih **Edit Category**.
3. Pilih menu **Permissions** -> aktifkan **Private Category**.
4. Di bagian **Who can access this category?**:
   * Tambahkan Role `VIP Member` (berikan akses).
   * Tambahkan Role Bot `Imperium Bot` (berikan akses).
   * Pastikan Role `@everyone` **tidak memiliki akses** (silang merah pada `View Channels`).
5. Buat channel di dalam kategori ini (misal: `#vip-signals`, `#vip-announcements`, `#vip-chat`). Channel tersebut akan otomatis mewarisi (inherit) hak akses private ini.
