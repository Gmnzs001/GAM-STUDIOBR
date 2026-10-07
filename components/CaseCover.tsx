'use client'

import { useEffect, useId, useMemo, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CaseCategory } from '@/lib/site'

/**
 * Capa generativa dos cases (sem fotos de banco).
 * Arte determinística por {category, seed}: paleta da marca + uma tinta por categoria,
 * com um motivo próprio para cada frente. Quatro camadas em profundidades diferentes
 * se deslocam com o ponteiro (parallax), dando volume quando o card inclina.
 *
 *   <div onPointerMove={trackCoverPointer} onPointerLeave={resetCoverPointer}>
 *     <CaseCover category="Web" seed={3} tone="dark" className="aspect-[16/10]" />
 *   </div>
 *
 * O parallax lê as variáveis CSS `--tx`/`--ty` (-1..1) de qualquer ancestral,
 * então o card inteiro pode controlar a capa.
 */

type Tone = 'dark' | 'light'

type Props = {
  category: CaseCategory
  seed?: number | string
  /** Usado no monograma de Branding (inicial do projeto). */
  title?: string
  tone?: Tone
  /** Intensidade do parallax (0 desliga). */
  depth?: number
  /** >1 afasta a "câmera" (mais respiro em capas grandes). */
  zoom?: number
  className?: string
}

// ─── Ponteiro → variáveis CSS (para usar no card pai) ────────────────────────
// Uma escrita por quadro (rAF) e o retângulo medido só na entrada do ponteiro:
// nada de getBoundingClientRect + setProperty intercalados a cada pointermove.
type PointerState = { rect: DOMRect | null; x: number; y: number; raf: number }
const pointerState = new WeakMap<HTMLElement, PointerState>()

export function trackCoverPointer(e: ReactPointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget
  let st = pointerState.get(el)
  if (!st) {
    st = { rect: null, x: 0, y: 0, raf: 0 }
    pointerState.set(el, st)
  }
  st.x = e.clientX
  st.y = e.clientY
  if (st.raf) return
  const s = st
  s.raf = requestAnimationFrame(() => {
    s.raf = 0
    // mede uma vez por "entrada"; rolar a página com o mouse parado zera no leave
    const r = (s.rect ??= el.getBoundingClientRect())
    el.style.setProperty('--tx', (((s.x - r.left) / r.width - 0.5) * 2).toFixed(3))
    el.style.setProperty('--ty', (((s.y - r.top) / r.height - 0.5) * 2).toFixed(3))
  })
}

export function resetCoverPointer(e: ReactPointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const st = pointerState.get(el)
  if (st) {
    cancelAnimationFrame(st.raf)
    st.raf = 0
    st.rect = null
  }
  el.style.setProperty('--tx', '0')
  el.style.setProperty('--ty', '0')
}

// ─── Pausa a flutuação fora da tela (um único observer para todas as capas) ──
let floatObserver: IntersectionObserver | null = null
function observeFloat(el: HTMLElement) {
  if (typeof IntersectionObserver === 'undefined') return () => {}
  floatObserver ??= new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        ;(en.target as HTMLElement).style.setProperty('--cc-play', en.isIntersecting ? 'running' : 'paused')
      }
    },
    { rootMargin: '120px 0px' },
  )
  floatObserver.observe(el)
  return () => floatObserver?.unobserve(el)
}

// ─── Paletas ──────────────────────────────────────────────────────────────────
const TINTS: Record<CaseCategory, { a: string; b: string }> = {
  Web: { a: '#5c6eff', b: '#9aa6ff' },
  Marketing: { a: '#e02020', b: '#ff7a3d' },
  Branding: { a: '#d4357f', b: '#f27aa8' },
  'Social Media': { a: '#7c5cff', b: '#2ec4b6' },
}

