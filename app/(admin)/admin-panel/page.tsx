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

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4 bg-black text-white">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
      <span className="text-xs font-bold uppercase tracking-widest">Sinkronisasi Database...</span>
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white">
      
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