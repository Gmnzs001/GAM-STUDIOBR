'use client'

import { createContext, useContext } from 'react'

/**
 * `true` quando o conteúdo da página já está visível para o usuário.
 * Na home ele começa `false` e vira `true` quando a intro abre o "buraco"
 * revelando o site — é o sinal para o Hero/Navbar dispararem suas entradas.
 * Nas outras páginas (sem intro) o valor padrão é `true`.
 */
export const IntroContext = createContext<boolean>(true)

export const useRevealed = () => useContext(IntroContext)

// ─── A intro toca uma vez por carregamento ───────────────────────────────────
// Guardado em memória do módulo (não em storage): sobrevive à navegação interna
// (ex.: /sobre → Início não repete a intro) e zera ao recarregar a página.
// Só é marcado no cliente, então o HTML do servidor sempre traz a intro.
let introPlayed = false
export const hasIntroPlayed = () => introPlayed
export const markIntroPlayed = () => { introPlayed = true }
