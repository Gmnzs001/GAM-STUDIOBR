'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Marquee } from '@/components/Marquee'
import SectionHeading from '@/components/system/SectionHeading'
import Button from '@/components/system/Button'
import { Reveal } from '@/components/system/Reveal'
import { SERVICES, type Service } from '@/lib/site'
import { cn } from '@/lib/utils'

const ROW_1 = SERVICES.slice(0, 6)
const ROW_2 = SERVICES.slice(6)

/**
 * Card do carrossel. No hover/foco um preenchimento vermelho sobe da base,
 * o texto fica branco e o chip de seta gira 45°.
 * Usa `group/card` (nomeado) para não colidir com o `group` do Marquee.
 */
function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon
  return (
    <Link
      href={`/servicos#${service.slug}`}
      data-cursor="Ver"
      aria-label={`${service.name}: ${service.short}`}
      className={[
        'group/card relative isolate flex h-[300px] w-[284px] shrink-0 flex-col overflow-hidden rounded-[28px] bg-surface p-7 sm:w-[340px]',
        'ring-1 ring-line shadow-[var(--shadow-soft)] outline-none',
        'transition-[box-shadow,transform] duration-500 ease-[var(--ease-out-expo)]',
        'hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] focus-visible:-translate-y-1 focus-visible:shadow-[var(--shadow-lift)]',
        'focus-visible:ring-2 focus-visible:ring-ink',
        // preenchimento vermelho que sobe
        'before:absolute before:inset-0 before:-z-10 before:translate-y-[calc(100%+2px)] before:rounded-[inherit] before:bg-red before:content-[""]',
        'before:transition-transform before:duration-700 before:ease-[var(--ease-out-expo)]',
        'hover:before:translate-y-0 focus-visible:before:translate-y-0',
      ].join(' ')}
    >
      <div className="flex items-start">
        <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red transition-colors duration-500 group-hover/card:bg-white/15 group-hover/card:text-white group-focus-visible/card:bg-white/15 group-focus-visible/card:text-white">
          <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-6">
        <h3 className="type-card text-ink transition-colors duration-500 group-hover/card:text-white group-focus-visible/card:text-white">
          {service.name}
        </h3>
        <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-2 transition-colors duration-500 group-hover/card:text-white/85 group-focus-visible/card:text-white/85">
          {service.short}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-4 transition-colors duration-500 group-hover/card:border-white/20 group-focus-visible/card:border-white/20">
        <span className="line-clamp-2 text-[0.8125rem] font-medium leading-snug text-ink-3 transition-colors duration-500 group-hover/card:text-white/80 group-focus-visible/card:text-white/80">
          {service.tagline}
        </span>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-ink ring-1 ring-line transition-[transform,background-color,color] duration-500 ease-[var(--ease-out-expo)] group-hover/card:rotate-45 group-hover/card:bg-white group-hover/card:text-red group-hover/card:ring-white group-focus-visible/card:rotate-45 group-focus-visible/card:bg-white group-focus-visible/card:text-red">
          <ArrowUpRight className="size-4" strokeWidth={2.2} aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}

function ServiceRow({ items, reverse }: { items: Service[]; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  // As cópias do marquee são aria-hidden: tira os links delas da ordem do Tab
  // (continuam clicáveis com o mouse) para o teclado percorrer cada serviço uma vez.
  useEffect(() => {
    ref.current
      ?.querySelectorAll<HTMLAnchorElement>('[data-slot="marquee"] > [aria-hidden="true"] a')
      .forEach((a) => a.setAttribute('tabindex', '-1'))
  }, [])

  return (
    <div ref={ref} className="mask-fade-x">
      <Marquee
        pauseOnHover
        reverse={reverse}
        repeat={3}
        ariaLabel={reverse ? 'Mais serviços' : 'Serviços'}
        ariaRole="region"
        className={cn(
          'py-4 [--duration:64s] [--gap:1.25rem] motion-reduce:overflow-x-auto [&:focus-within>div]:[animation-play-state:paused]',
          // desencontra as duas fileiras para os cards não ficarem alinhados em coluna
          reverse && '[&>div]:[animation-delay:-9s]',
        )}
      >
        {items.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </Marquee>
    </div>
  )
}

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)

  // Fora da tela, pausa as 6 faixas animadas (economiza composição/GPU).
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => el.toggleAttribute('data-offscreen', !entry.isIntersecting),
      { rootMargin: '120px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="servicos"
      className={cn(
        'relative scroll-mt-28 overflow-hidden',
        // seção clara seguida de outra clara: base menor para não somar dois paddings cheios
        'pt-[calc(var(--section-y)*0.8)] pb-[calc(var(--section-y)*0.4)]',
        '[&[data-offscreen]_.animate-marquee]:[animation-play-state:paused]',
      )}
    >
      <div className="container-gam">
        <SectionHeading
          kicker="O que fazemos"
          title="Doze serviços, uma só estratégia"
          description="Do site ao tráfego, da marca à IA. Tudo conectado por um só time para sua marca crescer com previsibilidade."
          aside={<Button href="/servicos" variant="outline" size="sm">Ver todos os serviços</Button>}
        />
      </div>

      <Reveal delay={0.1} y={40} amount={0.1} className="mt-14 flex flex-col gap-1 md:mt-20">
        <ServiceRow items={ROW_1} />
        <ServiceRow items={ROW_2} reverse />
      </Reveal>

      <div className="container-gam mt-6 md:mt-8">
        <p className="flex items-center gap-2.5 text-[0.8125rem] text-ink-3">
          <span className="size-1.5 shrink-0 rounded-full bg-red" aria-hidden="true" />
          <span className="hidden md:inline">Passe o mouse para pausar. Clique em um serviço para ver o que está incluso.</span>
          <span className="md:hidden">Toque em um serviço para ver o que está incluso.</span>
        </p>
      </div>
    </section>
  )
}
