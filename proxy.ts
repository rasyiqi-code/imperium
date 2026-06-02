import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from './lib/supabase'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
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

  // 1. Maintenance Mode Redirect Checks
  if (url === '/maintenance') {
    const { data: settings } = await (supabase.from('admin_settings') as any)
      .select('maintenance_mode')
      .eq('id', 1)
      .maybeSingle()
    
    if (!settings?.maintenance_mode) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  // Fetch settings to check if maintenance is active
  const { data: settings } = await (supabase.from('admin_settings') as any)
    .select('maintenance_mode')
    .eq('id', 1)
    .maybeSingle()

  if (settings?.maintenance_mode) {
    let isAdmin = false
    if (user) {
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('plan')
        .eq('id', user.id)
        .single()
      const userPlan = profile ? (profile as { plan: string | null }).plan : null
      if (userPlan === 'admin') {
        isAdmin = true
      }
    }
    // Block non-admins from all routes except assets & api
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  }

  // 2. Proteksi Login & Register
  if (url === '/login' || url === '/register') {
    if (user) {
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('plan')
        .eq('id', user.id)
        .single()
      
      const userPlan = profile ? (profile as { plan: string | null }).plan : null
      const target = userPlan === 'admin' ? '/admin-panel' : '/dashboard'
      
      return NextResponse.redirect(new URL(target, request.url))
    }
    return response
  }

  // 3. Proteksi Belum Login
  if (!user && (url.startsWith('/dashboard') || url.startsWith('/admin-panel'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. Proteksi Khusus Admin Panel
  if (user && url.startsWith('/admin-panel')) {
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('plan')
      .eq('id', user.id)
      .single()
    

    const userPlan = profile ? (profile as { plan: string | null }).plan : null
    // 5. Kalo bukan admin masukin dashboard 
    if (userPlan !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
