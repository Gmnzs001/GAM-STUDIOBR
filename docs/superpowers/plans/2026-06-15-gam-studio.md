# GAM Studio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete GAM Studio website with cinematographic animations in Next.js 16.

**Architecture:** Single Page Application — all sections on one route, client components throughout. Layout wraps everything in Lenis + CustomCursor providers. `page.tsx` gates all content behind a `loaded` state that flips after the loading screen completes. All animation delays are relative to component mount time (not page load), since sections only render after loading.

**Tech Stack:** Next.js 16.2.9 (Turbopack), Tailwind v4, Three.js, GSAP 3.15, Framer Motion 12, Lenis 1.3, shadcn/ui, Inter (Google Font)

---

## File Map

| File | Responsibility |
|---|---|
| `app/globals.css` | GAM color vars, Inter font var, base reset, custom selection |
| `app/layout.tsx` | Inter load, metadata, Lenis + Cursor providers |
| `app/page.tsx` | `loaded` state gate + all section composition |
| `components/providers/LenisProvider.tsx` | Smooth scroll init, RAF loop, cleanup |
| `components/CustomCursor.tsx` | Red circle cursor with lerp lag |
| `components/LoadingScreen.tsx` | GSAP "GAM." pulse → fade-out → `onComplete` |
| `components/SectionDivider.tsx` | Animated red line via Framer Motion `useInView` |
| `components/Navbar.tsx` | Logo + links + glassmorphism on scroll, mobile menu |
| `components/Hero.tsx` | Three.js particles + scramble text hook + CTAs |
| `components/Services.tsx` | 6 service cards with hover animations |
| `components/About.tsx` | Parallax panel + animated counter hook |
| `components/Cases.tsx` | Filterable grid + AnimatePresence transitions |
| `components/Testimonials.tsx` | Auto-advance carousel + dot nav |
| `components/CTASection.tsx` | Animated gradient bg + WhatsApp form |
| `components/Footer.tsx` | Minimal footer |

---

### Task 1: globals.css — GAM theme

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Initialize git**

```bash
git init
git add .
git commit -m "chore: initial Next.js 16 project"
```

- [ ] **Step 2: Replace globals.css**

Full replacement of `app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-inter);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}

:root {
  --background: #0A0A0A;
  --foreground: #FFFFFF;
  --card: #111111;
  --card-foreground: #FFFFFF;
  --popover: #111111;
  --popover-foreground: #FFFFFF;
  --primary: #E02020;
  --primary-foreground: #FFFFFF;
  --secondary: #1A1A1A;
  --secondary-foreground: #FFFFFF;
  --muted: #1A1A1A;
  --muted-foreground: #A0A0A0;
  --accent: #E02020;
  --accent-foreground: #FFFFFF;
  --destructive: oklch(0.577 0.245 27.325);
  --border: #222222;
  --input: #222222;
  --ring: #E02020;
  --radius: 0.625rem;
  --sidebar: #111111;
  --sidebar-foreground: #FFFFFF;
  --sidebar-primary: #E02020;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #1A1A1A;
  --sidebar-accent-foreground: #FFFFFF;
  --sidebar-border: #222222;
  --sidebar-ring: #E02020;
}

@layer base {
  * {
    @apply border-border;
    box-sizing: border-box;
  }
  body {
    @apply bg-background text-foreground;
    overflow-x: hidden;
  }
  html {
    @apply font-sans;
  }
  ::selection {
    background-color: #E02020;
    color: #FFFFFF;
  }
}

/* Hide default cursor on pointer devices only */
@media (pointer: fine) {
  * {
    cursor: none !important;
  }
}
```

- [ ] **Step 3: Verify**

Run `npm run dev`, open http://localhost:3000. Background must be `#0A0A0A` (not white).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: GAM Studio dark theme in globals.css"
```

---

### Task 2: layout.tsx, LenisProvider, CustomCursor

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/providers/LenisProvider.tsx`
- Create: `components/CustomCursor.tsx`

- [ ] **Step 1: Create `components/providers/LenisProvider.tsx`**

```tsx
'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
```

