'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Magnetic from '@/components/Magnetic'

const NAV_LINKS = [
  { label: 'Serviços',    href: '#servicos'    },
  { label: 'Sobre',       href: '#sobre'        },
  { label: 'Cases',       href: '#cases'        },
  { label: 'Depoimentos', href: '#depoimentos'  },
  { label: 'Contato',     href: '#contato'      },
]

const WA_URL = 'https://api.whatsapp.com/send/?phone=5562981147673&text=Ol%C3%A1%2C+gostaria+de+fazer+um+or%C3%A7amento!'
const IG_URL = 'https://instagram.com/gamstudio.br'

export default function Footer() {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const fadeUp = (delay = 0) => ({
    initial:    { opacity: 0, y: 16 },
    animate:    inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.45, ease: 'easeOut' as const, delay },
  })

  return (
    <footer ref={ref} className="border-t border-[#161616] bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ── Top row ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Logo */}
          <motion.a href="#" className="flex items-baseline select-none shrink-0 opacity-100 hover:opacity-70 transition-opacity duration-200" {...fadeUp(0)}>
            <span className="text-lg font-black text-white tracking-tight">GAM</span>
            <span className="text-lg font-black text-[#E02020] tracking-tight ml-0.5">STUDIO</span>
          </motion.a>

          {/* Nav */}
          <motion.nav className="flex flex-wrap gap-x-7 gap-y-2" {...fadeUp(0.08)}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#555555] hover:text-[#E02020] transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </motion.nav>

          {/* Social buttons */}
          <motion.div className="flex items-center gap-3 shrink-0" {...fadeUp(0.16)}>
            <Magnetic strength={0.25}>
              <a
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#222222] text-[#A0A0A0] hover:border-[#E02020] hover:text-white text-xs font-semibold transition-all duration-200"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
                Instagram
              </a>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E02020] text-white text-xs font-semibold hover:bg-[#C01010] transition-colors"
                style={{ boxShadow: '0 0 16px rgba(224,32,32,0.25)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882a.5.5 0 0 0 .612.612l6.035-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.003-1.369l-.359-.214-3.72.903.919-3.638-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                Orçamento
              </a>
            </Magnetic>
          </motion.div>
        </div>

        {/* ── Bottom row ── */}
        <motion.div
          className="mt-8 pt-6 border-t border-[#121212] flex flex-col sm:flex-row items-center justify-between gap-3"
          {...fadeUp(0.24)}
        >
          <p className="text-xs text-[#333333]">
            © {new Date().getFullYear()} GAM Studio. Todos os direitos reservados.
          </p>

          <p className="text-xs text-[#333333] flex items-center gap-1.5">
            feito por{' '}
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E02020] hover:text-white transition-colors font-semibold"
            >
              GAMStudioBR
            </a>
            {' '}com{' '}
            <span className="text-[#E02020]">♥</span>
          </p>

          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E02020]" />
            <span className="text-xs text-[#333333]">Goiânia · BR · USA · EUR</span>
          </div>
        </motion.div>

      </div>
    </footer>
  )
}
