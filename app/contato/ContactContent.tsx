'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import Magnetic from '@/components/Magnetic'

// ── Constants ─────────────────────────────────────────────────────────────────
const WA_URL =
  'https://api.whatsapp.com/send/?phone=5562992589599&text=Ol%C3%A1%2C+vim+pelo+site+e+gostaria+de+fazer+um+or%C3%A7amento!'
const IG_URL = 'https://instagram.com/gamstudio.br'

const SERVICES = [
  'Criação de Sites',
  'Consultoria em SEO',
  'Agentes IA',
  'Google ADS',
  'Landing Pages',
  'Publicidade',
  'Redes Sociais',
  'Produção de Conteúdo',
  'Branding',
  'Mídia',
  'Eventos',
  'Consultoria Completa',
]

const INFO_ITEMS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882a.5.5 0 0 0 .612.612l6.035-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.003-1.369l-.359-.214-3.72.903.919-3.638-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
      </svg>
    ),
    label: 'WhatsApp',
    value: '(62) 99258-9599',
    href: WA_URL,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
    label: 'Instagram',
    value: '@gamstudio.br',
    href: IG_URL,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: 'Localização',
    value: 'Goiânia — GO, Brasil',
    href: null,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: 'Horário',
    value: 'Seg–Sex: 8h às 18h (BRT)',
    href: null,
  },
]

// ── Form field wrapper ─────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#B2B2BC] text-xs font-semibold uppercase tracking-[0.2em]">
        {label}
      </label>
      {children}
      {error && <p className="text-[#E02020] text-xs mt-0.5">{error}</p>}
    </div>
  )
}

// ── Shared input classes ───────────────────────────────────────────────────────
const INPUT_BASE =
  'w-full bg-[#0F0F0F] border border-[#1E1E1E] text-white placeholder-[#333333] rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:border-[#E02020] focus:shadow-[0_0_0_3px_rgba(224,32,32,0.12)] hover:border-[#2A2A2A]'

