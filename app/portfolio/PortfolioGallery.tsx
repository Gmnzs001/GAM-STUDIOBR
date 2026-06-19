'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Cases data ────────────────────────────────────────────────────────────────
type Case = {
  id: string
  title: string
  client: string
  category: string
  image: string
  tags: string[]
  result: string
  year: string
  metric: { prefix?: string; value: number; suffix: string; label: string; isDecimal?: boolean }
  wide?: boolean  // spans both columns on desktop
}

const CASES: Case[] = [
  {
    id: 'ecommerce-redesign-seo',
    title: 'Redesign + SEO E-commerce',
    client: 'E-commerce Nacional',
    category: 'Web',
    image: 'https://picsum.photos/seed/ecommerce/1200/800',
    tags: ['Next.js', 'SEO Técnico', 'UX/UI'],
    result: 'Redesign completo com foco em performance e SEO técnico profundo. Taxa de rejeição caiu de 78% para 34% em 4 meses.',
    year: '2024',
    metric: { prefix: '+', value: 320, suffix: '%', label: 'tráfego orgânico' },
    wide: true,
  },
  {
    id: 'trafego-pago-eua',
    title: 'Tráfego Pago EUA',
    client: 'SaaS B2B',
    category: 'Marketing',
    image: 'https://picsum.photos/seed/marketing/1200/800',
    tags: ['Google ADS', 'Meta ADS', 'CRO'],
    result: 'Campanhas ultra-segmentadas com criativos localizados para o mercado americano. Lucro acumulado em 3 meses.',
    year: '2024',
    metric: { value: 4.8, suffix: 'x', label: 'de ROI no primeiro trimestre', isDecimal: true },
  },
  {
    id: 'branding-startup-lisboa',
    title: 'Branding Startup Portuguesa',
    client: 'Startup Lisboa',
    category: 'Branding',
    image: 'https://picsum.photos/seed/branding/1200/800',
    tags: ['Naming', 'Identidade Visual', 'Brandbook'],
    result: 'Processo de branding end-to-end — do naming ao manual de marca. Lançamento em 45 dias, reconhecida em PT e BR.',
    year: '2023',
    metric: { value: 45, suffix: ' dias', label: 'do briefing ao lançamento' },
  },
  {
    id: 'redes-moda',
    title: 'Gestão Redes Moda',
    client: 'Marca de Moda',
    category: 'Social Media',
    image: 'https://picsum.photos/seed/social/1200/800',
    tags: ['Instagram', 'TikTok', 'Conteúdo'],
    result: 'Rebranding do social media com estratégia de conteúdo viral. Engagement triplicou nas primeiras semanas.',
    year: '2024',
    metric: { prefix: '+', value: 15, suffix: 'k', label: 'seguidores em 90 dias' },
  },
  {
    id: 'landing-lancamento',
    title: 'Landing Page Lançamento',
    client: 'EdTech',
    category: 'Web',
    image: 'https://picsum.photos/seed/landing/1200/800',
    tags: ['React', 'A/B Testing', 'Copy'],
    result: 'Reestruturação completa de copy e design com foco em psicologia de compra. Taxa original era 1,2%.',
    year: '2024',
    metric: { prefix: '+', value: 240, suffix: '%', label: 'na taxa de conversão' },
  },
  {
    id: 'franquias-360',
    title: 'Estratégia 360 Franquias',
    client: 'Rede de Franquias',
    category: 'Marketing',
    image: 'https://picsum.photos/seed/franquias/1200/800',
    tags: ['ADS', 'Branding', 'SEO', 'Social'],
    result: 'Plano 360° integrando digital e offline para todas as unidades. 40% de crescimento em novos franqueados.',
    year: '2023',
    metric: { prefix: 'R$', value: 2, suffix: 'M+', label: 'em vendas geradas', isDecimal: false },
    wide: true,
  },
]

const FILTERS = ['Todos', 'Web', 'Marketing', 'Branding', 'Social Media'] as const

