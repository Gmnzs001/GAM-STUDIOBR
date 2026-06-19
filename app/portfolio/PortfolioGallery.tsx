'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ★ PROJETOS REAIS — preencha aqui com os seus dados
//  Campos obrigatórios: id, title, client, category, image, tags, result, year
//  metric.value = 0  →  não exibe número (útil quando ainda não tem a métrica)
//  metric.value > 0  →  anima o contador ao scroll
//
//  category deve ser um dos valores de ALL_CATEGORIES abaixo.
//  image: cole o caminho /images/nome-do-arquivo.jpg  OU uma URL https://...
//         enquanto for uma string sem '/' ou 'http', aparece placeholder cinza
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type Case = {
  id:       string
  title:    string
  client:   string
  segment:  string         // ex: 'E-commerce', 'Clínica', 'Startup SaaS'
  category: 'Web' | 'Marketing' | 'Branding' | 'Social Media'
  image:    string         // /images/... ou https://...  (vazio = placeholder)
  tags:     string[]       // serviços / tecnologias usadas
  result:   string         // descrição do que foi feito + resultado obtido
  year:     string
  metric:   {
    prefix?: string        // ex: '+'  'R$'  ''
    value:   number        // 0 = não exibe número
    suffix:  string        // ex: '%'  'x'  'k'  ' dias'
    label:   string        // ex: 'no tráfego orgânico'
    isDecimal?: boolean    // true = exibe com 1 casa decimal (4.8x)
  }
}

const CASES: Case[] = [
  // ── CASE 1 ──────────────────────────────────────────────────────────────
  {
    id:       'case-01',
    title:    'COLE O NOME DO PROJETO',
    client:   'COLE O NOME DO CLIENTE',
    segment:  'COLE O SEGMENTO',
    category: 'Web',
    image:    'COLE_IMAGEM_DO_PROJETO_AQUI',
    tags:     ['SERVIÇO 1', 'SERVIÇO 2', 'FERRAMENTA'],
    result:
      'COLE A DESCRIÇÃO: explique o que foi feito, qual problema resolveu e qual resultado concreto o cliente obteve. Seja específico.',
    year:   '2025',
    metric: { prefix: '+', value: 0, suffix: '%', label: 'COLE A MÉTRICA DO RESULTADO' },
  },
  // ── CASE 2 ──────────────────────────────────────────────────────────────
  {
    id:       'case-02',
    title:    'COLE O NOME DO PROJETO',
    client:   'COLE O NOME DO CLIENTE',
    segment:  'COLE O SEGMENTO',
    category: 'Marketing',
    image:    'COLE_IMAGEM_DO_PROJETO_AQUI',
    tags:     ['SERVIÇO 1', 'CANAL 2'],
    result:
      'COLE A DESCRIÇÃO: explique o que foi feito, qual problema resolveu e qual resultado concreto o cliente obteve.',
    year:   '2025',
    metric: { prefix: '', value: 0, suffix: 'x', label: 'COLE A MÉTRICA', isDecimal: true },
  },
  // ── CASE 3 ──────────────────────────────────────────────────────────────
  {
    id:       'case-03',
    title:    'COLE O NOME DO PROJETO',
    client:   'COLE O NOME DO CLIENTE',
    segment:  'COLE O SEGMENTO',
    category: 'Branding',
    image:    'COLE_IMAGEM_DO_PROJETO_AQUI',
    tags:     ['SERVIÇO 1', 'ENTREGÁVEL 2'],
    result:
      'COLE A DESCRIÇÃO: explique o que foi feito, qual problema resolveu e qual resultado concreto o cliente obteve.',
    year:   '2025',
    metric: { prefix: '', value: 0, suffix: ' dias', label: 'COLE A MÉTRICA' },
  },
  // ── CASE 4 (opcional — delete se não tiver) ──────────────────────────────
  {
    id:       'case-04',
    title:    'COLE O NOME DO PROJETO',
    client:   'COLE O NOME DO CLIENTE',
    segment:  'COLE O SEGMENTO',
    category: 'Social Media',
    image:    'COLE_IMAGEM_DO_PROJETO_AQUI',
    tags:     ['REDE SOCIAL', 'CONTEÚDO'],
    result:
      'COLE A DESCRIÇÃO: explique o que foi feito, qual problema resolveu e qual resultado concreto o cliente obteve.',
    year:   '2025',
    metric: { prefix: '+', value: 0, suffix: 'k', label: 'COLE A MÉTRICA' },
  },
]

// ── Filtros derivados dos cases reais (sem categorias vazias) ────────────────
const ALL_CATEGORIES = ['Web', 'Marketing', 'Branding', 'Social Media'] as const
const FILTERS = [
  'Todos',
  ...ALL_CATEGORIES.filter((cat) => CASES.some((c) => c.category === cat)),
]

