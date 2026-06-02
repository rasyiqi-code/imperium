# 🔍 Analisis Bug — Imperium Crypto Codebase

> Hasil scan menyeluruh terhadap seluruh source code di `/media/rasyiqi/PROJECT/imperium`

---

## 🔴 CRITICAL — Bug yang Bisa Merusak Aplikasi / Keamanan

### 1. Webhook Midtrans — Inkonsistensi `isProduction`

> [!CAUTION]
> Checkout pakai **production**, tapi webhook pakai **sandbox** — pembayaran yang masuk di production TIDAK akan terverifikasi!

| File | `isProduction` |
|------|----------------|
| [checkout/route.ts](file:///media/rasyiqi/PROJECT/imperium/app/api/checkout/route.ts#L9) | `true` |
| [webhook/midtrans/route.ts](file:///media/rasyiqi/PROJECT/imperium/app/api/webhook/midtrans/route.ts#L22) | `false` |

```diff
  // app/api/webhook/midtrans/route.ts
  const core = new midtransClient.CoreApi({
-   isProduction: false,
+   isProduction: true,
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
```

---

### 2. Webhook Midtrans — Tidak Ada Verifikasi Signature

> [!CAUTION]
> Siapapun bisa mengirim POST request ke `/api/webhook/midtrans` dan memalsukan pembayaran!

Di [webhook/midtrans/route.ts](file:///media/rasyiqi/PROJECT/imperium/app/api/webhook/midtrans/route.ts#L11-L14), tidak ada validasi signature Midtrans. Seharusnya webhook harus memverifikasi `signature_key` dari payload untuk memastikan request datang dari Midtrans asli.

---

### 3. Checkout API — Tidak Ada Autentikasi User

> [!WARNING]
> [checkout/route.ts](file:///media/rasyiqi/PROJECT/imperium/app/api/checkout/route.ts#L4-L6) menerima `userId` dari request body tanpa validasi!

Siapa saja bisa membuat transaksi atas nama user lain:
```typescript
// Saat ini — userId dipercaya begitu saja dari client
const { userId, email, nama, harga, paket } = await request.json();
```

Seharusnya userId diambil dari session Supabase di server-side, bukan dari client.

---

### 4. Checkout API — Debug Log Bocorkan Server Key

> [!WARNING]
> [checkout/route.ts:7](file:///media/rasyiqi/PROJECT/imperium/app/api/checkout/route.ts#L7) mencetak sebagian **MIDTRANS_SERVER_KEY** ke console log production!

```typescript
console.log("DEBUG_KEY:", process.env.MIDTRANS_SERVER_KEY?.substring(0, 7) + "...");
```

---

### 5. Admin Panel — Operasi Sensitif via Browser Client (Bukan Server)

> [!WARNING]
> Seluruh operasi admin (hapus user, upgrade VIP, ubah pricing, dll) dilakukan menggunakan **Supabase Browser Client** ([supabase.ts](file:///media/rasyiqi/PROJECT/imperium/lib/supabase.ts)) dengan **Anon Key**.

Jika Supabase RLS (Row Level Security) tidak dikonfigurasi dengan benar, user biasa bisa melakukan operasi admin langsung dari browser console. File yang terdampak:
- [admin-panel/page.tsx](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/page.tsx) — delete & upgrade user
- [admin-panel/members/page.tsx](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/members/page.tsx) — delete, upgrade, deactivate
- [admin-panel/payments/page.tsx](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/payments/page.tsx) — confirm/reject payment
- [admin-panel/pricing/page.tsx](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/pricing/page.tsx) — edit pricing

---

## 🟠 HIGH — Bug Logic & Runtime Error

### 6. Group Page — Status VIP Di-hardcode `false`

> [!IMPORTANT]
> [group/page.tsx:5](file:///media/rasyiqi/PROJECT/imperium/app/(user)/dashboard/group/page.tsx#L5): `const isVip = false;` — VIP user TETAP tidak bisa akses VIP group!

```typescript
const isVip = false; // Nanti hubungkan ke status user real ← BELUM DIIMPLEMENTASI!
```

Seharusnya cek status dari Supabase auth + data membership.

---

### 7. Group Page — Link Discord Hardcoded Placeholder

> [!IMPORTANT]
> [group/page.tsx:17](file:///media/rasyiqi/PROJECT/imperium/app/(user)/dashboard/group/page.tsx#L17): Link Discord berisi `"LINK_DISCORD_FREE"` (literal string bukan URL).

```html
<a href="LINK_DISCORD_FREE" ...>
```

---

### 8. Profile Page — Kolom Database Salah

[profile/page.tsx:39](file:///media/rasyiqi/PROJECT/imperium/app/(user)/dashboard/profile/page.tsx#L39) memilih kolom `status_vip` dan `masa_aktif` dari tabel `data_member_vip`, tapi berdasarkan [types.ts](file:///media/rasyiqi/PROJECT/imperium/lib/types.ts) interface `MemberVIP`, kolom yang benar adalah:
- `status_aktif` (bukan `status_vip`)
- `tanggal_berakhir` (bukan `masa_aktif`)

```diff
  const { data: dbData } = await supabase
    .from('data_member_vip')
-   .select('nama_member, nomor_wa, status_vip, masa_aktif')
+   .select('nama_member, nomor_wa, status_aktif, tanggal_berakhir')
```

Akibatnya: status membership dan tanggal expired selalu `null` di halaman profil.

---

### 9. DiscordCard — Status Check Tidak Lengkap

[DiscordCard.tsx:9](file:///media/rasyiqi/PROJECT/imperium/components/DiscordCard.tsx#L9): Hanya cek `status_aktif === 'aktif'`, tapi di [dashboard/page.tsx:78](file:///media/rasyiqi/PROJECT/imperium/app/(user)/dashboard/page.tsx#L78) juga cek `'vip'`.

```typescript
// DiscordCard.tsx — hanya cek 'aktif'
const isAktif = member?.status_aktif === 'aktif'

// dashboard/page.tsx — cek 'aktif' ATAU 'vip'
const isVip = member?.status_aktif === 'aktif' || member?.status_aktif === 'vip'
```

User dengan `status_aktif = 'vip'` akan dianggap VIP di dashboard tapi **tidak bisa akses Discord**.

---

### 10. StatusCard — Status `'vip'` dan `'free'` Masuk ke Default (Merah)

[StatusCard.tsx:9-14](file:///media/rasyiqi/PROJECT/imperium/components/StatusCard.tsx#L9-L14): Switch statement tidak menangani `'vip'` dan `'free'`:

```typescript
switch (status) {
  case 'aktif': return '...green...'
  case 'menunggu': return '...yellow...'
  default: return '...red...'  // ← 'vip' dan 'free' juga jadi MERAH!
}
```

---

### 11. Support Page (User) — Order by Kolom yang Mungkin Tidak Ada

[support/page.tsx:17](file:///media/rasyiqi/PROJECT/imperium/app/(user)/dashboard/support/page.tsx#L17): Query `.order('sort_order', ...)` pada tabel `support_faqs`. Namun di [supabase.ts](file:///media/rasyiqi/PROJECT/imperium/lib/supabase.ts) type definition dan di admin support page, kolom yang ada adalah `created_at` (bukan `sort_order`). Akan error jika kolom tersebut tidak ada.

---

### 12. Webhook Midtrans — Tidak Set `tanggal_berakhir`

[webhook/midtrans/route.ts:46-48](file:///media/rasyiqi/PROJECT/imperium/app/api/webhook/midtrans/route.ts#L46-L48): Saat pembayaran sukses, hanya set `status_aktif: 'aktif'` tapi **tidak set `tanggal_berakhir`**. Bandingkan dengan admin manual upgrade di [members/page.tsx:76-87](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/members/page.tsx#L76-L87) yang benar-benar set expiry date.

Akibatnya: user yang bayar via Midtrans tidak punya tanggal expired.

---

### 13. Webhook Midtrans — Tidak Set `nama_paket` di Member VIP

Selain tidak set `tanggal_berakhir`, webhook juga hanya melakukan `update`, bukan `insert`. Jika belum ada row di `data_member_vip`, update tidak akan mengubah apapun.

---

## 🟡 MEDIUM — Bug Logic & Data Inconsistency

### 14. Login — `setLoading(false)` Tidak Dipanggil pada Sukses

[login/page.tsx:22-67](file:///media/rasyiqi/PROJECT/imperium/app/(auth)/login/page.tsx#L22-L67): Jika login berhasil, flow masuk `setTimeout` untuk redirect, tapi `setLoading(false)` hanya ada di `catch`. Jika redirect gagal (misal URL typo), spinner akan stuck selamanya.

---

### 15. Register — Email Confirmation Terlewat

[register/page.tsx:44-51](file:///media/rasyiqi/PROJECT/imperium/app/(auth)/register/page.tsx#L44-L51): Setelah `signUp`, langsung redirect ke `/dashboard` tanpa cek apakah Supabase dikonfigurasi untuk email confirmation. Jika email confirmation aktif, `authData.user` masih ada tapi session belum valid, user akan diarahkan ke dashboard dan langsung error.

---

### 16. Admin Panel — Omzet Dihitung dari SEMUA Data (Termasuk Gagal/Pending)

[admin-panel/page.tsx:46](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/page.tsx#L46):
```typescript
const totalOmzet = vips.reduce((acc, curr) => acc + (Number(curr.harga_bayar) || 0), 0)
```

Tidak ada filter `status_aktif === 'aktif'`, jadi omzet termasuk member yang hangus/menunggu.

---

### 17. Admin Delete User — Hanya Hapus dari `profiles`, Tidak dari `data_member_vip`

[admin-panel/page.tsx:91](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/page.tsx#L91): `handleDeleteUser` hanya menghapus dari tabel `profiles`, meninggalkan data orphan di `data_member_vip` dan `data_pembayaran`.

---

### 18. Snap.js URL — Sandbox vs Production

[layout.tsx:23](file:///media/rasyiqi/PROJECT/imperium/app/layout.tsx#L23): Script Snap.js menggunakan URL **sandbox** (`app.sandbox.midtrans.com`), tapi checkout route pakai `isProduction: true`. Ini akan menyebabkan token mismatch.

```diff
  <Script
-   src="https://app.sandbox.midtrans.com/snap/snap.js"
+   src="https://app.midtrans.com/snap/snap.js"
```

---

### 19. Pricing Component (Landing) — Fitur VIP Statis, Bukan dari Database

[Pricing.tsx:140-151](file:///media/rasyiqi/PROJECT/imperium/components/Pricing.tsx#L140-L151): Fitur paket VIP di landing page di-hardcode, padahal data `fitur` sudah ada di database `data_paket_vip`. Jika admin mengubah fitur via [admin pricing editor](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/pricing/page.tsx), perubahan **tidak muncul** di landing page.

---

### 20. `Lupa Password` Link Tidak Fungsional

[login/page.tsx:110](file:///media/rasyiqi/PROJECT/imperium/app/(auth)/login/page.tsx#L110): Link "Lupa?" mengarah ke `href="#"` — tidak ada halaman reset password.

---

## 🔵 LOW — Code Quality & Maintainability

### 21. File `lib/discord.ts` Kosong

[discord.ts](file:///media/rasyiqi/PROJECT/imperium/lib/discord.ts) berukuran 0 byte — file kosong yang tidak digunakan. Dependency `discord.js` ada di `package.json` tapi tidak dipakai di manapun.

### 22. Prisma Schema Tidak Sinkron dengan Supabase

[schema.prisma](file:///media/rasyiqi/PROJECT/imperium/prisma/schema.prisma) mendefinisikan model `User`, `Payment`, `AccessToken`, tapi aplikasi sepenuhnya menggunakan Supabase tables (`profiles`, `data_member_vip`, dll). Prisma schema tampak unused atau dari iterasi sebelumnya.

### 23. Package `@supabase/auth-helpers-nextjs` Deprecated

Output `npm install` menunjukkan:
```
npm warn deprecated @supabase/auth-helpers-nextjs@0.15.0: Package no longer supported.
```
Package ini sudah deprecated, dan aplikasi sudah benar menggunakan `@supabase/ssr` — jadi `auth-helpers-nextjs` bisa dihapus dari dependencies.

### 24. Banyak `as any` dan `as unknown` Type Casting

Terutama di file admin:
- [members/page.tsx](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/members/page.tsx) — 6+ castings
- [payments/page.tsx](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/payments/page.tsx) — 5+ castings
- [support/page.tsx (admin)](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/support/page.tsx) — custom `SupabaseBypass` interface

Root cause: Tabel-tabel seperti `data_pembayaran`, `data_paket_vip`, `admin_settings` belum didefinisikan di [supabase.ts Database interface](file:///media/rasyiqi/PROJECT/imperium/lib/supabase.ts#L3-L37).

### 25. `useCallback` dengan `db` sebagai dependency menyebabkan infinite loop

[admin support/page.tsx:59-73](file:///media/rasyiqi/PROJECT/imperium/app/(admin)/admin-panel/support/page.tsx#L59-L73): `fetchData` menggunakan `useCallback` dengan `db` sebagai dependency. `db` di-assign dari `supabase as unknown` yang dibuat fresh setiap render, menyebabkan `fetchData` dan `useEffect` bisa re-trigger terus-menerus.

---

## 📊 Ringkasan

| Severity | Jumlah | Contoh Dampak |
|----------|--------|---------------|
| 🔴 Critical | 5 | Payment fraud, data leak, no auth on API |
| 🟠 High | 8 | VIP features broken, wrong data |
| 🟡 Medium | 7 | Incorrect calculations, UX issues |
| 🔵 Low | 5 | Tech debt, unused code |
| **Total** | **25** | |

---

> [!IMPORTANT]
> **Prioritas fix yang direkomendasikan:**
> 1. Sync `isProduction` flag (checkout + webhook + snap.js URL)
> 2. Tambah signature verification di webhook
> 3. Hapus debug log server key di checkout API
> 4. Fix group page hardcoded `isVip = false`
> 5. Fix profile page kolom database salah

Silakan beri tahu jika kamu ingin saya **langsung memperbaiki** bug-bug ini!
