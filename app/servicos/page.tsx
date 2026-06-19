import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import { CinematicFooter } from '@/components/CinematicFooter'
import HorizontalScroll from './HorizontalScroll'

export const metadata: Metadata = {
  title: 'Serviços',
  description:
    'Criação de Sites, SEO, Agentes IA, Google ADS, Redes Sociais, Branding e muito mais. ' +
    '12 soluções integradas de marketing e tecnologia para transformar sua presença digital.',
}

export default function ServicosPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ── Page hero ──────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 lg:pt-32 overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #0E0E10 100%)' }}
        >
          {/* Subtle grid */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundSize: '60px 60px',
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),' +
                'linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            }}
          />

          {/* Red radial glow */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(224,32,32,0.06) 0%, transparent 70%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <p className="text-[#E02020] text-xs font-bold uppercase tracking-[0.4em] mb-6">
              O que fazemos
            </p>

            <h1
              className="font-black tracking-tighter leading-[0.88] text-white"
              style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}
            >
              Nossa
              <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.15)' }}
              >
                Expertise
              </span>
            </h1>

            <p className="mt-8 text-[#666666] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              12 serviços integrados — da estratégia à execução — para construir, escalar e
              consolidar sua presença digital em qualquer mercado.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-[#444444] font-mono uppercase tracking-widest">
              <span>12 serviços</span>
              <span className="text-[#E02020]">✦</span>
              <span>BR · USA · EUR</span>
              <span className="text-[#E02020]">✦</span>
              <span>Desde 2020</span>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[#333333]">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em]">scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-[#333333] to-transparent" />
          </div>
        </section>

        {/* ── Services: desktop = horizontal, mobile = stacked ──────────────── */}
        <HorizontalScroll />
      </main>

      <CinematicFooter />
    </>
  )
}
