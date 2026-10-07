'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { CASE_CATEGORIES, HOME_CASES, type CaseCategory, type HomeCase } from '@/lib/site'
import SectionHeading from '@/components/system/SectionHeading'
import SpotlightCard from '@/components/system/SpotlightCard'
import Button from '@/components/system/Button'
import { Reveal } from '@/components/system/Reveal'
import CaseCover, { trackCoverPointer, resetCoverPointer, CATEGORY_TINT } from '@/components/CaseCover'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

type Filter = 'Todos' | CaseCategory
const FILTERS: Filter[] = ['Todos', ...CASE_CATEGORIES]

// ─── Layout do bento ──────────────────────────────────────────────────────────
// lg (3 col): 1º card em destaque (2 col) + 1 card ao lado; depois linhas de 3.
//             A sobra da última linha vira um card largo horizontal.
// md (2 col): 1º card ocupa a linha toda; sobra ímpar no fim também.
type Variant = 'feature' | 'wide' | 'default'

function layoutFor(idx: number, n: number): { variant: Variant; lgSpan: string; mdSpan2: boolean } {
  const mdSpan2 = n > 1 && (idx === 0 || (idx === n - 1 && (n - 1) % 2 === 1))
  if (n === 1) return { variant: 'wide', lgSpan: 'lg:col-span-3', mdSpan2: true }
  if (idx === 0) return { variant: 'feature', lgSpan: 'lg:col-span-2', mdSpan2 }
  if (idx >= 2 && idx === n - 1) {
    const lastRow = (n - 2) % 3
    if (lastRow === 1) return { variant: 'wide', lgSpan: 'lg:col-span-3', mdSpan2 }
    if (lastRow === 2) return { variant: 'wide', lgSpan: 'lg:col-span-2', mdSpan2 }
  }
  return { variant: 'default', lgSpan: '', mdSpan2 }
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function CaseCard({ item, variant, mdSpan2, accent, stretch }: { item: HomeCase; variant: Variant; mdSpan2: boolean; accent: boolean; stretch: boolean }) {
  const feature = variant === 'feature'
  const wide = variant === 'wide'

  return (
    <SpotlightCard
      as="article"
      tilt={6}
      glow="rgba(224,32,32,0.18)"
      className="h-full rounded-[28px] bg-night-2 ring-1 ring-night-line transition-shadow duration-500 hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)] hover:ring-white/15"
    >
      <div
        onPointerMove={trackCoverPointer}
        onPointerLeave={resetCoverPointer}
        className={cn('group/case relative flex h-full flex-col p-2', wide && 'lg:grid lg:grid-cols-2 lg:gap-2')}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-[22px]',
            'aspect-[16/10]',
            mdSpan2 && 'md:aspect-[2/1]',
            feature && 'lg:aspect-[2/1]',
            wide && 'lg:aspect-auto lg:h-full lg:min-h-[340px]',
            variant === 'default' && (stretch ? 'lg:aspect-auto lg:min-h-[250px] lg:flex-1' : mdSpan2 && 'lg:aspect-[16/10]'),
          )}
        >
          <CaseCover category={item.category} seed={item.id} title={item.title} tone="dark" depth={feature ? 1.4 : 1} zoom={wide ? 1.1 : 1} className="absolute inset-0" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-night/85 px-3 py-1.5 text-[0.78rem] font-semibold text-mist ring-1 ring-white/10">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: CATEGORY_TINT[item.category] }} aria-hidden="true" />
            {item.category}
          </span>
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white text-ink opacity-0 shadow-lg transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-hover/case:rotate-45 group-hover/case:opacity-100 max-lg:hidden"
          >
            <ArrowUpRight className="size-[18px]" strokeWidth={2.4} />
          </span>
        </div>

        <div className={cn('flex flex-col px-4 pb-4 pt-5 md:px-5 md:pb-5', variant === 'default' && stretch ? 'max-lg:flex-1' : 'flex-1', feature && 'lg:px-6 lg:pb-6 lg:pt-6', wide && 'lg:justify-center lg:px-10 lg:py-8')}>
          <div className={cn('flex flex-1 flex-col gap-5', wide && 'lg:flex-none lg:gap-8', feature && 'lg:flex-row lg:items-end lg:justify-between lg:gap-10')}>
            <div className="min-w-0">
              <h3 className={cn('type-card text-mist', (feature || wide) && 'lg:text-[1.75rem]')}>
                <Link
                  href="/portfolio"
                  className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-[28px] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[-3px] focus-visible:after:outline-red"
                >
                  {item.title}
                </Link>
              </h3>
              <p className="mt-2 max-w-[44ch] text-[0.95rem] leading-relaxed text-mist-2">{item.description}</p>
            </div>
            <div className={cn('mt-auto flex items-end gap-3 border-t border-night-line pt-4', feature && 'lg:mt-0 lg:shrink-0 lg:flex-col lg:items-end lg:gap-1 lg:border-0 lg:pt-0 lg:text-right')}>
              <span className={cn('type-num text-[2.4rem]', feature && 'lg:text-[3.6rem]', wide && 'lg:text-[3rem]', accent ? 'text-red' : 'text-mist')}>
                {item.metric.value}
              </span>
              <span className="pb-1 text-sm leading-tight text-mist-2">{item.metric.label}</span>
            </div>
          </div>
        </div>
      </div>
    </SpotlightCard>
  )
}

