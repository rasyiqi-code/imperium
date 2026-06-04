// app/(admin)/layout.tsx
'use client'
import Sidebar from '@/components/Sidebar'
import AdminNav from '@/components/admin/AdminNav'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar cuma muncul di PC (md keatas) biasanya diatur di dalam komponen Sidebar lu */}
      <Sidebar role="admin" />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header Admin */}
        <div className='md:hidden'>
        <AdminHeader />
        </div>
        {children}
        
        {/* Navigasi ini cuma muncul di MOBILE, di PC (md) kita HIDDEN */}
        <div className="md:hidden">
          <AdminNav />
        </div>
      </main>
    </div>
  )
}