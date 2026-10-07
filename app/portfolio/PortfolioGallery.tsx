'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import SpotlightCard from '@/components/system/SpotlightCard'
import CountUp from '@/components/system/CountUp'
import Button from '@/components/system/Button'
import { Reveal } from '@/components/system/Reveal'
import { Kicker } from '@/components/system/SectionHeading'
import { trackCoverPointer, resetCoverPointer, CATEGORY_TINT } from '@/components/CaseCover'
import { WA_URL } from '@/lib/site'
import { cn } from '@/lib/utils'
import CaseMedia from './CaseMedia'
import CaseDialog from './CaseDialog'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ★ PROJETOS REAIS — preencha aqui com os seus dados
//  Campos obrigatórios: id, title, client, category, image, tags, result, year
//  metric.value = 0  →  não exibe número (útil quando ainda não tem a métrica)
//  metric.value > 0  →  anima o contador ao scroll
//
//  category deve ser um dos valores de ALL_CATEGORIES abaixo.
//  image: cole o caminho /images/nome-do-arquivo.jpg  OU uma URL https://...
//         (imagens locais ficam em /public/images/ → caminho '/images/arquivo.jpg')
//         enquanto for uma string sem '/' ou 'http', aparece a capa generativa
//         automática da categoria (arte da GAM, sem foto)
//
//  Cada case abre um painel de detalhes ao clicar — lá aparecem o texto
//  completo de `result`, todas as `tags` e o botão de orçamento.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type Case = {
  id:       string
  title:    string
  client:   string
  segment:  string         // ex: 'E-commerce', 'Clínica', 'Startup SaaS'
  category: 'Web' | 'Marketing' | 'Branding' | 'Social Media'
  image:    string         // /images/... ou https://...  (vazio = capa generativa)
  tags:     string[]       // serviços / tecnologias usadas
  result:   string         // descrição do que foi feito + resultado obtido
  year:     string
  metric:   {
    prefix?: string        // ex: '+'  'R$'  ''
    value:   number        // 0 = não exibe número
    suffix:  string        // ex: '%'  'x'  'k'  ' dias'
    label:   string        // ex: 'no tráfego orgânico'
    isDecimal?: boolean    // true = exibe com 1 casa decimal (4,8x)
  }
}

const CASES: Case[] = [
  {
    id:       'clinica-estetica',
    title:    'Clínica Estética Premium',
    client:   'Clínica Estética Renovar',
    segment:  'Saúde e estética',
    category: 'Web',
    image:    '',
    tags:     ['Landing Page', 'Copywriting', 'Google ADS', 'Agendamento online'],
    result:
      'Landing page de alta conversão com agendamento online integrado, copy orientada a objeções e campanhas de tráfego apontando para ela. As conversões subiram 340% e os agendamentos online triplicaram em três meses.',
    year:   '2025',
    metric: { prefix: '+', value: 340, suffix: '%', label: 'em conversões' },
  },
  {
    id:       'ecommerce-suplementos',
    title:    'E-commerce de Suplementos',
    client:   'Lima Suplementos',
    segment:  'E-commerce',
    category: 'Marketing',
    image:    '',
    tags:     ['Google ADS', 'Shopping', 'Remarketing', 'Rastreamento'],
    result:
      'Estrutura completa de Google ADS (pesquisa, Shopping e remarketing) com rastreamento de conversões configurado do zero. A operação faturou R$120k já no primeiro mês de campanha.',
    year:   '2025',
    metric: { prefix: 'R$', value: 120, suffix: 'k', label: 'faturados no 1º mês' },
  },
  {
    id:       'moda-sustentavel',
    title:    'Marca de Moda Sustentável',
    client:   'Marca Eco Verde',
    segment:  'Moda',
    category: 'Branding',
    image:    '',
    tags:     ['Branding', 'Identidade visual', 'Manual de marca'],
    result:
      'Identidade visual completa, do conceito ao manual de marca, traduzindo a essência eco-friendly em logo, paleta, tipografia e aplicações. Com a nova marca, a conversão da loja subiu 200%.',
    year:   '2024',
    metric: { prefix: '+', value: 200, suffix: '%', label: 'em conversão' },
  },
  {
    id:       'construtora-regional',
    title:    'Construtora Regional',
    client:   'Construtora Alves & Lima',
    segment:  'Construção civil',
    category: 'Web',
    image:    '',
    tags:     ['Criação de Sites', 'Redes Sociais', 'Google ADS', 'Captação de leads'],
    result:
      'Site com páginas dedicadas para 3 empreendimentos e captação de leads integrada, somado à gestão de redes e tráfego pago. Em seis meses, o custo de aquisição de clientes caiu 40%.',
    year:   '2024',
    metric: { prefix: '-', value: 40, suffix: '%', label: 'no custo por cliente' },
  },
  {
    id:       'restaurante-gourmet',
    title:    'Restaurante Gourmet',
    client:   'Casa gastronômica',
    segment:  'Gastronomia',
    category: 'Social Media',
    image:    '',
    tags:     ['Redes Sociais', 'Produção de Conteúdo', 'Fotografia'],
    result:
      'Gestão completa do Instagram com linha editorial, produção de foto e vídeo dos pratos e calendário de conteúdo. O perfil ganhou 15 mil seguidores orgânicos em 90 dias, sem mídia paga.',
    year:   '2025',
    metric: { prefix: '+', value: 15, suffix: 'k', label: 'seguidores em 90 dias' },
  },
  {
    id:       'startup-tecnologia',
    title:    'Startup de Tecnologia',
    client:   'Startup SaaS B2B',
    segment:  'Tecnologia',
    category: 'Branding',
    image:    '',
    tags:     ['Branding', 'Motion design', 'SaaS B2B'],
    result:
      'Branding completo para um SaaS B2B, com identidade visual, sistema de ícones e motion design para produto e lançamento, deixando a marca pronta para competir no mercado internacional.',
    year:   '2025',
    metric: { prefix: '', value: 0, suffix: '', label: 'branding + motion' },
  },
]

