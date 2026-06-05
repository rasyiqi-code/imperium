'use client'

import React from 'react'
import { Eye } from 'lucide-react'

interface PageLivePreviewProps {
  activeTab: 'about' | 'privacy' | 'terms' | 'help'
  title: string
  value: string
}

export default function PageLivePreview({ activeTab, title, value }: PageLivePreviewProps) {
  // Tentukan header kategori tiruan
  const getSubTitle = () => {
    switch (activeTab) {
      case 'about': return 'Company Profile'
      case 'privacy': return 'Security & Privacy'
      case 'terms': return 'Terms & Rules'
      case 'help': return 'Support Center'
    }
  }

  // Tentukan label tombol CTA tiruan
  const getCtaLabel = () => {
    switch (activeTab) {
      case 'about': return 'Gabung VIP Komunitas'
      case 'help': return 'Kirim WhatsApp'
      default: return 'Kembali Ke Beranda'
    }
  }

  return (
    <div className="lg:col-span-5 bg-neutral-950/20 backdrop-blur-md border border-neutral-900 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group text-left">
      {/* Ornamen Pendaran radial redup di pojok preview */}
      <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-yellow-500/[0.02] rounded-full blur-2xl pointer-events-none -z-15" />
      
      <div className="space-y-4 flex-grow flex flex-col">
        <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450 flex items-center gap-2">
            <Eye size={14} className="text-yellow-500" /> Live Preview
          </h3>
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/10 text-yellow-500 uppercase tracking-widest leading-none shrink-0">
            Front-end Tampilan
          </span>
        </div>

        {/* Simulasi Casing Glassmorphism Halaman Depan */}
        <div className="flex-grow bg-black/60 border border-white/[0.04] rounded-2xl p-6 relative min-h-[300px] flex flex-col justify-between">
          {/* Efek Garis Emas Halus di Bagian Atas Card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
          
          <div className="space-y-4">
            {/* Header Judul Halaman Depan */}
            <div className="text-center pb-4 border-b border-white/[0.04]">
              <h4 className="text-[9px] font-black uppercase tracking-wider text-[#d4af37] leading-none mb-1">
                {getSubTitle()}
              </h4>
              <h2 className="text-base font-black uppercase text-white tracking-wide leading-none">
                {title}
              </h2>
            </div>

            {/* Body Content Real-time render */}
            <div className="text-[10px] sm:text-xs text-neutral-400 font-medium leading-relaxed space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {value ? (
                value.split('\n').map((para, idx) => (
                  <p key={idx} className="whitespace-pre-line text-left">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-neutral-600 italic text-center py-10 uppercase tracking-wider font-bold text-[9px]">
                  Belum ada konten yang ditulis...
                </p>
              )}
            </div>
          </div>

          {/* Simulasi CTA Bawah */}
          <div className="border-t border-white/[0.04] pt-4 mt-4 text-center">
            <div className="inline-block bg-[#d4af37] text-black px-4 py-1.5 rounded-full font-bold text-[8px] uppercase tracking-widest scale-95 opacity-70">
              {getCtaLabel()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
