'use client'

import { useState, useEffect, useCallback } from 'react'
import Loader from '@/components/Loader'
import DashboardStatsCards from '@/components/admin/dashboard/DashboardStatsCards'
import RevenueTrendChart from '@/components/admin/dashboard/RevenueTrendChart'

interface PaymentItem {
  harga_bayar: number
  created_at: string | null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUser: 0, vipAktif: 0, omzet: 0 })
  const [paymentsList, setPaymentsList] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)

  // Ambil data dashboard admin dari API
  const getAdminData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getDashboardStats' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard stats')

      setStats({
        totalUser: data.stats?.totalUser || 0,
        vipAktif: data.stats?.vipAktif || 0,
        omzet: data.stats?.omzet || 0
      })
      setPaymentsList((data.payments as PaymentItem[]) || [])
    } catch (error) {
      console.error("Error syncing admin dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      getAdminData()
    }, 0)
    return () => clearTimeout(timer)
  }, [getAdminData])

  if (loading) return <Loader label="Sinkronisasi Database..." />

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white animate-in fade-in duration-300 text-left">
      
      {/* Title */}
      <div className="hidden md:block border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">Admin <span className="text-yellow-500">Dashboard</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Ikhtisar data member, omzet transaksi, dan performa VIP saat ini</p>
      </div>

      {/* Stats Section */}
      <DashboardStatsCards 
        totalUser={stats.totalUser}
        vipAktif={stats.vipAktif}
        omzet={stats.omzet}
      />

      {/* Grafik Tren Omzet Kustom */}
      <RevenueTrendChart 
        paymentsList={paymentsList}
      />

    </div>
  )
}