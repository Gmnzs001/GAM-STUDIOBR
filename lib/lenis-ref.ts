import type LenisType from 'lenis'

let _lenis: LenisType | null = null

export const getLenis = (): LenisType | null => _lenis
export const setLenis = (l: LenisType | null): void => { _lenis = l }

// ─── Posição de scroll sem forçar layout ──────────────────────────────────────
// Ler window.scrollY dentro de handlers de scroll pode forçar recálculo de
// layout no meio do frame. O LenisProvider publica aqui o valor que o Lenis já
// calculou (ou o scroll nativo, quando o Lenis está desligado por reduced-motion).
type ScrollListener = (y: number) => void
const listeners = new Set<ScrollListener>()
let lastY = 0

export const emitScrollY = (y: number): void => {
  lastY = y
  listeners.forEach((cb) => cb(y))
}

/** Assina a posição vertical de scroll. Retorna a função para cancelar. */
export const onScrollY = (cb: ScrollListener): (() => void) => {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

export const getScrollY = (): number => lastY
