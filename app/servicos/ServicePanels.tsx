'use client'

import { createRef, useEffect, useMemo, useSyncExternalStore, type RefObject } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionStyle } from 'framer-motion'
import SectionHeading from '@/components/system/SectionHeading'
import Button from '@/components/system/Button'
import { SERVICES, waLink, type Service } from '@/lib/site'
import { cn } from '@/lib/utils'
import { scrollToService } from './scroll'

type Tone = 'light' | 'night'

/** Um painel escuro para dar ritmo à pilha (o resto é claro). */
const TONES: Record<string, Tone> = {
  'agentes-ia': 'night',
}

/** Topo onde cada card "gruda" (desktop). Cada card desce 10px para a pilha aparecer. */
const stickTop = (i: number) => 96 + i * 10

/** Mesma condição das classes `lg:[@media(min-height:800px)]:sticky`. */
const STACK_QUERY = '(min-width: 1024px) and (min-height: 800px)'
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(STACK_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const useStacked = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(STACK_QUERY).matches, () => false)

function Panel({
  service,
  index,
  total,
  markerRef,
  nextMarkerRef,
  stacked,
}: {
  stacked: boolean
  service: Service
  index: number
  total: number
  markerRef: RefObject<HTMLDivElement | null>
  nextMarkerRef: RefObject<HTMLDivElement | null>
}) {
  const tone = TONES[service.slug] ?? 'light'
  const dark = tone === 'night'
  const isLast = index === total - 1
  const Icon = service.icon

  // Quando o próximo card sobe e começa a cobrir este, ele encolhe e esmaece
  // (efeito de pilha). Começa só quando o próximo passa da metade da tela,
  // para o painel em leitura não "encolher" antes de ser coberto.
  const { scrollYProgress } = useScroll({
    target: nextMarkerRef,
    offset: ['start 55%', `start ${stickTop(index + 1)}px`],
  })
  // reduced motion: a pilha continua (sticky), mas sem encolher
  const reduce = useReducedMotion()
  const shrink = stacked && !isLast && !reduce
  const scale = useTransform(scrollYProgress, [0, 1], [1, shrink ? 0.94 : 1])
  const veil = useTransform(scrollYProgress, [0.2, 1], [0, stacked && !isLast ? 0.55 : 0])

  const number = String(index + 1).padStart(2, '0')
  const cta = (
    <Button
      href={waLink(`Olá! Quero um orçamento de ${service.name}.`)}
      icon="whatsapp"
      variant={dark ? 'white' : 'primary'}
    >
      Pedir orçamento
    </Button>
  )

  return (
    <>
      {/* Âncora fora do card sticky: a posição dela nunca muda, então #slug sempre acerta. */}
      <div ref={markerRef} id={service.slug} className="h-0 scroll-mt-28" aria-hidden="true" />

      <motion.article
        aria-labelledby={`${service.slug}-title`}
        style={{ scale, '--stick': `${stickTop(index)}px` } as MotionStyle}
        className={cn(
          'relative isolate mb-5 flex origin-top flex-col overflow-hidden rounded-[28px] p-6 sm:p-9 lg:mb-8 lg:p-12',
          'lg:[@media(min-height:800px)]:sticky lg:[@media(min-height:800px)]:top-[var(--stick)]',
          'lg:[@media(min-height:800px)]:min-h-[min(540px,calc(100svh-var(--stick)-40px))]',
          dark
            ? 'bg-night text-mist ring-1 ring-night-line shadow-[var(--shadow-lift)]'
            : 'bg-surface text-ink ring-1 ring-line shadow-[var(--shadow-soft)]',
        )}
      >
        {/* textura + ícone gigante como marca d'água */}
        <div
          aria-hidden="true"
          className={cn('pointer-events-none absolute inset-0 -z-10 opacity-70', dark ? 'bg-dot-grid-light' : 'bg-dot-grid')}
          style={{ maskImage: 'radial-gradient(ellipse 55% 75% at 100% 100%, #000 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse 55% 75% at 100% 100%, #000 0%, transparent 70%)' }}
        />
        <Icon
          aria-hidden="true"
          strokeWidth={0.9}
          className={cn(
            'pointer-events-none absolute -bottom-16 -right-12 -z-10 size-[240px] sm:size-[320px] lg:-bottom-20 lg:-right-10 lg:size-[380px]',
            dark ? 'text-white/[0.045]' : 'text-ink/[0.03]',
          )}
        />

        <div className="grid flex-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Coluna esquerda: identidade do serviço */}
          <div className="flex flex-col lg:col-span-6">
            <div className="flex items-center gap-4">
              <span className={cn('grid size-14 place-items-center rounded-2xl', dark ? 'bg-red text-white' : 'bg-red-50 text-red')}>
                <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className={cn('font-mono text-sm tabular-nums', dark ? 'text-mist-2' : 'text-ink-3')}>
                {number} <span className="opacity-50">/ {total}</span>
              </span>
            </div>

            <h3
              id={`${service.slug}-title`}
              className="mt-8 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]"
            >
              {service.name}
              <span className="gam-dot">.</span>
            </h3>
            <p className={cn('mt-5 max-w-[22ch] font-display text-[clamp(1.3rem,2.1vw,1.85rem)] font-semibold leading-[1.12] tracking-[-0.025em]', dark ? 'text-mist-2' : 'text-ink-2')}>
              {service.tagline}
            </p>

            <div className="hidden lg:mt-auto lg:block lg:pt-10">{cta}</div>
          </div>

          {/* Coluna direita: descrição + incluso */}
          <div className="flex flex-col lg:col-span-6 lg:pt-2">
            <p className={cn('type-lead max-w-[52ch]', dark ? 'text-mist' : 'text-ink')}>
              {service.description}
            </p>

            <div className={cn('mt-8 border-t pt-7 lg:mt-auto', dark ? 'border-night-line' : 'border-line')}>
              <p className={cn('type-label mb-5', dark ? 'text-mist-2' : 'text-ink-3')}>O que está incluso</p>
              <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {service.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.95rem] leading-snug">
                    <span aria-hidden="true" className="mt-[0.45em] size-2 shrink-0 rounded-full bg-red ring-4 ring-red/15" />
                    <span className={dark ? 'text-mist' : 'text-ink'}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* no mobile o CTA vem depois do que está incluso */}
            <div className="mt-9 lg:hidden">{cta}</div>
          </div>
        </div>

        {/* véu que esmaece o card quando o próximo cobre */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: veil }}
          className={cn('pointer-events-none absolute inset-0 hidden lg:block', dark ? 'bg-night' : 'bg-paper-2')}
        />
      </motion.article>
    </>
  )
}

