'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { getLenis } from '@/lib/lenis-ref'

const NAV_LINKS = [
  { label: 'Início',    href: '/',          anchor: '#home'     },
  { label: 'Serviços',  href: '/servicos',  anchor: '#servicos' },
  { label: 'Portfólio', href: '/portfolio', anchor: '#cases'    },
  { label: 'Sobre',     href: '/sobre',     anchor: '#sobre'    },
  { label: 'Contato',   href: '/contato',   anchor: '#contato'  },
]

const WA_LINK =
  'https://api.whatsapp.com/send/?phone=5562981147673&text=Ol%C3%A1%21+Vim+pelo+site+e+gostaria+de+fazer+um+or%C3%A7amento.'

// ─── Magnetic CTA button ────────────────────────────────────────────────────
function MagneticCTA({ className, mobile = false }: { className?: string; mobile?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const mx  = useMotionValue(0)
  const my  = useMotionValue(0)
  const sx  = useSpring(mx, { stiffness: 280, damping: 18 })
  const sy  = useSpring(my, { stiffness: 280, damping: 18 })

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - (r.left + r.width  / 2)) * 0.28)
    my.set((e.clientY - (r.top  + r.height / 2)) * 0.28)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <motion.a
      ref={ref}
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={
        mobile
          ? 'mt-4 flex items-center justify-center bg-[#E02020] text-white text-sm font-semibold px-6 py-3.5 rounded-lg hover:bg-[#C01010] transition-colors'
          : `hidden md:inline-flex items-center gap-2 bg-[#E02020] text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-[#C01010] transition-colors tracking-wide ${className ?? ''}`
      }
    >
      Faça seu orçamento
    </motion.a>
  )
}

// ─── Main Navbar ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const isHome   = pathname === '/'

  const [scrolled,      setScrolled]      = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [activeSection, setActiveSection] = useState('#home')

  // ── Scroll detection (home-only: active section tracking) ────────────────
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
      if (!isHome) return
      const threshold = window.innerHeight * 0.4
      let active = '#home'
      for (const { anchor } of NAV_LINKS) {
        const el = document.querySelector(anchor)
        if (!el) continue
        if (el.getBoundingClientRect().top <= threshold) active = anchor
      }
      setActiveSection(active)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // ── Navigation handler ────────────────────────────────────────────────────
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, link: typeof NAV_LINKS[0]) => {
      e.preventDefault()
      setMenuOpen(false)

      if (isHome) {
        const lenis = getLenis()
        if (!lenis) return
        if (link.anchor === '#home') {
          lenis.scrollTo(0, { duration: 1.2 })
        } else {
          const el = document.querySelector(link.anchor)
          if (el) lenis.scrollTo(el as HTMLElement, { offset: -64, duration: 1.2 })
        }
      } else {
        router.push(link.href)
      }
    },
    [isHome, router],
  )

  // ── Active link check ─────────────────────────────────────────────────────
  const isActive = (link: typeof NAV_LINKS[0]) => {
    if (isHome) return activeSection === link.anchor
    if (link.href === '/') return false
    return pathname === link.href || pathname.startsWith(link.href + '/')
  }

  const linkClass = (link: typeof NAV_LINKS[0]) =>
    `text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
      isActive(link) ? 'text-[#E02020]' : 'text-[#A0A0A0] hover:text-white'
    }`

  // ── Resolve href for <a> tag ──────────────────────────────────────────────
  const resolveHref = (link: typeof NAV_LINKS[0]) =>
    isHome ? link.anchor : link.href

  return (
    <>
      {/* ── Desktop / scroll navbar ── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(10,10,10,0.88)' : 'transparent',
          backdropFilter:  scrolled ? 'blur(16px)' : 'none',
          borderBottom:    scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.15 }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <a
            href={isHome ? '#home' : '/'}
            onClick={(e) => handleNavClick(e, NAV_LINKS[0])}
            className="flex items-baseline select-none gap-1 opacity-100 hover:opacity-80 transition-opacity duration-200"
          >
            <span className="text-xl font-black text-white  tracking-tight">GAM</span>
            <span className="text-xl font-black text-[#E02020] tracking-tight">STUDIO</span>
          </a>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={resolveHref(link)}
                onClick={(e) => handleNavClick(e, link)}
                className={linkClass(link)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <MagneticCTA />

          {/* Hamburger */}
          <button
            className="md:hidden relative z-[102] flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <span
              className="block w-6 h-0.5 bg-white transition-all duration-300 origin-center"
              style={{ transform: menuOpen ? 'rotate(45deg) translateY(8px)' : 'none' }}
            />
            <span
              className="block w-6 h-0.5 bg-white transition-all duration-300"
              style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)' }}
            />
            <span
              className="block w-6 h-0.5 bg-white transition-all duration-300 origin-center"
              style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none' }}
            />
          </button>
        </div>
      </motion.header>

      {/* ── Mobile full-screen menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-[101] flex flex-col bg-[#0A0A0A]/97 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 40px) 32px)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at calc(100% - 40px) 32px)' }}
            exit={{   opacity: 0, clipPath: 'circle(0% at calc(100% - 40px) 32px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Red accent line */}
            <div className="h-[2px] bg-[#E02020] w-full" />

            <nav className="flex flex-col items-center justify-center flex-1 gap-2 px-8">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={resolveHref(link)}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`text-3xl font-black tracking-tight py-3 w-full text-center transition-colors duration-200 ${
                    isActive(link) ? 'text-[#E02020]' : 'text-white hover:text-[#E02020]'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.div
                className="mt-6 w-full"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46, duration: 0.35 }}
              >
                <MagneticCTA mobile />
              </motion.div>
            </nav>

            {/* Footer hint */}
            <motion.p
              className="text-center text-[#333333] text-xs pb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              GAM Studio · Goiânia · BR
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
