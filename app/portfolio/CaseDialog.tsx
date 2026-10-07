'use client'

import { useEffect, useId, useRef, useSyncExternalStore, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Button from '@/components/system/Button'
import { CATEGORY_TINT } from '@/components/CaseCover'
import { getLenis } from '@/lib/lenis-ref'
import { waLink } from '@/lib/site'
import CaseMedia from './CaseMedia'
import { CaseMetric, type Case } from './PortfolioGallery'

const EASE = [0.16, 1, 0.3, 1] as const
const noopSubscribe = () => () => {}
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * Painel de detalhes do case.
 * Desktop: modal central (mídia à esquerda, texto à direita).
 * Mobile: folha que sobe da base.
 * Acessível: aria-modal, Esc fecha, foco preso no painel e devolvido ao card.
 */
export default function CaseDialog({
  item,
  onClose,
  returnFocusRef,
}: {
  item: Case | null
  onClose: () => void
  returnFocusRef: RefObject<HTMLElement | null>
}) {
  const open = item !== null
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false)

  // Trava o scroll da página enquanto o painel está aberto
  useEffect(() => {
    if (!open) return
    const lenis = getLenis()
    lenis?.stop()
    const html = document.documentElement
    const body = document.body
    // compensa a barra de rolagem que some, para o layout não "pular"
    const gap = window.innerWidth - html.clientWidth
    const prev = { overflow: html.style.overflow, pad: body.style.paddingRight }
    html.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    const returnTo = returnFocusRef.current
    return () => {
      lenis?.start()
      html.style.overflow = prev.overflow
      body.style.paddingRight = prev.pad
      returnTo?.focus({ preventScroll: true })
    }
  }, [open, returnFocusRef])

  if (!isClient) return null

  return createPortal(
    <AnimatePresence>{item && <Panel key={item.id} item={item} onClose={onClose} />}</AnimatePresence>,
    document.body,
  )
}

function Panel({ item, onClose }: { item: Case; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const hasMetric = item.metric.value > 0

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center md:items-center md:p-6">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/60"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative flex h-[94svh] w-full flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-[0_40px_120px_-30px_rgba(14,16,21,0.55)] md:h-auto md:max-h-[86vh] md:max-w-[1080px] md:rounded-[32px]"
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98, transition: { duration: 0.25 } }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes do case"
          className="absolute right-3 top-3 z-20 grid size-11 place-items-center rounded-full bg-white text-ink shadow-md ring-1 ring-ink/10 transition-[background-color,transform] duration-300 hover:rotate-90 hover:bg-paper md:right-4 md:top-4"
        >
          <X className="size-5" strokeWidth={2.2} />
        </button>

        {/* Mobile: o painel inteiro rola (mídia + texto). Desktop: mídia fixa, texto rola. */}
        <div data-lenis-prevent className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain md:flex-row md:overflow-hidden">
          {/* Mídia */}
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-paper-2 md:aspect-auto md:min-h-[420px] md:w-[52%] md:self-stretch">
            <CaseMedia
              src={item.image}
              alt={item.title}
              category={item.category}
              seed={item.id}
              title={item.title}
              depth={0}
              sizes="(min-width: 768px) 560px, 100vw"
              priority
            />
          </div>

          {/* Conteúdo (rolagem própria) */}
          <div data-lenis-prevent className="flex-1 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 md:min-h-0 md:overflow-y-auto md:overscroll-contain md:px-10 md:pb-10 md:pt-12">
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1 font-semibold text-ink ring-1 ring-line">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: CATEGORY_TINT[item.category] }} aria-hidden="true" />
                {item.category}
              </span>
              <span>{item.segment}</span>
              <span aria-hidden="true" className="size-1 rounded-full bg-line-2" />
              <span className="font-mono text-[0.8rem]">{item.year}</span>
            </div>

            <h2 id={titleId} className="type-title mt-5 pr-10 text-ink [overflow-wrap:anywhere]">
              {item.title}<span className="gam-dot">.</span>
            </h2>
            <p className="mt-2 text-ink-3">{item.client}</p>

            {hasMetric && (
              <div className="mt-8 rounded-[20px] bg-paper p-5 ring-1 ring-line">
                <CaseMetric metric={item.metric} size="lg" />
              </div>
            )}

            <p id={descId} className="mt-8 leading-relaxed text-ink-2">{item.result}</p>

            {item.tags.length > 0 && (
              <div className="mt-8">
                <p className="type-label text-ink">O que entregamos</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li key={tag} className="rounded-full bg-paper px-3.5 py-1.5 text-sm font-medium text-ink-2 ring-1 ring-line">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-10 border-t border-line pt-8">
              <Button
                href={waLink(`Olá! Vi o case "${item.title}" no site da GAM Studio e quero um projeto assim.`)}
                icon="whatsapp"
                className="w-full justify-between sm:w-auto"
              >
                Quero um projeto assim
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
