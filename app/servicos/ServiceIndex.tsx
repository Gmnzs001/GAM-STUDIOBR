'use client'

import { useState, type MouseEvent, type PointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowDownRight, Check } from 'lucide-react'
import SectionHeading from '@/components/system/SectionHeading'
import { Reveal } from '@/components/system/Reveal'
import { SERVICES } from '@/lib/site'
import { scrollToService } from './scroll'

const PREVIEW_W = 320

/**
 * Índice interativo: linhas grandes com preenchimento vermelho no hover e,
 * no desktop, um card de prévia que acompanha o cursor.
 * Clicar rola até o painel detalhado do serviço.
 */
export default function ServiceIndex() {
  const [active, setActive] = useState<number | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 320, damping: 32, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 320, damping: 32, mass: 0.6 })

  const onMove = (e: PointerEvent<HTMLOListElement>) => {
    if (e.pointerType !== 'mouse' || window.innerWidth < 1024) return
    const right = e.clientX + 76
    const fitsRight = right + PREVIEW_W < window.innerWidth - 16
    const nx = fitsRight ? right : e.clientX - 76 - PREVIEW_W
    const ny = Math.min(Math.max(e.clientY - 120, 88), window.innerHeight - 300)
    // primeiro movimento: posiciona sem animar de (0,0)
    if (active === null) {
      sx.jump(nx)
      sy.jump(ny)
    }
    x.set(nx)
    y.set(ny)
  }

  const go = (e: MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    scrollToService(slug)
  }

  const current = active !== null ? SERVICES[active] : null

  return (
    <section aria-labelledby="indice-servicos" className="relative pb-[var(--section-y)] pt-8 md:pt-12">
      <div className="container-gam">
        <SectionHeading
          kicker="Visão geral"
          title="Escolha por onde começar"
          description="Doze frentes integradas, um só time. Clique em um serviço para ver o que está incluso e pedir um orçamento."
        />
        <span id="indice-servicos" className="sr-only">Índice de serviços</span>

        <ol
          className="mt-14 border-t border-line md:mt-20"
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
        >
          {SERVICES.map((s, i) => {
            const Icon = s.icon
            return (
              <Reveal as="li" key={s.slug} delay={Math.min(i, 6) * 0.04} y={20} amount={0.3}>
                <a
                  href={`#${s.slug}`}
                  onClick={(e) => go(e, s.slug)}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse') setActive(i)
                  }}
                  onFocus={() => setActive(null)}
                  data-cursor="Ver"
                  className={[
                    'group/row relative isolate grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 overflow-hidden border-b border-line px-1 py-6 outline-none md:grid-cols-[3.5rem_minmax(0,1fr)_auto] md:px-5 md:py-7',
                    'lg:grid-cols-[4rem_minmax(0,1.15fr)_minmax(0,1fr)_auto] lg:gap-x-8',
                    'before:absolute before:inset-0 before:-z-10 before:translate-y-[calc(100%+2px)] before:bg-red before:content-[""]',
                    'before:transition-transform before:duration-[650ms] before:ease-[var(--ease-out-expo)]',
                    'hover:before:translate-y-0 focus-visible:before:translate-y-0',
                  ].join(' ')}
                >
                  <span className="self-start pt-[0.55em] font-mono text-xs tabular-nums text-ink-3 transition-colors duration-500 group-hover/row:text-white/75 group-focus-visible/row:text-white/75 lg:self-center lg:pt-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold leading-[1.02] tracking-[-0.035em] text-ink transition-[color,translate] duration-500 ease-[var(--ease-out-expo)] group-hover/row:translate-x-2 group-hover/row:text-white group-focus-visible/row:text-white">
                    {s.name}
                  </span>

                  <span className="col-start-2 row-start-2 max-w-[44ch] text-[0.95rem] leading-relaxed text-ink-2 transition-colors duration-500 group-hover/row:text-white/85 group-focus-visible/row:text-white/85 lg:col-start-3 lg:row-start-1">
                    {s.short}
                  </span>

                  <span className="relative col-start-3 row-span-2 row-start-1 grid size-12 place-items-center self-center rounded-full bg-surface text-ink ring-1 ring-line transition-[background-color,color,box-shadow] duration-500 group-hover/row:bg-white group-hover/row:text-red group-hover/row:ring-white group-focus-visible/row:bg-white group-focus-visible/row:text-red md:size-14 lg:col-start-4 lg:row-span-1">
                    <Icon className="size-5 transition-[opacity,scale] duration-300 group-hover/row:scale-50 group-hover/row:opacity-0" strokeWidth={1.8} aria-hidden="true" />
                    <ArrowDownRight className="absolute size-5 scale-50 opacity-0 transition-[opacity,scale] duration-300 group-hover/row:scale-100 group-hover/row:opacity-100" strokeWidth={2.2} aria-hidden="true" />
                  </span>
                </a>
              </Reveal>
            )
          })}
        </ol>
      </div>

      {/* Prévia flutuante (desktop, mouse) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
        style={{ x: sx, y: sy, width: PREVIEW_W }}
      >
        <AnimatePresence>
          {current && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 3 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="origin-top-left overflow-hidden rounded-[20px] bg-surface shadow-[var(--shadow-lift)] ring-1 ring-line"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={current.slug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="bg-dot-grid-light relative flex h-28 items-end justify-between overflow-hidden bg-night px-5 pb-4">
                    <span className="font-mono text-xs tabular-nums text-mist-2">
                      {String((active ?? 0) + 1).padStart(2, '0')} / {SERVICES.length}
                    </span>
                    <current.icon className="absolute -right-4 -top-4 size-32 text-white/[0.06]" strokeWidth={1.2} aria-hidden="true" />
                    <span className="relative grid size-11 place-items-center rounded-2xl bg-red text-white">
                      <current.icon className="size-5" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="font-display text-[1.25rem] font-semibold leading-tight tracking-[-0.02em] text-ink">
                      {current.tagline}
                    </p>
                    <ul className="mt-3.5 space-y-2">
                      {current.includes.slice(0, 2).map((inc) => (
                        <li key={inc} className="flex gap-2 text-[0.8125rem] leading-snug text-ink-2">
                          <Check className="mt-[1px] size-3.5 shrink-0 text-red" strokeWidth={2.6} aria-hidden="true" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 border-t border-line pt-3 text-xs font-medium text-ink-3">
                      +{current.includes.length - 2} entregas no detalhe
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
