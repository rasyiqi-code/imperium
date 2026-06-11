'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Crown, 
  MessageSquare, 
  User, 
  Users, 
  CreditCard, 
  LogOut,
  Settings,
  Tag,
  HeadphonesIcon,
  FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/components/ModalProvider'

interface SidebarProps {
  role: 'admin' | 'user'
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [userData, setUserData] = useState({ email: '', name: '', plan: 'loading' })

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        try {
          const res = await fetch('/api/user/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getProfileData' })
          })
          const data = await res.json()
          if (res.ok && data.profile) {
            const profileData = data.profile
            const vipData = data.vipData
            const isVip = profileData?.plan === 'vip' || vipData?.status_aktif === 'aktif' || vipData?.status_aktif === 'vip'
            
            setUserData({
              email: user.email || '',
              name: profileData?.full_name || user.email?.split('@')[0] || 'User',
              plan: isVip ? 'vip' : (profileData?.plan || 'free')
            })
          } else {
            setUserData(prev => ({ ...prev, plan: 'free' }))
          }
        } catch (err) {
          console.error("Gagal mendapatkan data user:", err)
          setUserData(prev => ({ ...prev, plan: 'free' }))
        }
      } else {
        setUserData(prev => ({ ...prev, plan: 'free' }))
      }
    }
    getUser()
  }, [])

  const userMenus = [
    { name: 'Dash', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'VIP', href: '/dashboard/upgrade', icon: <Crown size={20} /> },
    { name: 'Group', href: '/dashboard/group', icon: <MessageSquare size={20} /> },
    { name: 'Profil', href: '/dashboard/profile', icon: <User size={20} /> },
    { name: 'Support', href: '/dashboard/support', icon: <HeadphonesIcon size={20} /> },
  ]

  const adminMenus = [
    { name: 'Dash', href: '/admin-panel', icon: <LayoutDashboard size={20} /> },
    { name: 'Members', href: '/admin-panel/members', icon: <Users size={20} /> },
    { name: 'Payment', href: '/admin-panel/payments', icon: <CreditCard size={20} /> },
    { name: 'Pricing', href: '/admin-panel/pricing', icon: <Tag size={20} /> },
    { name: 'Testimonials', href: '/admin-panel/testimonials', icon: <MessageSquare size={20} /> },
    { name: 'Support', href: '/admin-panel/support', icon: <HeadphonesIcon size={20} /> },
    { name: 'Pages', href: '/admin-panel/pages', icon: <FileText size={20} /> },
    { name: 'Settings', href: '/admin-panel/settings', icon: <Settings size={20} /> },
  ]

  const menus = role === 'admin' ? adminMenus : userMenus

  const { showConfirm } = useModal()

  const handleLogout = () => {
    showConfirm({
      title: 'Keluar Portal',
      message: 'Apakah Anda yakin ingin keluar dari portal Imperium Crypto?',
      type: 'warning',
      confirmText: 'Keluar',
      cancelText: 'Batal',
      onConfirm: async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
      }
    })
  }

  return (
    <aside className="w-64 h-screen bg-black border-r border-neutral-900 p-4 hidden md:flex flex-col sticky top-0 overflow-y-auto">
      <div className="mb-10 px-4 pt-4 text-left">
        <h2 className="text-xl font-bold tracking-tighter text-white uppercase italic leading-none">
          IMPERIUM<span className="text-yellow-500">Crypto</span>
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
          <p className="text-[10px] text-neutral-500 tracking-widest font-bold capitalize">
            {role} Portal
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menus.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/10' 
                : 'text-neutral-500 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <span className={`${isActive ? 'text-black' : 'text-neutral-500 group-hover:text-yellow-500'}`}>
                {item.icon}
              </span>
              <span className="text-xs font-bold tracking-wider leading-none">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-neutral-900 pt-6 space-y-2">
        <div className="px-4 py-3 mb-2 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-yellow-500 flex items-center justify-center text-black font-bold text-[10px] shrink-0 leading-none">
            {userData.name ? userData.name.substring(0, 2) : 'IC'}
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-xs font-bold text-white truncate tracking-tight leading-none">
              {userData.name || 'Loading...'}
            </span>
            <span className="text-[10px] font-bold text-neutral-500 truncate tracking-tighter mt-1 leading-none">
              {userData.email}
            </span>
          </div>
        </div>
 
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group"
        >
          <LogOut size={18} />
          <span className="text-xs font-bold tracking-widest leading-none">Logout</span>
        </button>
      </div>
    </aside>
  )
}