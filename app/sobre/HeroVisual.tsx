'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FOUNDED_YEAR } from '@/lib/site'

// Coordenadas no viewBox 500×400 (o card tem a mesma proporção 5/4,
// então as etiquetas em % ficam alinhadas aos pontos do SVG).
const GYN = { x: 232, y: 292 }
const USA = { x: 104, y: 150 }
const EUR = { x: 392, y: 128 }

const ROUTES = [
  { id: 'gyn-usa', d: `M${GYN.x} ${GYN.y} Q140 240 ${USA.x} ${USA.y}`, dur: '3.4s' },
  { id: 'gyn-eur', d: `M${GYN.x} ${GYN.y} Q330 190 ${EUR.x} ${EUR.y}`, dur: '3.9s' },
]
const BRIDGE = `M${USA.x} ${USA.y} Q248 40 ${EUR.x} ${EUR.y}`

const pct = (v: number, total: number) => `${(v / total) * 100}%`

const PIN_POS = {
  top: 'bottom-4 left-1/2 -translate-x-1/2 text-center sm:bottom-5',
  right: 'left-4 top-1/2 -translate-y-1/2 sm:left-5',
  left: 'right-4 top-1/2 -translate-y-1/2 text-right sm:right-5',
} as const

function Pin({ x, y, label, sub, align }: { x: number; y: number; label: string; sub: string; align: keyof typeof PIN_POS }) {
  return (
    <div
      className="absolute"
      style={{ left: pct(x, 500), top: pct(y, 400) }}
    >
      <div className={`absolute w-max ${PIN_POS[align]}`}>
        <div className="rounded-xl bg-surface px-2.5 py-1 shadow-[var(--shadow-soft)] ring-1 ring-line sm:px-3 sm:py-1.5">
          <p className="text-[0.75rem] font-semibold leading-tight text-ink sm:text-[0.8rem]">{label}</p>
          <p className="hidden text-[0.72rem] leading-tight text-ink-2 sm:block">{sub}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Composição do topo de /sobre: um "mapa" abstrato (grade de pontos) com as
 * rotas que saem de Goiânia para os Estados Unidos e a Europa.
 */
export default function HeroVisual() {
  const reduce = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)

  // Pausa as animações SMIL (pontos viajando, pulso) fora da tela ou com a aba oculta.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || reduce) return
    let inView = true
    const sync = () => {
      if (inView && !document.hidden) svg.unpauseAnimations()
      else svg.pauseAnimations()
    }
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      sync()
    })
    io.observe(svg)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [reduce])

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] bg-surface/85 shadow-[var(--shadow-lift)] ring-1 ring-line">
        <div aria-hidden="true" className="absolute inset-0 bg-dot-grid opacity-90" />
        <div aria-hidden="true" className="absolute -left-16 -top-20 size-72 rounded-full bg-red/10 blur-3xl" />

        <svg ref={svgRef} viewBox="0 0 500 400" className="absolute inset-0 size-full" aria-hidden="true">
          {/* ponte USA ↔ Europa */}
          <motion.path
            d={BRIDGE}
            fill="none"
            stroke="var(--color-line-2)"
            strokeWidth={1.5}
            strokeDasharray="4 7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.4 }}
          />
          {ROUTES.map((r, i) => (
            <g key={r.id}>
              <motion.path
                id={r.id}
                d={r.d}
                fill="none"
                stroke="var(--color-red)"
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 + i * 0.25 }}
              />
              {!reduce && (
                <circle r={4} fill="var(--color-red)">
                  <animateMotion dur={r.dur} repeatCount="indefinite" path={r.d} begin={`${2 + i * 0.6}s`} />
                </circle>
              )}
            </g>
          ))}

          {/* pontos */}
          {[USA, EUR].map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={9} fill="var(--color-surface)" stroke="var(--color-line-2)" strokeWidth={1.5} />
              <circle cx={p.x} cy={p.y} r={4} fill="var(--color-ink)" />
            </g>
          ))}
          <circle cx={GYN.x} cy={GYN.y} r={22} fill="var(--color-red)" opacity={0.12}>
            {!reduce && <animate attributeName="r" values="14;30;14" dur="2.8s" repeatCount="indefinite" />}
            {!reduce && <animate attributeName="opacity" values="0.22;0;0.22" dur="2.8s" repeatCount="indefinite" />}
          </circle>
          <circle cx={GYN.x} cy={GYN.y} r={10} fill="var(--color-red)" />
          <circle cx={GYN.x} cy={GYN.y} r={3.5} fill="#fff" />
        </svg>

        <Pin x={USA.x} y={USA.y} label="Estados Unidos" sub="USA" align="top" />
        <Pin x={EUR.x} y={EUR.y} label="Europa" sub="EUR" align="top" />
        <Pin x={GYN.x} y={GYN.y} label="Goiânia" sub="Onde tudo começou" align="right" />

        <p className="absolute left-5 top-5 type-label text-ink-2 md:left-7 md:top-6">Onde atuamos</p>

        <div className="absolute bottom-5 left-5 md:bottom-7 md:left-7">
          <p className="text-sm text-ink-2">Desde</p>
          <p className="type-num text-[clamp(2.75rem,5vw,4rem)] text-ink">
            {FOUNDED_YEAR}
            <span className="gam-dot">.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
