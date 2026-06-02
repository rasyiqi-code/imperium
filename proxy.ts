import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from './lib/prisma'

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

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.pathname

  // 1. Pengecekan Mode Pemeliharaan (Maintenance Mode)
  if (url === '/maintenance') {
    const settings = await prisma.admin_settings.findUnique({
      where: { id: 1 },
      select: { maintenance_mode: true }
    })
    
    if (!settings?.maintenance_mode) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  // Ambil pengaturan maintenance
  const settings = await prisma.admin_settings.findUnique({
    where: { id: 1 },
    select: { maintenance_mode: true }
  })

  if (settings?.maintenance_mode) {
    let isAdmin = false
    if (user) {
      const profile = await prisma.profiles.findUnique({
        where: { id: user.id },
        select: { plan: true }
      })
      const userPlan = profile?.plan
      if (userPlan === 'admin') {
        isAdmin = true
      }
    }
    // Blokir pengguna biasa dari semua rute kecuali aset & api
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  }

  // 2. Proteksi Halaman Login & Register (Jika sudah login)
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

  // 3. Proteksi Halaman yang Membutuhkan Login
  if (!user && (url.startsWith('/dashboard') || url.startsWith('/admin-panel'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Proteksi Khusus Rute Admin Panel
  if (user && url.startsWith('/admin-panel')) {
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { plan: true }
    })
    
    const userPlan = profile?.plan
    // 5. Jika bukan admin, arahkan kembali ke dashboard user biasa
    if (userPlan !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
