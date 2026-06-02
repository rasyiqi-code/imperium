import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Menangani pengambilan statistik dashboard untuk admin.
 */
export async function getDashboardStats(): Promise<Response> {
  // Hitung total pengguna menggunakan Prisma
  const totalUser = await prisma.profiles.count()
  
  // Hitung total VIP aktif menggunakan Prisma
  const vipAktif = await prisma.profiles.count({
    where: { plan: 'vip' }
  })
  
  // Hitung omzet pembayaran sukses menggunakan agregasi Prisma
  const omzetAggregate = await prisma.data_pembayaran.aggregate({
    _sum: {
      harga_bayar: true
    },
    where: {
      status_pembayaran: 'success'
    }
  })
  const omzet = Number(omzetAggregate._sum.harga_bayar) || 0

  // Ambil transaksi sukses 7 hari terakhir untuk tren grafik harian
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const payments = await prisma.data_pembayaran.findMany({
    where: {
      status_pembayaran: 'success',
      created_at: { gte: sevenDaysAgo }
    },
    select: {
      harga_bayar: true,
      created_at: true
    }
  })

  // Format data payments agar created_at dikirim sebagai string ISO
  const formattedPayments = payments.map(p => ({
    harga_bayar: Number(p.harga_bayar),
    created_at: p.created_at ? p.created_at.toISOString() : null
  }))

  return NextResponse.json({
    success: true,
    stats: { totalUser, vipAktif, omzet },
    payments: formattedPayments
  })
}
