'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  RefreshCw,
  History,
  Search,
  Trash2,
  ShieldCheck,
  X
} from 'lucide-react'
import { PaketVIP } from '@/lib/types'
import { useModal } from '@/components/ModalProvider'


interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: string | null;
  plan_status: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const { showAlert, showConfirm } = useModal()
  const [stats, setStats] = useState({ totalUser: 0, vipAktif: 0, omzet: 0 })
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [plans, setPlans] = useState<PaketVIP[]>([])
  const [paymentsList, setPaymentsList] = useState<any[]>([])
  const [upgradeUser, setUpgradeUser] = useState<Profile | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Fungsi pembantu untuk mengelompokkan omzet 7 hari terakhir secara harian
  const getOmzetTrend = (payments: any[]) => {
    const trendMap: Record<string, number> = {}
    
    // Inisialisasi label tanggal 7 hari terakhir
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })
      trendMap[dateStr] = 0
    }

    // Akumulasikan harga bayar pada tanggal yang sesuai
    payments.forEach(pay => {
      if (!pay.created_at) return
      const payDate = new Date(pay.created_at)
      const dateStr = payDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })
      if (trendMap[dateStr] !== undefined) {
        trendMap[dateStr] += Number(pay.harga_bayar) || 0
      }
    })

    return Object.entries(trendMap).map(([label, value]) => ({ label, value }))
  }

  const getAdminData = async () => {
    setLoading(true)
    try {
      const resMembers = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getMembers' })
      })
      const dataMembers = await resMembers.json()
      if (!resMembers.ok) throw new Error(dataMembers.error || 'Failed to fetch members')

      const { data: payData } = await supabase.from('data_pembayaran').select('harga_bayar, created_at').eq('status_pembayaran', 'success')
      const { data: planData } = await supabase.from('data_paket_vip').select('*').order('harga', { ascending: true })

      const profiles = (dataMembers.members as Profile[]) || []
      const payments = (payData as any[]) || []
      const pricingPlans = (planData as PaketVIP[]) || []

      const totalOmzet = payments.reduce((acc, curr) => acc + (Number(curr.harga_bayar) || 0), 0)
      const vipAktifCount = profiles.filter(p => p.plan?.toLowerCase() === 'vip').length

      setStats({ totalUser: profiles.length, vipAktif: vipAktifCount, omzet: totalOmzet })
      setAllUsers(profiles)
      setPaymentsList(payments)
      setPlans(pricingPlans)
    } catch (error) {
      console.error("Error syncing admin dashboard:", error)
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => { getAdminData() }, [])

  const handleUpgradeManual = (user: Profile, plan: PaketVIP) => {
    showConfirm({
      title: 'Upgrade Manual VIP',
      message: `Upgrade ${user.email} ke VIP secara Manual menggunakan ${plan.nama_paket} (Omzet + Rp ${plan.harga.toLocaleString('id-ID')})?`,
      type: 'warning',
      confirmText: 'Ya, Upgrade',
      cancelText: 'Batal',
      onConfirm: async () => {
        setUpgradeUser(null)
        setActionLoading(user.id)
        try {
          const res = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'upgradeManual', userId: user.id, planId: plan.id })
          })
          const data = await res.json()
          if (res.ok) {
            showAlert({
              title: 'Upgrade Berhasil',
              message: 'User berhasil menjadi VIP!',
              type: 'success'
            })
            getAdminData()
          } else {
            showAlert({
              title: 'Gagal Upgrade',
              message: data.error || 'Gagal melakukan upgrade',
              type: 'danger'
            })
          }
        } catch (error: any) {
          showAlert({
            title: 'Error',
            message: `Error: ${error.message}`,
            type: 'danger'
          })
        } finally {
          setActionLoading(null)
        }
      }
    })
  }


  const handleDeleteUser = (id: string) => {
    showConfirm({
      title: 'Hapus User',
      message: 'Hapus user ini secara permanen?',
      type: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        setActionLoading(id)
        try {
          const res = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteUser', ids: [id] })
          })
          const data = await res.json()
          if (res.ok) {
            showAlert({
              title: 'Hapus Berhasil',
              message: 'User berhasil dihapus!',
              type: 'success'
            })
            getAdminData()
          } else {
            showAlert({
              title: 'Gagal Menghapus',
              message: data.error || 'Gagal menghapus user',
              type: 'danger'
            })
          }
        } catch (error: any) {
          showAlert({
            title: 'Error',
            message: `Error: ${error.message}`,
            type: 'danger'
          })
        } finally {
          setActionLoading(null)
        }
      }
    })
  }

  const filteredUsers = allUsers.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.full_name?.toLowerCase() || '').includes(search.toLowerCase())
  ).slice(0, 10)

  const trendData = getOmzetTrend(paymentsList)
  const maxVal = Math.max(...trendData.map(d => d.value), 100000)

  // Desain Grafik SVG Kustom
  const chartHeight = 160
  const chartWidth = 500
  const paddingLeft = 60
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 30

  const coords = trendData.map((d, i) => {
    const x = paddingLeft + (i * ((chartWidth - paddingLeft - paddingRight) / 6))
    const y = (chartHeight - paddingBottom) - (d.value / maxVal * (chartHeight - paddingTop - paddingBottom))
    return { x, y, label: d.label, value: d.value }
  })

  const linePath = coords.length > 0 
    ? `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ') 
    : ''
  const areaPath = coords.length > 0 
    ? `M ${coords[0].x} ${chartHeight - paddingBottom} ` + coords.map(c => `L ${c.x} ${c.y}`).join(' ') + ` L ${coords[coords.length - 1].x} ${chartHeight - paddingBottom} Z`
    : ''

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4 bg-black text-white">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
      <span className="text-xs font-bold uppercase tracking-widest">Sinkronisasi Database...</span>
    </div>
  )

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="hidden md:block border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">Admin <span className="text-yellow-500">Dashboard</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1.5 tracking-wider">Ikhtisar data member, omzet transaksi, dan performa VIP saat ini</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="p-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 hover:border-neutral-700/50 shadow-lg shadow-black/20 rounded-2xl relative overflow-hidden group transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-blue-500/5 blur-xl rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-300" />
          <div className="h-10 w-10 bg-blue-500/5 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
            <Users size={18} />
          </div>
          <div className="text-2xl font-bold leading-none tracking-tight text-white">{stats.totalUser}</div>
          <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-2.5">Pendaftar</div>
        </div>

        {/* VIP Active */}
        <div className="p-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 hover:border-neutral-700/50 shadow-lg shadow-black/20 rounded-2xl relative overflow-hidden group transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-green-500/5 blur-xl rounded-full pointer-events-none group-hover:bg-green-500/10 transition-all duration-300" />
          <div className="h-10 w-10 bg-green-500/5 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
            <TrendingUp size={18} />
          </div>
          <div className="text-2xl font-bold leading-none tracking-tight text-green-400">{stats.vipAktif}</div>
          <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-2.5">VIP Aktif</div>
        </div>

        {/* Total Omzet */}
        <div className="p-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 hover:border-neutral-700/50 shadow-lg shadow-black/20 rounded-2xl col-span-2 md:col-span-1 relative overflow-hidden group transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-yellow-500/5 blur-xl rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-300" />
          <div className="h-10 w-10 bg-yellow-500/5 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
            <Wallet size={18} />
          </div>
          <div className="text-2xl font-bold leading-none tracking-tight text-yellow-500">Rp {stats.omzet.toLocaleString('id-ID')}</div>
          <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-2.5">Total Omzet</div>
        </div>
      </div>

      {/* Grafik Tren Omzet Kustom */}
      <div className="p-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 rounded-2xl relative overflow-hidden group transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/5 blur-2xl rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-300" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-yellow-500 animate-pulse" />
              Tren Omzet Harian
            </h3>
            <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1 tracking-wider">Visualisasi omzet harian 7 hari terakhir dari transaksi VIP sukses</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Puncak Omzet</span>
            <span className="text-xs font-black text-yellow-500">Rp {maxVal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
            <defs>
              {/* Glow filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {/* Gradient for line path */}
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              {/* Gradient for area fill */}
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.5, 1].map((ratio, idx) => {
              const yVal = (chartHeight - paddingBottom) - (ratio * (chartHeight - paddingTop - paddingBottom))
              return (
                <g key={idx}>
                  <line 
                    x1={paddingLeft} 
                    y1={yVal} 
                    x2={chartWidth - paddingRight} 
                    y2={yVal} 
                    stroke="#262626" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={yVal + 3} 
                    fill="#737373" 
                    fontSize="8" 
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {Math.round(ratio * maxVal / 1000) * 1000 === 0 ? '0' : `${Math.round(ratio * maxVal / 1000)}k`}
                  </text>
                </g>
              )
            })}

            {/* Area Path */}
            {areaPath && (
              <path d={areaPath} fill="url(#areaGrad)" />
            )}

            {/* Line Path */}
            {linePath && (
              <path 
                d={linePath} 
                fill="none" 
                stroke="url(#lineGrad)" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
            )}

            {/* Interaction Dots */}
            {coords.map((c, i) => (
              <g key={i}>
                <circle 
                  cx={c.x} 
                  cy={c.y} 
                  r={hoveredIndex === i ? 6 : 4} 
                  fill={hoveredIndex === i ? '#ffffff' : '#eab308'} 
                  stroke="#171717"
                  strokeWidth={hoveredIndex === i ? 2 : 1.5}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {/* Invisible larger circle for easier hover */}
                <circle 
                  cx={c.x} 
                  cy={c.y} 
                  r="12" 
                  fill="transparent" 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {/* X Axis Labels */}
                <text 
                  x={c.x} 
                  y={chartHeight - 10} 
                  fill={hoveredIndex === i ? '#eab308' : '#737373'} 
                  fontSize="8" 
                  fontWeight="bold"
                  textAnchor="middle"
                  className="transition-colors duration-200"
                >
                  {c.label}
                </text>
              </g>
            ))}
          </svg>

          {/* HTML Absolute Tooltip */}
          {hoveredIndex !== null && (
            <div 
              className="absolute bg-neutral-950 border border-yellow-500/30 rounded-xl p-2.5 text-[9px] font-black uppercase tracking-wider text-white shadow-2xl pointer-events-none transition-all duration-150 ease-out"
              style={{
                left: `${(coords[hoveredIndex].x / chartWidth) * 100}%`,
                top: `${(coords[hoveredIndex].y / chartHeight) * 100 - 15}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="text-neutral-500 text-[8px] mb-0.5">{coords[hoveredIndex].label}</div>
              <div className="text-yellow-500 font-sans text-xs">Rp {coords[hoveredIndex].value.toLocaleString('id-ID')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center bg-neutral-950/30 border border-neutral-800 rounded-2xl px-4 py-3.5 focus-within:border-yellow-500/50 focus-within:ring-4 focus-within:ring-yellow-500/5 transition-all duration-300">
        <Search className="text-neutral-500 mr-3" size={16} />
        <input 
          type="text"
          placeholder="Cari email atau nama..."
          className="w-full bg-transparent text-xs font-bold uppercase tracking-wider outline-none text-white placeholder-neutral-600 animate-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Database View */}
      <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-5 border-b border-neutral-800/80 flex justify-between items-center bg-neutral-950/50">
          <div className="flex items-center gap-2">
            <History size={16} className="text-yellow-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Recent Members</h3>
          </div>
        </div>
        
        <div className="divide-y divide-neutral-900">
          {filteredUsers.length > 0 ? filteredUsers.map((user) => (
            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-neutral-900/25 transition-all duration-300 group">
              <div className="flex items-center gap-4 text-left">
                <div className="h-10 w-10 rounded-xl bg-neutral-900/60 flex items-center justify-center text-xs font-bold text-yellow-500/80 border border-neutral-800 uppercase shrink-0">
                  {user.email.substring(0, 2)}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-tight text-white group-hover:text-yellow-500 transition-colors font-sans">
                    {user.full_name || 'Anonymous'}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide truncate">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                  user.plan?.toLowerCase() === 'vip' 
                  ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/15' 
                  : 'bg-neutral-900/80 text-neutral-500 border-neutral-800'
                }`}>
                  {user.plan || 'FREE'}
                </div>
                
                 {user.plan?.toLowerCase() !== 'vip' && (
                  <button 
                    onClick={() => setUpgradeUser(user)}
                    disabled={actionLoading === user.id}
                    className="p-2.5 bg-green-500/5 text-green-400 rounded-xl border border-green-500/10 hover:bg-green-500 hover:text-black hover:border-green-400 hover:shadow-lg hover:shadow-green-500/10 transition-all active:scale-95 duration-300 cursor-pointer"
                  >
                    {actionLoading === user.id ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  </button>
                )}

                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={actionLoading === user.id}
                  className="p-2.5 bg-red-500/5 text-red-400 rounded-xl border border-red-500/10 hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all active:scale-95 duration-300 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-xs font-bold text-neutral-600 uppercase tracking-widest">
              Tidak ada data ditemukan
            </div>
          )}
        </div>
      </div>

      {/* UPGRADE MANUAL PLAN SELECTION MODAL */}
      {upgradeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setUpgradeUser(null)} />
          
          <div className="relative w-full max-w-md bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/50">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Pilih Paket VIP</h3>
                <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5 tracking-tight truncate max-w-[280px]">User: {upgradeUser.email}</p>
              </div>
              <button 
                onClick={() => setUpgradeUser(null)} 
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
              >
                <X size={14}/>
              </button>
            </div>
            
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {plans.length > 0 ? plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleUpgradeManual(upgradeUser, plan)}
                  className="w-full text-left p-4 rounded-2xl border border-neutral-800 bg-neutral-900/20 hover:bg-neutral-800/40 hover:border-yellow-500/20 transition-all duration-300 flex justify-between items-center group cursor-pointer active:scale-[0.98]"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase text-white group-hover:text-yellow-500 transition-colors">{plan.nama_paket}</h4>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase leading-none">Durasi: {plan.durasi_hari} Hari</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-yellow-500">Rp {plan.harga.toLocaleString('id-ID')}</p>
                  </div>
                </button>
              )) : (
                <div className="p-6 text-center text-xs font-bold text-neutral-600 uppercase tracking-widest">
                  Belum ada paket pricing terdaftar
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}