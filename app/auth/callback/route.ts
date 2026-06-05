import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Rute callback PKCE untuk verifikasi email Supabase.
 * Dipanggil setelah user klik link konfirmasi di email.
 * Menukar kode otorisasi menjadi sesi aktif (auto-login),
 * lalu mengarahkan ke halaman sukses /verified.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
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
            try {
              cookieStore.set({ name, value, ...options })
            } catch {
              // Abaikan jika header sudah dikirim
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch {
              // Abaikan jika header sudah dikirim
            }
          },
        },
      }
    )

    // Tukar kode otorisasi PKCE menjadi sesi login aktif (auto-login)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Sesi berhasil dibuat, arahkan ke halaman konfirmasi sukses
      return NextResponse.redirect(`${origin}/verified`)
    }

    console.error('Auth Callback: Gagal menukar kode otorisasi:', error.message)
  }

  // Jika kode tidak ada atau gagal, arahkan ke login dengan pesan error
  return NextResponse.redirect(`${origin}/login?message=Verifikasi+email+gagal.+Silakan+coba+daftar+ulang.`)
}
