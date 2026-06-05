import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

// Inisialisasi Supabase Admin Client menggunakan service role key untuk manajemen pengguna tingkat tinggi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

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

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase admin client tidak terkonfigurasi. Pastikan SUPABASE_SERVICE_ROLE_KEY tersedia.' }, { status: 500 })
  }

  try {
    // Memperbarui password user menggunakan auth admin client (tanpa konfirmasi email)
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Gagal memperbarui password member via Admin Client:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan saat memperbarui password' }, { status: 500 })
  }
}
