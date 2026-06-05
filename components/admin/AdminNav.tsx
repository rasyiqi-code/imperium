'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/components/ModalProvider'
import { 
  LayoutDashboard, 
  Users, 
  Tag, 
  Settings, 
  CreditCard,
  MoreHorizontal,
  HelpCircle,
  LogOut,
  FileText,
  MessageSquare
} from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()
  const { showConfirm } = useModal()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Opsi menu statis di navigasi utama bawah
  const menus = [
    { name: 'Dash', path: '/admin-panel', icon: <LayoutDashboard size={18} /> },
    { name: 'Members', path: '/admin-panel/members', icon: <Users size={18} /> },
    { name: 'Payment', path: '/admin-panel/payments', icon: <CreditCard size={18} /> },
    { name: 'Pricing', path: '/admin-panel/pricing', icon: <Tag size={18} /> },
  ]

  const handleLogout = () => {
    setIsDrawerOpen(false)
    showConfirm({
      title: 'Keluar Admin Panel',
      message: 'Apakah Anda yakin ingin keluar dari Admin Panel?',
      type: 'warning',
      confirmText: 'Keluar',
      cancelText: 'Batal',
      onConfirm: async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
      }
    })
  }

  // Cek apakah halaman aktif berada di support, settings, pages, atau testimonials
  const isMoreActive = 
    pathname === '/admin-panel/support' || 
    pathname === '/admin-panel/settings' || 
    pathname === '/admin-panel/pages' || 
    pathname === '/admin-panel/testimonials'

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-neutral-900/90 backdrop-blur-xl border-t border-white/5 z-40 md:hidden">
        <ul className="flex items-center justify-around">
          {menus.map((menu) => {
            const isActive = pathname === menu.path
            return (
              <li key={menu.path} className="flex-1">
                <Link 
                  href={menu.path}
                  onClick={() => setIsDrawerOpen(false)}
                  className={`flex flex-col items-center justify-center gap-1 py-3 transition-all relative ${
                    isActive 
                    ? 'text-yellow-500 bg-yellow-500/5' 
                    : 'text-neutral-500'
                  }`}
                >
                  <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                    {menu.icon}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-tighter leading-none">
                    {menu.name}
                  </span>
                  {/* Indicator Line Aktif */}
                  {isActive && (
                    <div className="absolute bottom-0 w-8 h-0.5 bg-yellow-500 rounded-full" />
                  )}
                </Link>
              </li>
            )
          })}
          
          {/* Menu Lainnya untuk pemicu Laci Bawah */}
          <li className="flex-1">
            <button 
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={`w-full flex flex-col items-center justify-center gap-1 py-3 transition-all relative cursor-pointer ${
                isMoreActive 
                ? 'text-yellow-500 bg-yellow-500/5' 
                : 'text-neutral-500'
              }`}
            >
              <div className={`${isDrawerOpen ? 'rotate-90 scale-110' : 'scale-100'} transition-all duration-300`}>
                <MoreHorizontal size={18} />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-tighter leading-none">
                Lainnya
              </span>
              {isMoreActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-yellow-500 rounded-full" />
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* Backdrop Laci Geser */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-all duration-300 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Laci Geser Bawah (Bottom Sheet Drawer) */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 rounded-t-3xl p-6 z-50 transition-transform duration-300 ease-out md:hidden shadow-2xl ${
          isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle Bar */}
        <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto mb-5" />
        
        <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-4 px-1">Pintasan Menu Tambahan</h3>
        
        <div className="space-y-2">
          {/* Link ke Testimonials */}
          <Link 
            href="/admin-panel/testimonials" 
            onClick={() => setIsDrawerOpen(false)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
              pathname === '/admin-panel/testimonials'
              ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-500'
              : 'border-neutral-900 bg-neutral-900/10 text-white hover:bg-neutral-900/30'
            }`}
          >
            <div className="text-yellow-500"><MessageSquare size={18} /></div>
            <div className="text-left">
              <p className="text-xs font-black uppercase">Testimonials</p>
              <p className="text-[9px] text-neutral-500 font-bold uppercase mt-0.5 leading-none">Kelola Ulasan & Rating Member</p>
            </div>
          </Link>

          {/* Link ke Support Manager */}
          <Link 
            href="/admin-panel/support" 
            onClick={() => setIsDrawerOpen(false)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
              pathname === '/admin-panel/support'
              ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-500'
              : 'border-neutral-900 bg-neutral-900/10 text-white hover:bg-neutral-900/30'
            }`}
          >
            <div className="text-yellow-500"><HelpCircle size={18} /></div>
            <div className="text-left">
              <p className="text-xs font-black uppercase">Support Manager</p>
              <p className="text-[9px] text-neutral-500 font-bold uppercase mt-0.5 leading-none">Kelola FAQ & Kontak Bantuan</p>
            </div>
          </Link>

          {/* Link ke Konten Halaman Dinamis */}
          <Link 
            href="/admin-panel/pages" 
            onClick={() => setIsDrawerOpen(false)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
              pathname === '/admin-panel/pages'
              ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-500'
              : 'border-neutral-900 bg-neutral-900/10 text-white hover:bg-neutral-900/30'
            }`}
          >
            <div className="text-yellow-500"><FileText size={18} /></div>
            <div className="text-left">
              <p className="text-xs font-black uppercase">Page Manager</p>
              <p className="text-[9px] text-neutral-500 font-bold uppercase mt-0.5 leading-none">Kelola Konten Halaman Dinamis</p>
            </div>
          </Link>

          {/* Link ke System Settings */}
          <Link 
            href="/admin-panel/settings" 
            onClick={() => setIsDrawerOpen(false)}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
              pathname === '/admin-panel/settings'
              ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-500'
              : 'border-neutral-900 bg-neutral-900/10 text-white hover:bg-neutral-900/30'
            }`}
          >
            <div className="text-yellow-500"><Settings size={18} /></div>
            <div className="text-left">
              <p className="text-xs font-black uppercase">System Settings</p>
              <p className="text-[9px] text-neutral-500 font-bold uppercase mt-0.5 leading-none">Kelola Kredensial & Server API</p>
            </div>
          </Link>

          {/* Tombol Logout Sesi */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 bg-red-500/5 hover:bg-red-500/10 active:bg-red-500/20 rounded-2xl border border-red-500/10 text-red-400 transition-all text-left cursor-pointer duration-300"
          >
            <div className="text-red-500"><LogOut size={18} /></div>
            <div>
              <p className="text-xs font-black uppercase">Keluar Sesi Admin</p>
              <p className="text-[9px] text-red-500/60 font-bold uppercase mt-0.5 leading-none">Akhiri sesi log masuk saat ini</p>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}