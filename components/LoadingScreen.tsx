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
    ctx.fillRect(this.pos.x - 0.5, this.pos.y - 0.5, 1.5, 1.5)
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
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  startSize: number,
): string {
  let size = startSize
  ctx.font = `900 ${size}px Inter, Arial Black, sans-serif`
  while (ctx.measureText(text).width > maxW && size > 10) {
    size -= 2
    ctx.font = `900 ${size}px Inter, Arial Black, sans-serif`
  }
  return ctx.font
}

// ── Offscreen rasterise ───────────────────────────────────────────────────────
function rasterise(w: number, h: number, font: string, lines: string[]): Uint8ClampedArray {
  const off  = document.createElement('canvas')
  off.width  = w; off.height = h
  const octx = off.getContext('2d')!
  octx.font          = font
  octx.textAlign     = 'center'
  octx.textBaseline  = 'middle'
  octx.fillStyle     = 'white'
  const m         = font.match(/\s(\d+)px/)
  const fontSize  = m ? parseInt(m[1]) : 60
  const lineH     = fontSize * 1.3
  const startY    = h / 2 - ((lines.length - 1) * lineH) / 2
  lines.forEach((line, i) => octx.fillText(line, w / 2, startY + i * lineH))
  return octx.getImageData(0, 0, w, h).data
}

