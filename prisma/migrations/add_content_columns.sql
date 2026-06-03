-- Migrasi: Tambah kolom konten halaman ke tabel support_config
-- Jalankan di Supabase SQL Editor

ALTER TABLE public.support_config
  ADD COLUMN IF NOT EXISTS about_content TEXT DEFAULT 'Imperium Crypto adalah platform edukasi dan sinyal crypto premium terpercaya di Indonesia.',
  ADD COLUMN IF NOT EXISTS privacy_content TEXT DEFAULT 'Kebijakan Privasi kami menjelaskan bagaimana kami mengumpulkan dan melindungi data Anda.',
  ADD COLUMN IF NOT EXISTS terms_content TEXT DEFAULT 'Syarat dan Ketentuan keanggotaan Imperium Crypto yang harus dipatuhi oleh seluruh member.',
  ADD COLUMN IF NOT EXISTS help_content TEXT DEFAULT 'Butuh bantuan? Silakan hubungi kontak support kami di bawah ini atau baca FAQ.';
