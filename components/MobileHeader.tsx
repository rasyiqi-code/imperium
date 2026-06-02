'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Bell, X, CheckCircle, TrendingUp, BellOff, RefreshCw } from 'lucide-react'
import { Notification } from '@/lib/types'

export default function MobileHeader() {
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [hasUnread, setHasUnread] = useState(false)
  const [fetching, setFetching] = useState(false)

  // 1. Ambil data Notifikasi
  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Set fetching secara asinkron agar tidak memicu cascading render
      setFetching(true)

      const res = await fetch('/api/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getNotifications' })
      })
      const data = await res.json()

      if (res.ok && data.notifications) {
        const fetchedNotifs = data.notifications as Notification[]
        setNotifications(fetchedNotifs)
        setHasUnread(fetchedNotifs.some((n: Notification) => !n.is_read))
      }
    } catch (err) {
      console.error("Gagal ambil notif:", err)
    } finally {
      setFetching(false)
    }
  }, [])

  // 2. Gunakan useEffect tanpa memicu cascading render (dengan deferring)
  useEffect(() => {
    let isMounted = true
    
    const deferFetch = () => {
      if (isMounted) {
        fetchNotifications()
      }
    }

    const timer = setTimeout(deferFetch, 0)
    return () => { 
      isMounted = false 
      clearTimeout(timer)
    }
  }, [fetchNotifications])

  // 3. Fungsi Tandai Sudah Baca
  const markAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch('/api/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markNotificationsAsRead' })
      })
      
      if (res.ok) {
        setHasUnread(false)
        fetchNotifications()
      }
    } catch (err) {
      console.error("Gagal update status baca:", err)
    }
  }

  return (
    <>
      <header className="md:hidden flex items-center justify-between p-6 bg-[#0a0a0a] sticky top-0 z-40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
          <span className="font-black text-lg tracking-tighter text-white uppercase italic">IMPERIUM</span>
        </div>
        
        <button 
          onClick={() => { setShowNotif(true); markAsRead(); }}
          className="relative p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400 active:scale-95 transition-all"
        >
          <Bell size={20} />
          {hasUnread && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-yellow-500 rounded-full border-2 border-neutral-950 animate-pulse"></span>
          )}
        </button>
      </header>

      {showNotif && (
        <div className="fixed inset-0 z-50"> 
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowNotif(false)} />
          
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-neutral-950 border-l border-neutral-800 p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-widest">NOTIFIKASI</h2>
                {fetching && <RefreshCw size={14} className="animate-spin text-yellow-500" />}
              </div>
              <button onClick={() => setShowNotif(false)} className="p-2 text-neutral-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.is_read ? 'bg-neutral-900/30 border-neutral-800/50' : 'bg-neutral-900 border-neutral-700 shadow-lg shadow-black/20'}`}>
                    <div className="flex gap-4">
                      <div className={`p-2 rounded-lg h-fit ${n.type === 'signal' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {n.type === 'signal' ? <TrendingUp size={18} /> : <CheckCircle size={18} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white">{n.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-neutral-600 mt-3 block font-bold uppercase tracking-widest">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                  <BellOff size={64} />
                  <p className="mt-4 font-bold text-sm text-white">Sunyi Sekali...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}