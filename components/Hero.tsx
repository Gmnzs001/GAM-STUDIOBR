'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { useRevealed } from '@/lib/intro'
import { getLenis } from '@/lib/lenis-ref'
import { FOUNDED_YEAR, STATS, WA_URL } from '@/lib/site'
import { Reveal, RevealText } from '@/components/system/Reveal'
import Button from '@/components/system/Button'
import CountUp from '@/components/system/CountUp'
import Globe from '@/components/Globe'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const
const WORDS = ['presença', 'estrutura', 'previsibilidade'] as const
const CYCLE_MS = 2800

/**
 * Hero da home. Tudo espera `revealed` (a intro abrindo o site) para entrar:
 * selo → título → linha rotativa → texto → CTAs, globo em paralelo, números por último.
 */
export default function Hero() {
  const revealed = useRevealed()
  const statsRef = useRef<HTMLDListElement>(null)
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 })
  // Números visíveis na revelação (desktop) seguem a coreografia; abaixo da dobra
  // (mobile) entram assim que a pessoa rola até eles, sem esperar.
  const [statsDelay, setStatsDelay] = useState(0.9)
  useEffect(() => {
    if (!revealed) return
    const id = requestAnimationFrame(() => {
      const el = statsRef.current
      if (el && el.getBoundingClientRect().top > window.innerHeight) setStatsDelay(0.1)
    })
    return () => cancelAnimationFrame(id)
  }, [revealed])
  const playStats = revealed && statsInView

  return (
    <section
      id="inicio"
      aria-label="Início"
      className="relative flex min-h-[100svh] flex-col overflow-x-clip pb-6 pt-28 sm:pt-32 lg:pb-8 lg:pt-28"
    >
      <div className="container-gam grid flex-1 items-center gap-y-12 lg:grid-cols-12 lg:gap-x-6">
        {/* ── Texto ─────────────────────────────────────────────────────── */}
        <div className="relative z-10 lg:col-span-7">
          <Reveal play={revealed} y={14} duration={0.8}>
            <p className="inline-flex items-center gap-2.5 rounded-full bg-surface/70 py-1.5 pl-3 pr-4 text-[13px] font-medium leading-tight text-ink-2 ring-1 ring-line">
              <span className="pulse-dot shrink-0" aria-hidden="true" />
              <span>
                <span className="hidden sm:inline">Agência de marketing</span>
                <span className="sm:hidden">Marketing</span>, mídia e tecnologia desde {FOUNDED_YEAR}
              </span>
            </p>
          </Reveal>

          <RevealText
            as="h1"
            className="type-hero mt-5 text-ink text-[length:clamp(3.1rem,min(16vw,13.2vh),9.25rem)]! lg:text-[length:clamp(3.1rem,min(9.2vw,13.2vh),9.25rem)]!"
            lines={['Sua marca', 'no próximo', 'nível']}
            dot
            play={revealed}
            delay={0.1}
          />

          <Reveal play={revealed} delay={0.55} y={18}>
            <RotatingLine play={revealed} />
          </Reveal>

          <Reveal play={revealed} delay={0.65} y={18}>
            <p className="type-lead mt-4 max-w-[46ch] text-ink-2">
              Sites, tráfego pago, branding e inteligência artificial trabalhando juntos para sua marca crescer no
              Brasil, nos Estados Unidos e na Europa.
            </p>
          </Reveal>

          <Reveal play={revealed} delay={0.75} y={18} className="mt-7 flex flex-wrap items-center gap-3">
            <Button href={WA_URL} size="lg" icon="whatsapp">
              Faça seu orçamento
            </Button>
            <Button href="/portfolio" variant="outline" size="lg">
              Ver portfólio
            </Button>
          </Reveal>
        </div>

        {/* ── Globo ─────────────────────────────────────────────────────── */}
        <motion.div
          className="relative mx-auto w-full max-w-[340px] sm:max-w-[440px] lg:col-span-5 lg:-mr-[4%] lg:w-[min(600px,112%)] lg:max-w-none lg:justify-self-end"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.3, duration: 1.4, ease: EASE }}
        >
          <Globe play={revealed} />
        </motion.div>
      </div>

      {/* ── Números ───────────────────────────────────────────────────────── */}
      <div className="container-gam relative mt-12 lg:mt-6">
        <ScrollCue play={revealed} />
        <dl ref={statsRef} className="grid grid-cols-2 border-t border-line md:grid-cols-5">
          {STATS.map((s, i) => {
            const wide = i === STATS.length - 1
            return (
              <Reveal
                key={s.label}
                play={playStats}
                delay={statsDelay + i * 0.07}
                y={16}
                className={cn(
                  'flex flex-col-reverse justify-end gap-2.5 py-5',
                  i % 2 === 1 && 'border-l border-line pl-5',
                  i >= 2 && 'border-t border-line',
                  wide && 'col-span-2 flex-row-reverse items-center justify-between gap-6',
                  'md:col-span-1 md:flex-col-reverse md:items-stretch md:justify-end md:gap-2.5 md:border-l md:border-t-0 md:pb-0 md:pl-6 md:pt-6 md:first:border-l-0 md:first:pl-0',
                )}
              >
                <dt className={cn('text-sm leading-snug text-ink-2', wide && 'text-right md:text-left')}>
                  {s.label}
                  {s.detail && (
                    <span className="mt-1 block font-mono text-[11px] leading-none tracking-tight text-ink-3">
                      {s.detail}
                    </span>
                  )}
                </dt>
                <dd className="type-num flex items-start text-[length:clamp(2.5rem,4vw,3.75rem)] text-ink">
                  <CountUp value={s.value} prefix={s.prefix} play={playStats} delay={statsDelay + 0.05 + i * 0.07} />
                  {s.suffix && <span className="ml-[0.06em] mt-[0.1em] text-[0.5em] leading-none text-red">{s.suffix}</span>}
                </dd>
              </Reveal>
            )
          })}
        </dl>
      </div>
    </section>
  )
}