// ── Build Target[] from raw pixel data ────────────────────────────────────────
// colorFn receives (x, y, byteIndex) — byteIndex can be used to cross-reference
// a second pixel array for dot detection.
function buildTargets(
  w: number,
  h: number,
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
  const dotCXRef     = useRef(0)
  const dotCYRef     = useRef(0)
  // Cached target sets so resize can rebuild quickly
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

    const canvas   = canvasRef.current!
    const ctx      = canvas.getContext('2d')!
    const particles = particlesRef.current

    let cancelled  = false
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    let t3: ReturnType<typeof setTimeout>
    let resizeTimer: ReturnType<typeof setTimeout>

    // ── Helpers (read canvas.width/height dynamically so resize works) ─────────
    const scatter = () => {
      const w   = canvas.width, h = canvas.height
      const ang = Math.random() * Math.PI * 2
      const d   = Math.random() * (w + h) * 0.3 + (w + h) * 0.25
      return { x: w / 2 + Math.cos(ang) * d, y: h / 2 + Math.sin(ang) * d }
    }

    const applyTargets = (targets: Target[], speedMin: number, speedMax: number) => {
      const w = canvas.width, h = canvas.height
      for (let i = 0; i < targets.length; i++) {
        let p: Particle
        if (i < particles.length) {
          p = particles[i]; p.isKilled = false
        } else {
          p    = new Particle()
          const pos = scatter()
          p.pos.x = pos.x; p.pos.y = pos.y
          particles.push(p)
        }
        p.maxSpeed      = Math.random() * (speedMax - speedMin) + speedMin
        p.maxForce      = p.maxSpeed * 0.08
        p.colorBlendRate = Math.random() * 0.018 + 0.006
        p.startColor    = p.lerpColor()
        p.targetColor   = targets[i].color
        p.colorWeight   = 0
        p.target.x      = targets[i].x
        p.target.y      = targets[i].y
      }
      for (let i = targets.length; i < particles.length; i++) particles[i].kill(w, h)
    }

    const schedulePhase2 = () => {
      const phase2 = p2Ref.current
      const w = canvas.width, h = canvas.height
      while (particles.length < phase2.length) {
        const p = new Particle(); const pos = scatter()
        p.pos.x = pos.x; p.pos.y = pos.y; particles.push(p)
      }
      const maxLen  = Math.max(particles.length, phase2.length)
      const shuffled = Array.from({ length: maxLen }, (_, i) => i).sort(() => Math.random() - 0.5)
      const WAVES   = 6
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
            } else if (idx < particles.length) {
              particles[idx].kill(w, h)
            }
          })
        }, wi * 100)
      })
    }

    const animate = (ts: number) => {
      const w = canvas.width, h = canvas.height
      ctx.fillStyle = 'rgba(10,10,10,0.18)'
      ctx.fillRect(0, 0, w, h)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.move(); p.draw(ctx)
        if (p.isKilled && (p.pos.x < -w || p.pos.x > w * 2 || p.pos.y < -h || p.pos.y > h * 2)) {
          particles.splice(i, 1)
        }
      }
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

    // ── Build target sets for a given viewport ─────────────────────────────────
    // IMPORTANT: called AFTER fonts are ready so measurements are accurate.
    const buildTargetSets = (w: number, h: number) => {
      // Fit fonts to the current viewport
      const wFont = fitFont(ctx, LINES[1], w * 0.84, Math.min(w * 0.088, 104))
      const gFont = fitFont(ctx, 'GAM.',   w * 0.65, Math.min(w * 0.155, 180))

      // Phase 1 — welcome text (all white)
      const welcomeData = rasterise(w, h, wFont, LINES)
      p1Ref.current = buildTargets(w, h, welcomeData, 3, () => ({ r: 255, g: 255, b: 255 }))

      // Phase 2 — GAM. with red dot detected via PIXEL DIFF.
      // Centering shifts the whole string: 'GAM' centered ≠ 'GAM.' centered in position.
      // Fix: render 'GAM.' centered (source of truth), then render 'GAM' LEFT-ALIGNED
      // at the same start-x so G/A/M letters land on identical pixel positions.
      // Any pixel present in 'GAM.' but absent in the aligned 'GAM' render is the dot.
      ctx.font = gFont
      const gamdWidth = ctx.measureText('GAM.').width
      const gamdStartX = w / 2 - gamdWidth / 2

      const gamdData = rasterise(w, h, gFont, ['GAM.'])   // centered

      const offGAM       = document.createElement('canvas')
      offGAM.width       = w; offGAM.height = h
      const octxGAM      = offGAM.getContext('2d')!
      octxGAM.font         = gFont
      octxGAM.textAlign    = 'left'
      octxGAM.textBaseline = 'middle'
      octxGAM.fillStyle    = 'white'
      octxGAM.fillText('GAM', gamdStartX, h / 2)   // same start-x as centered 'GAM.'
      const gamData = octxGAM.getImageData(0, 0, w, h).data

      p2Ref.current = buildTargets(w, h, gamdData, 3, (_x, _y, i) => {
        const isDot = gamData[i + 3] <= 64   // pixel in GAM. but not in aligned GAM → dot
        return isDot ? { r: 224, g: 32, b: 32 } : { r: 255, g: 255, b: 255 }
      })

      // Dot center = center of mass of red particles (for the pulsing glow)
      let sx = 0, sy = 0, n = 0
      for (const t of p2Ref.current) {
        if (t.color.r === 224) { sx += t.x; sy += t.y; n++ }
      }
      dotCXRef.current = n > 0 ? sx / n : w / 2
      dotCYRef.current = n > 0 ? sy / n : h / 2
    }

    // ── Resize: rebuild targets and re-apply for the current phase ─────────────
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (cancelled || doneRef.current) return
        canvas.width  = window.innerWidth
        canvas.height = window.innerHeight
        buildTargetSets(canvas.width, canvas.height)
        if (phaseRef.current >= 2) {
          applyTargets(p2Ref.current, 4, 8)
        } else {
          applyTargets(p1Ref.current, 5, 11)
        }
      }, 150)
    }

    // ── Main setup (deferred until fonts are ready) ────────────────────────────
    document.fonts.ready.then(() => {
      if (cancelled) return

      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight

      buildTargetSets(canvas.width, canvas.height)

      applyTargets(p1Ref.current, 5, 11)
      rafRef.current = requestAnimationFrame(animate)

      t1 = setTimeout(() => { phaseRef.current = 2; schedulePhase2() },      4300)
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
      <canvas ref={canvasRef} className="block w-full h-full" />
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#A0A0A0] text-[10px] tracking-[0.4em] uppercase pointer-events-none opacity-40">
        clique ou qualquer tecla para pular
      </p>
    </div>
  )
}
