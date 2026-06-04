'use client'

import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import MobileHeader from '@/components/MobileHeader'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      {/* 1. SIDEBAR (Hanya muncul di Desktop via class hidden md:flex di dalam komponennya) */}
      <Sidebar role="user" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. HEADER MOBILE (Muncul hanya di layar kecil) */}
        <MobileHeader />

        {/* 3. MAIN CONTENT */}
        {/* pb-28 di mobile agar konten tidak tertutup Floating Bottom Nav, md:pb-6 agar rapi di desktop */}
        <main className="flex-1 overflow-y-auto pb-28 md:pb-6">
          {children}
        </main>

        {/* 4. BOTTOM NAVIGATION (Muncul hanya di layar kecil) */}
        <MobileNav />
      </div>
    </div>
  )
}