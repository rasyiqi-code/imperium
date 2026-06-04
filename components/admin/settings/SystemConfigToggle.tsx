'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { useModal } from '@/components/ModalProvider'

interface ToggleItemProps {
  icon: ReactNode
  title: string
  desc: string
  dbField: 'email_notif_active' | 'maintenance_mode'
}

export default function SystemConfigToggle({ icon, title, desc, dbField }: ToggleItemProps) {
  const { showAlert } = useModal()
  const [active, setActive] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Load status awal
  useEffect(() => {
    let activeItem = true
    const getSetting = async () => {
      try {
        const res = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getAdminSettings' })
        })
        const data = await res.json()
        if (!activeItem) return
        if (res.ok && data.settings) {
          setActive(!!data.settings[dbField])
        }
      } catch (err) {
        console.error('Gagal memuat setting:', err)
      }
    }
    const timer = setTimeout(() => {
      getSetting()
    }, 0)
    return () => {
      activeItem = false
      clearTimeout(timer)
    }
  }, [dbField])

  const handleToggle = async () => {
    const newState = !active
    setActive(newState) // Optimistic UI
    setSyncing(true)
    
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleSetting',
          dbField,
          value: newState
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal update setting')
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Error Update',
        message: error.message || 'Gagal update setting di database!',
        type: 'danger'
      })
      setActive(!newState) // Rollback UI kalau error
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 text-left">
        <div className={syncing ? 'text-neutral-500 animate-pulse' : 'text-yellow-500'}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-black text-white leading-none">{title}</p>
          <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-tight leading-none">{desc}</p>
        </div>
      </div>
      <button 
        onClick={handleToggle} 
        disabled={syncing}
        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${active ? 'bg-yellow-500' : 'bg-neutral-800 border border-neutral-700'} ${syncing ? 'opacity-50' : ''}`}
      >
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${active ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}
