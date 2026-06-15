import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LenisProvider from '@/components/providers/LenisProvider'
import CustomCursor from '@/components/CustomCursor'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'GAM Studio — Sua marca no próximo nível',
  description:
    'Agência de marketing digital em Goiânia. Website, Google ADS, Meta ADS, Branding, SEO, Social Media e Agentes de IA. Atendemos BR, USA e EUR.',
  keywords: ['agência marketing digital', 'Goiânia', 'website', 'branding', 'Google ADS'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="bg-[#0A0A0A] text-white antialiased overflow-x-hidden">
        <LenisProvider>
          <CustomCursor />
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
