import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Ambil seluruh FAQ terurut berdasarkan sort_order untuk landing page publik
    const faqs = await prisma.support_faqs.findMany({
      orderBy: { sort_order: 'asc' }
    })
    return NextResponse.json({ faqs })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Failed to get public FAQs:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}
