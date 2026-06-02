'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  RefreshCw, Eye, X, Trash2, Search, PlusCircle, CheckSquare, Square, 
  MessageSquare, Mail, User, Smartphone, UserMinus
} from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  whatsapp_number: string | null;
  plan: string | null;
  plan_status: string | null;
  created_at: string;
}

export default function ManageMembers() {
  const { showAlert, showConfirm } = useModal()
  const [members, setMembers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getMembers' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch members')
      return (data.members as Profile[]) || []
    } catch (err) {
      console.error('Error fetching members:', err)
      return []
    }
  }, [])


  const refreshData = useCallback(async () => {
    setLoading(true)
    const data = await fetchMembers()
    setMembers(data)
    setSelectedIds([])
    setLoading(false)
  }, [fetchMembers])

  useEffect(() => { refreshData() }, [fetchMembers, refreshData])

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) setSelectedIds([])
    else setSelectedIds(filteredMembers.map(m => m.id))
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const deleteMembers = (ids: string[]) => {
    showConfirm({
      title: 'Hapus Member',
      message: `Hapus ${ids.length > 1 ? ids.length + ' member' : 'member ini'} secara permanen?`,
      type: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        setIsProcessing(true)
        try {
          const res = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteUser', ids })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Gagal menghapus user')

          setMembers(prev => prev.filter(m => !ids.includes(m.id)))
          setSelectedIds([])
          setSelectedMember(null)
          showAlert({
            title: 'Berhasil Dihapus',
            message: 'Member berhasil dihapus secara permanen.',
            type: 'success'
          })
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error'
          showAlert({
            title: 'Gagal Menghapus',
            message: `Gagal hapus: ${errMsg}`,
            type: 'danger'
          })
        } finally {
          setIsProcessing(false)
        }
      }
    })
  }

  async function handleUpgrade(member: Profile) {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upgradeManual', userId: member.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal upgrade user')

      const updatedData = { ...member, plan: 'vip', plan_status: 'vip' }
      setMembers(prev => prev.map(m => m.id === member.id ? updatedData : m))
      setSelectedMember(updatedData)
      showAlert({
        title: 'Upgrade Berhasil',
        message: 'Akses VIP member berhasil diaktifkan/diperpanjang!',
        type: 'success'
      })
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      showAlert({
        title: 'Error',
        message: `Error: ${errMsg}`,
        type: 'danger'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeactivate = (member: Profile) => {
    showConfirm({
      title: 'Cabut Akses VIP',
      message: `Yakin ingin mencabut akses VIP ${member.email}?`,
      type: 'warning',
      confirmText: 'Ya, Cabut',
      cancelText: 'Batal',
      onConfirm: async () => {
        setIsProcessing(true)
        try {
          const res = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deactivateVip', userId: member.id })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Gagal menonaktifkan user')

          const updatedData = { ...member, plan: 'free', plan_status: 'free' }
          setMembers(prev => prev.map(m => m.id === member.id ? updatedData : m))
          setSelectedMember(updatedData)
          showAlert({
            title: 'Akses VIP Dicabut',
            message: 'Akses VIP berhasil dicabut.',
            type: 'success'
          })
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error'
          showAlert({
            title: 'Gagal Mencabut',
            message: `Error: ${errMsg}`,
            type: 'danger'
          })
        } finally {
          setIsProcessing(false)
        }
      }
    })
  }

  const filteredMembers = members.filter(m => 
    m.email.toLowerCase().includes(search.toLowerCase()) || 
    (m.full_name?.toLowerCase() || '').includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white font-sans text-left animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">Members <span className="text-yellow-500">Manager</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1.5 tracking-wider">Kelola data member registrasi, status membership VIP, dan opsi chat langsung</p>
      </div>

      {/* Search & Bulk Action Bar */}
      <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 p-4 md:p-5 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 flex items-center bg-neutral-900/20 border border-neutral-800 focus-within:border-yellow-500/50 focus-within:ring-4 focus-within:ring-yellow-500/5 transition-all duration-300 rounded-xl px-4 py-2.5">
            <Search className="text-neutral-500 mr-3" size={16} />
            <input 
              type="text" placeholder="Cari member..." 
              className="w-full bg-transparent text-xs font-bold uppercase tracking-wider outline-none text-white placeholder-neutral-600 animate-none"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button 
                onClick={() => deleteMembers(selectedIds)} 
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300 animate-in fade-in zoom-in-95 cursor-pointer"
              >
                <Trash2 size={14} /> Hapus ({selectedIds.length})
              </button>
            )}
            <button onClick={refreshData} className="p-2.5 bg-neutral-900/80 border border-neutral-800 text-yellow-500 rounded-xl active:scale-95 transition-all cursor-pointer">
              <RefreshCw size={18} className={isProcessing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <main className="w-full">
        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filteredMembers.map(m => (
            <div key={m.id} className={`p-4 rounded-xl border transition-all duration-300 ${selectedIds.includes(m.id) ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-neutral-950/20 backdrop-blur-md border-neutral-800 hover:border-neutral-800'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <button onClick={() => toggleSelectOne(m.id)} className={selectedIds.includes(m.id) ? 'text-yellow-500' : 'text-neutral-600'}>
                    {selectedIds.includes(m.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold uppercase truncate max-w-40 text-white">{m.full_name || 'Anonymous'}</span>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider truncate max-w-40 leading-none mt-1">{m.email}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border ${
                  m.plan === 'vip' 
                  ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/15' 
                  : 'bg-neutral-900/80 text-neutral-500 border-neutral-800'
                }`}>
                  {m.plan || 'FREE'}
                </span>
              </div>
              <button onClick={() => setSelectedMember(m)} className="w-full py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-bold uppercase transition-all duration-300 text-white cursor-pointer">Detail Member</button>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-neutral-950/30 backdrop-blur-md border border-neutral-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-neutral-950/50 text-[10px] font-black uppercase text-neutral-500 border-b border-neutral-900 tracking-wider">
              <tr>
                <th className="px-6 py-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="cursor-pointer">{selectedIds.length === filteredMembers.length ? <CheckSquare size={18} className="text-yellow-500" /> : <Square size={18} className="text-neutral-600" />}</button>
                </th>
                <th className="px-6 py-4">Info Member</th>
                <th className="px-6 py-4 text-center">Plan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs font-medium">
              {filteredMembers.map(m => (
                <tr key={m.id} className={selectedIds.includes(m.id) ? 'bg-yellow-500/5' : 'hover:bg-neutral-900/25 transition-all duration-300 group'}>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleSelectOne(m.id)} className="cursor-pointer">{selectedIds.includes(m.id) ? <CheckSquare size={18} className="text-yellow-500" /> : <Square size={18} className="text-neutral-600" />}</button>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="font-bold uppercase text-white group-hover:text-yellow-500 transition-colors font-sans">{m.full_name || 'Anonymous'}</div>
                    <div className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5 tracking-tight">{m.email}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                      m.plan === 'vip' 
                      ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/15' 
                      : 'bg-neutral-900/80 text-neutral-500 border-neutral-800'
                    }`}>{m.plan || 'FREE'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedMember(m)} className="p-2 bg-neutral-900/60 border border-neutral-800 hover:border-yellow-500/30 hover:text-yellow-500 rounded-xl transition-all duration-300 cursor-pointer"><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Detail */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setSelectedMember(null)} />
          
          <div className="relative w-full max-w-sm bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-neutral-950/50">
              <h3 className="font-black uppercase tracking-wider text-white text-xs leading-none">Member Detail</h3>
              <button onClick={() => setSelectedMember(null)} className="text-neutral-500 hover:text-white transition-all cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <InfoItem label="Email Address" value={selectedMember.email} icon={<Mail size={14}/>} />
              <InfoItem label="Full Name" value={selectedMember.full_name || 'Anonymous'} icon={<User size={14}/>} />
              <InfoItem label="WhatsApp" value={selectedMember.whatsapp_number || 'NA'} icon={<Smartphone size={14}/>} />
              
              <div className="flex flex-col gap-2 pt-4 border-t border-neutral-900">
                <button 
                  onClick={() => handleUpgrade(selectedMember)}
                  disabled={isProcessing}
                  className={`w-full py-3.5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedMember.plan === 'vip' 
                    ? 'bg-neutral-900 border border-neutral-800 hover:border-yellow-500/20 text-yellow-500 hover:bg-neutral-900' 
                    : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25'
                  }`}
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : selectedMember.plan === 'vip' ? <><PlusCircle size={14} /> Perpanjang VIP</> : 'Upgrade ke VIP'}
                </button>

                {/* TOMBOL NONAKTIFKAN VIP */}
                {selectedMember.plan === 'vip' && (
                  <button 
                    onClick={() => handleDeactivate(selectedMember)}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-red-500/5 text-red-400 border border-red-500/10 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <UserMinus size={14} />} Nonaktifkan VIP
                  </button>
                )}

                <a href={`https://wa.me/${selectedMember.whatsapp_number?.replace(/[^0-9]/g, '')}`} target="_blank" className="w-full py-3.5 bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 rounded-xl text-center text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                  <MessageSquare size={14} /> Chat WhatsApp
                </a>
                
                <button onClick={() => deleteMembers([selectedMember.id])} className="w-full py-3.5 bg-red-500/5 text-red-400 border border-red-500/10 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
                  <Trash2 size={14} /> Hapus Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1.5 leading-none">{icon} {label}</span>
      <span className="text-xs font-bold text-white uppercase truncate">{value}</span>
    </div>
  )
}