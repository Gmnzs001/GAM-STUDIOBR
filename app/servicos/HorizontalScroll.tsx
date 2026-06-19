'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Service data ─────────────────────────────────────────────────────────────
type Service = {
  id: string
  number: string
  name: string[]
  tagline: string
  description: string
  includes: string[]
}

const SERVICES: Service[] = [
  {
    id: 'criacao-de-sites',
    number: '01',
    name: ['Criação', 'de Sites'],
    tagline: 'Da arquitetura ao pixel perfeito',
    description:
      'Desenvolvemos sites e aplicações web com tecnologia de ponta — Next.js, React, performance máxima. Cada projeto é construído para converter, ranquear e escalar junto com o seu negócio.',
    includes: [
      'Design exclusivo e 100% responsivo',
      'Performance otimizada para Core Web Vitals',
      'Integração com CRM, analytics e automações',
      'Suporte e manutenção pós-lançamento',
    ],
  },
  {
    id: 'seo',
    number: '02',
    name: ['Consultoria', 'em SEO'],
    tagline: 'Autoridade orgânica que dura anos',
    description:
      'Seu negócio no topo do Google, de forma orgânica e duradoura. Estratégias de SEO técnico e de conteúdo que constroem autoridade real, atraem tráfego qualificado e geram resultados consistentes.',
    includes: [
      'Auditoria técnica completa do site',
      'Pesquisa de palavras-chave e análise de concorrentes',
      'Otimização de velocidade, estrutura e schema markup',
      'Relatórios mensais de posicionamento e tráfego',
    ],
  },
  {
    id: 'agentes-ia',
    number: '03',
    name: ['Agentes', 'de IA'],
    tagline: 'Vendas e atendimento 24h automáticos',
    description:
      'Automatize seu atendimento e vendas com Inteligência Artificial treinada no seu negócio. Nossos agentes respondem dúvidas, qualificam leads e fecham vendas enquanto você foca no que realmente importa.',
    includes: [
      'Agente treinado com o conhecimento da sua empresa',
      'Integração com WhatsApp, Instagram e site',
      'Qualificação automática de leads e follow-up',
      'Dashboard de métricas e análise de conversas',
    ],
  },
  {
    id: 'google-ads',
    number: '04',
    name: ['Google', 'ADS'],
    tagline: 'Anúncios que geram retorno real',
    description:
      'Gestão profissional de campanhas que colocam sua marca na frente de quem está pronto para comprar. Cada centavo investido é otimizado continuamente para maximizar conversões e retorno sobre anúncios.',
    includes: [
      'Criação e estruturação completa de campanhas',
      'Pesquisa estratégica de palavras-chave e públicos',
      'Otimização contínua de lances e criativos',
      'Relatórios detalhados de ROAS e conversões',
    ],
  },
  {
    id: 'landing-pages',
    number: '05',
    name: ['Landing', 'Pages'],
    tagline: 'Páginas feitas para converter',
    description:
      'Criamos landing pages de alta conversão onde cada elemento — copy, design, hierarquia visual — é estratégico. Ideal para lançamentos, campanhas e funis de vendas que precisam performar no máximo.',
    includes: [
      'Copy persuasivo orientado a conversão',
      'Design otimizado para mobile-first',
      'Integração com ferramentas de rastreamento',
      'Testes A/B e otimização baseada em dados',
    ],
  },
  {
    id: 'publicidade',
    number: '06',
    name: ['Publi-', 'cidade'],
    tagline: 'Campanhas que ficam na memória',
    description:
      'Estratégias criativas que fazem sua marca ser lembrada e reconhecida. Planejamos e produzimos campanhas que combinam criatividade com dados para gerar alcance, reconhecimento e resultados mensuráveis.',
    includes: [
      'Conceito criativo e planejamento de campanha',
      'Produção de peças para múltiplos formatos',
      'Estratégia de distribuição e alcance de público',
      'Mensuração de impacto e brand awareness',
    ],
  },
  {
    id: 'redes-sociais',
    number: '07',
    name: ['Redes', 'Sociais'],
    tagline: 'Presença que constrói autoridade',
    description:
      'Gestão completa do seu social media — do planejamento estratégico à criação de conteúdo e análise de métricas. Transformamos suas redes em canais reais de relacionamento, posicionamento e vendas.',
    includes: [
      'Planejamento estratégico de conteúdo mensal',
      'Criação de artes, vídeos e copy',
      'Gestão de comunidade e interações',
      'Relatórios de crescimento e engajamento',
    ],
  },
  {
    id: 'conteudo',
    number: '08',
    name: ['Produção de', 'Conteúdo'],
    tagline: 'Conteúdo que educa, engaja e converte',
    description:
      'Estratégia e produção de conteúdo que posiciona sua marca como referência no mercado. Do blog post otimizado para SEO ao vídeo para redes — conteúdo que trabalha 24h pelo seu negócio.',
    includes: [
      'Blog posts e artigos otimizados para SEO',
      'Vídeos para redes sociais e YouTube',
      'E-books, whitepapers e materiais ricos',
      'Roteiros, scripts e copy de vendas',
    ],
  },
  {
    id: 'branding',
    number: '09',
    name: ['Bran-', 'ding'],
    tagline: 'Identidade que diferencia e permanece',
    description:
      'Uma identidade de marca memorável, do conceito visual ao posicionamento estratégico. Criamos marcas que comunicam valor com clareza, se diferenciam da concorrência e ficam na mente do público.',
    includes: [
      'Naming e estratégia de posicionamento',
      'Identidade visual completa (logo, paleta, tipografia)',
      'Manual de marca e guia de aplicação',
      'Brandbook e materiais de apresentação',
    ],
  },
  {
    id: 'midia',
    number: '10',
    name: ['Mídia'],
    tagline: 'Os canais certos para o público certo',
    description:
      'Planejamento e veiculação de mídia com foco em resultado. Identificamos os melhores canais para o seu público, negociamos espaços e gerenciamos campanhas para maximizar alcance e ROI.',
    includes: [
      'Planejamento de mídia on e offline',
      'Negociação e compra de espaços publicitários',
      'Gestão de campanhas em múltiplos veículos',
      'Análise de performance e otimização de verba',
    ],
  },
  {
    id: 'eventos',
    number: '11',
    name: ['Eventos'],
    tagline: 'Cada momento transformado em conteúdo',
    description:
      'Cobertura profissional e produção completa de eventos. Do planejamento de comunicação ao conteúdo pós-evento, garantimos que cada momento gere impacto real e duradouro para sua marca.',
    includes: [
      'Cobertura fotográfica e audiovisual profissional',
      'Conteúdo ao vivo para redes sociais',
      'Planejamento de comunicação pré e pós-evento',
      'Edição e entrega ágil de materiais',
    ],
  },
  {
    id: 'consultoria',
    number: '12',
    name: ['Consultoria', 'Completa'],
    tagline: 'Diagnóstico 360° para escalar',
    description:
      'Análise profunda de toda a sua presença digital com um plano personalizado para escalar. Da estratégia à execução, trabalhamos ao lado da sua equipe para alcançar seus objetivos de negócio.',
    includes: [
      'Diagnóstico completo de presença digital',
      'Mapeamento de oportunidades e pontos de melhoria',
      'Plano estratégico integrado (90 dias, 6 meses, 1 ano)',
      'Acompanhamento e suporte na implementação',
    ],
  },
]

