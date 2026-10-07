'use client'

import { Fragment, useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { getLenis } from '@/lib/lenis-ref'
import { Mark, Wordmark } from '@/components/system/Logo'
import Button from '@/components/system/Button'

/*
 * Intro cinematográfica da home (~6.7s).
 *
 *  0.1s  as partículas chegam letra a letra, em ordem de leitura, e cada letra
 *        "solidifica" em texto real (DOM): "Seja bem-vindo / à sua nova realidade."
 *  1.7s  a frase inteira está nítida e parada: janela de leitura (~1.5s)
 *  3.2s  o texto é re-medido no DOM e vira partículas no mesmo lugar (crossfade)
 *  3.5s  as partículas se contraem, explodem e se reagrupam no logo "GAM."
 *        (o ponto vermelho da frase vira o ponto vermelho do logo)
 *  4.4s  o logo nítido (DOM) assume o lugar das partículas; o ponto pulsa
 *  5.0s  um disco vermelho cresce a partir do ponto até cobrir a tela
 *  5.8s  um furo circular abre do centro e revela o site (onReveal → onComplete ≈ 6.7s)
 *
 * Pular (botão, Esc/Enter/Espaço, toque curto) funciona em qualquer fase e
 * termina em ≲1s — inclusive acelerando a saída natural já em curso.
 *
 * As partículas só existem em movimento (chegada e saída). Durante a leitura a
 * frase é tipografia de verdade e o canvas não desenha nada.
 *
 * Desempenho: um único canvas, partículas em typed arrays (zero alocação por
 * frame), loop no ticker do GSAP (pausa com a aba oculta), nenhum re-render do
 * React durante a animação — tudo escreve direto no DOM.
 */

type Props = { onReveal: () => void; onComplete: () => void }

/** Glifo medido no DOM e desenhado no canvas fora da tela para ser amostrado. */
type Glyph = { ch: string; x: number; base: number; fs: number; red: boolean }

/** Pontos-alvo de uma formação de partículas (contíguos por glifo, em ordem de leitura). */
type Formation = {
  n: number
  x: Float32Array
  y: Float32Array
  s: Float32Array // tamanho da partícula (px CSS)
  g: Uint16Array // índice do glifo
  red: Uint8Array // 1 = partícula vermelha
  glyphs: number
  gs: Uint32Array // primeira partícula de cada glifo (glyphs + 1 entradas)
  fs: number // corpo da fonte (px)
}

/** Centro e diâmetro (px) — ponto vermelho do logo ou origem do disco. */
type Dot = { x: number; y: number; d: number }

const RED = '#e02020'

// Linha do tempo principal (segundos)
const T_ARRIVE = 0.1 // partículas da 1ª letra partem
const SWEEP = 0.8 // atraso entre a 1ª e a última letra (ordem de leitura)
const FLY = 0.6 // voo de cada partícula na chegada (+ até 0.16s)
const SOLID_AT = 0.5 // após a partida da letra: o glifo nítido (DOM) começa a surgir
const SOLID_DUR = 0.24
const FADE_AT = 0.58 // após a partida da letra: as partículas dela somem
const FADE_DUR = 0.2
const T_GLOW = 2.15 // leitura: o ponto vermelho da frase brilha uma vez
const T_DISSOLVE = 3.2 // texto nítido → partículas (posições re-medidas no DOM)
const T_CHARGE = 3.28 // antecipação: o texto se contrai levemente
const T_BURST = 3.48 // explode e se reagrupa em "GAM."
const T_MARK = 4.4 // logo nítido assume o lugar das partículas
const T_PULSE = 4.58 // ponto vermelho pulsa
const T_STOP = 4.9 // loop do canvas encerrado
const T_EXIT = 5.0 // disco vermelho → revelação

/** Partida das partículas da letra g (de G): uma após a outra, em ordem de leitura. */
const glyphAt = (g: number, G: number) => T_ARRIVE + (G > 1 ? (g / (G - 1)) * SWEEP : 0)

/** Frase de boas-vindas: linhas → grupos inquebráveis (em telas estreitas cada grupo vira uma linha). */
const SENTENCE = [
  ['Seja', 'bem-vindo'],
  ['à sua nova', 'realidade.'],
]
const SENTENCE_TEXT = 'Seja bem-vindo à sua nova realidade.'

const SCROLL_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'])
const MASK = 'radial-gradient(circle at 50% 50%, transparent var(--r), #000 calc(var(--r) + 1px))'

/** A intro roda uma vez por carregamento do documento (voltar à home pela navegação não repete). */
let playedThisDocument = false

/*
 * CSS local. `data-lock` esconde a barra de rolagem desde o primeiro paint (sem
 * salto de layout na hidratação nem no fim); `data-failsafe` libera o site se o
 * JS nunca rodar. O JS remove os dois atributos.
 * A frase tem 4 linhas em telas estreitas e 2 a partir de 640px; o corpo escala
 * por min(vw, vh) para caber sempre entre as barras do HUD.
 */
const CSS = [
  '@keyframes gam-intro-failsafe{to{opacity:0;visibility:hidden}}',
  '@keyframes gam-intro-unlock{to{overflow:visible}}',
  '@keyframes gam-intro-in{from{opacity:0;transform:translate3d(0,8px,0)}to{opacity:1;transform:none}}',
  '.gam-intro[data-failsafe]{animation:gam-intro-failsafe .6s ease 10s forwards}',
  'html:has(.gam-intro[data-lock]){overflow:hidden}',
  'html:has(.gam-intro[data-lock][data-failsafe]){animation:gam-intro-unlock 1ms 10.5s forwards}',
  '.gam-intro-in{animation:gam-intro-in .9s cubic-bezier(.16,1,.3,1) both}',
  '@media (prefers-reduced-motion:reduce){.gam-intro-in{animation:none}}',
  '.gam-intro-text{font-size:min(18vw,13vh)}',
  '@media (min-width:640px){.gam-intro-text{font-size:min(8.2vw,24vh,10rem)}}',
  '.gam-intro-text [data-c]{opacity:0}',
].join('')
const NOSCRIPT_CSS = '.gam-intro{display:none!important}html:has(.gam-intro){overflow-y:auto!important}'

const f32 = (n: number) => new Float32Array(n)
const clampInt = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

const EMPTY: Formation = {
  n: 0,
  x: f32(0),
  y: f32(0),
  s: f32(0),
  g: new Uint16Array(0),
  red: new Uint8Array(0),
  glyphs: 0,
  gs: new Uint32Array(1),
  fs: 0,
}

/** Desloca uma formação ainda não usada (resize pequeno: barra de endereço no mobile). */
function shiftFormation(F: Formation, dx: number, dy: number) {
  for (let i = 0; i < F.n; i++) {
    F.x[i] += dx
    F.y[i] += dy
  }
}

/* ───────────────────────── Amostragem de texto ───────────────────────── */

/** Baseline de um retângulo de Range (área de conteúdo da fonte). */
function baselineOf(r: DOMRect, m: TextMetrics) {
  const asc = m.fontBoundingBoxAscent
  const desc = m.fontBoundingBoxDescent
  return r.top + r.height * (asc > 0 && desc >= 0 ? asc / (asc + desc) : 0.774)
}

/**
 * Glifos de um elemento medidos no DOM (um Range por caractere, em ordem de
 * leitura) — as partículas caem exatamente sobre as letras reais.
 */
function domGlyphs(el: HTMLElement, ctx: CanvasRenderingContext2D, fam: string): Glyph[] {
  const fs = parseFloat(getComputedStyle(el).fontSize)
  ctx.font = `800 ${fs}px ${fam}`
  const m = ctx.measureText('G')
  const out: Glyph[] = []
  const range = document.createRange()
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? ''
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (ch.trim() === '') continue
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      const r = range.getBoundingClientRect()
      out.push({ ch, x: r.left, base: baselineOf(r, m), fs, red: ch === '.' })
    }
  }
  return out
}

