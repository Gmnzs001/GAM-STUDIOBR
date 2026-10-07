'use client'

import { motion } from 'framer-motion'
import { CheckCheck } from 'lucide-react'
import { WhatsAppIcon } from '@/components/system/Button'

const EASE = [0.16, 1, 0.3, 1] as const

const bubble = (delay: number) => ({
  initial: { opacity: 0, y: 14, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.7, ease: EASE, delay },
})

/**
 * Visual do topo de /contato: uma conversa ilustrativa que "acontece" na tela,
 * reforçando o "Vamos conversar". Puramente decorativo (aria-hidden).
 */
export default function ContactHeroVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[460px] select-none lg:mr-0">
      {/* selo flutuante */}
      <div className="absolute -left-1 -top-5 z-10 grid size-14 sm:-left-5 sm:-top-6 sm:size-16 place-items-center rounded-2xl bg-red text-white shadow-[var(--shadow-red)] [animation:gam-float_6s_ease-in-out_infinite] motion-reduce:[animation:none]">
        <WhatsAppIcon className="size-7" />
      </div>

      <div className="relative rounded-[28px] bg-surface/95 p-5 shadow-[var(--shadow-lift)] ring-1 ring-line md:p-6">
        {/* cabeçalho da conversa */}
        <div className="flex items-center gap-3 border-b border-line pb-4 pl-10">
          <span className="grid size-10 place-items-center rounded-full bg-ink font-display text-sm font-extrabold tracking-[-0.04em] text-white">
            <span>
              G<span className="text-red">.</span>
            </span>
          </span>
          <span className="min-w-0">
            <span className="block font-display text-[0.95rem] font-semibold leading-tight text-ink">GAM Studio</span>
            <span className="block text-xs text-ink-3">Responde em até 24h</span>
          </span>
        </div>

        <div className="flex flex-col gap-3 pt-5">
          <motion.div {...bubble(0.9)} className="ml-auto max-w-[82%] origin-bottom-right">
            <p className="rounded-[18px] rounded-br-md bg-red px-4 py-3 text-[0.9rem] leading-snug text-white">
              Olá! Vim pelo site e gostaria de fazer um orçamento.
            </p>
            <span className="mt-1 flex items-center justify-end gap-1 text-[0.7rem] text-ink-3">
              agora <CheckCheck className="size-3.5 text-red" />
            </span>
          </motion.div>

          <motion.div {...bubble(1.9)} className="max-w-[82%] origin-bottom-left">
            <p className="rounded-[18px] rounded-bl-md bg-paper px-4 py-3 text-[0.9rem] leading-snug text-ink ring-1 ring-inset ring-line">
              Oi! Que bom ter você aqui. Conta pra gente: qual é o projeto?
            </p>
          </motion.div>

          <motion.div {...bubble(2.8)} className="ml-auto origin-bottom-right">
            <span className="flex h-10 items-center gap-1.5 rounded-[18px] rounded-br-md bg-red-50 px-4 ring-1 ring-inset ring-red-100">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-red motion-reduce:animate-none"
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
                />
              ))}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