/**
 * Painéis detalhados: no desktop (≥1024px e tela alta) são cards empilhados
 * que grudam no topo, o anterior encolhe e esmaece quando o próximo chega.
 * No mobile/telas baixas, lista simples. Âncoras #slug funcionam em ambos.
 */
export default function ServicePanels() {
  const stacked = useStacked()
  const markers = useMemo(
    () => [...SERVICES.map(() => createRef<HTMLDivElement>()), createRef<HTMLDivElement>()],
    [],
  )

  // Chegou com #slug (ex.: card da home)? Garante a parada exata no painel,
  // mesmo depois de fontes/entradas mudarem o layout.
  useEffect(() => {
    const land = (immediate: boolean) => {
      const slug = decodeURIComponent(window.location.hash.slice(1))
      if (SERVICES.some((s) => s.slug === slug)) scrollToService(slug, { immediate, updateHash: false })
    }
    const t = window.setTimeout(() => land(true), 250)
    const onHash = () => land(false)
    window.addEventListener('hashchange', onHash)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  return (
    <section aria-labelledby="detalhes-servicos" className="relative">
      <div className="container-gam">
        <SectionHeading
          kicker="Em detalhe"
          title="O que entregamos em cada frente"
          description="Escopo claro, entregas definidas e um time que conecta tudo. Peça o orçamento direto pelo WhatsApp."
        />
        <span id="detalhes-servicos" className="sr-only">Serviços em detalhe</span>

        <div className="relative mt-14 md:mt-20">
          {SERVICES.map((s, i) => (
            <Panel
              key={`${s.slug}-${stacked ? 'stack' : 'flow'}`}
              service={s}
              index={i}
              total={SERVICES.length}
              markerRef={markers[i]}
              nextMarkerRef={markers[i + 1]}
              stacked={stacked}
            />
          ))}
          {/* marcador final: dá fim à pilha */}
          <div ref={markers[SERVICES.length]} className="h-0" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