/**
 * Desenha cada glifo sozinho num canvas fora da tela e amostra a tinta numa
 * grade com jitter. Passo uniforme, o menor que o orçamento permite: partículas
 * pequenas e próximas desenham a letra inteira, não um pontilhado ralo.
 */
function sampleGlyphs(
  ctx: CanvasRenderingContext2D,
  glyphs: Glyph[],
  fam: string,
  cap: number,
  minStep: number,
): Formation {
  const W = ctx.canvas.width
  const H = ctx.canvas.height
  const G = glyphs.length
  if (!G || !W || !H) return EMPTY

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // 1) tinta de cada glifo isolado (uma partícula nunca cai na letra vizinha)
  const box = new Int32Array(G * 4)
  const inks: Array<Uint8ClampedArray | null> = []
  let ink = 0
  let font = ''
  for (let gi = 0; gi < G; gi++) {
    const gl = glyphs[gi]
    const f = `800 ${gl.fs}px ${fam}`
    if (f !== font) {
      ctx.font = f
      font = f
    }
    const m = ctx.measureText(gl.ch)
    const x0 = clampInt(Math.floor(gl.x - m.actualBoundingBoxLeft) - 1, 0, W)
    const x1 = clampInt(Math.ceil(gl.x + m.actualBoundingBoxRight) + 1, 0, W)
    const y0 = clampInt(Math.floor(gl.base - m.actualBoundingBoxAscent) - 1, 0, H)
    const y1 = clampInt(Math.ceil(gl.base + m.actualBoundingBoxDescent) + 1, 0, H)
    box[gi * 4] = x0
    box[gi * 4 + 1] = y0
    box[gi * 4 + 2] = x1
    box[gi * 4 + 3] = y1
    if (x1 <= x0 || y1 <= y0) {
      inks.push(null)
      continue
    }
    ctx.fillText(gl.ch, gl.x, gl.base)
    const data = ctx.getImageData(x0, y0, x1 - x0, y1 - y0).data
    ctx.clearRect(x0, y0, x1 - x0, y1 - y0)
    for (let p = 3; p < data.length; p += 4) if (data[p] > 128) ink++
    inks.push(data)
  }
  if (!ink) return EMPTY
  const step = Math.max(minStep, Math.sqrt(ink / Math.max(1, cap)))
  const size = Math.min(1.5, Math.max(0.8, step * 0.46))

  // 2) grade com jitter, glifo a glifo
  const xs: number[] = []
  const ys: number[] = []
  const ss: number[] = []
  const gs: number[] = []
  const rs: number[] = []
  const starts = new Uint32Array(G + 1)
  for (let gi = 0; gi < G; gi++) {
    starts[gi] = xs.length
    const data = inks[gi]
    if (!data) continue
    const x0 = box[gi * 4]
    const y0 = box[gi * 4 + 1]
    const x1 = box[gi * 4 + 2]
    const y1 = box[gi * 4 + 3]
    const bw = x1 - x0
    const red = glyphs[gi].red ? 1 : 0
    for (let gy = y0; gy < y1; gy += step) {
      for (let gx = x0; gx < x1; gx += step) {
        // jitter contido: pontilhado orgânico, mas limpo
        const px = gx + (0.2 + Math.random() * 0.6) * step
        const py = gy + (0.2 + Math.random() * 0.6) * step
        const ix = px | 0
        const iy = py | 0
        if (ix >= x1 || iy >= y1 || data[((iy - y0) * bw + (ix - x0)) * 4 + 3] <= 128) continue
        xs.push(px)
        ys.push(py)
        ss.push(size * (0.85 + Math.random() * 0.3))
        gs.push(gi)
        rs.push(red)
      }
    }
  }
  starts[G] = xs.length
  return {
    n: xs.length,
    x: Float32Array.from(xs),
    y: Float32Array.from(ys),
    s: Float32Array.from(ss),
    g: Uint16Array.from(gs),
    red: Uint8Array.from(rs),
    glyphs: G,
    gs: starts,
    fs: glyphs[0].fs,
  }
}

/* ───────────────────────── Campo de partículas ───────────────────────── */

class ParticleField {
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D | null
  w = 0
  h = 0
  n = 0
  /** 1 = chegada letra a letra · 2 = parado sobre o texto (saída) · 3 = burst até o logo */
  mode = 0
  /** antecipação antes do burst (0→1, tween do GSAP) */
  charge = 0
  /** opacidade global (crossfade com o texto na saída e com o logo DOM no fim) */
  alpha = 1
  px = -1e4
  py = -1e4
  pointer = false
  /** nada a desenhar (a frase está nítida no DOM): o loop só confere o tempo */
  private idle = false
  private idleAt = 1e9
  private streak = 1.2
  // grupos por glifo (partículas contíguas): alpha atual e início do fade-out de cada letra
  private G = 0
  private GS: Uint32Array = new Uint32Array(1)
  private GA = f32(0)
  private GF = f32(0)
  // posição atual / anterior (rastro de movimento)
  private X = f32(0)
  private Y = f32(0)
  private PX = f32(0)
  private PY = f32(0)
  // deslocamento do ponteiro (mola amortecida)
  private OX = f32(0)
  private OY = f32(0)
  private VX = f32(0)
  private VY = f32(0)
  // aparência
  private SZ = f32(0)
  private SA = f32(0)
  private SB = f32(0)
  private LUM = new Uint8Array(0)
  private CA = new Uint8Array(0)
  private CB = new Uint8Array(0)
  private BK = new Uint8Array(0)
  private FLIP = f32(0)
  // voo
  private T0 = f32(0)
  private DU = f32(0)
  private TX = f32(0)
  private TY = f32(0)
  private FX = f32(0)
  private FY = f32(0)
  private R0 = f32(0)
  private A0 = f32(0)
  private DA = f32(0)
  private B0X = f32(0)
  private B0Y = f32(0)
  private B1X = f32(0)
  private B1Y = f32(0)
  private B2X = f32(0)
  private B2Y = f32(0)

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  get ready() {
    return this.ctx !== null
  }

