'use client'

import React from 'react'
import { Search, Trash2, RefreshCw, Download } from 'lucide-react'

interface MemberFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  selectedIdsLength: number
  onBulkDelete: () => void
  onRefresh: () => void
  isProcessing: boolean
  selectedPlan: 'all' | 'vip' | 'free'
  onPlanChange: (plan: 'all' | 'vip' | 'free') => void
  onExportCSV: () => void
}

export default function MemberFilterBar({
  search,
  onSearchChange,
  selectedIdsLength,
  onBulkDelete,
  onRefresh,
  isProcessing,
  selectedPlan,
  onPlanChange,
  onExportCSV
}: MemberFilterBarProps) {
  return (
    <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 p-3 md:p-5 rounded-2xl shadow-lg">
      <div className="flex flex-col gap-3">
        {/* Baris Pencarian */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 min-w-0 flex items-center bg-neutral-900/20 border border-neutral-800 focus-within:border-yellow-500/50 focus-within:ring-4 focus-within:ring-yellow-500/5 transition-all duration-300 rounded-xl px-3 md:px-4 py-2.5">
            <Search className="text-neutral-500 mr-2 md:mr-3 shrink-0" size={16} />
            <input 
              type="text" 
              placeholder="Cari member..." 
              className="w-full bg-transparent text-xs font-bold tracking-wider outline-none text-white placeholder-neutral-600"
              value={search} 
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          {selectedIdsLength > 0 && (
            <button 
              onClick={onBulkDelete} 
              className="flex items-center justify-center gap-1.5 shrink-0 px-3 md:px-6 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] md:text-xs font-bold tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300 animate-in fade-in zoom-in-95 cursor-pointer"
            >
              <Trash2 size={14} /> <span className="hidden md:inline">Hapus</span> ({selectedIdsLength})
            </button>
          )}
          <button 
            onClick={onRefresh} 
            disabled={isProcessing}
            className="shrink-0 p-2.5 bg-neutral-900/80 border border-neutral-800 text-yellow-500 rounded-xl active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={isProcessing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Filter Plan & CSV Export */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-neutral-900/80">
          <div className="flex gap-1.5">
            {(['all', 'vip', 'free'] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => onPlanChange(plan)}
                className={`px-3 md:px-3.5 py-1.5 rounded-lg text-[10px] font-black capitalize tracking-wider border cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan
                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-md shadow-yellow-500/5'
                    : 'bg-neutral-900/50 text-neutral-500 border-neutral-800 hover:text-neutral-400'
                }`}
              >
                {plan}
              </button>
            ))}
          </div>
          
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 shrink-0 px-3 md:px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 rounded-lg text-[10px] font-black tracking-wider transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}
