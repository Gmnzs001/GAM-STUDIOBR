'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

const TESTIMONIALS = [
  {
    name: 'Carlos Mendonça',
    role: 'CEO — Clínica Estética Renovar',
    initial: 'C',
    text: 'A GAM Studio transformou nossa presença digital. Em 3 meses triplicamos os agendamentos online. Profissionalismo e resultados reais.',
  },
  {
    name: 'Fernanda Oliveira',
    role: 'Fundadora — Marca Eco Verde',
    initial: 'F',
    text: 'Eles entenderam nossa essência antes mesmo de começarmos a falar de design. A identidade visual ficou perfeita e nossa conversão subiu 200%.',
  },
  {
    name: 'Rafael Torres',
    role: 'Diretor Comercial — TechScale BR',
    initial: 'R',
    text: 'Campanha no Google ADS com ROI de 8x no primeiro mês. Equipe extremamente competente e comprometida com resultado.',
  },
  {
    name: 'Juliana Castro',
    role: 'Gerente de Marketing — Grupo Construtora',
    initial: 'J',
    text: 'O site que eles criaram gerou mais leads em 2 semanas do que nosso site anterior em 2 anos. Investimento que se paga sozinho.',
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, margin: '-60px' })

  useEffect(() => {
    const id = setInterval(
      () => setCurrent((prev) => (prev + 1) % TESTIMONIALS.length),
      5200
    )
    return () => clearInterval(id)
  }, [])

  return (
    <section id="depoimentos" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div ref={headRef} className="text-center mb-14">
          <motion.p
            className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            Clientes
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-black text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            O que dizem sobre <span className="text-[#E02020]">nós</span>
          </motion.h2>
        </div>

        <div className="relative min-h-[260px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="w-full"
            >
              <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 md:p-10 relative overflow-hidden">
                {/* Decorative quote */}
                <div className="absolute top-4 right-7 text-7xl text-[#E02020]/10 font-black leading-none select-none pointer-events-none">
                  "
                </div>

                <p className="text-white text-lg md:text-xl leading-relaxed mb-8 relative z-10">
                  "{TESTIMONIALS[current].text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#E02020] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {TESTIMONIALS[current].initial}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {TESTIMONIALS[current].name}
                    </div>
                    <div className="text-[#A0A0A0] text-xs mt-0.5">
                      {TESTIMONIALS[current].role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot nav */}
        <div className="flex justify-center gap-2 mt-7">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Depoimento ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                backgroundColor: i === current ? '#E02020' : '#2A2A2A',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
