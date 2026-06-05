import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type EmailOtpType } from '@supabase/supabase-js'

/**
 * Route handler server-side untuk menangani semua callback PKCE dari Supabase:
 *  - type=signup       → verifikasi email pendaftaran
 *  - type=recovery     → link reset password dari email
 *  - type=email_change → konfirmasi perubahan email
 *
 * Menggunakan createServerClient dari @supabase/ssr agar code verifier PKCE
 * dibaca dari cookies (bukan localStorage), sesuai kebutuhan SSR Next.js.
 *
 * Supabase mengirim link email dengan format:
 *   https://[project].supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=.../auth/confirm
 * Supabase kemudian redirect ke /auth/confirm?code=...&type=recovery
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code      = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type      = searchParams.get('type') as EmailOtpType | null
  const next      = searchParams.get('next') ?? '/'

  // Buat Supabase server client yang membaca/menulis cookies
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch { /* header sudah dikirim */ }
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch { /* header sudah dikirim */ }
        },
      },
    }
  )

  // ─── Alur 1: PKCE code exchange (recovery / signup via link) ─────────────────
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Jika ini alur reset password → arahkan ke halaman form reset password
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      // Alur lain (signup confirm) → arahkan ke /verified atau next
      return NextResponse.redirect(`${origin}${next === '/' ? '/verified' : next}`)
    }
    console.error('[auth/confirm] exchangeCodeForSession gagal:', error.message)
  }

  // ─── Alur 2: OTP token_hash (email OTP lama) ─────────────────────────────────
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      return NextResponse.redirect(`${origin}${next === '/' ? '/verified' : next}`)
    }
    console.error('[auth/confirm] verifyOtp gagal:', error.message)
  }

  // Gagal → redirect ke login dengan pesan error
  return NextResponse.redirect(
    `${origin}/login?message=Tautan+tidak+valid+atau+sudah+kedaluwarsa.+Silakan+coba+lagi.`
  )
}
