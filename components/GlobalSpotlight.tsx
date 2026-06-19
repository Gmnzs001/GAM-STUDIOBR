'use client'

import { useEffect, useRef } from 'react'

export default function GlobalSpotlight() {
  const divRef  = useRef<HTMLDivElement>(null)
  const target  = useRef({ x: 0.5, y: 0.5 })
  const current = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return   // desktop only

    const onMove = (e: MouseEvent) => {
      target.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', onMove)

    let rafId: number
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      current.current.x += (target.current.x - current.current.x) * 0.055
      current.current.y += (target.current.y - current.current.y) * 0.055
      if (divRef.current) {
        const x = (current.current.x * 100).toFixed(2)
        const y = (current.current.y * 100).toFixed(2)
        divRef.current.style.background =
          `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 30%, transparent 65%)`
      }
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={divRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
    />
  )
}
