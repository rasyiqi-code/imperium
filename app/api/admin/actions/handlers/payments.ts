import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getPaymentConfirmedEmailHtml, getPaymentRejectedEmailHtml } from '@/lib/emailTemplates'

interface PaymentsBody {
  paymentId?: string
}

/**
 * Mengonfirmasi pembayaran manual pending dan mengaktifkan status VIP user.
 */
export async function confirmPayment(body: PaymentsBody): Promise<Response> {
  const { paymentId } = body
  if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

  // Ambil rincian pembayaran pending menggunakan Prisma
  const payment = await prisma.data_pembayaran.findUnique({
    where: { id: paymentId }
  })

  if (!payment || !payment.id_user_auth) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
  }

  // Ambil durasi paket secara dinamis berdasarkan nama paket
  const paket = await prisma.data_paket_vip.findFirst({
    where: { nama_paket: payment.nama_paket }
  })

  const durationDays = paket ? paket.durasi_hari : 30
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + durationDays)

  // Konfirmasi pembayaran, update plan user ke VIP, sinkronisasi member VIP, dan kirim notifikasi via transaksi Prisma
  await prisma.$transaction([
    prisma.data_pembayaran.update({
      where: { id: paymentId },
      data: { status_pembayaran: 'success' }
    }),
    prisma.profiles.update({
      where: { id: payment.id_user_auth },
      data: { plan: 'vip', plan_status: 'vip' }
    }),
    prisma.data_member_vip.deleteMany({
      where: { id_user_auth: payment.id_user_auth }
    }),
    prisma.data_member_vip.create({
      data: {
        id_user_auth: payment.id_user_auth,
        email_member: payment.email_member,
        nama_paket: payment.nama_paket,
        harga_bayar: Number(payment.harga_bayar),
        status_aktif: 'aktif',
        kode_invite_unik: 'imperium-vip-invite',
        tanggal_berakhir: expiryDate
      }
    }),
    prisma.notifications.create({
      data: {
        user_id: payment.id_user_auth,
        title: 'Pembayaran Sukses!',
        message: 'Selamat! Akun VIP Imperium kamu sudah aktif.',
        type: 'success'
      }
    })
  ])

  // Dapatkan nama lengkap pengguna untuk keperluan pengiriman email
  const targetUser = await prisma.profiles.findUnique({
    where: { id: payment.id_user_auth },
    select: { full_name: true }
  })

  const expiryDateFormatted = expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const mailHtml = getPaymentConfirmedEmailHtml(
    targetUser?.full_name || payment.email_member,
    payment.nama_paket,
    Number(payment.harga_bayar),
    expiryDateFormatted
  )

  await sendEmail({
    to: payment.email_member,
    subject: '[Imperium Crypto] Pembayaran VIP Terkonfirmasi - Akun VIP Aktif!',
    html: mailHtml,
  })

  return NextResponse.json({ success: true })
}

/**
 * Menolak pembayaran manual dan memperbarui status pembayaran menjadi failed.
 */
export async function rejectPayment(body: PaymentsBody): Promise<Response> {
  const { paymentId } = body
  if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

  // Dapatkan rincian pembayaran sebelum diupdate
  const payment = await prisma.data_pembayaran.findUnique({
    where: { id: paymentId }
  })

  if (!payment) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
  }

  // Tandai pembayaran sebagai gagal/ditolak
  await prisma.data_pembayaran.update({
    where: { id: paymentId },
    data: { status_pembayaran: 'failed' }
  })

  const targetUser = await prisma.profiles.findUnique({
    where: { id: payment.id_user_auth || undefined },
    select: { full_name: true }
  })

  const mailHtml = getPaymentRejectedEmailHtml(
    targetUser?.full_name || payment.email_member,
    payment.nama_paket,
    Number(payment.harga_bayar)
  )

  await sendEmail({
    to: payment.email_member,
    subject: '[Imperium Crypto] Pembayaran VIP Ditolak',
    html: mailHtml,
  })

  return NextResponse.json({ success: true })
}

/**
 * Mengambil daftar seluruh riwayat pembayaran.
 */
export async function getPayments(): Promise<Response> {
  // Ambil data pembayaran terurut berdasarkan tanggal terbaru via Prisma
  const payments = await prisma.data_pembayaran.findMany({
    orderBy: { created_at: 'desc' }
  })

  // Map data pembayaran agar Decimal dikonversi ke Number dan created_at ke ISO String
  const formattedPayments = payments.map(p => ({
    ...p,
    harga_bayar: Number(p.harga_bayar),
    created_at: p.created_at ? p.created_at.toISOString() : null
  }))

  return NextResponse.json({ success: true, payments: formattedPayments })
}
