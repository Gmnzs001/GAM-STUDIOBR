import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageHero from '@/components/system/PageHero'
import Button from '@/components/system/Button'
import { Reveal, RevealText } from '@/components/system/Reveal'
import { Kicker } from '@/components/system/SectionHeading'
import { waLink } from '@/lib/site'
import ConsultoriaLink from './ConsultoriaLink'
import ServiceChips from './ServiceChips'
import ServiceIndex from './ServiceIndex'
import ServicePanels from './ServicePanels'

export const metadata: Metadata = {
  title: 'Serviços',
  description:
    'Criação de sites, SEO, agentes de IA, Google Ads, redes sociais, branding e mais: ' +
    '12 serviços integrados de marketing e tecnologia para fazer sua marca crescer no digital.',
}

export default function ServicosPage() {
  return (
    <>
      <Navbar />

      <main>
        <PageHero
          kicker="Serviços"
          lines={['Tudo que sua marca', 'precisa para crescer']}
          description="Doze serviços integrados, da estratégia à execução, para construir, escalar e consolidar sua presença digital no Brasil, nos Estados Unidos e na Europa."
        >
          <ServiceChips />
        </PageHero>

        <ServiceIndex />

        <ServicePanels />

        {/* CTA final (logo após os painéis: topo menor para não somar dois respiros) */}
        <section className="pb-[calc(var(--section-y)*0.6)] pt-[calc(var(--section-y)*0.45)]">
          <div className="container-gam">
            <div className="relative isolate overflow-hidden rounded-[36px] bg-red px-6 py-14 text-white shadow-[var(--shadow-red)] sm:px-12 sm:py-20 lg:px-20 lg:py-24">
              <div aria-hidden="true" className="bg-dot-grid-light absolute inset-0 -z-10 opacity-80" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-[0.2em] -right-[0.04em] -z-10 select-none font-display text-[clamp(10rem,30vw,26rem)] font-extrabold leading-none tracking-[-0.06em] text-white/[0.08]"
              >
                GAM.
              </span>

              <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-8">
                  <Kicker tone="red" className="mb-8">Consultoria completa</Kicker>
                  <RevealText
                    as="h2"
                    lines={['Não sabe por', 'onde começar?']}
                    className="type-display max-w-[14ch] text-white"
                  />
                  <Reveal delay={0.15}>
                    <p className="type-lead mt-6 max-w-[46ch] text-white/85">
                      A Consultoria Completa faz o diagnóstico 360° da sua presença digital e entrega um plano
                      claro para 90 dias, 6 meses e 1 ano. Você sabe exatamente onde investir.
                    </p>
                  </Reveal>
                </div>
                <Reveal delay={0.25} className="flex flex-col items-start gap-3 lg:col-span-4 lg:items-end">
                  <Button
                    href={waLink('Olá! Quero agendar a Consultoria Completa da GAM Studio.')}
                    icon="whatsapp"
                    variant="white"
                    size="lg"
                  >
                    Agendar diagnóstico
                  </Button>
                  <ConsultoriaLink />
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer cta={false} />
    </>
  )
}
