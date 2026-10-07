'use client'

import { Fragment, useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Marquee } from '@/components/Marquee'
import Button from '@/components/system/Button'
import { Reveal } from '@/components/system/Reveal'
import ContactForm from '@/components/ContactForm'
import { FOUNDED_YEAR, INSTAGRAM_HANDLE, INSTAGRAM_URL, SERVICES, WA_URL } from '@/lib/site'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

// Nomes curtos para a faixa gigante (mais impacto, menos quebra)
const TICKER = SERVICES.map((s) => s.name.replace('Consultoria em ', '').replace(' Completa', ''))

const TITLE = 'Pronto para levar sua marca ao próximo nível'

const FACTS = [
  { value: '24h', label: 'para responder seu contato' },
  { value: '3 regiões', label: 'Brasil, Estados Unidos e Europa' },
  { value: String(FOUNDED_YEAR), label: 'ano em que nascemos, em Goiânia' },
]

/**
 * CTA final da home: banda vermelha com os serviços passando gigantes na tela,
 * chamada à esquerda e formulário de orçamento num card branco à direita.
 */
export default function CTASection() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // Leve deslocamento extra das faixas conforme o scroll (sensação de velocidade)
  const xA = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['4%', '-10%'])
  const xB = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-8%', '4%'])
  const markY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['18%', '-12%'])

  return (
    <section
      ref={ref}
      id="contato"
      aria-labelledby="cta-title"
      className="relative isolate scroll-mt-28 overflow-hidden bg-red text-white"
    >
      {/* ── Decoração ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_12%_0%,rgba(255,255,255,0.16),transparent_65%),radial-gradient(60%_60%_at_100%_100%,rgba(110,0,0,0.38),transparent_70%)]" />
        <div className="bg-dot-grid-light absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_80%,transparent)] opacity-90" />
        <motion.div
          style={{ y: markY }}
          className="absolute -bottom-[0.2em] -left-[0.04em] select-none font-display text-[clamp(14rem,40vw,40rem)] font-extrabold leading-[0.8] tracking-[-0.06em] text-white/[0.07]"
        >
          GAM.
        </motion.div>
      </div>

      {/* ── Serviços passando na tela ── */}
      <div className="relative border-b border-white/15 pb-6 pt-14 md:pb-10 md:pt-20">
        <p className="sr-only">Serviços: {SERVICES.map((s) => s.name).join(', ')}.</p>
        <div aria-hidden="true" className="mask-fade-x overflow-hidden">
          <motion.div style={{ x: xA }}>
            <Marquee repeat={3} ariaRole="presentation" tabIndex={-1} className="overflow-visible p-0 [--duration:70s] [--gap:0px]">
              {TICKER.map((s, i) => (
                <TickerWord key={s} word={s} outline={i % 2 === 1} />
              ))}
            </Marquee>
          </motion.div>
          <motion.div style={{ x: xB }} className="-mt-2 md:-mt-6">
            <Marquee repeat={3} reverse ariaRole="presentation" tabIndex={-1} className="overflow-visible p-0 [--duration:80s] [--gap:0px]">
              {[...TICKER].reverse().map((s, i) => (
                <TickerWord key={s} word={s} outline={i % 2 === 0} small />
              ))}
            </Marquee>
          </motion.div>
        </div>
      </div>

      {/* ── Chamada + formulário ── */}
      <div className="container-gam relative grid gap-12 pb-20 pt-14 md:pb-28 md:pt-20 lg:grid-cols-12 lg:gap-10 xl:gap-16">
        <div className="flex flex-col lg:sticky lg:top-28 lg:col-span-6 lg:self-start lg:pt-4">
          <LightKicker>Vamos conversar</LightKicker>

          <CTATitle />

          <Reveal delay={0.25}>
            <p className="type-lead mt-7 max-w-[40ch] text-white/85">
              Conte o que você precisa. Respondemos em até 24h.
            </p>
          </Reveal>

          <Reveal delay={0.35} className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>div]:w-full sm:[&>div]:w-auto [&_a]:w-full">
            <Button href={WA_URL} variant="white" icon="whatsapp">
              Chamar no WhatsApp
            </Button>
            <Button href={INSTAGRAM_URL} variant="outline-light" icon="instagram">
              {INSTAGRAM_HANDLE}
            </Button>
          </Reveal>

          <Reveal delay={0.45} className="pt-12 lg:pt-20">
            <dl className="grid grid-cols-1 gap-5 border-t border-white/20 pt-7 sm:grid-cols-3 sm:gap-6">
              {FACTS.map((f) => (
                <div key={f.value} className="flex items-baseline gap-3 sm:block">
                  <dt className="font-display text-[1.75rem] font-bold leading-none tracking-[-0.035em] sm:text-[2rem]">
                    {f.value}
                  </dt>
                  <dd className="text-sm leading-snug text-white/75 sm:mt-2">{f.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={48} className="lg:col-span-6">
          <div className="relative rounded-[28px] bg-surface p-6 text-ink shadow-[var(--shadow-lift)] md:p-8">
            {/* aba superior do card */}
            <div className="mb-7 flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-line pb-6">
              <div>
                <p className="type-card text-ink">
                  Peça seu orçamento<span className="gam-dot">.</span>
                </p>
                <p className="mt-1.5 text-sm text-ink-2">Sem compromisso. Leva só um minuto.</p>
              </div>
              <span className="inline-flex h-8 items-center gap-2 rounded-full bg-red-50 px-3 text-[0.8125rem] font-semibold text-red-600">
                <span className="pulse-dot" aria-hidden="true" />
                Resposta em até 24h
              </span>
            </div>
            <ContactForm compact />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Peças locais ─────────────────────────────────────────────────────────────
function TickerWord({ word, outline, small }: { word: string; outline?: boolean; small?: boolean }) {
  return (
    <span className="flex shrink-0 items-center">
      <span
        className={cn(
          'whitespace-nowrap px-[0.28em] font-display font-extrabold leading-[1.02] tracking-[-0.045em]',
          small ? 'text-[clamp(2.75rem,7vw,6.5rem)]' : 'text-[clamp(3.5rem,10vw,9.5rem)]',
          outline
            ? 'text-red [paint-order:stroke_fill] [-webkit-text-stroke:3px_rgba(255,255,255,0.9)] md:[-webkit-text-stroke:4px_rgba(255,255,255,0.9)]'
            : 'text-white',
        )}
      >
        {word}
      </span>
      <span
        className={cn(
          'mx-[0.15em] inline-block shrink-0 rounded-full bg-ink',
          small ? 'size-[clamp(0.6rem,1.1vw,1rem)]' : 'size-[clamp(0.75rem,1.4vw,1.35rem)]',
        )}
      />
    </span>
  )
}

/** Kicker em versão clara para a banda vermelha (o pulso vermelho sumiria). */
function LightKicker({ children }: { children: string }) {
  return (
    <div className="mb-7 flex items-center gap-3">
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/70 motion-reduce:animate-none" />
        <span className="relative size-2 rounded-full bg-white" />
      </span>
      <span className="type-label text-white">{children}</span>
      <motion.span
        aria-hidden="true"
        className="h-px w-16 origin-left bg-white/45"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
      />
    </div>
  )
}

/** Título palavra a palavra; o "?" final ganha a cor tinta (o acento da marca sobre o vermelho). */
function CTATitle() {
  const words = TITLE.split(' ')
  return (
    <h2
      id="cta-title"
      aria-label={`${TITLE}?`}
      className="type-display max-w-[13ch] text-[clamp(2.6rem,5.2vw,5.25rem)] text-white"
    >
      <motion.span
        aria-hidden="true"
        className="block"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
              <motion.span
                className="inline-block origin-bottom-left"
                variants={{
                  hidden: { y: '115%', rotate: 4 },
                  show: { y: '0%', rotate: 0, transition: { duration: 1, ease: EASE, delay: i * 0.055 } },
                }}
              >
                {w}
                {i === words.length - 1 && <span className="text-ink">?</span>}
              </motion.span>
            </span>
            {i < words.length - 1 && ' '}
          </Fragment>
        ))}
      </motion.span>
    </h2>
  )
}
