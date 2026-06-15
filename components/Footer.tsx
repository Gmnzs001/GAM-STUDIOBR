'use client'

const NAV_LINKS = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Cases', href: '#cases' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[#161616] bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <a href="#home" className="flex items-baseline select-none">
            <span className="text-lg font-black text-white tracking-tight">GAM</span>
            <span className="text-lg font-black text-[#E02020] tracking-tight ml-1">STUDIO</span>
          </a>

          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#3A3A3A] hover:text-[#E02020] transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="text-xs text-[#2A2A2A] md:text-right">
            <div>Goiânia · Brasil</div>
            <div>BR · USA · EUR</div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#121212] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#2A2A2A]">
            © {new Date().getFullYear()} GAM Studio. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E02020]" />
            <span className="text-xs text-[#2A2A2A]">Goiânia, Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
