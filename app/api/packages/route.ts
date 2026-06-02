import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Ambil semua data paket VIP menggunakan Prisma Client
    const packages = await prisma.data_paket_vip.findMany({
      orderBy: { harga: 'asc' }
    })
    return NextResponse.json({ packages })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Failed to get public VIP packages:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}
