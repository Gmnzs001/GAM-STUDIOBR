'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const STATS = [
  { value: 120, suffix: '+', label: 'Projetos entregues' },
  { value: 98,  suffix: '%', label: 'Clientes satisfeitos' },
  { value: 5,   suffix: '+', label: 'Anos de mercado' },
  { value: 3,   suffix: '',  label: 'Países atendidos' },
]

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let n = 0
    const step = Math.max(1, Math.ceil(value / 48))
    const id = setInterval(() => {
      n = Math.min(n + step, value)
      setCount(n)
      if (n >= value) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [inView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-9%', '9%'])

  return (
    <section ref={sectionRef} id="sobre" className="py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div ref={headRef}>
            <motion.p
              className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
            >
              Quem somos
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              Sua marca com{' '}
              <span className="text-[#E02020]">presença</span> e{' '}
              <span className="text-[#E02020]">previsibilidade</span>
            </motion.h2>
            <motion.p
              className="text-[#A0A0A0] text-base leading-relaxed mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              A GAM Studio é uma agência de marketing digital e tecnologia sediada em Goiânia,
              com projetos no Brasil, Estados Unidos e Europa. Unimos design de alto nível,
              estratégia de crescimento e inteligência artificial para entregar resultados reais.
            </motion.p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="bg-[#111111] border border-[#222222] rounded-xl p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={headInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.28 + i * 0.08 }}
                >
                  <div className="text-3xl md:text-4xl font-black text-[#E02020] mb-1">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[#A0A0A0] text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — parallax visual */}
          <motion.div
            className="relative h-[460px] rounded-2xl overflow-hidden border border-[#222222]"
            initial={{ opacity: 0, x: 40 }}
            animate={headInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <motion.div
              className="absolute inset-[-12%]"
              style={{
                y: bgY,
                background: 'linear-gradient(135deg, #1A0000 0%, #111111 40%, #0A0A0A 100%)',
              }}
            />
            {/* Red grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(224,32,32,1) 1px, transparent 1px), linear-gradient(90deg, rgba(224,32,32,1) 1px, transparent 1px)',
                backgroundSize: '38px 38px',
              }}
            />
            {/* Center mark */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="font-black text-white/[0.04] leading-none select-none"
                  style={{ fontSize: 'clamp(5rem, 14vw, 9rem)' }}
                >
                  GAM
                </div>
                <div className="text-[#E02020] text-xs tracking-[0.45em] uppercase font-semibold mt-3">
                  Studio
                </div>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <div className="w-10 h-px bg-[#E02020]/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E02020]" />
                  <div className="w-10 h-px bg-[#E02020]/60" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
