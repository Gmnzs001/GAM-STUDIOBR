'use client'

import Image from 'next/image'
import CaseCover from '@/components/CaseCover'
import type { CaseCategory } from '@/lib/site'
import { cn } from '@/lib/utils'

/** A imagem só é considerada "real" quando é um caminho local (/...) ou uma URL http(s). */
export const isRealImage = (src: string) => src.startsWith('/') || /^https?:\/\//.test(src)

/**
 * Mídia do case: foto/print do projeto quando existir, senão a capa generativa
 * da categoria (nunca aparece um "placeholder cinza" para o visitante).
 */
export default function CaseMedia({
  src,
  alt,
  category,
  seed,
  title,
  tone = 'light',
  sizes,
  zoom,
  depth,
  priority,
  className,
}: {
  src: string
  alt: string
  category: CaseCategory
  seed: string | number
  title?: string
  tone?: 'light' | 'dark'
  sizes: string
  zoom?: number
  depth?: number
  priority?: boolean
  className?: string
}) {
  if (!isRealImage(src)) {
    return <CaseCover category={category} seed={seed} title={title} tone={tone} zoom={zoom} depth={depth} className={cn('absolute inset-0', className)} />
  }

  if (src.startsWith('/')) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/spot:scale-[1.04]', className)}
      />
    )
  }

  // URL externa: <img> simples (domínios externos não estão liberados no next/image).
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      className={cn('absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/spot:scale-[1.04]', className)}
    />
  )
}
