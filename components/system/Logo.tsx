import { cn } from '@/lib/utils'

/** "GAM STUDIO" — navbar e footer. STUDIO em vermelho. */
export function Wordmark({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <span className={cn('inline-flex items-baseline gap-[0.28em] font-display font-extrabold leading-none tracking-[-0.04em]', className)}>
      <span className={tone === 'dark' ? 'text-white' : 'text-ink'}>GAM</span>
      <span className="text-red">STUDIO</span>
    </span>
  )
}

/** "GAM." — marca reduzida (intro, favicon). Ponto vermelho. */
export function Mark({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <span className={cn('inline-flex items-baseline font-display font-extrabold leading-none tracking-[-0.05em]', tone === 'dark' ? 'text-white' : 'text-ink', className)}>
      GAM<span className="text-red">.</span>
    </span>
  )
}
