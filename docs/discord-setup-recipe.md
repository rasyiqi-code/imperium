# Panduan Setup Role & Permission Discord: Imperium Crypto

Dokumen ini berisi panduan ("resep") konfigurasi Role dan Permission pada Server Discord Imperium Crypto untuk mengintegrasikan bot otomatisasi pendaftaran member VIP dan fitur auto-kick.

---

## 1. Setup Role 1: `VIP Member` (Untuk Pengguna Berbayar)

Role ini akan diberikan secara otomatis oleh Bot kepada pengguna yang sukses melakukan pembayaran VIP di website.

### 📝 Rekomendasi Nama Role

- `VIP Member` atau `VIP Inner Circle`

### 🔑 Cara Mendapatkan ID Peran (Role ID)
Untuk memetakan role ini ke file konfigurasi website `.env`:
1. Aktifkan **Developer Mode** di aplikasi Discord Anda (*User Settings -> Advanced -> Developer Mode*).
2. Buka **Server Settings -> Roles**, klik kanan peran VIP yang Anda buat, lalu klik **Copy Role ID** (Salin ID Peran).
3. Tempelkan nilai ID tersebut ke file `.env` pada variabel `DISCORD_VIP_ROLE_ID`.

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

### 🔗 Link Undangan Bot Resmi (Bot Invite Link)
Gunakan link berikut untuk mengundang bot ini masuk ke Server VIP Anda dengan izin default yang diperlukan:
👉 [Link Undang Bot Imperium](https://discord.com/oauth2/authorize?client_id=1511566783566446683&permissions=268436483&integration_type=0&scope=bot)
*(Pastikan Anda memilih Server VIP yang benar saat mengundang).*

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

### 🛠️ Langkah 1: Mendapatkan Application ID (Client ID) & Client Secret
1. Masuk ke [Discord Developer Portal](https://discord.com/developers/applications).
2. Pilih aplikasi Anda (contoh: **Imperium Crypto**).
3. Masuk ke menu **OAuth2 -> General** (atau **General Information**) di panel sebelah kiri.
4. Anda akan melihat **Application ID** atau **Client ID** (salin dan masukkan ke `DISCORD_APPLICATION_ID="..."` di `.env`).
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

### 🤖 Langkah 5: Mengonfigurasi Menu Installation (Default Invite Link)
Menu **Installation** mengatur bagaimana bot diundang ke server secara default tanpa perlu membuat link generator manual berulang kali.

1. Pilih menu **Installation** di panel sebelah kiri.
2. Di bagian **Installation Contexts**, centang keduanya:
   * [x] **User Install**
   * [x] **Guild Install**
3. Di bagian **Install Link**, pilih **Discord Provided Link** pada dropdown.
4. Di bagian **Default Install Settings**:
   * **User Install Scopes:** Pilih `applications.commands`.
   * **Guild Install Scopes:** Tambahkan `bot` dan `applications.commands` pada dropdown.
   * **Permissions:** Setelah scope `bot` ditambahkan, panel izin akan muncul di bawahnya. Centang izin berikut:
     * [x] **Manage Roles** (Mengelola Peran)
     * [x] **Kick Members** (Mengeluarkan Anggota)
     * [x] **Create Instant Invite** (Membuat Undangan)
     * [x] **View Channels** (Melihat Saluran)
5. Klik **Save Changes** di bagian bawah.
6. Sekarang, Anda dapat menyalin tautan di kolom **Install Link** untuk mengundang bot kapan saja dengan izin yang otomatis terkonfigurasi dengan benar.

---

### 📝 Langkah 6: Mengonfigurasi Menu General Information
Menu **General Information** berisi informasi dasar aplikasi Anda.

1. Buka menu **General Information** di panel sebelah kiri.
2. Atur data aplikasi:
   * **App Icon:** Unggah logo aplikasi Imperium Crypto Anda (dimensi disarankan 1024x1024).
   * **Name:** `Imperium Crypto` (Nama bot Anda).
   * **Description:** Deskripsi singkat fungsi bot (opsional).
3. **Penting (Biarkan Kosong/Default):**
   * **Interactions Endpoint URL:** Biarkan kosong. Kita tidak menggunakan endpoint interaksi HTTP langsung.
   * **Linked Roles Verification URL:** Biarkan kosong.
   * **Terms of Service URL** & **Privacy Policy URL:** Biarkan kosong (atau isi jika sudah masuk tahap produksi komersial).
4. Klik **Save Changes**.

---

### 💡 Pengaturan Lain yang Diabaikan (Biarkan Kosong)
Bagian berikut tidak perlu diatur untuk kebutuhan aplikasi kita saat ini:
* **Webhooks** (di menu *Webhooks*).
* **Presence Intent** dan **Message Content Intent** (di menu *Bot -> Privileged Gateway Intents*). Hanya **Server Members Intent** yang wajib aktif.

---

## 7. Konfigurasi File Environment (`.env`)

Untuk menghubungkan seluruh integrasi ini ke website, pastikan variabel berikut diatur dengan benar di file `.env` root proyek Anda:

```env
DISCORD_APPLICATION_ID="1511566783566446683"
DISCORD_CLIENT_SECRET="C2c_dh8SQqJNBb1ciBPyEc9e6a85wInW"
DISCORD_BOT_TOKEN="MTUxMTU2Njc4MzU2NjQ0NjY4Mw.G31_qW.KGkeiBVPTWx2txH0TKg9b8dHA5Wc4-0QcuEd1Q"
DISCORD_VIP_SERVER_ID="ID_SERVER_VIP_ANDA"
DISCORD_VIP_ROLE_ID="ID_ROLE_VIP_ANDA"
DISCORD_REDIRECT_URI="https://<domain-tunnel-anda>.trycloudflare.com/api/discord/callback"
```
