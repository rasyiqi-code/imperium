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


interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: string | null;
  plan_status: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUser: 0, vipAktif: 0, omzet: 0 })
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [plans, setPlans] = useState<PaketVIP[]>([])
  const [upgradeUser, setUpgradeUser] = useState<Profile | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)


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

      const { data: payData } = await supabase.from('data_pembayaran').select('harga_bayar').eq('status_pembayaran', 'success')
      const { data: planData } = await supabase.from('data_paket_vip').select('*').order('harga', { ascending: true })

      const profiles = (dataMembers.members as Profile[]) || []
      const payments = (payData as any[]) || []
      const pricingPlans = (planData as PaketVIP[]) || []

      const totalOmzet = payments.reduce((acc, curr) => acc + (Number(curr.harga_bayar) || 0), 0)
      const vipAktifCount = profiles.filter(p => p.plan?.toLowerCase() === 'vip').length

      setStats({ totalUser: profiles.length, vipAktif: vipAktifCount, omzet: totalOmzet })
      setAllUsers(profiles)
      setPlans(pricingPlans)
    } catch (error) {
      console.error("Error syncing admin dashboard:", error)
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => { getAdminData() }, [])

  const handleUpgradeManual = async (user: Profile, plan: PaketVIP) => {
    const confirm = window.confirm(`Upgrade ${user.email} ke VIP secara Manual menggunakan ${plan.nama_paket} (Omzet + Rp ${plan.harga.toLocaleString('id-ID')})?`)
    if (!confirm) return

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
        alert("User berhasil menjadi VIP!")
        getAdminData()
      } else {
        alert(data.error || "Gagal melakukan upgrade")
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }


  const handleDeleteUser = async (id: string) => {
    const confirm = window.confirm("Hapus user ini secara permanen?")
    if (!confirm) return
    
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUser', ids: [id] })
      })
      const data = await res.json()
      if (res.ok) {
        alert("User berhasil dihapus!")
        getAdminData()
      } else {
        alert(data.error || "Gagal menghapus user")
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = allUsers.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.full_name?.toLowerCase() || '').includes(search.toLowerCase())
  ).slice(0, 10)

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4 bg-black text-white">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
      <span className="text-xs font-bold uppercase tracking-widest">Sinkronisasi Database...</span>
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-black min-h-screen text-white">
      
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
          <Users size={18} className="text-blue-500 mb-3" />
          <div className="text-2xl font-bold leading-none tracking-tight">{stats.totalUser}</div>
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-2">Pendaftar</div>
        </div>
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
          <TrendingUp size={18} className="text-green-500 mb-3" />
          <div className="text-2xl font-bold leading-none tracking-tight">{stats.vipAktif}</div>
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-2">VIP Aktif</div>
        </div>
        <div className="p-6 bg-yellow-500 rounded-xl col-span-2 md:col-span-1 shadow-lg shadow-yellow-500/10 border border-yellow-400">
          <Wallet size={18} className="text-black mb-2" />
          <div className="text-xl font-bold text-black leading-none uppercase tracking-tight">Rp {stats.omzet.toLocaleString('id-ID')}</div>
          <div className="text-xs font-bold text-black/60 uppercase tracking-wider mt-1">Total Omzet</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
        <input 
          type="text"
          placeholder="Cari email atau nama..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold uppercase tracking-wider focus:border-yellow-500 outline-none transition-all text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Database View */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <History size={16} className="text-yellow-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Recent Members</h3>
          </div>
        </div>
        
        <div className="divide-y divide-neutral-800">
          {filteredUsers.length > 0 ? filteredUsers.map((user) => (
            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-neutral-800/40 transition-colors">
              <div className="flex items-center gap-4 text-left">
                <div className="h-10 w-10 rounded-xl bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500 border border-neutral-700 uppercase">
                  {user.email.substring(0, 2)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs font-bold uppercase tracking-tight text-white">
                    {user.full_name || 'Anonymous'}
                  </div>
                  <div className="text-xs text-neutral-500 font-medium">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider border ${
                  user.plan?.toLowerCase() === 'vip' 
                  ? 'bg-yellow-500 text-black border-yellow-400' 
                  : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                }`}>
                  {user.plan || 'FREE'}
                </div>
                
                 {user.plan?.toLowerCase() !== 'vip' && (
                  <button 
                    onClick={() => setUpgradeUser(user)}
                    disabled={actionLoading === user.id}
                    className="p-2.5 bg-green-500/10 text-green-500 rounded-xl border border-green-500/20 hover:bg-green-500 hover:text-black transition-all active:scale-95 shadow-md"
                  >
                    {actionLoading === user.id ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  </button>
                )}


                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={actionLoading === user.id}
                  className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  <Trash2 size={16} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200 text-left">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Pilih Paket VIP</h3>
                <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5 tracking-tight truncate max-w-[280px]">User: {upgradeUser.email}</p>
              </div>
              <button 
                onClick={() => setUpgradeUser(null)} 
                className="w-8 h-8 rounded-full bg-neutral-850 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
              >
                <X size={16}/>
              </button>
            </div>
            
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {plans.length > 0 ? plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleUpgradeManual(upgradeUser, plan)}
                  className="w-full text-left p-4 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800/40 hover:border-yellow-500/30 transition-all active:scale-[0.98] flex justify-between items-center group cursor-pointer"
                >
                  <div>
                    <h4 className="text-xs font-black uppercase text-white group-hover:text-yellow-500 transition-colors">{plan.nama_paket}</h4>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1">Durasi: {plan.durasi_hari} Hari</p>
                  </div>
                  <div className="text-right">
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