const WA_BASE =
  'https://api.whatsapp.com/send/?phone=5562981147673&text='

function waLink(service: Service) {
  const msg = encodeURIComponent(
    `Olá! Vim pelo site da GAM Studio e gostaria de um orçamento para ${service.name.join(' ')}.`,
  )
  return WA_BASE + msg
}

// ── Desktop: single horizontal panel ────────────────────────────────────────
function ServicePanel({ service }: { service: Service }) {
  return (
    <div className="relative flex-shrink-0 w-screen h-screen flex items-center justify-between px-16 xl:px-28 gap-16 service-panel bg-[#0E0E10]">
      {/* Giant decorative number */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none font-black leading-none text-white"
        style={{ fontSize: 'clamp(12rem, 28vw, 32rem)', opacity: 0.025, letterSpacing: '-0.05em' }}
      >
        {service.number}
      </span>

      {/* Red left edge accent */}
      <div className="absolute left-0 top-[15%] bottom-[15%] w-[2px] bg-gradient-to-b from-transparent via-[#E02020] to-transparent opacity-40" />

      {/* Left column — name block */}
      <div className="relative z-10 flex-shrink-0 w-[46%] flex flex-col justify-center">
        <p className="text-[#E02020] font-mono text-xs tracking-[0.4em] uppercase mb-6 font-bold">
          {service.number}&thinsp;/&thinsp;12
        </p>
        <h2 className="font-black leading-[0.88] tracking-tight text-white" style={{ fontSize: 'clamp(3.5rem, 6.5vw, 7rem)' }}>
          {service.name.map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </h2>
        <p className="mt-5 text-[#666666] text-sm uppercase tracking-[0.25em] font-medium">
          {service.tagline}
        </p>
      </div>

      {/* Divider */}
      <div className="relative z-10 flex-shrink-0 w-[1px] self-stretch my-16 bg-gradient-to-b from-transparent via-[#222222] to-transparent" />

      {/* Right column — content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
        <p className="text-[#A0A0A0] text-base leading-relaxed mb-8">
          {service.description}
        </p>

        <ul className="space-y-3 mb-10">
          {service.includes.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#666666]">
              <span className="text-[#E02020] mt-0.5 shrink-0 font-bold">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <a
          href={waLink(service)}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 self-start bg-[#E02020] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#C01010] transition-all duration-200 hover:gap-4"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Solicitar orçamento
        </a>
      </div>
    </div>
  )
}

// ── Mobile: sticky vertical card ─────────────────────────────────────────────
function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <div className="relative px-6 py-14 border-b border-[#161616]">
      {/* Number accent */}
      <span
        aria-hidden
        className="absolute top-8 right-6 font-black text-white select-none pointer-events-none"
        style={{ fontSize: '5rem', lineHeight: 1, opacity: 0.04, letterSpacing: '-0.05em' }}
      >
        {service.number}
      </span>

      <p className="text-[#E02020] font-mono text-xs tracking-[0.35em] uppercase font-bold mb-4">
        {service.number}&thinsp;/&thinsp;12
      </p>

      <h2 className="text-4xl font-black tracking-tight leading-[0.9] text-white mb-3">
        {service.name.join(' ')}
      </h2>
      <p className="text-[#555555] text-xs uppercase tracking-widest mb-6">{service.tagline}</p>

      <p className="text-[#A0A0A0] text-sm leading-relaxed mb-7">{service.description}</p>

      <ul className="space-y-3 mb-8">
        {service.includes.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[#666666]">
            <span className="text-[#E02020] shrink-0 font-bold mt-0.5">→</span>
            {item}
          </li>
        ))}
      </ul>

      <a
        href={waLink(service)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 bg-[#E02020] text-white font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-[#C01010] transition-colors"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Solicitar orçamento
      </a>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HorizontalScroll() {
  const pinRef         = useRef<HTMLDivElement>(null)
  const trackRef       = useRef<HTMLDivElement>(null)
  const progressRef    = useRef<HTMLSpanElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const hintRef        = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pin   = pinRef.current
    const track = trackRef.current
    if (!pin || !track) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // ── DESKTOP: cinematic horizontal scroll ──────────────────────────────
      mm.add(
        {
          desktop: '(min-width: 1024px)',
          reducedMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, reducedMotion } = context.conditions as Record<string, boolean>
          if (!desktop || reducedMotion) return

          // Wait one frame for layout so scrollWidth is accurate
          requestAnimationFrame(() => {
            const trackWidth = track.scrollWidth - window.innerWidth

            gsap.to(track, {
              x: () => -(track.scrollWidth - window.innerWidth),
              ease: 'none',
              scrollTrigger: {
                trigger: pin,
                pin: true,
                pinType: 'transform',
                scrub: 1.2,
                invalidateOnRefresh: true,
                end: () => `+=${track.scrollWidth - window.innerWidth}`,
                onUpdate: (self) => {
                  // Update progress number
                  const idx = Math.min(
                    Math.floor(self.progress * SERVICES.length + 0.0001),
                    SERVICES.length - 1,
                  )
                  if (progressRef.current) {
                    progressRef.current.textContent = String(idx + 1).padStart(2, '0')
                  }
                  // Update progress bar
                  if (progressBarRef.current) {
                    progressBarRef.current.style.transform = `scaleX(${self.progress})`
                  }
                  // Fade out the scroll hint after first interaction
                  if (self.progress > 0.01 && hintRef.current) {
                    hintRef.current.style.opacity = '0'
                  }
                },
              },
            })

            ScrollTrigger.refresh()
          })

          return () => {
            ScrollTrigger.getAll().forEach((st) => st.kill())
          }
        },
      )

      return () => mm.revert()
    }, pin)

    return () => ctx.revert()
  }, [])

  return (
    <>
      {/* ── DESKTOP: pinned horizontal track (hidden on mobile) ────────────── */}
      <div ref={pinRef} className="relative hidden lg:block overflow-hidden bg-[#0E0E10]">
        {/* Progress counter */}
        <div className="absolute top-8 right-10 z-20 flex items-baseline gap-0.5 pointer-events-none select-none">
          <span
            ref={progressRef}
            className="font-mono font-black text-white tabular-nums"
            style={{ fontSize: 'clamp(4rem, 7vw, 7rem)', opacity: 0.08, lineHeight: 1 }}
          >
            01
          </span>
          <span className="text-[#E02020] font-mono font-black text-2xl">/12</span>
        </div>

        {/* Scroll-direction hint */}
        <div
          ref={hintRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-[#333333] pointer-events-none select-none transition-opacity duration-700"
        >
          <span className="text-xs font-mono uppercase tracking-[0.3em]">role para navegar</span>
          <span className="text-[#E02020] text-sm">→</span>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/[0.05] z-20 overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full bg-[#E02020] origin-left"
            style={{ transform: 'scaleX(0)', transition: 'none' }}
          />
        </div>

        {/* Horizontal track: N × 100vw */}
        <div
          ref={trackRef}
          className="flex h-screen will-change-transform"
          style={{ width: `${SERVICES.length * 100}vw` }}
        >
          {SERVICES.map((service) => (
            <ServicePanel key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* ── MOBILE / TABLET: vertical stacked cards (hidden on desktop) ────── */}
      <div className="block lg:hidden bg-[#0E0E10]">
        {SERVICES.map((service, i) => (
          <ServiceCard key={service.id} service={service} index={i} />
        ))}
      </div>
    </>
  )
}
