'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Kicker } from './SectionHeading'
import { RevealText, Reveal } from './Reveal'

/**
 * Topo padrão das páginas internas (/servicos, /portfolio, /sobre, /contato).
 *
 *   <PageHero
 *     kicker="O que fazemos"
 *     lines={['Nossos', 'serviços']}
 *     description="12 frentes integradas..."
 *     visual={<AlgoVisual />}       // opcional: coluna direita (desktop) / abaixo (mobile)
 *   >
 *     <div>chips, stats, CTAs...</div>   // opcional: linha inferior
 *   </PageHero>
 */
export default function PageHero({
  kicker,
  lines,
  description,
  visual,
  children,
  className,
}: {
  kicker: string
  lines: string[]
  description?: ReactNode
  visual?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <section className={cn('relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44', className)}>
      <div className="container-gam">
        <div className={cn('grid items-end gap-12', visual && 'lg:grid-cols-12')}>
          <div className={cn(visual && 'lg:col-span-7')}>
            <Kicker className="mb-8">{kicker}</Kicker>
            <RevealText
              as="h1"
              lines={lines}
              dot
              className="font-display text-[clamp(3rem,8.4vw,8rem)] font-extrabold leading-[0.92] tracking-[-0.04em] text-ink"
            />
            {description && (
              <Reveal delay={0.35}>
                <p className="type-lead mt-8 max-w-[52ch] text-ink-2">{description}</p>
              </Reveal>
            )}
          </div>
          {visual && (
            <Reveal delay={0.25} className="lg:col-span-5">
              {visual}
            </Reveal>
          )}
        </div>
        {children && (
          <Reveal delay={0.5} className="mt-12 md:mt-16">
            {children}
          </Reveal>
        )}
      </div>
    </section>
  )
}
