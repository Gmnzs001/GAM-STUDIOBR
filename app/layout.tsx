import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LenisProvider from '@/components/providers/LenisProvider'
import GlobalSpotlight from '@/components/GlobalSpotlight'
import ScrollProgressBar from '@/components/ScrollProgressBar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '600', '700', '800'],
})

// Troque pela URL definitiva antes do deploy
const SITE_URL = 'https://gamstudio.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:  'GAM Studio — Sua marca no próximo nível',
    template: '%s | GAM Studio',
  },
  description:
    'Agência de marketing, mídia e desenvolvimento digital em Goiânia. ' +
    'Sites, Google ADS, SEO, Branding, Redes Sociais e Agentes de IA. ' +
    'Atendemos Brasil, Estados Unidos e Europa.',
  keywords: [
    'agência de marketing digital',
    'criação de sites Goiânia',
    'Google ADS',
    'SEO Goiânia',
    'branding',
    'redes sociais',
    'desenvolvimento web',
    'agentes de IA',
    'GAM Studio',
    'marketing digital Goiânia',
  ],
  authors:  [{ name: 'GAM Studio', url: SITE_URL }],
  creator:  'GAM Studio',
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:              true,
      follow:             true,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
  openGraph: {
    type:        'website',
    locale:      'pt_BR',
    url:         SITE_URL,
    siteName:    'GAM Studio',
    title:       'GAM Studio — Sua marca no próximo nível',
    description: 'Agência de marketing, mídia e desenvolvimento digital em Goiânia. Atendemos BR, USA e EUR.',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'GAM Studio — Sua marca no próximo nível',
    description: 'Agência de marketing, mídia e desenvolvimento digital em Goiânia. Atendemos BR, USA e EUR.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="bg-[#0A0A0A] text-white antialiased overflow-x-hidden">
        <LenisProvider>
          <ScrollProgressBar />
          <GlobalSpotlight />
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