/** "Seu negócio com mais ___." — a palavra gira num slot de largura fixa (sem layout shift). */
function RotatingLine({ play }: { play: boolean }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { amount: 0.6 })
  const reduce = useReducedMotion()
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (!play || !inView || reduce) return
    const id = window.setInterval(() => setCycle((n) => n + 1), CYCLE_MS)
    return () => window.clearInterval(id)
  }, [play, inView, reduce])

  const word = WORDS[cycle % WORDS.length]

  return (
    <p
      ref={ref}
      className="mt-6 font-display text-[length:clamp(1.3rem,2.1vw,1.85rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
    >
      Seu negócio com mais{' '}
      <span className="sr-only">presença, estrutura e previsibilidade.</span>
      <span aria-hidden="true" className="relative -mb-[0.14em] inline-grid overflow-hidden pb-[0.14em] align-bottom">
        {/* palavras invisíveis empilhadas = largura da mais longa */}
        {WORDS.map((w) => (
          <span key={w} className="invisible col-start-1 row-start-1">
            {w}.
          </span>
        ))}
        <AnimatePresence initial={false}>
          <motion.span
            key={word}
            className="absolute left-0 top-0 whitespace-nowrap"
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-110%' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {word}.
            <motion.span
              className="absolute bottom-[0.02em] left-0 h-[2px] w-[calc(100%-0.32em)] origin-left rounded-full bg-red"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: play ? 1 : 0 }}
              transition={{ delay: cycle === 0 ? 1.15 : 0.4, duration: 0.8, ease: EASE }}
            />
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  )
}

/** Indicador de rolagem (só desktop largo — abaixo de xl colidiria com os CTAs): leva até os serviços. */
function ScrollCue({ play }: { play: boolean }) {
  const go = () => {
    const target = document.getElementById('servicos')
    if (!target) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(target, { duration: 1.4 })
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.button
      type="button"
      onClick={go}
      className="absolute bottom-full left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2.5 px-3 pt-2 text-xs font-medium text-ink-3 transition-colors duration-300 hover:text-ink xl:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: play ? 1 : 0 }}
      transition={{ delay: 1.3, duration: 0.8 }}
    >
      Role para explorar
      <span aria-hidden="true" className="relative block h-10 w-px overflow-hidden bg-line">
        <span className="absolute inset-0 bg-ink motion-safe:animate-[gam-scroll-line_2.4s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
      </span>
    </motion.button>
  )
}
