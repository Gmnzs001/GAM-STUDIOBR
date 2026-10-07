'use client'

import { useEffect, useRef } from 'react'
import { useRevealed } from '@/lib/intro'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────────────────────
 * Globo pontilhado (canvas 2D) do Hero.
 * - Máscara de terra real (bitmap 180×70, células de 2°×2°, lat 84° N → 56° S).
 * - Pontos numa esfera de Fibonacci pré-calculados UMA vez em Float32Array.
 * - Por frame: só rotação + projeção ortográfica + fillRect em lotes por
 *   profundidade (poucas trocas de fillStyle). Rótulos HTML movidos por
 *   transform via refs — nenhum re-render do React por frame.
 * - Pausa fora da tela / com aba oculta; DPR máx. 2; reduced motion → estático.
 * ──────────────────────────────────────────────────────────────────────────── */

// Bits MSB-first, linha a linha. Linha r: lat 90-2(r+3) → 90-2(r+4). Coluna c: lon -180+2c → -178+2c.
const LAND_MASK = 'AAAAAAAAf+Af/AAAAAAAAAAAAAAAAAAAAAAAA//////+AAAABAAADgAAAAAAAAAAAAFf9f///4AA/AAAAAB8AAAAAAAAAABwAz4f///wAAYAAAEAAPAAAAAAAAAAAPmvwAf//wAAAAADgAf/4AHAAAAAAAH8338AP//gAAAAAMBD///8DAAAADwACfx3/gH//gAAB4AMHf//////wAfn/g6P/zf///////38d3GwAAAAAAAAP4AAAAAAfD4Af///gANAAgAAAAAAAABD/////9/979/9///////////////+AP/////4g8D4AAAH9/////////////Af/////gHgA4AAAP5///////////P4AHgP///gH2AAAAAH4//////////aMAADAB///8H+AAAAGCx/////////8A8AAAAA////v/gAAAPCr/////////wA4AAAAAf///v/wAAAbv///////////AwAAAAAP/////wAAAH////////////AAAAAAAH////8YAAAD///////////9AAAAAAAD////8EAAAB///////////9AAAAAAAD/////AAAAB//5/P//////5AAAAAAAD////gAAAAfxvwPP//////jgAAAAAAD////AAAAAfiz//n/////+CAAAAAAAD///+AAAAAfADf/n////+MCAAAAAAAB///8AAAAAOeRP///////mOAAAAAAAB///8AAAAAH+AA///////E8AAAAAAAAf//wAAAAAf/iB///////hAAAAAAAAAP//gAAAAAf/7////////gAAAAAAAAAD/owAAAAAf////f/////gAAAAAAAAAF+AQAAAAB///+/v/////AAAAAAAAAAC+AAAAAAD/////23////AAAAAAAAAAAeAQAAAAD////f/D///8gAAAAAAAAAAfEEAAAAH////v/B/z/QAAAAAAAAAAAPMBwAAAD////v+A/h+gAAAAAAAAAAAH8AAAAAD////38AeB/AgAAAAAAAAAAAfAAAAAH////3wAcAfggAAAAAAAAAAAHAAAAAH////+AAcAfgwAAAAAAAAAAABDwAAAD////9wAMATAQAAAAAAAAAAAA//AAAB/////gAKAQAIAAAAAAAAAAAAH/gAAA/////gACAIAIAAAAAAAAAAAAH/8AAAfH///AAAAsGAAAAAAAAAAAAAH/+AAAAB///AAAA0OAAAAAAAAAAAAAP/+AAAAB//8AAAAc+AAAAAAAAAAAAAf//gAAAD//4AAAAMeggAAAAAAAAAAAP//8AAAB//wAAAAGdg+AAAAAAAAAAAf///AAAA//wAAAACAAPkAAAAAAAAAAP///gAAA//wAAAAB4AHwAAAAAAAAAAP///gAAA//wAAAAAAIDYAAAAAAAAAAH///AAAAf/wAAAAAAAAAAAAAAAAAAAH//+AAAA//wgAAAAABxAAAAAAAAAAAD//+AAAA//xgAAAAAPxgAAAAAAAAAAA//+AAAA//zgAAAAAf/gAAAAAAAAAAAf/8AAAA//DgAAAAAf/wAAAAAAAAAAAf/8AAAAf/DAAAAAD//4CAAAAAAAAAAf/4AAAAf/DAAAAAH//8AAAAAAAAAAAf/AAAAAf+CAAAAAH//8AAAAAAAAAAA//AAAAAf+AAAAAAH//+AAAAAAAAAAA//AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAH4AAAAAAH//+AAAAAAAAAAA/8AAAAAHwAAAAAAD4f8AAAAAAAAAAA/4AAAAAAAAAAAAACAH8AAAAAAAAAAB/wAAAAAAAAAAAAAAAD4AEAAAAAAAAB/AAAAAAAAAAAAAAAAAAAGAAAAAAAAB+AAAAAAAAAAAAAAAAAQAMAAAAAAAAB8AAAAAAAAAAAAAAAAAQAYAAAAAAAAB4AAAAAAAAAAAAAAAAAABwAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAA'
const MASK_ROW0 = 3
const MASK_ROWS = 70
const MASK_COLS = 180