// ── Imagem ou placeholder cinza ───────────────────────────────────────────────
function CaseImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const isReal = src.startsWith('http') || src.startsWith('/')
  if (isReal) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading="lazy" />
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#181818] to-[#111111]">
      <div className="w-10 h-px bg-[#2A2A2A] mb-3" />
      <p className="text-[#2E2E2E] text-[10px] font-mono uppercase tracking-widest text-center px-4">
        cole a imagem<br />do projeto aqui
      </p>
      <div className="w-10 h-px bg-[#2A2A2A] mt-3" />
    </div>
  )
}

// ── Métrica ou placeholder ────────────────────────────────────────────────────
function MetricDisplay({
  metric, countRef, compact,
}: {
  metric: Case['metric']
  countRef?: React.RefObject<HTMLSpanElement | null>
  compact?: boolean
}) {
  const { prefix = '', suffix, label, value, isDecimal } = metric
  const staticValue = value > 0 ? (isDecimal ? value.toFixed(1) : value.toString()) : null

  if (!staticValue) {
    return (
      <p className={`text-[#2A2A2A] font-mono ${compact ? 'text-xs' : 'text-xs'}`}>
        + métrica do resultado
      </p>
    )
  }
  return compact ? (
    <div className="shrink-0 text-right">
      <div className="text-3xl font-black text-white tabular-nums leading-none">
        <span className="text-[#E02020] text-xl">{prefix}</span>
        <span ref={countRef}>{staticValue}</span>
        <span className="text-[#E02020]">{suffix}</span>
      </div>
      <p className="text-[#9898A4] text-[10px] mt-0.5 max-w-[100px] text-right leading-tight">{label}</p>
    </div>
  ) : (
    <div className="flex items-baseline gap-1 mb-5">
      <span className="text-5xl font-black text-white leading-none">
        <span className="text-[#E02020]">{prefix}</span>
        <span ref={countRef}>{staticValue}</span>
        <span className="text-[#E02020]">{suffix}</span>
      </span>
      <span className="text-[#888892] text-sm ml-2">{label}</span>
    </div>
  )
}

