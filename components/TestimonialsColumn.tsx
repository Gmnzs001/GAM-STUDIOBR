import type { CSSProperties } from 'react'
import { Star } from 'lucide-react'
import type { Testimonial } from '@/lib/site'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Paleta discreta dos avatares — escolhida de forma determinística pelo nome. */
const AVATAR_PALETTE = [
  'bg-ink text-white',
  'bg-red text-white',
  'bg-paper-2 text-ink ring-1 ring-inset ring-line',
  'bg-red-50 text-red-600',
  'bg-night-2 text-mist',
] as const

function hash(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

function initials(name: string) {
  const parts = name.replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

const REGION_LABEL: Record<Testimonial['region'], string> = {
  BR: 'Brasil',
  USA: 'Estados Unidos',
  EUR: 'Europa',
}

export function Stars({ className, size = 'size-3.5' }: { className?: string; size?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5 text-red', className)} role="img" aria-label="Avaliação 5 de 5 estrelas">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn(size, 'fill-current')} strokeWidth={0} aria-hidden="true" />
      ))}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function TestimonialCard({ t, className }: { t: Testimonial; className?: string }) {
  const palette = AVATAR_PALETTE[hash(t.name) % AVATAR_PALETTE.length]
  const isEnglish = t.region !== 'BR'

  return (
    <figure
      className={cn(
        'relative flex flex-col rounded-[24px] bg-surface p-6 shadow-[var(--shadow-soft)] ring-1 ring-line md:p-7',
        'transition-[box-shadow,transform] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <Stars />
        <span
          aria-hidden="true"
          className="select-none font-display text-[3.25rem] font-extrabold leading-[0.5] text-paper-2"
        >
          &rdquo;
        </span>
      </div>

      <blockquote lang={isEnglish ? 'en' : undefined} className="mt-5 flex-1 text-[1.02rem] leading-relaxed text-ink">
        <p>{t.text}</p>
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        <span
          aria-hidden="true"
          className={cn('grid size-11 shrink-0 place-items-center rounded-full font-display text-[0.95rem] font-bold tracking-[-0.02em]', palette)}
        >
          {initials(t.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold leading-tight text-ink">{t.name}</span>
          <span className="mt-0.5 block text-sm leading-snug text-ink-3">{t.role}</span>
        </span>
        <span
          title={REGION_LABEL[t.region]}
          className="shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium leading-none text-ink-2 ring-1 ring-inset ring-line"
        >
          <span className="sr-only">{REGION_LABEL[t.region]}</span>
          <span aria-hidden="true">{t.region}</span>
        </span>
      </figcaption>
    </figure>
  )
}

// ─── Coluna em marquee vertical ──────────────────────────────────────────────

/**
 * Coluna de depoimentos rolando sem fim (CSS puro, pausa no hover).
 * A trilha é duplicada; a segunda cópia é decorativa (aria-hidden).
 */
export function TestimonialsColumn({
  testimonials,
  duration = 48,
  reverse = false,
  className,
}: {
  testimonials: Testimonial[]
  duration?: number
  reverse?: boolean
  className?: string
}) {
  const style = { '--duration': `${duration}s`, '--gap': '1.25rem' } as CSSProperties

  return (
    <div className={cn('group/col flex flex-col overflow-hidden [gap:var(--gap)]', className)} style={style}>
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 ? true : undefined}
          className={cn(
            'flex shrink-0 animate-marquee-vertical flex-col [gap:var(--gap)] [animation-play-state:var(--marquee-play,running)] group-hover/col:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]',
          )}
        >
          {testimonials.map((t) => (
            <li key={t.name}>
              <TestimonialCard t={t} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
