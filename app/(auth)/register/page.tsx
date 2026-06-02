'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nama, setNama] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // 1. SignUp ke Supabase Auth
    // Trigger "on_auth_user_created" di database akan otomatis bikin baris di tabel profiles
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nama,
          whatsapp_number: whatsapp,
          plan_status: 'free' // Metadata untuk membedakan pendaftar baru
        },
      },
    })

    if (authError) {
      setMessage(`Gagal: ${authError.message}`)
      setLoading(false)
      return
    }

    if (authData.user) {
      if (authData.session) {
        setMessage('Sukses! Menyiapkan akses Imperium...')
        
        // Langsung arahkan ke Dashboard jika otomatis login
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setMessage('Registrasi sukses! Silakan periksa kotak masuk email Anda untuk melakukan verifikasi akun sebelum masuk.')
        setLoading(false)
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md rounded-[2.5rem] bg-neutral-900 p-8 shadow-2xl border border-neutral-800">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Gabung <span className="text-yellow-500">Imperium</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3 font-medium">
            Mulai bangun portfolio crypto kamu hari ini.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Input Nama */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
              <input
                type="text"
                className="w-full rounded-2xl bg-black/50 p-4 pl-12 text-white border border-neutral-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all"
                placeholder="Nama atau Username"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Input WhatsApp */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
              <input
                type="tel"
                className="w-full rounded-2xl bg-black/50 p-4 pl-12 text-white border border-neutral-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all"
                placeholder="0812..."
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Email Aktif</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
              <input
                type="email"
                className="w-full rounded-2xl bg-black/50 p-4 pl-12 text-white border border-neutral-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-2xl bg-black/50 p-4 pl-12 pr-12 text-white border border-neutral-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-yellow-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-yellow-500 p-4 font-black text-black hover:bg-yellow-400 disabled:opacity-50 transition-all shadow-[0_10px_30px_rgba(234,179,8,0.2)] mt-8 uppercase tracking-widest text-sm"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Buat Akun Sekarang'}
          </button>
        </form>

        {/* Notifikasi Message */}
        {message && (
          <div className={`mt-6 rounded-2xl p-4 text-center text-xs font-bold border animate-in fade-in zoom-in duration-300 ${
            message.includes('Gagal') 
            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
            : 'bg-green-500/10 text-green-500 border-green-500/20'
          }`}>
            {message}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-neutral-500 font-medium">
          Sudah terdaftar? <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors underline underline-offset-4 ml-1">Masuk ke Imperium</Link>
        </p>
      </div>
    </div>
  )
}