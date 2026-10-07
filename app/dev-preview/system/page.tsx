'use client'

// Preview temporária do design system — será removida no fim.
import Navbar from '@/components/Navbar'
import SectionHeading from '@/components/system/SectionHeading'
import Button from '@/components/system/Button'
import SpotlightCard from '@/components/system/SpotlightCard'
import CountUp from '@/components/system/CountUp'
import MarqueeBand from '@/components/system/MarqueeBand'
import { RevealText } from '@/components/system/Reveal'
import { SERVICES, STATS } from '@/lib/site'

export default function SystemPreview() {
  return (
    <>
      <Navbar />
      <main className="pt-40">
        <section className="container-gam">
          <RevealText as="h1" className="type-hero max-w-[12ch]" lines={['Sua marca', 'no próximo', 'nível']} dot />
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="#" size="lg" icon="whatsapp">Faça seu orçamento</Button>
            <Button href="/portfolio" variant="outline" size="lg">Ver portfólio</Button>
            <Button href="#" variant="ink">Ink</Button>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-5">
            {STATS.map((s) => (
              <div key={s.label}>
                <CountUp value={s.value} suffix={s.suffix} className="type-num block text-6xl text-ink" />
                <p className="mt-2 text-sm text-ink-2">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
        <MarqueeBand items={SERVICES.map((s) => s.name)} />
        <section className="container-gam section-y">
          <SectionHeading kicker="O que fazemos" title="Doze serviços, uma estratégia" description="Tudo que sua marca precisa para crescer, num só time." aside={<Button href="/servicos" variant="outline" size="sm">Ver todos</Button>} />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {SERVICES.slice(0, 3).map((s) => (
              <SpotlightCard key={s.slug} tilt={5} className="rounded-[28px] bg-surface p-8 shadow-[var(--shadow-soft)] ring-1 ring-line">
                <s.icon className="size-6 text-red" />
                <h3 className="type-card mt-8">{s.name}</h3>
                <p className="mt-2 text-ink-2">{s.short}</p>
              </SpotlightCard>
            ))}
          </div>
        </section>
        <section className="bg-night section-y">
          <div className="container-gam">
            <SectionHeading tone="dark" kicker="Portfólio" title="Resultados que dá pra medir" />
            <div className="mt-10 h-40 rounded-[28px] bg-[#123457]" />
          </div>
        </section>
      </main>
    </>
  )
}
