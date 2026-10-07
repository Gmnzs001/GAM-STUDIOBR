'use client'

import { getLenis } from '@/lib/lenis-ref'

/** Distância do topo onde o painel deve parar (navbar flutuante + respiro). */
export const SCROLL_OFFSET = -100

/**
 * Offset do alvo: se o painel logo após a âncora estiver "sticky" (pilha no
 * desktop), para exatamente no `top` em que ele gruda. Assim o painel não é
 * empurrado para baixo e o próximo não cobre a base dele.
 */
function offsetFor(anchor: HTMLElement) {
  const panel = anchor.nextElementSibling
  if (panel instanceof HTMLElement) {
    const cs = window.getComputedStyle(panel)
    const top = parseFloat(cs.top)
    if (cs.position === 'sticky' && Number.isFinite(top)) return -top
  }
  return SCROLL_OFFSET
}

/**
 * Rola suavemente até o painel do serviço (`#slug`) e atualiza a hash da URL
 * sem empilhar histórico. Usa o Lenis quando ativo; senão, scroll nativo.
 */
export function scrollToService(slug: string, opts: { immediate?: boolean; updateHash?: boolean } = {}) {
  const el = document.getElementById(slug)
  if (!el) return
  // alvo numérico (o Lenis somaria o scroll-margin do elemento a um offset)
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY + offsetFor(el))
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(top, { immediate: opts.immediate, force: true, duration: 1.4 })
  } else {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top, behavior: opts.immediate || reduce ? 'auto' : 'smooth' })
  }
  if (opts.updateHash !== false && window.location.hash !== `#${slug}`) {
    window.history.replaceState(window.history.state, '', `#${slug}`)
  }
}