const TONES: Record<Tone, {
  bg0: string; bg1: string; grid: string; panel: string; panelLine: string
  block: string; strong: string; text: string; glow: number
}> = {
  dark: {
    bg0: '#13151b', bg1: '#1d2029', grid: 'rgba(255,255,255,0.055)', panel: '#20242e',
    panelLine: 'rgba(255,255,255,0.11)', block: 'rgba(255,255,255,0.08)', strong: 'rgba(255,255,255,0.24)',
    text: '#f4f5f7', glow: 0.42,
  },
  light: {
    bg0: '#eef0f4', bg1: '#e2e5eb', grid: 'rgba(14,16,21,0.06)', panel: '#ffffff',
    panelLine: 'rgba(14,16,21,0.10)', block: 'rgba(14,16,21,0.07)', strong: 'rgba(14,16,21,0.2)',
    text: '#0e1015', glow: 0.3,
  },
}

/** Cor do ponto/chip de cada categoria (legível sobre claro e escuro). */
export const CATEGORY_TINT: Record<CaseCategory, string> = {
  Web: '#5c6eff',
  Marketing: '#ff7a3d',
  Branding: '#e0559a',
  'Social Media': '#8b6dff',
}

const RED = '#e02020'
const W = 400
const H = 250

// ─── PRNG determinístico ──────────────────────────────────────────────────────
function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Rng = { r: () => number; range: (a: number, b: number) => number; int: (a: number, b: number) => number }

function makeRng(seed: string): Rng {
  const r = mulberry32(hash(seed))
  return {
    r,
    range: (a, b) => a + r() * (b - a),
    int: (a, b) => Math.floor(a + r() * (b - a + 1)),
  }
}

