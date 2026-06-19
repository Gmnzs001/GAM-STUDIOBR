import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import { CinematicFooter } from '@/components/CinematicFooter'
import AboutContent from './AboutContent'

export const metadata: Metadata = {
  title: 'Sobre | GAM Studio',
  description:
    'Conheça a GAM Studio — agência de marketing, mídia e desenvolvimento digital nascida em Goiânia em 2020. Atendemos clientes no Brasil, EUA e Europa unindo design, estratégia e inteligência artificial.',
}

export default function SobrePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-[75vh] flex flex-col justify-end pb-20 pt-24 lg:pt-32 px-6 lg:px-12 overflow-hidden bg-[#0A0A0A]">
          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          {/* Big background text */}
          <div
            className="absolute inset-0 flex items-center justify-end pr-6 lg:pr-20 pointer-events-none select-none overflow-hidden"
            aria-hidden
          >
            <span
              className="font-black text-white"
              style={{
                fontSize: 'clamp(8rem, 22vw, 28rem)',
                opacity: 0.04,
                letterSpacing: '-0.05em',
                lineHeight: 0.85,
              }}
            >
              GAM
            </span>
          </div>

          {/* Red gradient bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[50%] pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(224,32,32,0.06) 0%, transparent 100%)',
            }}
          />

          {/* Content — bottom-left anchored */}
          <div className="relative max-w-7xl w-full mx-auto">
            <p className="text-[#E02020] text-xs font-bold uppercase tracking-[0.45em] mb-6">
              Quem somos
            </p>
            <h1 className="text-[clamp(3.5rem,9vw,9rem)] font-black text-white leading-none tracking-tight">
              Sobre
              <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: '2px #E02020' }}
              >
                a GAM.
              </span>
            </h1>

            {/* Pill tags */}
            <div className="flex flex-wrap gap-3 mt-8">
              {['Desde 2020', 'Goiânia · BR', 'USA · EUR', 'Marketing & Tech'].map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-[#555555] border border-[#1E1E1E] px-4 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Main content ── */}
        <AboutContent />
      </main>
      <CinematicFooter />
    </>
  )
}
