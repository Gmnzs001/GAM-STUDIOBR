'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { MotionConfig } from 'framer-motion'
import { setLenis, emitScrollY } from '@/lib/lenis-ref'

gsap.registerPlugin(ScrollTrigger)

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    emitScrollY(window.scrollY)

    // Reduced motion: sem smooth scroll — publica o scroll nativo
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const onNative = () => emitScrollY(window.scrollY)
      window.addEventListener('scroll', onNative, { passive: true })
      return () => window.removeEventListener('scroll', onNative)
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // em touch o scroll nativo já é suave e mais leve
      syncTouch: false,
    })

    setLenis(lenis)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const onLenisScroll = (l: Lenis) => {
      emitScrollY(l.scroll)
      ScrollTrigger.update()
    }
    lenis.on('scroll', onLenisScroll)

    return () => {
      lenis.off('scroll', onLenisScroll)
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // MotionConfig propaga o reduced-motion do sistema para todas as animações framer
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  )
}
