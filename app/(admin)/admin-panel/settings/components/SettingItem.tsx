'use client'

import React, { ReactNode } from 'react'

interface SettingItemProps {
  icon: ReactNode
  title: string
  value: string
  isLink?: boolean
}

export default function SettingItem({ icon, title, value, isLink }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-neutral-900/40 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="text-yellow-500">{icon}</div>
        <div>
          <p className="text-xs font-black text-white">{title}</p>
          <p className="text-[10px] text-neutral-500 font-bold mt-0.5 tracking-tight">{value}</p>
        </div>
      </div>
      {isLink && (
        <span className="text-yellow-500 text-[10px] font-black tracking-widest hover:text-yellow-400 transition-colors duration-300">
          Edit
        </span>
      )}
    </div>
  )
}