const heart = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy + 0.9 * s}C${cx - 1.35 * s} ${cy},${cx - 0.9 * s} ${cy - 1.05 * s},${cx} ${cy - 0.42 * s}C${cx + 0.9 * s} ${cy - 1.05 * s},${cx + 1.35 * s} ${cy},${cx} ${cy + 0.9 * s}Z`

// ─── Camada com parallax ──────────────────────────────────────────────────────
function Layer({
  d,
  depth,
  children,
  className,
  style,
}: {
  d: number
  depth: number
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const k = d * depth
  return (
    <div
      className={cn('absolute -inset-[5%]', className)}
      style={{
        transform: `translate3d(calc(var(--tx, 0) * ${(k * 12).toFixed(1)}px), calc(var(--ty, 0) * ${(k * 9).toFixed(1)}px), 0)`,
        transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1), scale 1s cubic-bezier(0.16,1,0.3,1)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Svg({ children, vb }: { children: ReactNode; vb: string }) {
  // `meet`: o motivo nunca é cortado nem ampliado demais em caixas altas;
  // o fundo é desenhado bem maior que o viewBox para preencher as sobras.
  return (
    <svg viewBox={vb} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {children}
    </svg>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function CaseCover({ category, seed = 1, title, tone = 'dark', depth = 1, zoom = 1, className }: Props) {
  const vb = `${(-(W * (zoom - 1)) / 2).toFixed(1)} ${(-(H * (zoom - 1)) / 2).toFixed(1)} ${W * zoom} ${H * zoom}`
  const rawId = useId()
  const uid = 'cc' + rawId.replace(/[^a-zA-Z0-9_-]/g, '')
  const t = TONES[tone]
  const tint = TINTS[category]

  const art = useMemo(() => {
    const rng = makeRng(`${category}:${seed}`)
    return {
      glowA: { x: rng.range(60, 340), y: rng.range(10, 110), r: rng.range(150, 220) },
      glowB: { x: rng.range(40, 360), y: rng.range(150, 250), r: rng.range(110, 170) },
      ring: { x: rng.range(30, 370), y: rng.range(20, 230), r: rng.range(70, 120) },
      plus: Array.from({ length: 4 }, () => ({ x: rng.int(1, 15) * 25, y: rng.int(1, 9) * 25 })),
      dots: Array.from({ length: 3 }, () => ({ x: rng.range(20, 380), y: rng.range(15, 235) })),
      float: rng.range(0, 3),
    }
  }, [category, seed])

  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = rootRef.current
    return el ? observeFloat(el) : undefined
  }, [])

  const id = (s: string) => `${uid}-${s}`
  const url = (s: string) => `url(#${id(s)})`

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn('relative isolate overflow-hidden', className)}
      style={{ backgroundColor: t.bg0 }}
    >
      {/* Defs compartilhados (svg invisível) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={id('bg')} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2={H}>
            <stop offset="0" stopColor={t.bg1} />
            <stop offset="1" stopColor={t.bg0} />
          </linearGradient>
          <radialGradient id={id('ga')}>
            <stop offset="0" stopColor={tint.a} stopOpacity={t.glow} />
            <stop offset="1" stopColor={tint.a} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id('gb')}>
            <stop offset="0" stopColor={tint.b} stopOpacity={t.glow * 0.7} />
            <stop offset="1" stopColor={tint.b} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id('tint')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={tint.a} />
            <stop offset="1" stopColor={tint.b} />
          </linearGradient>
          <linearGradient id={id('tintR')} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={tint.a} />
            <stop offset="1" stopColor={tint.b} />
          </linearGradient>
          <linearGradient id={id('tintV')} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={tint.a} stopOpacity="0.25" />
            <stop offset="1" stopColor={tint.b} stopOpacity="0.9" />
          </linearGradient>
          <pattern id={id('grid')} width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M25 0H0V25" fill="none" stroke={t.grid} strokeWidth="0.6" />
          </pattern>
        </defs>
      </svg>

      {/* 1 — fundo: gradiente, grade de construção e brilhos da tinta */}
      <Layer d={-0.35} depth={depth} className="group-hover/spot:scale-[1.04]">
        <Svg vb={vb}>
          <rect x={-W * 2} y={-H * 2} width={W * 5} height={H * 5} fill={url('bg')} />
          <circle cx={art.glowA.x} cy={art.glowA.y} r={art.glowA.r} fill={url('ga')} />
          <circle cx={art.glowB.x} cy={art.glowB.y} r={art.glowB.r} fill={url('gb')} />
          <rect x={-W * 2} y={-H * 2} width={W * 5} height={H * 5} fill={url('grid')} />
        </Svg>
      </Layer>

      {/* vinheta (em CSS para cobrir qualquer proporção) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(120% 95% at 50% 42%, transparent 55%, ${tone === 'dark' ? 'rgba(19,21,27,0.7)' : 'rgba(238,240,244,0.55)'})`,
        }}
      />
      {/* 2 — ornamentos */}
      <Layer d={0.3} depth={depth}>
        <Svg vb={vb}>
          {category === 'Branding' ? (
            <Construction t={t} tintA={tint.a} />
          ) : (
            <g>
              <circle cx={art.ring.x} cy={art.ring.y} r={art.ring.r} fill="none" stroke={tint.a} strokeOpacity="0.22" strokeDasharray="2 5" />
              <circle cx={art.ring.x} cy={art.ring.y} r={art.ring.r * 0.62} fill="none" stroke={tint.b} strokeOpacity="0.14" />
              {art.plus.map((p, i) => (
                <path key={i} d={`M${p.x - 4} ${p.y}H${p.x + 4}M${p.x} ${p.y - 4}V${p.y + 4}`} stroke={tint.b} strokeOpacity="0.6" strokeWidth="1" />
              ))}
              {art.dots.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={1.6 + i * 0.5} fill={i === 0 ? RED : tint.b} fillOpacity={i === 0 ? 0.9 : 0.55} />
              ))}
            </g>
          )}
        </Svg>
      </Layer>

      {/* 3 — motivo principal */}
      <Layer d={0.85} depth={depth} className="group-hover/spot:scale-[1.025]">
        <Svg vb={vb}>
          {category === 'Web' && <WebMotif t={t} tint={tint} url={url} seed={seed} />}
          {category === 'Marketing' && <MarketingMotif t={t} tint={tint} url={url} seed={seed} />}
          {category === 'Branding' && <BrandingMotif t={t} url={url} seed={seed} title={title} />}
          {category === 'Social Media' && <SocialMotif t={t} tint={tint} url={url} seed={seed} />}
        </Svg>
      </Layer>

      {/* 4 — acentos flutuantes em primeiro plano.
          A sombra fica no próprio elemento animado: o resultado do filtro é
          rasterizado uma vez e só transladado (não repinta a cada quadro). */}
      <Layer d={1.7} depth={depth}>
        <div
          className="absolute inset-0 animate-[gam-float_7s_ease-in-out_infinite] motion-reduce:animate-none"
          style={{
            animationDelay: `-${art.float.toFixed(2)}s`,
            animationPlayState: 'var(--cc-play, running)',
            filter: tone === 'dark' ? 'drop-shadow(0 10px 18px rgba(0,0,0,0.45))' : 'drop-shadow(0 10px 18px rgba(14,16,21,0.14))',
          }}
        >
          <Svg vb={vb}>
            {category === 'Web' && <WebAccent t={t} tint={tint} />}
            {category === 'Marketing' && <MarketingAccent t={t} tint={tint} />}
            {category === 'Branding' && <BrandingAccent t={t} tint={tint} />}
            {category === 'Social Media' && <SocialAccent t={t} tint={tint} seed={seed} />}
          </Svg>
        </div>
      </Layer>

      {/* filete interno para assentar a arte no card */}
      <div className={cn('pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset', tone === 'dark' ? 'ring-white/[0.06]' : 'ring-ink/[0.05]')} />
    </div>
  )
}

