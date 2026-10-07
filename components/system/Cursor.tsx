'use client'

import { useEffect, useRef } from 'react'

/**
 * Cursor da GAM (só mouse/trackpad, desligado com reduced-motion):
 * ponto vermelho preciso + anel que segue com atraso e cresce sobre links/botões.
 * Elementos com `data-cursor="Texto"` mostram um rótulo dentro do anel.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return

    const dot = dotRef.current!
    const ring = ringRef.current!
    const label = labelRef.current!
    document.documentElement.classList.add('has-gam-cursor')

    let x = -100, y = -100, rx = -100, ry = -100
    let scale = 1, targetScale = 1
    let visible = false
    let raf = 0
    let running = false

    // o loop só roda enquanto há movimento/transição — parado, não custa nada
    const wake = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      if (!visible) {
        visible = true
        rx = x; ry = y
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
      wake()
    }
    const onOver = (e: Event) => {
      const t = (e.target as Element | null)?.closest?.('a, button, [role="button"], [data-cursor], input, textarea, select, label')
      const text = t?.getAttribute?.('data-cursor') ?? ''
      const isField = !!t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)
      if (isField) {
        targetScale = 0.5
        ring.dataset.mode = 'field'
      } else if (text) {
        targetScale = 3.2
        ring.dataset.mode = 'label'
      } else if (t) {
        targetScale = 2.1
        ring.dataset.mode = 'link'
      } else {
        targetScale = 1
        ring.dataset.mode = ''
      }
      label.textContent = text
      wake()
    }
    const onLeaveWin = () => {
      visible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }
    const onDown = () => { targetScale *= 0.82; wake() }
    const onUp = () => { targetScale /= 0.82; wake() }

    function tick() {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      scale += (targetScale - scale) * 0.16
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`
      label.style.transform = `translate(-50%, -50%) scale(${1 / scale})`
      const settled = Math.abs(x - rx) + Math.abs(y - ry) < 0.1 && Math.abs(targetScale - scale) < 0.002
      if (settled) {
        running = false
        return
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeaveWin)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-gam-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeaveWin)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[10000] grid size-9 place-items-center rounded-full border border-ink/40 opacity-0 shadow-[0_0_0_1px_rgba(255,255,255,0.3)] transition-[opacity,background-color,border-color] duration-300 data-[mode=label]:border-red data-[mode=label]:bg-red data-[mode=link]:border-red/60 data-[mode=link]:bg-red/10 data-[mode=field]:border-ink/20"
      >
        <span ref={labelRef} className="absolute left-1/2 top-1/2 whitespace-nowrap text-[11px] font-semibold text-white" />
      </div>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[10001] size-1.5 rounded-full bg-red opacity-0 transition-opacity duration-300"
      />
    </>
  )
}
