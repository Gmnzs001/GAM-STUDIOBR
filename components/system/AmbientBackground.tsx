'use client'

import { useEffect, useRef } from 'react'

/**
 * Fundo vivo global (fixo atrás de todo o site), otimizado para fluidez:
 *  - grade de pontos ESTÁTICA em CSS (custo zero por frame)
 *  - auroras em CSS animadas só com transform (compositor/GPU, sem repintar)
 *  - um canvas que desenha APENAS os pontos "ativos": o halo vermelho em volta
 *    do cursor e os "pings" (anéis de sinal) que surgem de tempos em tempos
 *  - o loop de animação dorme quando não há nada acontecendo (cursor parado e
 *    sem ping ativo) e pausa com a aba oculta
 * Com prefers-reduced-motion fica só a grade estática + auroras paradas.
 */

const GAP_DESKTOP = 28
const GAP_MOBILE = 24
const R = 150 // raio de influência do cursor (px)

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const finePointer = window.matchMedia('(pointer: fine)').matches

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0, gap = GAP_DESKTOP, offX = 0, offY = 0
    let raf = 0
    let awake = false
    let lastMove = 0
    let nextPingAt = performance.now() + 2600

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false }
    type Ping = { x: number; y: number; r: number; life: number }
    const pings: Ping[] = []

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      gap = W < 768 ? GAP_MOBILE : GAP_DESKTOP
      // mesmo alinhamento da grade CSS (background-position: 0 0 a partir do topo/esquerda)
      offX = gap / 2
      offY = gap / 2
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const wake = () => {
      if (awake || document.hidden) return
      awake = true
      raf = requestAnimationFrame(frame)
    }

    const drawDot = (x: number, y: number, k: number) => {
      // k ∈ (0,1]: intensidade — cresce e avermelha
      const size = 1.4 + k * 2.4
      ctx.globalAlpha = Math.min(0.12 + k * 0.6, 0.85)
      ctx.fillStyle = `rgb(${Math.round(14 + 210 * k)},${Math.round(16 + 16 * k)},${Math.round(21 + 11 * k)})`
      ctx.fillRect(x - size / 2, y - size / 2, size, size)
    }

    const frame = (now: number) => {
      ctx.clearRect(0, 0, W, H)

      // ── cursor (com easing) ──
      mouse.x += (mouse.tx - mouse.x) * 0.16
      mouse.y += (mouse.ty - mouse.y) * 0.16
      const moving = Math.abs(mouse.tx - mouse.x) + Math.abs(mouse.ty - mouse.y) > 0.4

      // ── pings ──
      if (now >= nextPingAt) {
        pings.push({
          x: offX + Math.round((Math.random() * W) / gap) * gap,
          y: offY + Math.round((Math.random() * H) / gap) * gap,
          r: 0,
          life: 1,
        })
        nextPingAt = now + 3200 + Math.random() * 2800
      }

      // pontos afetados por cursor e pings (só os que estão na vizinhança)
      const touched = new Map<number, number>() // index → intensidade
      const cols = Math.ceil(W / gap) + 1
      const mark = (cx: number, cy: number, k: number) => {
        const key = cy * cols + cx
        const prev = touched.get(key)
        if (prev === undefined || k > prev) touched.set(key, k)
      }

      if (mouse.active) {
        const c0 = Math.max(0, Math.floor((mouse.x - R - offX) / gap))
        const c1 = Math.ceil((mouse.x + R - offX) / gap)
        const r0 = Math.max(0, Math.floor((mouse.y - R - offY) / gap))
        const r1 = Math.ceil((mouse.y + R - offY) / gap)
        for (let cx = c0; cx <= c1; cx++) {
          const x = offX + cx * gap
          for (let cy = r0; cy <= r1; cy++) {
            const y = offY + cy * gap
            const d = Math.hypot(x - mouse.x, y - mouse.y)
            if (d < R) mark(cx, cy, 1 - d / R)
          }
        }
      }

      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i]
        p.r += 2.4
        p.life -= 0.0075
        if (p.life <= 0) { pings.splice(i, 1); continue }
        const band = 18
        const outer = p.r + band
        const c0 = Math.max(0, Math.floor((p.x - outer - offX) / gap))
        const c1 = Math.ceil((p.x + outer - offX) / gap)
        const r0 = Math.max(0, Math.floor((p.y - outer - offY) / gap))
        const r1 = Math.ceil((p.y + outer - offY) / gap)
        for (let cx = c0; cx <= c1; cx++) {
          const x = offX + cx * gap
          for (let cy = r0; cy <= r1; cy++) {
            const y = offY + cy * gap
            const dd = Math.abs(Math.hypot(x - p.x, y - p.y) - p.r)
            if (dd < band) mark(cx, cy, (1 - dd / band) * p.life * 0.85)
          }
        }
      }

      touched.forEach((k, key) => {
        if (k < 0.03) return
        const cx = key % cols
        const cy = (key - cx) / cols
        drawDot(offX + cx * gap, offY + cy * gap, k)
      })
      ctx.globalAlpha = 1

      // dorme quando não há nada para animar (o próximo ping acorda via timer)
      const idle = !moving && pings.length === 0 && now - lastMove > 600
      if (idle) {
        awake = false
        ctx.clearRect(0, 0, W, H)
        if (mouse.active) {
          // redesenha o halo estático uma última vez para não "sumir" com o cursor parado
          touched.clear()
          const c0 = Math.max(0, Math.floor((mouse.x - R - offX) / gap))
          const c1 = Math.ceil((mouse.x + R - offX) / gap)
          const r0 = Math.max(0, Math.floor((mouse.y - R - offY) / gap))
          const r1 = Math.ceil((mouse.y + R - offY) / gap)
          for (let cx = c0; cx <= c1; cx++) {
            const x = offX + cx * gap
            for (let cy = r0; cy <= r1; cy++) {
              const y = offY + cy * gap
              const d = Math.hypot(x - mouse.x, y - mouse.y)
              if (d < R) drawDot(x, y, 1 - d / R)
            }
          }
          ctx.globalAlpha = 1
        }
        scheduleNextPing()
        return
      }
      raf = requestAnimationFrame(frame)
    }

    let pingTimer: ReturnType<typeof setTimeout> | undefined
    const scheduleNextPing = () => {
      clearTimeout(pingTimer)
      pingTimer = setTimeout(wake, Math.max(0, nextPingAt - performance.now()))
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mouse.tx = e.clientX
      mouse.ty = e.clientY
      if (!mouse.active) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true }
      lastMove = performance.now()
      wake()
    }
    const onLeave = () => {
      mouse.active = false
      lastMove = performance.now()
      wake()
    }
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        clearTimeout(pingTimer)
        awake = false
      } else {
        nextPingAt = performance.now() + 1500
        wake()
      }
    }
    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => { resize(); wake() }, 120)
    }

    resize()
    wake()
    if (finePointer) {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
    }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(pingTimer)
      clearTimeout(resizeTimer)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div aria-hidden="true" className="gam-ambient pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="gam-aurora gam-aurora-1" />
      <div className="gam-aurora gam-aurora-2" />
      <div className="gam-aurora gam-aurora-3" />
      <div className="gam-dots absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="gam-grain" />
    </div>
  )
}
