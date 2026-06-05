import { Prisma } from '@prisma/client'

/**
 * Menghitung harga prorasi untuk upgrade membership VIP.
 * Jika mode upgrade bukan 'proration', fungsi ini mengembalikan harga paket baru penuh.
 * 
 * @param currentMember Informasi data member aktif saat ini
 * @param newPlanPrice Harga paket VIP baru
 * @param upgradeMode Mode upgrade ('proration' atau 'stacking')
 * @returns Harga akhir setelah prorasi (minimal Rp 10.000)
 */
export function calculateProratedPrice(
  currentMember: {
    created_at: Date | null
    status_aktif: string | null
    tanggal_berakhir: Date | null
    harga_bayar: number | Prisma.Decimal | null
  } | null,
  newPlanPrice: number,
  upgradeMode: string
): number {
  if (upgradeMode !== 'proration') {
    return newPlanPrice
  }

  if (currentMember && (currentMember.status_aktif === 'aktif' || currentMember.status_aktif === 'vip') && currentMember.tanggal_berakhir) {
    const today = new Date()
    const expiry = new Date(currentMember.tanggal_berakhir)

    if (expiry > today) {
      const created = currentMember.created_at ? new Date(currentMember.created_at) : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      let totalDays = Math.ceil((expiry.getTime() - created.getTime()) / (24 * 60 * 60 * 1000))
      if (totalDays <= 0) totalDays = 30

      let remainingDays = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
      if (remainingDays < 0) remainingDays = 0

      const oldPaidAmount = Number(currentMember.harga_bayar) || 0
      const remainingValue = oldPaidAmount * (remainingDays / totalDays)

      // Menghitung harga baru dikurangi sisa nilai paket lama, dengan batas minimal Rp 10.000
      return Math.max(10000, newPlanPrice - remainingValue)
    }
  }

  return newPlanPrice
}

/**
 * Memformat angka nominal ke dalam format mata uang Rupiah.
 * 
 * @param n Angka nominal yang akan diformat
 * @returns String terformat Rupiah (misal: Rp 10.000)
 */
export function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

/**
 * Menghitung sisa waktu pembayaran hingga batas waktu kedaluwarsa.
 * 
 * @param expiryTime Waktu kedaluwarsa transaksi dalam format string ISO/date
 * @returns String format countdown "HH:MM:SS"
 */
export function getExpiryCountdown(expiryTime: string): string {
  const diff = new Date(expiryTime).getTime() - Date.now()
  if (diff <= 0) return '00:00:00'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
