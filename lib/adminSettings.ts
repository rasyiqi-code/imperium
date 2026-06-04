import { prisma } from './prisma'
import type { admin_settings } from '@prisma/client'

/**
 * Cache sederhana untuk pengaturan admin agar tidak perlu query database
 * setiap kali ada request. Data admin_settings jarang berubah (hanya saat
 * admin mengubah konfigurasi), sehingga caching dengan TTL 60 detik
 * sangat efektif mengurangi beban database.
 */

// Tipe data untuk seleksi parsial yang sering dibutuhkan
type AdminSettingsCache = admin_settings | null

// Simpan cache dan waktu kedaluwarsa di memori proses
let cachedSettings: AdminSettingsCache = null
let cacheExpiry = 0

// Durasi cache dalam milidetik (60 detik)
const CACHE_TTL_MS = 60_000

/**
 * Mengambil pengaturan admin dari database dengan mekanisme cache.
 * Jika data sudah ada di cache dan belum kedaluwarsa, langsung dikembalikan
 * tanpa query database.
 *
 * @param forceRefresh - Paksa refresh cache meskipun belum kedaluwarsa (contoh: setelah admin update settings)
 * @returns Data pengaturan admin atau null jika tidak ditemukan
 */
export async function getAdminSettings(forceRefresh = false): Promise<AdminSettingsCache> {
  const now = Date.now()

  // Kembalikan data cache jika masih valid dan tidak diminta refresh paksa
  if (!forceRefresh && cachedSettings && now < cacheExpiry) {
    return cachedSettings
  }

  // Query database dan perbarui cache
  const settings = await prisma.admin_settings.findUnique({
    where: { id: 1 }
  })

  cachedSettings = settings
  cacheExpiry = now + CACHE_TTL_MS

  return settings
}

/**
 * Menghapus cache secara manual.
 * Dipanggil setelah admin mengubah pengaturan agar perubahan langsung terasa.
 */
export function invalidateAdminSettingsCache(): void {
  cachedSettings = null
  cacheExpiry = 0
}
