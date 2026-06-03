import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Menangani pengambilan statistik dashboard untuk admin.
 */
export async function getDashboardStats(): Promise<Response> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Mengambil data statistik dan tren transaksi secara paralel untuk efisiensi resource dan performa maksimal
  const [totalUser, vipAktif, omzetAggregate, payments] = await Promise.all([
    // Hitung total pengguna
    prisma.profiles.count(),
    
    // Hitung total VIP aktif
    prisma.profiles.count({
      where: { plan: 'vip' }
    }),
    
    // Hitung omzet pembayaran sukses menggunakan agregasi basis data
    prisma.data_pembayaran.aggregate({
      _sum: {
        harga_bayar: true
      },
      where: {
        status_pembayaran: 'success'
      }
    }),
    
    // Ambil transaksi sukses 7 hari terakhir untuk tren grafik harian
    prisma.data_pembayaran.findMany({
      where: {
        status_pembayaran: 'success',
        created_at: { gte: sevenDaysAgo }
      },
      select: {
        harga_bayar: true,
        created_at: true
      }
    })
  ])

  const omzet = Number(omzetAggregate._sum.harga_bayar) || 0

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
