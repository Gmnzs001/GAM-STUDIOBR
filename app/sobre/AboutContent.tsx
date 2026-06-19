'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 120, suffix: '+', label: 'Projetos Entregues', isDecimal: false },
  { value: 98, suffix: '%', label: 'Clientes Satisfeitos', isDecimal: false },
  { value: 5, suffix: '+', label: 'Anos de Mercado', isDecimal: false },
  { value: 3, suffix: '', label: 'Países Atendidos', isDecimal: false },
] as const

const VALUES = [
  {
    word: 'Presença',
    number: '01',
    headline: 'Ser visto é o primeiro passo.',
    body: 'Presença digital não é opcional — é oxigênio. Construímos marcas que ocupam espaço no mercado com consistência e autoridade. Cada ponto de contato com o seu cliente é uma oportunidade de posicionamento. Trabalhamos para que a sua marca esteja onde a sua audiência já está: buscas, redes, anúncios e resultados orgânicos.',
    accent: '#E02020',
  },
  {
    word: 'Estrutura',
    number: '02',
    headline: 'Crescimento sem base é ilusão.',
    body: 'Estratégia, processos e tecnologia trabalhando juntos. Quando estruturamos o digital de uma empresa, garantimos que cada campanha, cada página e cada conteúdo esteja conectado a um objetivo real de negócio. Sem desperdício de verba. Sem ação isolada. Tudo integrado para escalar.',
    accent: '#E02020',
  },
  {
    word: 'Previsibilidade',
    number: '03',
    headline: 'Resultado que você pode antecipar.',
    body: 'Métricas claras, relatórios honestos e metas que fazem sentido para o seu negócio. Não vendemos promessas — entregamos análise, planejamento e execução com responsabilidade. O nosso trabalho é transformar o imprevisível do mercado em um sistema previsível de aquisição e crescimento.',
    accent: '#E02020',
  },
] as const

const DIFFERENTIALS = [
  { title: 'IA aplicada ao marketing', desc: 'Agentes de atendimento, automações e análise de dados que reduzem custo e aumentam velocidade de resposta.' },
  { title: 'Design de alto nível', desc: 'Sites, identidades e materiais que competem com as melhores marcas do mundo — independente do tamanho da empresa.' },
  { title: 'Visão internacional', desc: 'Atendemos clientes no Brasil, EUA e Europa. Entendemos os diferentes mercados e adaptamos a linguagem de cada marca.' },
  { title: 'Estratégia orientada a dados', desc: 'Cada decisão é embasada em números reais. Nada de achismos: testamos, medimos e otimizamos continuamente.' },
]

