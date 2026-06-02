'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageSquare, Send, Mail, ChevronRight, ExternalLink, LifeBuoy, RefreshCw } from 'lucide-react'

export default function SupportPage() {
  const [config, setConfig] = useState<any>(null)
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSupport() {
      // Ambil Kontak & FAQ sekaligus
      const [resConfig, resFaqs] = await Promise.all([
        supabase.from('support_config').select('*').eq('id', 1).maybeSingle(),
        supabase.from('support_faqs').select('*').order('sort_order', { ascending: true })
      ])
      
      if (resConfig.data) setConfig(resConfig.data)
      if (resFaqs.data) setFaqs(resFaqs.data)
      setLoading(false)
    }
    loadSupport()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><RefreshCw className="animate-spin text-yellow-500" /></div>

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto pb-32 bg-black min-h-screen text-white font-sans text-left">
      <h1 className="text-xl font-bold uppercase tracking-tight">Support & FAQ</h1>

      {/* Grid Kontak dari Database */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ContactCard 
          icon={<MessageSquare className="text-green-500" />} 
          title="WhatsApp" 
          link={`https://wa.me/${config?.whatsapp_number}`} 
          desc="Chat Admin Langsung"
        />
        <ContactCard 
          icon={<Send className="text-blue-500" />} 
          title="Telegram" 
          link={config?.telegram_link} 
          desc="Grup Komunitas"
        />
        <ContactCard 
          icon={<Mail className="text-yellow-500" />} 
          title="Email" 
          link={`mailto:${config?.support_email}`} 
          desc="Bantuan Teknis"
        />
      </div>

      {/* List FAQ dari Database */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">Pertanyaan Umum</h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-5 hover:bg-neutral-800/30 transition-all">
              <p className="text-xs font-bold uppercase text-white mb-2">{faq.question}</p>
              <p className="text-[10px] font-bold text-neutral-500 uppercase leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-center text-[10px] font-bold text-neutral-600 uppercase italic">
        Operasional: {config?.operational_hours}
      </p>
    </div>
  )
}

function ContactCard({ icon, title, link, desc }: any) {
  return (
    <a href={link} target="_blank" className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-yellow-500/50 transition-all group text-left">
      <div className="mb-4 p-3 bg-black rounded-xl w-fit border border-neutral-800">{icon}</div>
      <p className="text-xs font-bold uppercase text-white">{title}</p>
      <p className="text-[10px] font-bold text-neutral-500 uppercase">{desc}</p>
    </a>
  )
}