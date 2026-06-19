'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Marquee } from '@/components/Marquee'
import Magnetic from '@/components/Magnetic'

// ─── Web3Forms ────────────────────────────────────────────────────────────────
// Crie sua chave gratuita em https://web3forms.com e cole abaixo
const WEB3FORMS_KEY = 'COLE_SUA_ACCESS_KEY_AQUI'
const WA_URL = 'https://api.whatsapp.com/send/?phone=5562981147673&text=Ol%C3%A1%21+Vim+pelo+site+e+gostaria+de+fazer+um+or%C3%A7amento.'

const SERVICES_TICKER = [
  'Criação de Sites', 'SEO', 'Agentes IA', 'Google ADS',
  'Landing Pages', 'Publicidade', 'Redes Sociais',
  'Produção de Conteúdo', 'Branding', 'Mídia', 'Eventos', 'Consultoria',
]

const SERVICE_OPTIONS = [
  'Criação de Sites',
  'Consultoria em SEO',
  'Agentes IA',
  'Google ADS',
  'Landing Pages',
  'Publicidade / Mídia',
  'Redes Sociais',
  'Produção de Conteúdo',
  'Branding',
  'Eventos',
  'Consultoria Completa',
  'Outro',
]

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = 'idle' | 'sending' | 'success' | 'error'

type Fields = {
  name:     string
  whatsapp: string
  email:    string
  service:  string
  message:  string
}

type Errors = Partial<Record<keyof Fields, string>>

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2)                                  e.name     = 'Informe seu nome completo.'
  if (f.whatsapp.replace(/\D/g, '').length < 8)                  e.whatsapp = 'WhatsApp inválido.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))              e.email    = 'E-mail inválido.'
  if (!f.service)                                                 e.service  = 'Selecione um serviço.'
  if (f.message.trim().length < 10)                              e.message  = 'Mensagem muito curta (mín. 10 caracteres).'
  return e
}

// ─── Input classes ────────────────────────────────────────────────────────────
const inputCls = (err?: string) =>
  `w-full bg-[#111111] border rounded-lg px-4 py-3.5 text-sm text-white placeholder-[#444444]
   focus:outline-none transition-colors
   ${err ? 'border-red-500 focus:border-red-400' : 'border-[#222222] focus:border-[#E02020]'}`

