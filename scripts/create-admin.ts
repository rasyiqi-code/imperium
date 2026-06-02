import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum terkonfigurasi di file .env');
  process.exit(1);
}

// Buat client Supabase dengan hak akses penuh (Service Role)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const adminEmail = 'admin@imperium.com';
const adminPassword = 'PasswordAdmin123!';

async function run() {
  console.log(`Mencoba membuat akun admin: ${adminEmail}...`);

  // 1. Buat User baru di Auth Supabase (langsung terkonfirmasi)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Admin Imperium',
      whatsapp_number: '08123456789'
    }
  });

  let userId: string;

  if (authError) {
    // Jika user sudah terdaftar di auth, cari ID-nya
    if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
      console.log('User Auth sudah terdaftar. Mencari ID user...');
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('Gagal mengambil daftar user:', listError.message);
        process.exit(1);
      }
      const existingUser = usersData.users.find(u => u.email === adminEmail);
      if (!existingUser) {
        console.error('User tidak ditemukan dalam daftar.');
        process.exit(1);
      }
      userId = existingUser.id;
      console.log(`ID User ditemukan: ${userId}`);
    } else {
      console.error('Gagal membuat user auth:', authError.message);
      process.exit(1);
    }
  } else {
    userId = authData.user.id;
    console.log(`User Auth berhasil dibuat dengan ID: ${userId}`);
  }

  // Jeda sebentar agar database trigger "on_auth_user_created" selesai memasukkan baris ke tabel profiles
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 2. Update plan menjadi 'admin' di tabel profiles
  console.log(`Mengubah plan user ${userId} menjadi 'admin' di tabel profiles...`);
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ plan: 'admin' })
    .eq('id', userId);

  if (profileError) {
    console.error('Gagal mengupdate profile plan:', profileError.message);
    
    // Jika baris belum ada di profiles, kita coba insert manual
    console.log('Mencoba melakukan insert manual ke tabel profiles...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'Admin Imperium',
        plan: 'admin'
      });

    if (insertError) {
      console.error('Gagal melakukan insert manual:', insertError.message);
      process.exit(1);
    }
  }

  console.log('\n==================================================');
  console.log('🎉 AKUN ADMIN BERHASIL DIBUAT/DIKONFIGURASI!');
  console.log('--------------------------------------------------');
  console.log(`Email   : ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log('==================================================\n');
}

run();
