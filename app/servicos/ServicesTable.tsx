'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Monitor, TrendingUp, Bot, Target, LayoutTemplate, Megaphone,
  Share2, PenLine, Palette, Film, Calendar, Compass, X, LucideIcon,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Service = {
  num:      string
  icon:     LucideIcon
  name:     string
  desc:     string
  image:    string
  fullDesc: string
  includes: string[]
}

// ── Data ──────────────────────────────────────────────────────────────────────
const WA = 'https://api.whatsapp.com/send/?phone=5562992589599&text='

const SERVICES: Service[] = [
  {
    num:  '01',
    icon: Monitor,
    name: 'Criação de Sites',
    desc: 'Sites rápidos, modernos e feitos para converter.',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Desenvolvemos sites profissionais que unem design premium com alta performance técnica. Cada projeto é criado do zero, totalmente personalizado para a identidade da sua marca e otimizado para conversão. Utilizamos as tecnologias mais modernas — garantindo carregamento ultrarrápido, experiência impecável em qualquer dispositivo e integração com as ferramentas que seu negócio já usa. Do e-commerce ao site institucional, entregamos presença digital que gera resultados reais.',
    includes: ['Design responsivo e personalizado', 'CMS integrado (edição fácil)', 'Otimização de velocidade e Core Web Vitals', 'SEO técnico na entrega', 'Suporte pós-lançamento'],
  },
  {
    num:  '02',
    icon: TrendingUp,
    name: 'Consultoria em SEO',
    desc: 'Seu negócio no topo do Google, de forma orgânica.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Posicionamos seu negócio no topo dos resultados de busca de forma orgânica e sustentável. Começamos com uma auditoria técnica completa do seu site, identificando oportunidades e gargalos. Em seguida, estruturamos uma estratégia personalizada de palavras-chave, conteúdo otimizado e construção de autoridade com link building de qualidade. Você acompanha tudo em relatórios mensais claros, com evolução real no tráfego e nas conversões.',
    includes: ['Auditoria técnica completa', 'Pesquisa e estratégia de palavras-chave', 'Link building qualificado', 'Otimização de conteúdo on-page', 'Relatórios mensais de performance'],
  },
  {
    num:  '03',
    icon: Bot,
    name: 'Agentes IA',
    desc: 'Atendimento e vendas automatizados 24h por dia.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Automatize seu atendimento e vendas com agentes de inteligência artificial treinados especificamente para o seu negócio. Nossos agentes funcionam 24 horas por dia, 7 dias por semana — respondendo clientes, qualificando leads, fazendo follow-ups e até fechando vendas de forma natural e personalizada. Integramos com WhatsApp, Instagram, seu site e qualquer canal digital. Você escala o atendimento sem aumentar a equipe.',
    includes: ['Chatbot personalizado 24h/7d', 'Integração WhatsApp e Instagram', 'Qualificação automática de leads', 'Treinamento com dados do seu negócio', 'Dashboard de conversas e métricas'],
  },
  {
    num:  '04',
    icon: Target,
    name: 'Google ADS',
    desc: 'Anúncios que colocam sua marca na frente de quem importa.',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Gerenciamos suas campanhas no Google com foco total em retorno sobre investimento. Criamos e otimizamos anúncios de busca, display e YouTube que entregam sua mensagem para o público certo, na hora certa. Cada centavo do seu orçamento é monitorado de perto — ajustamos lances, testamos criativos e refinamos segmentações continuamente. Você recebe relatórios com conversões reais, não apenas cliques.',
    includes: ['Criação e estruturação de campanhas', 'Gestão e otimização contínua', 'Relatórios de ROI detalhados', 'Testes A/B de criativos e copy', 'Remarketing estratégico'],
  },
  {
    num:  '05',
    icon: LayoutTemplate,
    name: 'Landing Pages',
    desc: 'Páginas de alta conversão para suas campanhas.',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Criamos páginas de destino de alta conversão para suas campanhas de marketing. Cada landing page é desenvolvida com base em princípios de UX, copywriting persuasivo e psicologia de vendas — com o único objetivo de transformar visitantes em clientes. Implementamos testes A/B para otimizar continuamente, integramos com seu CRM e ferramentas de automação, e entregamos uma página que trabalha por você 24 horas por dia.',
    includes: ['Design focado em conversão', 'Copywriting persuasivo', 'Integração com CRM e automação', 'Testes A/B contínuos', 'Rastreamento e analytics avançados'],
  },
  {
    num:  '06',
    icon: Megaphone,
    name: 'Publicidade',
    desc: 'Estratégias criativas que fazem sua marca ser lembrada.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Desenvolvemos estratégias criativas de publicidade que fazem sua marca ser lembrada. Do conceito à execução, criamos campanhas para o digital e mídia tradicional — peças visuais, vídeos, copy e experiências que conectam com seu público. Nossa abordagem une criatividade com dados: cada campanha é planejada para impactar, medida para otimizar e construída para deixar uma impressão duradoura no mercado.',
    includes: ['Estratégia e conceito criativo', 'Criação de peças para todos os formatos', 'Campanhas 360° (digital + off-line)', 'Planejamento e compra de mídia', 'Análise de resultados e otimização'],
  },
  {
    num:  '07',
    icon: Share2,
    name: 'Redes Sociais',
    desc: 'Gestão completa que constrói audiência e autoridade.',
    image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Gerenciamos sua presença nas redes sociais de forma estratégica e consistente. Criamos um calendário de conteúdo alinhado à identidade da sua marca, produzimos posts, stories e reels de alta qualidade, e construímos relacionamento genuíno com sua audiência. Monitoramos métricas de engajamento, alcance e crescimento — com relatórios mensais que mostram a evolução real da sua presença digital.',
    includes: ['Calendário editorial estratégico', 'Criação de posts, stories e reels', 'Moderação e gestão de comentários', 'Monitoramento de métricas', 'Relatórios mensais de crescimento'],
  },
  {
    num:  '08',
    icon: PenLine,
    name: 'Produção de Conteúdo',
    desc: 'Conteúdo estratégico que engaja e converte.',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Criamos conteúdo estratégico que posiciona sua marca como referência no mercado. Da escrita de artigos e blog posts otimizados para SEO à produção de roteiros de vídeo e scripts de vendas — tudo alinhado à voz da sua marca e às necessidades do seu público. Nosso time de redatores, designers e estrategistas entrega conteúdo que engaja, educa e converte em cada etapa da jornada do cliente.',
    includes: ['Artigos e blog posts (SEO)', 'Roteiros de vídeo e podcast', 'E-books e materiais ricos', 'Scripts de vendas e e-mail', 'Revisão e calendário editorial'],
  },
  {
    num:  '09',
    icon: Palette,
    name: 'Branding',
    desc: 'Identidade de marca memorável do conceito ao detalhe.',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Construímos identidades de marca que comunicam profissionalismo e geram reconhecimento imediato. Do naming ao logo, do manual de marca às aplicações visuais em todos os pontos de contato — criamos uma identidade coerente, memorável e estratégica. Uma marca forte diferencia seu negócio da concorrência, aumenta a percepção de valor e cria conexão emocional duradoura com seus clientes.',
    includes: ['Naming e posicionamento de marca', 'Logo e identidade visual completa', 'Manual de marca (brand book)', 'Aplicações em papelaria e digital', 'Consultoria de tom e voz da marca'],
  },
  {
    num:  '10',
    icon: Film,
    name: 'Mídia',
    desc: 'Planejamento e veiculação de mídia com foco em resultado.',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Planejamos e executamos a veiculação de mídia para maximizar o alcance da sua mensagem com eficiência orçamentária. Negociamos espaços em TV, rádio, out-of-home e mídia digital com foco em resultado. Nossa equipe analisa o perfil do seu público, seleciona os canais mais eficientes e monitora a performance de cada ação — garantindo que seu investimento em mídia gere o impacto desejado.',
    includes: ['Planejamento estratégico de mídia', 'Negociação e compra de espaços', 'TV, rádio, OOH e digital', 'Monitoramento de GRP e reach', 'Relatórios de impacto e resultado'],
  },
  {
    num:  '11',
    icon: Calendar,
    name: 'Eventos',
    desc: 'Cobertura e produção de eventos com qualidade profissional.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Cobrimos e produzimos eventos com qualidade profissional e atenção a cada detalhe. Da cobertura fotográfica e cinematográfica à transmissão ao vivo para qualquer canal digital, garantimos que cada momento seja capturado com excelência. Para a produção, cuidamos do planejamento, coordenação e execução — seja um lançamento de produto, evento corporativo ou experiência de marca que deixa impressão.',
    includes: ['Cobertura fotográfica profissional', 'Filmagem e edição de vídeo', 'Transmissão ao vivo (live streaming)', 'Produção e coordenação executiva', 'Conteúdo de evento para redes sociais'],
  },
  {
    num:  '12',
    icon: Compass,
    name: 'Consultoria Completa',
    desc: 'Diagnóstico 360° para escalar seu negócio.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&fit=crop&auto=format',
    fullDesc:
      'Nossa consultoria 360° é o ponto de partida para transformar seu negócio digitalmente. Realizamos um diagnóstico profundo de todas as frentes — posicionamento de marca, presença digital, estratégia de marketing, performance de vendas e processos internos. Com base na análise, desenvolvemos um plano estratégico personalizado e acompanhamos a implementação mês a mês — com métricas claras, metas definidas e suporte contínuo.',
    includes: ['Diagnóstico 360° completo', 'Análise de concorrência e mercado', 'Plano estratégico personalizado', 'Acompanhamento mensal de KPIs', 'Reuniões de alinhamento e suporte contínuo'],
  },
]

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ service, isOpen, onClose }: { service: Service | null; isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const waHref = service
    ? WA + encodeURIComponent(`Olá! Gostaria de solicitar um orçamento para o serviço de ${service.name}.`)
    : '#'

  const Icon = service?.icon ?? Monitor

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center p-4 transition-opacity duration-300
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl
          bg-[#111113] border border-[#222228] shadow-[0_32px_80px_rgba(0,0,0,0.7)]
          transition-all duration-300
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
      >
        {service && (
          <>
            {/* Image */}
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-52 object-cover rounded-t-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent rounded-t-2xl" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm
                flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80
                transition-all duration-200 z-10"
            >
              <X size={15} />
            </button>

            {/* Content */}
            <div className="px-6 pb-7 pt-2">
              {/* Title */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#E02020]/10 border border-[#E02020]/20 flex items-center justify-center">
                  <Icon size={20} className="text-[#E02020]" />
                </div>
                <h2 className="text-white font-black text-2xl leading-snug">{service.name}</h2>
              </div>

              {/* Description */}
              <p className="text-[#9898A4] text-base leading-relaxed mb-6">{service.fullDesc}</p>

              {/* Includes */}
              <div className="mb-7">
                <p className="text-[#E02020] text-xs font-bold uppercase tracking-[0.3em] mb-3">
                  O que está incluído
                </p>
                <ul className="space-y-2.5">
                  {service.includes.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-[#C0C0C8] text-[15px]">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#E02020] mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                  bg-[#E02020] hover:bg-[#C41A1A] text-white font-bold text-base tracking-wide
                  transition-colors duration-200"
              >
                Solicitar orçamento via WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
function ServiceCard({ service, onClick }: { service: Service; onClick: () => void }) {
  const Icon = service.icon
  return (
    <button
      onClick={onClick}
      className="group/card w-full text-left flex items-start gap-5 p-6 rounded-xl
        border border-[#1E1E22] hover:border-[#E02020]/30
        bg-[#111113] hover:bg-[#E02020]/[0.025]
        transition-all duration-300"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#181820]
        group-hover/card:bg-[#E02020]/10 border border-[#222228] group-hover/card:border-[#E02020]/20
        flex items-center justify-center transition-all duration-300">
        <Icon size={20} className="text-[#555565] group-hover/card:text-[#E02020] transition-colors duration-300" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[#333340] text-xs font-mono">{service.num}</span>
            <h3 className="text-white text-[17px] font-bold leading-snug
              group-hover/card:text-[#E02020] transition-colors duration-300">
              {service.name}
            </h3>
          </div>
          <span className="flex-shrink-0 text-xs text-[#333340] group-hover/card:text-[#E02020]/70
            font-mono uppercase tracking-widest transition-colors duration-300 mt-px">
            ver →
          </span>
        </div>

        <p className="text-[#9898A4] text-[15px] leading-relaxed mb-3">{service.desc}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {service.includes.slice(0, 3).map((item, i) => (
            <span key={item} className="flex items-center gap-2 text-[#44444E] text-[13px] font-mono">
              {i > 0 && <span className="text-[#2A2A32]">·</span>}
              {item}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function ServicesTable() {
  const [isOpen,  setIsOpen]  = useState(false)
  const [active,  setActive]  = useState<Service | null>(null)
  const [display, setDisplay] = useState<Service | null>(null)

  const openModal = (s: Service) => { setDisplay(s); setActive(s); setIsOpen(true) }
  const closeModal = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => { setDisplay(null); setActive(null) }, 320)
  }, [])

  // suppress unused var warning — active used to track current selection
  void active

  return (
    <>
      <section
        className="py-20 px-6"
        style={{ background: 'linear-gradient(180deg, #0E0E10 0%, #0A0A0A 100%)' }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-12 text-center">
            <p className="text-[#E02020] text-xs font-bold uppercase tracking-[0.4em] mb-4">
              Visão geral
            </p>
            <h2
              className="font-black text-white leading-none tracking-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
            >
              Escolha seu <span className="text-[#E02020]">serviço</span>
            </h2>
            <p className="mt-4 text-[#767680] text-base max-w-md mx-auto leading-relaxed">
              Clique em qualquer serviço para ver os detalhes completos e solicitar um orçamento.
            </p>
          </div>

          {/* 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SERVICES.map(s => (
              <ServiceCard key={s.name} service={s} onClick={() => openModal(s)} />
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-[#333340] text-[11px] font-mono tracking-widest uppercase">
            Todos os serviços incluem suporte dedicado · resultados mensuráveis
          </p>
        </div>
      </section>

      <Modal service={display} isOpen={isOpen} onClose={closeModal} />
    </>
  )
}
