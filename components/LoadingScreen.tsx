'use client'

import { useEffect, useRef, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type RGB    = { r: number; g: number; b: number }
type Target = { x: number; y: number; color: RGB }

// ── Particle ──────────────────────────────────────────────────────────────────
class Particle {
  pos = { x: 0, y: 0 }
  vel = { x: 0, y: 0 }
  acc = { x: 0, y: 0 }
  target      = { x: 0, y: 0 }
  maxSpeed    = 5
  maxForce    = 0.08
  isKilled    = false
  startColor: RGB  = { r: 0,   g: 0,   b: 0   }
  targetColor: RGB = { r: 255, g: 255, b: 255 }
  colorWeight      = 0
  colorBlendRate   = 0.012
  drawSize         = 1.5   // set per-particle at applyTargets time

  lerpColor(): RGB {
    const w = this.colorWeight
    return {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * w),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * w),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * w),
    }
  }

  move() {
    const dx = this.target.x - this.pos.x
    const dy = this.target.y - this.pos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const prox = dist < 80 ? dist / 80 : 1
    const mag  = dist || 1
    const desiredX = (dx / mag) * this.maxSpeed * prox
    const desiredY = (dy / mag) * this.maxSpeed * prox
    const steerX   = desiredX - this.vel.x
    const steerY   = desiredY - this.vel.y
    const steerLen = Math.sqrt(steerX * steerX + steerY * steerY)
    if (steerLen > 0) {
      this.acc.x += (steerX / steerLen) * this.maxForce
      this.acc.y += (steerY / steerLen) * this.maxForce
    }
    this.vel.x += this.acc.x; this.vel.y += this.acc.y
    this.pos.x += this.vel.x; this.pos.y += this.vel.y
    this.acc.x = 0; this.acc.y = 0
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1)
    const { r, g, b } = this.lerpColor()
    ctx.fillStyle = `rgb(${r},${g},${b})`
    const s = this.drawSize
    ctx.fillRect(this.pos.x - s / 2, this.pos.y - s / 2, s, s)
  }

  kill(w: number, h: number) {
    if (!this.isKilled) {
      const ang = Math.random() * Math.PI * 2
      this.target.x = w / 2 + Math.cos(ang) * (w + h)
      this.target.y = h / 2 + Math.sin(ang) * (w + h)
      this.startColor  = this.lerpColor()
      this.targetColor = { r: 0, g: 0, b: 0 }
      this.colorWeight = 0
      this.isKilled    = true
    }
  }
}

// ── Font sizing ───────────────────────────────────────────────────────────────
// ctx.measureText always returns CSS-pixel widths, regardless of ctx transform.
function fitFont(ctx: CanvasRenderingContext2D, text: string, maxW: number, startSize: number): string {
  let size = startSize
  ctx.font = `900 ${size}px Inter, Arial Black, sans-serif`
  while (ctx.measureText(text).width > maxW && size > 10) {
    size -= 2
    ctx.font = `900 ${size}px Inter, Arial Black, sans-serif`
  }
  return ctx.font
}

// ── Offscreen rasterise (CSS-pixel canvas, no DPR scale) ─────────────────────
// Targets produced here are in CSS-px space, which matches the DPR-scaled main ctx.
function rasterise(w: number, h: number, font: string, lines: string[]): Uint8ClampedArray {
  const off  = document.createElement('canvas')
  off.width  = w; off.height = h
  const octx = off.getContext('2d')!
  octx.font         = font
  octx.textAlign    = 'center'
  octx.textBaseline = 'middle'
  octx.fillStyle    = 'white'
  const m        = font.match(/\s(\d+)px/)
  const fontSize = m ? parseInt(m[1]) : 60
  const lineH    = fontSize * 1.3
  const startY   = h / 2 - ((lines.length - 1) * lineH) / 2
  lines.forEach((line, i) => octx.fillText(line, w / 2, startY + i * lineH))
  return octx.getImageData(0, 0, w, h).data
}

