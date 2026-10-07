'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { RevealText, Reveal } from './Reveal'

/**
 * Rótulo da seção: ponto vermelho + texto + linha que se desenha.
 * É a "assinatura" de cada seção (equivalente ao `// KICKER` da referência).
 */
export function Kicker({
  children,
  tone = 'light',
  className,
}: {
  children: ReactNode
  /** light = fundo claro · dark = bandas `night` · red = bandas vermelhas */
  tone?: 'light' | 'dark' | 'red'
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className={cn('pulse-dot shrink-0', tone === 'red' && 'pulse-dot-white')} aria-hidden="true" />
      <span className={cn('type-label', tone === 'dark' ? 'text-mist' : tone === 'red' ? 'text-white' : 'text-ink')}>{children}</span>
      <motion.span
        aria-hidden="true"
        className={cn('h-px w-16 origin-left', tone === 'dark' ? 'bg-night-line' : tone === 'red' ? 'bg-white/40' : 'bg-line-2')}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />
    </div>
  )
}

/**
 * Cabeçalho padrão de seção: kicker + título grande (com ponto vermelho) +
 * descrição/ação opcional alinhada à direita no desktop.
 */
export default function SectionHeading({
  kicker,
  title,
  lines,
  description,
  aside,
  tone = 'light',
  dot = true,
  as = 'h2',
  className,
  titleClassName,
}: {
  kicker: string
  title?: string
  lines?: string[]
  description?: ReactNode
  aside?: ReactNode
  tone?: 'light' | 'dark'
  dot?: boolean
  as?: 'h1' | 'h2'
  className?: string
  titleClassName?: string
}) {
  const dark = tone === 'dark'
  return (
    <div className={cn('grid gap-8 lg:grid-cols-12 lg:items-end', className)}>
      <div className="lg:col-span-8">
        <Kicker tone={tone} className="mb-6 md:mb-8">{kicker}</Kicker>
        <RevealText
          as={as}
          text={title}
          lines={lines}
          dot={dot}
          className={cn('type-display max-w-[16ch]', dark ? 'text-mist' : 'text-ink', titleClassName)}
        />
      </div>
      {(description || aside) && (
        <Reveal delay={0.2} className="lg:col-span-4 lg:pb-2">
          {description && (
            <p className={cn('type-lead max-w-[42ch]', dark ? 'text-mist-2' : 'text-ink-2')}>{description}</p>
          )}
          {aside && <div className={cn(description && 'mt-6')}>{aside}</div>}
        </Reveal>
      )}
    </div>
  )
}
