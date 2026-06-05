'use client'

import React from 'react'
import { Save, RefreshCw } from 'lucide-react'

interface PageEditorProps {
  title: string
  value: string
  onChange: (val: string) => void
  isSaving: boolean
  onSave: () => void
}

export default function PageEditor({ title, value, onChange, isSaving, onSave }: PageEditorProps) {
  return (
    <div className="lg:col-span-7 bg-neutral-950/30 backdrop-blur-md border border-neutral-800/80 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between shadow-xl text-left">
      <div className="space-y-3 md:space-y-4">
        <div className="flex justify-between items-start gap-2 border-b border-neutral-900 pb-2 md:pb-3">
          <div className="min-w-0">
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 leading-tight">
              Edit Konten: {title}
            </h3>
            <p className="text-[8px] md:text-[9px] text-neutral-500 font-bold mt-0.5 md:mt-1 tracking-wider uppercase leading-tight">
              Gunakan paragraf baru (Enter) untuk spasi pemisah konten yang indah
            </p>
          </div>
          <span className="text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 uppercase tracking-widest leading-none shrink-0">
            {value.length} Karakter
          </span>
        </div>

        <textarea 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full bg-neutral-900/10 border border-neutral-850 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl md:rounded-2xl p-3 md:p-4 text-xs font-medium outline-none text-white placeholder-neutral-600 min-h-[200px] md:min-h-[350px] leading-relaxed font-mono" 
          placeholder={`Tulis konten halaman ${title.toLowerCase()} di sini...`}
        />
      </div>

      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-neutral-900 flex justify-between items-center gap-3">
        <span className="text-[8px] md:text-[9px] font-bold text-neutral-500 tracking-wider hidden sm:block">
          Perubahan langsung ter-render di Live Preview
        </span>
        <button 
          onClick={onSave} 
          disabled={isSaving} 
          className="w-full sm:w-auto px-5 py-2.5 md:py-3 bg-neutral-900 hover:bg-neutral-850 text-yellow-500 hover:text-yellow-400 border border-neutral-800 hover:border-neutral-700 font-black rounded-xl text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={12} /> : <Save size={12} />} Simpan Halaman Ini
        </button>
      </div>
    </div>
  )
}
