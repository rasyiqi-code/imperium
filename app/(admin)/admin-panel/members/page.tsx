'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'
import Loader from '@/components/Loader'
import MemberDetailModal from '@/components/admin/MemberDetailModal'
import { exportToCSV } from '@/lib/utils/csv'

import MemberFilterBar from '@/components/admin/members/MemberFilterBar'
import MemberDesktopTable from '@/components/admin/members/MemberDesktopTable'
import MemberMobileCardList from '@/components/admin/members/MemberMobileCardList'
import { Profile } from '@/components/admin/members/types'

export default function ManageMembers() {
  const { showAlert, showConfirm } = useModal()
  const [members, setMembers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Paginasi & State Filter Plan
  const [selectedPlan, setSelectedPlan] = useState<'all' | 'vip' | 'free'>('all')
  const [offset, setOffset] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 10

  const fetchMembers = useCallback(async (offsetVal: number, planVal: 'all' | 'vip' | 'free') => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getMembers', limit, offset: offsetVal, plan: planVal })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch members')
      return {
        members: (data.members as Profile[]) || [],
        totalCount: data.totalCount || 0
      }
    } catch (err) {
      console.error('Error fetching members:', err)
      return { members: [], totalCount: 0 }
    }
  }, [])

  const refreshData = useCallback(async () => {
    await Promise.resolve()
    setLoading(true)
    const result = await fetchMembers(0, selectedPlan)
    setMembers(result.members)
    setTotalCount(result.totalCount)
    setOffset(0)
    setHasMore(result.members.length < result.totalCount)
    setSelectedIds([])
    setLoading(false)
  }, [fetchMembers, selectedPlan])

  const loadMore = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    const nextOffset = offset + limit
    const result = await fetchMembers(nextOffset, selectedPlan)
    if (result.members.length > 0) {
      setMembers(prev => [...prev, ...result.members])
      setOffset(nextOffset)
      setHasMore(members.length + result.members.length < result.totalCount)
    } else {
      setHasMore(false)
    }
    setIsProcessing(false)
  }

  // Unduh CSV menggunakan helper modul csv.ts
  const handleExportCSV = () => {
    const headers = [
      'Email', 
      'Nama Lengkap', 
      'No WhatsApp', 
      'Paket', 
      'Status', 
      'Tanggal Daftar', 
      'Paket VIP Aktif', 
      'Tanggal Upgrade VIP', 
      'Tanggal Expired VIP'
    ]
    
    const rows = filteredMembers.map(m => [
      m.email,
      m.full_name || 'Anonymous',
      m.whatsapp_number || '',
      m.plan || 'free',
      m.plan_status || 'free',
      m.created_at ? new Date(m.created_at).toLocaleString('id-ID') : '',
      m.vip_plan_name || '-',
      m.vip_activated_at ? new Date(m.vip_activated_at).toLocaleString('id-ID') : '-',
      m.vip_expired_at ? new Date(m.vip_expired_at).toLocaleString('id-ID') : '-'
    ])

    exportToCSV(`members_export_${new Date().getTime()}.csv`, headers, rows)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshData()
    }, 0)
    return () => clearTimeout(timer)
  }, [refreshData])

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

  async function handleUpgrade(member: Profile, planId: string) {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upgradeManual', userId: member.id, planId })
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
      title: 'Set Kedaluwarsa VIP',
      message: `Yakin ingin mengatur status VIP ${member.email} sebagai kedaluwarsa?`,
      type: 'warning',
      confirmText: 'Ya, Set',
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
          if (!res.ok) throw new Error(data.error || 'Gagal memproses perubahan')

          const updatedData = { ...member, plan: 'free', plan_status: 'free' }
          setMembers(prev => prev.map(m => m.id === member.id ? updatedData : m))
          setSelectedMember(updatedData)
          showAlert({
            title: 'VIP Kedaluwarsa',
            message: 'Akses VIP berhasil diatur sebagai kedaluwarsa.',
            type: 'success'
          })
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error'
          showAlert({
            title: 'Gagal Memproses',
            message: `Error: ${errMsg}`,
            type: 'danger'
          })
        } finally {
          setIsProcessing(false)
        }
      }
    })
  }

  async function handleUpdatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateUserPassword', userId, newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah password')

      showAlert({
        title: 'Berhasil',
        message: 'Password member berhasil diperbarui!',
        type: 'success'
      })
      return true
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      showAlert({
        title: 'Gagal',
        message: `Error: ${errMsg}`,
        type: 'danger'
      })
      return false
    }
  }

  const filteredMembers = members.filter(m => 
    m.email.toLowerCase().includes(search.toLowerCase()) || 
    (m.full_name?.toLowerCase() || '').includes(search.toLowerCase())
  )

  if (loading) return <Loader label="Memuat Daftar Anggota..." />

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white font-sans text-left animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="hidden md:block border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">
          Members <span className="text-yellow-500">Manager</span>
          <span className="ml-2 text-xs font-normal text-neutral-400 font-mono">({totalCount} Member)</span>
        </h1>
        <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Kelola data member registrasi, status membership VIP, dan opsi chat langsung</p>
      </div>

      {/* Search & Bulk Action Bar */}
      <MemberFilterBar 
        search={search}
        onSearchChange={setSearch}
        selectedIdsLength={selectedIds.length}
        onBulkDelete={() => deleteMembers(selectedIds)}
        onRefresh={refreshData}
        isProcessing={isProcessing}
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
        onExportCSV={handleExportCSV}
      />

      <main className="w-full">
        {/* Mobile Card View */}
        <MemberMobileCardList 
          members={filteredMembers}
          selectedIds={selectedIds}
          onToggleSelectOne={toggleSelectOne}
          onSelectMember={setSelectedMember}
        />

        {/* Desktop Table View */}
        <MemberDesktopTable 
          members={filteredMembers}
          selectedIds={selectedIds}
          filteredMembersLength={filteredMembers.length}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectOne={toggleSelectOne}
          onSelectMember={setSelectedMember}
        />

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMore}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-950/40 border border-neutral-800 hover:border-neutral-700 active:scale-95 text-xs font-black tracking-widest text-neutral-400 hover:text-white rounded-xl transition-all duration-300 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="animate-spin" size={14} /> Loading...
                </>
              ) : (
                'Tampilkan Lebih Banyak'
              )}
            </button>
          </div>
        )}
      </main>

      {/* Modal Detail */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          isProcessing={isProcessing}
          onUpgrade={handleUpgrade}
          onDeactivate={handleDeactivate}
          onDelete={(id) => deleteMembers([id])}
          onUpdatePassword={handleUpdatePassword}
        />
      )}
    </div>
  )
}