// ─── Filtros ──────────────────────────────────────────────────────────────────
function FilterTabs({ active, onChange, counts }: { active: Filter; onChange: (f: Filter) => void; counts: Record<Filter, number> }) {
  return (
    <div
      role="group"
      aria-label="Filtrar cases por categoria"
      className="-mx-[var(--gutter)] min-w-0 overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <div className="inline-flex min-w-max items-center gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-night-line">
        {FILTERS.map((f) => {
          const on = active === f
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(f)}
              className={cn(
                'relative flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors duration-300',
                on ? 'text-ink' : 'text-mist-2 hover:text-mist',
              )}
            >
              {on && (
                <motion.span
                  layoutId="cases-filter-pill"
                  className="absolute inset-0 rounded-full bg-mist"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative">{f}</span>
              <span className={cn('relative font-mono text-[0.7rem]', on ? 'text-ink-3' : 'text-mist-2/70')}>{counts[f]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Seção ────────────────────────────────────────────────────────────────────
export default function Cases() {
  const [active, setActive] = useState<Filter>('Todos')
  const gridRef = useRef<HTMLDivElement>(null)
  const inView = useInView(gridRef, { once: true, margin: '0px 0px -12% 0px' })

  const counts = useMemo(() => {
    const c = { Todos: HOME_CASES.length } as Record<Filter, number>
    CASE_CATEGORIES.forEach((cat) => { c[cat] = HOME_CASES.filter((x) => x.category === cat).length })
    return c
  }, [])

  const visible = active === 'Todos' ? HOME_CASES : HOME_CASES.filter((c) => c.category === active)

  return (
    <section id="cases" className="relative scroll-mt-28 px-2 sm:px-3 lg:px-4">
      <div className="relative isolate overflow-hidden rounded-[32px] bg-night text-mist md:rounded-[44px]">
        {/* textura + brilho vermelho discreto no topo */}
        <div aria-hidden="true" className="bg-dot-grid-light pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[520px] w-[min(1100px,140%)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(224,32,32,0.16),transparent)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-40 -z-10 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(92,110,255,0.10),transparent)]" />

        <div className="container-gam section-y">
          <SectionHeading
            tone="dark"
            kicker="Portfólio"
            title="Resultados que dá pra medir"
            description="Um recorte do que entregamos em sites, campanhas, marcas e redes sociais, com o resultado que mais importou para cada cliente."
          />

          <Reveal delay={0.1} className="mt-12 flex items-center justify-between gap-6 md:mt-16">
            <FilterTabs active={active} onChange={setActive} counts={counts} />
            <p className="sr-only shrink-0 font-mono text-[0.8rem] text-mist-2 md:not-sr-only" aria-live="polite">
              {String(visible.length).padStart(2, '0')} / {String(HOME_CASES.length).padStart(2, '0')} projetos
            </p>
          </Reveal>

          {/* Troca de filtro em crossfade (sem animação de layout): os cards mudam
              de tamanho entre filtros e escalar o conteúdo causaria distorção. */}
          <div ref={gridRef} className="mt-6 md:mt-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3"
                initial="hidden"
                animate={inView ? 'show' : 'hidden'}
                exit={{ opacity: 0, transition: { duration: 0.18, ease: 'easeOut' } }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
              >
                {visible.map((item, idx) => {
                  const { variant, lgSpan, mdSpan2 } = layoutFor(idx, visible.length)
                  return (
                    <motion.div
                      key={item.id}
                      className={cn(mdSpan2 && 'md:col-span-2', lgSpan, mdSpan2 && !lgSpan && 'lg:col-span-1')}
                      variants={{
                        hidden: { opacity: 0, y: 28 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
                      }}
                    >
                      <CaseCard item={item} variant={variant} mdSpan2={mdSpan2} accent={idx === 0} stretch={idx === 1} />
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <Reveal className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-night-line pt-8 md:mt-16 md:flex-row md:items-center">
            <p className="max-w-[46ch] text-mist-2">
              Uma seleção de mais de <span className="font-semibold text-mist">120 projetos</span> entregues desde 2020, no Brasil, nos Estados Unidos e na Europa.
            </p>
            <Button href="/portfolio" variant="outline-light">Ver portfólio completo</Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
