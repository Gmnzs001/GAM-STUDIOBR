'use client'

import { motion, type Variants } from 'framer-motion'
import { Fragment, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Reveal (bloco) ───────────────────────────────────────────────────────────
/**
 * Entrada suave de um bloco ao entrar na viewport (fade + leve subida).
 * Use `play` para controlar manualmente (ex.: Hero esperando a intro).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.9,
  play,
  as = 'div',
  amount = 0.2,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  duration?: number
  play?: boolean
  as?: 'div' | 'section' | 'li' | 'span' | 'p' | 'article' | 'header'
  amount?: number
}) {
  const M = motion[as] as typeof motion.div
  const controlled = play !== undefined
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      {...(controlled
        ? { animate: play ? { opacity: 1, y: 0 } : { opacity: 0, y } }
        : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount } })}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </M>
  )
}

// ─── RevealText (título com máscara por palavra) ─────────────────────────────
const wordVariants: Variants = {
  hidden: { y: '115%', rotate: 4 },
  show: (i: number) => ({
    y: '0%',
    rotate: 0,
    transition: { duration: 1, ease: EASE, delay: i * 0.055 },
  }),
}

/**
 * Título que entra palavra por palavra, cada uma subindo de dentro de uma máscara.
 * `lines` força quebras de linha; `text` deixa o navegador quebrar.
 * `dot` acrescenta o ponto vermelho da GAM no fim.
 */
export function RevealText({
  text,
  lines,
  as: Tag = 'h2',
  className,
  dot = false,
  play,
  delay = 0,
  amount = 0.4,
}: {
  text?: string
  lines?: string[]
  as?: ElementType
  className?: string
  dot?: boolean
  play?: boolean
  delay?: number
  amount?: number
}) {
  const rows = lines ?? [text ?? '']
  const label = rows.join(' ')
  const controlled = play !== undefined
  let idx = 0
  const base = Math.round(delay / 0.055)

  return (
    <Tag className={cn(className)} aria-label={label}>
      <motion.span
        aria-hidden="true"
        className="block"
        initial="hidden"
        {...(controlled
          ? { animate: play ? 'show' : 'hidden' }
          : { whileInView: 'show', viewport: { once: true, amount } })}
      >
        {rows.map((row, r) => {
          const words = row.split(' ').filter(Boolean)
          return (
            <span key={r} className={cn(lines ? 'block' : 'inline')}>
              {words.map((w, wi) => {
                const isLast = r === rows.length - 1 && wi === words.length - 1
                const i = base + idx++
                return (
                  <Fragment key={wi}>
                    <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
                      <motion.span className="inline-block origin-bottom-left" custom={i} variants={wordVariants}>
                        {w}
                        {isLast && dot && <span className="gam-dot">.</span>}
                      </motion.span>
                    </span>
                    {wi < words.length - 1 && ' '}
                  </Fragment>
                )
              })}
              {!lines && r < rows.length - 1 && ' '}
            </span>
          )
        })}
      </motion.span>
    </Tag>
  )
}
