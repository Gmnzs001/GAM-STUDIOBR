'use client'

import { ArrowUpRight } from 'lucide-react'
import CaseCover, { trackCoverPointer, resetCoverPointer } from '@/components/CaseCover'
import type { CaseCategory } from '@/lib/site'
import { HOME_CASES } from '@/lib/site'
import { cn } from '@/lib/utils'

type Slot = {
  category: CaseCategory
  seed: number
  tone: 'light' | 'dark'
  pos: string
  rotate: number
  shift: [number, number]
  float: string
}

// Leque de capas: duas claras atrás, uma escura na frente.
const SLOTS: Slot[] = [
  { category: 'Branding', seed: 6, tone: 'light', pos: 'left-0 top-[6%] w-[62%]', rotate: -9, shift: [-10, -6], float: '-1.2s' },
  { category: 'Social Media', seed: 5, tone: 'light', pos: 'right-0 top-0 w-[58%]', rotate: 7, shift: [12, -8], float: '-3.4s' },
  { category: 'Marketing', seed: 3, tone: 'dark', pos: 'left-[16%] bottom-0 w-[70%]', rotate: -2, shift: [22, 14], float: '-0.4s' },
]

/** Visual do topo do /portfolio: capas generativas em leque com parallax no ponteiro. */
export default function HeroCovers() {
  const highlight = HOME_CASES[0]
  return (
    <div
      aria-hidden="true"
      onPointerMove={trackCoverPointer}
      onPointerLeave={resetCoverPointer}
      className="relative mx-auto aspect-[6/5] w-full max-w-[560px] lg:mr-0"
    >
      {SLOTS.map((s, i) => (
        <div
          key={i}
          className={cn('absolute', s.pos)}
          style={{
            transform: `translate3d(calc(var(--tx, 0) * ${s.shift[0]}px), calc(var(--ty, 0) * ${s.shift[1]}px), 0) rotate(${s.rotate}deg)`,
            transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div
            className="animate-[gam-float_8s_ease-in-out_infinite] rounded-[24px] bg-surface p-1.5 shadow-[var(--shadow-lift)] ring-1 ring-line motion-reduce:animate-none"
            style={{ animationDelay: s.float }}
          >
            <CaseCover category={s.category} seed={s.seed} tone={s.tone} depth={0.8} className="aspect-[16/10] rounded-[19px]" />
          </div>
        </div>
      ))}

      {/* selo com um resultado real */}
      <div
        className="absolute -left-2 bottom-[18%] z-10 sm:-left-6"
        style={{
          transform: 'translate3d(calc(var(--tx, 0) * 30px), calc(var(--ty, 0) * 20px), 0)',
          transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 shadow-[var(--shadow-lift)] ring-1 ring-line">
          <span className="grid size-10 place-items-center rounded-full bg-red text-white">
            <ArrowUpRight className="size-5" strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="flex items-baseline gap-1.5">
              <span className="type-num text-[1.35rem] text-ink">{highlight.metric.value}</span>
              <span className="text-[0.8rem] font-semibold text-ink">{highlight.metric.label}</span>
            </span>
            <span className="block text-[0.78rem] text-ink-2">{highlight.title}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
