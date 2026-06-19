'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

// ── Star type (space background) ──────────────────────────────────────────────
type Star = {
  x: number; y: number; vx: number; vy: number
  size: number; baseOpacity: number; isRed: boolean
  phase: number; phaseSpeed: number; depth: number
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number | undefined>(undefined)
  const starsRef  = useRef<Star[]>([])
  const mouseRef  = useRef({ x: 0, y: 0 })
  const doneRef   = useRef(false)

  // text: visible = blur(0)+opacity(1)+translateY(0). hidden = blur(16px)+opacity(0)+translateY(22px)
  const [textIn,  setTextIn]  = useState(false)
  // logo: visible = blur(0)+opacity(1). hidden = blur(20px)+opacity(0)
  const [logoIn,  setLogoIn]  = useState(false)

  // ── Conclude (smooth fade out) ────────────────────────────────────────────
  const conclude = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    const el = wrapRef.current
    if (!el) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      onComplete()
      return
    }
    el.style.transition = 'opacity 0.5s ease'
    el.style.opacity    = '0'
    setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      onComplete()
    }, 530)
  }, [onComplete])

  // ── Stars canvas ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!
    const dpr    = Math.min(window.devicePixelRatio || 1, 3)
    let cssW = 0, cssH = 0
    let cancelled = false
    let resizeTimer: ReturnType<typeof setTimeout>

    const setCssSize = (w: number, h: number) => {
      cssW = w; cssH = h
      canvas.width        = Math.round(w * dpr)
      canvas.height       = Math.round(h * dpr)
      canvas.style.width  = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const initStars = (w: number, h: number) => {
      const count = w < 768 ? 70 : 160
      const out: Star[] = []
      for (let i = 0; i < count; i++) {
        const depth = Math.random()
        out.push({
          x:           Math.random() * w,
          y:           Math.random() * h,
          vx:          (Math.random() - 0.5) * 0.06,
          vy:          (Math.random() - 0.5) * 0.06,
          size:        0.5 + depth * 1.8,
          baseOpacity: 0.08 + depth * 0.27,
          isRed:       Math.random() < 0.07,
          phase:       Math.random() * Math.PI * 2,
          phaseSpeed:  0.00018 + Math.random() * 0.0007,
          depth,
        })
      }
      starsRef.current = out
    }

    const animate = (ts: number) => {
      ctx.fillStyle = 'rgba(10,10,10,0.28)'
      ctx.fillRect(0, 0, cssW, cssH)

      const mx = mouseRef.current.x / cssW - 0.5
      const my = mouseRef.current.y / cssH - 0.5
      ctx.save()
      for (const s of starsRef.current) {
        s.x = (s.x + s.vx + cssW) % cssW
        s.y = (s.y + s.vy + cssH) % cssH
        const tw = (Math.sin(ts * s.phaseSpeed + s.phase) + 1) * 0.5
        ctx.globalAlpha = s.baseOpacity * (0.5 + tw * 0.5)
        ctx.fillStyle   = s.isRed ? 'rgb(224,32,32)' : 'rgb(255,255,255)'
        const h = s.size
        ctx.fillRect(
          s.x + mx * s.depth * 24 - h * 0.5,
          s.y + my * s.depth * 24 - h * 0.5,
          h, h,
        )
      }
      ctx.restore()

      rafRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (cancelled) return
        setCssSize(window.innerWidth, window.innerHeight)
        initStars(cssW, cssH)
      }, 150)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    setCssSize(window.innerWidth, window.innerHeight)
    initStars(cssW, cssH)
    rafRef.current = requestAnimationFrame(animate)
    window.addEventListener('resize',    handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelled = true
      clearTimeout(resizeTimer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize',    handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // ── Phase timeline ────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const t = setTimeout(conclude, 400)
      return () => clearTimeout(t)
    }

    // 80ms   — text fades in  (1s transition → fully visible ~1.1s)
    // 3 200ms — text fades out (1s transition)
    // 3 700ms — logo fades in  (0.8s transition, cross-fades with text exit)
    // 6 200ms — conclude → dissolve to Hero
    const t1 = setTimeout(() => setTextIn(true),   80)
    const t2 = setTimeout(() => setTextIn(false),   3200)
    const t3 = setTimeout(() => setLogoIn(true),    3700)
    const t4 = setTimeout(conclude,                  6200)

    window.addEventListener('keydown', conclude, { once: true })

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4)
      window.removeEventListener('keydown', conclude)
    }
  }, [conclude])

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[9998] bg-[#0A0A0A] select-none group cursor-pointer"
      onClick={conclude}
    >
      {/* Space particle background */}
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* ── Phase 1: Welcome text ── */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center pointer-events-none"
        style={{
          opacity:    textIn ? 1 : 0,
          filter:     textIn ? 'blur(0px)'  : 'blur(16px)',
          transform:  textIn ? 'translateY(0px)' : 'translateY(22px)',
          transition: 'opacity 1s ease, filter 1s ease, transform 1s ease',
        }}
      >
        <p
          className="text-white font-light tracking-[0.35em] uppercase"
          style={{ fontSize: 'clamp(1.1rem, 3.5vw, 2.4rem)' }}
        >
          Seja bem-vindo
        </p>
        <p
          className="text-[#9898A4] font-light tracking-[0.3em] uppercase mt-3"
          style={{ fontSize: 'clamp(0.75rem, 2vw, 1.4rem)' }}
        >
          à sua nova realidade
        </p>
      </div>

      {/* ── Phase 2: GAM. ── */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        style={{
          opacity:    logoIn ? 1 : 0,
          filter:     logoIn ? 'blur(0px)' : 'blur(20px)',
          transition: 'opacity 0.8s ease, filter 0.8s ease',
        }}
      >
        <div
          className="font-black text-white leading-none tracking-tight"
          style={{ fontSize: 'clamp(5rem, 14vw, 9rem)' }}
        >
          GAM
          <span
            className="text-[#E02020]"
            style={{ animation: 'gamDotPulse 1.4s ease-in-out infinite' }}
          >
            .
          </span>
        </div>
      </div>

      {/* Skip hint */}
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full border border-white/[0.12] group-hover:border-white/[0.28] bg-white/[0.04] group-hover:bg-white/[0.08] text-white/50 group-hover:text-white/80 text-[11px] tracking-[0.22em] uppercase pointer-events-none transition-all duration-300">
        clique ou qualquer tecla para pular
      </p>

      <style>{`
        @keyframes gamDotPulse {
          0%, 100% { opacity: 1;    filter: drop-shadow(0 0 10px rgba(224,32,32,0.9)); }
          50%       { opacity: 0.6; filter: drop-shadow(0 0  2px rgba(224,32,32,0.2)); }
        }
      `}</style>
    </div>
  )
}
