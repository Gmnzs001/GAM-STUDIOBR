import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageHero from '@/components/system/PageHero'
import ContactContent from './ContactContent'
import HeroChips from './HeroChips'
import ContactHeroVisual from './ContactHeroVisual'

export const metadata: Metadata = {
  title: 'Contato | GAM Studio',
  description:
    'Fale com a GAM Studio. Preencha o formulário, chame no WhatsApp ou siga no Instagram. Respondemos em até 24 horas.',
}

export default function ContatoPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          kicker="Contato"
          lines={['Vamos', 'conversar']}
          description="Sua próxima grande ideia começa aqui. Preencha o formulário ou chame direto no WhatsApp — respondemos rápido."
          visual={<ContactHeroVisual />}
        >
          <HeroChips />
        </PageHero>
        <ContactContent />
      </main>
      <Footer cta={false} />
    </>
  )
}
