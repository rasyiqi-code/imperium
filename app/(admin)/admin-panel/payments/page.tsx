'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  CheckCircle2, Wallet, 
  ExternalLink, Search, RefreshCw, Download
} from 'lucide-react'
import { Payment } from '@/lib/types'
import { useModal } from '@/components/ModalProvider'

export default function PaymentAdmin() {
  const { showAlert, showConfirm } = useModal()
  const [payments, setPayments] = useState<Payment[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'pending' | 'success' | 'failed' | 'all'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  // State paginasi client-side
  const [visibleCount, setVisibleCount] = useState(10)



  const fetchPayments = useCallback(async () => {
    const { data, error } = await supabase
      .from('data_pembayaran')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setPayments(data as Payment[])
    }
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const handleConfirmPayment = (pay: Payment) => {
    showConfirm({
      title: 'Konfirmasi Pembayaran',
      message: `Konfirmasi pembayaran dari ${pay.email_member}? User akan otomatis jadi VIP.`,
      type: 'warning',
      confirmText: 'Ya, Konfirmasi',
      cancelText: 'Batal',
      onConfirm: async () => {
        setProcessingId(pay.id)
        try {
          const res = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'confirmPayment', paymentId: pay.id })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Gagal mengonfirmasi pembayaran')

          showAlert({
            title: 'Pembayaran Diterima',
            message: 'Pembayaran Berhasil Dikonfirmasi!',
            type: 'success'
          })
          fetchPayments()
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error'
          showAlert({
            title: 'Error',
            message: `Gagal: ${errMsg}`,
            type: 'danger'
          })
        } finally {
          setProcessingId(null)
        }
      }
    })
  }

  const handleReject = (id: string) => {
    showConfirm({
      title: 'Tolak Pembayaran',
      message: 'Tolak pembayaran ini?',
      type: 'danger',
      confirmText: 'Ya, Tolak',
      cancelText: 'Batal',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'rejectPayment', paymentId: id })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Gagal menolak pembayaran')
          fetchPayments()
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error'
          showAlert({
            title: 'Error',
            message: `Gagal: ${errMsg}`,
            type: 'danger'
          })
        }
      }
    })
  }

  const filtered = payments.filter(p => {
    const matchesSearch = p.email_member.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' ? true : p.status_pembayaran === filter
    return matchesSearch && matchesFilter
  })

  // Limit porsi data yang di-render di client
  const paginated = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  // Unduh rekap pembayaran tersaring sebagai CSV
  const exportToCSV = () => {
    const headers = ['ID Pembayaran', 'Email Member', 'Nama Paket', 'Harga Bayar', 'Status', 'Bukti Transfer', 'Tanggal']
    const rows = filtered.map(p => [
      p.id,
      p.email_member,
      p.nama_paket,
      p.harga_bayar,
      p.status_pembayaran,
      p.bukti_transfer || '',
      p.created_at ? new Date(p.created_at).toLocaleString('id-ID') : ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `payments_export_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white font-sans text-left animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="hidden md:block border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">Payment <span className="text-yellow-500">Confirmation</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1.5 tracking-wider">Konfirmasi pembayaran manual member dan sinkronisasi gateway Midtrans</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 p-4 md:p-5 rounded-2xl shadow-lg mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 flex items-center bg-neutral-900/20 border border-neutral-800 focus-within:border-yellow-500/50 focus-within:ring-4 focus-within:ring-yellow-500/5 transition-all duration-300 rounded-xl px-4 py-2.5">
              <Search className="text-neutral-500 mr-3" size={16} />
              <input 
                type="text" placeholder="Cari Email..." 
                className="w-full bg-transparent text-xs font-bold uppercase tracking-wider outline-none text-white placeholder-neutral-600 animate-none"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-900/80">
            <div className="flex bg-neutral-950/50 p-1 rounded-xl border border-neutral-800/80 backdrop-blur-md self-start md:self-auto">
              {(['pending', 'success', 'failed', 'all'] as const).map((f) => (
                <button 
                  key={f} onClick={() => {
                    setFilter(f)
                    setVisibleCount(10) // reset paginasi saat filter ganti
                  }}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${filter === f ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/10' : 'text-neutral-500 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Download size={12} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginated.map((pay) => (
          <div key={pay.id} className="p-5 rounded-2xl bg-neutral-950/30 backdrop-blur-md border border-neutral-800 hover:border-neutral-700/50 shadow-lg hover:shadow-black/30 flex flex-col gap-4 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-16 h-16 bg-neutral-500/2 blur-xl rounded-full pointer-events-none group-hover:bg-yellow-500/2 duration-300" />
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-neutral-900/60 border border-neutral-800 text-yellow-500 rounded-xl flex items-center justify-center shrink-0">
                  <Wallet size={18} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold uppercase text-white truncate max-w-40 md:max-w-xs">{pay.email_member}</p>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase mt-0.5 tracking-wider truncate max-w-40 md:max-w-xs leading-none">{pay.nama_paket}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                pay.status_pembayaran === 'success' ? 'text-green-400 border-green-500/10 bg-green-500/5' : 
                pay.status_pembayaran === 'failed' ? 'text-red-400 border-red-500/10 bg-red-500/5' : 
                'text-yellow-500 border-yellow-500/15 bg-yellow-500/5'
              }`}>
                {pay.status_pembayaran}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-neutral-900/20 border border-neutral-800/80 rounded-xl">
              <span className="text-xs font-black text-white tracking-wider">Rp {pay.harga_bayar.toLocaleString('id-ID')}</span>
              {pay.bukti_transfer && pay.bukti_transfer.startsWith('IMP-') ? (
                <span className="text-[10px] font-black text-neutral-500 tracking-widest">MIDTRANS ONLINE</span>
              ) : (
                <a href={pay.bukti_transfer} target="_blank" className="flex items-center gap-1.5 text-[10px] font-black text-yellow-500 uppercase hover:underline leading-none">
                  Bukti <ExternalLink size={12} />
                </a>
              )}
            </div>

            {pay.status_pembayaran === 'pending' && (!pay.bukti_transfer || !pay.bukti_transfer.startsWith('IMP-')) && (
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => handleConfirmPayment(pay)}
                  disabled={processingId === pay.id}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-black rounded-xl text-[10px] uppercase tracking-wider shadow-lg shadow-green-500/10 hover:shadow-green-500/25 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {processingId === pay.id ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Konfirmasi
                </button>
                <button 
                  onClick={() => handleReject(pay.id)}
                  className="px-5 py-3 bg-red-500/5 text-red-400 border border-red-500/10 hover:bg-red-500 hover:text-white hover:border-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-[0.98] transition-all duration-300 cursor-pointer"
                >
                  Tolak
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-950/40 border border-neutral-800 hover:border-neutral-700 active:scale-95 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white rounded-xl transition-all duration-300 cursor-pointer"
          >
            Tampilkan Lebih Banyak
          </button>
        </div>
      )}
    </div>
  )
}