// ─── Motivos ──────────────────────────────────────────────────────────────────
type ToneSet = (typeof TONES)[Tone]
type TintSet = { a: string; b: string }
type UrlFn = (s: string) => string

function WebMotif({ t, tint, url, seed }: { t: ToneSet; tint: TintSet; url: UrlFn; seed: number | string }) {
  const local = makeRng(`web-layout:${seed}`)
  const v = local.int(0, 2)
  const x0 = 62
  const y0 = 38
  const w = 276
  // blocos do hero
  const heroText = (x: number, align: 'left' | 'center') => {
    const ax = (bw: number) => (align === 'center' ? x - bw / 2 : x)
    return (
      <g>
        <rect x={ax(118)} y={80} width={118} height={10} rx={5} fill={t.strong} />
        <rect x={ax(86)} y={96} width={86} height={10} rx={5} fill={t.strong} />
        <rect x={ax(124)} y={115} width={124} height={4} rx={2} fill={t.block} />
        <rect x={ax(100)} y={123} width={100} height={4} rx={2} fill={t.block} />
        <rect x={align === 'center' ? x - 48 : x} y={136} width={46} height={14} rx={7} fill={tint.a} />
        <rect x={align === 'center' ? x + 4 : x + 52} y={136} width={40} height={14} rx={7} fill="none" stroke={t.strong} />
      </g>
    )
  }
  const image = (x: number, y: number, iw: number, ih: number) => (
    <g>
      <rect x={x} y={y} width={iw} height={ih} rx={8} fill={url('tint')} fillOpacity="0.9" />
      <circle cx={x + iw * 0.72} cy={y + ih * 0.32} r={ih * 0.12} fill="#fff" fillOpacity="0.85" />
      <path d={`M${x} ${y + ih * 0.82}L${x + iw * 0.34} ${y + ih * 0.5}L${x + iw * 0.56} ${y + ih * 0.7}L${x + iw * 0.74} ${y + ih * 0.56}L${x + iw} ${y + ih * 0.84}V${y + ih - 8}Q${x + iw} ${y + ih} ${x + iw - 8} ${y + ih}H${x + 8}Q${x} ${y + ih} ${x} ${y + ih - 8}Z`} fill="#fff" fillOpacity="0.28" />
    </g>
  )
  const cardIcons = [0, 1, 2].map(() => local.int(0, 2))
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={232} rx={12} fill={t.panel} stroke={t.panelLine} />
      {/* barra do navegador */}
      <circle cx={x0 + 14} cy={y0 + 11} r={3} fill={RED} />
      <circle cx={x0 + 24} cy={y0 + 11} r={3} fill={t.strong} />
      <circle cx={x0 + 34} cy={y0 + 11} r={3} fill={t.strong} />
      <rect x={x0 + 70} y={y0 + 5} width={136} height={12} rx={6} fill={t.block} />
      <circle cx={x0 + 79} cy={y0 + 11} r={2.2} fill={tint.a} />
      <path d={`M${x0} ${y0 + 22}H${x0 + w}`} stroke={t.panelLine} />
      {v === 0 && (<>{heroText(80, 'left')}{image(214, 74, 108, 78)}</>)}
      {v === 1 && (<>{heroText(200, 'center')}</>)}
      {v === 2 && (<>{image(78, 74, 108, 78)}{heroText(202, 'left')}</>)}
      {/* linha de cards */}
      {[0, 1, 2].map((i) => {
        const cx = 80 + i * 82
        return (
          <g key={i}>
            <rect x={cx} y={168} width={74} height={60} rx={7} fill={t.block} />
            {cardIcons[i] === 0 && <rect x={cx + 9} y={177} width={14} height={14} rx={4} fill={tint.a} fillOpacity="0.85" />}
            {cardIcons[i] === 1 && <circle cx={cx + 16} cy={184} r={7} fill={tint.b} fillOpacity="0.8" />}
            {cardIcons[i] === 2 && <rect x={cx + 9} y={177} width={14} height={14} rx={7} fill="none" stroke={tint.a} strokeWidth="1.6" />}
            <rect x={cx + 9} y={199} width={48} height={4} rx={2} fill={t.strong} />
            <rect x={cx + 9} y={207} width={34} height={4} rx={2} fill={t.block} />
          </g>
        )
      })}
    </g>
  )
}

