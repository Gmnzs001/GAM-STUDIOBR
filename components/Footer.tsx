'use client'

import Link from 'next/link'
import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ArrowUp, Globe2, Heart, MapPin } from 'lucide-react'
import {
  NAV_LINKS, SERVICES, WA_URL, WHATSAPP_DISPLAY, INSTAGRAM_URL, INSTAGRAM_HANDLE, FOUNDED_YEAR,
} from '@/lib/site'
import { getLenis } from '@/lib/lenis-ref'
import { Kicker } from '@/components/system/SectionHeading'
import { Reveal } from '@/components/system/Reveal'
import Button, { WhatsAppIcon, InstagramIcon } from '@/components/system/Button'
import { Wordmark } from '@/components/system/Logo'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Título do CTA (palavra a palavra, "?" vermelho como acento) ──────────────
const word: Variants = {
  hidden: { y: '115%', rotate: 4 },
  show: (i: number) => ({ y: '0%', rotate: 0, transition: { duration: 1, ease: EASE, delay: i * 0.06 } }),
}

function CtaTitle() {
  const rows = [['Tem', 'um', 'projeto'], ['em', 'mente']]
  let idx = 0
  return (
    <h2 className="type-display text-mist" style={{ fontSize: 'clamp(2.75rem, 8.6vw, 8.75rem)' }}>
      <span className="sr-only">Tem um projeto em mente?</span>
      <motion.span aria-hidden="true" className="block" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
        {rows.map((row, r) => (
          <span key={r} className="block">
            {row.map((w, wi) => {
              const last = r === rows.length - 1 && wi === row.length - 1
              return (
                <Fragment key={w}>
                  <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                    <motion.span className="inline-block origin-bottom-left" custom={idx++} variants={word}>
                      {w}
                      {last && <span className="gam-dot">?</span>}
                    </motion.span>
                  </span>
                  {wi < row.length - 1 && ' '}
                </Fragment>
              )
            })}
          </span>
        ))}
      </motion.span>
    </h2>
  )
}

// ─── Relógio de Goiânia (renderiza só no cliente para evitar mismatch) ───────
function GoianiaClock() {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    let id = 0
    // Atualiza na virada de cada minuto (sem timer rodando à toa).
    const tick = () => {
      const now = new Date()
      setTime(fmt.format(now))
      id = window.setTimeout(tick, 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50)
    }
    tick()
    return () => window.clearTimeout(id)
  }, [])
  return (
    <span className="inline-flex items-center gap-2.5 text-sm text-mist-2">
      <span className="pulse-dot" aria-hidden="true" />
      Goiânia agora
      <span className="font-mono tabular-nums text-mist">{time ?? '--:--'}</span>
      <span className="text-mist-2/70">GMT-3</span>
    </span>
  )
}

// ─── Link com sublinhado que desliza ────────────────────────────────────────
const linkCls =
  'group/link inline-flex min-h-11 items-center gap-2.5 py-1.5 text-[0.95rem] md:min-h-0 text-mist-2 transition-colors duration-300 hover:text-white'
const underline =
  'bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-[var(--ease-out-expo)] group-hover/link:bg-[length:100%_1px]'

function FooterCol({ title, children, delay = 0 }: { title: string; children: ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay} y={20}>
      <h3 className="type-label font-sans text-mist">{title}</h3>
      <ul className="mt-4 space-y-0.5 md:mt-5 md:space-y-1">{children}</ul>
    </Reveal>
  )
}

// ─── Wordmark gigante ────────────────────────────────────────────────────────
const letter: Variants = {
  hidden: { y: '105%' },
  show: (i: number) => ({ y: '0%', transition: { duration: 1.2, ease: EASE, delay: i * 0.05 } }),
}

function GiantWordmark() {
  const chars = 'GAM STUDIO'.split('')
  return (
    <div aria-hidden="true" className="relative select-none overflow-hidden pt-[1.5cqw] [container-type:inline-size] [mask-image:linear-gradient(to_bottom,#000_35%,rgba(0,0,0,0.35))]">
      <motion.div
        className="flex whitespace-nowrap font-display font-extrabold leading-[0.8] tracking-[-0.05em] text-[19.4cqw] [font-variation-settings:'opsz'_96]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {chars.map((c, i) =>
          c === ' ' ? (
            <span key={i} className="w-[0.16em] shrink-0" />
          ) : (
            <span key={i} className="inline-block overflow-hidden pb-[0.04em] pt-[0.1em]">
              <motion.span custom={i} variants={letter} className="inline-block">
                <span
                  className={cn(
                    'inline-block transition-[transform,color] duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-[0.09em]',
                    i < 3 ? 'text-white/[0.07] hover:text-white/90' : 'text-red/[0.18] hover:text-red',
                  )}
                >
                  {c}
                </span>
              </motion.span>
            </span>
          ),
        )}
      </motion.div>
    </div>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
/**
 * `cta={false}` troca o CTA gigante por uma linha compacta (mantendo os botões
 * de WhatsApp e Instagram) — use em páginas que já terminam com um CTA próprio.
 */
