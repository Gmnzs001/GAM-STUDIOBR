'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { getLenis, onScrollY } from '@/lib/lenis-ref'
import { useRevealed } from '@/lib/intro'
import { NAV_LINKS, WA_URL, WHATSAPP_DISPLAY, INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/lib/site'
import { Wordmark } from '@/components/system/Logo'
import Button from '@/components/system/Button'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

export default function Navbar() {
  const pathname = usePathname()
  const revealed = useRevealed()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  // Vidro ao rolar + esconde ao descer / mostra ao subir.
  // Só toca no estado do React quando o valor muda (evita re-render a cada frame de scroll).
  // A posição vem do Lenis (onScrollY) — ler window.scrollY aqui forçaria layout.
  useEffect(() => {
    let last = window.scrollY
    let isScrolled: boolean | null = null
    let isHidden = false
    const onScroll = (y: number) => {
      const s = y > 24
      if (s !== isScrolled) { isScrolled = s; setScrolled(s) }
      if (Math.abs(y - last) > 6) {
        const h = y > last && y > 480
        if (h !== isHidden) { isHidden = h; setHidden(h) }
        last = y
      }
    }
    onScroll(last)
    return onScrollY(onScroll)
  }, [])

  // Trava o scroll com o menu mobile aberto
  useEffect(() => {
    const lenis = getLenis()
    if (open) {
      lenis?.stop()
      document.documentElement.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.documentElement.style.overflow = ''
    }
    return () => { document.documentElement.style.overflow = '' }
  }, [open])

  // Fecha o menu ao trocar de página (ajuste de estado durante o render) / com Esc
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'))

  const onHome = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      setOpen(false)
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(0, { duration: 1.4 })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[100] px-3 pt-3 md:px-5 md:pt-4 [view-transition-name:site-header]"
        initial={{ y: -110, opacity: 0 }}
        animate={revealed ? { y: hidden && !open ? -110 : 0, opacity: 1 } : { y: -110, opacity: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: revealed && !scrolled ? 0.5 : 0 }}
      >
        <div
          className={cn(
            'mx-auto flex h-16 max-w-[calc(var(--container)+40px)] items-center justify-between rounded-full pl-5 pr-2 transition-[background-color,box-shadow,backdrop-filter] duration-500 md:pl-7',
            scrolled || open
              ? 'bg-white/85 shadow-[var(--shadow-soft)] ring-1 ring-line/80 backdrop-blur-md'
              : 'bg-transparent ring-1 ring-transparent',
          )}
        >
          <Link href="/" onClick={onHome} aria-label="GAM Studio — início" className="relative z-[2] text-[1.35rem]">
            <Wordmark />
          </Link>

          {/* Links desktop com "pílula" que segue o hover */}
          <nav aria-label="Principal" className="hidden lg:block" onMouseLeave={() => setHovered(null)}>
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((l) => {
                const active = isActive(l.href)
                return (
                  <li key={l.href} className="relative">
                    <Link
                      href={l.href}
                      onClick={l.href === '/' ? onHome : undefined}
                      onMouseEnter={() => setHovered(l.href)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative z-[1] flex items-center gap-2 rounded-full px-4 py-2 text-[0.94rem] font-medium transition-colors duration-200',
                        active ? 'text-ink' : 'text-ink-2 hover:text-ink',
                      )}
                    >
                      {active && <span className="size-1.5 rounded-full bg-red" aria-hidden="true" />}
                      {l.label}
                    </Link>
                    {hovered === l.href && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-ink/[0.06]"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <Button href={WA_URL} size="sm" icon="whatsapp">Faça seu orçamento</Button>
            </div>

            {/* Hambúrguer */}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              className="relative z-[2] grid size-12 place-items-center rounded-full bg-ink text-white lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <span className={cn('absolute left-0 top-0 h-[2px] w-5 rounded bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]', open && 'translate-y-[5px] rotate-45')} />
                <span className={cn('absolute bottom-0 left-0 h-[2px] w-5 rounded bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]', open && '-translate-y-[5px] -rotate-45')} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Menu mobile em tela cheia */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            className="fixed inset-0 z-[99] flex flex-col bg-paper px-6 pb-8 pt-28 lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 44px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
            <nav aria-label="Menu" className="relative flex-1">
              <ul className="flex flex-col">
                {NAV_LINKS.map((l, i) => {
                  const active = isActive(l.href)
                  return (
                    <li key={l.href} className="overflow-hidden border-b border-line">
                      <motion.div
                        initial={{ y: '110%' }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.18 + i * 0.06 }}
                      >
                        <Link
                          href={l.href}
                          onClick={(e) => { if (l.href === '/') onHome(e); setOpen(false) }}
                          aria-current={active ? 'page' : undefined}
                          className="flex items-center justify-between py-4 font-display text-[2.6rem] font-bold leading-none tracking-[-0.04em] text-ink"
                        >
                          <span>
                            {l.label}
                            {active && <span className="text-red">.</span>}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <motion.div
              className="relative space-y-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
            >
              <Button href={WA_URL} size="lg" icon="whatsapp" className="w-full">Faça seu orçamento</Button>
              <div className="flex items-center justify-between text-sm text-ink-2">
                <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="hover:text-ink">WhatsApp {WHATSAPP_DISPLAY}</a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-ink">{INSTAGRAM_HANDLE}</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
