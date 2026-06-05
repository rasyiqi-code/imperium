import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const support = await prisma.support_config.findUnique({
      where: { id: 1 },
      select: {
        whatsapp_number: true,
        telegram_link: true,
        support_email: true
      }
    })

    return NextResponse.json({
      whatsappNumber: support?.whatsapp_number || '62812345678',
      telegramLink: support?.telegram_link || 'https://t.me/imperiumcrypto',
      supportEmail: support?.support_email || 'support@imperiumcrypto.com'
    })
  } catch (error) {
    console.error('Gagal mengambil data support config publik:', error)
    return NextResponse.json({
      whatsappNumber: '62812345678',
      telegramLink: 'https://t.me/imperiumcrypto',
      supportEmail: 'support@imperiumcrypto.com'
    })
  }
}
