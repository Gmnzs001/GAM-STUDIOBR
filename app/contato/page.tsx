import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import { CinematicFooter } from '@/components/CinematicFooter'
import ContactContent from './ContactContent'

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
        {/* ── Hero ── */}
        <section className="relative min-h-[62vh] flex flex-col justify-end pb-16 pt-24 lg:pt-32 px-6 lg:px-12 overflow-hidden bg-[#0A0A0A]">
          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          {/* Glow */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[60%] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 80% at 30% 120%, rgba(224,32,32,0.08) 0%, transparent 70%)',
            }}
          />

          {/* Big background letter */}
          <div
            className="absolute top-0 right-0 pointer-events-none select-none overflow-hidden"
            aria-hidden
          >
            <span
              className="block font-black text-white"
              style={{
                fontSize: 'clamp(12rem, 30vw, 38rem)',
                opacity: 0.03,
                letterSpacing: '-0.06em',
                lineHeight: 0.85,
                transform: 'translateX(8%) translateY(-8%)',
              }}
            >
              ?
            </span>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl w-full mx-auto">
            <p className="text-[#E02020] text-xs font-bold uppercase tracking-[0.45em] mb-6">
              Entre em contato
            </p>
            <h1 className="text-[clamp(3rem,8vw,8rem)] font-black text-white leading-none tracking-tight mb-5">
              Vamos
              <br />
              <span className="text-[#E02020]">conversar.</span>
            </h1>
            <p className="text-[#888892] text-lg lg:text-xl max-w-xl leading-relaxed">
              Sua próxima grande ideia começa aqui. Preencha o formulário ou chame direto no WhatsApp — respondemos rápido.
            </p>
          </div>
        </section>

        {/* ── Form + Info ── */}
        <ContactContent />
      </main>
      <CinematicFooter />
    </>
  )
}