type City = { name: string; tag: string; lat: number; lon: number; side: 'left' | 'right' }

// Índice 0 = sede (origem dos arcos).
const CITIES: City[] = [
  { name: 'Goiânia', tag: 'BR', lat: -16.68, lon: -49.25, side: 'right' },
  { name: 'Nova York', tag: 'USA', lat: 40.71, lon: -74.01, side: 'left' },
  { name: 'Lisboa', tag: 'EUR', lat: 38.72, lon: -9.14, side: 'right' },
]

const DEG = Math.PI / 180
const TAU = Math.PI * 2
const R_FACTOR = 0.4 // raio da esfera ÷ lado do quadro (casa com o disco CSS inset-[10%])
const VIEW_LAT = 10 // latitude no centro da vista inicial
const VIEW_LON = -32 // longitude no centro da vista inicial (Brasil de frente, arcos com curva visível)
const AUTO_SLOW = 0.032 // rad/s com as três cidades de frente (a história fica visível)
const AUTO_FAST = 0.13 // rad/s com elas do lado de trás (~90 s por volta no total)
const SPIN = 1.15 // giro de entrada (rad) que termina com o Brasil de frente
const SPIN_DUR = 2.6 // s
const NB = 5 // faixas de profundidade no hemisfério da frente
const ARC_SAMPLES = 64
const ARC_START = 1.6 // s após a revelação
const ARC_GAP = 0.7 // atraso entre os dois arcos
const ARC_TRAVEL = 1.9 // s de viagem do cometa
const ARC_PERIOD = 4.4 // s por ciclo
const ARC_TAIL = 0.34 // comprimento do rastro (fração do arco)
const COMET_SEGS = 14

const ink = (a: number) => `rgba(14,16,21,${a.toFixed(3)})`
const red = (a: number) => `rgba(224,32,32,${a.toFixed(3)})`
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)
const clamp01 = (v: number) => clamp(v, 0, 1)
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const lerpAt = (arr: Float32Array, f: number) => {
  const k = f | 0
  if (k >= arr.length - 1) return arr[arr.length - 1]
  return arr[k] + (arr[k + 1] - arr[k]) * (f - k)
}

type Geometry = {
  focus: Float32Array
  land: Float32Array
  nLand: number
  sea: Float32Array
  nSea: number
  cities: Float32Array
  arcs: Float32Array[]
}