// ── Main export ───────────────────────────────────────────────────────────────
export default function ContactContent() {
  const rootRef    = useRef<HTMLDivElement>(null)
  const formColRef = useRef<HTMLDivElement>(null)
  const infoColRef = useRef<HTMLDivElement>(null)

  // ── Form state ──────────────────────────────────────────────────────────
  const [fields, setFields] = useState({
    name: '', email: '', phone: '', company: '', service: '', message: '',
  })
  const [errors, setErrors]   = useState<Partial<typeof fields>>({})
  const [status, setStatus]   = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const update = useCallback((k: keyof typeof fields) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFields((prev) => ({ ...prev, [k]: e.target.value }))
      setErrors((prev) => ({ ...prev, [k]: '' }))
    }
  ), [])

  function validate() {
    const e: Partial<typeof fields> = {}
    if (!fields.name.trim())    e.name    = 'Informe seu nome'
    if (!fields.email.trim())   e.email   = 'Informe seu e-mail'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = 'E-mail inválido'
    if (!fields.message.trim()) e.message = 'Escreva sua mensagem'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: 'COLE_SUA_ACCESS_KEY_AQUI',
          subject: `Novo contato: ${fields.name}${fields.service ? ` — ${fields.service}` : ''}`,
          from_name: 'GAM Studio — Site',
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
          company: fields.company,
          service: fields.service || 'Não informado',
          message: fields.message,
        }),
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  // ── Entrance animation ──────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const formEls = formColRef.current?.querySelectorAll('[data-enter]')
        const infoEls = infoColRef.current?.querySelectorAll('[data-enter]')

        if (formEls?.length) {
          gsap.fromTo(
            formEls,
            { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.65, stagger: 0.07, ease: 'power3.out', delay: 0.1 },
          )
        }
        if (infoEls?.length) {
          gsap.fromTo(
            infoEls,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power3.out', delay: 0.35 },
          )
        }
        return () => {}
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <section ref={rootRef} className="bg-[#0A0A0A] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <div className="lg:grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] lg:gap-20 xl:gap-28">

          {/* ── LEFT: Form ── */}
          <div ref={formColRef}>
            <p data-enter className="text-[#E02020] text-xs font-bold uppercase tracking-[0.4em] mb-8">
              Formulário de contato
            </p>

            {status === 'success' ? (
              /* ── Success state ── */
              <div className="flex flex-col items-start gap-6 py-12">
                <div className="w-14 h-14 rounded-full bg-[#E02020]/10 border border-[#E02020]/30 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E02020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">Mensagem enviada!</h3>
                  <p className="text-[#9898A4] text-base leading-relaxed max-w-md">
                    Recebemos seu contato e retornaremos em até 24 horas. Se preferir uma resposta mais rápida, fale direto pelo WhatsApp.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    onClick={() => { setStatus('idle'); setFields({ name: '', email: '', phone: '', company: '', service: '', message: '' }) }}
                    className="px-6 py-3 border border-[#1E1E1E] text-[#B2B2BC] hover:text-white hover:border-[#333333] text-sm font-semibold rounded-xl transition-colors"
                  >
                    Enviar outro
                  </button>
                  <a
                    href={WA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-[#E02020] text-white text-sm font-semibold rounded-xl hover:bg-[#C01010] transition-colors text-center"
                  >
                    Falar no WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Row 1: nome + email */}
                <div data-enter className="grid sm:grid-cols-2 gap-5">
                  <Field label="Nome *" error={errors.name}>
                    <input
                      type="text"
                      value={fields.name}
                      onChange={update('name')}
                      placeholder="Seu nome"
                      autoComplete="name"
                      className={`${INPUT_BASE} ${errors.name ? 'border-[#E02020]/60' : ''}`}
                    />
                  </Field>
                  <Field label="E-mail *" error={errors.email}>
                    <input
                      type="email"
                      value={fields.email}
                      onChange={update('email')}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      className={`${INPUT_BASE} ${errors.email ? 'border-[#E02020]/60' : ''}`}
                    />
                  </Field>
                </div>

                {/* Row 2: whatsapp + empresa */}
                <div data-enter className="grid sm:grid-cols-2 gap-5">
                  <Field label="WhatsApp">
                    <input
                      type="tel"
                      value={fields.phone}
                      onChange={update('phone')}
                      placeholder="(00) 00000-0000"
                      autoComplete="tel"
                      className={INPUT_BASE}
                    />
                  </Field>
                  <Field label="Empresa">
                    <input
                      type="text"
                      value={fields.company}
                      onChange={update('company')}
                      placeholder="Nome da empresa"
                      autoComplete="organization"
                      className={INPUT_BASE}
                    />
                  </Field>
                </div>

                {/* Serviço */}
                <div data-enter>
                  <Field label="Serviço de interesse">
                    <select
                      value={fields.service}
                      onChange={update('service')}
                      className={`${INPUT_BASE} appearance-none cursor-pointer`}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23555555' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                    >
                      <option value="">Selecione um serviço</option>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Mensagem */}
                <div data-enter>
                  <Field label="Mensagem *" error={errors.message}>
                    <textarea
                      rows={5}
                      value={fields.message}
                      onChange={update('message')}
                      placeholder="Conte um pouco sobre o seu projeto, objetivo ou dúvida..."
                      className={`${INPUT_BASE} resize-none ${errors.message ? 'border-[#E02020]/60' : ''}`}
                    />
                  </Field>
                </div>

                {/* Submit */}
                <div data-enter className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-[#E02020] text-white font-black text-sm rounded-xl hover:bg-[#C01010] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                    style={{ boxShadow: '0 0 28px rgba(224,32,32,0.30)' }}
                  >
                    {status === 'sending' ? (
                      <>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                        </svg>
                        Enviando…
                      </>
                    ) : (
                      <>
                        Enviar mensagem
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </>
                    )}
                  </button>

                  {status === 'error' && (
                    <p className="mt-3 text-[#E02020] text-xs">
                      Algo deu errado. Tente novamente ou entre em contato pelo WhatsApp.
                    </p>
                  )}

                  <p className="mt-4 text-[#575760] text-xs">
                    Respondemos em até 24h úteis. Seus dados não são compartilhados.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* ── RIGHT: Info column ── */}
          <div ref={infoColRef} className="mt-16 lg:mt-0 flex flex-col gap-10">

            {/* CTA direct buttons */}
            <div data-enter className="flex flex-col gap-3">
              <p className="text-[#575760] text-xs uppercase tracking-[0.3em] font-bold mb-1">
                Prefere falar agora?
              </p>

              <Magnetic strength={0.2}>
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-5 py-4 bg-[#E02020] text-white font-bold text-sm rounded-xl hover:bg-[#C01010] transition-colors"
                  style={{ boxShadow: '0 4px 24px rgba(224,32,32,0.25)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882a.5.5 0 0 0 .612.612l6.035-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.003-1.369l-.359-.214-3.72.903.919-3.638-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                  </svg>
                  <span>Chamar no WhatsApp</span>
                  <span className="ml-auto text-white/50 text-xs font-normal">(62) 99258-9599</span>
                </a>
              </Magnetic>

              <Magnetic strength={0.2}>
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-5 py-4 border border-[#222222] text-[#C0C0C8] font-bold text-sm rounded-xl hover:border-[#444444] hover:text-white transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                  <span>Seguir no Instagram</span>
                  <span className="ml-auto text-[#888892] text-xs font-normal">@gamstudio.br</span>
                </a>
              </Magnetic>
            </div>

            {/* Divider */}
            <div data-enter className="border-t border-[#161616]" />

            {/* Info list */}
            <div data-enter className="space-y-6">
              <p className="text-[#575760] text-xs uppercase tracking-[0.3em] font-bold">
                Informações
              </p>
              {INFO_ITEMS.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#111111] border border-[#1E1E1E] flex items-center justify-center text-[#E02020] shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[#767680] text-xs uppercase tracking-wider mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-sm font-semibold hover:text-[#E02020] transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white text-sm font-semibold">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div data-enter className="border-t border-[#161616]" />

            {/* Mapa embed */}
            <div data-enter>
              <p className="text-[#575760] text-xs uppercase tracking-[0.3em] font-bold mb-4">
                Onde estamos
              </p>
              <div className="rounded-2xl overflow-hidden border border-[#1E1E1E]" style={{ height: 220 }}>
                <iframe
                  title="GAM Studio — Goiânia, GO"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247.65!2d-49.25309!3d-16.68637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935ef1b8a62ff167%3A0xa2e20b36cbafb5de!2sGoiânia%2C%20GO!5e0!3m2!1spt-BR!2sbr!4v1700000000000"
                  width="100%"
                  height="220"
                  style={{ border: 0, filter: 'grayscale(1) invert(0.92) contrast(0.85)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
