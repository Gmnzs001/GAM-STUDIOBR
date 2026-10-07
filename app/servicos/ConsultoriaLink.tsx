'use client'

import type { MouseEvent } from 'react'
import Button from '@/components/system/Button'
import { scrollToService } from './scroll'

/**
 * "Ver o que inclui" do CTA final: rola até o painel da Consultoria usando o
 * mesmo cálculo dos chips/índice (Lenis + parada exata no painel sticky).
 */
export default function ConsultoriaLink() {
  const onClickCapture = (e: MouseEvent<HTMLSpanElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    scrollToService('consultoria')
  }

  return (
    <span className="contents" onClickCapture={onClickCapture}>
      <Button href="#consultoria" variant="outline-light" size="lg">
        Ver o que inclui
      </Button>
    </span>
  )
}