function WebAccent({ t, tint }: { t: ToneSet; tint: TintSet }) {
  return (
    <g>
      {/* janela de código */}
      <g transform="translate(276 142)">
        <rect width={94} height={64} rx={10} fill={t.panel} stroke={t.panelLine} />
        <text x={11} y={22} fontSize="13" fontWeight="700" fill={tint.a} style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>{'</>'}</text>
        <rect x={11} y={32} width={44} height={4} rx={2} fill={tint.b} fillOpacity="0.8" />
        <rect x={21} y={41} width={56} height={4} rx={2} fill={t.strong} />
        <rect x={21} y={50} width={34} height={4} rx={2} fill={t.block} />
      </g>
      {/* cursor apontando para o CTA */}
      <g transform="translate(126 150) rotate(-8)">
        <path d="M0 0L0 19L5 14.5L8.6 22L12 20.4L8.4 13H15Z" fill={t.text} stroke={t.panel} strokeWidth="1.4" strokeLinejoin="round" />
      </g>
      <circle cx={46} cy={64} r={4} fill={RED} />
      <circle cx={46} cy={64} r={9} fill="none" stroke={RED} strokeOpacity="0.35" />
    </g>
  )
}

function MarketingMotif({ t, tint, url, seed }: { t: ToneSet; tint: TintSet; url: UrlFn; seed: number | string }) {
  const rng = makeRng(`mkt:${seed}`)
  const n = 7
  const x0 = 82
  const x1 = 320
  const yb = 206
  const ph = 112
  const step = (x1 - x0) / n
  const bw = 17
  const vals = Array.from({ length: n }, (_, i) => Math.min(0.97, 0.18 + (i / (n - 1)) * 0.72 + rng.range(-0.1, 0.08)))
  vals[n - 1] = 0.96
  const pts = vals.map((v, i) => ({ x: x0 + step * i + step / 2, y: yb - v * ph - 14 - rng.range(0, 10) }))
  // curva suave (Catmull-Rom → Bézier)
  let d = `M${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)},${c2x.toFixed(1)} ${c2y.toFixed(1)},${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  const end = pts[pts.length - 1]
  return (
    <g>
      <rect x={58} y={42} width={284} height={186} rx={14} fill={t.panel} stroke={t.panelLine} />
      <rect x={76} y={58} width={64} height={7} rx={3.5} fill={t.strong} />
      <rect x={76} y={70} width={40} height={4} rx={2} fill={t.block} />
      <circle cx={262} cy={62} r={3} fill={tint.a} />
      <rect x={268} y={60} width={22} height={4} rx={2} fill={t.block} />
      <circle cx={300} cy={62} r={3} fill={tint.b} />
      <rect x={306} y={60} width={18} height={4} rx={2} fill={t.block} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${x0} ${yb - i * (ph / 3)}H${x1}`} stroke={t.panelLine} strokeDasharray={i === 0 ? undefined : '2 4'} />
      ))}
      {vals.map((v, i) => (
        <rect
          key={i}
          x={x0 + step * i + (step - bw) / 2}
          y={yb - v * ph}
          width={bw}
          height={v * ph}
          rx={4}
          fill={i === n - 1 ? tint.a : url('tintV')}
          fillOpacity={i === n - 1 ? 1 : 0.35 + (i / n) * 0.5}
        />
      ))}
      <motion.path
        d={d}
        fill="none"
        stroke={tint.b}
        strokeWidth="2.6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
      <circle cx={end.x} cy={end.y} r={11} fill={RED} fillOpacity="0.18" />
      <circle cx={end.x} cy={end.y} r={4.5} fill={RED} stroke={t.panel} strokeWidth="1.5" />
    </g>
  )
}

