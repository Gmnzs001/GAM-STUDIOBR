import type LenisType from 'lenis'

let _lenis: LenisType | null = null

export const getLenis = (): LenisType | null => _lenis
export const setLenis = (l: LenisType | null): void => { _lenis = l }
