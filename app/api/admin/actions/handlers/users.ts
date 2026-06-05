import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

interface UsersBody {
  ids?: string[]
}

interface UpdatePasswordBody {
  userId?: string
  newPassword?: string
}

/**
 * Menghapus satu atau beberapa akun member secara permanen beserta data relasinya.
 * Mencegah penghapusan akun admin sendiri yang sedang login.
 */
export async function deleteUser(body: UsersBody, currentAdminId: string): Promise<Response> {
  const { ids } = body
  if (!ids || !Array.isArray(ids)) return NextResponse.json({ error: 'Missing ids' }, { status: 400 })

  // Mencegah penghapusan akun sendiri
  if (ids.includes(currentAdminId)) {
    return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri!' }, { status: 400 })
  }

  // Hapus semua data relasi user dan akun otentikasinya di database secara atomik menggunakan Prisma
  await prisma.$transaction([
    prisma.data_member_vip.deleteMany({ where: { id_user_auth: { in: ids } } }),
    prisma.data_pembayaran.deleteMany({ where: { id_user_auth: { in: ids } } }),
    prisma.notifications.deleteMany({ where: { user_id: { in: ids } } }),
    prisma.profiles.deleteMany({ where: { id: { in: ids } } }),
    prisma.users.deleteMany({ where: { id: { in: ids } } })
  ])

  return NextResponse.json({ success: true })
}

/**
 * Mengubah password akun member secara langsung dari sisi server tanpa perlu konfirmasi email.
 */
export async function updateUserPassword(body: UpdatePasswordBody): Promise<Response> {
  const { userId, newPassword } = body
  if (!userId || !newPassword) {
    return NextResponse.json({ error: 'ID Anggota dan password baru wajib diisi' }, { status: 400 })
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Password baru harus memiliki minimal 6 karakter!' }, { status: 400 })
  }

  try {
    // Memperbarui password user secara langsung di database auth.users menggunakan fungsi crypt pgcrypto
    await prisma.$executeRawUnsafe(`
      UPDATE auth.users 
      SET encrypted_password = crypt($1, gen_salt('bf', 10)), updated_at = NOW() 
      WHERE id = $2::uuid
    `, newPassword, userId)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Gagal memperbarui password member via Admin Client:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat memperbarui password' }, { status: 500 })
  }
}

interface CreateAdminBody {
  email?: string
  password?: string
  fullName?: string
  whatsappNumber?: string
}

/**
 * Membuat akun administrator baru secara langsung lewat sisi server menggunakan service role key.
 */
export async function createAdminUser(body: CreateAdminBody): Promise<Response> {
  const { email, password, fullName, whatsappNumber } = body
  if (!email || !password || !fullName) {
    return NextResponse.json({ error: 'Email, password, dan nama lengkap wajib diisi!' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password harus memiliki minimal 6 karakter!' }, { status: 400 })
  }

  try {
    const newUserId = crypto.randomUUID()

    // 1. Buat pengguna langsung di database auth.users dengan password terenkripsi bcrypt
    await prisma.$executeRawUnsafe(`
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at,
        role,
        aud
      ) VALUES (
        $1::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid,
        $2,
        crypt($3, gen_salt('bf', 10)),
        NOW(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        $4::jsonb,
        false,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL,
        'authenticated',
        'authenticated'
      )
    `,
      newUserId,
      email,
      password,
      JSON.stringify({ full_name: fullName, whatsapp_number: whatsappNumber || '' })
    )

    // Jeda 1 detik untuk memberi waktu trigger database profiles selesai jika ada
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 2. Update/upsert tabel profiles untuk menandai plan sebagai 'admin'
    await prisma.profiles.upsert({
      where: { id: newUserId },
      update: {
        email: email,
        plan: 'admin',
        plan_status: 'admin',
        full_name: fullName,
        whatsapp_number: whatsappNumber || ''
      },
      create: {
        id: newUserId,
        email: email,
        full_name: fullName,
        plan: 'admin',
        plan_status: 'admin',
        whatsapp_number: whatsappNumber || ''
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Gagal membuat admin baru:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat membuat admin baru' }, { status: 500 })
  }
}

interface UpdateAdminEmailBody {
  adminUserId?: string
  newEmail?: string
}

/**
 * Memperbarui email administrator secara langsung lewat sisi server tanpa konfirmasi email verifikasi.
 */
export async function updateAdminEmail(body: UpdateAdminEmailBody, currentAdminId: string): Promise<Response> {
  const { adminUserId, newEmail } = body
  if (!adminUserId || !newEmail) {
    return NextResponse.json({ error: 'ID Admin dan email baru wajib diisi!' }, { status: 400 })
  }

  // Pengamanan: Hanya admin yang sedang login yang boleh mengganti emailnya sendiri
  if (adminUserId !== currentAdminId) {
    return NextResponse.json({ error: 'Anda hanya dapat mengganti email Anda sendiri!' }, { status: 403 })
  }

  try {
    // 1. Perbarui email langsung di database auth.users secara instan
    await prisma.$executeRawUnsafe(`
      UPDATE auth.users 
      SET email = $1, email_confirmed_at = NOW(), updated_at = NOW() 
      WHERE id = $2::uuid
    `, newEmail, adminUserId)

    // 2. Perbarui email di tabel profiles
    await prisma.profiles.update({
      where: { id: adminUserId },
      data: { email: newEmail }
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Gagal memperbarui email admin:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat memperbarui email' }, { status: 500 })
  }
}


