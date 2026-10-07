'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import {
  BarChart3, Bot, Eye, Globe2, Layers, LineChart, PenTool, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FOUNDER, FOUNDED_YEAR, INSTAGRAM_URL, waLink } from '@/lib/site'
import SectionHeading, { Kicker } from '@/components/system/SectionHeading'
import { Reveal, RevealText } from '@/components/system/Reveal'
import Button from '@/components/system/Button'
import SpotlightCard from '@/components/system/SpotlightCard'
import { AboutStats, FounderPortrait } from '@/components/About'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Conteúdo ────────────────────────────────────────────────────────────────
const TIMELINE = [
  {
    when: String(FOUNDED_YEAR),
    title: 'O começo, em Goiânia',
    text: 'A GAM nasce como um projeto de design e desenvolvimento, com a convicção de que marcas brasileiras merecem presença digital no nível das melhores do mundo.',
  },
  {
    when: 'Expansão',
    title: 'Uma agência completa',
    text: 'O estúdio passa a integrar marketing, mídia e tecnologia: sites, anúncios, conteúdo, branding e agentes de IA trabalhando juntos.',
  },
  {
    when: 'Hoje',
    title: 'Três mercados',
    text: 'Mais de 120 projetos entregues para clientes no Brasil, nos Estados Unidos e na Europa.',
  },
]

const VALUES: { icon: LucideIcon; word: string; headline: string; body: string }[] = [
  {
    icon: Eye,
    word: 'Presença',
    headline: 'Ser visto é o primeiro passo.',
    body: 'Presença digital não é opcional, é oxigênio. Construímos marcas que ocupam espaço com consistência e autoridade, onde a sua audiência já está: buscas, redes, anúncios e resultados orgânicos.',
  },
  {
    icon: Layers,
    word: 'Estrutura',
    headline: 'Crescimento sem base é ilusão.',
    body: 'Estratégia, processos e tecnologia trabalhando juntos. Cada campanha, página e conteúdo conectado a um objetivo real de negócio. Sem desperdício de verba, sem ação isolada.',
  },
  {
    icon: LineChart,
    word: 'Previsibilidade',
    headline: 'Resultado que você pode antecipar.',
    body: 'Métricas claras, relatórios honestos e metas que fazem sentido. Transformamos o imprevisível do mercado em um sistema previsível de aquisição e crescimento.',
  },
]

const PROCESS = [
  { title: 'Diagnóstico', text: 'Entendemos o negócio, o público e a concorrência e mapeamos onde estão as oportunidades.' },
  { title: 'Estratégia', text: 'Montamos um plano integrado, com metas claras, canais certos e prazos que fazem sentido.' },
  { title: 'Execução', text: 'Design, desenvolvimento, conteúdo e mídia feitos pelo mesmo time, tudo conectado.' },
  { title: 'Otimização', text: 'Medimos, testamos e ajustamos sempre, com relatórios honestos sobre o que funciona.' },
]

const DIFFERENTIALS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Bot, title: 'IA aplicada ao marketing', desc: 'Agentes de atendimento, automações e análise de dados que reduzem custo e aumentam a velocidade de resposta.' },
  { icon: PenTool, title: 'Design de alto nível', desc: 'Sites, identidades e materiais que competem com as melhores marcas do mundo, independente do tamanho da empresa.' },
  { icon: Globe2, title: 'Visão internacional', desc: 'Atendemos clientes no Brasil, nos EUA e na Europa e adaptamos a linguagem de cada marca a cada mercado.' },
  { icon: BarChart3, title: 'Estratégia orientada a dados', desc: 'Cada decisão é embasada em números reais. Nada de achismo: testamos, medimos e otimizamos continuamente.' },
]

