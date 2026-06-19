'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Marquee } from '@/components/Marquee'
import TiltCard from '@/components/TiltCard'

const SERVICES = [
  { num: '01', title: 'Criação de Sites',      desc: 'Sites rápidos, modernos e feitos para converter.' },
  { num: '02', title: 'Consultoria em SEO',    desc: 'Seu negócio no topo do Google, de forma orgânica.' },
  { num: '03', title: 'Agentes IA',            desc: 'Atendimento e vendas automatizados 24h por dia.' },
  { num: '04', title: 'Google ADS',            desc: 'Anúncios que colocam sua marca na frente de quem importa.' },
  { num: '05', title: 'Landing Pages',         desc: 'Páginas de alta conversão para suas campanhas.' },
  { num: '06', title: 'Publicidade',           desc: 'Estratégias criativas que fazem sua marca ser lembrada.' },
  { num: '07', title: 'Redes Sociais',         desc: 'Gestão completa que constrói audiência e autoridade.' },
  { num: '08', title: 'Produção de Conteúdo', desc: 'Conteúdo estratégico que engaja e converte.' },
  { num: '09', title: 'Branding',              desc: 'Identidade de marca memorável do conceito ao detalhe.' },
  { num: '10', title: 'Mídia',                 desc: 'Planejamento e veiculação de mídia com foco em resultado.' },
  { num: '11', title: 'Eventos',               desc: 'Cobertura e produção de eventos com qualidade profissional.' },
  { num: '12', title: 'Consultoria Completa',  desc: 'Diagnóstico 360° para escalar seu negócio.' },
]

const ROW_1 = SERVICES.slice(0, 6)
const ROW_2 = SERVICES.slice(6)

function ServiceCard({ service }: { service: (typeof SERVICES)[0] }) {
  return (
    <TiltCard className="mx-3 flex-shrink-0 w-[288px]" maxAngle={6}>
      <div className="group/card relative bg-[#1A1A1D] border border-[#252528] rounded-xl p-6 hover:border-[#E02020]/50 transition-all duration-300 cursor-pointer overflow-hidden">
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 28px rgba(224,32,32,0.08)' }}
        />
        <span className="text-[#E02020] text-[11px] font-mono font-bold tracking-[0.25em] mb-4 block select-none">
          {service.num}
        </span>
        <h3 className="text-white font-bold text-[15px] mb-2 group-hover/card:text-[#E02020] transition-colors duration-300 leading-snug">
          {service.title}
        </h3>
        <p className="text-[#C0C0C8] text-sm leading-relaxed">{service.desc}</p>
        <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#E02020] via-[#E02020]/60 to-transparent w-0 group-hover/card:w-full transition-all duration-500" />
      </div>
    </TiltCard>
  )
}

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef    = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section
      ref={sectionRef}
      id="servicos"
      className="relative pt-16 pb-20 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #121214 0%, #0E0E10 100%)' }}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <div ref={headRef}>
            <motion.p
              className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
            >
              O que fazemos
            </motion.p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <motion.h2
                className="text-4xl md:text-6xl font-black text-white leading-none"
                initial={{ opacity: 0, y: 20 }}
                animate={headInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.1 }}
              >
                Nossos <span className="text-[#E02020]">Serviços</span>
              </motion.h2>
              <motion.p
                className="text-[#C0C0C8] text-sm max-w-[240px] md:text-right leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={headInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.2 }}
              >
                12 soluções para levar sua marca ao próximo nível — do digital à mídia.
              </motion.p>
            </div>
          </div>
        </div>

        {/* Marquee rows */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0  w-10 sm:w-32 z-10 bg-gradient-to-r from-[#111113] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-32 z-10 bg-gradient-to-l from-[#111113] to-transparent" />

          <Marquee pauseOnHover className="[--duration:42s] [--gap:0px]" repeat={4}>
            {ROW_1.map((s) => <ServiceCard key={s.title} service={s} />)}
          </Marquee>

          <div className="mt-5">
            <Marquee pauseOnHover reverse className="[--duration:36s] [--gap:0px]" repeat={4}>
              {ROW_2.map((s) => <ServiceCard key={s.title} service={s} />)}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  )
}
