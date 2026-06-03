# Imperium Crypto

Imperium Crypto adalah platform web keanggotaan premium (VIP) dan edukasi investasi cryptocurrency berbasis data (*data-driven*). Platform ini dirancang menggunakan arsitektur modern Next.js yang mengintegrasikan gerbang pembayaran (**Midtrans BI SNAP**) dan bot otomatisasi server **Discord** untuk mengelola hak akses VIP secara *real-time*.

---

## 🚀 Fitur Utama

- **Otomatisasi Server Discord**:
  - **OAuth2 Login**: Menghubungkan akun website dengan akun Discord pengguna secara aman.
  - **Pemberian Role Otomatis**: Secara instan memberikan role `VIP Member` setelah pembayaran dikonfirmasi.
  - **Auto-Kick Otomatis**: Mendeteksi keanggotaan VIP yang kedaluwarsa secara berkala dan mengeluarkan pengguna yang tidak aktif dari Server VIP.
- **Integrasi Pembayaran Midtrans BI SNAP**:
  - Mendukung standar API nasional (BI SNAP) untuk pemrosesan pembayaran asimetris (SHA256withRSA) dan simetris (HMAC-SHA512).
  - Webhook otomatis untuk memperbarui status transaksi secara real-time.
- **Panel Dashboard Admin**:
  - **Manajemen Pengaturan**: Mengonfigurasi integrasi Midtrans, Discord, dan Resend API langsung dari UI admin.
  - **Keamanan Kredensial**: Input kredensial sensitif dilengkapi dengan fitur *show/hide* dan tombol *lock/unlock* guna mencegah perubahan tidak disengaja.
  - **Manajemen Member**: Pemantauan status keanggotaan, email, sisa waktu berlangganan, serta status integrasi Discord masing-masing pengguna.
- **Edukasi & Portal Member**:
  - Halaman edukasi cryptocurrency premium yang hanya dapat diakses oleh member aktif.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Database & ORM**: [Prisma](https://www.prisma.io/) & [Supabase (PostgreSQL)](https://supabase.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) dengan `@tailwindcss/postcss`
- **Komponen & UI**: [Lucide React](https://lucide.dev/), [Swiper](https://swiperjs.com/)
- **Integrasi Pihak Ketiga**:
  - `discord.js` untuk interaksi Bot Discord.
  - API BI SNAP Midtrans untuk gerbang pembayaran.

---

## 📂 Struktur Direktori Penting

```text
├── app/                  # Direktori utama aplikasi Next.js (App Router)
│   ├── (admin)/          # Rute dashboard administrasi
│   ├── (auth)/           # Rute registrasi, login, dan autentikasi
│   ├── (user)/           # Rute khusus pengguna/member
│   └── api/              # Endpoint API backend (Cron, Webhook, Discord Callback)
├── components/           # Komponen UI modular reusable
├── docs/                 # Panduan & dokumentasi teknis pendukung
│   ├── discord-setup-recipe.md   # Panduan konfigurasi server & aplikasi bot Discord
│   └── midtrans-bi-snap.md       # Dokumentasi konfigurasi kunci & alur BI SNAP
├── lib/                  # Fungsi utilitas, helper API, dan inisialisasi prisma/supabase
├── prisma/               # Skema database PostgreSQL
├── scripts/              # Skrip pengujian dan manajemen administratif
└── package.json          # File konfigurasi dependensi npm/bun
```

---

## ⚙️ Persyaratan Sistem & Instalasi

### 1. Prasyarat
Pastikan komputer Anda sudah terinstal:
- **Bun** (sebagai runtime utama dan package manager)
- **Node.js** (v18 ke atas)
- **PostgreSQL** atau proyek **Supabase** yang aktif

### 2. Pengaturan Berkas `.env`
Salin berkas `.env.example` menjadi `.env` di direktori root proyek:
```bash
cp .env.example .env
```
Isi variabel-variabel lingkungan berikut sesuai dengan akun dan pengaturan Anda:

```env
# Database & Supabase
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Midtrans BI SNAP
MIDTRANS_BI_SNAP_CLIENT_ID="cZskzETq-..."
MIDTRANS_BI_SNAP_CLIENT_SECRET="..."
MIDTRANS_BI_SNAP_PRIVATE_KEY_PATH="./private-key-pkcs8.pem"

# Discord Bot Integration
DISCORD_APPLICATION_ID="..."
DISCORD_CLIENT_SECRET="..."
DISCORD_BOT_TOKEN="..."
DISCORD_VIP_SERVER_ID="..."
DISCORD_VIP_ROLE_ID="..."
DISCORD_REDIRECT_URI="https://<domain-anda>/api/discord/callback"
```

### 3. Instalasi Dependensi
Jalankan perintah berikut untuk menginstal dependensi:
```bash
bun install
```

### 4. Sinkronisasi Database
Lakukan push skema database Prisma ke Supabase/PostgreSQL:
```bash
bun prisma db push
```

### 5. Jalankan Aplikasi
Jalankan server pengembangan lokal:
```bash
bun dev
```
Buka [http://localhost:3000](http://localhost:3000) pada peramban/browser Anda untuk melihat hasilnya.

---

## 🔧 Skrip Utilitas & Pengujian (`/scripts`)

Tersedia beberapa skrip siap pakai untuk mempermudah administrasi dan pengujian sistem di lingkungan lokal:

- **Membuat Admin Baru**:
  ```bash
  bun run scripts/create-admin.ts
  ```
- **Menguji Alur Auto-Kick Member VIP**:
  ```bash
  bun run scripts/test-autokick.ts
  ```
- **Pengecekan Roles & Koneksi Bot Discord**:
  ```bash
  bun run scripts/check-discord-roles.ts
  ```
- **Migrasi Data Pengaturan Admin**:
  ```bash
  bun run scripts/migrate-admin-settings.ts
  ```

---

## 📖 Dokumentasi Pendukung

Untuk panduan mendalam tentang setup integrasi pihak ketiga, silakan baca dokumentasi berikut:
1. **Panduan Lengkap Setup Discord**: [docs/discord-setup-recipe.md](docs/discord-setup-recipe.md)
2. **Panduan Kredensial & RSA Key Midtrans**: [docs/midtrans-bi-snap.md](docs/midtrans-bi-snap.md)
