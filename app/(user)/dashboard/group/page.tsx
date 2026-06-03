'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageSquare, ExternalLink, Lock } from 'lucide-react'
import Loader from '@/components/Loader'

export default function GroupPage() {
  const [isVip, setIsVip] = useState(false)
  const [hasDiscord, setHasDiscord] = useState(false)
  const [freeLink, setFreeLink] = useState('#')
  const [vipLink, setVipLink] = useState('#')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const authRes = await supabase.auth.getUser()

        if (authRes.data?.user) {
          const res = await fetch('/api/user/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getGroupData' })
          })
          const data = await res.json()

          if (res.ok) {
            const profile = data.profile
            const vipData = data.vipData
            
            if (profile?.plan === 'vip' || profile?.plan === 'admin') {
              setIsVip(true)
            }

            if (profile?.plan === 'vip' && vipData) {
              if (vipData.id_discord_user) {
                setVipLink(data.vipInviteLink || '#')
                setHasDiscord(true)
              } else {
                setVipLink('/api/discord/auth')
                setHasDiscord(false)
              }
            }

            if (data.freeInviteLink && data.freeInviteLink !== '#') {
              setFreeLink(data.freeInviteLink)
            } else if (data.telegramLink) {
              setFreeLink(data.telegramLink)
            }
          }
        }
      } catch (err) {
        console.error("Error loading group page data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <Loader label="Memuat Tautan Grup..." />

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="w-16 h-16 bg-[#5865F2]/10 rounded-2xl flex items-center justify-center text-[#5865F2] mb-5 border border-[#5865F2]/20">
        <MessageSquare size={32} />
      </div>
      <h1 className="text-xl font-black text-white uppercase tracking-tight">Komunitas <span className="text-yellow-500">Imperium</span></h1>
      <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider max-w-xs">Pilih grup diskusi sesuai tingkat membership kamu.</p>

      <div className="w-full mt-10 space-y-4 max-w-md">
        {/* Link Free */}
        <a 
          href={freeLink} 
          target="_blank" 
          className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex justify-between items-center group hover:border-neutral-700 transition-all text-left"
        >
          <div>
            <div className="text-white font-bold">Public Group</div>
            <div className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">Akses Gratis</div>
          </div>
          <ExternalLink size={18} className="text-neutral-600 group-hover:text-white transition-all" />
        </a>

        {/* Link VIP */}
        {isVip ? (
          <div className="flex flex-col gap-2 w-full">
            <a 
              href={vipLink} 
              target={hasDiscord ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex justify-between items-center group hover:border-yellow-500/50 transition-all text-left w-full"
            >
              <div>
                <div className="text-yellow-500 font-bold">
                  {hasDiscord ? 'Masuk Server Discord VIP' : 'Hubungkan Discord VIP'}
                </div>
                <div className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
                  {hasDiscord ? 'Sinyal & Edukasi (Terhubung)' : 'Otorisasi Akun Terlebih Dahulu'}
                </div>
              </div>
              <ExternalLink size={18} className="text-yellow-500 group-hover:scale-110 transition-all" />
            </a>
            {/* Opsi otorisasi ulang / gabung server VIP secara aman */}
            {hasDiscord && (
              <a 
                href="/api/discord/auth"
                className="text-[10px] text-yellow-500/70 hover:text-yellow-500 font-bold transition-all text-center hover:underline"
              >
                Belum masuk server? Otorisasi & Gabung VIP
              </a>
            )}
          </div>
        ) : (
          <div className="p-5 bg-black/50 border border-neutral-900 opacity-50 rounded-2xl flex justify-between items-center text-left">
            <div>
              <div className="font-bold text-neutral-500">VIP Inner Circle</div>
              <div className="text-[10px] uppercase font-black tracking-widest text-neutral-600">Sinyal & Edukasi</div>
            </div>
            <Lock size={18} className="text-neutral-600" />
          </div>
        )}
      </div>
    </div>
  )
}