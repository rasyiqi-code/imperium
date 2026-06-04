import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SQL_STATEMENTS = [
  // 1. Drop existing policies to ensure idempotency
  `DROP POLICY IF EXISTS "Allow select own profile" ON public.profiles;`,
  `DROP POLICY IF EXISTS "Allow update own profile" ON public.profiles;`,
  `DROP POLICY IF EXISTS "Allow select own vip membership" ON public.data_member_vip;`,
  `DROP POLICY IF EXISTS "Allow select own pembayaran" ON public.data_pembayaran;`,
  `DROP POLICY IF EXISTS "Allow insert own pembayaran" ON public.data_pembayaran;`,
  `DROP POLICY IF EXISTS "Allow select own notifications" ON public.notifications;`,
  `DROP POLICY IF EXISTS "Allow update own notifications" ON public.notifications;`,
  `DROP POLICY IF EXISTS "Allow select public paket" ON public.data_paket_vip;`,
  `DROP POLICY IF EXISTS "Allow select public support config" ON public.support_config;`,
  `DROP POLICY IF EXISTS "Allow select public support faqs" ON public.support_faqs;`,

  // 2. Enable Row Level Security (RLS) on all public tables
  `ALTER TABLE public.admin_internal ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.data_member_vip ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.data_paket_vip ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.data_pembayaran ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.support_config ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.support_faqs ENABLE ROW LEVEL SECURITY;`,

  // 3. Define specific security policies
  // Profiles
  `CREATE POLICY "Allow select own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);`,
  `CREATE POLICY "Allow update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);`,

  // Data Member VIP
  `CREATE POLICY "Allow select own vip membership" ON public.data_member_vip FOR SELECT TO authenticated USING (auth.uid() = id_user_auth);`,

  // Data Pembayaran
  `CREATE POLICY "Allow select own pembayaran" ON public.data_pembayaran FOR SELECT TO authenticated USING (auth.uid() = id_user_auth);`,
  `CREATE POLICY "Allow insert own pembayaran" ON public.data_pembayaran FOR INSERT TO authenticated WITH CHECK (auth.uid() = id_user_auth);`,

  // Notifications
  `CREATE POLICY "Allow select own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);`,
  `CREATE POLICY "Allow update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);`,

  // Public read-only tables
  `CREATE POLICY "Allow select public paket" ON public.data_paket_vip FOR SELECT TO anon, authenticated USING (true);`,
  `CREATE POLICY "Allow select public support config" ON public.support_config FOR SELECT TO anon, authenticated USING (true);`,
  `CREATE POLICY "Allow select public support faqs" ON public.support_faqs FOR SELECT TO anon, authenticated USING (true);`
];

async function main() {
  console.log('Memulai penerapan keamanan database (Row Level Security)...');
  
  for (const sql of SQL_STATEMENTS) {
    try {
      console.log(`Menjalankan: ${sql.substring(0, 60)}...`);
      await prisma.$executeRawUnsafe(sql);
    } catch (error: any) {
      console.error(`Gagal menjalankan SQL: ${sql}`);
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('\n🎉 Penerapan RLS dan Security Policies berhasil!');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Terjadi kesalahan fatal:', e);
  await prisma.$disconnect();
  process.exit(1);
});