function buildGeometry(candidates: number): Geometry {
  const bin = atob(LAND_MASK)
  const bits = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bits[i] = bin.charCodeAt(i)

  const isLand = (lat: number, lon: number) => {
    const row = Math.floor((90 - lat) / 2) - MASK_ROW0
    if (row < 0 || row >= MASK_ROWS) return false
    const col = clamp(Math.floor((lon + 180) / 2), 0, MASK_COLS - 1)
    const i = row * MASK_COLS + col
    return ((bits[i >> 3] >> (7 - (i & 7))) & 1) === 1
  }

  // Esfera de Fibonacci: x = cos(lat)·sin(lon), y = sin(lat), z = cos(lat)·cos(lon)
  const GOLDEN = Math.PI * (3 - Math.sqrt(5))
  const fib = (n: number, keep: (lat: number, lon: number) => boolean) => {
    const tmp = new Float32Array(n * 3)
    let k = 0
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n
      const r = Math.sqrt(1 - y * y)
      const th = i * GOLDEN
      const x = Math.cos(th) * r
      const z = Math.sin(th) * r
      if (!keep(Math.asin(y) / DEG, Math.atan2(x, z) / DEG)) continue
      tmp[k++] = x
      tmp[k++] = y
      tmp[k++] = z
    }
    return { pts: tmp.slice(0, k), n: k / 3 }
  }

  const land = fib(candidates, isLand)
  const sea = fib(Math.round(candidates / 6), (la, lo) => !isLand(la, lo))

  const cities = new Float32Array(CITIES.length * 3)
  CITIES.forEach((c, i) => {
    const la = c.lat * DEG
    const lo = c.lon * DEG
    cities[i * 3] = Math.cos(la) * Math.sin(lo)
    cities[i * 3 + 1] = Math.sin(la)
    cities[i * 3 + 2] = Math.cos(la) * Math.cos(lo)
  })

  // Arcos de grande círculo "levantados" da sede até cada destino
  const arcs: Float32Array[] = []
  const ax = cities[0]
  const ay = cities[1]
  const az = cities[2]
  for (let t = 1; t < CITIES.length; t++) {
    const bx = cities[t * 3]
    const by = cities[t * 3 + 1]
    const bz = cities[t * 3 + 2]
    const w = Math.acos(clamp(ax * bx + ay * by + az * bz, -1, 1))
    const sw = Math.sin(w)
    const lift = 0.2 * w
    const pts = new Float32Array(ARC_SAMPLES * 3)
    for (let k = 0; k < ARC_SAMPLES; k++) {
      const u = k / (ARC_SAMPLES - 1)
      const a = Math.sin((1 - u) * w) / sw
      const b = Math.sin(u * w) / sw
      const h = 1 + lift * Math.sin(Math.PI * u)
      pts[k * 3] = (a * ax + b * bx) * h
      pts[k * 3 + 1] = (a * ay + b * by) * h
      pts[k * 3 + 2] = (a * az + b * bz) * h
    }
    arcs.push(pts)
  }

  // Centro de massa das cidades: controla a velocidade da rotação automática
  const focus = new Float32Array(3)
  for (let i = 0; i < CITIES.length; i++) for (let d = 0; d < 3; d++) focus[d] += cities[i * 3 + d]
  const fl = Math.hypot(focus[0], focus[1], focus[2]) || 1
  for (let d = 0; d < 3; d++) focus[d] /= fl

  return { focus, land: land.pts, nLand: land.n, sea: sea.pts, nSea: sea.n, cities, arcs }
}