// ─── Component ────────────────────────────────────────────────────────────────
export default function CTASection() {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const [fields, setFields] = useState<Fields>({
    name: '', whatsapp: '', email: '', service: '', message: '',
  })
  const [errors,  setErrors]  = useState<Errors>({})
  const [status,  setStatus]  = useState<Status>('idle')
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const updated = { ...fields, [k]: e.target.value }
    setFields(updated)
    if (touched[k]) setErrors(validate(updated))
  }

  const blur = (k: keyof Fields) => () => {
    setTouched((t) => ({ ...t, [k]: true }))
    setErrors(validate(fields))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allTouched = { name: true, whatsapp: true, email: true, service: true, message: true }
    setTouched(allTouched)
    const errs = validate(fields)
    setErrors(errs)
    if (Object.keys(errs).length) return

    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject:    `Novo contato GAM Studio — ${fields.service}`,
          name:       fields.name,
          email:      fields.email,
          whatsapp:   fields.whatsapp,
          service:    fields.service,
          message:    fields.message,
          from_name:  'Site GAM Studio',
        }),
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const reset = () => {
    setFields({ name: '', whatsapp: '', email: '', service: '', message: '' })
    setErrors({})
    setTouched({})
    setStatus('idle')
  }

  return (
    <section ref={ref} id="contato" className="relative overflow-hidden">

      {/* ── Ticker ── */}
      <div className="border-y border-[#1A1A1A] bg-[#0A0A0A]/80 py-3.5">
        <Marquee className="[--duration:28s] [--gap:0px]" repeat={4}>
          {SERVICES_TICKER.map((s) => (
            <span key={s} className="flex items-center">
              <span className="text-[#666] text-[13px] font-medium px-6 tracking-wide">{s}</span>
              <span className="text-[#E02020] text-[10px]">◆</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* ── Main CTA ── */}
      <div className="relative py-24 px-6">
        {/* Animated gradient bg */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            background: [
              'radial-gradient(ellipse 80% 60% at 20% 50%, #161616 0%, #0A0A0A 65%)',
              'radial-gradient(ellipse 80% 60% at 80% 50%, #161616 0%, #0A0A0A 65%)',
              'radial-gradient(ellipse 80% 60% at 50% 15%, #161616 0%, #0A0A0A 65%)',
              'radial-gradient(ellipse 80% 60% at 20% 50%, #161616 0%, #0A0A0A 65%)',
            ],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        />

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.p
              className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
            >
              Vamos conversar
            </motion.p>
            <motion.h2
              className="text-4xl md:text-6xl font-black text-white mb-4 leading-none"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              Pronto para o{' '}
              <span className="text-[#E02020]">próximo nível</span>?
            </motion.h2>
            <motion.p
              className="text-[#A0A0A0] text-sm"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              Preencha o formulário — respondemos em até 24h.
            </motion.p>
          </div>

          {/* ── Form / Success / Error ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.28 }}
          >
            <AnimatePresence mode="wait">

              {/* ── SUCCESS ── */}
              {status === 'success' && (
                <motion.div
                  key="success"
                  className="flex flex-col items-center gap-5 py-14 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="w-16 h-16 rounded-full bg-[#E02020]/10 border border-[#E02020]/30 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E02020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white mb-1">Mensagem enviada!</p>
                    <p className="text-[#A0A0A0] text-sm">Retornaremos em até 24h. Enquanto isso, fale no WhatsApp.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Magnetic strength={0.22}>
                      <a
                        href={WA_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-[#E02020] text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-[#C01010] transition-colors"
                      >
                        Ir para WhatsApp
                      </a>
                    </Magnetic>
                    <Magnetic strength={0.22}>
                      <button
                        onClick={reset}
                        className="border border-[#333333] text-[#A0A0A0] text-sm font-medium px-6 py-3 rounded-lg hover:border-[#555555] hover:text-white transition-colors"
                      >
                        Nova mensagem
                      </button>
                    </Magnetic>
                  </div>
                </motion.div>
              )}

              {/* ── FORM ── */}
              {status !== 'success' && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-3.5"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Row 1: nome + whatsapp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <input
                        type="text"
                        placeholder="Seu nome *"
                        aria-label="Seu nome"
                        value={fields.name}
                        onChange={set('name')}
                        onBlur={blur('name')}
                        className={inputCls(errors.name)}
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="WhatsApp (DDD + número) *"
                        aria-label="WhatsApp"
                        value={fields.whatsapp}
                        onChange={set('whatsapp')}
                        onBlur={blur('whatsapp')}
                        className={inputCls(errors.whatsapp)}
                      />
                      {errors.whatsapp && <p className="text-red-400 text-xs mt-1 ml-1">{errors.whatsapp}</p>}
                    </div>
                  </div>

                  {/* Row 2: email + serviço */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <input
                        type="email"
                        placeholder="Seu e-mail *"
                        aria-label="E-mail"
                        value={fields.email}
                        onChange={set('email')}
                        onBlur={blur('email')}
                        className={inputCls(errors.email)}
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
                    </div>
                    <div>
                      <select
                        aria-label="Serviço de interesse"
                        value={fields.service}
                        onChange={set('service')}
                        onBlur={blur('service')}
                        className={`${inputCls(errors.service)} ${!fields.service ? 'text-[#444444]' : ''}`}
                      >
                        <option value="" disabled>Serviço de interesse *</option>
                        {SERVICE_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-[#111111] text-white">{s}</option>
                        ))}
                      </select>
                      {errors.service && <p className="text-red-400 text-xs mt-1 ml-1">{errors.service}</p>}
                    </div>
                  </div>

                  {/* Row 3: mensagem */}
                  <div>
                    <textarea
                      placeholder="Conte sobre seu projeto... *"
                      aria-label="Mensagem"
                      rows={4}
                      value={fields.message}
                      onChange={set('message')}
                      onBlur={blur('message')}
                      className={`${inputCls(errors.message)} resize-none`}
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1 ml-1">{errors.message}</p>}
                  </div>

                  {/* Error banner */}
                  {status === 'error' && (
                    <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-3">
                      Erro ao enviar. Tente novamente ou fale direto no WhatsApp.
                    </p>
                  )}

                  {/* Submit */}
                  <Magnetic strength={0.18} className="w-full">
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="relative w-full bg-[#E02020] text-white font-bold py-4 rounded-lg text-sm
                                 hover:bg-[#C01010] active:scale-[0.98] transition-all
                                 disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{ boxShadow: '0 0 32px rgba(224,32,32,0.30)' }}
                    >
                      {status === 'sending' ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
                          </svg>
                          Enviando...
                        </span>
                      ) : 'Enviar mensagem'}
                    </button>
                  </Magnetic>

                  <p className="text-center text-[#444444] text-xs mt-1">
                    Ou fale direto:{' '}
                    <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="text-[#E02020] hover:underline">
                      WhatsApp 62 98114-7673
                    </a>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Direct contacts */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-9 pt-9 border-t border-[#1E1E1E]"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.45 }}
          >
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white transition-colors"
            >
              <span className="text-[#E02020] font-semibold">WhatsApp</span>
              <span>62 98114-7673</span>
            </a>
            <div className="hidden sm:block w-px h-4 bg-[#2A2A2A]" />
            <a
              href="https://instagram.com/gamstudio.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white transition-colors"
            >
              <span className="text-[#E02020] font-semibold">Instagram</span>
              <span>@gamstudio.br</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
