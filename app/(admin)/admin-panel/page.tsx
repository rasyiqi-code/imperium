'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  RefreshCw
} from 'lucide-react'

interface PaymentItem {
  harga_bayar: number;
  created_at: string | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUser: 0, vipAktif: 0, omzet: 0 })
  const [paymentsList, setPaymentsList] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Fungsi pembantu untuk mengelompokkan omzet 7 hari terakhir secara harian
  const getOmzetTrend = (payments: PaymentItem[]) => {
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
      <span className="text-xs font-bold tracking-widest">Sinkronisasi Database...</span>
    </div>
  )

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="hidden md:block border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black tracking-tight text-white">Admin <span className="text-yellow-500">Dashboard</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Ikhtisar data member, omzet transaksi, dan performa VIP saat ini</p>
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
          <div className="text-[10px] font-black text-neutral-500 tracking-widest mt-2.5">Pendaftar</div>
        </div>
 
        {/* VIP Active */}
        <div className="p-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 hover:border-neutral-700/50 shadow-lg shadow-black/20 rounded-2xl relative overflow-hidden group transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-green-500/5 blur-xl rounded-full pointer-events-none group-hover:bg-green-500/10 transition-all duration-300" />
          <div className="h-10 w-10 bg-green-500/5 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
            <TrendingUp size={18} />
          </div>
          <div className="text-2xl font-bold leading-none tracking-tight text-green-400">{stats.vipAktif}</div>
          <div className="text-[10px] font-black text-neutral-500 tracking-widest mt-2.5">VIP Aktif</div>
        </div>
 
        {/* Total Omzet */}
        <div className="p-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 hover:border-neutral-700/50 shadow-lg shadow-black/20 rounded-2xl col-span-2 md:col-span-1 relative overflow-hidden group transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-20 h-20 bg-yellow-500/5 blur-xl rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-300" />
          <div className="h-10 w-10 bg-yellow-500/5 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
            <Wallet size={18} />
          </div>
          <div className="text-2xl font-bold leading-none tracking-tight text-yellow-500">Rp {stats.omzet.toLocaleString('id-ID')}</div>
          <div className="text-[10px] font-black text-neutral-500 tracking-widest mt-2.5">Total Omzet</div>
        </div>
      </div>

      {/* Grafik Tren Omzet Kustom */}
      <div className="p-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 rounded-2xl relative overflow-hidden group transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/5 blur-2xl rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-300" />
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xs font-black tracking-widest text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-yellow-500 animate-pulse" />
              Tren Omzet Harian
            </h3>
            <p className="text-[10px] text-neutral-500 font-bold mt-1 tracking-wider">Visualisasi omzet harian 7 hari terakhir dari transaksi VIP sukses</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neutral-500 font-bold tracking-wider block">Puncak Omzet</span>
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
              className="absolute bg-neutral-950 border border-yellow-500/30 rounded-xl p-2.5 text-[9px] font-black tracking-wider text-white shadow-2xl pointer-events-none transition-all duration-150 ease-out"
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

    </div>
  )
}