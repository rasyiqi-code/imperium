'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react'
import AuthPromoPanel from '@/components/AuthPromoPanel'

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
        // Arahkan ke endpoint PKCE callback setelah link konfirmasi diklik
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: nama,
          whatsapp_number: whatsapp,
          plan_status: 'free' // Metadata untuk membedakan pendaftar baru
        },
      },
    })

    if (authError) {
      let friendlyMessage = authError.message
      const rawMessage = authError.message.toLowerCase()

      if (rawMessage.includes('user already registered')) {
        friendlyMessage = 'Email tersebut sudah terdaftar. Silakan masuk menggunakan akun Anda.'
      } else if (rawMessage.includes('password should be at least')) {
        friendlyMessage = 'Password harus memiliki panjang minimal 6 karakter.'
      } else if (rawMessage.includes('invalid email address')) {
        friendlyMessage = 'Format alamat email tidak valid.'
      }

      setMessage(`Gagal: ${friendlyMessage}`)
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-neutral-950 text-white font-sans">
      {/* Kolom Kiri: Formulir Register */}
      <div className="flex flex-col justify-center items-center px-6 md:px-12 py-12 relative overflow-hidden">
        {/* Dekorasi latar belakang bercahaya */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              <Image 
                src="/logo.webp" 
                alt="Imperium Crypto Logo" 
                width={180}
                height={48}
                className="object-contain"
                style={{ height: '3rem', width: 'auto' }}
              />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase">
              GABUNG <span className="bg-linear-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">IMPERIUM</span>
            </h1>
            <p className="text-neutral-500 text-xs mt-2">Mulai bangun portofolio crypto Anda hari ini.</p>
          </div>

          <div className="rounded-3xl bg-neutral-900/50 p-6 md:p-7 shadow-2xl border border-neutral-800 backdrop-blur-xl">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Input Nama */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 tracking-widest ml-1 uppercase">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    type="text"
                    className="w-full rounded-2xl bg-neutral-950 p-3 pl-11 text-sm text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="Nama atau Username"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Input WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 tracking-widest ml-1 uppercase">
                  WhatsApp
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    type="tel"
                    className="w-full rounded-2xl bg-neutral-950 p-3 pl-11 text-sm text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="0812..."
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Input Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 tracking-widest ml-1 uppercase">
                  Email Aktif
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    type="email"
                    className="w-full rounded-2xl bg-neutral-950 p-3 pl-11 text-sm text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 tracking-widest ml-1 uppercase">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-2xl bg-neutral-950 p-3 pl-11 pr-11 text-sm text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-yellow-400 to-amber-500 p-3 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {loading ? <RefreshCw className="animate-spin" size={18} /> : (
                  <>
                    <span>Buat Akun Sekarang</span>
                  </>
                )}
              </button>
            </form>

            {/* Notifikasi Message */}
            {message && (
              <div className={`mt-4 rounded-xl p-2.5 text-center text-xs font-bold border animate-in fade-in zoom-in duration-300 ${
                message.includes('Gagal') 
                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                : 'bg-green-500/10 text-green-500 border-green-500/20'
              }`}>
                {message}
              </div>
            )}

            <div className="mt-6 text-center pt-5 border-t border-neutral-800">
              <p className="text-xs text-neutral-500 font-bold uppercase">
                Sudah terdaftar?{' '}
                <Link href="/login" className="text-yellow-500 hover:text-yellow-400 transition normal-case">
                  Masuk ke Imperium
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Panel Promosi VIP Dinamis */}
      <AuthPromoPanel />
    </div>
  )
}