// ── Desktop card (3D tilt + hover overlay) ────────────────────────────────────
function CaseCard({ c }: { c: Case }) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement | null>(null)
  const didCount = useRef(false)

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el || window.innerWidth < 1024) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width  - 0.5
    const y = (e.clientY - r.top)  / r.height - 0.5
    gsap.to(el, { rotateX: -y * 7, rotateY: x * 7, scale: 1.02, duration: 0.35, ease: 'power2.out', transformPerspective: 900 })
  }, [])

  const onLeave = useCallback(() => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1,0.35)' })
  }, [])

  useEffect(() => {
    const el = countRef.current
    if (!el || c.metric.value === 0 || didCount.current) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || didCount.current) return
      didCount.current = true
      const obj = { v: 0 }
      gsap.to(obj, {
        v: c.metric.value,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate() {
          if (!countRef.current) return
          countRef.current.textContent = c.metric.isDecimal
            ? obj.v.toFixed(1)
            : Math.round(obj.v).toString()
        },
      })
      io.disconnect()
    }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [c.metric])

  return (
    <div
      ref={cardRef}
      className="group relative h-full overflow-hidden rounded-2xl cursor-pointer bg-[#111111]"
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* Image */}
      <div className="absolute inset-0">
        <CaseImage
          src={c.image}
          alt={c.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Default bottom strip */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between gap-4">
        <div>
          <span className="block text-[#E02020] text-[10px] font-bold uppercase tracking-[0.35em] mb-1">
            {c.category}
          </span>
          <h3 className="text-white font-black text-xl leading-tight line-clamp-2">{c.title}</h3>
          <p className="text-[#9898A4] text-xs mt-1">{c.client} · {c.year}</p>
        </div>
        <MetricDisplay metric={c.metric} countRef={countRef} compact />
      </div>

      {/* Hover overlay */}
      <div
        className="absolute inset-0 bg-[#0A0A0A]/95 flex flex-col justify-end p-6 translate-y-full group-hover:translate-y-0"
        style={{ transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <span className="text-[#E02020] text-[10px] font-bold uppercase tracking-[0.35em] mb-2">
          {c.category} · {c.segment}
        </span>
        <h3 className="text-white font-black text-2xl leading-tight mb-1">{c.title}</h3>
        <p className="text-[#C0C0C8] text-xs mb-3">{c.client} · {c.year}</p>
        <p className="text-[#C0C0C8] text-sm leading-relaxed mb-5 line-clamp-3">{c.result}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {c.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-[#888892] border border-[#222222] px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <MetricDisplay metric={c.metric} countRef={countRef} />
      </div>
    </div>
  )
}

// ── Mobile card ───────────────────────────────────────────────────────────────
function MobileCard({ c }: { c: Case }) {
  const countRef = useRef<HTMLSpanElement | null>(null)
  const didCount = useRef(false)

  useEffect(() => {
    const el = countRef.current
    if (!el || c.metric.value === 0 || didCount.current) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || didCount.current) return
      didCount.current = true
      const obj = { v: 0 }
      gsap.to(obj, {
        v: c.metric.value,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate() {
          if (!countRef.current) return
          countRef.current.textContent = c.metric.isDecimal
            ? obj.v.toFixed(1)
            : Math.round(obj.v).toString()
        },
      })
      io.disconnect()
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [c.metric])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#111111] flex flex-col">
      <div className="aspect-video relative overflow-hidden">
        <CaseImage
          src={c.image}
          alt={c.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 to-transparent" />
        <span className="absolute bottom-3 left-4 text-[#E02020] text-[10px] font-bold uppercase tracking-widest">
          {c.category}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-white font-black text-xl leading-tight mb-0.5">{c.title}</h3>
        <p className="text-[#767680] text-xs mb-1">{c.segment}</p>
        <p className="text-[#767680] text-xs mb-3">{c.client} · {c.year}</p>
        <p className="text-[#B2B2BC] text-sm leading-relaxed mb-5 flex-1">{c.result}</p>
        <MetricDisplay metric={c.metric} countRef={countRef} />
        <div className="flex flex-wrap gap-1.5 mt-3">
          {c.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-[#888892] border border-[#222222] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PortfolioGallery() {
  const [activeFilter, setActiveFilter] = useState<string>('Todos')
  const [isAnimating, setIsAnimating]   = useState(false)
  const gridRef                          = useRef<HTMLDivElement>(null)
  const mobileGridRef                    = useRef<HTMLDivElement>(null)

  const visible = CASES.filter(
    (c) => activeFilter === 'Todos' || c.category === activeFilter,
  )

  // Reveal animation after filter change
  useEffect(() => {
    const grids = [gridRef.current, mobileGridRef.current].filter(Boolean) as HTMLDivElement[]
    grids.forEach((grid) => {
      const cards = Array.from(grid.children) as HTMLElement[]
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', clearProps: 'transform' },
      )
    })
  }, [activeFilter])

  const handleFilter = useCallback(
    (category: string) => {
      if (category === activeFilter || isAnimating) return
      setIsAnimating(true)
      const grids = [gridRef.current, mobileGridRef.current].filter(Boolean) as HTMLDivElement[]
      const cards = grids.flatMap((g) => Array.from(g.children) as HTMLElement[])
      if (cards.length > 0) {
        gsap.to(cards, {
          opacity: 0, y: 12, duration: 0.18, stagger: 0.02,
          onComplete: () => { setActiveFilter(category); setIsAnimating(false) },
        })
      } else {
        setActiveFilter(category)
        setIsAnimating(false)
      }
    },
    [activeFilter, isAnimating],
  )

  return (
    <section className="bg-[#0A0A0A] pb-16">
      {/* Filter bar */}
      <div className="sticky top-16 z-30 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#161616]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {FILTERS.map((f) => {
            const count   = f === 'Todos' ? CASES.length : CASES.filter((c) => c.category === f).length
            const isActive = activeFilter === f
            return (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={`shrink-0 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E02020] text-white shadow-[0_0_20px_rgba(224,32,32,0.3)]'
                    : 'text-[#888892] hover:text-white border border-[#1E1E1E] hover:border-[#333333]'
                }`}
              >
                {f}
                <span className={`text-xs font-mono ${isActive ? 'text-white/70' : 'text-[#575760]'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* DESKTOP bento grid — layout adapts to case count:
          1 case  → full width
          2 cases → 2 equal columns
          3 cases → 1st full width + 2 half-width
          4 cases → 2×2 symmetric grid                         */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 pt-12">
        <div ref={gridRef} className="grid gap-5" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {visible.map((c, idx) => {
            const total    = visible.length
            // First card is full-width only when the total count is odd (3 cases → row of 1 then row of 2)
            const spanFull = total === 1 || (idx === 0 && total % 2 !== 0)
            return (
              <div
                key={c.id}
                className={spanFull ? 'col-span-2' : ''}
                style={{ height: spanFull ? '420px' : '500px' }}
              >
                <CaseCard c={c} />
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-[#575760] text-xs font-mono text-right">
          {visible.length} case{visible.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* MOBILE stacked */}
      <div className="block lg:hidden px-4 sm:px-6 pt-8">
        <div ref={mobileGridRef} className="grid gap-5 sm:grid-cols-2">
          {visible.map((c) => (
            <MobileCard key={c.id} c={c} />
          ))}
        </div>
        <p className="mt-8 text-[#575760] text-xs font-mono text-center">
          {visible.length} case{visible.length !== 1 ? 's' : ''}
        </p>
      </div>
    </section>
  )
}
