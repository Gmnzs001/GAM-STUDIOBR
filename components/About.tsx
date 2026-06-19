'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const STATS = [
  { value: 120, suffix: '+', label: 'Projetos entregues',   accent: true  },
  { value: 98,  suffix: '%', label: 'Clientes satisfeitos', accent: false },
  { value: 5,   suffix: '+', label: 'Anos de mercado',      accent: false },
  { value: 3,   suffix: '',  label: 'Países atendidos',     accent: false },
]

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref    = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let n = 0
    const step = Math.max(1, Math.ceil(value / 52))
    const id = setInterval(() => {
      n = Math.min(n + step, value)
      setCount(n)
      if (n >= value) clearInterval(id)
    }, 26)
    return () => clearInterval(id)
  }, [inView, value])

  return <span ref={ref} className="tabular-nums">{count}{suffix}</span>
}

export default function About() {
  const sectionRef  = useRef<HTMLElement>(null)
  const headRef     = useRef<HTMLDivElement>(null)
  const statsRef    = useRef<HTMLDivElement>(null)
  const headInView  = useInView(headRef,  { once: true, margin: '-80px' })
  const statsInView = useInView(statsRef, { once: true, margin: '-40px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

  return (
    <section
      ref={sectionRef}
      id="sobre"
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #121214 0%, #0E0E10 100%)' }}
    >
      <div className="relative z-20 max-w-7xl mx-auto">

        {/* ── Two-column: text + visual ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">

          {/* Left */}
          <div ref={headRef}>
            <motion.p
              className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-4"
              initial={{ opacity: 0, y: 12 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
            >
              Quem somos
            </motion.p>

            <motion.h2
              className="font-black text-white leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
              initial={{ opacity: 0, y: 28 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              Agência de marketing,{' '}
              <span className="text-[#E02020]">mídia</span> e{' '}
              desenvolvimento{' '}
              <span className="text-[#E02020]">digital</span>
            </motion.h2>

            <motion.p
              className="text-[#C0C0C8] text-base leading-relaxed max-w-lg mb-10"
              initial={{ opacity: 0, y: 18 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.18 }}
            >
              Nascida em 2020 em Goiânia, a GAM Studio atua no Brasil, nos Estados Unidos
              e na Europa. Unimos design de alto nível, estratégia de crescimento e
              inteligência artificial para entregar resultados reais — com presença,
              estrutura e previsibilidade.
            </motion.p>

            {[
              'Design premium com foco em conversão',
              'Estratégia orientada a dados e resultados',
              'Atendimento internacional — BR · USA · EUR',
            ].map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-3 mb-3"
                initial={{ opacity: 0, x: -16 }}
                animate={headInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.28 + i * 0.08 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#E02020] flex-shrink-0" />
                <span className="text-[#C0C0C8] text-sm">{item}</span>
              </motion.div>
            ))}
          </div>

          {/* Right: founder photo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={headInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.22 }}
          >
            {/* Photo with parallax + glow */}
            <div
              className="relative h-[480px] rounded-2xl overflow-hidden"
              style={{
                boxShadow:
                  '0 0 0 1px rgba(224,32,32,0.20), 0 0 52px rgba(224,32,32,0.10), 0 24px 64px rgba(0,0,0,0.50)',
              }}
            >
              {/* Parallax image layer — oversized to avoid gaps on shift */}
              <motion.div className="absolute inset-[-10%]" style={{ y: bgY }}>
                <Image
                  src="/gustavo.webp"
                  alt="Gustavo, fundador da GAM Studio"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  priority
                />
              </motion.div>

              {/* Bottom vignette */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0A0A0A]/75 to-transparent pointer-events-none" />

              {/* Red corner glow */}
              <div
                className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'rgba(224,32,32,0.18)' }}
              />
            </div>

            {/* Caption */}
            <div className="mt-4 flex items-center gap-3">
              <div className="w-6 h-px bg-[#E02020]" />
              <p className="text-[#767680] text-[11px] tracking-[0.28em] uppercase font-medium">
                Gustavo — Fundador, GAM Studio
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Stats strip ── */}
        <div
          ref={statsRef}
          className="mt-16 border-t border-[#222222] grid grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="px-4 py-8 lg:px-8 lg:py-10 border-r border-[#222222] last:border-r-0 [&:nth-child(2)]:border-r-[#222222] max-lg:[&:nth-child(2)]:border-r-0 max-lg:[&:nth-child(odd)]:border-r-[#222222]"
              initial={{ opacity: 0, y: 32 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              <div
                className="font-black leading-none mb-3"
                style={{
                  fontSize: 'clamp(3.5rem, 7vw, 5.5rem)',
                  color: stat.accent ? '#E02020' : '#FFFFFF',
                }}
              >
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-[#C0C0C8] text-sm tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