- [ ] **Step 2: Create `components/CustomCursor.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -100, y: -100 })
  const current = useRef({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show on pointer:fine devices (not touch)
    if (!window.matchMedia('(pointer: fine)').matches) return

    setVisible(true)

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const onEnter = () => setIsHovering(true)
    const onLeave = () => setIsHovering(false)

    window.addEventListener('mousemove', onMove)

    // Observe DOM changes so newly mounted links get listeners
    const attachListeners = () => {
      document.querySelectorAll('a, button').forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    attachListeners()
    const observer = new MutationObserver(attachListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    let rafId: number
    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.12
      current.current.y += (pos.current.y - current.current.y) * 0.12
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px)`
      }
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  if (!visible) return null

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{ willChange: 'transform' }}
    >
      <div
        className="rounded-full border-2 border-[#E02020] transition-all duration-200 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: isHovering ? '44px' : '22px',
          height: isHovering ? '44px' : '22px',
          backgroundColor: isHovering ? 'rgba(224,32,32,0.12)' : 'transparent',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LenisProvider from '@/components/providers/LenisProvider'
import CustomCursor from '@/components/CustomCursor'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'GAM Studio — Sua marca no próximo nível',
  description:
    'Agência de marketing digital em Goiânia. Website, Google ADS, Meta ADS, Branding, SEO, Social Media e Agentes de IA. Atendemos BR, USA e EUR.',
  keywords: ['agência marketing digital', 'Goiânia', 'website', 'branding', 'Google ADS'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="bg-[#0A0A0A] text-white antialiased overflow-x-hidden">
        <LenisProvider>
          <CustomCursor />
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify**

Open http://localhost:3000. Checklist:
- Background `#0A0A0A`
- Font is Inter (sans-serif, clean — not Geist)
- Moving mouse shows red circle that follows with a slight lag
- Circle expands when hovering the placeholder heading link
- Default cursor is hidden on desktop (cursor: none)
- No console errors

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/providers/LenisProvider.tsx components/CustomCursor.tsx
git commit -m "feat: Inter font, Lenis smooth scroll, custom red cursor"
```

---

### Task 3: LoadingScreen

**Files:**
- Create: `components/LoadingScreen.tsx`
- Modify: `app/page.tsx` (temporary wiring)

- [ ] **Step 1: Create `components/LoadingScreen.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    gsap.set(textRef.current, { opacity: 0, y: 24 })

    tl
      .to(textRef.current, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' })
      .to(dotRef.current, {
        opacity: 0.15,
        duration: 0.22,
        repeat: 5,
        yoyo: true,
        ease: 'power2.inOut',
      })
      .to({}, { duration: 0.15 })
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.55,
        ease: 'power2.inOut',
        onComplete,
      })

    return () => { tl.kill() }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#0A0A0A]"
    >
      <div ref={textRef} className="select-none flex items-baseline">
        <span
          className="font-black text-white leading-none tracking-tight"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)' }}
        >
          GAM
        </span>
        <span
          ref={dotRef}
          className="font-black text-[#E02020] leading-none"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)' }}
        >
          .
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire into `app/page.tsx` for testing**

```tsx
'use client'

import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {loaded && (
        <main className="flex min-h-screen items-center justify-center">
          <h1 className="text-4xl font-black text-white">Site carregado</h1>
        </main>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify**

- "GAM." fades up from below on load
- Red dot pulses ~3 times
- Entire screen fades out (~2s total)
- "Site carregado" appears

- [ ] **Step 4: Commit**

```bash
git add components/LoadingScreen.tsx app/page.tsx
git commit -m "feat: loading screen — GSAP GAM. pulse animation"
```

---

### Task 4: SectionDivider

**Files:**
- Create: `components/SectionDivider.tsx`

- [ ] **Step 1: Create `components/SectionDivider.tsx`**

```tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function SectionDivider() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} className="flex justify-center py-1 px-8">
      <motion.div
        className="h-px bg-[#E02020]"
        initial={{ width: 0, opacity: 0 }}
        animate={inView ? { width: 100, opacity: 1 } : {}}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SectionDivider.tsx
