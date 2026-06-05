-- Tambahkan kolom API key untuk integrasi data pasar (FreeCryptoAPI & CoinMarketCap)
-- ke tabel admin_settings agar admin dapat mengatur API key langsung dari panel admin

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS freecryptoapi_key TEXT,
  ADD COLUMN IF NOT EXISTS coinmarketcap_api_key TEXT;
