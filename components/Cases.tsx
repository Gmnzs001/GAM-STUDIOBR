'use client'

import { useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

const CATEGORIES = ['Todos', 'Website', 'Branding', 'ADS', 'Social']

const CASES = [
  { id: 1, title: 'Clínica Estética Premium',       category: 'Website',  description: 'Landing page com 340% de aumento em conversões.', bg: '#160808' },
  { id: 2, title: 'Marca de Moda Sustentável',      category: 'Branding', description: 'Identidade visual completa para marca eco-friendly.', bg: '#080d16' },
  { id: 3, title: 'E-commerce de Suplementos',      category: 'ADS',      description: 'R$120k em faturamento no 1º mês com Google ADS.', bg: '#081608' },
  { id: 4, title: 'Construtora Regional',           category: 'Website',  description: 'Site com geração de leads para 3 empreendimentos.', bg: '#141208' },
  { id: 5, title: 'Restaurante Gourmet',            category: 'Social',   description: '15k seguidores orgânicos em 90 dias.', bg: '#080814' },
  { id: 6, title: 'Startup de Tecnologia',          category: 'Branding', description: 'Branding completo para SaaS B2B + motion design.', bg: '#120812' },
]

function CaseCard({ item }: { item: (typeof CASES)[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const rx  = useMotionValue(0)
  const ry  = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 320, damping: 28 })
  const sry = useSpring(ry, { stiffness: 320, damping: 28 })

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r  = el.getBoundingClientRect()
    rx.set(-(((e.clientY - r.top)  / r.height) - 0.5) * 14)
    ry.set( (((e.clientX - r.left) / r.width)  - 0.5) * 14)
  }

  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.28 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative rounded-xl overflow-hidden h-52 border border-[#222222] hover:border-[#E02020]/40 transition-colors duration-300"
      style={{
        backgroundColor: item.bg,
        rotateX: srx,
        rotateY: sry,
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
      }}
    >
      <div className="absolute top-4 right-4 z-10">
        <span className="text-xs font-semibold text-[#E02020] bg-[#E02020]/10 px-3 py-1 rounded-full border border-[#E02020]/20">
          {item.category}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-bold text-base mb-1 max-sm:opacity-0 group-hover:opacity-0 transition-opacity duration-200">
          {item.title}
        </h3>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-[#E02020] font-bold text-base mb-1">{item.title}</h3>
        <p className="text-[#A0A0A0] text-sm translate-y-0 sm:translate-y-1 sm:group-hover:translate-y-0 transition-transform duration-300">
          {item.description}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 h-px bg-[#E02020] w-0 group-hover:w-full transition-all duration-500" />
    </motion.div>
  )
}

export default function Cases() {
  const [active, setActive] = useState('Todos')
  const headRef = useRef<HTMLDivElement>(null)
  const inView  = useInView(headRef, { once: true, margin: '-60px' })

  const filtered = active === 'Todos' ? CASES : CASES.filter((c) => c.category === active)

  return (
    <section id="cases" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div ref={headRef} className="text-center mb-12">
          <motion.p
            className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            Portfólio
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-black text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Nossos <span className="text-[#E02020]">Cases</span>
          </motion.h2>

          <motion.div
            className="flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  active === cat
                    ? 'bg-[#E02020] text-white'
                    : 'bg-[#111111] border border-[#222222] text-[#A0A0A0] hover:border-[#E02020]/40 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <CaseCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