// ── Filtros derivados dos cases reais (sem categorias vazias) ────────────────
const ALL_CATEGORIES = ['Web', 'Marketing', 'Branding', 'Social Media'] as const
const FILTERS = [
  'Todos',
  ...ALL_CATEGORIES.filter((cat) => CASES.some((c) => c.category === cat)),
]

const EASE = [0.16, 1, 0.3, 1] as const

// ── Métrica (some quando value = 0) ───────────────────────────────────────────
export function CaseMetric({ metric, size = 'md', className }: { metric: Case['metric']; size?: 'md' | 'lg'; className?: string }) {
  if (!(metric.value > 0)) return null
  return (
    <div className={cn('flex items-end gap-3', className)}>
      <CountUp
        value={metric.value}
        prefix={metric.prefix ?? ''}
        suffix={metric.suffix}
        decimals={metric.isDecimal ? 1 : 0}
        className={cn('type-num whitespace-nowrap text-ink', size === 'lg' ? 'text-[clamp(3rem,6vw,4.5rem)]' : 'text-[2.6rem]')}
      />
      <span className="max-w-[18ch] pb-1 text-sm leading-tight text-ink-2">{metric.label}</span>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
function CaseCard({ c, featured, onOpen }: { c: Case; featured: boolean; onOpen: (c: Case, el: HTMLElement) => void }) {
  const hasMetric = c.metric.value > 0
  return (
    <SpotlightCard
      as="article"
      tilt={featured ? 3 : 5}
      glow="rgba(224,32,32,0.10)"
      className="h-full rounded-[28px] bg-surface shadow-[var(--shadow-soft)] ring-1 ring-line transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]"
    >
      <div
        onPointerMove={trackCoverPointer}
        onPointerLeave={resetCoverPointer}
        className={cn('group/case relative flex h-full flex-col p-2', featured && 'lg:grid lg:grid-cols-12 lg:gap-2')}
      >
        <div className={cn('relative aspect-[16/10] overflow-hidden rounded-[22px] bg-paper-2', featured && 'lg:col-span-7 lg:aspect-auto lg:min-h-[440px]')}>
          <CaseMedia
            src={c.image}
            alt={c.title}
            category={c.category}
            seed={c.id}
            title={c.title}
            zoom={featured ? 1.08 : 1}
            sizes={featured ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 50vw, 100vw'}
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[0.78rem] font-semibold text-ink shadow-sm ring-1 ring-ink/5">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: CATEGORY_TINT[c.category] }} aria-hidden="true" />
            {c.category}
          </span>
        </div>

        <div className={cn('flex flex-1 flex-col px-4 pb-4 pt-5 md:px-6 md:pb-6', featured && 'lg:col-span-5 lg:justify-center lg:px-8 lg:py-8')}>
          <div className="flex items-center justify-between gap-4 text-sm text-ink-3">
            <span className="truncate">{c.segment}</span>
            <span className="shrink-0 font-mono text-[0.8rem]">{c.year}</span>
          </div>

          <h3 className={cn('mt-3 text-ink [overflow-wrap:anywhere]', featured ? 'type-title' : 'type-card')}>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={(e) => onOpen(c, e.currentTarget)}
              className="text-left outline-none after:absolute after:inset-0 after:z-10 after:rounded-[28px] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-[-3px] focus-visible:after:outline-red"
            >
              {c.title}
            </button>
          </h3>
          <p className="mt-1 text-sm text-ink-3">{c.client}</p>

          <p className={cn('mt-4 max-w-[52ch] leading-relaxed text-ink-2', featured ? 'line-clamp-4' : 'line-clamp-3')}>{c.result}</p>

          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Serviços do projeto">
            {c.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-paper px-3 py-1 text-[0.78rem] font-medium text-ink-2 ring-1 ring-line">
                {tag}
              </li>
            ))}
          </ul>

          <div className={cn('mt-auto flex items-end justify-between gap-4 pt-6', hasMetric && 'border-t border-line', featured && 'lg:mt-8')}>
            {hasMetric ? <CaseMetric metric={c.metric} className="pt-5" /> : <span className="text-sm font-semibold text-ink">Ver detalhes</span>}
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white transition-[background-color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover/case:rotate-45 group-hover/case:bg-red"
            >
              <ArrowUpRight className="size-[18px]" strokeWidth={2.4} />
            </span>
          </div>
        </div>
      </div>
    </SpotlightCard>
  )
}

// ── Filtros (pílula deslizante) ───────────────────────────────────────────────
function FilterTabs({ active, onChange }: { active: string; onChange: (f: string) => void }) {
  return (
    <div
      role="group"
      aria-label="Filtrar cases por categoria"
      className="-mx-[var(--gutter)] min-w-0 overflow-x-auto px-[var(--gutter)] py-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      <div className="inline-flex min-w-max items-center gap-1 rounded-full bg-surface/90 p-1 shadow-[var(--shadow-soft)] ring-1 ring-line">
        {FILTERS.map((f) => {
          const on = active === f
          const count = f === 'Todos' ? CASES.length : CASES.filter((c) => c.category === f).length
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(f)}
              className={cn(
                'relative flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors duration-300',
                on ? 'text-white' : 'text-ink-2 hover:text-ink',
              )}
            >
              {on && (
                <motion.span
                  layoutId="portfolio-filter-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative">{f}</span>
              <span className={cn('relative font-mono text-[0.7rem]', on ? 'text-white/60' : 'text-ink-3')}>{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PortfolioGallery() {
  const [activeFilter, setActiveFilter] = useState<string>('Todos')
  const [selected, setSelected] = useState<Case | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const inView = useInView(gridRef, { once: true, margin: '0px 0px -10% 0px' })

  const visible = useMemo(
    () => CASES.filter((c) => activeFilter === 'Todos' || c.category === activeFilter),
    [activeFilter],
  )

  const open = useCallback((c: Case, el: HTMLElement) => {
    triggerRef.current = el
    setSelected(c)
  }, [])
  const close = useCallback(() => setSelected(null), [])

  return (
    <section aria-label="Cases" className="relative pb-24 md:pb-36">
      <div className="container-gam">
        <Reveal className="flex items-center justify-between gap-6">
          <FilterTabs active={activeFilter} onChange={setActiveFilter} />
          <p className="sr-only shrink-0 font-mono text-[0.8rem] text-ink-3 md:not-sr-only" aria-live="polite">
            {String(visible.length).padStart(2, '0')} case{visible.length !== 1 ? 's' : ''}
          </p>
        </Reveal>

        {/* Bento que se adapta à quantidade:
            1 case  → largura total (horizontal no desktop)
            2 cases → 2 colunas iguais
            3 cases → 1º em destaque + 2 lado a lado
            4 cases → grade 2×2 simétrica                                  */}
        {/* Troca de filtro em crossfade (sem animação de layout): o card em
            destaque muda de formato e escalar o conteúdo causaria distorção. */}
        <div ref={gridRef} className="mt-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeFilter}
              className="grid gap-4 md:gap-5 lg:grid-cols-2"
              initial="hidden"
              animate={inView ? 'show' : 'hidden'}
              exit={{ opacity: 0, transition: { duration: 0.18, ease: 'easeOut' } }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              {visible.map((c, idx) => {
                const total = visible.length
                const featured = total === 1 || (idx === 0 && total % 2 !== 0)
                return (
                  <motion.div
                    key={c.id}
                    className={cn(featured && 'lg:col-span-2')}
                    variants={{
                      hidden: { opacity: 0, y: 28 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
                    }}
                  >
                    <CaseCard c={c} featured={featured} onOpen={open} />
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fechamento (a página usa <Footer cta={false} />, então o CTA final é este) */}
        <Reveal className="relative isolate mt-16 overflow-hidden rounded-[28px] bg-red p-7 text-white shadow-[var(--shadow-red)] md:mt-24 md:rounded-[36px] md:p-14">
          <div aria-hidden="true" className="bg-dot-grid-light pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_left,#000,transparent_65%)]" />
          <div className="grid items-end gap-8 md:grid-cols-[1fr_auto] md:gap-12">
            <div>
              <Kicker tone="red" className="mb-6">Próximo case</Kicker>
              <p className="font-display text-[clamp(2.2rem,5vw,4.25rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
                Seu projeto pode ser o próximo.
              </p>
              <p className="mt-5 max-w-[50ch] text-white/85 md:text-lg">
                Conte o seu objetivo e montamos um plano com metas claras, do primeiro contato até o resultado.
              </p>
            </div>
            <Button href={WA_URL} variant="white" icon="whatsapp" size="lg" className="w-full justify-between sm:w-auto">
              Faça seu orçamento
            </Button>
          </div>
        </Reveal>
      </div>

      <CaseDialog item={selected} onClose={close} returnFocusRef={triggerRef} />
    </section>
  )
}
