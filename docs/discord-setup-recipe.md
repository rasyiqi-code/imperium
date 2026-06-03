# Panduan Setup Role & Permission Discord: Imperium Crypto

Dokumen ini berisi panduan ("resep") konfigurasi Role dan Permission pada Server Discord Imperium Crypto untuk mengintegrasikan bot otomatisasi pendaftaran member VIP dan fitur auto-kick.

---

## 1. Setup Role 1: `VIP Member` (Untuk Pengguna Berbayar)

Role ini akan diberikan secara otomatis oleh Bot kepada pengguna yang sukses melakukan pembayaran VIP di website.

### 📝 Rekomendasi Nama Role

- `VIP Member` atau `VIP Inner Circle`

### ⚙️ Konfigurasi Permission (Role VIP Member)

Aktifkan hanya izin standar untuk anggota komunitas biasa. **Jangan berikan izin administratif.**

#### **General Server Permissions**

- [x] **View Channels** (Mengizinkan melihat channel default/umum)
- [ ] *Nonaktifkan yang lain (Manage Channels, Manage Roles, Manage Webhooks, dll.)*

#### **Membership Permissions**

- [x] **Change Nickname** (Mengizinkan mengubah nama panggilan mereka sendiri di server)
- [ ] *Nonaktifkan yang lain (Create Invite, Kick Members, Ban Members, Timeout Members)*

#### **Text Channel Permissions**

- [x] **Send Messages and Create Posts**
- [x] **Embed Links**
- [x] **Attach Files**
- [x] **Add Reactions**
- [x] **Use External Emoji & Stickers**
- [x] **Read Message History** (Sangat penting agar bisa melihat sinyal/pesan lama)
- [ ] *Nonaktifkan: Mention @everyone, @here, and All Roles*

#### **Voice Channel Permissions**

- [x] **Connect** (Mengizinkan bergabung ke channel suara VIP jika ada)
- [x] **Speak** (Mengizinkan berbicara di channel suara)
- [x] **Video** (Mengizinkan screen share / live stream di channel suara)
- [x] **Use Voice Activity** (Mengizinkan berbicara secara langsung tanpa push-to-talk)
- [ ] *Nonaktifkan: Mute Members, Deafen Members, Move Members (Moderator tools)*

#### **Apps & Events Permissions**

- [x] **Use Application Commands** (Mengizinkan menggunakan slash commands dari aplikasi/bot)
- [x] **Use Activities** (Mengizinkan menggunakan fitur game/activities Discord)
- [ ] *Nonaktifkan: Create Events & Manage Events (Biarkan dinonaktifkan kecuali Anda ingin member bisa membuat event)*

#### **Advanced Permissions**

- [ ] **Administrator** (Wajib dinonaktifkan demi keamanan server!)

---

## 2. Setup Role 2: `Imperium Bot` (Untuk Bot Discord)

Role ini biasanya otomatis dibuat saat Anda mengundang Bot menggunakan OAuth2 URL Generator. Namun, Anda harus memastikan izin-izin krusial berikut aktif.

### 📝 Rekomendasi Nama Role

- `Imperium Bot` atau `Imperium Crypto Bot`

### ⚙️ Konfigurasi Permission Penting (Role Bot)

Izin berikut **wajib diaktifkan** agar sistem otomatisasi web Next.js dapat bekerja tanpa error:

#### **General Server Permissions**

- [x] **Manage Roles** (Wajib! Untuk memberikan/mencabut role `VIP Member`)
- [x] **View Channels** (Wajib! Agar bot dapat melihat saluran)

#### **Membership Permissions**

- [x] **Create Invite** (Wajib! Agar bot bisa membuat link undangan sekali pakai jika diperlukan)
- [x] **Kick Members** (Wajib! Untuk menendang member yang masa VIP-nya habis/kedaluwarsa)

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
   - Tambahkan Role `VIP Member` (berikan akses).
   - Tambahkan Role Bot `Imperium Bot` (berikan akses).
   - Pastikan Role `@everyone` **tidak memiliki akses** (silang merah pada `View Channels`).
5. Buat channel di dalam kategori ini (misal: `#vip-signals`, `#vip-announcements`, `#vip-chat`). Channel tersebut akan otomatis mewarisi (inherit) hak akses private ini.

