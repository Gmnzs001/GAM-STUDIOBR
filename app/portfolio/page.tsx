import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageHero from '@/components/system/PageHero'
import CountUp from '@/components/system/CountUp'
import { FOUNDED_YEAR, STATS } from '@/lib/site'
import PortfolioGallery from './PortfolioGallery'
import HeroCovers from './HeroCovers'

export const metadata: Metadata = {
  title: 'Portfólio | GAM Studio',
  description:
    'Cases reais de clientes com resultados mensuráveis. Redesign e SEO, tráfego pago, branding, social media e estratégia 360°. Veja como transformamos presença digital em crescimento.',
}

// 120+ projetos · 98% satisfeitos · 3 países (fonte única: lib/site.ts)
const HERO_STATS = ['projetos entregues', 'clientes satisfeitos', 'países atendidos']
  .map((label) => STATS.find((s) => s.label === label))
  .filter((s): s is (typeof STATS)[number] => Boolean(s))

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          kicker="Portfólio"
          lines={['Projetos que', 'geram resultado']}
          description="Cada projeto é uma história de crescimento. Veja o que entregamos para marcas no Brasil, nos Estados Unidos e na Europa, com o número que importou para cada uma."
          visual={<HeroCovers />}
        >
          {/* Faixa compacta de provas (mesmos números da home, em outro formato) */}
          <dl className="flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-line pt-7 md:gap-x-12 md:pt-8">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <dt className="order-last max-w-[12ch] text-sm leading-snug text-ink-2">
                  {s.label}
                  {s.detail && <span className="block text-ink-3">{s.detail}</span>}
                </dt>
                <dd>
                  <CountUp
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    className="type-num block text-[clamp(1.9rem,3.2vw,2.6rem)] text-ink"
                  />
                </dd>
              </div>
            ))}
            <div className="flex items-center gap-3 md:ml-auto">
              <dt className="sr-only">No mercado</dt>
              <dd className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line">
                <span className="size-1.5 rounded-full bg-red" aria-hidden="true" />
                Goiânia, desde {FOUNDED_YEAR}
              </dd>
            </div>
          </dl>
        </PageHero>

        <PortfolioGallery />
      </main>
      <Footer cta={false} />
    </>
  )
}
