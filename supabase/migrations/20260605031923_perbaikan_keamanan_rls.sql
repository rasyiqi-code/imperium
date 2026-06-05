-- 1. Perbaikan Keamanan Fungsi handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- 2. Perbaikan RLS data_member_vip (Cegah kebocoran data antar user)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.data_member_vip;
CREATE POLICY "Users can only access their own VIP data" 
ON public.data_member_vip
FOR ALL 
TO authenticated 
USING (id_user_auth = auth.uid())
WITH CHECK (id_user_auth = auth.uid());

-- 3. Perbaikan RLS data_pembayaran (Cegah kebocoran data transfer antar user)
DROP POLICY IF EXISTS "Full_Access_All_Ops" ON public.data_pembayaran;
CREATE POLICY "Users can only access their own payments" 
ON public.data_pembayaran
FOR ALL 
TO authenticated 
USING (id_user_auth = auth.uid())
WITH CHECK (id_user_auth = auth.uid());

-- 4. Perbaikan RLS profiles (Ganti user_metadata ke JWT Email + admin_internal)
DROP POLICY IF EXISTS "Admins full access" ON public.profiles;
CREATE POLICY "Admins full access" 
ON public.profiles
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_internal 
    WHERE public.admin_internal.email_admin = auth.jwt() ->> 'email'
  )
);
