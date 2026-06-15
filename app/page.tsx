'use client'

import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import SectionDivider from '@/components/SectionDivider'
import Services from '@/components/Services'
import About from '@/components/About'
import Cases from '@/components/Cases'
import Testimonials from '@/components/Testimonials'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {loaded && (
        <>
          <Navbar />
          <main>
            <Hero />
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
