'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'
import FloatingWhatsApp from './FloatingWhatsApp'
import { supabase } from '@/lib/supabase'

interface ModalOptions {
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'danger'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

interface ModalContextType {
  showAlert: (options: Omit<ModalOptions, 'onCancel' | 'cancelText'>) => void
  showConfirm: (options: ModalOptions) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export default function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirm, setIsConfirm] = useState(false)
  const [options, setOptions] = useState<ModalOptions>({
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Batal'
  })

  const pathname = usePathname()
  const router = useRouter()
  const isAdminPath = pathname?.startsWith('/admin-panel')

  // Mendengar event auth secara global. Jika terdeteksi alur PASSWORD_RECOVERY dari link email,
  // secara otomatis arahkan user ke halaman reset password.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const showAlert = (alertOptions: Omit<ModalOptions, 'onCancel' | 'cancelText'>) => {
    setOptions({
      ...alertOptions,
      confirmText: alertOptions.confirmText || 'OK',
      type: alertOptions.type || 'info'
    })
    setIsConfirm(false)
    setIsOpen(true)
  }

  const showConfirm = (confirmOptions: ModalOptions) => {
    setOptions({
      ...confirmOptions,
      confirmText: confirmOptions.confirmText || 'Ya',
      cancelText: confirmOptions.cancelText || 'Batal',
      type: confirmOptions.type || 'warning'
    })
    setIsConfirm(true)
    setIsOpen(true)
  }

  const handleConfirm = () => {
    setIsOpen(false)
    if (options.onConfirm) options.onConfirm()
  }

  const handleCancel = () => {
    setIsOpen(false)
    if (options.onCancel) options.onCancel()
  }

  const getIcon = () => {
    switch (options.type) {
      case 'success':
        return <CheckCircle className="text-green-500 shrink-0" size={24} />
      case 'danger':
        return <XCircle className="text-red-500 shrink-0" size={24} />
      case 'warning':
        return <AlertCircle className="text-yellow-500 shrink-0" size={24} />
      default:
        return <Info className="text-yellow-500 shrink-0" size={24} />
    }
  }

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {/* Jangan tampilkan tombol melayang WhatsApp di area admin-panel */}
      {!isAdminPath && <FloatingWhatsApp />}
      
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200" 
            onClick={isConfirm ? undefined : handleCancel}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-sm bg-neutral-950 border border-neutral-900 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-4 text-left animate-in zoom-in-95 duration-200">
            <div className="flex gap-4">
              <div className="mt-0.5 shrink-0">
                {getIcon()}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">
                  {options.title}
                </h3>
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                  {options.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 w-full">
              {isConfirm ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer text-center"
                  >
                    {options.cancelText}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className={`flex-1 py-3 text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer text-center ${
                      options.type === 'danger'
                        ? 'bg-red-500 hover:bg-red-400 shadow-md shadow-red-500/10'
                        : options.type === 'success'
                          ? 'bg-green-500 hover:bg-green-400 shadow-md shadow-green-500/10'
                          : 'bg-yellow-500 hover:bg-yellow-400 shadow-md shadow-yellow-500/10'
                    }`}
                  >
                    {options.confirmText}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`w-full py-3 text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer text-center ${
                    options.type === 'danger'
                      ? 'bg-red-500 hover:bg-red-400 shadow-md shadow-red-500/10'
                      : options.type === 'success'
                        ? 'bg-green-500 hover:bg-green-400 shadow-md shadow-green-500/10'
                        : 'bg-yellow-500 hover:bg-yellow-400 shadow-md shadow-yellow-500/10'
                  }`}
                >
                  {options.confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}
