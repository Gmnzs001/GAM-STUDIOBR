import type { Metadata } from 'next'
import { BadgeCheck, Globe2, MapPin, Sparkles } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageHero from '@/components/system/PageHero'
import { FOUNDED_YEAR, STATS } from '@/lib/site'
import AboutContent from './AboutContent'
import HeroVisual from './HeroVisual'

export const metadata: Metadata = {
  title: 'Sobre | GAM Studio',
  description:
    `Conheça a GAM Studio, agência de marketing, mídia e desenvolvimento digital nascida em Goiânia em ${FOUNDED_YEAR}. Atendemos clientes no Brasil, EUA e Europa unindo design, estratégia e inteligência artificial.`,
}

const PROJECTS = STATS[0]

const FACTS = [
  { icon: BadgeCheck, label: `${PROJECTS.value}${PROJECTS.suffix} ${PROJECTS.label}` },
  { icon: MapPin, label: 'Goiânia, Brasil' },
  { icon: Globe2, label: 'Brasil, Estados Unidos e Europa' },
  { icon: Sparkles, label: 'Marketing, mídia e tecnologia' },
]

export default function SobrePage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          kicker="Quem somos"
          lines={['Sobre', 'a GAM']}
          description={`Uma agência de marketing, mídia e desenvolvimento digital nascida em Goiânia em ${FOUNDED_YEAR}. Unimos design, estratégia e inteligência artificial para marcas no Brasil, nos Estados Unidos e na Europa.`}
          visual={<HeroVisual />}
        >
          <ul className="flex flex-wrap gap-2.5">
            {FACTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-surface/90 px-4 py-2 text-sm font-medium text-ink-2 ring-1 ring-line"
              >
                <Icon className="size-4 text-red" strokeWidth={2.2} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </PageHero>

        <AboutContent />
      </main>
      <Footer cta={false} />
    </>
  )
}