export default function Globe({ className, play }: { className?: string; play?: boolean }) {
  const revealed = useRevealed()
  const active = play ?? revealed
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const activeRef = useRef(active)
  const syncRef = useRef<() => void>(() => {})

  useEffect(() => {
    activeRef.current = active
    syncRef.current()
  }, [active])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = window.matchMedia('(min-width: 1024px)').matches
    const { focus, land, nLand, sea, nSea, cities, arcs } = buildGeometry(desktop ? 9000 : 4200)

    // Buffers por faixa de profundidade (só o hemisfério da frente é desenhado:
    // o de trás ficava quase invisível sobre a esfera e custava metade das chamadas)
    const BX = new Float32Array(NB * nLand)
    const BY = new Float32Array(NB * nLand)
    const counts = new Int32Array(NB)
    const landStyles: string[] = []
    const landSizes: number[] = []
    for (let b = 0; b < NB; b++) {
      const d = (b + 0.5) / NB
      landStyles.push(ink(0.16 + 0.66 * d ** 0.85))
      landSizes.push(0.62 + 0.42 * d)
    }
    const seaStyle = ink(0.09)
    const cometStyles = Array.from({ length: COMET_SEGS }, (_, s) => red(0.9 * ((s + 1) / COMET_SEGS) ** 1.4))
    const AX = new Float32Array(ARC_SAMPLES)
    const AY = new Float32Array(ARC_SAMPLES)
    const AV = new Uint8Array(ARC_SAMPLES)
    const labelCache = CITIES.map(() => ({ x: -1e4, y: -1e4, o: -1 }))

    let size = 0
    let dpr = 1
    let R = 0
    let C = 0
    let dot = 2
    let time = 0
    let yawBase = -VIEW_LON * DEG
    let vel = AUTO_SLOW
    let dragPitch = 0
    let tiltX = 0
    let tiltY = 0
    let tiltTX = 0
    let tiltTY = 0
    let yaw = reduced ? yawBase : yawBase - SPIN
    let pitch = VIEW_LAT * DEG
    let dragging = false
    let dragId = -1
    let lastX = 0
    let lastY = 0
    let lastT = 0
    let pointerX = 0
    let pointerY = 0
    let pointerDirty = false
    let visible = false
    let raf = 0
    let last = 0

    // ── desenho ────────────────────────────────────────────────────────────
    const drawArc = (a: number, cyw: number, syw: number, cp: number, sp: number) => {
      const local = reduced ? ARC_TRAVEL + 1 : time - ARC_START - a * ARC_GAP
      if (local <= 0) return
      const pts = arcs[a]
      for (let k = 0, j = 0; k < ARC_SAMPLES; k++, j += 3) {
        const x = pts[j]
        const y = pts[j + 1]
        const z = pts[j + 2]
        const x1 = x * cyw + z * syw
        const z1 = z * cyw - x * syw
        const y2 = y * cp - z1 * sp
        const z2 = y * sp + z1 * cp
        AX[k] = C + x1 * R
        AY[k] = C - y2 * R
        // visível se está na frente ou fora do disco (levantado além da borda)
        AV[k] = z2 > 0 || x1 * x1 + y2 * y2 > 1 ? 1 : 0
      }

      // Linha base: desenha-se na primeira viagem e depois fica, suave
      const reveal = local >= ARC_TRAVEL ? 1 : easeInOut(local / ARC_TRAVEL)
      const end = Math.round(reveal * (ARC_SAMPLES - 1))
      ctx.beginPath()
      let pen = false
      for (let k = 0; k <= end; k++) {
        if (!AV[k]) {
          pen = false
          continue
        }
        if (pen) ctx.lineTo(AX[k], AY[k])
        else {
          ctx.moveTo(AX[k], AY[k])
          pen = true
        }
      }
      const g = ctx.createLinearGradient(AX[0], AY[0], AX[ARC_SAMPLES - 1], AY[ARC_SAMPLES - 1])
      g.addColorStop(0, red(0.6))
      g.addColorStop(1, red(0.16))
      ctx.strokeStyle = g
      ctx.lineWidth = 1.25
      ctx.stroke()
      if (reduced) return

      // Cometa: rastro em degradê + cabeça brilhante
      const u = local % ARC_PERIOD
      let head: number
      let tail: number
      if (u < ARC_TRAVEL) {
        head = easeInOut(u / ARC_TRAVEL)
        tail = Math.max(0, head - ARC_TAIL)
      } else if (u < ARC_TRAVEL + 0.45) {
        head = 1
        tail = 1 - ARC_TAIL * (1 - easeOutCubic((u - ARC_TRAVEL) / 0.45))
      } else return

      const span = head - tail
      if (span > 0.002) {
        ctx.lineCap = 'round'
        for (let s = 0; s < COMET_SEGS; s++) {
          const f0 = (tail + (span * s) / COMET_SEGS) * (ARC_SAMPLES - 1)
          const f1 = (tail + (span * (s + 1)) / COMET_SEGS) * (ARC_SAMPLES - 1)
          if (!AV[Math.round(f0)] || !AV[Math.round(f1)]) continue
          ctx.strokeStyle = cometStyles[s]
          ctx.lineWidth = 0.8 + (1.8 * (s + 1)) / COMET_SEGS
          ctx.beginPath()
          ctx.moveTo(lerpAt(AX, f0), lerpAt(AY, f0))
          ctx.lineTo(lerpAt(AX, f1), lerpAt(AY, f1))
          ctx.stroke()
        }
      }
      if (u < ARC_TRAVEL) {
        const fh = head * (ARC_SAMPLES - 1)
        if (AV[Math.round(fh)]) {
          const hx = lerpAt(AX, fh)
          const hy = lerpAt(AY, fh)
          ctx.fillStyle = red(0.14)
          ctx.beginPath()
          ctx.arc(hx, hy, 8, 0, TAU)
          ctx.fill()
          ctx.fillStyle = red(1)
          ctx.beginPath()
          ctx.arc(hx, hy, 2.8, 0, TAU)
          ctx.fill()
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(hx, hy, 1.1, 0, TAU)
          ctx.fill()
        }
      }
    }

    const draw = () => {
      if (!size) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size, size)
      const cyw = Math.cos(yaw)
      const syw = Math.sin(yaw)
      const cp = Math.cos(pitch)
      const sp = Math.sin(pitch)

      // 1) Oceano: pontos esparsos e bem claros, só na frente
      ctx.fillStyle = seaStyle
      const ss = dot * 0.55
      const sh = ss / 2
      for (let j = 0; j < nSea * 3; j += 3) {
        const x = sea[j]
        const y = sea[j + 1]
        const z = sea[j + 2]
        const z1 = z * cyw - x * syw
        if (y * sp + z1 * cp < 0.12) continue
        const x1 = x * cyw + z * syw
        const y2 = y * cp - z1 * sp
        ctx.fillRect(C + x1 * R - sh, C - y2 * R - sh, ss, ss)
      }

      // 2) Terra, agrupada por profundidade → um fillStyle por faixa
      counts.fill(0)
      for (let i = 0, j = 0; i < nLand; i++, j += 3) {
        const x = land[j]
        const y = land[j + 1]
        const z = land[j + 2]
        const z1 = z * cyw - x * syw
        const z2 = y * sp + z1 * cp
        if (z2 < 0) continue
        const x1 = x * cyw + z * syw
        const y2 = y * cp - z1 * sp
        let b = (z2 * NB) | 0
        if (b >= NB) b = NB - 1
        const k = b * nLand + counts[b]++
        BX[k] = C + x1 * R
        BY[k] = C - y2 * R
      }
      for (let b = 0; b < NB; b++) {
        const n = counts[b]
        if (!n) continue
        ctx.fillStyle = landStyles[b]
        const s = dot * landSizes[b]
        const h = s / 2
        const off = b * nLand
        for (let k = off; k < off + n; k++) ctx.fillRect(BX[k] - h, BY[k] - h, s, s)
      }

      // 3) Arcos Goiânia → destinos
      for (let a = 0; a < arcs.length; a++) drawArc(a, cyw, syw, cp, sp)

      // 4) Marcadores + rótulos (HTML, via transform)
      const markersIn = reduced ? 1 : smooth(0.7, 1.5, time)
      const labelsIn = reduced ? 1 : smooth(1.3, 2.2, time)
      for (let c = 0; c < CITIES.length; c++) {
        const x = cities[c * 3]
        const y = cities[c * 3 + 1]
        const z = cities[c * 3 + 2]
        const x1 = x * cyw + z * syw
        const z1 = z * cyw - x * syw
        const y2 = y * cp - z1 * sp
        const z2 = y * sp + z1 * cp
        const sx = C + x1 * R
        const sy = C - y2 * R
        const vis = smooth(-0.02, 0.25, z2)
        const mv = vis * markersIn

        if (mv > 0.01) {
          if (!reduced) {
            // pulso contínuo
            const ph = (time * 0.55 + c * 0.37) % 1
            ctx.strokeStyle = red(0.55 * (1 - ph) * mv)
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.arc(sx, sy, 4 + ph * (c === 0 ? 17 : 12), 0, TAU)
            ctx.stroke()
            // "chegada" do cometa no destino
            if (c > 0) {
              const local = time - ARC_START - (c - 1) * ARC_GAP
              const u = (local % ARC_PERIOD) - ARC_TRAVEL
              if (local > ARC_TRAVEL && u >= 0 && u < 0.9) {
                const q = u / 0.9
                ctx.fillStyle = red(0.2 * (1 - q) * mv)
                ctx.beginPath()
                ctx.arc(sx, sy, 4 + 16 * easeOutCubic(q), 0, TAU)
                ctx.fill()
              }
            }
          }
          ctx.fillStyle = `rgba(255,255,255,${mv.toFixed(3)})`
          ctx.beginPath()
          ctx.arc(sx, sy, c === 0 ? 5.6 : 4.6, 0, TAU)
          ctx.fill()
          ctx.fillStyle = red(mv)
          ctx.beginPath()
          ctx.arc(sx, sy, c === 0 ? 3.8 : 3.1, 0, TAU)
          ctx.fill()
        }

        const el = labelRefs.current[c]
        if (el) {
          const cache = labelCache[c]
          const o = vis * labelsIn
          if (Math.abs(sx - cache.x) > 0.05 || Math.abs(sy - cache.y) > 0.05) {
            el.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)`
            cache.x = sx
            cache.y = sy
          }
          if (Math.abs(o - cache.o) > 0.004) {
            el.style.opacity = o.toFixed(3)
            cache.o = o
          }
        }
      }
    }

    // ── simulação ──────────────────────────────────────────────────────────
    const simulate = (dt: number) => {
      time += dt
      if (!dragging) {
        // rotação contínua: devagar com as cidades de frente, mais rápida atrás;
        // a inércia do arraste volta suavemente a essa velocidade
        const fz =
          focus[1] * Math.sin(pitch) +
          (focus[2] * Math.cos(yaw) - focus[0] * Math.sin(yaw)) * Math.cos(pitch)
        const auto = AUTO_FAST + (AUTO_SLOW - AUTO_FAST) * smooth(-0.15, 0.75, fz)
        vel += (auto - vel) * (1 - Math.exp(-dt * 1.7))
        yawBase += vel * dt
        dragPitch *= Math.exp(-dt * 1.8)
      }
      if (pointerDirty) {
        // leitura de layout no início do frame, antes de qualquer escrita
        pointerDirty = false
        const r = wrap.getBoundingClientRect()
        const nx = (pointerX - (r.left + r.width / 2)) / Math.max(1, window.innerWidth / 2)
        const ny = (pointerY - (r.top + r.height / 2)) / Math.max(1, window.innerHeight / 2)
        tiltTX = clamp(nx, -1, 1) * 0.16
        tiltTY = clamp(ny, -1, 1) * 0.1
      }
      const k = 1 - Math.exp(-dt * 2.5)
      tiltX += (tiltTX - tiltX) * k
      tiltY += (tiltTY - tiltY) * k
      const spin = SPIN * (1 - easeOutCubic(clamp01(time / SPIN_DUR)))
      yaw = yawBase - spin + tiltX
      pitch = VIEW_LAT * DEG + dragPitch + tiltY
    }

    // ── loop ───────────────────────────────────────────────────────────────
    const shouldRun = () => activeRef.current && visible && !document.hidden && !reduced
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      simulate(dt)
      draw()
      raf = shouldRun() ? requestAnimationFrame(tick) : 0
    }
    const sync = () => {
      if (shouldRun()) {
        if (!raf) {
          last = 0
          raf = requestAnimationFrame(tick)
        }
      } else if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const resize = () => {
      const s = wrap.clientWidth
      if (!s) return
      size = s
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(s * dpr)
      canvas.height = Math.round(s * dpr)
      R = s * R_FACTOR
      C = s / 2
      dot = clamp(R / 82, 1.6, 2.9)
      for (const l of labelCache) l.x = -1e4
      if (!raf) draw()
    }

    // ── interação: arrastar com inércia + leve inclinação rumo ao mouse ────
    const onDown = (e: PointerEvent) => {
      if (reduced || (e.pointerType === 'mouse' && e.button !== 0)) return
      dragging = true
      dragId = e.pointerId
      lastX = e.clientX
      lastY = e.clientY
      lastT = e.timeStamp
      vel = 0
      wrap.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== dragId) return
      const dt = Math.max(0.008, (e.timeStamp - lastT) / 1000)
      const d = (e.clientX - lastX) / Math.max(1, R)
      yawBase += d
      dragPitch = clamp(dragPitch + (e.clientY - lastY) / Math.max(1, R), -0.55, 0.55)
      vel = vel * 0.5 + (d / dt) * 0.5
      lastX = e.clientX
      lastY = e.clientY
      lastT = e.timeStamp
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== dragId) return
      dragging = false
      vel = e.timeStamp - lastT > 90 ? 0 : clamp(vel, -2.6, 2.6)
      if (wrap.hasPointerCapture(e.pointerId)) wrap.releasePointerCapture(e.pointerId)
    }
    const onHover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || dragging) return
      pointerX = e.clientX
      pointerY = e.clientY
      pointerDirty = true
    }
    const onLeaveDoc = () => {
      tiltTX = 0
      tiltTY = 0
    }

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { rootMargin: '64px' },
    )
    io.observe(wrap)
    document.addEventListener('visibilitychange', sync)
    if (!reduced) {
      wrap.addEventListener('pointerdown', onDown)
      wrap.addEventListener('pointermove', onMove)
      wrap.addEventListener('pointerup', onUp)
      wrap.addEventListener('pointercancel', onUp)
      window.addEventListener('pointermove', onHover, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeaveDoc)
    }

    syncRef.current = sync
    resize()
    sync()

    return () => {
      syncRef.current = () => {}
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      wrap.removeEventListener('pointerdown', onDown)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerup', onUp)
      wrap.removeEventListener('pointercancel', onUp)
      window.removeEventListener('pointermove', onHover)
      document.documentElement.removeEventListener('pointerleave', onLeaveDoc)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="Globo terrestre girando, com Goiânia conectada a Nova York e Lisboa"
      className={cn('relative aspect-square w-full touch-pan-y select-none', className)}
    >
      {/* brilho vermelho suave atrás da esfera (estático) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-6%] rounded-full bg-[radial-gradient(closest-side,rgba(224,32,32,0.2)_58%,rgba(224,32,32,0.08)_76%,rgba(224,32,32,0)_100%)]"
      />
      {/* órbita (atrás da esfera) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -rotate-[16deg]">
        <div className="absolute inset-x-[-3%] top-1/2 h-[30%] -translate-y-1/2 rounded-[50%] border border-ink/15" />
      </div>
      {/* corpo da esfera */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[10%] rounded-full bg-[radial-gradient(circle_at_34%_28%,#ffffff_0%,#f8f9fb_46%,#e9ebf0_100%)] shadow-[0_48px_90px_-40px_rgba(14,16,21,0.35),inset_0_-20px_40px_-18px_rgba(14,16,21,0.08)] ring-1 ring-ink/[0.06]"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      {/* rótulos das cidades */}
      {CITIES.map((c, i) => (
        <div
          key={c.name}
          ref={(el) => {
            labelRefs.current[i] = el
          }}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform"
        >
          <div
            className={cn(
              'flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface py-1 pl-2.5 pr-2 text-[12px] font-semibold leading-none text-ink shadow-[var(--shadow-soft)] ring-1 ring-line',
              c.side === 'left' ? '-translate-x-[calc(100%+12px)]' : 'translate-x-3',
            )}
          >
            {c.name}
            <span className="rounded-full bg-paper-2 px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-2">{c.tag}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
