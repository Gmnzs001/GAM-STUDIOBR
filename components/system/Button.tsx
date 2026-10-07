'use client'

import Link from 'next/link'
import { useRef, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Ícones de marca (lucide não tem WhatsApp) ───────────────────────────────
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.847L.057 23.882a.5.5 0 0 0 .612.612l6.035-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.003-1.369l-.359-.214-3.72.903.919-3.638-.234-.374A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
    </svg>
  )
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
type Variant = 'primary' | 'ink' | 'outline' | 'white' | 'outline-light'
type Size = 'sm' | 'md' | 'lg'
type Icon = 'arrow' | 'whatsapp' | 'instagram' | 'none'

const VARIANTS: Record<Variant, { base: string; chip: string }> = {
  primary: {
    base: 'bg-red text-white shadow-[var(--shadow-red)] hover:bg-red-600',
    chip: 'bg-white text-red',
  },
  ink: {
    base: 'bg-ink text-white hover:bg-[#262a33]',
    chip: 'bg-red text-white',
  },
  outline: {
    base: 'bg-white/60 text-ink ring-1 ring-inset ring-line-2 backdrop-blur hover:ring-ink',
    chip: 'bg-ink text-white',
  },
  white: {
    base: 'bg-white text-ink hover:bg-mist',
    chip: 'bg-red text-white',
  },
  'outline-light': {
    base: 'bg-white/5 text-white ring-1 ring-inset ring-white/25 hover:ring-white/70',
    chip: 'bg-white text-ink',
  },
}

const SIZES: Record<Size, { base: string; chip: string; icon: string }> = {
  sm: { base: 'h-10 pl-4 pr-1.5 text-sm gap-3', chip: 'size-7', icon: 'size-3.5' },
  md: { base: 'h-12 pl-5 pr-1.5 text-[0.95rem] gap-4', chip: 'size-9', icon: 'size-4' },
  lg: { base: 'h-14 pl-7 pr-2 text-base gap-5', chip: 'size-10', icon: 'size-[18px]' },
}

/**
 * Botão-pílula da GAM: texto que "rola" no hover, chip de ícone que gira,
 * e efeito magnético sutil (só em mouse/trackpad).
 * Renderiza <Link> para rotas internas, <a> para externos e <button> sem href.
 */
export default function Button({
  children,
  href,
  external,
  variant = 'primary',
  size = 'md',
  icon = 'arrow',
  magnetic = true,
  className,
  type = 'button',
  disabled,
  onClick,
  ariaLabel,
}: {
  children: ReactNode
  href?: string
  external?: boolean
  variant?: Variant
  size?: Size
  icon?: Icon
  magnetic?: boolean
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  ariaLabel?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 260, damping: 18, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 260, damping: 18, mass: 0.6 })

  const onMove = (e: ReactMouseEvent) => {
    if (!magnetic || reduce) return
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.18)
    my.set((e.clientY - (r.top + r.height / 2)) * 0.3)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  const v = VARIANTS[variant]
  const s = SIZES[size]
  const isExternal = external ?? (href ? /^https?:/.test(href) : false)

  const inner = (
    <>
      <span className="relative block overflow-hidden whitespace-nowrap font-semibold leading-none tracking-[-0.01em]">
        <span className="block py-[0.2em] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:-translate-y-full">
          {children}
        </span>
        <span aria-hidden="true" className="absolute inset-x-0 top-full block py-[0.2em] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:-translate-y-full">
          {children}
        </span>
      </span>
      {icon !== 'none' && (
        <span className={cn('grid shrink-0 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-out-expo)]', v.chip, s.chip, icon === 'arrow' && 'group-hover/btn:rotate-45')}>
          {icon === 'arrow' && <ArrowUpRight className={s.icon} strokeWidth={2.4} />}
          {icon === 'whatsapp' && <WhatsAppIcon className={s.icon} />}
          {icon === 'instagram' && <InstagramIcon className={s.icon} />}
        </span>
      )}
    </>
  )

  const cls = cn(
    'group/btn relative inline-flex select-none items-center justify-between rounded-full transition-[background-color,box-shadow,color] duration-300 disabled:pointer-events-none disabled:opacity-60',
    v.base,
    s.base,
    icon === 'none' && 'pr-5',
    className,
  )

  let el: ReactNode
  if (href && !isExternal) {
    el = <Link href={href} className={cls} aria-label={ariaLabel} onClick={onClick}>{inner}</Link>
  } else if (href) {
    el = <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={ariaLabel} onClick={onClick}>{inner}</a>
  } else {
    el = <button type={type} className={cls} disabled={disabled} aria-label={ariaLabel} onClick={onClick}>{inner}</button>
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={cn('inline-flex', className?.includes('w-full') && 'w-full')}
    >
      {el}
    </motion.div>
  )
}
