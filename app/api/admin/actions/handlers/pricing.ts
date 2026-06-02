import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PricingBody {
  planId?: string
  nama_paket?: string
  harga?: number
  durasi_hari?: number
  fitur?: string[]
}

/**
 * Memperbarui pricing plan paket VIP yang sudah ada.
 */
export async function updatePricingPlan(body: PricingBody): Promise<Response> {
  const { planId, nama_paket, harga, durasi_hari, fitur } = body
  if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 })

  const parsedHarga = Number(harga)
  const parsedDurasi = Number(durasi_hari)

  if (isNaN(parsedHarga) || parsedHarga < 0) {
    return NextResponse.json({ error: 'Harga harus berupa angka positif' }, { status: 400 })
  }
  if (isNaN(parsedDurasi) || parsedDurasi <= 0) {
    return NextResponse.json({ error: 'Durasi hari harus berupa angka positif' }, { status: 400 })
  }

  const cleanedFitur = Array.isArray(fitur)
    ? fitur.map((f: unknown) => String(f).trim()).filter(Boolean)
    : []

  // Perbarui pricing plan lewat Prisma
  await prisma.data_paket_vip.update({
    where: { id: planId },
    data: {
      nama_paket,
      harga: parsedHarga,
      durasi_hari: parsedDurasi,
      fitur: cleanedFitur
    }
  })

  return NextResponse.json({ success: true })
}

/**
 * Membuat pricing plan paket VIP baru.
 */
export async function createPricingPlan(body: PricingBody): Promise<Response> {
  const { nama_paket, harga, durasi_hari, fitur } = body

  const parsedHarga = Number(harga)
  const parsedDurasi = Number(durasi_hari)

  if (!nama_paket || String(nama_paket).trim() === '') {
    return NextResponse.json({ error: 'Nama paket wajib diisi' }, { status: 400 })
  }
  if (isNaN(parsedHarga) || parsedHarga < 0) {
    return NextResponse.json({ error: 'Harga harus berupa angka positif' }, { status: 400 })
  }
  if (isNaN(parsedDurasi) || parsedDurasi <= 0) {
    return NextResponse.json({ error: 'Durasi hari harus berupa angka positif' }, { status: 400 })
  }

  const cleanedFitur = Array.isArray(fitur)
    ? fitur.map((f: unknown) => String(f).trim()).filter(Boolean)
    : []

  // Buat pricing plan baru lewat Prisma
  await prisma.data_paket_vip.create({
    data: {
      nama_paket: String(nama_paket).trim(),
      harga: parsedHarga,
      durasi_hari: parsedDurasi,
      fitur: cleanedFitur
    }
  })

  return NextResponse.json({ success: true })
}

/**
 * Mengambil seluruh daftar paket VIP terurut dari termurah.
 */
export async function getPricingPlans(): Promise<Response> {
  // Ambil data paket VIP terurut dari termurah via Prisma
  const plans = await prisma.data_paket_vip.findMany({
    orderBy: { harga: 'asc' }
  })

  // Map data paket agar Decimal dikonversi ke Number
  const formattedPlans = plans.map(p => ({
    ...p,
    harga: Number(p.harga)
  }))

  return NextResponse.json({ success: true, plans: formattedPlans })
}
