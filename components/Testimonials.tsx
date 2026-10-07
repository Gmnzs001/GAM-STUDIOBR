'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { TESTIMONIALS, COUNTRIES } from '@/lib/site'
import { Kicker } from '@/components/system/SectionHeading'
import { Reveal, RevealText } from '@/components/system/Reveal'
import { Stars, TestimonialCard, TestimonialsColumn } from '@/components/TestimonialsColumn'
import { cn } from '@/lib/utils'

// Distribui alternando entre as duas colunas para variar regiões e tamanhos
const COL_A = TESTIMONIALS.filter((_, i) => i % 2 === 0)
const COL_B = TESTIMONIALS.filter((_, i) => i % 2 === 1)

export default function Testimonials() {
  const marqueeRef = useRef<HTMLDivElement>(null)

  // Pausa os marquees quando a seção sai da tela (escreve direto no DOM, sem re-render).
  useEffect(() => {
    const el = marqueeRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => el.style.setProperty('--marquee-play', entry.isIntersecting ? 'running' : 'paused'),
      { rootMargin: '100px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section id="depoimentos" aria-label="Depoimentos" className="section-y relative scroll-mt-28">
      <div className="container-gam grid gap-12 lg:grid-cols-12 lg:gap-10">
        {/* ── Coluna esquerda: título + nota ── */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Kicker className="mb-6 md:mb-8">Depoimentos</Kicker>
            <RevealText
              as="h2"
              text="Quem trabalha com a gente recomenda"
              dot
              className="type-display max-w-[13ch] text-ink"
            />

            <Reveal delay={0.15}>
              <p className="type-lead mt-6 max-w-[40ch] text-ink-2 md:mt-8">
                Empresas do Brasil, dos Estados Unidos e da Europa confiam na GAM para crescer com estratégia, design e tecnologia.
              </p>
            </Reveal>

            <Reveal delay={0.25} className="mt-10 md:mt-12">
              <div className="flex items-end gap-5 border-t border-line-2 pt-8">
                <span className="type-num text-[clamp(4.5rem,8vw,7rem)] text-ink">
                  5,0
                </span>
                <div className="pb-2">
                  <Stars size="size-5" />
                  <p className="mt-2 text-sm leading-snug text-ink-2">
                    Nota média dos clientes
                    <br />
                    <span className="text-ink-3">em {TESTIMONIALS.length} depoimentos</span>
                  </p>
                </div>
              </div>

              <ul className="mt-8 flex flex-wrap gap-2" aria-label="Regiões atendidas">
                {COUNTRIES.map((c) => (
                  <li
                    key={c}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface/80 pl-3 pr-4 text-sm font-medium text-ink ring-1 ring-inset ring-line"
                  >
                    <MapPin className="size-3.5 text-red" strokeWidth={2.2} aria-hidden="true" />
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        {/* ── Coluna direita: marquee (tablet/desktop) ── */}
        <Reveal delay={0.1} className="hidden min-w-0 md:block lg:col-span-7" amount={0.1}>
          <div ref={marqueeRef} className="mask-fade-y grid h-[600px] grid-cols-2 gap-5 lg:h-[680px]">
            <TestimonialsColumn testimonials={COL_A} duration={52} />
            <TestimonialsColumn testimonials={COL_B} duration={60} reverse />
          </div>
        </Reveal>

        {/* ── Mobile: carrossel com swipe ── */}
        <MobileCarousel />
      </div>
    </section>
  )
}

// ─── Carrossel mobile (scroll-snap nativo + indicador) ───────────────────────

function MobileCarousel() {
  const trackRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const items = Array.from(track.children) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(items.indexOf(e.target as HTMLElement))
        })
      },
      { root: track, threshold: 0.6 },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const goTo = (i: number) => {
    const track = trackRef.current
    const first = track?.children[0] as HTMLElement | undefined
    const el = track?.children[i] as HTMLElement | undefined
    if (!track || !first || !el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left: el.offsetLeft - first.offsetLeft, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <Reveal delay={0.1} className="min-w-0 md:hidden">
      <ul
        ref={trackRef}
        aria-label="Depoimentos de clientes"
        className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[var(--gutter)] pb-4 pt-1 [scrollbar-width:none] [scroll-padding-inline:var(--gutter)] [&::-webkit-scrollbar]:hidden"
      >
        {TESTIMONIALS.map((t) => (
          <li key={t.name} className="flex w-[86%] max-w-[360px] shrink-0 snap-start">
            <TestimonialCard t={t} className="w-full hover:translate-y-0" />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div role="group" className="-ml-2 flex items-center" aria-label="Escolher depoimento">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              type="button"
              aria-current={active === i ? 'true' : undefined}
              aria-label={`Depoimento ${i + 1} de ${TESTIMONIALS.length}`}
              onClick={() => goTo(i)}
              className="grid h-11 min-w-8 place-items-center"
            >
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]',
                  active === i ? 'w-6 bg-red' : 'w-1.5 bg-line-2',
                )}
              />
            </button>
          ))}
        </div>
        <span className="whitespace-nowrap font-mono text-xs tabular-nums text-ink-3" aria-hidden="true">
          {String(active + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
        </span>
      </div>
    </Reveal>
  )
}