function MarketingAccent({ t, tint }: { t: ToneSet; tint: TintSet }) {
  return (
    <g>
      {/* KPI com seta de crescimento */}
      <g transform="translate(270 16)">
        <rect width={100} height={50} rx={12} fill={t.panel} stroke={t.panelLine} />
        <circle cx={25} cy={25} r={13} fill={tint.a} />
        <path d="M20 30L30 20M22.5 20H30V27.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={45} y={17} width={42} height={7} rx={3.5} fill={t.strong} />
        <rect x={45} y={29} width={28} height={4} rx={2} fill={tint.b} fillOpacity="0.8" />
      </g>
      {/* mini sparkline */}
      <g transform="translate(26 170)">
        <rect width={82} height={40} rx={10} fill={t.panel} stroke={t.panelLine} />
        <path d="M12 28L24 22L34 25L46 16L58 18L70 10" fill="none" stroke={tint.a} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={70} cy={10} r={2.6} fill={RED} />
      </g>
    </g>
  )
}

function Construction({ t, tintA }: { t: ToneSet; tintA: string }) {
  const cx = 200
  const cy = 125
  return (
    <g fill="none" strokeWidth="0.8">
      <circle cx={cx} cy={cy} r={92} stroke={t.panelLine} />
      <circle cx={cx} cy={cy} r={57} stroke={t.panelLine} />
      <circle cx={cx - 57} cy={cy} r={35} stroke={tintA} strokeOpacity="0.35" />
      <circle cx={cx + 57} cy={cy} r={35} stroke={tintA} strokeOpacity="0.35" />
      <rect x={cx - 92} y={cy - 92} width={184} height={184} stroke={t.panelLine} strokeDasharray="3 4" />
      <path d={`M${cx - 92} ${cy - 92}L${cx + 92} ${cy + 92}M${cx + 92} ${cy - 92}L${cx - 92} ${cy + 92}`} stroke={t.panelLine} />
      <path d={`M${-W} ${cy}H${2 * W}M${cx} ${-H}V${2 * H}M${-W} ${cy - 57}H${2 * W}M${-W} ${cy + 57}H${2 * W}`} stroke={t.panelLine} strokeDasharray="1 5" />
      {[[-92, -92], [92, -92], [-92, 92], [92, 92], [0, -57], [0, 57], [-57, 0], [57, 0]].map(([dx, dy], i) => (
        <rect key={i} x={cx + dx - 2} y={cy + dy - 2} width={4} height={4} fill={i < 4 ? t.panel : tintA} stroke={tintA} strokeOpacity="0.7" />
      ))}
    </g>
  )
}

function BrandingMotif({ t, url, seed, title }: { t: ToneSet; url: UrlFn; seed: number | string; title?: string }) {
  const clean = title?.trim() ?? ''
  const fromTitle = clean && !/^cole\b/i.test(clean) ? clean.match(/[A-Za-zÀ-ÿ]/)?.[0] : undefined
  const letter = (fromTitle ?? 'GAMSBR'[makeRng(`brand:${seed}`).int(0, 5)]).toUpperCase()
  return (
    <g>
      <text
        x={200}
        y={128}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="168"
        fontWeight="800"
        letterSpacing="-6"
        fill={url('tint')}
        style={{ fontFamily: 'var(--font-bricolage), var(--font-display), sans-serif' }}
      >
        {letter}
        <tspan fill={RED}>.</tspan>
      </text>
      <text
        x={200}
        y={128}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="168"
        fontWeight="800"
        letterSpacing="-6"
        fill="none"
        stroke={t.text}
        strokeOpacity="0.18"
        strokeWidth="0.8"
        transform="translate(6 6)"
        style={{ fontFamily: 'var(--font-bricolage), var(--font-display), sans-serif' }}
      >
        {letter}.
      </text>
    </g>
  )
}

