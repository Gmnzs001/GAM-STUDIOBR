'use client'

import { Marquee } from '@/components/Marquee'
import { cn } from '@/lib/utils'

/**
 * Faixa inclinada com texto correndo (como a da referência), em duas faixas
 * que se cruzam: uma vermelha por cima e uma tinta/branca por baixo, em sentidos opostos.
 */
export default function MarqueeBand({
  items,
  className,
}: {
  items: string[]
  className?: string
}) {
  return (
    <div
      className={cn('relative isolate overflow-hidden py-14 md:py-20', className)}
      aria-label={items.join(', ')}
      role="region"
    >
      {/* faixa de trás */}
      <div className="absolute left-1/2 top-1/2 w-[120vw] -translate-x-1/2 -translate-y-1/2 rotate-[2.2deg] bg-ink py-3 md:py-4">
        <Band items={items} reverse tone="ink" />
      </div>
      {/* faixa da frente */}
      <div className="relative left-1/2 w-[120vw] -translate-x-1/2 -rotate-[2.2deg] bg-red py-3 shadow-[0_18px_40px_-18px_rgba(224,32,32,0.6)] md:py-4">
        <Band items={items} tone="red" />
      </div>
    </div>
  )
}

function Band({ items, reverse, tone }: { items: string[]; reverse?: boolean; tone: 'red' | 'ink' }) {
  return (
    <Marquee
      reverse={reverse}
      repeat={4}
      ariaRole="presentation"
      className="[--duration:46s] [--gap:0px] p-0"
      tabIndex={-1}
    >
      {items.map((s) => (
        <span key={s} className="flex items-center" aria-hidden="true">
          <span
            className={cn(
              'whitespace-nowrap px-6 font-display text-[clamp(1.25rem,2.6vw,2.1rem)] font-bold tracking-[-0.03em] md:px-8',
              tone === 'red' ? 'text-white' : 'text-white/85',
            )}
          >
            {s}
          </span>
          <span className={cn('text-lg md:text-xl', tone === 'red' ? 'text-white/70' : 'text-red')}>✦</span>
        </span>
      ))}
    </Marquee>
  )
}
