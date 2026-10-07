'use client'

import { useEffect, useRef } from 'react'
import { onScrollY } from '@/lib/lenis-ref'

/**
 * Barra fina de progresso de leitura no topo.
 * Usa a posição publicada pelo Lenis (sem ler layout no scroll) e escreve
 * direto no transform — o Lenis já suaviza o movimento.
 */
export default function ScrollProgressBar() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let max = 1
    let y = window.scrollY

    const paint = () => {
      el.style.transform = `scaleX(${Math.min(1, Math.max(0, y / max))})`
    }
    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      paint()
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    const off = onScrollY((v) => { y = v; paint() })

    return () => {
      off()
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px] origin-left bg-red"
      style={{ transform: 'scaleX(0)' }}
    />
  )
}
