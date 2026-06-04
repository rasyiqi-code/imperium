'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Crown, MessageSquare, User, HeadphonesIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function MobileNav() {
  const pathname = usePathname()
  const [plan, setPlan] = useState<string>('loading')

  useEffect(() => {
    async function getPlan() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const res = await fetch('/api/user/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getUserPlan' })
          })
          const data = await res.json()
          if (res.ok && data.plan) {
            setPlan(data.plan)
          } else {
            setPlan('free')
          }
        } else {
          setPlan('free')
        }
      } catch (err) {
        console.error("Gagal mendapatkan plan:", err)
        setPlan('free')
      }
    }
    getPlan()
  }, [])

  const navItems = [
    { name: 'Dash', href: '/dashboard', icon: LayoutDashboard },
    ...(plan !== 'vip' && plan !== 'admin' && plan !== 'loading' ? [
      { name: 'VIP', href: '/dashboard/upgrade', icon: Crown }
    ] : []),
    { name: 'Group', href: '/dashboard/group', icon: MessageSquare },
    { name: 'Profil', href: '/dashboard/profile', icon: User },
    { name: 'Support', href: '/dashboard/support', icon: HeadphonesIcon },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-900/90 backdrop-blur-xl border-t border-white/5">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`relative flex flex-col items-center flex-1 py-3 transition-all duration-300 ${
                isActive ? 'text-yellow-500 bg-yellow-500/5' : 'text-neutral-500'
              }`}
            >
              <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className="text-xs mt-1 font-bold uppercase tracking-tighter leading-none">
                {item.name}
              </span>

              {/* Indicator Line Aktif */}
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-yellow-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}