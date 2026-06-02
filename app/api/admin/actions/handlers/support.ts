import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SupportBody {
  config?: Record<string, string | null>
  faq?: {
    question?: string
    answer?: string
    sort_order?: number
  }
  faqId?: string
}

/**
 * Memperbarui konfigurasi media dukungan bantuan (WhatsApp, Telegram, email, jam operasional).
 */
export async function updateSupportConfig(body: SupportBody): Promise<Response> {
  const { config } = body
  if (!config) return NextResponse.json({ error: 'Missing config' }, { status: 400 })

  // Whitelist field konfigurasi yang diizinkan untuk update
  const allowedKeys = ['whatsapp_number', 'telegram_link', 'support_email', 'operational_hours']
  const filteredConfig: Record<string, string | null> = {}
  for (const key of allowedKeys) {
    if (config[key] !== undefined) {
      filteredConfig[key] = config[key]
    }
  }

  // Perbarui support config lewat Prisma
  await prisma.support_config.update({
    where: { id: 1 },
    data: filteredConfig
  })

  return NextResponse.json({ success: true })
}

/**
 * Menambahkan data FAQ baru ke database.
 */
export async function addFaq(body: SupportBody): Promise<Response> {
  const { faq } = body
  if (!faq || !faq.question || !faq.answer) return NextResponse.json({ error: 'Missing faq details' }, { status: 400 })

  // Tambah FAQ lewat Prisma
  await prisma.support_faqs.create({
    data: {
      question: faq.question,
      answer: faq.answer,
      sort_order: Number(faq.sort_order) || 0
    }
  })

  return NextResponse.json({ success: true })
}

/**
 * Menghapus data FAQ dari database.
 */
export async function deleteFaq(body: SupportBody): Promise<Response> {
  const { faqId } = body
  if (!faqId) return NextResponse.json({ error: 'Missing faqId' }, { status: 400 })

  // Hapus FAQ lewat Prisma
  await prisma.support_faqs.delete({
    where: { id: faqId }
  })

  return NextResponse.json({ success: true })
}

/**
 * Mengambil data konfigurasi dukungan & daftar FAQ terurut.
 */
export async function getSupportData(): Promise<Response> {
  // Ambil konfigurasi WhatsApp/Telegram dan FAQ via Prisma secara paralel
  const [config, faqs] = await prisma.$transaction([
    prisma.support_config.findUnique({
      where: { id: 1 }
    }),
    prisma.support_faqs.findMany({
      orderBy: { sort_order: 'asc' }
    })
  ])

  return NextResponse.json({ success: true, config, faqs })
}
