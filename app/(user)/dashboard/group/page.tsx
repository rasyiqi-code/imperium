'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageSquare, ExternalLink, Lock, RefreshCw } from 'lucide-react'

export default function GroupPage() {
  const [isVip, setIsVip] = useState(false)
  const [freeLink, setFreeLink] = useState('#')
  const [vipLink, setVipLink] = useState('#')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const authRes = await supabase.auth.getUser()
        const supportRes = await (supabase.from('support_config') as any).select('*').eq('id', 1).maybeSingle()

        if (authRes.data?.user) {
          const { data: profile } = await (supabase.from('profiles') as any)
            .select('plan')
            .eq('id', authRes.data.user.id)
            .maybeSingle()
          
          if (profile?.plan === 'vip' || profile?.plan === 'admin') {
            setIsVip(true)
          }

          // Fetch VIP member invite link if they are VIP
          if (profile?.plan === 'vip') {
            const { data: vipData } = await (supabase.from('data_member_vip') as any)
              .select('kode_invite_unik')
              .eq('id_user_auth', authRes.data.user.id)
              .maybeSingle()
            if (vipData?.kode_invite_unik) {
              setVipLink(`https://discord.gg/${vipData.kode_invite_unik}`)
            }
          }
        }

        if (supportRes.data?.telegram_link) {
          setFreeLink(supportRes.data.telegram_link)
        }
      } catch (err) {
        console.error("Error loading group page data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-yellow-500" size={32} />
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-20 h-20 bg-[#5865F2]/10 rounded-3xl flex items-center justify-center text-[#5865F2] mb-6 border border-[#5865F2]/20">
        <MessageSquare size={40} />
      </div>
      <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Komunitas Imperium</h1>
      <p className="text-neutral-500 text-sm mt-2 max-w-xs">Pilih grup diskusi sesuai tingkat membership kamu.</p>

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
          <a 
            href={vipLink} 
            target="_blank" 
            className="p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex justify-between items-center group hover:border-yellow-500/50 transition-all text-left"
          >
            <div>
              <div className="text-yellow-500 font-bold">VIP Inner Circle</div>
              <div className="text-[10px] uppercase font-black tracking-widest text-neutral-600">Sinyal & Edukasi</div>
            </div>
            <ExternalLink size={18} className="text-yellow-500 group-hover:scale-110 transition-all" />
          </a>
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