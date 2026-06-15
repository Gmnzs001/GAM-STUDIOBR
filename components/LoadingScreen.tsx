'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    gsap.set(textRef.current, { opacity: 0, y: 24 })

    tl
      .to(textRef.current, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' })
      .to(dotRef.current, {
        opacity: 0.15,
        duration: 0.22,
        repeat: 5,
        yoyo: true,
        ease: 'power2.inOut',
      })
      .to({}, { duration: 0.15 })
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.55,
        ease: 'power2.inOut',
        onComplete,
      })

    return () => { tl.kill() }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#0A0A0A]"
    >
      <div ref={textRef} className="select-none flex items-baseline">
        <span
          className="font-black text-white leading-none tracking-tight"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)' }}
        >
          GAM
        </span>
        <span
          ref={dotRef}
          className="font-black text-[#E02020] leading-none"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)' }}
        >
          .
        </span>
      </div>
    </div>
  )
}
