'use client'

import { useEffect, useRef } from 'react'
import { animate, useInView, type AnimationPlaybackControls } from 'framer-motion'

// Formatadores reaproveitados (criar Intl.NumberFormat a cada frame é caro)
const formats = new Map<number, Intl.NumberFormat>()
const numberFormat = (decimals: number) => {
  let f = formats.get(decimals)
  if (!f) {
    f = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    formats.set(decimals, f)
  }
  return f
}

/**
 * Número que conta de 0 até `value` quando entra na tela (ou quando `play` vira true).
 * Escreve direto no DOM (sem re-render por frame). Leitores de tela recebem o valor final.
 */
export default function CountUp({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.8,
  play,
  delay = 0,
  className,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  play?: boolean
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const started = useRef(false)
  const controls = useRef<AnimationPlaybackControls | null>(null)
  const go = play === undefined ? inView : play && inView

  const fmt = (n: number) => `${prefix}${numberFormat(decimals).format(n)}${suffix}`

  useEffect(() => {
    const el = ref.current
    if (!el || !go || started.current) return
    started.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = fmt(value)
      return
    }
    controls.current = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => { el.textContent = fmt(n) },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go])

  useEffect(() => () => controls.current?.stop(), [])

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true">{fmt(0)}</span>
      <span className="sr-only">{fmt(value)}</span>
    </span>
  )
}
