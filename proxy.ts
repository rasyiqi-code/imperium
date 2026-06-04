import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from './lib/prisma'
import { getAdminSettings } from './lib/adminSettings'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const url = request.nextUrl.pathname

  // Ambil pengaturan admin sekali saja melalui cache (bukan query langsung setiap request)
  const settings = await getAdminSettings()
  const isMaintenanceMode = settings?.maintenance_mode === true

  // 1. Pengecekan Mode Pemeliharaan (Maintenance Mode)
  if (url === '/maintenance') {
    // Jika maintenance mode sudah dinonaktifkan, redirect ke halaman utama
    if (!isMaintenanceMode) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  // 2. Pengecekan auth — hanya dipanggil jika benar-benar dibutuhkan (lazy evaluation)
  // Hindari getUser() untuk halaman publik yang tidak butuh proteksi
  const needsAuth = isMaintenanceMode
    || url === '/login'
    || url === '/register'
    || url.startsWith('/dashboard')
    || url.startsWith('/admin-panel')

  // Untuk halaman publik tanpa maintenance mode, langsung kembalikan response tanpa DB/auth call
  if (!needsAuth) {
    return response
  }

  const { data: { user } } = await supabase.auth.getUser()

  // 3. Jika maintenance mode aktif, hanya admin yang boleh akses
  if (isMaintenanceMode) {
    let isAdmin = false
    if (user) {
      const profile = await prisma.profiles.findUnique({
        where: { id: user.id },
        select: { plan: true }
      })
      isAdmin = profile?.plan === 'admin'
    }
    // Blokir pengguna biasa dari semua rute kecuali aset & api
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  }

  // 4. Proteksi Halaman Login & Register (Jika sudah login, redirect ke dashboard)
  if (url === '/login' || url === '/register') {
    if (user) {
      const profile = await prisma.profiles.findUnique({
        where: { id: user.id },
        select: { plan: true }
      })

      const userPlan = profile?.plan
      const target = userPlan === 'admin' ? '/admin-panel' : '/dashboard'

      return NextResponse.redirect(new URL(target, request.url))
    }
    return response
  }

  // 5. Proteksi Halaman yang Membutuhkan Login
  if (!user && (url.startsWith('/dashboard') || url.startsWith('/admin-panel'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 6. Proteksi Khusus Rute Admin Panel — cek role hanya satu kali
  if (user && url.startsWith('/admin-panel')) {
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { plan: true }
    })

    // Jika bukan admin, arahkan kembali ke dashboard user biasa
    if (profile?.plan !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