// ─── História + linha do tempo ───────────────────────────────────────────────
function Timeline() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.6'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  const reduce = useReducedMotion()

  return (
    <ol ref={ref} className="relative space-y-5 pl-9 md:pl-12">
      <span aria-hidden="true" className="absolute bottom-6 left-[7px] top-6 w-px bg-line-2 md:left-[11px]" />
      <motion.span
        aria-hidden="true"
        style={{ scaleY: reduce ? 1 : scaleY }}
        className="absolute bottom-6 left-[7px] top-6 w-px origin-top bg-red md:left-[11px]"
      />
      {TIMELINE.map((t, i) => (
        <Reveal as="li" key={t.when} delay={i * 0.08} className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-9 top-7 grid size-[15px] place-items-center rounded-full bg-paper ring-2 ring-red md:-left-12 md:size-[23px]"
          >
            <span className="size-[5px] rounded-full bg-red md:size-[7px]" />
          </span>
          <div className="rounded-[20px] bg-surface/90 p-6 shadow-[var(--shadow-soft)] ring-1 ring-line md:p-7">
            <p className="font-display text-[clamp(1.9rem,3vw,2.5rem)] font-bold leading-none tracking-[-0.03em] text-ink">
              {t.when}
            </p>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.015em] text-ink">{t.title}</h3>
            <p className="mt-1.5 text-[0.97rem] leading-relaxed text-ink-2">{t.text}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  )
}

function Story() {
  return (
    <section className="section-y relative" aria-label="Nossa história">
      <div className="container-gam grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <Kicker className="mb-6 md:mb-8">Nossa história</Kicker>
          <RevealText
            as="h2"
            lines={['Nascemos em Goiânia,', 'crescemos no mundo']}
            dot
            className="type-display max-w-[14ch] text-ink"
          />
          <div className="mt-10 max-w-[56ch] space-y-5 text-ink-2">
            <Reveal delay={0.1}>
              <p className="type-lead text-ink">
                A GAM Studio nasceu em {FOUNDED_YEAR} com uma convicção clara: marcas brasileiras merecem presença
                digital no mesmo nível das melhores do mundo.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p>
                O que começou como um projeto de design e desenvolvimento em Goiânia se tornou uma agência completa de
                marketing, mídia e tecnologia. Hoje atendemos clientes no{' '}
                <strong className="font-semibold text-ink">Brasil, nos Estados Unidos e na Europa</strong>, unindo
                design de alto nível, estratégia de crescimento e inteligência artificial.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <p>
                Não somos uma agência de serviços genéricos. Somos parceiros de longo prazo,{' '}
                <strong className="font-semibold text-ink">obcecados por resultado</strong> e comprometidos com a
                transformação real dos negócios que nos escolhem.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8 lg:pt-28">
          <Timeline />
        </div>
      </div>
    </section>
  )
}

// ─── Números ─────────────────────────────────────────────────────────────────
function Numbers() {
  return (
    <section className="relative pb-[var(--section-y)]" aria-labelledby="numeros-titulo">
      <div className="container-gam">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
          <div>
            <Kicker className="mb-5">Em números</Kicker>
            <h2 id="numeros-titulo" className="type-title max-w-[22ch] text-ink">
              O que construímos desde {FOUNDED_YEAR}<span className="gam-dot">.</span>
            </h2>
          </div>
        </div>
        <AboutStats />
      </div>
    </section>
  )
}

// ─── Missão e visão ──────────────────────────────────────────────────────────
function MissionVision() {
  const items = [
    {
      label: 'Missão',
      title: 'Transformar presença digital em crescimento real.',
      text: 'Conectamos marcas às suas audiências com design, estratégia e tecnologia. Cada projeto vai além do estético e gera impacto mensurável nos resultados do negócio.',
    },
    {
      label: 'Visão',
      title: 'Ser a agência de referência para quem quer competir globalmente.',
      text: 'Queremos que nossos clientes olhem para suas marcas daqui a cinco anos e reconheçam a parceria com a GAM como um divisor de águas. Presentes em três mercados, seguimos expandindo fronteiras.',
    },
  ]
  return (
    <section className="relative pb-[var(--section-y)]" aria-label="Missão e visão">
      <div className="container-gam">
        <div className="grid overflow-hidden rounded-[28px] bg-surface/80 ring-1 ring-line md:grid-cols-2">
          {items.map((it, i) => (
            <Reveal
              key={it.label}
              delay={i * 0.1}
              className={cn('p-8 md:p-12 lg:p-14', i === 1 && 'border-t border-line md:border-l md:border-t-0')}
            >
              <p className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 type-label text-red-600">
                <span className="size-1.5 rounded-full bg-red" aria-hidden="true" />
                {it.label}
              </p>
              <h3 className="type-title mt-6 max-w-[18ch] text-ink">{it.title}</h3>
              <p className="mt-5 max-w-[48ch] text-ink-2">{it.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Valores ─────────────────────────────────────────────────────────────────
function Values() {
  return (
    <section className="relative pb-[var(--section-y)]" aria-label="Nossos valores">
      <div className="container-gam">
        <SectionHeading
          kicker="Nossos valores"
          title="Três palavras guiam tudo o que fazemos"
          description="Presença, estrutura e previsibilidade não são slogan: são o critério com que avaliamos cada projeto."
        />
        <div className="mt-14 grid gap-5 md:mt-20 lg:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.word} delay={i * 0.08} className="h-full">
              <SpotlightCard
                tilt={5}
                className="flex h-full flex-col rounded-[28px] bg-surface/85 p-7 shadow-[var(--shadow-soft)] ring-1 ring-line transition-shadow duration-500 hover:shadow-[var(--shadow-lift)] md:p-9"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red transition-colors duration-500 group-hover/spot:bg-red group-hover/spot:text-white">
                  <v.icon className="size-5" strokeWidth={2.1} aria-hidden="true" />
                </span>
                <h3 className="type-title mt-10 text-ink">
                  {v.word}
                  <span className="gam-dot">.</span>
                </h3>
                <p className="mt-4 font-display text-lg font-semibold leading-snug tracking-[-0.015em] text-ink">
                  {v.headline}
                </p>
                <p className="mt-3 text-[0.97rem] leading-relaxed text-ink-2">{v.body}</p>
                <span aria-hidden="true" className="mt-auto block pt-8">
                  <span className="block h-[3px] origin-left scale-x-[0.12] rounded-full bg-red transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/spot:scale-x-100" />
                </span>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Como trabalhamos ────────────────────────────────────────────────────────
function Process() {
  return (
    <section className="relative pb-[var(--section-y)]" aria-label="Como trabalhamos">
      <div className="container-gam">
        <SectionHeading
          kicker="Como trabalhamos"
          title="Do diagnóstico ao resultado"
          description="Um processo simples e transparente, com você acompanhando cada etapa."
        />
        <ol className="relative mt-14 grid gap-8 sm:grid-cols-2 sm:gap-10 md:mt-20 lg:grid-cols-4 lg:gap-6">
          <motion.span
            aria-hidden="true"
            className="absolute left-0 right-0 top-[38px] hidden h-px origin-left bg-line-2 lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.4, ease: EASE }}
          />
          {PROCESS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={0.1 + i * 0.1} className="group relative flex gap-5 sm:block">
              <span className="relative z-[1] grid size-14 shrink-0 place-items-center rounded-full bg-paper ring-1 ring-line-2 transition-colors duration-500 group-hover:bg-ink group-hover:ring-ink sm:size-[76px]">
                <span className="type-num text-xl text-ink transition-colors duration-500 group-hover:text-white sm:text-[1.75rem]">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </span>
              <div>
                <h3 className="type-card pt-3 text-ink sm:mt-7 sm:pt-0">{s.title}</h3>
                <p className="mt-2 max-w-[30ch] text-[0.97rem] leading-relaxed text-ink-2">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ─── Por que a GAM ───────────────────────────────────────────────────────────
function Differentials() {
  return (
    <section className="relative pb-[var(--section-y)]" aria-label="Por que a GAM">
      <div className="container-gam grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <Kicker className="mb-6 md:mb-8">Por que a GAM</Kicker>
            <RevealText
              as="h2"
              text="O que nos torna diferentes"
              dot
              className="type-display max-w-[12ch] text-ink"
            />
          </div>
        </div>
        <ul className="border-t border-line lg:col-span-7">
          {DIFFERENTIALS.map((d, i) => (
            <Reveal as="li" key={d.title} delay={i * 0.06}>
              <div className="group relative isolate flex gap-5 overflow-hidden border-b border-line px-1 py-8 md:gap-7 md:px-6 md:py-10">
                {/* preenchimento que sobe no hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-[1] translate-y-full bg-surface/90 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-0"
                />
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface text-ink ring-1 ring-line transition-colors duration-500 group-hover:bg-red group-hover:text-white group-hover:ring-red">
                  <d.icon className="size-5" strokeWidth={2.1} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="type-card text-ink">{d.title}</h3>
                  <p className="mt-2 max-w-[52ch] text-ink-2">{d.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── Fundador ────────────────────────────────────────────────────────────────
function Founder() {
  return (
    <section className="relative overflow-x-clip pb-[var(--section-y)]" aria-label="Fundador">
      <div className="container-gam grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5">
          <FounderPortrait caption={false} className="mr-3 max-w-[460px] sm:mx-auto lg:ml-0 lg:mr-10" />
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <Kicker className="mb-6 md:mb-8">Quem lidera</Kicker>
          <RevealText
            as="h2"
            lines={[FOUNDER.name]}
            dot
            className="font-display text-[clamp(3.25rem,8vw,7rem)] font-extrabold leading-[0.9] tracking-[-0.045em] text-ink"
          />
          <Reveal delay={0.1}>
            <p className="type-lead mt-4 text-ink-2">{FOUNDER.role}</p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 max-w-[54ch] space-y-4 border-l-2 border-red pl-5 text-ink-2 md:pl-6">
            <p>
              <span className="font-medium text-ink">
                {FOUNDER.name} fundou a GAM Studio em {FOUNDED_YEAR}, em Goiânia,
              </span>{' '}
              com uma convicção clara: marcas brasileiras merecem presença digital no mesmo nível das melhores do
              mundo.
            </p>
            <p>
              Sob a sua liderança, o estúdio de design e desenvolvimento virou uma agência completa de marketing, mídia e
              tecnologia, com clientes no Brasil, nos Estados Unidos e na Europa.
            </p>
          </Reveal>
          <Reveal delay={0.26} className="mt-10 flex flex-wrap gap-3">
            <Button href={waLink('Olá! Vim pela página Sobre e gostaria de conversar com a GAM.')} variant="ink" icon="whatsapp">
              Fale com a GAM
            </Button>
            <Button href={INSTAGRAM_URL} variant="outline" icon="instagram">
              Ver Instagram
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ─── CTA final ───────────────────────────────────────────────────────────────
function ClosingCTA() {
  return (
    <section className="relative isolate overflow-hidden bg-red text-white" aria-label="Faça seu orçamento">
      <div aria-hidden="true" className="absolute inset-0 -z-[1] bg-dot-grid-light opacity-80" />
      <p
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.22em] right-[-0.04em] -z-[1] select-none font-display text-[clamp(10rem,30vw,28rem)] font-extrabold leading-none tracking-[-0.06em] text-white/[0.08]"
      >
        GAM.
      </p>
      <div className="container-gam section-y">
        <Reveal className="mb-8">
          <Kicker tone="red">Pronto para crescer?</Kicker>
        </Reveal>
        <RevealText
          as="h2"
          lines={['Vamos construir algo', 'extraordinário juntos']}
          dot
          className="font-display text-[clamp(2.6rem,7vw,6.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-white [&_.gam-dot]:text-ink"
        />
        <Reveal delay={0.2}>
          <p className="type-lead mt-8 max-w-[50ch] text-white">
            Uma conversa de 30 minutos pode mudar o rumo da sua marca. Sem compromisso: só clareza sobre o que você
            precisa e como podemos ajudar.
          </p>
        </Reveal>
        <Reveal delay={0.3} className="mt-10 flex flex-wrap gap-3">
          <Button href={waLink('Olá! Vim pela página Sobre e gostaria de fazer um orçamento.')} variant="white" size="lg" icon="whatsapp">
            Faça seu orçamento
          </Button>
          <Button href="/portfolio" variant="outline-light" size="lg">
            Ver portfólio
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

export default function AboutContent() {
  return (
    <>
      <Story />
      <Numbers />
      <MissionVision />
      <Values />
      <Process />
      <Differentials />
      <Founder />
      <ClosingCTA />
    </>
  )
}
