'use client'

import type { MouseEvent } from 'react'
import { SERVICES } from '@/lib/site'
import { scrollToService } from './scroll'

/** Índice rápido em pílulas no topo da página: ícone + nome → #slug. */
export default function ServiceChips() {
  const go = (e: MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    scrollToService(slug)
  }

  return (
    <nav aria-label="Ir direto para um serviço" className="border-t border-line pt-8">
      <p className="type-label mb-5 text-ink-3">Ir direto para</p>
      {/* mobile: uma linha rolável (o índice completo vem logo abaixo); desktop: quebra em linhas */}
      <ul className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 [mask-image:linear-gradient(to_right,#000_82%,transparent)] [scrollbar-width:none] md:flex-wrap md:[mask-image:none] md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
        {SERVICES.map((s) => {
          const Icon = s.icon
          return (
            <li key={s.slug} className="shrink-0 snap-start">
              <a
                href={`#${s.slug}`}
                onClick={(e) => go(e, s.slug)}
                className="group/chip inline-flex h-11 items-center whitespace-nowrap gap-2.5 rounded-full bg-surface/85 pl-1.5 pr-4 text-sm font-medium text-ink ring-1 ring-inset ring-line transition-[background-color,color,box-shadow] duration-300 hover:bg-ink hover:text-white hover:ring-ink"
              >
                <span className="grid size-8 place-items-center rounded-full bg-red-50 text-red transition-colors duration-300 group-hover/chip:bg-red group-hover/chip:text-white">
                  <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                </span>
                {s.name}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
