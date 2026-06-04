import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// Handler untuk memproses request lupa password via API kustom
export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    }

    const origin = new URL(request.url).origin
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Jika Service Role Key tidak dikonfigurasi, beri tahu pengguna untuk menambahkannya di .env
    if (!serviceRoleKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment. Menghubungi Supabase Auth API langsung...')
      
      // Mengembalikan error deskriptif yang menginstruksikan pengisian SUPABASE_SERVICE_ROLE_KEY
      return NextResponse.json({
        error: 'Sistem email otomatis belum terkonfigurasi. Silakan tambahkan SUPABASE_SERVICE_ROLE_KEY di file .env untuk mengaktifkan pemulihan kata sandi via Resend.'
      }, { status: 500 })
    }

    // Inisialisasi Supabase Admin Client dengan Service Role Key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    )

    // Cari profil pengguna berdasarkan email untuk mengambil nama lengkap
    const normalizedEmail = email.trim().toLowerCase()
    const profile = await prisma.profiles.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      }
    })

    // Jika user tidak terdaftar di database, kita kirimkan response sukses palsu (sebagai praktik keamanan standar
    // agar penyerang tidak bisa mengecek daftar email terdaftar)
    if (!profile) {
      console.log(`Lupa password untuk email ${email} dilewati karena pengguna tidak ditemukan.`)
      return NextResponse.json({ success: true })
    }

    const userName = profile.full_name || email.split('@')[0]

    // Generate recovery link secara programatis menggunakan Supabase Admin API
    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: `${origin}/reset-password`
      }
    })

    if (linkError || !data?.properties?.action_link) {
      console.error('Gagal generate recovery link:', linkError)
      return NextResponse.json({ error: linkError?.message || 'Gagal membuat tautan pemulihan' }, { status: 500 })
    }

    const actionLink = data.properties.action_link

    // Kirim email kustom via Resend menggunakan helper sendEmail
    const emailSubject = 'Atur Ulang Password Akun Imperium Crypto Anda'
    const emailHtml = getResetPasswordEmailHtml(userName, actionLink)

    await sendEmail({
      to: normalizedEmail,
      subject: emailSubject,
      html: emailHtml
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Forgot Password API error:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal server' }, { status: 500 })
  }
}

// Template email reset password
function getResetPasswordEmailHtml(targetName: string, resetLink: string): string {
  const currentYear = new Date().getFullYear()
  return `<div style="background-color: #000; color: #fff; font-family: sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #fbbf24; font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Imperium Crypto</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: 4px; text-transform: uppercase;">Atur Ulang Kata Sandi</p>
  </div>
  <div style="margin-bottom: 24px;">
    <p style="font-size: 16px; margin: 0 0 12px;">Halo <strong>${targetName}</strong>,</p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px;">
      Kami menerima permintaan untuk mengatur ulang kata sandi akun Imperium Crypto Anda. Silakan klik tombol di bawah ini untuk mengganti kata sandi Anda:
    </p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetLink}" style="background-color: #fbbf24; color: #000; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">Reset Password</a>
    </div>
    <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 16px;">
      Tautan pemulihan ini hanya berlaku selama 60 menit demi keamanan akun Anda. Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini dan password Anda tidak akan berubah.
    </p>
  </div>
  <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
  <div style="text-align: center; font-size: 11px; color: #4b5563;">
    <p style="margin: 0 0 4px;">Surat ini dikirim secara otomatis oleh sistem keamanan Imperium Crypto.</p>
    <p style="margin: 0;">&copy; ${currentYear} Imperium Crypto. All rights reserved.</p>
  </div>
</div>`
}
