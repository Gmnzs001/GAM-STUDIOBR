'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SERVICES = [
  {
    icon: '⬡',
    title: 'Website & Landing Page',
    description: 'Sites e páginas de alta conversão com design premium e performance otimizada para gerar leads.',
  },
  {
    icon: '◈',
    title: 'Google ADS & Meta ADS',
    description: 'Campanhas pagas que geram leads qualificados e retorno mensurável desde a primeira semana.',
  },
  {
    icon: '◆',
    title: 'Branding & Identidade Visual',
    description: 'Identidade de marca memorável que comunica quem você é antes mesmo de você falar.',
  },
  {
    icon: '◉',
    title: 'SEO & Tráfego Orgânico',
    description: 'Posicionamento orgânico sustentável para atrair clientes enquanto você dorme.',
  },
  {
    icon: '◎',
    title: 'Social Media',
    description: 'Conteúdo estratégico e gestão de redes que constrói audiência e autoridade de marca.',
  },
  {
    icon: '◐',
    title: 'Agentes de IA',
    description: 'Automações inteligentes que atendem, qualificam e vendem por você 24 horas por dia.',
  },
]

function ServiceCard({
  service,
  index,
}: {
  service: (typeof SERVICES)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.48, delay: index * 0.09 }}
      whileHover={{ scale: 1.025, y: -4 }}
      className="group relative bg-[#111111] border border-[#222222] rounded-xl p-6 overflow-hidden hover:border-[#E02020]/40 transition-colors duration-300"
    >
      {/* Inner glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 28px rgba(224,32,32,0.07)' }}
      />

      {/* Icon */}
      <div className="text-[#E02020] text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 select-none">
        {service.icon}
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-base mb-2 group-hover:text-[#E02020] transition-colors duration-300">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-[#A0A0A0] text-sm leading-relaxed">
        {service.description}
      </p>

      {/* Bottom sweep line */}
      <div className="absolute bottom-0 left-0 h-px bg-[#E02020] w-0 group-hover:w-full transition-all duration-500" />
    </motion.div>
  )
}

export default function Services() {
  const headRef = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section id="servicos" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div ref={headRef} className="text-center mb-14">
          <motion.p
            className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            O que fazemos
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-black text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Nossos <span className="text-[#E02020]">Serviços</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
