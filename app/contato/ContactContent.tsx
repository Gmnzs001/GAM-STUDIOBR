'use client'

import { useId, useState, useSyncExternalStore, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Clock3, MapPin, Plus } from 'lucide-react'
import Button, { InstagramIcon, WhatsAppIcon } from '@/components/system/Button'
import SpotlightCard from '@/components/system/SpotlightCard'
import { Kicker } from '@/components/system/SectionHeading'
import { Reveal, RevealText } from '@/components/system/Reveal'
import ContactForm from '@/components/ContactForm'
import { COUNTRIES, FOUNDED_YEAR, INSTAGRAM_HANDLE, INSTAGRAM_URL, SERVICES, WA_URL, WHATSAPP_DISPLAY } from '@/lib/site'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

const FAQ = [
  {
    q: 'Em quanto tempo vocês respondem?',
    a: 'Respondemos em até 24 horas úteis pelo canal que você escolher. Se for algo urgente, o WhatsApp é o caminho mais rápido.',
  },
  {
    q: 'Vocês atendem fora de Goiânia?',
    a: `Sim. Nascemos em Goiânia em ${FOUNDED_YEAR} e hoje atendemos clientes em todo o Brasil, nos Estados Unidos e na Europa, com todo o acompanhamento feito online.`,
  },
  {
    q: 'Quais serviços a GAM Studio oferece?',
    a: `Trabalhamos com ${SERVICES.length} frentes integradas: ${SERVICES.map((s) => s.name).join(', ')}. Você pode começar por uma delas ou combinar várias.`,
  },
  {
    q: 'Qual é o horário de atendimento?',
    a: 'De segunda a sexta, das 8h às 18h (horário de Brasília). Mensagens enviadas fora desse horário são respondidas no próximo dia útil.',
  },
  {
    q: 'Preciso saber exatamente o que quero antes de chamar?',
    a: 'Não. Conte seu objetivo e o momento do seu negócio — a gente ajuda a desenhar o melhor caminho a partir daí.',
  },
]