---

## 5. Panduan Konfigurasi Discord Developer Portal

Berikut adalah panduan langkah demi langkah untuk mengonfigurasi aplikasi Bot Anda di **Discord Developer Portal** agar terhubung dengan website Imperium:

### 🛠️ Langkah 1: Mendapatkan Client ID & Client Secret
1. Masuk ke [Discord Developer Portal](https://discord.com/developers/applications).
2. Pilih aplikasi Anda (contoh: **Imperium Crypto**).
3. Masuk ke menu **OAuth2 -> General** di panel sebelah kiri.
4. Anda akan melihat **Client ID** (salin dan masukkan ke `DISCORD_CLIENT_ID="..."` di `.env`).
5. Klik **Reset Secret** untuk memunculkan **Client Secret** baru. Salin nilainya dan masukkan ke `DISCORD_CLIENT_SECRET="..."` di `.env`.

### 🔑 Langkah 2: Mendapatkan Bot Token
1. Masuk ke menu **Bot** di panel sebelah kiri.
2. Cari bagian **Token** (di bawah kolom Username).
3. Klik tombol **Reset Token** (masukkan kode 2FA jika diminta).
4. Klik **Copy** pada token yang muncul, lalu masukkan ke `DISCORD_BOT_TOKEN="..."` di `.env`.
   > [!WARNING]
   > Token ini hanya muncul sekali. Jika Anda menutup halaman sebelum menyalinnya, Anda harus melakukan *Reset Token* kembali.

### ⚙️ Langkah 3: Mengaktifkan Server Members Intent (PENTING ⚠️)
Agar bot memiliki izin untuk memasukkan dan mengeluarkan (kick) anggota VIP secara otomatis:
1. Masuk ke menu **Bot** di panel sebelah kiri.
2. Gulir ke bawah hingga menemukan bagian **Privileged Gateway Intents**.
3. Aktifkan (geser tombol toggle ke kanan menjadi **ON / Biru**) pada bagian **Server Members Intent**.
4. Klik tombol **Save Changes** di bagian bawah halaman.

### 🔄 Langkah 4: Menambahkan Redirect URI
Agar alur otorisasi (OAuth2) dapat mengarahkan pengguna kembali ke website setelah login sukses:
1. Masuk ke menu **OAuth2 -> General** di panel sebelah kiri.
2. Cari bagian **Redirects** (biasanya di bagian bawah halaman).
3. Klik tombol **Add Redirect** dan masukkan URL callback website Anda:
   * **Untuk Localhost/Localtunnel:**
     ```text
     https://common-webs-deny.loca.lt/api/discord/callback
     ```
   * **Untuk Produksi (VPS/Vercel):**
     ```text
     https://imperiumcrypto.id/api/discord/callback
     ```
4. Klik **Save Changes**.

### 🤖 Langkah 5: Mengundang Bot ke Server VIP Anda
Agar Bot masuk ke server VIP Anda dan dapat mengelola role/anggota:
1. Masuk ke menu **OAuth2 -> URL Generator** di panel sebelah kiri.
2. Pada daftar **Scopes**, centang kotak **`bot`**.
3. Setelah dicentang, bagian **Bot Permissions** akan muncul di bawahnya. Centang izin-izin wajib berikut:
   * [x] **Manage Roles**
   * [x] **Kick Members**
   * [x] **Create Instant Invite**
   * [x] **View Channels**
4. Salin tautan yang muncul pada kolom **Generated URL** di bagian paling bawah halaman.
5. Buka tab baru di browser Anda, tempel tautan tersebut, lalu pilih **Server VIP** Anda untuk mengundang Bot masuk.

---

### 💡 Pengaturan yang Dapat Diabaikan (Biarkan Kosong)
Berdasarkan halaman Discord Developer Portal, bagian berikut **tidak perlu diatur** dan aman dibiarkan kosong:
* **Interactions Endpoint URL**, **Linked Roles Verification URL**, **Terms of Service URL**, dan **Privacy Policy URL** (di menu *General Information* / *OAuth2*).
* **Install Link** (di menu *Installation*).
* **Webhooks** (di menu *Webhooks*).
* **Presence Intent** dan **Message Content Intent** (di menu *Bot*).
