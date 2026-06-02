'use client'

import { useState, useEffect, ReactNode } from 'react'
import { supabase, Database } from '@/lib/supabase'
import { useModal } from '@/components/ModalProvider'
import { 
  Bell, Lock, Globe, LogOut, Smartphone, Mail, RefreshCw, CreditCard, Zap 
} from 'lucide-react'

export default function AdminSettings() {
  const { showAlert, showConfirm } = useModal()
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')
  const [resendApiKey, setResendApiKey] = useState('')
  const [resendSenderEmail, setResendSenderEmail] = useState('')
  const [savingResend, setSavingResend] = useState(false)

  const [midtransClientKey, setMidtransClientKey] = useState('')
  const [midtransServerKey, setMidtransServerKey] = useState('')
  const [midtransPublicKey, setMidtransPublicKey] = useState('')
  const [midtransIsProduction, setMidtransIsProduction] = useState(false)
  const [midtransUpgradeMode, setMidtransUpgradeMode] = useState('stacking')
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
        setMidtransUpgradeMode(settings.midtrans_upgrade_mode || 'stacking')
        setEnabledPayments(Array.isArray(settings.midtrans_enabled_payments) ? settings.midtrans_enabled_payments : [])
      }
      setLoading(false)
    }
    initSettings()
  }, [])

  const handleLogout = () => {
    showConfirm({
      title: 'Keluar Admin Panel',
      message: 'Apakah Anda yakin ingin keluar dari Admin Panel?',
      type: 'warning',
      confirmText: 'Keluar',
      cancelText: 'Batal',
      onConfirm: async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
      }
    })
  }

  const handleResetPassword = () => {
    if (!adminEmail) return
    showConfirm({
      title: 'Reset Password',
      message: `Kirim link ganti password ke ${adminEmail}?`,
      type: 'info',
      confirmText: 'Kirim',
      cancelText: 'Batal',
      onConfirm: async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(adminEmail, {
          redirectTo: `${window.location.origin}/admin-panel/settings`,
        })
        if (error) {
          showAlert({
            title: 'Gagal Reset Password',
            message: error.message,
            type: 'danger'
          })
        } else {
          showAlert({
            title: 'Berhasil',
            message: 'Link reset password sudah dikirim ke email!',
            type: 'success'
          })
        }
      }
    })
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
      showAlert({
        title: 'Berhasil',
        message: 'Pengaturan Resend berhasil disimpan!',
        type: 'success'
      })
    } catch (err: any) {
      showAlert({
        title: 'Simpan Gagal',
        message: err.message || 'Gagal menyimpan pengaturan Resend!',
        type: 'danger'
      })
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
          isProduction: midtransIsProduction,
          upgradeMode: midtransUpgradeMode
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengaturan Midtrans')
      showAlert({
        title: 'Berhasil',
        message: 'Pengaturan Midtrans berhasil disimpan!',
        type: 'success'
      })
    } catch (err: any) {
      showAlert({
        title: 'Simpan Gagal',
        message: err.message || 'Gagal menyimpan pengaturan Midtrans!',
        type: 'danger'
      })
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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white font-sans text-left text-xs md:text-sm animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">System <span className="text-yellow-500">Settings</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold uppercase mt-1.5 tracking-wider">Kelola keamanan admin, konfigurasi notifikasi, dan integrasi pihak ketiga</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Profil, Keamanan, Sistem & Metode Pembayaran (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Profile Header */}
          <div className="p-6 rounded-2xl bg-neutral-950/30 backdrop-blur-md border border-neutral-800 flex items-center gap-4 shadow-lg">
            <div className="h-14 w-14 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black text-xl uppercase leading-none shrink-0">
              {adminEmail ? adminEmail.substring(0, 2) : 'AD'}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-black uppercase tracking-wider text-white leading-none">Super Admin</h2>
              <p className="text-[10px] text-neutral-500 font-bold uppercase mt-2 tracking-tight truncate">{adminEmail || 'admin@imperium.com'}</p>
            </div>
          </div>

          {/* Keamanan Admin */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Keamanan Admin</h3>
            <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-900/60 shadow-lg">
              <SettingItem icon={<Mail size={14}/>} title="Email Utama" value={adminEmail} />
              <div onClick={handleResetPassword} className="cursor-pointer">
                <SettingItem icon={<Lock size={14}/>} title="Update Password" value="Amankan akun secara berkala" isLink />
              </div>
              <SettingItem icon={<Smartphone size={14}/>} title="Device Terdaftar" value="1 Perangkat Aktif" />
            </div>
          </div>

          {/* Konfigurasi Sistem */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Konfigurasi Sistem</h3>
            <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-5 shadow-lg">
              <ToggleItem 
                icon={<Bell size={14}/>} 
                title="Notifikasi Email" 
                desc="Kirim notif ke email setiap ada transfer" 
                dbField="email_notif_active" 
              />
              <ToggleItem 
                icon={<Globe size={14}/>} 
                title="Maintenance Mode" 
                desc="Tutup akses website sementara" 
                dbField="maintenance_mode" 
              />
            </div>
          </div>

          {/* Metode Pembayaran Aktif */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Metode Pembayaran Aktif</h3>
            <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <CreditCard size={14} className="text-yellow-500" />
                  <div>
                    <p className="text-xs font-black uppercase text-white">Payment Channels</p>
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
                      showAlert({
                        title: 'Sync Berhasil',
                        message: `Berhasil sync! ${data.enabled?.length || 0} metode pembayaran aktif.`,
                        type: 'success'
                      })
                    } catch (err: any) {
                      showAlert({
                        title: 'Sync Gagal',
                        message: err.message || 'Gagal sync payment methods',
                        type: 'danger'
                      })
                    } finally {
                      setSyncing(false)
                    }
                  }}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-yellow-500/20 disabled:opacity-50 transition-all duration-300 cursor-pointer"
                >
                  {syncing ? (
                    <><RefreshCw size={12} className="animate-spin" /> Syncing...</>
                  ) : (
                    <><Zap size={12} /> Sync dari Midtrans</>
                  )}
                </button>
              </div>

              {enabledPayments.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-neutral-900/60 max-h-[250px] overflow-y-auto scrollbar-thin pr-1">
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
                        <span className={`text-[11px] font-bold uppercase ${isActive ? 'text-white' : 'text-neutral-600'}`}>
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
        </div>

        {/* Kolom Kanan: Integrasi Pihak Ketiga (Resend & Midtrans) (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Integrasi Resend Email */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Integrasi Resend Email</h3>
            <form onSubmit={handleSaveResendSettings} className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Resend API Key</label>
                <input 
                  type="password"
                  placeholder="re_..."
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
                />
                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-wider mt-1">Masukkan API key dari akun Resend Anda</p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Sender Email</label>
                <input 
                  type="text"
                  placeholder="onboarding@resend.dev"
                  value={resendSenderEmail}
                  onChange={(e) => setResendSenderEmail(e.target.value)}
                  className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
                />
                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-wider mt-1">Email pengirim terverifikasi (default: onboarding@resend.dev)</p>
              </div>

              <button 
                type="submit"
                disabled={savingResend}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-[10px] tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 active:scale-[0.98] pt-1"
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
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Integrasi Kredensial Midtrans</h3>
            <form onSubmit={handleSaveMidtransSettings} className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Midtrans Client Key</label>
                <input 
                  type="text"
                  placeholder="Mid-client-..."
                  value={midtransClientKey}
                  onChange={(e) => setMidtransClientKey(e.target.value)}
                  className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Midtrans Server Key</label>
                <input 
                  type="password"
                  placeholder="Mid-server-..."
                  value={midtransServerKey}
                  onChange={(e) => setMidtransServerKey(e.target.value)}
                  className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Midtrans Public Key (BI SNAP)</label>
                <textarea 
                  rows={4}
                  placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                  value={midtransPublicKey}
                  onChange={(e) => setMidtransPublicKey(e.target.value)}
                  className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-900/60">
                <div className="text-left">
                  <p className="text-xs font-black uppercase text-white">Mode Produksi (Production Mode)</p>
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

              <div className="space-y-2 text-left pt-3 border-t border-neutral-900/60">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Sistem Upgrade Member</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setMidtransUpgradeMode('stacking')}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                      midtransUpgradeMode === 'stacking'
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-lg shadow-yellow-500/5'
                        : 'border-neutral-800 bg-neutral-900/20 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase">Akumulasi Durasi (Stacking)</p>
                    <p className="text-[9px] text-neutral-500 mt-1.5 leading-relaxed font-medium">Masa aktif paket baru ditambahkan ke akhir masa aktif lama.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMidtransUpgradeMode('proration')}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                      midtransUpgradeMode === 'proration'
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-lg shadow-yellow-500/5'
                        : 'border-neutral-800 bg-neutral-900/20 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase">Potong Harga / Prorasi (Proration)</p>
                    <p className="text-[9px] text-neutral-500 mt-1.5 leading-relaxed font-medium">Harga paket baru dikurangi sisa hari aktif lama. Masa aktif baru di-reset mulai hari ini.</p>
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={savingMidtrans}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-[10px] tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 active:scale-[0.98] pt-1"
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
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-4">
        <button 
          onClick={handleLogout} 
          className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all active:scale-95 duration-300 cursor-pointer"
        >
          <LogOut size={16} /> Keluar Aplikasi
        </button>
      </div>
    </div>
  )
}

function SettingItem({ icon, title, value, isLink }: { icon: ReactNode, title: string, value: string, isLink?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-neutral-900/40 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="text-yellow-500">{icon}</div>
        <div>
          <p className="text-xs font-black uppercase text-white">{title}</p>
          <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5 tracking-tight">{value}</p>
        </div>
      </div>
      {isLink && <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest hover:text-yellow-400 transition-colors duration-300">Edit</span>}
    </div>
  )
}

function ToggleItem({ icon, title, desc, dbField }: { icon: ReactNode, title: string, desc: string, dbField: 'email_notif_active' | 'maintenance_mode' }) {
  const { showAlert } = useModal()
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
      showAlert({
        title: 'Error Update',
        message: err.message || "Gagal update setting di database!",
        type: 'danger'
      })
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
          <p className="text-xs font-black uppercase text-white leading-none">{title}</p>
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