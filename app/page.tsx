'use client'

import { useCallback, useState } from 'react'
import { IntroContext, hasIntroPlayed, markIntroPlayed } from '@/lib/intro'
import { SERVICES } from '@/lib/site'
import Intro from '@/components/Intro'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MarqueeBand from '@/components/system/MarqueeBand'
import Services from '@/components/Services'
import About from '@/components/About'
import Cases from '@/components/Cases'
import Testimonials from '@/components/Testimonials'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

const BAND_ITEMS = SERVICES.map((s) => s.name)

export default function Home() {
  // O site é renderizado desde o início (SEO); a intro fica por cima.
  // `revealed` libera as animações de entrada do Hero/Navbar.
  // A intro toca uma vez por carregamento: voltando à home pela navegação
  // interna ela não repete. (?intro=0 na URL também pula — tratado no <Intro>.)
  const [skipIntro] = useState(hasIntroPlayed)
  const [revealed, setRevealed] = useState(skipIntro)
  const [introOn, setIntroOn] = useState(!skipIntro)

  const onReveal = useCallback(() => {
    markIntroPlayed()
    setRevealed(true)
  }, [])
  const onComplete = useCallback(() => setIntroOn(false), [])

  return (
    <IntroContext.Provider value={revealed}>
      {introOn && <Intro onReveal={onReveal} onComplete={onComplete} />}
      <Navbar />
      <main>
        <Hero />
        <MarqueeBand items={BAND_ITEMS} />
        <Services />
        <About />
        <Cases />
        <Testimonials />
        <CTASection />
      </main>
      {/* A home já termina com o CTA + formulário — footer sem o CTA gigante */}
      <Footer cta={false} />
    </IntroContext.Provider>
  )
}
