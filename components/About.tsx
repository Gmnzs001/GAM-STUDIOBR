'use client'

import { useRef, type ReactNode } from 'react'
import Image from 'next/image'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { BarChart3, Globe2, PenTool, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FOUNDER, STATS, FOUNDED_YEAR } from '@/lib/site'
import { Kicker } from '@/components/system/SectionHeading'
import { Reveal } from '@/components/system/Reveal'
import Button from '@/components/system/Button'
import CountUp from '@/components/system/CountUp'

const STATEMENT =
  'Somos a GAM Studio, uma agência de marketing, mídia e desenvolvimento digital nascida em Goiânia em 2020. Hoje atendemos marcas no Brasil, nos Estados Unidos e na Europa, unindo design, estratégia e inteligência artificial para entregar presença, estrutura e previsibilidade.'

const PILLARS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: PenTool,
    title: 'Design que converte',
    text: 'Sites, marcas e peças pensados para gerar resultado.',
  },
  {
    icon: BarChart3,
    title: 'Estratégia guiada por dados',
    text: 'Testamos, medimos e otimizamos com números reais.',
  },
  {
    icon: Globe2,
    title: 'Atendimento internacional',
    text: 'Clientes no Brasil, nos Estados Unidos e na Europa.',
  },
]

// ─── Frase com destaque palavra a palavra ligado ao scroll ───────────────────
function ScrollWord({
  children,
  progress,
  range,
}: {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return <motion.span style={{ opacity }}>{children}</motion.span>
}

function ScrollStatement({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const words = text.split(' ')
  const n = words.length

  return (
    <p ref={ref} className={className}>
      {words.map((raw, i) => {
        const isLast = i === n - 1
        const word = isLast && raw.endsWith('.') ? raw.slice(0, -1) : raw
        const content = (
          <>
            {word}
            {isLast && <span className="gam-dot">.</span>}
          </>
        )
        return (
          <span key={i}>
            {reduce ? (
              <span>{content}</span>
            ) : (
              <ScrollWord progress={scrollYProgress} range={[i / n, (i + 1) / n]}>
                {content}
              </ScrollWord>
            )}
            {!isLast && ' '}
          </span>
        )
      })}
    </p>
  )
}

// ─── Retrato do fundador (bloco vermelho em parallax + legenda flutuante) ─────
export function FounderPortrait({
  className,
  priority = false,
  caption = true,
  sizes = '(min-width: 1024px) 34vw, (min-width: 640px) 60vw, 88vw',
}: {
  className?: string
  priority?: boolean
  /** legenda flutuante com nome e cargo (desligue quando o nome já está ao lado) */
  caption?: boolean
  sizes?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const blockY = useTransform(scrollYProgress, [0, 1], [36, -36])
  const photoY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%'])

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Bloco vermelho deslocado atrás da foto */}
      <motion.div
        aria-hidden="true"
        style={{ y: reduce ? 0 : blockY, rotate: -4 }}
        className="absolute -bottom-5 -right-2 left-8 top-12 rounded-[28px] bg-red sm:-bottom-7 sm:-right-6 sm:left-12"
      >
        <div className="absolute inset-0 rounded-[28px] bg-dot-grid-light opacity-70" />
      </motion.div>

      {/* Foto */}
      <div className="group/photo relative aspect-[4/5] overflow-hidden rounded-[28px] bg-paper-2 shadow-[var(--shadow-lift)] ring-1 ring-ink/5">
        <motion.div style={{ y: reduce ? 0 : photoY }} className="absolute inset-x-0 -inset-y-[6%]">
          <Image
            src={FOUNDER.photo}
            alt={`${FOUNDER.name}, ${FOUNDER.role.toLowerCase()}`}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover object-top transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover/photo:scale-[1.045]"
          />
        </motion.div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/35 to-transparent" />
      </div>

      {/* Legenda flutuante */}
      {caption && (
        <div className="absolute -bottom-6 left-4 motion-safe:animate-[gam-float_7s_ease-in-out_infinite] sm:left-auto sm:right-[-1.25rem] lg:-left-6 lg:right-auto">
          <div className="flex items-center gap-3 rounded-[20px] bg-surface py-3.5 pl-3.5 pr-6 shadow-[var(--shadow-soft)] ring-1 ring-line">
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-ink font-display text-lg font-bold text-white">
              <span>
                {FOUNDER.name.charAt(0)}
                <span className="gam-dot">.</span>
              </span>
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-[1.05rem] font-semibold tracking-[-0.01em] text-ink">{FOUNDER.name}</span>
              <span className="text-sm text-ink-2">{FOUNDER.role}</span>
            </span>
          </div>
        </div>
      )}

      {/* Selo superior */}
      <div className="absolute -top-4 right-4 motion-safe:animate-[gam-float_8s_ease-in-out_1.2s_infinite] sm:-right-5">
        <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium text-ink shadow-[var(--shadow-soft)] ring-1 ring-line">
          <span className="pulse-dot" aria-hidden="true" />
          Goiânia, desde {FOUNDED_YEAR}
        </div>
      </div>
    </div>
  )
}

// ─── Números grandes e assimétricos ──────────────────────────────────────────
const STAT_NOTES: Record<string, string> = {
  'projetos entregues': 'Sites, marcas, campanhas e conteúdo para empresas de diferentes tamanhos e segmentos.',
}

const STEP_OFFSET = ['lg:ml-0', 'lg:ml-[12%]', 'lg:ml-[24%]']
const STEP_SIZE = [
  'text-[clamp(3.25rem,6vw,5.5rem)]',
  'text-[clamp(3rem,5.2vw,4.75rem)]',
  'text-[clamp(2.75rem,4.4vw,4rem)]',
]

export function AboutStats({ className }: { className?: string }) {
  const stats = STATS.filter((s) => s.suffix !== '★')
  const [lead, ...rest] = stats

  return (
    <div className={cn('grid gap-y-10 border-t border-line pt-10 lg:grid-cols-12 lg:gap-x-10 lg:pt-14', className)}>
      <Reveal className="lg:col-span-7">
        <p className="flex items-start text-ink">
          <CountUp value={lead.value} className="type-num text-[clamp(5.5rem,13vw,11.5rem)]" />
          <span aria-hidden="true" className="type-num mt-[0.08em] text-[clamp(3rem,7vw,6.5rem)] text-red">
            {lead.suffix}
          </span>
        </p>
        <p className="type-card mt-5 first-letter:uppercase">{lead.label}</p>
        {STAT_NOTES[lead.label] && (
          <p className="mt-2 max-w-[40ch] text-ink-2">{STAT_NOTES[lead.label]}</p>
        )}
      </Reveal>

      <ul className="flex flex-col lg:col-span-5 lg:self-end">
        {rest.map((s, i) => (
          <Reveal
            as="li"
            key={s.label}
            delay={0.1 + i * 0.08}
            className={cn(
              'flex items-end justify-between gap-6 border-t border-line py-5 first:border-t-0',
              STEP_OFFSET[i],
            )}
          >
            <span className="flex items-start text-ink">
              <CountUp value={s.value} className={cn('type-num', STEP_SIZE[i])} />
              {s.suffix && (
                <span aria-hidden="true" className={cn('type-num mt-[0.06em] text-red', 'text-[clamp(1.75rem,3vw,2.75rem)]')}>
                  {s.suffix}
                </span>
              )}
            </span>
            <span className="pb-2 text-right leading-snug">
              <span className="block font-medium text-ink first-letter:uppercase">{s.label}</span>
              {s.detail && <span className="block text-sm text-ink-2">{s.detail}</span>}
            </span>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}

// ─── Seção da home ───────────────────────────────────────────────────────────
export default function About() {
  return (
    <section id="sobre" aria-labelledby="sobre-titulo" className="relative scroll-mt-28 overflow-x-clip pb-[var(--section-y)] pt-[calc(var(--section-y)*0.35)]">
      <div className="container-gam">
        <h2 id="sobre-titulo" className="sr-only">Quem somos</h2>

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          {/* Texto */}
          <div className="lg:col-span-7 lg:pr-6">
            <Kicker className="mb-8 md:mb-10">Quem somos</Kicker>

            <ScrollStatement
              text={STATEMENT}
              className="max-w-[30ch] font-display text-[clamp(1.6rem,2.8vw,2.6rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-ink"
            />

            <ul className="mt-12 grid gap-px overflow-hidden rounded-[20px] bg-line ring-1 ring-line sm:grid-cols-3 md:mt-14">
              {PILLARS.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 0.08} className="bg-surface/90 p-5 md:p-6 lg:p-5 xl:p-6">
                  <span className="mb-5 grid size-10 place-items-center rounded-xl bg-red-50 text-red">
                    <p.icon className="size-[18px]" strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-[1.08rem] font-semibold leading-snug tracking-[-0.015em] text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{p.text}</p>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.2} className="mt-10">
              <Button href="/sobre" variant="outline">Conheça a GAM</Button>
            </Reveal>
          </div>

          {/* Retrato */}
          <Reveal delay={0.15} className="lg:col-span-5 lg:pt-16">
            <FounderPortrait className="mr-3 w-auto max-w-[440px] sm:mx-auto lg:ml-auto lg:mr-6" />
          </Reveal>
        </div>

        <AboutStats className="mt-24 md:mt-32" />
      </div>
    </section>
  )
}
