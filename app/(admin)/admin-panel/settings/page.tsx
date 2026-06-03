'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/components/ModalProvider'
import { 
  Bell, Lock, Globe, LogOut, Smartphone, Mail
} from 'lucide-react'
import Loader from '@/components/Loader'

import SettingItem from './components/SettingItem'
import SystemConfigToggle from './components/SystemConfigToggle'
import PaymentChannelsList from './components/PaymentChannelsList'
import ResendSettingsForm from './components/ResendSettingsForm'
import MidtransSettingsForm from './components/MidtransSettingsForm'
import DiscordSettingsForm from './components/DiscordSettingsForm'

export default function AdminSettings() {
  const { showAlert, showConfirm } = useModal()
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')

  // Simpan nilai awal settings dari database
  const [resendApiKey, setResendApiKey] = useState('')
  const [resendSenderEmail, setResendSenderEmail] = useState('')

  const [midtransClientKey, setMidtransClientKey] = useState('')
  const [midtransServerKey, setMidtransServerKey] = useState('')
  const [midtransPublicKey, setMidtransPublicKey] = useState('')
  const [midtransIsProduction, setMidtransIsProduction] = useState(false)
  const [midtransUpgradeMode, setMidtransUpgradeMode] = useState('stacking')
  const [enabledPayments, setEnabledPayments] = useState<string[]>([])

  const [discordApplicationId, setDiscordApplicationId] = useState('')
  const [discordClientSecret, setDiscordClientSecret] = useState('')
  const [discordBotToken, setDiscordBotToken] = useState('')
  const [discordVipServerId, setDiscordVipServerId] = useState('')
  const [discordVipRoleId, setDiscordVipRoleId] = useState('')
  const [discordFreeInviteLink, setDiscordFreeInviteLink] = useState('')
  const [discordRedirectUri, setDiscordRedirectUri] = useState('')

  useEffect(() => {
    let active = true
    async function initSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return
      if (user?.email) setAdminEmail(user.email)

      try {
        const res = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getAdminSettings' })
        })
        const data = await res.json()
        if (!active) return
        if (res.ok && data.settings) {
          const settings = data.settings
          setResendApiKey(settings.resend_api_key || '')
          setResendSenderEmail(settings.resend_sender_email || '')
          setMidtransClientKey(settings.midtrans_client_key || '')
          setMidtransServerKey(settings.midtrans_server_key || '')
          setMidtransPublicKey(settings.midtrans_public_key || '')
          setMidtransIsProduction(!!settings.midtrans_is_production)
          setMidtransUpgradeMode(settings.midtrans_upgrade_mode || 'stacking')
          setEnabledPayments(Array.isArray(settings.midtrans_enabled_payments) ? settings.midtrans_enabled_payments : [])

          setDiscordApplicationId(settings.discord_application_id || '')
          setDiscordClientSecret(settings.discord_client_secret || '')
          setDiscordBotToken(settings.discord_bot_token || '')
          setDiscordVipServerId(settings.discord_vip_server_id || '')
          setDiscordVipRoleId(settings.discord_vip_role_id || '')
          setDiscordFreeInviteLink(settings.discord_free_invite_link || '')
          setDiscordRedirectUri(settings.discord_redirect_uri || '')
        }
      } catch (err) {
        console.error('Gagal mengambil settings:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    
    const timer = setTimeout(() => {
      initSettings()
    }, 0)
    return () => {
      active = false
      clearTimeout(timer)
    }
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

  if (loading) return <Loader label="Memuat Kredensial & Pengaturan..." />

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white font-sans text-left text-xs md:text-sm animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="hidden md:block border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">System <span className="text-yellow-500">Settings</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Kelola keamanan admin, konfigurasi notifikasi, dan integrasi pihak ketiga</p>
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
              <h2 className="text-xs font-black text-white leading-none">Super Admin</h2>
              <p className="text-[10px] text-neutral-500 font-bold mt-2 tracking-tight truncate">{adminEmail || 'admin@imperium.com'}</p>
            </div>
          </div>

          {/* Keamanan Admin */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Keamanan Admin</h3>
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
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Konfigurasi Sistem</h3>
            <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-5 shadow-lg">
              <SystemConfigToggle 
                icon={<Bell size={14}/>} 
                title="Notifikasi Email" 
                desc="Kirim notif ke email setiap ada transfer" 
                dbField="email_notif_active" 
              />
              <SystemConfigToggle 
                icon={<Globe size={14}/>} 
                title="Maintenance Mode" 
                desc="Tutup akses website sementara" 
                dbField="maintenance_mode" 
              />
            </div>
          </div>

          {/* Metode Pembayaran Aktif */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Metode Pembayaran Aktif</h3>
            <PaymentChannelsList initialEnabledPayments={enabledPayments} />
          </div>
        </div>

        {/* Kolom Kanan: Integrasi Pihak Ketiga (Resend & Midtrans & Discord) (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Integrasi Resend Email */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Integrasi Resend Email</h3>
            <ResendSettingsForm initialApiKey={resendApiKey} initialSenderEmail={resendSenderEmail} />
          </div>

          {/* Integrasi Kredensial Midtrans */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Integrasi Kredensial Midtrans</h3>
            <MidtransSettingsForm 
              initialClientKey={midtransClientKey}
              initialServerKey={midtransServerKey}
              initialPublicKey={midtransPublicKey}
              initialIsProduction={midtransIsProduction}
              initialUpgradeMode={midtransUpgradeMode}
            />
          </div>

          {/* Integrasi Kredensial Discord */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Integrasi Kredensial Discord</h3>
            <DiscordSettingsForm 
              initialApplicationId={discordApplicationId}
              initialClientSecret={discordClientSecret}
              initialBotToken={discordBotToken}
              initialVipServerId={discordVipServerId}
              initialVipRoleId={discordVipRoleId}
              initialFreeInviteLink={discordFreeInviteLink}
              initialRedirectUri={discordRedirectUri}
            />
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-4">
        <button 
          onClick={handleLogout} 
          className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all active:scale-95 duration-300 cursor-pointer"
        >
          <LogOut size={16} /> Keluar Aplikasi
        </button>
      </div>
    </div>
  )
}