function BrandingAccent({ t, tint }: { t: ToneSet; tint: TintSet }) {
  const swatches = ['#0e1015', tint.a, RED, '#ffffff']
  return (
    <g>
      <g transform="translate(36 186)">
        {swatches.map((c, i) => (
          <circle key={i} cx={i * 19} cy={0} r={13} fill={c} stroke={t.panel} strokeWidth="2" />
        ))}
      </g>
      <g transform="translate(288 26)">
        <rect width={84} height={58} rx={11} fill={t.panel} stroke={t.panelLine} />
        <text x={12} y={33} fontSize="25" fontWeight="700" fill={t.text} style={{ fontFamily: 'var(--font-bricolage), var(--font-display), sans-serif' }}>Aa</text>
        <rect x={50} y={18} width={22} height={4} rx={2} fill={tint.a} />
        <rect x={50} y={26} width={16} height={4} rx={2} fill={t.strong} />
        <rect x={12} y={43} width={60} height={4} rx={2} fill={t.block} />
      </g>
    </g>
  )
}

function SocialMotif({ t, tint, url, seed }: { t: ToneSet; tint: TintSet; url: UrlFn; seed: number | string }) {
  const rng = makeRng(`social:${seed}`)
  const x0 = 146
  const tile = 29
  const gap = 3
  const fills = [url('tint'), url('tintR'), tint.a, tint.b, t.block, t.strong]
  const tiles = Array.from({ length: 12 }, () => rng.int(0, fills.length - 1))
  const reel = rng.int(0, 5)
  const liked = rng.int(6, 8)
  return (
    <g>
      <rect x={x0} y={22} width={108} height={250} rx={20} fill={t.panel} stroke={t.panelLine} strokeWidth="1.4" />
      <rect x={x0 + 38} y={30} width={32} height={7} rx={3.5} fill={t.strong} />
      <circle cx={x0 + 22} cy={60} r={10} fill="none" stroke={url('tint')} strokeWidth="2" />
      <circle cx={x0 + 22} cy={60} r={6.5} fill={url('tintR')} />
      <rect x={x0 + 38} y={54} width={42} height={5} rx={2.5} fill={t.strong} />
      <rect x={x0 + 38} y={63} width={28} height={4} rx={2} fill={t.block} />
      {tiles.map((f, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = x0 + 9 + col * (tile + gap)
        const y = 80 + row * (tile + gap)
        return (
          <g key={i}>
            <rect x={x} y={y} width={tile} height={tile} rx={5} fill={fills[f]} fillOpacity={f < 4 ? 0.85 : 1} />
            {i === reel && <path d={`M${x + 11} ${y + 9}L${x + 20} ${y + 14.5}L${x + 11} ${y + 20}Z`} fill="#fff" />}
            {i === liked && <path d={heart(x + tile / 2, y + tile / 2, 6)} fill="#fff" />}
          </g>
        )
      })}
    </g>
  )
}

function SocialAccent({ t, tint, seed }: { t: ToneSet; tint: TintSet; seed: number | string }) {
  const rng = makeRng(`social-acc:${seed}`)
  const hy = rng.range(60, 90)
  return (
    <g>
      <g transform={`translate(266 ${hy.toFixed(1)})`}>
        <rect width={70} height={30} rx={15} fill={tint.a} />
        <path d={heart(17, 15, 6.5)} fill="#fff" />
        <rect x={30} y={13} width={28} height={5} rx={2.5} fill="#fff" fillOpacity="0.85" />
      </g>
      <g transform="translate(64 140)">
        <rect width={74} height={32} rx={12} fill={t.panel} stroke={t.panelLine} />
        <path d="M60 31L68 40L54 31" fill={t.panel} stroke={t.panelLine} strokeLinejoin="round" />
        <rect x={11} y={10} width={46} height={4} rx={2} fill={t.strong} />
        <rect x={11} y={18} width={30} height={4} rx={2} fill={t.block} />
      </g>
      <path d={heart(338, 150, 7)} fill={tint.b} />
      <path d={heart(318, 182, 4.5)} fill={RED} />
      <path d={heart(352, 196, 3.5)} fill={tint.b} fillOpacity="0.7" />
    </g>
  )
}
