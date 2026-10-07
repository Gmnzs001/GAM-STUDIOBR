'use client'

import { useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check } from 'lucide-react'
import Button from '@/components/system/Button'
import { WA_URL, WHATSAPP_DISPLAY, WEB3FORMS_KEY } from '@/lib/site'
import { cn } from '@/lib/utils'

// ─── Opções de serviço (mesma lista do formulário antigo) ────────────────────
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
] as const

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Status = 'idle' | 'sending' | 'success' | 'error'

type Fields = {
  name: string
  whatsapp: string
  email: string
  service: string
  message: string
}

type Errors = Partial<Record<keyof Fields, string>>

const EMPTY: Fields = { name: '', whatsapp: '', email: '', service: '', message: '' }
const ALL_TOUCHED: Record<keyof Fields, boolean> = { name: true, whatsapp: true, email: true, service: true, message: true }
const EASE = [0.16, 1, 0.3, 1] as const

// ─── Validação (regras e mensagens idênticas às do formulário anterior) ──────
function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Informe seu nome completo.'
  if (f.whatsapp.replace(/\D/g, '').length < 8) e.whatsapp = 'WhatsApp inválido.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'E-mail inválido.'
  if (!f.service) e.service = 'Selecione um serviço.'
  if (f.message.trim().length < 10) e.message = 'Mensagem muito curta (mín. 10 caracteres).'
  return e
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const fieldCls = (invalid: boolean) =>
  cn(
    'w-full rounded-2xl bg-paper/70 px-5 text-[0.975rem] text-ink ring-1 ring-inset ring-line',
    'placeholder:text-ink-3/80 transition-[background-color,box-shadow] duration-300',
    'hover:ring-line-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red focus-visible:outline-none',
    invalid && 'bg-red-50/60 ring-red/50 hover:ring-red/70',
  )

/**
 * Formulário de contato compartilhado (home + /contato), enviado via Web3Forms.
 * Rótulos visíveis, serviço em chips (radio group nativo → setas do teclado
 * funcionam), erros ligados por aria-describedby e estado de sucesso animado.
 */
