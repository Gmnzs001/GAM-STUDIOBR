import { Clock3, Globe2, Zap } from 'lucide-react'

const CHIPS = [
  { icon: Zap, label: 'Resposta em até 24h' },
  { icon: Clock3, label: 'Seg a sex, das 8h às 18h' },
  { icon: Globe2, label: 'Goiânia para Brasil, EUA e Europa' },
]

/** Linha de chips informativos abaixo do PageHero de /contato. */
export default function HeroChips() {
  return (
    <ul className="flex flex-wrap gap-2.5" aria-label="Informações rápidas">
      {CHIPS.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="inline-flex h-11 items-center gap-2.5 rounded-full bg-surface/90 pl-2 pr-4 text-sm font-medium text-ink ring-1 ring-inset ring-line"
        >
          <span className="grid size-7 place-items-center rounded-full bg-red-50 text-red">
            <Icon className="size-3.5" strokeWidth={2.4} aria-hidden="true" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  )
}
