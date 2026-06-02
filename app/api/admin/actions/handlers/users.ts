import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface UsersBody {
  ids?: string[]
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
