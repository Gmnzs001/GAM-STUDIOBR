'use client'

import { useScroll, useSpring, motion, useReducedMotion } from 'framer-motion'

export default function ScrollProgressBar() {
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll()

  // Spring suaviza o preenchimento; reduced-motion usa spring rígida (sem delay)
  const scaleX = useSpring(scrollYProgress, {
    stiffness: prefersReduced ? 1000 : 90,
    damping:   prefersReduced ? 100  : 28,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left pointer-events-none"
      style={{ scaleX, backgroundColor: '#E02020' }}
    />
  )
}