  resize(w: number, h: number) {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    this.w = w
    this.h = h
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  /** Recentraliza tudo quando só a altura muda (barra de endereço no mobile). */
  shift(dx: number, dy: number) {
    for (const a of [this.X, this.PX, this.TX, this.FX, this.B0X, this.B1X, this.B2X]) {
      for (let i = 0; i < a.length; i++) a[i] += dx
    }
    for (const a of [this.Y, this.PY, this.TY, this.FY, this.B0Y, this.B1Y, this.B2Y]) {
      for (let i = 0; i < a.length; i++) a[i] += dy
    }
  }

  clear() {
    this.ctx?.clearRect(0, 0, this.w, this.h)
  }

  /** (Re)cria os arrays para uma formação — só na troca de fase, nunca por frame. */
  private alloc(A: Formation) {
    const n = A.n
    this.n = n
    this.X = f32(n)
    this.Y = f32(n)
    this.PX = f32(n)
    this.PY = f32(n)
    this.OX = f32(n)
    this.OY = f32(n)
    this.VX = f32(n)
    this.VY = f32(n)
    this.SZ = f32(n)
    this.SA = f32(n)
    this.SB = f32(n)
    this.LUM = new Uint8Array(n)
    this.CA = new Uint8Array(n)
    this.CB = new Uint8Array(n)
    this.BK = new Uint8Array(n)
    this.FLIP = f32(n)
    this.T0 = f32(n)
    this.DU = f32(n)
    this.TX = f32(n)
    this.TY = f32(n)
    this.FX = f32(n)
    this.FY = f32(n)
    this.R0 = f32(n)
    this.A0 = f32(n)
    this.DA = f32(n)
    this.B0X = f32(n)
    this.B0Y = f32(n)
    this.B1X = f32(n)
    this.B1Y = f32(n)
    this.B2X = f32(n)
    this.B2Y = f32(n)
    this.G = A.glyphs
    this.GS = A.gs
    this.GA = f32(A.glyphs).fill(1)
    this.GF = f32(A.glyphs).fill(1e9)
    this.idle = false
    this.idleAt = 1e9
  }

  /**
   * Chegada: as partículas de cada letra partem do repouso num leque à direita
   * dela (onde o texto ainda vai se formar) e entram numa espiral curta, letra
   * após letra. Ao pousar, a letra nítida assume e as partículas dela somem.
   */
  initText(A: Formation) {
    this.alloc(A)
    const n = A.n
    const G = A.glyphs
    for (let g = 0; g < G; g++) this.GF[g] = glyphAt(g, G) + FADE_AT
    this.idleAt = glyphAt(G - 1, G) + FADE_AT + FADE_DUR
    const fs = A.fs
    let sum = 0
    for (let i = 0; i < n; i++) {
      const tx = A.x[i]
      const ty = A.y[i]
      const a0 = (Math.random() + Math.random() - 1) * 1.0
      const r0 = fs * (0.45 + Math.random() * 1.6)
      const fx = tx + Math.cos(a0) * r0
      const fy = ty + Math.sin(a0) * r0
      this.R0[i] = r0
      this.A0[i] = a0
      this.DA[i] = 0.45 + Math.random() * 0.6
      this.FX[i] = fx
      this.FY[i] = fy
      this.X[i] = fx
      this.Y[i] = fy
      this.PX[i] = fx
      this.PY[i] = fy
      this.TX[i] = tx
      this.TY[i] = ty
      this.T0[i] = glyphAt(A.g[i], G) + Math.random() * 0.1
      this.DU[i] = FLY + Math.random() * 0.16
      const s = A.s[i]
      this.SA[i] = s
      this.SB[i] = s
      sum += s
      // o ponto final já nasce vermelho; algumas faíscas vermelhas "esfriam" para branco no voo
      const red = A.red[i]
      const spark = !red && Math.random() < 0.03 ? 1 : 0
      this.CA[i] = red || spark
      this.CB[i] = red
      this.FLIP[i] = spark ? this.T0[i] + this.DU[i] * 0.6 : 1e9
      this.LUM[i] = Math.random() < 0.25 ? 1 : 0
    }
    this.streak = n ? (sum / n) * 0.8 : 1.2
    this.mode = 1
  }

  /** Saída: partículas exatamente sobre as letras nítidas (posições recém-medidas no DOM). */
  initStatic(A: Formation) {
    this.alloc(A)
    const n = A.n
    let sum = 0
    for (let i = 0; i < n; i++) {
      const x = A.x[i]
      const y = A.y[i]
      this.X[i] = x
      this.Y[i] = y
      this.PX[i] = x
      this.PY[i] = y
      this.TX[i] = x
      this.TY[i] = y
      const s = A.s[i]
      this.SA[i] = s
      this.SB[i] = s
      this.SZ[i] = s
      sum += s
      this.CA[i] = A.red[i]
      this.CB[i] = A.red[i]
      this.FLIP[i] = 1e9
      this.LUM[i] = Math.random() < 0.25 ? 1 : 0
    }
    this.streak = n ? (sum / n) * 0.8 : 1.2
    this.mode = 2
  }

  /**
   * Burst: explode para fora e se reagrupa no logo. O ponto vermelho da frase
   * vai para o ponto vermelho do logo; o resto em pares ordenados por x (com ruído).
   */
  toMark(B: Formation, t: number) {
    const n = this.n
    const m = B.n
    if (!n || !m) return
    const cx = this.w / 2
    const cy = this.h / 2
    const vmin = Math.min(this.w, this.h)
    const noise = this.w * 0.1
    const k = 1 - this.charge * 0.035
    const { TX, TY, CA, CB, FLIP } = this
    const target = new Int32Array(n).fill(-1)
    const used = new Uint8Array(m)

    // 1) vermelho → vermelho
    const rp: number[] = []
    const rb: number[] = []
    for (let i = 0; i < n; i++) if (CB[i]) rp.push(i)
    for (let j = 0; j < m; j++) if (B.red[j]) rb.push(j)
    if (rp.length && rb.length) {
      rp.sort((a, b) => TX[a] - TX[b])
      rb.sort((a, b) => B.x[a] - B.x[b])
      for (let r = 0; r < rp.length; r++) {
        const j = rb[Math.min(rb.length - 1, Math.floor((r * rb.length) / rp.length))]
        target[rp[r]] = j
        used[j] = 1
      }
    }

    // 2) o resto (alvos vermelhos que sobraram recebem partículas que avermelham no voo)
    const pi: number[] = []
    const bi: number[] = []
    for (let i = 0; i < n; i++) if (target[i] < 0) pi.push(i)
    for (let j = 0; j < m; j++) if (!used[j]) bi.push(j)
    if (!bi.length) for (let j = 0; j < m; j++) bi.push(j)
    const pk = f32(n)
    for (let i = 0; i < n; i++) pk[i] = TX[i] + (Math.random() - 0.5) * noise
    const bk = f32(m)
    for (let j = 0; j < m; j++) bk[j] = B.x[j] + (Math.random() - 0.5) * noise
    pi.sort((a, b) => pk[a] - pk[b])
    bi.sort((a, b) => bk[a] - bk[b])
    for (let r = 0; r < pi.length; r++) {
      target[pi[r]] = bi[Math.min(bi.length - 1, Math.floor((r * bi.length) / pi.length))]
    }
    const dup = n > m ? 0.6 : 0

    for (let i = 0; i < n; i++) {
      const j = target[i]
      const tx = B.x[j] + (Math.random() - 0.5) * dup
      const ty = B.y[j] + (Math.random() - 0.5) * dup
      // ponto de partida = letra já contraída
      const sx = cx + (TX[i] - cx) * k
      const sy = cy + (TY[i] - cy) * k
      let dx = sx - cx
      let dy = sy - cy
      let d = Math.sqrt(dx * dx + dy * dy)
      if (d < 1) {
        const a = Math.random() * Math.PI * 2
        dx = Math.cos(a)
        dy = Math.sin(a)
        d = 1
      }
      const ux = dx / d
      const uy = dy / d
      const burst = vmin * (0.05 + Math.random() * 0.1)
      const side = (Math.random() - 0.5) * burst * 0.8
      let ex = tx - cx
      let ey = ty - cy
      const de = Math.sqrt(ex * ex + ey * ey) || 1
      ex /= de
      ey /= de
      const pull = vmin * (0.03 + Math.random() * 0.07)

      this.B0X[i] = sx
      this.B0Y[i] = sy
      this.B1X[i] = sx + ux * burst - uy * side
      this.B1Y[i] = sy + uy * burst + ux * side
      this.B2X[i] = tx + ex * pull
      this.B2Y[i] = ty + ey * pull
      TX[i] = tx
      TY[i] = ty
      CA[i] = t >= FLIP[i] ? CB[i] : CA[i] // cor atual vira a de partida
      this.T0[i] = t + Math.random() * 0.12
      this.DU[i] = 0.8 + Math.random() * 0.2
      this.SB[i] = B.s[j]
      CB[i] = B.red[j]
      FLIP[i] = CA[i] === CB[i] ? 1e9 : this.T0[i] + this.DU[i] * (0.18 + Math.random() * 0.3)
    }
    this.mode = 3
  }

  frame(t: number, dt: number) {
    const n = this.n
    const ctx = this.ctx
    if (!n || !ctx || this.idle) return
    const mode = this.mode
    if (mode === 1) {
      if (t >= this.idleAt) {
        // a frase inteira já está nítida no DOM: canvas limpo e loop ocioso até a saída
        ctx.clearRect(0, 0, this.w, this.h)
        this.idle = true
        return
      }
      const { GA, GF } = this
      for (let g = 0; g < this.G; g++) {
        const q = (t - GF[g]) / FADE_DUR
        GA[g] = q <= 0 ? 1 : q >= 1 ? 0 : 1 - q * q * (3 - 2 * q)
      }
    }
    const { X, Y, OX, OY, VX, VY, SZ, SA, SB, LUM, CA, CB, BK, FLIP, T0, DU, TX, TY } = this
    const { FX, FY, R0, A0, DA, B0X, B0Y, B1X, B1Y, B2X, B2Y } = this
    const cx = this.w * 0.5
    const cy = this.h * 0.5
    const k60 = Math.min(3, Math.max(0.25, dt * 60))
    const damp = Math.pow(0.85, k60)
    const spring = 0.05 * k60
    const pointer = this.pointer
    const pxp = this.px
    const pyp = this.py
    const R = Math.max(70, Math.min(this.w, this.h) * 0.13)
    const R2 = R * R
    const push = 2.4 * k60
    const ck = mode === 2 ? 1 - this.charge * 0.035 : 1

    for (let i = 0; i < n; i++) {
      let bx: number
      let by: number
      let s: number
      if (mode === 1) {
        const u = (t - T0[i]) / DU[i]
        if (u <= 0) {
          bx = FX[i]
          by = FY[i]
          s = 0
        } else if (u >= 1) {
          bx = TX[i]
          by = TY[i]
          s = SA[i]
        } else {
          // espiral curta: sai do repouso (sem estalo) e assenta devagar no alvo
          const v = 1 - u
          const v2 = v * v
          const e = 1 - v2 * v2 * (1 + 4 * u)
          const r = R0[i] * (1 - e)
          const a = A0[i] + DA[i] * e
          bx = TX[i] + Math.cos(a) * r
          by = TY[i] + Math.sin(a) * r
          s = u < 0.25 ? SA[i] * u * 4 : SA[i]
        }
      } else if (mode === 2) {
        bx = cx + (TX[i] - cx) * ck
        by = cy + (TY[i] - cy) * ck
        s = SA[i]
      } else {
        const u = (t - T0[i]) / DU[i]
        if (u <= 0) {
          bx = B0X[i]
          by = B0Y[i]
          s = SA[i]
        } else if (u >= 1) {
          bx = TX[i]
          by = TY[i]
          s = SB[i]
        } else {
          // bézier cúbica: sai para fora (burst) e entra no logo vindo de fora
          const v = 1 - u
          const e = 1 - v * v * v
          const ie = 1 - e
          const c0 = ie * ie * ie
          const c1 = 3 * ie * ie * e
          const c2 = 3 * ie * e * e
          const c3 = e * e * e
          bx = c0 * B0X[i] + c1 * B1X[i] + c2 * B2X[i] + c3 * TX[i]
          by = c0 * B0Y[i] + c1 * B1Y[i] + c2 * B2Y[i] + c3 * TY[i]
          s = SA[i] + (SB[i] - SA[i]) * e
        }
      }

      // ponteiro empurra; mola traz de volta
      let ox = OX[i]
      let oy = OY[i]
      if (pointer || ox !== 0 || oy !== 0) {
        let vx = VX[i]
        let vy = VY[i]
        if (pointer) {
          const dx = bx + ox - pxp
          const dy = by + oy - pyp
          const d2 = dx * dx + dy * dy
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const f = 1 - d / R
            const g = (f * f * push) / d
            vx += dx * g
            vy += dy * g
          }
        }
        vx = (vx - ox * spring) * damp
        vy = (vy - oy * spring) * damp
        ox += vx * k60
        oy += vy * k60
        if (ox * ox + oy * oy < 0.0004 && vx * vx + vy * vy < 0.0004) {
          ox = 0
          oy = 0
          vx = 0
          vy = 0
        }
        OX[i] = ox
        OY[i] = oy
        VX[i] = vx
        VY[i] = vy
      }

      X[i] = bx + ox
      Y[i] = by + oy
      SZ[i] = s
      BK[i] = (t >= FLIP[i] ? CB[i] : CA[i]) ? 2 : LUM[i]
    }
    this.draw()
  }

