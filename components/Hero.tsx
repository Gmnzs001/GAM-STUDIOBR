'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

// ── Wave canvas (from GlowyWavesHero) ─────────────────────────────────────────
type Wave = { offset: number; amplitude: number; frequency: number; color: string; opacity: number }

const WAVES: Wave[] = [
  { offset: 0,              amplitude: 70, frequency: 0.003,  color: 'rgba(224,32,32,0.8)',    opacity: 0.45 },
  { offset: Math.PI / 2,   amplitude: 90, frequency: 0.0026, color: 'rgba(224,32,32,0.6)',    opacity: 0.35 },
  { offset: Math.PI,        amplitude: 60, frequency: 0.0034, color: 'rgba(255,100,100,0.5)',  opacity: 0.30 },
  { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: 'rgba(255,255,255,0.2)',  opacity: 0.25 },
  { offset: Math.PI * 2,   amplitude: 55, frequency: 0.004,  color: 'rgba(255,255,255,0.15)', opacity: 0.20 },
]

function WaveCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let id: number, t = 0
    const mouse = { x: 0, y: 0 }
    const aim   = { x: 0, y: 0 }

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      mouse.x = aim.x = canvas.width  / 2
      mouse.y = aim.y = canvas.height / 2
    }
    resize()

    const onMove  = (e: MouseEvent) => { aim.x = e.clientX; aim.y = e.clientY }
    const onLeave = () => { aim.x = canvas.width / 2; aim.y = canvas.height / 2 }
    window.addEventListener('resize',      resize)
    window.addEventListener('mousemove',   onMove)
    window.addEventListener('mouseleave',  onLeave)

    const drawWave = (w: Wave) => {
      ctx.save(); ctx.beginPath()
      for (let x = 0; x <= canvas.width; x += 4) {
        const dx   = x - mouse.x
        const dy   = canvas.height / 2 - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const inf  = Math.max(0, 1 - dist / 320)
        const pull = inf * 70 * Math.sin(t * 0.001 + x * 0.01 + w.offset)
        const y    = canvas.height / 2
          + Math.sin(x * w.frequency + t * 0.002 + w.offset) * w.amplitude
          + Math.sin(x * w.frequency * 0.4 + t * 0.003)      * (w.amplitude * 0.45)
          + pull
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.lineWidth   = 2.5
      ctx.strokeStyle = w.color
      ctx.globalAlpha = w.opacity
      ctx.shadowBlur  = 35
      ctx.shadowColor = w.color
      ctx.stroke(); ctx.restore()
    }

    const animate = () => {
      t++
      mouse.x += (aim.x - mouse.x) * 0.1
      mouse.y += (aim.y - mouse.y) * 0.1
      ctx.globalAlpha = 1; ctx.shadowBlur = 0
      ctx.fillStyle = '#0A0A0A'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      WAVES.forEach(drawWave)
      id = requestAnimationFrame(animate)
    }
    id = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize',     resize)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden />
}

// ── Scramble title ─────────────────────────────────────────────────────────────
const CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%ÇÃÕ!?'
const TARGET = 'SUA MARCA NO PRÓXIMO NÍVEL'

function useScramble(target: string, delay = 350) {
  const [text, setText] = useState(() => target.replace(/[^ ]/g, CHARS[0]))

  useEffect(() => {
    let frame = 0; let iv: ReturnType<typeof setInterval>
    const total = 40
    const t = setTimeout(() => {
      iv = setInterval(() => {
        const revealed = Math.floor((frame / total) * target.length)
        setText(
          target.split('').map((ch, i) => {
            if (ch === ' ') return ' '
            if (i < revealed) return ch
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          }).join('')
        )
        if (++frame > total) { clearInterval(iv); setText(target) }
      }, 42)
    }, delay)
    return () => { clearTimeout(t); clearInterval(iv) }
  }, [target, delay])

  return text
}

// ── Count-up stat ──────────────────────────────────────────────────────────────
const STATS = [
  { raw: 120, suffix: '+', label: 'Projetos'      },
  { raw: 98,  suffix: '%', label: 'Satisfação'     },
  { raw: 5,   suffix: '★', label: 'Avaliação'      },
  { raw: 5,   suffix: '+', label: 'Anos'           },
  { raw: 3,   suffix: '',  label: 'BR · USA · EUR' },
]

function Stat({ raw, suffix, label }: typeof STATS[0]) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    const dur   = 1400
    const start = performance.now()
    const tick  = (now: number) => {
      const p     = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * raw))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, raw])

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span
        className="font-black text-white leading-none"
        style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)' }}
      >
        {n}{suffix}
      </span>
      <span className="text-[#C0C0C8] text-[10px] uppercase tracking-[0.22em]">{label}</span>
    </div>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────────
const WA = 'https://api.whatsapp.com/send/?phone=5562992589599&text=Ol%C3%A1%2C+gostaria+de+fazer+um+or%C3%A7amento!'

export default function Hero() {
  const scrambled = useScramble(TARGET, 400)

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <WaveCanvas />

      {/* Bottom fade to next section */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/15 via-transparent to-[#0A0A0A] pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto w-full">

        {/* Eyebrow */}
        <motion.p
          className="text-[#C0C0C8] text-[10px] tracking-[0.42em] uppercase mb-7"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          Goiânia · Brasil &nbsp;·&nbsp; BR · USA · EUR
        </motion.p>

        {/* Scramble title */}
        <motion.h1
          className="font-black leading-[1.05] text-white mb-5 tracking-tight"
          style={{ fontSize: 'clamp(2.2rem, 5.6vw, 5.4rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          {scrambled.split(' ').map((word, i) => (
            <span key={i} className="inline-block mr-[0.22em]">
              {word === 'PRÓXIMO' || word === 'NÍVEL'
                ? <span className="text-[#E02020]">{word}</span>
                : word}
            </span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-[#C0C0C8] text-sm md:text-base tracking-[0.3em] uppercase mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.5 }}
        >
          presença · estrutura · previsibilidade
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.65 }}
        >
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-[#E02020] text-white font-bold px-9 py-4 rounded-lg text-base hover:bg-[#C01010] transition-colors"
            style={{ boxShadow: '0 0 30px rgba(224,32,32,0.38)' }}
          >
            Faça seu orçamento
          </a>
          <a
            href="#portfolio"
            className="inline-flex items-center justify-center border border-[#444] text-white font-semibold px-9 py-4 rounded-lg text-base hover:border-[#E02020] hover:text-[#E02020] transition-all duration-300"
          >
            Ver portfólio
          </a>
        </motion.div>

        {/* Stats — count up when in view */}
        <motion.div
          className="flex items-start justify-center flex-wrap gap-x-10 gap-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          {STATS.map((s, i) => <Stat key={i} {...s} />)}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 1.1 }}
      >
        <span className="text-[#C0C0C8] text-[9px] tracking-widest uppercase">scroll</span>
        <motion.div
          className="w-px h-7 bg-gradient-to-b from-[#E02020] to-transparent"
          animate={{ scaleY: [1, 0.25, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
