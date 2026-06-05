-- Buat Tabel Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_user TEXT NOT NULL,
  foto_user TEXT,
  peran_user TEXT DEFAULT 'Member',
  isi_testi TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  status_tampil BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Aktifkan RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policy untuk semua orang (anon & authenticated): Bisa membaca testimonial yang status_tampil = true
CREATE POLICY "Semua orang bisa melihat testimonial aktif" 
ON public.testimonials
FOR SELECT
USING (status_tampil = true);

-- Policy untuk admin: Akses penuh (CRUD) ke tabel testimonials
CREATE POLICY "Admins full access to testimonials" 
ON public.testimonials
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_internal 
    WHERE public.admin_internal.email_admin = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_internal 
    WHERE public.admin_internal.email_admin = auth.jwt() ->> 'email'
  )
);