// ── Build Target[] from pixel data ────────────────────────────────────────────
function buildTargets(
  w: number, h: number,
  data: Uint8ClampedArray,
  step: number,
  colorFn: (x: number, y: number, i: number) => RGB,
  maxParticles = 16000,
): Target[] {
  const all: Target[] = []
  for (let i = 0; i < data.length; i += step * 4) {
    if (data[i + 3] > 128) {
      const x = (i / 4) % w
      const y = Math.floor((i / 4) / w)
      all.push({ x, y, color: colorFn(x, y, i) })
    }
  }
  if (all.length <= maxParticles) return all
  const out: Target[] = []
  const keep = maxParticles / all.length
  for (const t of all) if (Math.random() < keep) out.push(t)
  return out
}

// ── Text lines ────────────────────────────────────────────────────────────────
const LINES = ['SEJA BEM-VINDO', 'À SUA NOVA REALIDADE']

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const wrapRef      = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef       = useRef<number | undefined>(undefined)
  const doneRef      = useRef(false)
  const phaseRef     = useRef(1)
  const phase3TsRef  = useRef(0)
  const dotCXRef     = useRef(0)   // CSS-px glow center x
  const dotCYRef     = useRef(0)   // CSS-px glow center y
  const drawSizeRef  = useRef(1.5)
  const p1Ref        = useRef<Target[]>([])
  const p2Ref        = useRef<Target[]>([])

  const conclude = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const el = wrapRef.current
    if (!el) { onComplete(); return }
    el.style.transition = 'opacity 0.6s ease'
    el.style.opacity    = '0'
    setTimeout(onComplete, 680)
  }, [onComplete])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const t = setTimeout(onComplete, 400)
      return () => clearTimeout(t)
    }

    const canvas    = canvasRef.current!
    const ctx       = canvas.getContext('2d')!
    const particles = particlesRef.current

    // Cap DPR at 3 to avoid excessive memory on very high-density screens.
    const dpr = Math.min(window.devicePixelRatio || 1, 3)

    // cssW / cssH: CSS-pixel dimensions — single source of truth for ALL
    // logical coordinates (particle positions, font sizes, scatter, etc.).
    // canvas.width / canvas.height are physical (cssW * dpr), never read for logic.
    let cssW = 0
    let cssH = 0

    // Set physical canvas size and re-apply DPR transform.
    // Called on init and every resize. Setting canvas.width resets the ctx
    // transform to identity, so we must call setTransform again after each resize.
    const setCssSize = (w: number, h: number) => {
      cssW = w; cssH = h
      canvas.width          = Math.round(w * dpr)
      canvas.height         = Math.round(h * dpr)
      canvas.style.width    = w + 'px'
      canvas.style.height   = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)  // replaces (doesn't stack) the transform
    }

    let cancelled  = false
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    let t3: ReturnType<typeof setTimeout>
    let resizeTimer: ReturnType<typeof setTimeout>

    // ── Helpers ── all coords in CSS pixels ──────────────────────────────────
    const scatter = () => {
      const ang = Math.random() * Math.PI * 2
      const d   = Math.random() * (cssW + cssH) * 0.3 + (cssW + cssH) * 0.25
      return { x: cssW / 2 + Math.cos(ang) * d, y: cssH / 2 + Math.sin(ang) * d }
    }

    const applyTargets = (targets: Target[], speedMin: number, speedMax: number, drawSize = drawSizeRef.current) => {
      for (let i = 0; i < targets.length; i++) {
        let p: Particle
        if (i < particles.length) {
          p = particles[i]; p.isKilled = false
        } else {
          p = new Particle()
          const pos = scatter()
          p.pos.x = pos.x; p.pos.y = pos.y
          particles.push(p)
        }
        p.maxSpeed       = Math.random() * (speedMax - speedMin) + speedMin
        p.maxForce       = p.maxSpeed * 0.08
        p.colorBlendRate = Math.random() * 0.018 + 0.006
        p.startColor     = p.lerpColor()
        p.targetColor    = targets[i].color
        p.colorWeight    = 0
        p.target.x       = targets[i].x
        p.target.y       = targets[i].y
        p.drawSize       = drawSize
      }
      for (let i = targets.length; i < particles.length; i++) particles[i].kill(cssW, cssH)
    }

    const schedulePhase2 = () => {
      const phase2 = p2Ref.current
      while (particles.length < phase2.length) {
        const p = new Particle(); const pos = scatter()
        p.pos.x = pos.x; p.pos.y = pos.y; particles.push(p)
      }
      const maxLen   = Math.max(particles.length, phase2.length)
      const shuffled = Array.from({ length: maxLen }, (_, i) => i).sort(() => Math.random() - 0.5)
      const WAVES    = 6
      const waves: number[][] = Array.from({ length: WAVES }, () => [])
      shuffled.forEach((idx, i) => waves[i % WAVES].push(idx))
      waves.forEach((group, wi) => {
        setTimeout(() => {
          group.forEach(idx => {
            if (idx < phase2.length && idx < particles.length) {
              const p = particles[idx]
              p.isKilled    = false
              p.startColor  = p.lerpColor()
              p.targetColor = phase2[idx].color
              p.colorWeight = 0
              p.target.x    = phase2[idx].x
              p.target.y    = phase2[idx].y
              p.maxSpeed    = Math.random() * 3 + 3
              p.maxForce    = p.maxSpeed * 0.07
              p.drawSize    = drawSizeRef.current
            } else if (idx < particles.length) {
              particles[idx].kill(cssW, cssH)
            }
          })
        }, wi * 100)
      })
    }

    const animate = (ts: number) => {
      // fillRect in CSS-px coords — ctx is DPR-scaled so this covers the full physical canvas
      ctx.fillStyle = 'rgba(10,10,10,0.18)'
      ctx.fillRect(0, 0, cssW, cssH)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.move(); p.draw(ctx)
        // Cull particles that flew far off-screen (CSS-px bounds)
        if (p.isKilled && (p.pos.x < -cssW || p.pos.x > cssW * 2 || p.pos.y < -cssH || p.pos.y > cssH * 2)) {
          particles.splice(i, 1)
        }
      }

      // Phase 3: pulsing red glow at dot center (CSS-px coords)
      if (phaseRef.current >= 3) {
        const elapsed = ts - phase3TsRef.current
        const pulse   = (Math.sin((elapsed / 800) * Math.PI * 2) + 1) / 2
        const gR      = 20 + pulse * 20
        const alpha   = 0.25 + pulse * 0.55
        const gr      = ctx.createRadialGradient(
          dotCXRef.current, dotCYRef.current, 0,
          dotCXRef.current, dotCYRef.current, gR,
        )
        gr.addColorStop(0,   `rgba(224,32,32,${alpha})`)
        gr.addColorStop(0.4, `rgba(224,32,32,${alpha * 0.35})`)
        gr.addColorStop(1,   'rgba(224,32,32,0)')
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.beginPath()
        ctx.arc(dotCXRef.current, dotCYRef.current, gR, 0, Math.PI * 2)
        ctx.fillStyle = gr
        ctx.fill()
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    // ── Build target sets ─────────────────────────────────────────────────────
    // w, h are CSS pixels. Offscreen canvases are CSS-pixel sized (no DPR).
    // Because the main ctx is DPR-scaled, drawing at CSS-px coordinates is correct.
    // fitFont / measureText on the DPR-scaled ctx still returns CSS-px widths.
    const buildTargetSets = (w: number, h: number) => {
      const isMobile = w < 768

      // Mobile: 4 punchy short lines so the font can be 3–4× bigger.
      // Desktop: original 2 full lines.
      const MOBILE_LINES = ['SEJA', 'BEM-VINDO', 'À SUA NOVA', 'REALIDADE']
      const activeLines  = isMobile ? MOBILE_LINES : LINES

      // Step=2 on mobile (denser than desktop's 3); could go to 1 for max density
      // but 2 keeps particle count below the 16k cap while still looking solid.
      const step = isMobile ? 2 : 3

      // Auto-detect widest line at the candidate start size so we never clip.
      const wMaxW      = isMobile ? w * 0.88 : w * 0.84
      const wStartSize = isMobile ? Math.min(w * 0.22, 90) : Math.min(w * 0.088, 104)
      ctx.font = `900 ${wStartSize}px Inter, Arial Black, sans-serif`
      const refLine = activeLines.reduce((widest, line) =>
        ctx.measureText(line).width > ctx.measureText(widest).width ? line : widest,
        activeLines[0],
      )
      const wFont = fitFont(ctx, refLine, wMaxW, wStartSize)

      // Phase 1 — welcome text, all white
      const welcomeData = rasterise(w, h, wFont, activeLines)
      p1Ref.current = buildTargets(w, h, welcomeData, step, () => ({ r: 255, g: 255, b: 255 }))

      // Phase 2 — GAM. with red dot via pixel diff.
      // measureText on DPR-scaled ctx returns CSS-px width → gamdStartX is in CSS px.
      const gFont = fitFont(
        ctx, 'GAM.',
        isMobile ? w * 0.90 : w * 0.65,
        isMobile ? Math.min(w * 0.32, 200) : Math.min(w * 0.155, 180),
      )
      ctx.font = gFont
      const gamdWidth  = ctx.measureText('GAM.').width   // CSS px
      const gamdStartX = w / 2 - gamdWidth / 2           // CSS px

      // Both offscreen canvases are CSS-pixel sized so positions match exactly.
      const gamdData = rasterise(w, h, gFont, ['GAM.'])   // 'GAM.' centered

      const offGAM       = document.createElement('canvas')
      offGAM.width       = w; offGAM.height = h
      const octxGAM      = offGAM.getContext('2d')!
      octxGAM.font         = gFont
      octxGAM.textAlign    = 'left'
      octxGAM.textBaseline = 'middle'
      octxGAM.fillStyle    = 'white'
      octxGAM.fillText('GAM', gamdStartX, h / 2)   // 'GAM' at same start-x

      const gamData = octxGAM.getImageData(0, 0, w, h).data

      p2Ref.current = buildTargets(w, h, gamdData, step, (_x, _y, i) => {
        const isDot = gamData[i + 3] <= 64   // pixel in 'GAM.' but not in aligned 'GAM' → dot
        return isDot ? { r: 224, g: 32, b: 32 } : { r: 255, g: 255, b: 255 }
      })

      // Dot center = center of mass of red particles (CSS px, for the glow)
      let sx = 0, sy = 0, n = 0
      for (const t of p2Ref.current) {
        if (t.color.r === 224) { sx += t.x; sy += t.y; n++ }
      }
      dotCXRef.current = n > 0 ? sx / n : w * 0.75
      dotCYRef.current = n > 0 ? sy / n : h / 2
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (cancelled || doneRef.current) return
        setCssSize(window.innerWidth, window.innerHeight)
        drawSizeRef.current = cssW < 768 ? 2.0 : 1.5
        buildTargetSets(cssW, cssH)
        if (phaseRef.current >= 2) {
          applyTargets(p2Ref.current, 4, 8)
        } else {
          applyTargets(p1Ref.current, 5, 11)
        }
      }, 150)
    }

    // ── Init (after fonts loaded) ─────────────────────────────────────────────
    document.fonts.ready.then(() => {
      if (cancelled) return

      setCssSize(window.innerWidth, window.innerHeight)
      drawSizeRef.current = cssW < 768 ? 2.0 : 1.5

      buildTargetSets(cssW, cssH)
      applyTargets(p1Ref.current, 5, 11)
      rafRef.current = requestAnimationFrame(animate)

      t1 = setTimeout(() => { phaseRef.current = 2; schedulePhase2() },       4300)
      t2 = setTimeout(() => { phaseRef.current = 3; phase3TsRef.current = performance.now() }, 6700)
      t3 = setTimeout(conclude, 9200)

      const skip = () => conclude()
      window.addEventListener('keydown', skip, { once: true })
      canvas.addEventListener('click',   skip, { once: true })
      window.addEventListener('resize',  handleResize)
    })

    return () => {
      cancelled = true
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(resizeTimer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [onComplete, conclude])

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[9998] bg-[#0A0A0A] select-none"
      style={{ cursor: 'none' }}
    >
      {/* Canvas size is set entirely via JS (setCssSize). No w-full/h-full to avoid conflict. */}
      <canvas ref={canvasRef} className="block" />
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#A0A0A0] text-[10px] tracking-[0.4em] uppercase pointer-events-none opacity-40">
        clique ou qualquer tecla para pular
      </p>
    </div>
  )
}
