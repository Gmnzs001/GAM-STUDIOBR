'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
  maxAngle?: number
  perspective?: number
}

export default function TiltCard({
  children,
  className,
  maxAngle = 7,
  perspective = 900,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const rx  = useMotionValue(0)
  const ry  = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 320, damping: 28 })
  const sry = useSpring(ry, { stiffness: 320, damping: 28 })

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r  = el.getBoundingClientRect()
    const nx = (e.clientX - r.left)  / r.width  - 0.5   // -0.5 → 0.5
    const ny = (e.clientY - r.top)   / r.height - 0.5
    rx.set(-ny * maxAngle * 2)
    ry.set( nx * maxAngle * 2)
  }

  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformStyle: 'preserve-3d',
        transformPerspective: perspective,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