  /** Letra a letra (cada uma com seu alpha): três passes em lote (branco forte, branco suave, vermelho), cada um com seu rastro. */
  private draw() {
    const ctx = this.ctx
    if (!ctx) return
    const { X, Y, PX, PY, SZ, BK, GS, GA } = this
    ctx.clearRect(0, 0, this.w, this.h)
    if (this.alpha > 0.003) {
      ctx.lineWidth = this.streak
      for (let g = 0; g < this.G; g++) {
        const ga = GA[g] * this.alpha
        if (ga < 0.003) continue
        const i0 = GS[g]
        const i1 = GS[g + 1]
        for (let b = 0; b < 3; b++) {
          const a = (b === 0 ? 0.95 : b === 1 ? 0.5 : 1) * ga
          const color = b === 2 ? RED : '#ffffff'
          ctx.globalAlpha = a
          ctx.fillStyle = color
          for (let i = i0; i < i1; i++) {
            const s = SZ[i]
            if (BK[i] !== b || s < 0.05) continue
            ctx.fillRect(X[i] - s * 0.5, Y[i] - s * 0.5, s, s)
          }
          // rastro = deslocamento deste frame (motion blur sem acumular fantasmas)
          ctx.beginPath()
          let any = false
          for (let i = i0; i < i1; i++) {
            if (BK[i] !== b || SZ[i] < 0.05) continue
            const dx = X[i] - PX[i]
            const dy = Y[i] - PY[i]
            const d2 = dx * dx + dy * dy
            if (d2 > 4 && d2 < 40000) {
              ctx.moveTo(PX[i], PY[i])
              ctx.lineTo(X[i], Y[i])
              any = true
            }
          }
          if (any) {
            ctx.globalAlpha = a * (this.mode === 1 ? 0.2 : 0.42)
            ctx.strokeStyle = color
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
    }
    PX.set(X)
    PY.set(Y)
  }
}

/* ───────────────────────── Componente ───────────────────────── */

export default function Intro({ onReveal, onComplete }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const discRef = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const skipWrapRef = useRef<HTMLSpanElement>(null)
  const skipFnRef = useRef<() => void>(() => {})

  // callbacks mais recentes + "exatamente uma vez" (sobrevive ao duplo mount do StrictMode)
  const cbRef = useRef({ onReveal, onComplete })
  const firedRef = useRef({ reveal: false, complete: false })
  useEffect(() => {
    cbRef.current = { onReveal, onComplete }
  }, [onReveal, onComplete])

  useLayoutEffect(() => {
    const root = rootRef.current
    const inner = innerRef.current
    const canvas = canvasRef.current
    const textEl = textRef.current
    const markWrap = markRef.current
    const glow = glowRef.current
    const disc = discRef.current
    const hud = hudRef.current
    const count = countRef.current
    const bar = barRef.current
    const skipWrap = skipWrapRef.current
    if (!root || !inner || !canvas || !textEl || !markWrap || !glow || !disc || !hud || !count || !bar || !skipWrap) {
      return
    }

    const html = document.documentElement
    const fired = firedRef.current
    const markEl = markWrap.firstElementChild instanceof HTMLElement ? markWrap.firstElementChild : null
    const dotEl = markEl?.lastElementChild instanceof HTMLElement ? markEl.lastElementChild : null
    // letras da frase em ordem de leitura (mesma ordem dos glifos medidos)
    const chars = Array.from(textEl.querySelectorAll<HTMLElement>('[data-c]'))
    const periodEl = chars.find((c) => c.textContent === '.') ?? null

    const fireReveal = () => {
      if (fired.reveal) return
      fired.reveal = true
      playedThisDocument = true
      cbRef.current.onReveal()
    }
    const fireComplete = () => {
      fireReveal()
      if (fired.complete) return
      fired.complete = true
      cbRef.current.onComplete()
    }

    // Se o JS chegou tão tarde que o failsafe em CSS já escondeu a intro, não a reexibe.
    const failsafeHit = parseFloat(getComputedStyle(root).opacity) < 0.98
    root.removeAttribute('data-failsafe')

    if (
      new URLSearchParams(window.location.search).get('intro') === '0' ||
      playedThisDocument ||
      failsafeHit ||
      fired.complete
    ) {
      root.removeAttribute('data-lock')
      root.style.display = 'none'
      fireComplete()
      return
    }

    /* ── trava de rolagem ── */
    const prevOverflow = html.style.overflow
    let locked = true
    html.style.overflow = 'hidden'
    html.dataset.intro = 'running'
    // O Lenis nasce depois deste efeito (efeito do pai) e outros efeitos podem
    // mexer no overflow ao montar: reafirma a trava a cada frame enquanto o canvas roda.
    const holdLock = () => {
      if (!locked) return
      const l = getLenis()
      if (l && !l.isStopped) l.stop()
      if (html.style.overflow !== 'hidden') html.style.overflow = 'hidden'
    }
    holdLock()
    const unlock = () => {
      if (!locked) return
      locked = false
      root.removeAttribute('data-lock')
      html.style.overflow = prevOverflow
      delete html.dataset.intro
      getLenis()?.start()
    }
    const scrollTop = () => {
      getLenis()?.scrollTo(0, { immediate: true, force: true })
      window.scrollTo(0, 0)
    }

    /* ── estado ── */
    let disposed = false
    let finished = false
    let exiting = false
    let active: gsap.core.Timeline | null = null
    let master: gsap.core.Timeline | null = null
    let pulseTl: gsap.core.Timeline | null = null
    let stopLoop: (clear: boolean) => void = () => {}
    let skip: (origin: Dot | null) => void = () => {}
    const cleanups: Array<() => void> = []
    const detach = () => {
      while (cleanups.length) cleanups.pop()?.()
    }

    const finish = () => {
      if (finished) return
      finished = true
      stopLoop(true)
      detach()
      unlock()
      root.style.display = 'none'
      fireComplete()
    }

    const skipOrigin = (): Dot => {
      const r = skipWrap.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, d: r.height * 0.5 }
    }
    skipFnRef.current = () => skip(skipOrigin())

    /* ── listeners comuns ── */
    const blockWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopImmediatePropagation()
    }
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      if (k === 'Escape' || k === 'Enter' || k === ' ' || k === 'Spacebar') {
        e.preventDefault()
        skip(skipOrigin())
      } else if (SCROLL_KEYS.has(k)) {
        e.preventDefault()
      }
    }
    const onVisibility = () => {
      if (!active) return
      if (document.hidden) active.pause()
      else active.resume()
    }
    window.addEventListener('wheel', blockWheel, { passive: false, capture: true })
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVisibility)
    cleanups.push(() => {
      window.removeEventListener('wheel', blockWheel, { capture: true })
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onVisibility)
    })