// ── Single case card ──────────────────────────────────────────────────────────
function CaseCard({ c, onCountStart }: { c: Case; onCountStart: (id: string) => void }) {
  const cardRef    = useRef<HTMLDivElement>(null)
  const countRef   = useRef<HTMLSpanElement>(null)
  const didCount   = useRef(false)

  // 3D tilt (desktop via CSS media query guard in the handlers)
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el || window.innerWidth < 1024) return
    const r  = el.getBoundingClientRect()
    const x  = (e.clientX - r.left) / r.width  - 0.5
    const y  = (e.clientY - r.top)  / r.height - 0.5
    gsap.to(el, { rotateX: -y * 7, rotateY: x * 7, scale: 1.02, duration: 0.35, ease: 'power2.out', transformPerspective: 900 })
  }, [])

  const onLeave = useCallback(() => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1,0.35)' })
  }, [])

  // Metric counter via IntersectionObserver (avoids ScrollTrigger re-register issues)
  useEffect(() => {
    const el = countRef.current
    if (!el) return
    const { value, isDecimal } = c.metric
    if (value === 0) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || didCount.current) return
        didCount.current = true
        const obj = { v: 0 }
        gsap.to(obj, {
          v: value,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate() {
            if (!countRef.current) return
            const display = isDecimal ? obj.v.toFixed(1) : Math.round(obj.v).toString()
            countRef.current.textContent = display
          },
        })
        io.disconnect()
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [c.metric])

  const { prefix = '', suffix, label, value, isDecimal } = c.metric
  const staticValue = isDecimal ? value.toFixed(1) : value.toString()

  return (
    <div
      ref={cardRef}
      className="group relative h-full overflow-hidden rounded-2xl cursor-pointer bg-[#111111]"
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {/* ── Image ── */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.image}
          alt={c.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* ── Default overlay — bottom strip (always visible) ── */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between gap-4">
        <div>
          <span className="block text-[#E02020] text-[10px] font-bold uppercase tracking-[0.35em] mb-1">
            {c.category}
          </span>
          <h3 className="text-white font-black text-xl leading-tight line-clamp-2">{c.title}</h3>
          <p className="text-[#666666] text-xs mt-1">{c.client} · {c.year}</p>
        </div>

        {/* Metric badge */}
        <div className="shrink-0 text-right">
          <div className="text-3xl font-black text-white tabular-nums leading-none">
            <span className="text-[#E02020] text-xl">{prefix}</span>
            <span ref={countRef}>{staticValue}</span>
            <span className="text-[#E02020]">{suffix}</span>
          </div>
          <p className="text-[#666666] text-[10px] mt-0.5 max-w-[100px] text-right leading-tight">{label}</p>
        </div>
      </div>

      {/* ── Hover overlay — slides up ── */}
      <div
        className="absolute inset-0 bg-[#0A0A0A]/95 flex flex-col justify-end p-6 translate-y-full group-hover:translate-y-0"
        style={{ transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <span className="text-[#E02020] text-[10px] font-bold uppercase tracking-[0.35em] mb-2">
          {c.category}
        </span>
        <h3 className="text-white font-black text-2xl leading-tight mb-3">{c.title}</h3>
        <p className="text-[#A0A0A0] text-sm leading-relaxed mb-5 line-clamp-3">{c.result}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {c.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-[#555555] border border-[#222222] px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Large metric */}
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-5xl font-black text-white leading-none">
            <span className="text-[#E02020]">{prefix}</span>
            {staticValue}
            <span className="text-[#E02020]">{suffix}</span>
          </span>
          <span className="text-[#555555] text-sm ml-2">{label}</span>
        </div>

        <div className="flex items-center gap-2 text-white text-sm font-bold group-hover:text-[#E02020] transition-colors">
          <span>Ver case completo</span>
          <span className="text-[#E02020]">→</span>
        </div>
      </div>
    </div>
  )
}

// ── Mobile card ───────────────────────────────────────────────────────────────
function MobileCard({ c }: { c: Case }) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const didCount = useRef(false)

  useEffect(() => {
    const el = countRef.current
    if (!el) return
    const { value, isDecimal } = c.metric
    if (value === 0) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || didCount.current) return
        didCount.current = true
        const obj = { v: 0 }
        gsap.to(obj, {
          v: value,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate() {
            if (!countRef.current) return
            countRef.current.textContent = isDecimal ? obj.v.toFixed(1) : Math.round(obj.v).toString()
          },
        })
        io.disconnect()
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [c.metric])

  const { prefix = '', suffix, label, value, isDecimal } = c.metric
  const staticValue = isDecimal ? value.toFixed(1) : value.toString()

  return (
    <div ref={cardRef} className="relative overflow-hidden rounded-2xl bg-[#111111] flex flex-col">
      {/* Image */}
      <div className="aspect-video relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.image} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 to-transparent" />
        <span className="absolute bottom-3 left-4 text-[#E02020] text-[10px] font-bold uppercase tracking-widest">
          {c.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-white font-black text-xl leading-tight mb-1">{c.title}</h3>
        <p className="text-[#444444] text-xs mb-3">{c.client} · {c.year}</p>
        <p className="text-[#888888] text-sm leading-relaxed mb-5 flex-1">{c.result}</p>

        {/* Metric */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-black text-white leading-none">
            <span className="text-[#E02020]">{prefix}</span>
            <span ref={countRef}>{staticValue}</span>
            <span className="text-[#E02020]">{suffix}</span>
          </span>
          <span className="text-[#555555] text-xs ml-2">{label}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {c.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-[#555555] border border-[#222222] px-2 py-0.5 rounded-full">
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

  // ── Reveal cards after filter change (single source of truth) ───────────
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

  // ── Filter handler ────────────────────────────────────────────────────────
  const handleFilter = useCallback(
    (category: string) => {
      if (category === activeFilter || isAnimating) return
      setIsAnimating(true)

      const grids = [gridRef.current, mobileGridRef.current].filter(Boolean) as HTMLDivElement[]
      const cards = grids.flatMap((g) => Array.from(g.children) as HTMLElement[])

      if (cards.length > 0) {
        gsap.to(cards, {
          opacity: 0,
          y: 12,
          duration: 0.18,
          stagger: 0.02,
          onComplete: () => {
            setActiveFilter(category)
            setIsAnimating(false)
          },
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
      {/* ── Category filter bar ── */}
      <div className="sticky top-16 z-30 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#161616]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {FILTERS.map((f) => {
            const count = f === 'Todos' ? CASES.length : CASES.filter((c) => c.category === f).length
            const isActive = activeFilter === f
            return (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                className={`shrink-0 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E02020] text-white shadow-[0_0_20px_rgba(224,32,32,0.3)]'
                    : 'text-[#555555] hover:text-white border border-[#1E1E1E] hover:border-[#333333]'
                }`}
              >
                {f}
                <span className={`text-xs font-mono ${isActive ? 'text-white/70' : 'text-[#333333]'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── DESKTOP: 2-column bento grid ── */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 pt-12">
        <div
          ref={gridRef}
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
        >
          {visible.map((c) => {
            const isWide = !!c.wide
            const bothWide = visible.filter((v) => v.wide).length >= 2
            const spanFull = isWide && !bothWide
            return (
              <div
                key={c.id}
                className={spanFull ? 'col-span-2' : ''}
                style={{ height: spanFull ? '380px' : '480px' }}
              >
                <CaseCard c={c} onCountStart={() => {}} />
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-[#333333] text-xs font-mono text-right">
          {visible.length} case{visible.length !== 1 ? 's' : ''} encontrado{visible.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── MOBILE/TABLET: vertical stacked ── */}
      <div className="block lg:hidden px-4 sm:px-6 pt-8">
        <div ref={mobileGridRef} className="grid gap-5 sm:grid-cols-2">
          {visible.map((c) => (
            <MobileCard key={c.id} c={c} />
          ))}
        </div>

        <p className="mt-8 text-[#333333] text-xs font-mono text-center">
          {visible.length} case{visible.length !== 1 ? 's' : ''}
        </p>
      </div>
    </section>
  )
}
