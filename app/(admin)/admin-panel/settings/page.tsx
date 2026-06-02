'use client'

import { useState, useEffect, ReactNode } from 'react'
import { supabase, Database } from '@/lib/supabase'
import { 
  Bell, Lock, Globe, LogOut, Smartphone, Mail, RefreshCw, CreditCard, Zap 
} from 'lucide-react'

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')
  const [resendApiKey, setResendApiKey] = useState('')
  const [resendSenderEmail, setResendSenderEmail] = useState('')
  const [savingResend, setSavingResend] = useState(false)

  const [midtransClientKey, setMidtransClientKey] = useState('')
  const [midtransServerKey, setMidtransServerKey] = useState('')
  const [midtransPublicKey, setMidtransPublicKey] = useState('')
  const [midtransIsProduction, setMidtransIsProduction] = useState(false)
  const [savingMidtrans, setSavingMidtrans] = useState(false)
  const [enabledPayments, setEnabledPayments] = useState<string[]>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    async function initSettings() {
      // Fetch admin user
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setAdminEmail(user.email)

      // Fetch Resend and Midtrans settings
      const { data } = await supabase.from('admin_settings').select('*').eq('id', 1).maybeSingle()
      const settings = data as Database['public']['Tables']['admin_settings']['Row'] | null
      if (settings) {
        setResendApiKey(settings.resend_api_key || '')
        setResendSenderEmail(settings.resend_sender_email || '')
        setMidtransClientKey(settings.midtrans_client_key || '')
        setMidtransServerKey(settings.midtrans_server_key || '')
        setMidtransPublicKey(settings.midtrans_public_key || '')
        setMidtransIsProduction(!!settings.midtrans_is_production)
        setEnabledPayments(Array.isArray(settings.midtrans_enabled_payments) ? settings.midtrans_enabled_payments : [])
      }
      setLoading(false)
    }
    initSettings()
  }, [])

  const handleLogout = async () => {
    if (!confirm('Keluar dari Admin Panel?')) return
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleResetPassword = async () => {
    if (!adminEmail) return
    const confirmReset = confirm(`Kirim link ganti password ke ${adminEmail}?`)
    if (!confirmReset) return
    const { error } = await supabase.auth.resetPasswordForEmail(adminEmail, {
      redirectTo: `${window.location.origin}/admin-panel/settings`,
    })
    if (error) alert(error.message)
    else alert('Link reset password sudah dikirim ke email!')
  }

  const handleSaveResendSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingResend(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateResendSettings',
          apiKey: resendApiKey,
          senderEmail: resendSenderEmail
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengaturan Resend')
      alert('Pengaturan Resend berhasil disimpan!')
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan Resend!')
    } finally {
      setSavingResend(false)
    }
  }

  const handleSaveMidtransSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingMidtrans(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateMidtransSettings',
          clientKey: midtransClientKey,
          serverKey: midtransServerKey,
          publicKey: midtransPublicKey,
          isProduction: midtransIsProduction
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengaturan Midtrans')
      alert('Pengaturan Midtrans berhasil disimpan!')
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan Midtrans!')
    } finally {
      setSavingMidtrans(false)
    }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto pb-32 bg-black min-h-screen text-white font-sans text-left text-xs md:text-sm">
      
      {/* Profile Header */}
      <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-4">
        <div className="h-14 w-14 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-bold text-xl uppercase leading-none">
          {adminEmail ? adminEmail.substring(0, 2) : 'AD'}
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-tight text-white leading-none">Super Admin</h2>
          <p className="text-xs text-neutral-500 font-bold uppercase mt-2 tracking-tight">{adminEmail || 'admin@imperium.com'}</p>
        </div>
      </div>

      {/* Keamanan Admin */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Keamanan Admin</h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
          <SettingItem icon={<Mail size={16}/>} title="Email Utama" value={adminEmail} />
          <div onClick={handleResetPassword} className="cursor-pointer">
            <SettingItem icon={<Lock size={16}/>} title="Update Password" value="Amankan akun secara berkala" isLink />
          </div>
          <SettingItem icon={<Smartphone size={16}/>} title="Device Terdaftar" value="1 Perangkat Aktif" />
        </div>
      </div>

      {/* Konfigurasi Sistem */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Konfigurasi Sistem</h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5">
          <ToggleItem 
            icon={<Bell size={16}/>} 
            title="Notifikasi Email" 
            desc="Kirim notif ke email setiap ada transfer" 
            dbField="email_notif_active" 
          />
          <ToggleItem 
            icon={<Globe size={16}/>} 
            title="Maintenance Mode" 
            desc="Tutup akses website sementara" 
            dbField="maintenance_mode" 
          />
        </div>
      </div>

      {/* Integrasi Resend Email */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Integrasi Resend Email</h3>
        <form onSubmit={handleSaveResendSettings} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Resend API Key</label>
            <input 
              type="password"
              placeholder="re_..."
              value={resendApiKey}
              onChange={(e) => setResendApiKey(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-xs font-mono outline-none focus:border-yellow-500 text-white transition-all"
            />
            <p className="text-[9px] text-neutral-600 font-bold uppercase">Masukkan API key dari akun Resend Anda</p>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Sender Email</label>
            <input 
              type="text"
              placeholder="onboarding@resend.dev"
              value={resendSenderEmail}
              onChange={(e) => setResendSenderEmail(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-xs outline-none focus:border-yellow-500 text-white transition-all"
            />
            <p className="text-[9px] text-neutral-600 font-bold uppercase">Email pengirim terverifikasi (default: onboarding@resend.dev)</p>
          </div>

          <button 
            type="submit"
            disabled={savingResend}
            className="w-full py-3 bg-yellow-500 text-black rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-yellow-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {savingResend ? (
              <>
                <RefreshCw size={12} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              'Simpan Pengaturan Resend'
            )}
          </button>
        </form>
      </div>

      {/* Integrasi Kredensial Midtrans */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Integrasi Kredensial Midtrans</h3>
        <form onSubmit={handleSaveMidtransSettings} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Midtrans Client Key</label>
            <input 
              type="text"
              placeholder="Mid-client-..."
              value={midtransClientKey}
              onChange={(e) => setMidtransClientKey(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-xs font-mono outline-none focus:border-yellow-500 text-white transition-all"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Midtrans Server Key</label>
            <input 
              type="password"
              placeholder="Mid-server-..."
              value={midtransServerKey}
              onChange={(e) => setMidtransServerKey(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-xs font-mono outline-none focus:border-yellow-500 text-white transition-all"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Midtrans Public Key (BI SNAP)</label>
            <textarea 
              rows={3}
              placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
              value={midtransPublicKey}
              onChange={(e) => setMidtransPublicKey(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-xs font-mono outline-none focus:border-yellow-500 text-white transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <div className="text-left">
              <p className="text-xs font-bold uppercase text-white">Mode Produksi (Production Mode)</p>
              <p className="text-[9px] text-neutral-500 font-bold uppercase mt-1">Aktifkan untuk transaksi real, matikan untuk sandbox</p>
            </div>
            <button 
              type="button"
              onClick={() => setMidtransIsProduction(!midtransIsProduction)}
              className={`w-10 h-5 rounded-full relative transition-all duration-300 ${midtransIsProduction ? 'bg-yellow-500' : 'bg-neutral-800 border border-neutral-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${midtransIsProduction ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <button 
            type="submit"
            disabled={savingMidtrans}
            className="w-full py-3 bg-yellow-500 text-black rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-yellow-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            {savingMidtrans ? (
              <>
                <RefreshCw size={12} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              'Simpan Pengaturan Midtrans'
            )}
          </button>
        </form>
      </div>

      {/* Metode Pembayaran Aktif */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Metode Pembayaran Aktif</h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <CreditCard size={16} className="text-yellow-500" />
              <div>
                <p className="text-xs font-bold uppercase text-white">Payment Channels</p>
                <p className="text-[9px] text-neutral-500 font-bold uppercase mt-1">
                  {enabledPayments.length} metode aktif
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                setSyncing(true)
                try {
                  const res = await fetch('/api/admin/actions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'syncMidtransPaymentMethods' }),
                  })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data.error || 'Gagal sync')
                  setEnabledPayments(data.enabled || [])
                  alert(`Berhasil sync! ${data.enabled?.length || 0} metode pembayaran aktif.`)
                } catch (err: any) {
                  alert(err.message || 'Gagal sync payment methods')
                } finally {
                  setSyncing(false)
                }
              }}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-yellow-500/20 disabled:opacity-50 transition-all"
            >
              {syncing ? (
                <><RefreshCw size={12} className="animate-spin" /> Syncing...</>
              ) : (
                <><Zap size={12} /> Sync dari Midtrans</>
              )}
            </button>
          </div>

          {enabledPayments.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-neutral-800">
              {[
                { id: 'qris', label: 'QRIS' },
                { id: 'gopay', label: 'GoPay' },
                { id: 'shopeepay', label: 'ShopeePay' },
                { id: 'bca', label: 'BCA VA' },
                { id: 'bni', label: 'BNI VA' },
                { id: 'bri', label: 'BRI VA' },
                { id: 'mandiri', label: 'Mandiri Bill' },
                { id: 'permata', label: 'Permata VA' },
                { id: 'cimb', label: 'CIMB Niaga VA' },
                { id: 'alfamart', label: 'Alfamart' },
                { id: 'indomaret', label: 'Indomaret' },
                { id: 'akulaku', label: 'Akulaku' },
                { id: 'kredivo', label: 'Kredivo' },
              ].map(method => {
                const isActive = enabledPayments.includes(method.id)
                return (
                  <div key={method.id} className="flex items-center justify-between py-1.5">
                    <span className={`text-xs font-bold uppercase ${isActive ? 'text-white' : 'text-neutral-600'}`}>
                      {method.label}
                    </span>
                    <button
                      onClick={async () => {
                        const updated = isActive
                          ? enabledPayments.filter(id => id !== method.id)
                          : [...enabledPayments, method.id]
                        setEnabledPayments(updated)
                        try {
                          await fetch('/api/admin/actions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'updateEnabledPayments', enabledPayments: updated }),
                          })
                        } catch {
                          setEnabledPayments(enabledPayments) // rollback
                        }
                      }}
                      className={`w-10 h-5 rounded-full relative transition-all duration-300 ${isActive ? 'bg-yellow-500' : 'bg-neutral-800 border border-neutral-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${isActive ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {enabledPayments.length === 0 && (
            <p className="text-[10px] text-neutral-600 font-bold uppercase text-center py-3">
              Tekan &quot;Sync dari Midtrans&quot; untuk mendeteksi metode pembayaran yang aktif
            </p>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-4">
        <button 
          onClick={handleLogout} 
          className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          <LogOut size={18} /> Keluar Aplikasi
        </button>
      </div>
    </div>
  )
}

function SettingItem({ icon, title, value, isLink }: { icon: ReactNode, title: string, value: string, isLink?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-neutral-800/40 transition-all">
      <div className="flex items-center gap-4">
        <div className="text-yellow-500">{icon}</div>
        <div>
          <p className="text-xs font-bold uppercase text-white">{title}</p>
          <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5 tracking-tight">{value}</p>
        </div>
      </div>
      {isLink && <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">Edit</span>}
    </div>
  )
}

function ToggleItem({ icon, title, desc, dbField }: { icon: ReactNode, title: string, desc: string, dbField: 'email_notif_active' | 'maintenance_mode' }) {
  const [active, setActive] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Load status awal
  useEffect(() => {
    const getSetting = async () => {
      const { data } = await supabase.from('admin_settings').select(dbField).eq('id', 1).maybeSingle()
      if (data) setActive(!!data[dbField])
    }
    getSetting()
  }, [dbField])

  const handleToggle = async () => {
    const newState = !active
    setActive(newState) // Optimistic UI
    setSyncing(true)
    
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleSetting',
          dbField,
          value: newState
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal update setting')
    } catch (err: any) {
      alert(err.message || "Gagal update setting di database!")
      setActive(!newState) // Rollback UI kalau error
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 text-left">
        <div className={syncing ? "text-neutral-500 animate-pulse" : "text-yellow-500"}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-white leading-none">{title}</p>
          <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1.5 tracking-tight leading-none">{desc}</p>
        </div>
      </div>
      <button 
        onClick={handleToggle} 
        disabled={syncing}
        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${active ? 'bg-yellow-500' : 'bg-neutral-800 border border-neutral-700'} ${syncing ? 'opacity-50' : ''}`}
      >
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${active ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}