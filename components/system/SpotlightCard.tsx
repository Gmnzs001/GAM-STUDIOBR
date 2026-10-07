'use client'

import { useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Card com "lanterna" que segue o mouse (radial-gradient em --mx/--my)
 * e inclinação 3D opcional. O brilho é desenhado por um ::before, então
 * o conteúdo do card fica livre.
 *
 * Performance: o retângulo do card é medido uma vez no pointerenter (e não a
 * cada movimento) e as escritas de estilo são agrupadas em um rAF.
 *
 *   <SpotlightCard tilt={6} glow="rgba(224,32,32,0.14)" className="rounded-[28px] bg-surface p-8">
 *     ...
 *   </SpotlightCard>
 */
export default function SpotlightCard({
  children,
  className,
  tilt = 0,
  glow = 'rgba(224,32,32,0.12)',
  size = 420,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  tilt?: number
  glow?: string
  size?: number
  as?: 'div' | 'article' | 'li'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rect = useRef<DOMRect | null>(null)
  const pending = useRef<{ x: number; y: number } | null>(null)
  const raf = useRef(0)
  const reduce = useReducedMotion()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 260, damping: 24 })
  const sry = useSpring(ry, { stiffness: 260, damping: 24 })

  const flush = () => {
    raf.current = 0
    const el = ref.current
    const r = rect.current
    const p = pending.current
    if (!el || !r || !p) return
    const x = p.x - r.left
    const y = p.y - r.top
    el.style.setProperty('--mx', `${x}px`)
    el.style.setProperty('--my', `${y}px`)
    if (tilt && !reduce) {
      rx.set(-(y / r.height - 0.5) * tilt * 2)
      ry.set((x / r.width - 0.5) * tilt * 2)
    }
  }

  const onEnter = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return
    rect.current = ref.current?.getBoundingClientRect() ?? null
  }
  const onMove = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return
    if (!rect.current) rect.current = ref.current?.getBoundingClientRect() ?? null
    pending.current = { x: e.clientX, y: e.clientY }
    if (!raf.current) raf.current = requestAnimationFrame(flush)
  }
  const onLeave = () => {
    cancelAnimationFrame(raf.current)
    raf.current = 0
    rect.current = null
    rx.set(0)
    ry.set(0)
  }

  const M = motion[as] as typeof motion.div

  return (
    <M
      ref={ref}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      // o scroll muda a posição do card — re-mede no próximo movimento
      onWheel={() => { rect.current = null }}
      style={
        tilt
          ? { rotateX: srx, rotateY: sry, transformPerspective: 900, ['--glow' as string]: glow, ['--glow-size' as string]: `${size}px` }
          : { ['--glow' as string]: glow, ['--glow-size' as string]: `${size}px` }
      }
      className={cn(
        'group/spot relative isolate overflow-hidden',
        'before:pointer-events-none before:absolute before:inset-0 before:-z-[1] before:opacity-0 before:transition-opacity before:duration-500',
        'before:bg-[radial-gradient(var(--glow-size)_circle_at_var(--mx,50%)_var(--my,50%),var(--glow),transparent_45%)]',
        'hover:before:opacity-100',
        className,
      )}
    >
      {children}
    </M>
  )
}