export default function Footer({ cta = true }: { cta?: boolean }) {
  const year = new Date().getFullYear()

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, reduce ? { immediate: true } : { duration: 1.6 })
    else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    // Leva o foco do teclado de volta ao início da página.
    document.body.setAttribute('tabindex', '-1')
    document.body.focus({ preventScroll: true })
    document.body.removeAttribute('tabindex')
  }

  return (
    <footer className="relative isolate overflow-hidden bg-night text-mist">
      {/* Texturas: grade de pontos + brilho vermelho suave */}
      <div aria-hidden="true" className="bg-dot-grid-light pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[10%] -top-[30%] -z-10 aspect-square w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(224,32,32,0.16),transparent)]"
      />

      <div className={cn('container-gam', cta ? 'pt-[clamp(88px,11vw,152px)]' : 'pt-[clamp(56px,7vw,96px)]')}>
        {cta ? (
          /* ── CTA ── */
          <div>
            <Kicker tone="dark" className="mb-6 md:mb-8">Vamos conversar</Kicker>
            <CtaTitle />
            <Reveal delay={0.2} className="mt-10 grid gap-8 md:mt-12 lg:grid-cols-12 lg:items-end">
              <p className="type-lead max-w-[44ch] text-mist-2 lg:col-span-6">
                Conte sua ideia pelo WhatsApp. A gente entende o seu momento e monta um plano sob medida para o seu negócio.
              </p>
              <div className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end">
                <Button href={WA_URL} size="lg" icon="whatsapp">Faça seu orçamento</Button>
                <Button href={INSTAGRAM_URL} variant="outline-light" size="lg" icon="instagram">Instagram</Button>
              </div>
            </Reveal>
          </div>
        ) : (
          /* ── Linha compacta (a página já terminou com um CTA) ── */
          <Reveal y={16} className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="type-title text-mist">
              Prefere chamar direto<span className="gam-dot">?</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href={WA_URL} icon="whatsapp">Faça seu orçamento</Button>
              <Button href={INSTAGRAM_URL} variant="outline-light" icon="instagram">Instagram</Button>
            </div>
          </Reveal>
        )}

        {/* ── Colunas ── */}
        <div className={cn('grid grid-cols-2 gap-x-6 gap-y-12 border-t border-night-line pt-14 md:grid-cols-12 md:gap-x-8', cta ? 'mt-[clamp(72px,9vw,128px)]' : 'mt-[clamp(40px,5vw,64px)]')}>
          <Reveal y={20} className="col-span-2 md:col-span-12 lg:col-span-4">
            <Link href="/" aria-label="GAM Studio — início" className="inline-block">
              <Wordmark tone="dark" className="text-[1.6rem]" />
            </Link>
            <p className="mt-5 max-w-[34ch] text-[0.95rem] leading-relaxed text-mist-2">
              Agência de marketing, mídia e desenvolvimento digital. Criando marcas, sites e campanhas desde {FOUNDED_YEAR}.
            </p>
            <div className="mt-6">
              <GoianiaClock />
            </div>
          </Reveal>

          <nav aria-label="Rodapé" className="col-span-1 md:col-span-3 lg:col-span-2">
            <FooterCol title="Navegação" delay={0.05}>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkCls}>
                    <span className={underline}>{l.label}</span>
                  </Link>
                </li>
              ))}
            </FooterCol>
          </nav>

          <div className="col-span-1 md:col-span-4 lg:col-span-3">
            <FooterCol title="Serviços" delay={0.1}>
              {SERVICES.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link href={`/servicos#${s.slug}`} className={linkCls}>
                    <span className={underline}>{s.name}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/servicos" className={cn(linkCls, 'font-semibold text-mist')}>
                  <span className={underline}>Ver todos</span>
                  <span className="grid size-5 place-items-center rounded-full bg-red text-white transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/link:rotate-45">
                    <ArrowUp className="size-3 rotate-45" strokeWidth={2.6} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            </FooterCol>
          </div>

          <div className="col-span-2 md:col-span-5 lg:col-span-3">
            <FooterCol title="Contato" delay={0.15}>
              <li>
                <a href={WA_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  <WhatsAppIcon className="size-4 shrink-0 text-red" />
                  <span className={underline}>{WHATSAPP_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  <InstagramIcon className="size-4 shrink-0 text-red" />
                  <span className={underline}>{INSTAGRAM_HANDLE}</span>
                </a>
              </li>
              <li className="flex min-h-11 items-center gap-2.5 py-1.5 text-[0.95rem] text-mist-2 md:min-h-0">
                <MapPin className="size-4 shrink-0 text-red" strokeWidth={2} aria-hidden="true" />
                Goiânia — GO, Brasil
              </li>
              <li className="flex min-h-11 items-start gap-2.5 py-2.5 text-[0.95rem] text-mist-2 md:min-h-0 md:py-1.5">
                <Globe2 className="mt-[0.2em] size-4 shrink-0 text-red" strokeWidth={2} aria-hidden="true" />
                Atendemos Brasil, Estados Unidos e Europa
              </li>
            </FooterCol>
          </div>
        </div>
      </div>

      {/* ── Wordmark gigante ── */}
      <div className="mt-[clamp(40px,5vw,72px)] px-[clamp(12px,2vw,28px)]">
        <GiantWordmark />
      </div>

      {/* ── Barra inferior ── */}
      <div className="container-gam">
        <div className="flex flex-col gap-4 border-t border-night-line py-7 text-sm text-mist-2 md:flex-row md:items-center md:justify-between">
          <p suppressHydrationWarning>© {year} GAM Studio. Todos os direitos reservados.</p>
          <p className="inline-flex items-center gap-1.5">
            Feito por GamStudio com
            <Heart className="size-4 fill-red text-red" strokeWidth={0} aria-label="amor" role="img" />
          </p>
          <button
            type="button"
            onClick={toTop}
            className="group/top inline-flex h-11 items-center gap-3 self-start rounded-full pl-0 pr-1 font-medium text-mist transition-colors hover:text-white md:self-auto"
          >
            Voltar ao topo
            <span className="grid size-9 place-items-center rounded-full ring-1 ring-inset ring-night-line transition-[background-color,box-shadow] duration-300 group-hover/top:bg-red group-hover/top:ring-red">
              <ArrowUp className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/top:-translate-y-0.5" strokeWidth={2.2} aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