// ── Stat counter ──────────────────────────────────────────────────────────────
function StatBlock({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const numRef  = useRef<HTMLSpanElement>(null)
  const didRun  = useRef(false)

  useEffect(() => {
    const el = numRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || didRun.current) return
      didRun.current = true
      const obj = { v: 0 }
      gsap.to(obj, {
        v: value,
        duration: 2,
        ease: 'power2.out',
        onUpdate() { if (numRef.current) numRef.current.textContent = Math.round(obj.v).toString() },
      })
      io.disconnect()
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [value])

  return (
    <div className="flex flex-col items-start">
      <div className="text-[clamp(3.5rem,8vw,7rem)] font-black text-white leading-none tabular-nums tracking-tight">
        <span ref={numRef}>0</span>
        <span className="text-[#E02020]">{suffix}</span>
      </div>
      <p className="text-[#888892] text-sm uppercase tracking-[0.2em] mt-2 font-medium">{label}</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AboutContent() {
  const rootRef       = useRef<HTMLDivElement>(null)
  const originRef     = useRef<HTMLElement>(null)
  const statsRef      = useRef<HTMLElement>(null)
  const valuesRef     = useRef<HTMLElement>(null)
  const diffRef       = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // ── DESKTOP ──────────────────────────────────────────────────────────
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        // Origin section: big year parallax
        const yearEl = originRef.current?.querySelector('[data-parallax="year"]') as HTMLElement
        if (yearEl) {
          gsap.fromTo(yearEl, { y: 0 }, {
            y: -80,
            ease: 'none',
            scrollTrigger: { trigger: originRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
          })
        }

        // Origin text reveal
        const originLines = originRef.current?.querySelectorAll('[data-reveal]')
        if (originLines?.length) {
          gsap.fromTo(originLines, { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: originRef.current, start: 'top 70%', once: true },
          })
        }

        // Stats stagger
        const statEls = statsRef.current?.querySelectorAll('[data-stat]')
        if (statEls?.length) {
          gsap.fromTo(statEls, { opacity: 0, y: 50 }, {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: statsRef.current, start: 'top 75%', once: true },
          })
        }

        // Values: each value panel reveals with a left-line wipe
        const valuePanels = valuesRef.current?.querySelectorAll('[data-value-panel]')
        valuePanels?.forEach((panel) => {
          const line    = panel.querySelector('[data-value-line]') as HTMLElement
          const number  = panel.querySelector('[data-value-num]') as HTMLElement
          const heading = panel.querySelector('[data-value-heading]') as HTMLElement
          const body    = panel.querySelector('[data-value-body]') as HTMLElement

          const tl = gsap.timeline({
            scrollTrigger: { trigger: panel, start: 'top 72%', once: true },
          })
          if (line)    tl.fromTo(line,    { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.inOut' })
          if (number)  tl.fromTo(number,  { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
          if (heading) tl.fromTo(heading, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
          if (body)    tl.fromTo(body,    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        })

        // Differentials grid
        const diffCards = diffRef.current?.querySelectorAll('[data-diff-card]')
        if (diffCards?.length) {
          gsap.fromTo(diffCards, { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: diffRef.current, start: 'top 75%', once: true },
          })
        }

        return () => {}
      })

      // ── MOBILE ───────────────────────────────────────────────────────────
      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        const reveals = rootRef.current?.querySelectorAll('[data-reveal], [data-stat], [data-value-panel], [data-diff-card]')
        reveals?.forEach((el) => {
          gsap.fromTo(el, { opacity: 0, y: 28 }, {
            opacity: 1, y: 0, duration: 0.55, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          })
        })
        return () => {}
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef}>

      {/* ══════════════════════════════════════════════════════════════════
          SEÇÃO 1 — ORIGEM
      ══════════════════════════════════════════════════════════════════ */}
      <section
        ref={originRef}
        className="relative overflow-hidden bg-[#0A0A0A] py-28 lg:py-40"
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          {/* Desktop: asymmetric two-column */}
          <div className="lg:grid lg:grid-cols-[1fr_auto] lg:gap-16 lg:items-start">

            {/* Left — narrative */}
            <div className="max-w-2xl">
              <span data-reveal className="inline-block text-[#E02020] text-xs font-bold uppercase tracking-[0.45em] mb-8">
                Nossa história
              </span>

              <h2
                data-reveal
                className="text-[clamp(2.8rem,6vw,5.5rem)] font-black text-white leading-none tracking-tight mb-10"
              >
                Nascemos em
                <br />
                <span className="text-[#E02020]">Goiânia.</span>
                <br />
                <span className="text-[#333333]">Crescemos</span>
                <br />
                no mundo.
              </h2>

              <div className="space-y-6">
                <p data-reveal className="text-[#B2B2BC] text-lg leading-relaxed">
                  A <span className="text-white font-semibold">GAM Studio</span> nasceu em 2020 com uma convicção clara: marcas brasileiras merecem presença digital no mesmo nível das melhores do mundo. O que começou como um projeto de design e desenvolvimento em Goiânia se tornou uma agência completa de marketing, mídia e tecnologia.
                </p>
                <p data-reveal className="text-[#B2B2BC] text-lg leading-relaxed">
                  Hoje atendemos clientes no <span className="text-white font-semibold">Brasil, nos Estados Unidos e na Europa</span> — unindo design de alto nível, estratégia de crescimento e inteligência artificial para construir marcas que competem globalmente.
                </p>
                <p data-reveal className="text-[#B2B2BC] text-lg leading-relaxed">
                  Não somos uma agência de serviços genéricos. Somos parceiros estratégicos de longo prazo — <span className="text-white font-semibold">obcecados por resultado</span> e comprometidos com a transformação real dos negócios que nos escolhem.
                </p>
              </div>

              {/* Flags */}
              <div data-reveal className="flex items-center gap-6 mt-10">
                {['🇧🇷 Brasil', '🇺🇸 USA', '🇪🇺 Europa'].map((f) => (
                  <span key={f} className="text-[#888892] text-sm font-medium">{f}</span>
                ))}
              </div>
            </div>

            {/* Right — decorative year (desktop only) */}
            <div
              data-parallax="year"
              className="hidden lg:block select-none pointer-events-none"
            >
              <span
                className="block font-black text-[#E02020] leading-none"
                style={{
                  fontSize: 'clamp(5rem, 12vw, 14rem)',
                  opacity: 0.07,
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  letterSpacing: '-0.04em',
                }}
              >
                2020
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SEÇÃO 2 — STATS
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="bg-[#080808] border-y border-[#161616] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Label */}
          <p className="text-[#575760] text-xs uppercase tracking-[0.4em] font-bold mb-14">
            Números que falam por si
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-14 gap-x-8">
            {STATS.map((s) => (
              <div key={s.label} data-stat>
                <StatBlock value={s.value} suffix={s.suffix} label={s.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SEÇÃO 3 — MISSÃO E VISÃO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0A0A0A] py-24 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-20">

            {/* Missão */}
            <div data-reveal>
              <span className="text-[#E02020] text-[10px] font-bold uppercase tracking-[0.45em] block mb-5">
                Missão
              </span>
              <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-5">
                Transformar presença digital em <span className="text-[#E02020]">crescimento real.</span>
              </h3>
              <p className="text-[#9898A4] text-base leading-relaxed">
                Conectamos marcas às suas audiências com design, estratégia e tecnologia. Cada projeto é uma oportunidade de criar algo que vai além do estético — que gera impacto mensurável nos resultados do negócio.
              </p>
            </div>

            {/* Visão */}
            <div data-reveal className="mt-16 lg:mt-0 lg:pt-16 border-t border-[#161616] lg:border-t-0 lg:border-l lg:border-[#161616] lg:pl-20">
              <span className="text-[#E02020] text-[10px] font-bold uppercase tracking-[0.45em] block mb-5">
                Visão
              </span>
              <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-5">
                Ser a agência de referência para quem quer <span className="text-[#E02020]">competir globalmente.</span>
              </h3>
              <p className="text-[#9898A4] text-base leading-relaxed">
                Queremos que nossos clientes olhem para suas marcas daqui a 5 anos e reconheçam que a parceria com a GAM foi um divisor de águas. Presente em 3 países, nosso objetivo é continuar expandindo fronteiras junto com quem acredita no poder do digital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SEÇÃO 4 — VALORES (3 cenas)
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={valuesRef} className="bg-[#060606] py-8 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
          <span className="text-[#E02020] text-xs font-bold uppercase tracking-[0.45em]">
            Nossos valores
          </span>
        </div>

        <div className="space-y-0">
          {VALUES.map((v, i) => (
            <div
              key={v.word}
              data-value-panel
              className={`relative overflow-hidden border-t border-[#111111] py-16 lg:py-24 ${
                i === VALUES.length - 1 ? 'border-b' : ''
              }`}
            >
              {/* Giant background word */}
              <div
                className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden"
                aria-hidden
              >
                <span
                  className="font-black text-white whitespace-nowrap"
                  style={{
                    fontSize: 'clamp(6rem, 18vw, 22rem)',
                    opacity: 0.025,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    transform: i % 2 === 0 ? 'translateX(-2%)' : 'translateX(2%)',
                  }}
                >
                  {v.word}
                </span>
              </div>

              <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
                <div className={`lg:grid lg:gap-20 ${i % 2 === 0 ? 'lg:grid-cols-[auto_1fr]' : 'lg:grid-cols-[1fr_auto]'}`}>

                  {/* Number + word block */}
                  <div className={`flex flex-col ${i % 2 !== 0 ? 'lg:order-2 lg:items-end' : ''}`}>
                    {/* Red line */}
                    <div
                      data-value-line
                      className="h-px bg-[#E02020] mb-8 origin-left"
                      style={{ width: 'clamp(60px, 8vw, 120px)' }}
                    />
                    <span data-value-num className="text-[#E02020] text-xs font-bold uppercase tracking-[0.45em] block mb-3">
                      {v.number}
                    </span>
                    <h3
                      data-value-heading
                      className={`text-[clamp(3rem,7vw,7rem)] font-black text-white leading-none tracking-tight ${
                        i % 2 !== 0 ? 'lg:text-right' : ''
                      }`}
                    >
                      {v.word}
                    </h3>
                  </div>

                  {/* Text block */}
                  <div
                    data-value-body
                    className={`mt-8 lg:mt-0 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:order-1' : ''}`}
                  >
                    <p className="text-xl lg:text-2xl font-black text-white mb-4 leading-tight">
                      {v.headline}
                    </p>
                    <p className="text-[#9898A4] text-base lg:text-lg leading-relaxed max-w-lg">
                      {v.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SEÇÃO 5 — DIFERENCIAIS
      ══════════════════════════════════════════════════════════════════ */}
      <section ref={diffRef} className="bg-[#0A0A0A] py-24 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="lg:flex lg:items-start lg:gap-20 mb-16">
            <span className="text-[#E02020] text-xs font-bold uppercase tracking-[0.45em] shrink-0">
              Por que a GAM
            </span>
            <h2 className="mt-6 lg:mt-0 text-[clamp(2.2rem,5vw,4rem)] font-black text-white leading-tight tracking-tight max-w-2xl">
              O que nos torna diferentes de qualquer outra agência.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-px bg-[#161616]">
            {DIFFERENTIALS.map((d, i) => (
              <div
                key={d.title}
                data-diff-card
                className={`bg-[#0A0A0A] p-8 lg:p-12 ${
                  i === 0 ? 'lg:border-r lg:border-[#161616]' : ''
                }`}
              >
                <span className="text-[#E02020] text-[10px] font-bold uppercase tracking-[0.35em] block mb-5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h4 className="text-white font-black text-xl lg:text-2xl leading-tight mb-4">
                  {d.title}
                </h4>
                <p className="text-[#888892] text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SEÇÃO 6 — CTA FINAL
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#080808] border-t border-[#111111] py-28 lg:py-40">
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(224,32,32,0.10) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="text-[#E02020] text-xs font-bold uppercase tracking-[0.45em] block mb-8">
            Pronto para crescer?
          </span>
          <h2 className="text-[clamp(2.5rem,7vw,5.5rem)] font-black text-white leading-none tracking-tight mb-8">
            Vamos construir algo
            <br />
            <span className="text-[#E02020]">extraordinário</span>
            <br />
            juntos.
          </h2>
          <p className="text-[#9898A4] text-lg leading-relaxed mb-12 max-w-xl mx-auto">
            Uma conversa de 30 minutos pode mudar o rumo da sua marca. Sem compromisso — só clareza sobre o que você precisa e como podemos ajudar.
          </p>

          <a
            href="https://api.whatsapp.com/send/?phone=5562992589599&text=Ol%C3%A1%2C+vim+pela+p%C3%A1gina+Sobre+e+gostaria+de+fazer+um+or%C3%A7amento!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#E02020] text-white font-black text-base rounded-full hover:bg-[#C01010] transition-colors"
            style={{ boxShadow: '0 0 40px rgba(224,32,32,0.35)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882a.5.5 0 0 0 .612.612l6.035-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.003-1.369l-.359-.214-3.72.903.919-3.638-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
            </svg>
            Fazer meu orçamento
          </a>
        </div>
      </section>

    </div>
  )
}