git commit -m "feat: animated red section divider"
```

---

### Task 5: Navbar

**Files:**
- Create: `components/Navbar.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/Navbar.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Cases', href: '#cases' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: 0.15 }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-baseline select-none">
          <span className="text-xl font-black text-white tracking-tight">GAM</span>
          <span className="text-xl font-black text-[#E02020] tracking-tight ml-1">STUDIO</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#A0A0A0] hover:text-white transition-colors duration-200 font-medium tracking-wide uppercase"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a
          href="https://wa.me/5562981147673"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 bg-[#E02020] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#C01010] transition-colors"
        >
          WhatsApp
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          <span
            className="block w-6 h-0.5 bg-white transition-all duration-300 origin-center"
            style={{ transform: menuOpen ? 'rotate(45deg) translateY(8px)' : 'none' }}
          />
          <span
            className="block w-6 h-0.5 bg-white transition-all duration-300"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-6 h-0.5 bg-white transition-all duration-300 origin-center"
            style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none' }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#222222] px-6 py-5 flex flex-col gap-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-[#A0A0A0] hover:text-white transition-colors text-sm uppercase tracking-wide font-medium py-1"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://wa.me/5562981147673"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center bg-[#E02020] text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-[#C01010] transition-colors"
          >
            WhatsApp
          </a>
        </motion.div>
      )}
    </motion.header>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {loaded && (
        <>
          <Navbar />
          <main>
            <div id="home" className="h-screen flex items-center justify-center">
              <h1 className="text-4xl font-black text-white">Hero placeholder</h1>
            </div>
          </main>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify**

- After loading screen clears, navbar slides down from top
- Scroll 10px: background turns dark glass + blur
- "GAM" white, "STUDIO" red
- Mobile: hamburger opens/closes correctly
- WhatsApp link → `https://wa.me/5562981147673`

- [ ] **Step 4: Commit**

```bash
git add components/Navbar.tsx app/page.tsx
git commit -m "feat: navbar with glassmorphism on scroll and mobile menu"
```

---

### Task 6: Hero — Three.js particles + scramble text

**Files:**
- Create: `components/Hero.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/Hero.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'

const TARGET = 'SUA MARCA NO PRÓXIMO NÍVEL'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%ÇÃÕ!?'

function useScramble(target: string, delay = 350) {
  const [text, setText] = useState(() => target.replace(/[^ ]/g, CHARS[0]))

  useEffect(() => {
    let frame = 0
    const total = 38
    let interval: ReturnType<typeof setInterval>

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        const progress = frame / total
        const revealed = Math.floor(progress * target.length)
        setText(
          target
            .split('')
            .map((ch, i) => {
              if (ch === ' ') return ' '
              if (i < revealed) return ch
              return CHARS[Math.floor(Math.random() * CHARS.length)]
            })
            .join('')
        )
        frame++
        if (frame > total) {
          clearInterval(interval)
          setText(target)
        }
      }, 42)
    }, delay)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [target, delay])

  return text
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrambled = useScramble(TARGET, 350)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.z = 6

    const COUNT = 2000
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14

      if (Math.random() < 0.12) {
        colors[i * 3] = 0.88; colors[i * 3 + 1] = 0.13; colors[i * 3 + 2] = 0.13
      } else {
        const b = 0.55 + Math.random() * 0.45
        colors[i * 3] = b; colors[i * 3 + 1] = b; colors[i * 3 + 2] = b
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({ size: 0.034, vertexColors: true, transparent: true, opacity: 0.72, sizeAttenuation: true })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)

    const mouse = { x: 0, y: 0 }
    const smooth = { x: 0, y: 0 }

    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onResize = () => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', onResize)

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      smooth.x += (mouse.x - smooth.x) * 0.03
      smooth.y += (mouse.y - smooth.y) * 0.03
      pts.rotation.y += 0.00028 + smooth.x * 0.0007
      pts.rotation.x += smooth.y * 0.0004
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Bottom gradient fade to next section */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/10 via-transparent to-[#0A0A0A] pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.p
          className="text-[#A0A0A0] text-xs tracking-[0.35em] uppercase mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          Goiânia · Brasil · BR · USA · EUR
        </motion.p>

        <motion.h1
          className="font-black leading-[1.04] text-white mb-6 tracking-tight"
          style={{ fontSize: 'clamp(2rem, 5.5vw, 5.2rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          {scrambled.split(' ').map((word, i) => (
            <span key={i} className="inline-block mr-[0.22em]">
              {word === 'PRÓXIMO' || word === 'NÍVEL' ? (
                <span className="text-[#E02020]">{word}</span>
              ) : word}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="text-[#A0A0A0] text-sm md:text-base tracking-[0.28em] uppercase mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.5 }}
        >
          presença · estrutura · previsibilidade
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.65 }}
        >
          <a
            href="https://wa.me/5562981147673"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-[#E02020] text-white font-bold px-8 py-4 rounded-lg text-base hover:bg-[#C01010] transition-colors"
            style={{ boxShadow: '0 0 32px rgba(224,32,32,0.35)', animation: 'pulse 2s infinite' }}
          >
            Falar com a GAM Studio
          </a>
          <a
            href="#servicos"
            className="inline-flex items-center justify-center border border-[#333333] text-white font-semibold px-8 py-4 rounded-lg text-base hover:border-[#E02020] hover:text-[#E02020] transition-all duration-300"
          >
            Ver serviços
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 1 }}
      >
        <span className="text-[#A0A0A0] text-[10px] tracking-widest uppercase">scroll</span>
        <motion.div
          className="w-px h-7 bg-gradient-to-b from-[#E02020] to-transparent"
          animate={{ scaleY: [1, 0.25, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'

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
          </main>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify**

- Canvas fills screen with floating white + red particles
- Particles rotate slowly, respond to mouse with smooth lag
- Text scrambles character-by-character then settles on "SUA MARCA NO PRÓXIMO NÍVEL" (PRÓXIMO + NÍVEL in red)
- Location badge, subline, two CTAs animate in sequence
- Pulsing CTA has red glow
- Scroll indicator at bottom pulsates

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx app/page.tsx
git commit -m "feat: hero with Three.js particles and scramble text"
```

---

### Task 7: Services

**Files:**
- Create: `components/Services.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/Services.tsx`**

```tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const SERVICES = [
  {
    icon: '⬡',
    title: 'Website & Landing Page',
    description: 'Sites e páginas de alta conversão com design premium e performance otimizada para gerar leads.',
  },
  {
    icon: '◈',
    title: 'Google ADS & Meta ADS',
    description: 'Campanhas pagas que geram leads qualificados e retorno mensurável desde a primeira semana.',
  },
  {
    icon: '◆',
    title: 'Branding & Identidade Visual',
    description: 'Identidade de marca memorável que comunica quem você é antes mesmo de você falar.',
  },
  {
    icon: '◉',
    title: 'SEO & Tráfego Orgânico',
    description: 'Posicionamento orgânico sustentável para atrair clientes enquanto você dorme.',
  },
  {
    icon: '◎',
    title: 'Social Media',
    description: 'Conteúdo estratégico e gestão de redes que constrói audiência e autoridade de marca.',
  },
  {
    icon: '◐',
    title: 'Agentes de IA',
    description: 'Automações inteligentes que atendem, qualificam e vendem por você 24 horas por dia.',
  },
]

function ServiceCard({
  service,
  index,
}: {
  service: (typeof SERVICES)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.48, delay: index * 0.09 }}
      whileHover={{ scale: 1.025, y: -4 }}
      className="group relative bg-[#111111] border border-[#222222] rounded-xl p-6 overflow-hidden hover:border-[#E02020]/40 transition-colors duration-300"
    >
      {/* Inner glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 28px rgba(224,32,32,0.07)' }}
      />

      {/* Icon */}
      <div className="text-[#E02020] text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 select-none">
        {service.icon}
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-base mb-2 group-hover:text-[#E02020] transition-colors duration-300">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-[#A0A0A0] text-sm leading-relaxed">
        {service.description}
      </p>

      {/* Bottom sweep line */}
      <div className="absolute bottom-0 left-0 h-px bg-[#E02020] w-0 group-hover:w-full transition-all duration-500" />
    </motion.div>
  )
}

export default function Services() {
  const headRef = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section id="servicos" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div ref={headRef} className="text-center mb-14">
          <motion.p
            className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            O que fazemos
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-black text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Nossos <span className="text-[#E02020]">Serviços</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import SectionDivider from '@/components/SectionDivider'
import Services from '@/components/Services'

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
          </main>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify**

- Scroll to services: 6 cards animate in from below, staggered
- Hover a card: scales up, title goes red, inner glow appears, bottom red line sweeps right
- 3 columns on desktop, 2 on tablet, 1 on mobile

- [ ] **Step 4: Commit**

```bash
git add components/Services.tsx app/page.tsx
git commit -m "feat: services section with staggered cards and hover animations"
```

---

### Task 8: About — counters + parallax

**Files:**
- Create: `components/About.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/About.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const STATS = [
  { value: 120, suffix: '+', label: 'Projetos entregues' },
  { value: 98,  suffix: '%', label: 'Clientes satisfeitos' },
  { value: 5,   suffix: '+', label: 'Anos de mercado' },
  { value: 3,   suffix: '',  label: 'Países atendidos' },
]

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let n = 0
    const step = Math.max(1, Math.ceil(value / 48))
    const id = setInterval(() => {
      n = Math.min(n + step, value)
      setCount(n)
      if (n >= value) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [inView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-9%', '9%'])

  return (
    <section ref={sectionRef} id="sobre" className="py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div ref={headRef}>
            <motion.p
              className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
            >
              Quem somos
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              Sua marca com{' '}
              <span className="text-[#E02020]">presença</span> e{' '}
              <span className="text-[#E02020]">previsibilidade</span>
            </motion.h2>
            <motion.p
              className="text-[#A0A0A0] text-base leading-relaxed mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              A GAM Studio é uma agência de marketing digital e tecnologia sediada em Goiânia,
              com projetos no Brasil, Estados Unidos e Europa. Unimos design de alto nível,
              estratégia de crescimento e inteligência artificial para entregar resultados reais.
            </motion.p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="bg-[#111111] border border-[#222222] rounded-xl p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={headInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.28 + i * 0.08 }}
                >
                  <div className="text-3xl md:text-4xl font-black text-[#E02020] mb-1">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[#A0A0A0] text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — parallax visual */}
          <motion.div
            className="relative h-[460px] rounded-2xl overflow-hidden border border-[#222222]"
            initial={{ opacity: 0, x: 40 }}
            animate={headInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <motion.div
              className="absolute inset-[-12%]"
              style={{
                y: bgY,
                background: 'linear-gradient(135deg, #1A0000 0%, #111111 40%, #0A0A0A 100%)',
              }}
            />
            {/* Red grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(224,32,32,1) 1px, transparent 1px), linear-gradient(90deg, rgba(224,32,32,1) 1px, transparent 1px)',
                backgroundSize: '38px 38px',
              }}
            />
            {/* Center mark */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="font-black text-white/[0.04] leading-none select-none"
                  style={{ fontSize: 'clamp(5rem, 14vw, 9rem)' }}
                >
                  GAM
                </div>
                <div className="text-[#E02020] text-xs tracking-[0.45em] uppercase font-semibold mt-3">
                  Studio
                </div>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <div className="w-10 h-px bg-[#E02020]/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E02020]" />
                  <div className="w-10 h-px bg-[#E02020]/60" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import SectionDivider from '@/components/SectionDivider'
import Services from '@/components/Services'
import About from '@/components/About'

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
          </main>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify**

- Scroll to About: heading/text appear with fade-in
- Stat cards appear staggered; numbers count up from 0 on enter
- Right panel has subtle parallax (shifts ~9% as you scroll through it)

- [ ] **Step 4: Commit**

```bash
git add components/About.tsx app/page.tsx
git commit -m "feat: about section with animated counters and parallax panel"
```

---

### Task 9: Cases

**Files:**
- Create: `components/Cases.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/Cases.tsx`**

```tsx
'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const CATEGORIES = ['Todos', 'Website', 'Branding', 'ADS', 'Social']

const CASES = [
  { id: 1, title: 'Clínica Estética Premium',       category: 'Website',  description: 'Landing page com 340% de aumento em conversões.', bg: '#160808' },
  { id: 2, title: 'Marca de Moda Sustentável',      category: 'Branding', description: 'Identidade visual completa para marca eco-friendly.', bg: '#080d16' },
  { id: 3, title: 'E-commerce de Suplementos',      category: 'ADS',      description: 'R$120k em faturamento no 1º mês com Google ADS.', bg: '#081608' },
  { id: 4, title: 'Construtora Regional',           category: 'Website',  description: 'Site com geração de leads para 3 empreendimentos.', bg: '#141208' },
  { id: 5, title: 'Restaurante Gourmet',            category: 'Social',   description: '15k seguidores orgânicos em 90 dias.', bg: '#080814' },
  { id: 6, title: 'Startup de Tecnologia',          category: 'Branding', description: 'Branding completo para SaaS B2B + motion design.', bg: '#120812' },
]

export default function Cases() {
  const [active, setActive] = useState('Todos')
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, margin: '-60px' })

  const filtered = active === 'Todos' ? CASES : CASES.filter((c) => c.category === active)

  return (
    <section id="cases" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div ref={headRef} className="text-center mb-12">
          <motion.p
            className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            Portfólio
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-black text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Nossos <span className="text-[#E02020]">Cases</span>
          </motion.h2>

          {/* Filter */}
          <motion.div
            className="flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  active === cat
                    ? 'bg-[#E02020] text-white'
                    : 'bg-[#111111] border border-[#222222] text-[#A0A0A0] hover:border-[#E02020]/40 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.28 }}
                className="group relative rounded-xl overflow-hidden h-52 border border-[#222222] hover:border-[#E02020]/40 transition-colors duration-300"
                style={{ backgroundColor: item.bg }}
              >
                {/* Category badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-xs font-semibold text-[#E02020] bg-[#E02020]/10 px-3 py-1 rounded-full border border-[#E02020]/20">
                    {item.category}
                  </span>
                </div>

                {/* Title always visible */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#E02020] transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p
                    className="text-[#A0A0A0] text-sm transition-all duration-300"
                    style={{
                      opacity: 0,
                      transform: 'translateY(6px)',
                    }}
                    ref={(el) => {
                      if (!el) return
                      const parent = el.closest('.group')
                      if (!parent) return
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Bottom line */}
                <div className="absolute bottom-0 left-0 h-px bg-[#E02020] w-0 group-hover:w-full transition-all duration-500" />

                {/* Hover overlay for description */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-[#E02020] font-bold text-base mb-1">{item.title}</h3>
                  <p className="text-[#A0A0A0] text-sm translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import SectionDivider from '@/components/SectionDivider'
import Services from '@/components/Services'
import About from '@/components/About'
import Cases from '@/components/Cases'

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
          </main>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify**

- 6 case cards visible by default
- Clicking "Website" filters to 2 cards with scale-in animation
- Hover: description fades in over dark background, title turns red, bottom line sweeps

- [ ] **Step 4: Commit**

```bash
git add components/Cases.tsx app/page.tsx
git commit -m "feat: cases section with animated filter and hover reveals"
```

---

### Task 10: Testimonials

**Files:**
- Create: `components/Testimonials.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/Testimonials.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

const TESTIMONIALS = [
  {
    name: 'Carlos Mendonça',
    role: 'CEO — Clínica Estética Renovar',
    initial: 'C',
    text: 'A GAM Studio transformou nossa presença digital. Em 3 meses triplicamos os agendamentos online. Profissionalismo e resultados reais.',
  },
  {
    name: 'Fernanda Oliveira',
    role: 'Fundadora — Marca Eco Verde',
    initial: 'F',
    text: 'Eles entenderam nossa essência antes mesmo de começarmos a falar de design. A identidade visual ficou perfeita e nossa conversão subiu 200%.',
  },
  {
    name: 'Rafael Torres',
    role: 'Diretor Comercial — TechScale BR',
    initial: 'R',
    text: 'Campanha no Google ADS com ROI de 8x no primeiro mês. Equipe extremamente competente e comprometida com resultado.',
  },
  {
    name: 'Juliana Castro',
    role: 'Gerente de Marketing — Grupo Construtora',
    initial: 'J',
    text: 'O site que eles criaram gerou mais leads em 2 semanas do que nosso site anterior em 2 anos. Investimento que se paga sozinho.',
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headRef, { once: true, margin: '-60px' })

  useEffect(() => {
    const id = setInterval(
      () => setCurrent((prev) => (prev + 1) % TESTIMONIALS.length),
      5200
    )
    return () => clearInterval(id)
  }, [])

  return (
    <section id="depoimentos" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div ref={headRef} className="text-center mb-14">
          <motion.p
            className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            Clientes
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-black text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            O que dizem sobre <span className="text-[#E02020]">nós</span>
          </motion.h2>
        </div>

        <div className="relative min-h-[260px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="w-full"
            >
              <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 md:p-10 relative overflow-hidden">
                {/* Decorative quote */}
                <div className="absolute top-4 right-7 text-7xl text-[#E02020]/10 font-black leading-none select-none pointer-events-none">
                  "
                </div>

                <p className="text-white text-lg md:text-xl leading-relaxed mb-8 relative z-10">
                  "{TESTIMONIALS[current].text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#E02020] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {TESTIMONIALS[current].initial}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {TESTIMONIALS[current].name}
                    </div>
                    <div className="text-[#A0A0A0] text-xs mt-0.5">
                      {TESTIMONIALS[current].role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot nav */}
        <div className="flex justify-center gap-2 mt-7">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Depoimento ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                backgroundColor: i === current ? '#E02020' : '#2A2A2A',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
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
          </main>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify**

- Carousel auto-advances every 5.2s with vertical fade transition
- Dots: current is red wide pill, others are small dark circles
- Clicking a dot immediately switches to that testimonial
- Avatar circles have red background with letter initial

- [ ] **Step 4: Commit**

```bash
git add components/Testimonials.tsx app/page.tsx
git commit -m "feat: testimonials carousel with auto-advance and dot nav"
```

---

### Task 11: CTASection

**Files:**
- Create: `components/CTASection.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/CTASection.tsx`**

```tsx
'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export default function CTASection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = encodeURIComponent(
      `Olá, GAM Studio!\n\nMeu nome é ${form.name}.\n\n${form.message}\n\nEmail para retorno: ${form.email}`
    )
    window.open(`https://wa.me/5562981147673?text=${msg}`, '_blank')
    setSent(true)
  }

  return (
    <section ref={ref} id="contato" className="relative py-24 px-6 overflow-hidden">
      {/* Animated gradient bg */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            'radial-gradient(ellipse 80% 60% at 20% 50%, #1A0000 0%, #0A0A0A 65%)',
            'radial-gradient(ellipse 80% 60% at 80% 50%, #1A0000 0%, #0A0A0A 65%)',
            'radial-gradient(ellipse 80% 60% at 50% 15%, #1A0000 0%, #0A0A0A 65%)',
            'radial-gradient(ellipse 80% 60% at 20% 50%, #1A0000 0%, #0A0A0A 65%)',
          ],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
      />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <motion.p
            className="text-[#E02020] text-xs tracking-[0.32em] uppercase font-semibold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            Vamos conversar
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Pronto para o{' '}
            <span className="text-[#E02020]">próximo nível</span>?
          </motion.h2>
          <motion.p
            className="text-[#A0A0A0] text-sm"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            Fale com a gente e descubra como transformar sua presença digital.
          </motion.p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3.5"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.28 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <input
              type="text"
              placeholder="Seu nome"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-[#111111] border border-[#222222] text-white placeholder-[#444444] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#E02020] transition-colors"
            />
            <input
              type="email"
              placeholder="Seu email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-[#111111] border border-[#222222] text-white placeholder-[#444444] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#E02020] transition-colors"
            />
          </div>
          <textarea
            placeholder="Conte sobre seu projeto..."
            required
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="bg-[#111111] border border-[#222222] text-white placeholder-[#444444] rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:border-[#E02020] transition-colors resize-none"
          />
          <button
            type="submit"
            className="bg-[#E02020] text-white font-bold py-4 rounded-lg text-sm hover:bg-[#C01010] transition-colors"
            style={{ boxShadow: '0 0 28px rgba(224,32,32,0.28)' }}
          >
            {sent ? 'Abrindo WhatsApp...' : 'Enviar via WhatsApp'}
          </button>
        </motion.form>

        {/* Direct contacts */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-9 pt-9 border-t border-[#1E1E1E]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.45 }}
        >
          <a
            href="https://wa.me/5562981147673"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white transition-colors"
          >
            <span className="text-[#E02020] font-semibold">WhatsApp</span>
            <span>62 98114-7673</span>
          </a>
          <div className="hidden sm:block w-px h-4 bg-[#2A2A2A]" />
          <a
            href="mailto:contato@gamstudio.com"
            className="flex items-center gap-2 text-sm text-[#A0A0A0] hover:text-white transition-colors"
          >
            <span className="text-[#E02020] font-semibold">Email</span>
            <span>contato@gamstudio.com</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx`**

```tsx
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
        </>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify**

- Dark red radial gradient pulses slowly behind the form
- Fields highlight red border on focus
- Submit opens WhatsApp with pre-filled message
- Direct WhatsApp + email links at bottom

- [ ] **Step 4: Commit**

```bash
git add components/CTASection.tsx app/page.tsx
git commit -m "feat: CTA section with animated gradient and WhatsApp form"
```

---

### Task 12: Footer + final page.tsx

**Files:**
- Create: `components/Footer.tsx`
- Modify: `app/page.tsx` (final version)

- [ ] **Step 1: Create `components/Footer.tsx`**

```tsx
'use client'

const NAV_LINKS = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Cases', href: '#cases' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[#161616] bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <a href="#home" className="flex items-baseline select-none">
            <span className="text-lg font-black text-white tracking-tight">GAM</span>
            <span className="text-lg font-black text-[#E02020] tracking-tight ml-1">STUDIO</span>
          </a>

          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#3A3A3A] hover:text-[#E02020] transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="text-xs text-[#2A2A2A] md:text-right">
            <div>Goiânia · Brasil</div>
            <div>BR · USA · EUR</div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#121212] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#2A2A2A]">
            © {new Date().getFullYear()} GAM Studio. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E02020]" />
            <span className="text-xs text-[#2A2A2A]">Goiânia, Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Final `app/page.tsx`**

```tsx
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
```

- [ ] **Step 3: Full golden-path verification**

Run `npm run dev`, open http://localhost:3000. Check every item:

1. **Loading screen:** "GAM." appears → red dot pulses → screen fades (~2s)
2. **Hero:** particles float + react to mouse, text scrambles → settles, CTAs appear
3. **Navbar:** slides in from top, transparent over hero
4. **Scroll 10px:** navbar blurs + dark glass
5. **Services:** 6 cards animate in staggered; hover → scale, red border/title, sweep line
6. **About:** text animates in; stat numbers count up; right panel has parallax shift
7. **Cases:** filter buttons work; hover reveals description
8. **Testimonials:** auto-advances every 5s; dots work
9. **CTA:** gradient animates; form submits → WhatsApp opens
10. **Footer:** logo, nav links, location visible
11. **Cursor:** red circle everywhere, expands on hover of links/buttons
12. **Smooth scroll:** Lenis active — no hard jumps on anchor clicks

- [ ] **Step 4: Final commit**

```bash
git add components/Footer.tsx app/page.tsx
git commit -m "feat: footer + complete GAM Studio site integration"
```

---

## Self-Review

**Spec coverage:**
- ✅ Loading screen — GSAP, "GAM." pulse, Task 3
- ✅ Hero — Three.js particles, scramble text, CTA pulsante — Task 6
- ✅ Services — 6 cards, hover animado — Task 7
- ✅ Sobre — parallax + contadores — Task 8
- ✅ Cases — grid com filtro — Task 9
- ✅ Depoimentos — carrossel fade — Task 10
- ✅ CTA — gradiente animado + formulário — Task 11
- ✅ Footer — minimalista, vermelho sutil — Task 12
- ✅ Lenis smooth scroll — Task 2 / LenisProvider
- ✅ Cursor customizado vermelho com lag — Task 2 / CustomCursor
- ✅ Navbar glassmorphism — Task 5
- ✅ Scroll reveal Framer Motion — Tasks 7-12 via `useInView`
- ✅ Contadores animados — Task 8 / Counter component
- ✅ Linhas vermelhas animadas — Task 4 / SectionDivider
- ✅ Logo "GAM STUDIO" navbar / "GAM." loading — Tasks 3, 5
- ✅ WhatsApp 62981147673 — Tasks 5, 11
- ✅ Email contato@gamstudio.com — Task 11

**Placeholder scan:** Nenhum TBD, TODO ou "similar ao task N" — cada task tem código completo.

**Type consistency:**
- `onComplete: () => void` definido em LoadingScreen, usado em page.tsx ✅
- `Counter({ value, suffix })` definido e usado somente em About.tsx ✅
- `useScramble(target, delay)` definido e usado somente em Hero.tsx ✅
- `ServiceCard({ service, index })` tipo inferido de `SERVICES[0]` ✅
- Nenhuma referência cruzada entre tasks com assinaturas diferentes ✅
