'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, Sparkles, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type UserStatus = 'loading' | 'guest' | 'free' | 'vip'

export default function AuthPromoPanel() {
  const [status, setStatus] = useState<UserStatus>('loading')
  const [name, setName] = useState('')

  useEffect(() => {
    async function checkUserStatus() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session || !session.user) {
          setStatus('guest')
          return
        }

        // Ambil nama user untuk personalisasi sambutan
        const userMeta = session.user.user_metadata
        const displayName = userMeta?.full_name || session.user.email?.split('@')[0] || 'Member'
        setName(displayName)

        // Panggil actions API untuk mendapatkan plan user
        const res = await fetch('/api/user/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getUserPlan' })
        })
        
        if (res.ok) {
          const data = await res.json()
          if (data.plan === 'vip' || data.plan === 'admin') {
            setStatus('vip')
          } else {
            setStatus('free')
          }
        } else {
          setStatus('free') // Fallback jika gagal mengambil plan
        }
      } catch (err) {
        console.error('Gagal memverifikasi status user untuk panel promo:', err)
        setStatus('guest')
      }
    }

    checkUserStatus()
  }, [])

  if (status === 'loading') {
    return (
      <div className="hidden lg:flex sticky top-0 h-screen relative overflow-hidden items-center justify-center bg-neutral-900 border-l border-neutral-800">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 blur-xs"
          style={{ backgroundImage: "url('/crypto_login.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37] animate-spin" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Memuat Panel VIP...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden lg:flex sticky top-0 h-screen relative overflow-hidden items-center justify-center bg-neutral-900 border-l border-neutral-800">
      {/* Background Image Premium dengan transisi halus */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 hover:scale-105"
        style={{ backgroundImage: "url('/crypto_login.webp')" }}
      />
      {/* Overlay gradasi gelap premium untuk menyatukan gambar dengan tema website */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/45" />
      
      {/* Efek pendaran cahaya emas redup di latar belakang */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Konten Card dibungkus Glassmorphism mewah */}
      <div className="relative z-10 w-full max-w-md mx-8 p-8 md:p-10 rounded-3xl bg-neutral-950/75 border border-white/[0.06] backdrop-blur-md shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-t-white/[0.1] flex flex-col gap-6 text-left group">
        
        {/* Render Panel berdasarkan Status User */}
        {status === 'vip' && (
          <>
            {/* Badge Status */}
            <div className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[#d4af37] text-[10px] font-black uppercase tracking-widest">
              <Crown size={12} className="animate-pulse" />
              Imperium VIP Member
            </div>
            
            {/* Judul & Deskripsi */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-light text-white leading-snug uppercase tracking-tight">
                Selamat Datang, <br />
                <span className="font-bold font-serif-editorial italic text-[#d4af37] tracking-normal">{name}</span>
              </h2>
              <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
                Akses VIP Anda telah aktif sepenuhnya. Nikmati keuntungan penuh dari sinyal real-time berakurasi tinggi, panduan harian, dan obrolan privat bersama trader elit di Discord VIP.
              </p>
            </div>

            {/* List Benefit */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-neutral-300">
                <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">Akses Sinyal VIP Aktif & Terverifikasi</span>
              </div>
              <div className="flex items-start gap-3 text-neutral-300">
                <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">Grup Private Discord VIP Terbuka</span>
              </div>
              <div className="flex items-start gap-3 text-neutral-300">
                <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">Dukungan Prioritas Member Utama 24/7</span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <Link 
              href="/dashboard" 
              className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-[0_4px_20px_rgba(212,175,55,0.2)] active:scale-[0.98] cursor-pointer"
            >
              Masuk Dashboard VIP
              <ArrowRight size={14} />
            </Link>
          </>
        )}

        {status === 'free' && (
          <>
            {/* Badge Status */}
            <div className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
              <UserCheck size={12} />
              Member Imperium Gratis
            </div>
            
            {/* Judul & Deskripsi */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-light text-white leading-snug uppercase tracking-tight">
                Tingkatkan Ke <br />
                <span className="font-bold text-[#d4af37] tracking-normal font-serif-editorial italic">VIP Member</span>
              </h2>
              <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
                Halo {name}, Anda saat ini berada di paket gratis. Buka potensi trading maksimal dengan sinyal real-time berakurasi tinggi, panduan riset pasar eksklusif, serta akses grup Discord private sekarang.
              </p>
            </div>

            {/* List Benefit */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-neutral-300">
                <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">Buka Akses Sinyal Premium Instan</span>
              </div>
              <div className="flex items-start gap-3 text-neutral-300">
                <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">Gabung Server Discord VIP Otomatis</span>
              </div>
              <div className="flex items-start gap-3 text-neutral-300">
                <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">Prorasi/Upgrade Fleksibel Kapan Saja</span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <Link 
              href="/dashboard/upgrade" 
              className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-[0_4px_20px_rgba(212,175,55,0.2)] active:scale-[0.98] cursor-pointer"
            >
              Upgrade Ke VIP Sekarang
              <Sparkles size={12} className="animate-pulse" />
            </Link>
          </>
        )}

        {status === 'guest' && (
          <>
            {/* Badge Status */}
            <div className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[#d4af37] text-[10px] font-black uppercase tracking-widest">
              <Crown size={12} />
              Akses Elit Imperium
            </div>
            
            {/* Judul & Deskripsi */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-light text-white leading-snug uppercase tracking-tight">
                Kuasai Pasar <br />
                Dengan <span className="font-bold text-[#d4af37] tracking-normal font-serif-editorial italic">Sinyal Akurat</span>
              </h2>
              <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
                Bergabunglah dengan ribuan trader elit Imperium Crypto. Dapatkan analisis premium, sinyal real-time, strategi profit konsisten, dan akses ke grup privat Discord VIP.
              </p>
            </div>

            {/* List Benefit */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-neutral-300">
                <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">Sinyal & Analisis Terperinci Harian</span>
              </div>
              <div className="flex items-start gap-3 text-neutral-300">
                <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">Grup Private Discord VIP Eksklusif</span>
              </div>
              <div className="flex items-start gap-3 text-neutral-300">
                <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">E-Book & Materi Edukasi Lengkap</span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <Link 
              href="/register" 
              className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-[0_4px_20px_rgba(212,175,55,0.2)] active:scale-[0.98] cursor-pointer"
            >
              Mulai Bergabung VIP
              <ArrowRight size={14} />
            </Link>
          </>
        )}
        
      </div>
    </div>
  )
}
