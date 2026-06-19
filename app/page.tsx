'use client'

import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import { HeroParallax } from '@/components/HeroParallax'
import SectionDivider from '@/components/SectionDivider'
import Services from '@/components/Services'
import About from '@/components/About'
import Cases from '@/components/Cases'
import Testimonials from '@/components/Testimonials'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

const BASE_CASES = [
  { title: 'Redesign E-commerce',       link: '#portfolio', thumbnail: 'https://image.thum.io/get/width/1200/crop/800/https://linear.app' },
  { title: 'Tráfego Pago EUA',          link: '#portfolio', thumbnail: 'https://image.thum.io/get/width/1200/crop/800/https://stripe.com' },
  { title: 'Branding Startup',          link: '#portfolio', thumbnail: 'https://image.thum.io/get/width/1200/crop/800/https://vercel.com' },
  { title: 'Gestão Redes Moda',         link: '#portfolio', thumbnail: 'https://image.thum.io/get/width/1200/crop/800/https://framer.com' },
  { title: 'Landing Page Lançamento',   link: '#portfolio', thumbnail: 'https://image.thum.io/get/width/1200/crop/800/https://figma.com' },
  { title: 'Estratégia 360 Franquias',  link: '#portfolio', thumbnail: 'https://image.thum.io/get/width/1200/crop/800/https://apple.com' },
  { title: 'SEO Orgânico B2B',          link: '#portfolio', thumbnail: 'https://image.thum.io/get/width/1200/crop/800/https://notion.so' },
  { title: 'Identidade Visual Tech',    link: '#portfolio', thumbnail: 'https://image.thum.io/get/width/1200/crop/800/https://github.com' },
  { title: 'Campanha de Produto',       link: '#portfolio', thumbnail: 'https://image.thum.io/get/width/1200/crop/800/https://awwwards.com' },
  { title: 'Social Media Premium',      link: '#portfolio', thumbnail: 'https://image.thum.io/get/width/1200/crop/800/https://dribbble.com' },
]
// HeroParallax needs 15 products (3 rows × 5) — cycle the 10 cases
const HERO_PRODUCTS = Array.from({ length: 15 }, (_, i) => BASE_CASES[i % BASE_CASES.length])

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {loaded && (
        <>
          <Navbar />
          <main>
            <HeroParallax products={HERO_PRODUCTS} />
            <SectionDivider />
            <Services />
            <SectionDivider />
            <About />
            <SectionDivider />
            <Cases />
            <SectionDivider />
            <Testimonials />
            <SectionDivider />
            <CTASection />
          </main>
          <Footer />
        </>
      )}
    </>
  )
}
