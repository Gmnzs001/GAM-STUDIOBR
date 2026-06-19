'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [visible,  setVisible]  = useState(false)
  const [hovering, setHovering] = useState(false)
  const [ready,    setReady]    = useState(false)
  const readyRef = useRef(false)

  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)
  // High stiffness = very fast follow, near zero perceptible lag
  const sx = useSpring(mx, { stiffness: 700, damping: 40, mass: 0.15 })
  const sy = useSpring(my, { stiffness: 700, damping: 40, mass: 0.15 })

  useEffect(() => {
    // Touch / pen devices: skip custom cursor
    if (!window.matchMedia('(pointer: fine)').matches) return
    setVisible(true)

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
      if (!readyRef.current) { readyRef.current = true; setReady(true) }
    }

    const onEnter = () => setHovering(true)
    const onLeave = () => setHovering(false)

    const attach = () => {
      document.querySelectorAll<Element>('a, button').forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    window.addEventListener('mousemove', onMove)
    attach()

    const obs = new MutationObserver(attach)
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      obs.disconnect()
    }
  }, [mx, my])

  if (!visible) return null

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{ x: sx, y: sy, opacity: ready ? 1 : 0 }}
    >
      {/* Center wrapper — offsets the ring's own anchor to the mouse position */}
      <div className="-translate-x-1/2 -translate-y-1/2">
        {/* Ring: expands and fills red on hover */}
        <motion.div
          className="rounded-full border-[1.5px] border-[#E02020]"
          animate={{
            width:           hovering ? 40 : 20,
            height:          hovering ? 40 : 20,
            backgroundColor: hovering ? 'rgba(224,32,32,0.10)' : 'rgba(224,32,32,0)',
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
        {/* Center dot: hides when hovering (ring takes over) */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E02020]"
          animate={{
            width:   hovering ? 0  : 4,
            height:  hovering ? 0  : 4,
            opacity: hovering ? 0  : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />
      </div>
    </motion.div>
  )
}
