import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Endpoint publik untuk mengambil daftar testimonial yang aktif/disetujui tampil.
 */
export async function GET() {
  try {
    const data = await prisma.testimonials.findMany({
      where: {
        status_tampil: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(data)
  } catch (error: unknown) {
    const err = error as Error
    console.error('GET /api/testimonials Error:', err)
    return NextResponse.json({ error: 'Gagal mengambil data testimonial' }, { status: 500 })
  }
}