export default function ContactForm({ compact = false, className }: { compact?: boolean; className?: string }) {
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`
  const successRef = useRef<HTMLHeadingElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  // Altura travada na troca form → sucesso, para a página não "pular"
  const [lockH, setLockH] = useState<number | null>(null)

  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [bot, setBot] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({})

  // Só mostramos o erro de campos que a pessoa já visitou (ou após o envio).
  const err = (k: keyof Fields) => (touched[k] ? errors[k] : undefined)

  const set = (k: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updated = { ...fields, [k]: e.target.value }
    setFields(updated)
    if (touched[k]) setErrors(validate(updated))
  }

  const blur = (k: keyof Fields) => () => {
    setTouched((t) => ({ ...t, [k]: true }))
    setErrors(validate(fields))
  }

  const pickService = (value: string) => {
    const updated = { ...fields, service: value }
    setFields(updated)
    setTouched((t) => ({ ...t, service: true }))
    setErrors(validate(updated))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched(ALL_TOUCHED)
    const errs = validate(fields)
    setErrors(errs)
    if (Object.keys(errs).length) {
      // Leva o foco ao primeiro campo com problema
      const first = (['name', 'whatsapp', 'email', 'service', 'message'] as const).find((k) => errs[k])
      if (first) {
        const target =
          first === 'service'
            ? e.currentTarget.querySelector<HTMLInputElement>(`input[name="${id('service')}"]`)
            : e.currentTarget.querySelector<HTMLElement>(`#${CSS.escape(id(first))}`)
        target?.focus()
      }
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Novo contato GAM Studio — ${fields.service}`,
          name: fields.name,
          email: fields.email,
          whatsapp: fields.whatsapp,
          service: fields.service,
          message: fields.message,
          from_name: 'Site GAM Studio',
          botcheck: bot,
        }),
      })
      const data = await res.json()
      if (data.success) setLockH(Math.min(wrapRef.current?.offsetHeight ?? 0, 640) || null)
      setStatus(data.success ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const reset = () => {
    setFields(EMPTY)
    setErrors({})
    setTouched({})
    setLockH(null)
    setStatus('idle')
  }

  const sending = status === 'sending'
  const gap = compact ? 'gap-4' : 'gap-5'
  const msgCount = fields.message.trim().length

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <motion.div
            key="success"
            role="status"
            aria-live="polite"
            style={lockH ? { minHeight: lockH } : undefined}
            className={cn('flex flex-col items-start justify-center', compact ? 'py-6' : 'py-10')}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: EASE }}
            onAnimationComplete={() => successRef.current?.focus()}
          >
            <DrawnCheck />
            <h3
              ref={successRef}
              tabIndex={-1}
              className="type-title mt-7 text-ink focus:outline-none"
            >
              Mensagem enviada<span className="gam-dot">.</span>
            </h3>
            <p className="mt-3 max-w-[44ch] text-ink-2">
              Recebemos seu contato e retornaremos em até 24h. Quer adiantar a conversa? Chame a gente no WhatsApp.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row [&>div]:w-full sm:[&>div]:w-auto [&_a]:w-full [&_button]:w-full">
              <Button href={WA_URL} icon="whatsapp">
                Ir para o WhatsApp
              </Button>
              <Button variant="outline" icon="none" onClick={reset} className="justify-center">
                Nova mensagem
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            aria-busy={sending}
            className={cn('flex flex-col', gap)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {/* Honeypot anti-spam do Web3Forms (invisível para pessoas) */}
            <input
              type="checkbox"
              name="botcheck"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
              checked={bot}
              onChange={(e) => setBot(e.target.checked)}
            />

            {/* Nome + WhatsApp */}
            <div className={cn('grid grid-cols-1 sm:grid-cols-2', gap)}>
              <Field label="Seu nome" htmlFor={id('name')} error={err('name')} errorId={id('name-err')}>
                <input
                  id={id('name')}
                  type="text"
                  autoComplete="name"
                  placeholder="Como podemos te chamar?"
                  value={fields.name}
                  onChange={set('name')}
                  onBlur={blur('name')}
                  required
                  aria-invalid={!!err('name')}
                  aria-describedby={err('name') ? id('name-err') : undefined}
                  className={cn(fieldCls(!!err('name')), 'h-14')}
                />
              </Field>
              <Field label="WhatsApp" htmlFor={id('whatsapp')} error={err('whatsapp')} errorId={id('whatsapp-err')}>
                <input
                  id={id('whatsapp')}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(62) 99999-9999"
                  value={fields.whatsapp}
                  onChange={set('whatsapp')}
                  onBlur={blur('whatsapp')}
                  required
                  aria-invalid={!!err('whatsapp')}
                  aria-describedby={err('whatsapp') ? id('whatsapp-err') : undefined}
                  className={cn(fieldCls(!!err('whatsapp')), 'h-14')}
                />
              </Field>
            </div>

            {/* E-mail */}
            <Field label="E-mail" htmlFor={id('email')} error={err('email')} errorId={id('email-err')}>
              <input
                id={id('email')}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                value={fields.email}
                onChange={set('email')}
                onBlur={blur('email')}
                required
                aria-invalid={!!err('email')}
                aria-describedby={err('email') ? id('email-err') : undefined}
                className={cn(fieldCls(!!err('email')), 'h-14')}
              />
            </Field>

            {/* Serviço (chips) */}
            <fieldset className="min-w-0">
              <legend className="type-label mb-2.5 text-ink">Serviço de interesse</legend>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((s) => {
                  const active = fields.service === s
                  return (
                    <label key={s} className="relative">
                      <input
                        type="radio"
                        name={id('service')}
                        value={s}
                        checked={active}
                        onChange={() => pickService(s)}
                        required
                        aria-describedby={err('service') ? id('service-err') : undefined}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          'inline-flex h-11 cursor-pointer select-none items-center gap-1.5 rounded-full px-4 text-sm font-medium',
                          'ring-1 ring-inset transition-[background-color,color,box-shadow] duration-300',
                          'peer-focus-visible:ring-2 peer-focus-visible:ring-red peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white',
                          active
                            ? 'bg-ink text-white ring-ink'
                            : err('service')
                              ? 'bg-red-50/60 text-ink-2 ring-red/40 hover:text-ink hover:ring-red/70'
                              : 'bg-paper/70 text-ink-2 ring-line hover:text-ink hover:ring-ink/40',
                        )}
                      >
                        <motion.span
                          aria-hidden="true"
                          initial={false}
                          animate={{ width: active ? 14 : 0, opacity: active ? 1 : 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="inline-flex overflow-hidden"
                        >
                          <Check className="size-3.5 shrink-0 text-red" strokeWidth={3} />
                        </motion.span>
                        {s}
                      </span>
                    </label>
                  )
                })}
              </div>
              <ErrorText id={id('service-err')} message={err('service')} />
            </fieldset>

            {/* Mensagem */}
            <Field
              label="Conte sobre seu projeto"
              htmlFor={id('message')}
              error={err('message')}
              errorId={id('message-err')}
              hint={
                <span className={cn('font-mono text-xs tabular-nums', msgCount >= 10 ? 'text-ink-3' : 'text-ink-3/80')}>
                  {msgCount >= 10 ? `${msgCount} caracteres` : `mín. 10 · ${msgCount}/10`}
                </span>
              }
            >
              <textarea
                id={id('message')}
                rows={compact ? 3 : 5}
                placeholder="Objetivo, prazo, referências... o que você tiver em mente."
                value={fields.message}
                onChange={set('message')}
                onBlur={blur('message')}
                required
                aria-invalid={!!err('message')}
                aria-describedby={err('message') ? id('message-err') : undefined}
                className={cn(fieldCls(!!err('message')), 'block resize-none py-4 leading-relaxed')}
              />
            </Field>

            {/* Erro de envio */}
            <AnimatePresence initial={false}>
              {status === 'error' && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 rounded-2xl bg-red-50 px-4 py-3.5 text-sm text-red-600 ring-1 ring-inset ring-red-100">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <p>
                      Erro ao enviar. Tente novamente ou{' '}
                      <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
                        fale direto no WhatsApp
                      </a>
                      .
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enviar */}
            <div className={cn(compact ? 'pt-1' : 'pt-2')}>
              <Button type="submit" size="lg" className="w-full" disabled={sending}>
                {sending ? (
                  <span className="inline-flex items-center gap-2.5">
                    <Spinner />
                    Enviando...
                  </span>
                ) : (
                  'Enviar mensagem'
                )}
              </Button>
              <p className="mt-4 text-center text-[0.8125rem] text-ink-3">
                Prefere agora?{' '}
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:text-red hover:decoration-red"
                >
                  WhatsApp {WHATSAPP_DISPLAY}
                </a>
                {!compact && (
                  <span className="mt-1 block sm:mt-0 sm:inline">
                    <span className="hidden sm:inline" aria-hidden="true"> · </span>
                    Seus dados não são compartilhados.
                  </span>
                )}
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Peças ────────────────────────────────────────────────────────────────────
function Field({
  label,
  htmlFor,
  error,
  errorId,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  errorId: string
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="type-label text-ink">
          {label}
        </label>
        {hint}
      </div>
      {children}
      <ErrorText id={errorId} message={error} />
    </div>
  )
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="overflow-hidden"
        >
          <span className="flex items-center gap-1.5 pt-2 text-[0.8125rem] font-medium text-red-600">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            {message}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/** Check desenhado: anel vermelho que se fecha + traço do check. */
function DrawnCheck() {
  return (
    <div className="relative grid size-20 place-items-center">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-red-50"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      />
      <svg viewBox="0 0 80 80" className="relative size-20" aria-hidden="true">
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--color-red)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, rotate: -90 }}
          animate={{ pathLength: 1, rotate: -90 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          style={{ originX: '50%', originY: '50%' }}
        />
        <motion.path
          d="M26 41 L36 51 L55 31"
          fill="none"
          stroke="var(--color-red)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.75 }}
        />
      </svg>
    </div>
  )
}
