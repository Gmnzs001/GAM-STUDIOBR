'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { TestimonialsColumn } from '@/components/TestimonialsColumn'

const TESTIMONIALS = [
  {
    initial: 'C',
    name: 'Carlos Mendonça',
    role: 'CEO — Clínica Estética Renovar',
    text: 'A GAM Studio transformou nossa presença digital. Em 3 meses triplicamos os agendamentos online. Profissionalismo e resultados reais.',
  },
  {
    initial: 'J',
    name: 'James O\'Brien',
    role: 'Founder — O\'Brien Consulting (USA)',
    text: 'Exceptional work. They built our entire digital presence from scratch — website, ads and branding — and delivered above expectations every step.',
  },
  {
    initial: 'A',
    name: 'Ana Ferreira',
    role: 'Diretora — Grupo Ferreira Imóveis',
    text: 'O site que eles criaram gerou mais leads em 2 semanas do que nosso anterior em 2 anos. Investimento que se paga rápido.',
  },
  {
    initial: 'R',
    name: 'Rafael Souza',
    role: 'Diretor Comercial — TechScale BR',
    text: 'Campanha no Google ADS com ROI de 8x no primeiro mês. Equipe extremamente competente e comprometida com resultado.',
  },
  {
    initial: 'M',
    name: 'Mariana Costa',
    role: 'Fundadora — Marca Eco Verde',
    text: 'Eles entenderam nossa essência antes mesmo de começarmos a falar de design. A identidade visual ficou perfeita e nossa conversão subiu 200%.',
  },
  {
    initial: 'P',
    name: 'Pedro Alves',
    role: 'Sócio — Construtora Alves & Lima',
    text: 'Parceria sólida desde o início. A GAM cuida de tudo: site, redes e tráfego pago. Nosso CAC caiu 40% em seis meses.',
  },
  {
    initial: 'S',
    name: 'Sarah Mitchell',
    role: 'CMO — Vistara Health (EUR)',
    text: 'We needed an agency that understood both European and Brazilian markets. GAM Studio delivered a cohesive strategy that exceeded our KPIs.',
  },
  {
    initial: 'T',
    name: 'Thiago Lima',
    role: 'CEO — Lima Suplementos',
    text: 'R$120k em faturamento no primeiro mês com Google ADS. Não esperava resultados tão rápidos. Equipe séria e transparente.',
  },
]

// Distribute across 3 columns — stagger for visual variety
const COL1 = [TESTIMONIALS[0], TESTIMONIALS[3], TESTIMONIALS[6]]
const COL2 = [TESTIMONIALS[1], TESTIMONIALS[4], TESTIMONIALS[7]]
const COL3 = [TESTIMONIALS[2], TESTIMONIALS[5], TESTIMONIALS[0]]

export default function Testimonials() {
  const headRef = useRef<HTMLDivElement>(null)
  const inView  = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section id="depoimentos" className="py-24 overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-14">
        <div ref={headRef}>
          <motion.p
            className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            Clientes
          </motion.p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <motion.h2
              className="text-4xl md:text-6xl font-black text-white leading-none"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              O que dizem sobre <span className="text-[#E02020]">nós</span>
            </motion.h2>
            <motion.p
              className="text-[#C0C0C8] text-sm max-w-[220px] md:text-right leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              Clientes do Brasil, Estados Unidos e Europa.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Columns — fade top and bottom */}
      <div
        className="flex justify-center gap-4 h-[440px] sm:h-[620px]"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
        }}
      >
        <TestimonialsColumn testimonials={COL1} duration={18} />
        <TestimonialsColumn testimonials={COL2} duration={22} reverse className="hidden md:block" />
        <TestimonialsColumn testimonials={COL3} duration={16} className="hidden lg:block" />
      </div>
    </section>
  )
}
