import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import { CinematicFooter } from '@/components/CinematicFooter'
import PortfolioGallery from './PortfolioGallery'

export const metadata: Metadata = {
  title: 'Portfólio | GAM Studio',
  description:
    'Cases reais de clientes com resultados mensuráveis. Redesign e SEO, tráfego pago, branding, social media e estratégia 360°. Veja como transformamos presença digital em crescimento.',
}

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-[72vh] flex flex-col items-center justify-center px-6 pt-24 lg:pt-32 overflow-hidden bg-[#0A0A0A]">
          {/* Grid decoration */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          {/* Red glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(224,32,32,0.10) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <span className="inline-block text-[#E02020] text-xs font-bold uppercase tracking-[0.45em] mb-6">
              Resultados Reais
            </span>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight mb-6">
              Nosso
              <br />
              <span className="text-[#E02020]">Portfólio</span>
            </h1>

            <p className="text-[#A0A0A0] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
              Cada projeto é uma história de crescimento. Explore os resultados que entregamos para
              marcas em 3 países.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mt-4">
              {[
                { value: '120+', label: 'projetos entregues' },
                { value: '98%', label: 'clientes satisfeitos' },
                { value: '3', label: 'países atendidos' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-[#444444] text-xs mt-0.5 uppercase tracking-widest">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
            <span className="text-[#555555] text-[10px] uppercase tracking-widest">
              Explorar cases
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-[#555555] to-transparent animate-pulse" />
          </div>
        </section>

        {/* ── Gallery ── */}
        <PortfolioGallery />
      </main>
      <CinematicFooter />
    </>
  )
}