    /* ── aguarda a Bricolage (máx. 1.2s) antes de mostrar/medir a frase ── */
    const fam =
      getComputedStyle(html).getPropertyValue('--font-bricolage').trim() || '"Bricolage Grotesque", sans-serif'
    const fontSpec = `800 120px ${fam}`
    let fontTimer = 0
    const fontsReady: Promise<void> = document.fonts
      ? Promise.race([
          document.fonts.load(fontSpec).then(
            () => undefined,
            () => undefined,
          ),
          new Promise<void>((resolve) => {
            fontTimer = window.setTimeout(resolve, 1200)
          }),
        ])
      : Promise.resolve()
    cleanups.push(() => window.clearTimeout(fontTimer))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      /* ── movimento reduzido: sem partículas — a frase nítida aparece, fica para leitura e some ── */
      count.textContent = '100'
      bar.style.transform = 'none'
      gsap.set(chars, { opacity: 1 })
      gsap.set(textEl, { opacity: 0 })
      const run = () => {
        if (disposed || exiting) return
        const tl = gsap.timeline({ paused: document.hidden })
        tl.to(textEl, { opacity: 1, duration: 0.45, ease: 'power1.out' }, 0.05)
        // primeiro somem a frase e o HUD (no escuro), só depois o fundo — sem a
        // frase branca por cima do hero claro durante o fade
        tl.to([textEl, hud], { opacity: 0, duration: 0.25, ease: 'power1.in' }, 1.95)
        tl.call(
          () => {
            exiting = true
            unlock()
            fireReveal()
          },
          [],
          2.2,
        )
        tl.to(root, { opacity: 0, duration: 0.4, ease: 'power1.out' }, 2.2)
        tl.call(finish)
        active = tl
      }
      void fontsReady.then(() => {
        window.clearTimeout(fontTimer)
        run()
      })
      skip = () => {
        if (exiting) return
        exiting = true
        active?.kill()
        finish()
      }
    } else {
      /* ── intro completa ── */
      const field = new ParticleField(canvas)
      const sctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
      let B: Formation = EMPTY // logo, amostrado na saída

      // loop de render no ticker do GSAP (mesmo rAF da timeline; para com a aba oculta)
      let last = performance.now()
      let loopOn = true
      const tick = () => {
        holdLock()
        const now = performance.now()
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        if (master && field.n) field.frame(master.time(), dt)
      }
      gsap.ticker.add(tick)
      stopLoop = (clear) => {
        if (loopOn) {
          gsap.ticker.remove(tick)
          loopOn = false
        }
        if (clear) {
          field.clear()
          canvas.style.visibility = 'hidden'
        }
      }

      const measureDot = (): Dot | null => {
        if (!dotEl || !sctx) return null
        const range = document.createRange()
        range.selectNodeContents(dotEl)
        const r = range.getBoundingClientRect()
        sctx.font = `800 ${parseFloat(getComputedStyle(dotEl).fontSize)}px ${fam}`
        const m = sctx.measureText('.')
        const base = baselineOf(r, m)
        const x0 = r.left - m.actualBoundingBoxLeft
        const x1 = r.left + m.actualBoundingBoxRight
        const y0 = base - m.actualBoundingBoxAscent
        const y1 = base + m.actualBoundingBoxDescent
        // o "." da Bricolage é um quadrado arredondado: diâmetro do círculo de mesma área
        return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, d: 1.067 * Math.sqrt(Math.max(1, (x1 - x0) * (y1 - y0))) }
      }

      const pulse = () => {
        const d = measureDot()
        if (!d || !dotEl) return
        const er = dotEl.getBoundingClientRect()
        const s = d.d * 7
        gsap.set(glow, { width: s, height: s, x: d.x - s / 2, y: d.y - s / 2 })
        pulseTl = gsap
          .timeline()
          .fromTo(
            dotEl,
            { scale: 1 },
            {
              scale: 1.32,
              duration: 0.2,
              ease: 'power2.out',
              yoyo: true,
              repeat: 1,
              transformOrigin: `${d.x - er.left}px ${d.y - er.top}px`,
            },
            0,
          )
          .fromTo(glow, { opacity: 0, scale: 0.35 }, { opacity: 1, scale: 1, duration: 0.24, ease: 'power2.out' }, 0)
          .to(glow, { opacity: 0, scale: 1.5, duration: 0.6, ease: 'power2.in' }, 0.24)
      }

      /** Fases 4–5 (normal ~1.6s, ao pular ~0.9s). */
      let exitFast = false
      const runExit = (fast: boolean, origin: Dot | null) => {
        if (exiting) {
          // pular durante a saída natural: acelera o que falta (termina em ≲0.85s)
          if (!fast || exitFast || !active || finished) return
          exitFast = true
          pulseTl?.kill()
          const rest = (active.duration() - active.time()) / active.timeScale()
          if (rest > 0.85) active.timeScale(active.timeScale() * (rest / 0.85))
          return
        }
        exiting = true
        exitFast = fast
        root.dataset.phase = 'exit'
        master?.kill()
        if (fast) {
          pulseTl?.kill()
          stopLoop(false) // congela o último frame; o disco o engole
        }
        const w = window.innerWidth
        const h = window.innerHeight
        const o = origin ?? measureDot() ?? { x: w / 2, y: h / 2, d: 24 }
        const D = 2 * Math.hypot(Math.max(o.x, w - o.x), Math.max(o.y, h - o.y)) + 8
        const s0 = Math.max(4, o.d) / D
        gsap.set(disc, { width: D, height: D, x: o.x - D / 2, y: o.y - D / 2, scale: s0, opacity: 1 })
        // o disco substitui o ponto no mesmo frame (mesma cor, mesma área)
        if (!fast && dotEl) gsap.set(dotEl, { opacity: 0 })
        const maxR = Math.hypot(w, h) / 2 + 8

        const ex = gsap.timeline({ paused: document.hidden })
        ex.to(hud, { opacity: 0, duration: fast ? 0.2 : 0.35, ease: 'power1.out' }, 0)
        ex.call(scrollTop, [], 0)
        if (fast) {
          ex.to(disc, { scale: 1, duration: 0.36, ease: 'power2.in' }, 0)
        } else {
          // antecipação: o ponto "respira" para dentro antes de engolir a tela
          ex.to(disc, { scale: s0 * 0.8, duration: 0.16, ease: 'power2.out' }, 0)
          ex.to(disc, { scale: 1, duration: 0.6, ease: 'expo.in' }, 0.16)
        }
        ex.call(() => {
          // tela inteira vermelha: troca as camadas por um único plano vermelho mascarado
          stopLoop(true)
          root.dataset.phase = 'reveal'
          root.style.backgroundColor = RED
          root.style.pointerEvents = 'none'
          inner.style.visibility = 'hidden'
          root.style.setProperty('--r', '0px')
          root.style.setProperty('-webkit-mask-image', MASK)
          root.style.setProperty('mask-image', MASK)
          unlock() // barra de rolagem volta enquanto tudo está coberto (sem salto visível)
          fireReveal()
        })
        ex.fromTo(
          root,
          { '--r': '0px' },
          { '--r': `${maxR}px`, duration: fast ? 0.55 : 0.9, ease: fast ? 'power3.out' : 'power2.inOut' },
        )
        ex.call(finish)
        active = ex
      }
      skip = (origin) => runExit(true, origin)

      const start = () => {
        if (disposed || exiting) return
        const G = chars.length
        if (!sctx || !field.ready || !G) {
          // sem canvas 2D: frase nítida, logo estático e saída normal (nunca prende o usuário)
          gsap.set(chars, { opacity: 1 })
          const tl = gsap.timeline({ paused: document.hidden })
          tl.fromTo(textEl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0.1)
            .to(textEl, { opacity: 0, duration: 0.35, ease: 'power1.in' }, 2.1)
            .to(markWrap, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 2.35)
            .call(() => runExit(false, null), [], 3.4)
          master = tl
          active = tl
          return
        }
        const w = root.clientWidth
        const h = root.clientHeight
        field.resize(w, h)
        const mobile = w < 768
        const cap = Math.round(
          (mobile ? 5000 : w >= 1800 ? 14000 : 10000) * ((navigator.hardwareConcurrency || 8) <= 4 ? 0.6 : 1),
        )
        const minStep = mobile ? 2.2 : 2.5
        const sample = (el: HTMLElement) => {
          sctx.canvas.width = root.clientWidth
          sctx.canvas.height = root.clientHeight
          return sampleGlyphs(sctx, domGlyphs(el, sctx, fam), fam, cap, minStep)
        }
        field.initText(sample(textEl))
        root.dataset.phase = 'text'

        const counter = { v: 0 }
        let shown = 0
        const tl = gsap.timeline({ paused: document.hidden })
        tl.to(
          counter,
          {
            v: 100,
            duration: T_EXIT - 0.15,
            ease: 'power1.inOut',
            onUpdate: () => {
              const v = Math.round(counter.v)
              if (v !== shown) {
                shown = v
                count.textContent = String(v).padStart(3, '0')
              }
              bar.style.transform = `scaleX(${(counter.v / 100).toFixed(4)})`
            },
          },
          0.05,
        )
        // cada letra "solidifica" em texto nítido enquanto suas partículas pousam (ordem de leitura)
        chars.forEach((el, g) => {
          tl.fromTo(
            el,
            { opacity: 0, filter: 'blur(6px)' },
            { opacity: 1, filter: 'blur(0px)', duration: SOLID_DUR, ease: 'power2.out', clearProps: 'filter' },
            glyphAt(g, G) + SOLID_AT,
          )
        })
        // leitura: só o ponto vermelho brilha, uma vez
        if (periodEl) {
          tl.fromTo(
            periodEl,
            { textShadow: '0 0 0em rgba(224,32,32,0)' },
            {
              textShadow: '0 0 0.35em rgba(224,32,32,0.55)',
              duration: 0.45,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: 1,
            },
            T_GLOW,
          )
        }
        tl.call(
          () => {
            // re-mede: a frase pode ter mudado de lugar (fonte que chegou tarde, barra do navegador)
            const A = sample(textEl)
            B = markEl ? sample(markEl) : EMPTY
            field.alpha = 0
            field.initStatic(A)
            root.dataset.phase = 'dissolve'
          },
          [],
          T_DISSOLVE,
        )
          .fromTo(field, { alpha: 0 }, { alpha: 1, duration: 0.12, ease: 'none', immediateRender: false }, T_DISSOLVE)
          .to(textEl, { opacity: 0, duration: 0.14, ease: 'power1.in' }, T_DISSOLVE)
          .to(field, { charge: 1, duration: T_BURST - T_CHARGE, ease: 'power2.in' }, T_CHARGE)
          .call(
            () => {
              field.toMark(B, T_BURST)
              root.dataset.phase = 'logo'
            },
            [],
            T_BURST,
          )
          .to(markWrap, { opacity: 1, duration: 0.45, ease: 'power1.inOut' }, T_MARK)
          .to(field, { alpha: 0, duration: 0.45, ease: 'power1.inOut' }, T_MARK)
          .call(pulse, [], T_PULSE)
          .call(() => stopLoop(true), [], T_STOP)
          .call(() => runExit(false, null), [], T_EXIT)
        master = tl
        active = tl
      }

      void fontsReady.then(() => {
        window.clearTimeout(fontTimer)
        start()
      })

      /* ── ponteiro: empurra partículas; toque/clique curto pula ── */
      let press: { x: number; y: number; t: number } | null = null
      const onMove = (e: PointerEvent) => {
        field.px = e.clientX
        field.py = e.clientY
        field.pointer = true
      }
      const onDown = (e: PointerEvent) => {
        press = { x: e.clientX, y: e.clientY, t: performance.now() }
        onMove(e)
      }
      const onUp = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') field.pointer = false
        const p = press
        press = null
        if (p && e.button === 0 && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 12 && performance.now() - p.t < 700) {
          skip({ x: e.clientX, y: e.clientY, d: 18 })
        }
      }
      const onLeave = () => {
        field.pointer = false
        press = null
      }
      root.addEventListener('pointermove', onMove)
      root.addEventListener('pointerdown', onDown)
      root.addEventListener('pointerup', onUp)
      root.addEventListener('pointerleave', onLeave)
      root.addEventListener('pointercancel', onLeave)

      /* ── resize: mudanças pequenas (barra do mobile, barra de rolagem) recentralizam;
            mudança real de largura (rotação, janela) encerra com elegância ── */
      let baseW = root.clientWidth
      let baseH = root.clientHeight
      const ro = new ResizeObserver(() => {
        const w = root.clientWidth
        const h = root.clientHeight
        if (w === baseW && h === baseH) return
        const dx = (w - baseW) / 2
        const dy = (h - baseH) / 2
        baseW = w
        baseH = h
        if (exiting || !field.n) return
        if (Math.abs(dx) > 20) {
          skip(null)
          return
        }
        field.resize(w, h)
        field.shift(dx, dy)
        shiftFormation(B, dx, dy)
      })
      ro.observe(root)

      cleanups.push(() => {
        ro.disconnect()
        root.removeEventListener('pointermove', onMove)
        root.removeEventListener('pointerdown', onDown)
        root.removeEventListener('pointerup', onUp)
        root.removeEventListener('pointerleave', onLeave)
        root.removeEventListener('pointercancel', onLeave)
      })
    }

    return () => {
      disposed = true
      skipFnRef.current = () => {}
      master?.kill()
      active?.kill()
      pulseTl?.kill()
      stopLoop(false)
      detach()
      if (!finished) unlock()
    }
  }, [])

  return (
    <section
      ref={rootRef}
      aria-label="Introdução"
      data-lock=""
      data-failsafe=""
      className="gam-intro fixed inset-0 z-[9998] touch-none select-none overflow-hidden bg-[#0e1015] text-mist"
    >
      <style>{CSS}</style>
      <noscript>
        <style>{NOSCRIPT_CSS}</style>
      </noscript>

      {/* leitores de tela recebem a frase inteira, uma vez (as letras visuais ficam ocultas) */}
      <p className="sr-only">{SENTENCE_TEXT}</p>

      <div ref={innerRef} className="absolute inset-0">
        {/* textura: pontos sutis + luz central + grão (estáticos) */}
        <div
          aria-hidden="true"
          className="bg-dot-grid-light absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000_15%,transparent_72%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_62%)]"
        />
        <div aria-hidden="true" className="gam-grain" />

        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

        {/* brilho do pulso do ponto (gradiente, sem blur) */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 rounded-full opacity-0 [background:radial-gradient(circle,rgba(224,32,32,0.5)_0%,rgba(224,32,32,0.16)_38%,rgba(224,32,32,0)_70%)]"
        />

        {/* frase de boas-vindas — tipografia real; as partículas são amostradas das letras dela */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center px-4">
          <p
            ref={textRef}
            className="gam-intro-text text-center font-display font-extrabold leading-none tracking-[-0.025em] text-white"
          >
            {SENTENCE.map((groups, li) => (
              <span key={li} className="block">
                {groups.map((group, gi) => (
                  <Fragment key={gi}>
                    {gi > 0 && ' '}
                    <span className="whitespace-nowrap">
                      {Array.from(group, (ch, ci) =>
                        ch === ' ' ? (
                          ' '
                        ) : (
                          <span key={ci} data-c="" className={ch === '.' ? 'text-red' : undefined}>
                            {ch}
                          </span>
                        ),
                      )}
                    </span>
                  </Fragment>
                ))}
              </span>
            ))}
          </p>
        </div>

        {/* logo nítido — as partículas são amostradas a partir da posição real dele */}
        <div
          ref={markRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid place-items-center opacity-0"
          style={{ fontSize: 'min(34vw, 44vh, 22rem)' }}
        >
          <Mark tone="dark" className="tracking-[-0.02em]" />
        </div>

        {/* HUD */}
        <div
          ref={hudRef}
          className="pointer-events-none absolute inset-0 flex flex-col justify-between px-4 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-7"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="gam-intro-in" style={{ animationDelay: '0.1s' }}>
              <Wordmark tone="dark" className="text-[15px] sm:text-[17px]" />
            </div>
            <div
              className="gam-intro-in text-right text-[12px] leading-[1.55] sm:text-[13px]"
              style={{ animationDelay: '0.2s' }}
            >
              <p className="text-mist">Goiânia, Brasil</p>
              <p className="text-mist-2">Brasil, EUA e Europa</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-6">
            <p
              aria-hidden="true"
              className="gam-intro-in flex items-baseline gap-1 pb-1 font-mono"
              style={{ animationDelay: '0.3s' }}
            >
              <span ref={countRef} className="text-[13px] tabular-nums text-mist">
                000
              </span>
              <span className="text-[10px] text-mist-2">%</span>
            </p>
            <div
              className="gam-intro-in pointer-events-auto flex items-center gap-4"
              style={{ animationDelay: '0.4s' }}
            >
              <span className="hidden text-[12px] text-mist-2 [@media(pointer:fine)]:inline">
                ou pressione{' '}
                <kbd className="rounded-md border border-white/15 px-1.5 py-0.5 font-mono text-[11px] text-mist">
                  Esc
                </kbd>
              </span>
              <span ref={skipWrapRef} className="inline-flex">
                <Button variant="outline-light" size="md" icon="arrow" magnetic={false} onClick={() => skipFnRef.current()}>
                  Pular intro
                </Button>
              </span>
            </div>
          </div>

          {/* linha de progresso */}
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 block h-0.5 bg-white/[0.07]">
            <span ref={barRef} className="block h-full origin-left bg-red" style={{ transform: 'scaleX(0)' }} />
          </span>
        </div>

        {/* disco vermelho que nasce do ponto (só transform: scale) */}
        <div ref={discRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 rounded-full bg-red opacity-0" />
      </div>
    </section>
  )
}
