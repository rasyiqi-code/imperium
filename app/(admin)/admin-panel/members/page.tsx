'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  RefreshCw, Eye, X, Trash2, Search, PlusCircle, CheckSquare, Square, 
  MessageSquare, Mail, User, Smartphone, UserMinus
} from 'lucide-react'

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

  async function deleteMembers(ids: string[]) {
    if (!confirm(`Hapus ${ids.length > 1 ? ids.length + ' member' : 'member ini'} secara permanen?`)) return
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
      alert('Berhasil dihapus.')
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      alert(`Gagal hapus: ${errMsg}`)
    } finally {
      setIsProcessing(false)
    }
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
      alert('Berhasil Upgrade/Perpanjang!')
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      alert(`Error: ${errMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleDeactivate(member: Profile) {
    if (!confirm(`Yakin ingin mencabut akses VIP ${member.email}?`)) return
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
      alert('Akses VIP berhasil dicabut.')
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      alert(`Error: ${errMsg}`)
    } finally {
      setIsProcessing(false)
    }
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
    <div className="bg-black min-h-screen text-white pb-32 font-sans text-left">
      
      {/* Search & Bulk Action Bar */}
      <div className="bg-neutral-900/50 border-b border-neutral-800 p-4 md:p-6 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="text" placeholder="Cari member..." 
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold uppercase tracking-wider outline-none focus:border-yellow-500 transition-all text-white"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button 
                onClick={() => deleteMembers(selectedIds)} 
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all animate-in fade-in zoom-in"
              >
                <Trash2 size={16} /> Hapus ({selectedIds.length})
              </button>
            )}
            <button onClick={refreshData} className="p-2.5 bg-neutral-900 border border-neutral-800 text-yellow-500 rounded-xl active:scale-95 transition-all">
              <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4">
        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filteredMembers.map(m => (
            <div key={m.id} className={`p-4 rounded-xl border transition-all duration-300 ${selectedIds.includes(m.id) ? 'bg-yellow-500/5 border-yellow-500/50' : 'bg-neutral-900 border-neutral-800'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <button onClick={() => toggleSelectOne(m.id)} className={selectedIds.includes(m.id) ? 'text-yellow-500' : 'text-neutral-700'}>
                    {selectedIds.includes(m.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold uppercase truncate max-w-40">{m.full_name || 'Anonymous'}</span>
                    <span className="text-xs text-neutral-500 font-medium truncate max-w-40 leading-none">{m.email}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase border ${m.plan === 'vip' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10' : 'text-neutral-600 border-neutral-800'}`}>
                  {m.plan || 'FREE'}
                </span>
              </div>
              <button onClick={() => setSelectedMember(m)} className="w-full py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-bold uppercase hover:bg-neutral-700 transition-all text-white">Detail Member</button>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-neutral-800/50 text-xs font-bold uppercase text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 w-10 text-center">
                  <button onClick={toggleSelectAll}>{selectedIds.length === filteredMembers.length ? <CheckSquare size={18} className="text-yellow-500" /> : <Square size={18} />}</button>
                </th>
                <th className="px-6 py-4">Info Member</th>
                <th className="px-6 py-4 text-center">Plan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-xs font-medium">
              {filteredMembers.map(m => (
                <tr key={m.id} className={selectedIds.includes(m.id) ? 'bg-yellow-500/5' : 'hover:bg-neutral-800/50 transition-all'}>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => toggleSelectOne(m.id)}>{selectedIds.includes(m.id) ? <CheckSquare size={18} className="text-yellow-500" /> : <Square size={18} />}</button>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="font-bold uppercase text-white">{m.full_name || 'Anonymous'}</div>
                    <div className="text-neutral-500 font-medium">{m.email}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-lg font-bold uppercase border ${m.plan === 'vip' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10' : 'text-neutral-600 border-neutral-800'}`}>{m.plan || 'FREE'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedMember(m)} className="p-2 text-neutral-500 hover:text-yellow-500 transition-all active:scale-90"><Eye size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Detail */}
      {selectedMember && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 text-left">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h3 className="font-bold uppercase tracking-tight text-white text-sm leading-none">Member Detail</h3>
              <button onClick={() => setSelectedMember(null)} className="text-neutral-500 hover:text-white transition-all"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <InfoItem label="Email Address" value={selectedMember.email} icon={<Mail size={14}/>} />
              <InfoItem label="Full Name" value={selectedMember.full_name || 'Anonymous'} icon={<User size={14}/>} />
              <InfoItem label="WhatsApp" value={selectedMember.whatsapp_number || 'NA'} icon={<Smartphone size={14}/>} />
              
              <div className="flex flex-col gap-2 pt-4 border-t border-neutral-800">
                <button 
                  onClick={() => handleUpgrade(selectedMember)}
                  disabled={isProcessing}
                  className={`w-full py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${selectedMember.plan === 'vip' ? 'bg-neutral-800 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black' : 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10 hover:bg-yellow-400'}`}
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : selectedMember.plan === 'vip' ? <><PlusCircle size={16} /> Perpanjang VIP</> : 'Upgrade ke VIP'}
                </button>

                {/* TOMBOL NONAKTIFKAN VIP */}
                {selectedMember.plan === 'vip' && (
                  <button 
                    onClick={() => handleDeactivate(selectedMember)}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <UserMinus size={16} />} Nonaktifkan VIP
                  </button>
                )}

                <a href={`https://wa.me/${selectedMember.whatsapp_number?.replace(/[^0-9]/g, '')}`} target="_blank" className="w-full py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={16} /> Chat WhatsApp
                </a>
                
                <button onClick={() => deleteMembers([selectedMember.id])} className="w-full py-3.5 bg-neutral-800 text-neutral-500 border border-neutral-800 rounded-xl text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                  <Trash2 size={16} /> Hapus Akun
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