// ─── Status "aberto agora" (horário de Brasília, seg–sex 8h–18h) ─────────────
function isOpenNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const day = parts.find((p) => p.type === 'weekday')?.value ?? ''
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  return !['Sat', 'Sun'].includes(day) && hour >= 8 && hour < 18
}
const subscribeMinute = (cb: () => void) => {
  const t = window.setInterval(cb, 60_000)
  return () => window.clearInterval(t)
}
function useOpenNow(): boolean | null {
  return useSyncExternalStore(subscribeMinute, isOpenNow, () => null)
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ContactContent() {
  return (
    <>
      <section aria-label="Canais de contato e formulário" className="relative pb-24 md:pb-32">
        <div className="container-gam grid gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          {/* ── Canais ── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <Reveal>
              <WhatsAppCard />
            </Reveal>
            <Reveal delay={0.08}>
              <InstagramCard />
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              <Reveal delay={0.16} className="h-full">
                <LocationCard />
              </Reveal>
              <Reveal delay={0.24} className="h-full">
                <HoursCard />
              </Reveal>
            </div>
          </div>

          {/* ── Formulário ── */}
          <Reveal delay={0.12} y={40} className="lg:col-span-7">
            <div id="formulario" className="scroll-mt-28 rounded-[28px] bg-surface p-6 shadow-[var(--shadow-lift)] ring-1 ring-line/60 sm:p-8 md:p-10">
              <Kicker className="mb-5">Formulário de contato</Kicker>
              <h2 className="type-title max-w-[18ch] text-ink">
                Conte sobre seu projeto<span className="gam-dot">.</span>
              </h2>
              <p className="mt-3 max-w-[48ch] text-ink-2">
                Quanto mais contexto você der, mais certeira é a nossa resposta. Todos os campos são obrigatórios.
              </p>
              <div className="mt-8 border-t border-line pt-8">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <FaqSection />
    </>
  )
}

// ─── Cards de canal ───────────────────────────────────────────────────────────
function WhatsAppCard() {
  return (
    <SpotlightCard
      as="article"
      tilt={4}
      glow="rgba(255,255,255,0.22)"
      className="rounded-[28px] bg-red text-white shadow-[var(--shadow-red)]"
    >
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group/wa relative block p-7 focus-visible:outline-offset-[-6px] md:p-8"
      >
        <WhatsAppIcon className="pointer-events-none absolute -bottom-10 -right-8 size-52 rotate-[-14deg] text-white/[0.08] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/wa:rotate-[-4deg] group-hover/wa:scale-105" />
        <div className="relative flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-white text-red">
            <WhatsAppIcon className="size-6" />
          </span>
          <span className="inline-flex h-8 items-center gap-2 rounded-full bg-white/15 px-3 text-[0.8125rem] font-semibold ring-1 ring-inset ring-white/25">
            <span className="relative flex size-1.5" aria-hidden="true">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/80 motion-reduce:animate-none" />
              <span className="relative size-1.5 rounded-full bg-white" />
            </span>
            Canal mais rápido
          </span>
        </div>
        <p className="type-label relative mt-10 text-white/80">WhatsApp</p>
        <p className="relative mt-1 font-display text-[clamp(1.9rem,3.2vw,2.6rem)] font-bold leading-none tracking-[-0.035em]">
          {WHATSAPP_DISPLAY}
        </p>
        <p className="relative mt-4 max-w-[34ch] text-white/85">
          Fale direto com a equipe para tirar dúvidas ou pedir seu orçamento.
        </p>
        <span className="relative mt-8 inline-flex items-center gap-3 font-semibold">
          Chamar agora
          <span className="grid size-9 place-items-center rounded-full bg-white text-red transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/wa:rotate-45">
            <ArrowUpRight className="size-4" strokeWidth={2.4} aria-hidden="true" />
          </span>
        </span>
      </a>
    </SpotlightCard>
  )
}

function InstagramCard() {
  return (
    <SpotlightCard as="article" tilt={4} className="rounded-[28px] bg-surface/90 ring-1 ring-line">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group/ig flex items-center gap-5 p-6 focus-visible:outline-offset-[-6px] md:p-7"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-white transition-colors duration-300 group-hover/ig:bg-red">
          <InstagramIcon className="size-[22px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="type-label block text-ink-3">Instagram</span>
          <span className="type-card block truncate text-ink">{INSTAGRAM_HANDLE}</span>
          <span className="mt-0.5 block text-sm text-ink-2">Bastidores e projetos recentes.</span>
        </span>
        <span className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-inset ring-line-2 transition-[transform,background-color,color,box-shadow] duration-500 ease-[var(--ease-out-expo)] group-hover/ig:rotate-45 group-hover/ig:bg-ink group-hover/ig:text-white group-hover/ig:ring-ink">
          <ArrowUpRight className="size-4" strokeWidth={2.4} aria-hidden="true" />
        </span>
      </a>
    </SpotlightCard>
  )
}

function InfoCard({ icon, label, children, visual }: { icon: ReactNode; label: string; children: ReactNode; visual?: ReactNode }) {
  return (
    <SpotlightCard
      as="article"
      className="flex h-full flex-col rounded-[20px] bg-surface/90 p-6 ring-1 ring-line"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red">{icon}</span>
        {visual}
      </div>
      <p className="type-label mt-6 text-ink-3">{label}</p>
      <div className="mt-1">{children}</div>
    </SpotlightCard>
  )
}

function LocationCard() {
  return (
    <InfoCard
      icon={<MapPin className="size-[18px]" strokeWidth={2.2} aria-hidden="true" />}
      label="Localização"
      visual={<Radar />}
    >
      <p className="font-display text-lg font-semibold leading-snug tracking-[-0.02em] text-ink">Goiânia — GO, Brasil</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        Atendemos {COUNTRIES[0]}, {COUNTRIES[1].replace('Estados Unidos', 'EUA')} e {COUNTRIES[2]}.
      </p>
    </InfoCard>
  )
}

function HoursCard() {
  const open = useOpenNow()
  return (
    <InfoCard icon={<Clock3 className="size-[18px]" strokeWidth={2.2} aria-hidden="true" />} label="Horário">
      <p className="font-display text-lg font-semibold leading-snug tracking-[-0.02em] text-ink">Seg a sex, 8h às 18h</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">Horário de Brasília. Respondemos em até 24h úteis.</p>
      {/* No servidor (e na hidratação) `open` é null → chip neutro; o status real só aparece no cliente. */}
      <p
        className={cn(
          'mt-4 inline-flex h-7 w-fit items-center gap-2 rounded-full px-2.5 text-xs font-semibold transition-colors duration-500',
          open ? 'bg-emerald-50 text-emerald-700' : 'bg-paper-2 text-ink-2',
        )}
      >
        <span
          className={cn('size-1.5 rounded-full transition-colors duration-500', open ? 'bg-emerald-500' : 'bg-ink-3')}
          aria-hidden="true"
        />
        {open === null ? 'Verificando horário' : open ? 'Aberto agora' : 'Fora do horário agora'}
      </p>
    </InfoCard>
  )
}

/** Mini radar: anéis concêntricos com pulso no ponto de Goiânia. */
function Radar() {
  return (
    <span className="relative grid size-12 place-items-center" aria-hidden="true">
      <span className="absolute inset-0 rounded-full ring-1 ring-line" />
      <span className="absolute inset-[9px] rounded-full ring-1 ring-line" />
      <span className="absolute inset-0 animate-ping rounded-full bg-red/10 [animation-duration:2.4s] motion-reduce:animate-none" />
      <span className="relative size-2 rounded-full bg-red shadow-[0_0_0_4px_rgba(224,32,32,0.15)]" />
    </span>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  const baseId = useId()

  return (
    <section aria-label="Perguntas frequentes" className="relative pb-24 md:pb-36">
      <div className="container-gam grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <Kicker className="mb-6">Dúvidas frequentes</Kicker>
          <RevealText
            as="h2"
            lines={['Antes de', 'você perguntar']}
            dot
            className="font-display text-[clamp(2.3rem,3.6vw,3.5rem)] font-extrabold leading-[0.96] tracking-[-0.035em] text-ink"
          />
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-[36ch] text-ink-2">
              Não encontrou o que procurava? Mande sua pergunta no WhatsApp e a gente responde.
            </p>
            <div className="mt-7">
              <Button href={WA_URL} variant="outline" icon="whatsapp">
                Perguntar no WhatsApp
              </Button>
            </div>
          </Reveal>
        </div>

        <ul className="flex flex-col gap-3 lg:col-span-8">
          {FAQ.map((item, i) => {
            const isOpen = open === i
            const btnId = `${baseId}-q${i}`
            const panelId = `${baseId}-a${i}`
            return (
              <Reveal as="li" key={item.q} delay={i * 0.06}>
                <div
                  className={cn(
                    'rounded-[20px] ring-1 ring-inset transition-[background-color,box-shadow] duration-500',
                    isOpen ? 'bg-surface shadow-[var(--shadow-soft)] ring-line-2' : 'bg-surface/75 ring-line hover:bg-surface/95',
                  )}
                >
                  <h3 className="font-sans">
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group/q flex w-full items-center gap-4 rounded-[20px] px-5 py-5 text-left focus-visible:outline-offset-[-3px] md:gap-6 md:px-7 md:py-6"
                    >
                      <span className="hidden font-mono text-xs tabular-nums text-ink-3 sm:block">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 font-display text-[1.0625rem] font-semibold leading-snug tracking-[-0.015em] text-ink md:text-xl">
                        {item.q}
                      </span>
                      <span
                        className={cn(
                          'grid size-10 shrink-0 place-items-center rounded-full transition-[transform,background-color,color,box-shadow] duration-500 ease-[var(--ease-out-expo)]',
                          isOpen
                            ? 'rotate-45 bg-red text-white'
                            : 'text-ink ring-1 ring-inset ring-line-2 group-hover/q:ring-ink',
                        )}
                      >
                        <Plus className="size-4" strokeWidth={2.4} aria-hidden="true" />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[62ch] px-5 pb-6 text-ink-2 sm:pl-[3.75rem] md:pb-7 md:pl-[4.6rem] md:pr-20">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
