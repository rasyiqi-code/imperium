'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Send, Mail, RefreshCw, Headphones, Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface SupportConfig {
  whatsapp_number: string
  telegram_link: string
  support_email: string
  operational_hours: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  sort_order: number
}

export default function SupportPage() {
  const [config, setConfig] = useState<SupportConfig | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  // State untuk FAQ accordion — menyimpan id FAQ yang sedang terbuka
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  useEffect(() => {
    async function loadSupport() {
      try {
        const res = await fetch('/api/user/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getSupportPageData' })
        })
        const data = await res.json()
        
        if (res.ok) {
          if (data.config) setConfig(data.config)
          if (data.faqs) setFaqs(data.faqs)
        }
      } catch (err) {
        console.error("Gagal memuat data support:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSupport()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <RefreshCw className="animate-spin text-yellow-500" size={22} />
      <span className="text-neutral-500 text-xs font-bold tracking-widest uppercase">Memuat data...</span>
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500 text-left">

      {/* ===== Page Header ===== */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full border text-[10px] font-bold tracking-widest uppercase bg-neutral-900 border-neutral-800 text-neutral-500">
          <Headphones size={10} />
          Bantuan &amp; Support
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Support &amp; FAQ</h1>
        <p className="text-neutral-400 text-sm mt-1">Hubungi tim kami atau temukan jawaban dari pertanyaan umum.</p>
      </div>

      {/* ===== Grid Kontak ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ContactCard 
          icon={<MessageSquare size={18} className="text-green-400" />}
          iconBg="bg-green-500/10 border-green-500/20"
          title="WhatsApp"
          desc="Chat admin langsung"
          link={`https://wa.me/${
            config?.whatsapp_number
              ? (config.whatsapp_number.replace(/[^0-9]/g, '').startsWith('0')
                ? '62' + config.whatsapp_number.replace(/[^0-9]/g, '').slice(1)
                : config.whatsapp_number.replace(/[^0-9]/g, ''))
              : ''
          }`}
        />
        <ContactCard 
          icon={<Send size={18} className="text-blue-400" />}
          iconBg="bg-blue-500/10 border-blue-500/20"
          title="Telegram"
          desc="Grup komunitas"
          link={config?.telegram_link}
        />
        <ContactCard 
          icon={<Mail size={18} className="text-yellow-400" />}
          iconBg="bg-yellow-500/10 border-yellow-500/20"
          title="Email"
          desc="Bantuan teknis"
          link={`mailto:${config?.support_email}`}
        />
      </div>

      {/* ===== Jam Operasional ===== */}
      {config?.operational_hours && (
        <div className="flex items-center gap-3 px-5 py-3 bg-neutral-900/50 border border-neutral-800 rounded-xl">
          <Clock size={14} className="text-neutral-500 shrink-0" />
          <p className="text-xs font-bold text-neutral-500">
            Jam Operasional: <span className="text-neutral-300">{config.operational_hours}</span>
          </p>
        </div>
      )}

      {/* ===== FAQ Accordion ===== */}
      {faqs.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Pertanyaan Umum</p>
          <div className="rounded-2xl border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id
              return (
                <button
                  key={faq.id}
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 hover:bg-neutral-900/60 transition-all focus:outline-none group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-bold text-white leading-relaxed">{faq.question}</p>
                    <span className="text-neutral-500 group-hover:text-neutral-300 transition-colors shrink-0 mt-0.5">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                  {isOpen && (
                    <p className="text-[11px] font-medium text-neutral-400 leading-relaxed mt-3 pr-6">
                      {faq.answer}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}

// ===== Komponen ContactCard =====
interface ContactCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  link?: string
  desc: string
}

function ContactCard({ icon, iconBg, title, link, desc }: ContactCardProps) {
  return (
    <a
      href={link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 transition-all active:scale-[0.98]"
    >
      <div className={`p-2.5 rounded-xl border w-fit ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-extrabold text-white">{title}</p>
        <p className="text-[11px] font-bold text-neutral-500 mt-0.5">{desc}</p>
      </div>
    </a>
  )
}