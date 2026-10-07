import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import LenisProvider from '@/components/providers/LenisProvider'
import ScrollProgressBar from '@/components/ScrollProgressBar'
import AmbientBackground from '@/components/system/AmbientBackground'
import Cursor from '@/components/system/Cursor'
import { SITE_URL, FOUNDED_YEAR, WHATSAPP_NUMBER, INSTAGRAM_URL, FOUNDER, SERVICES } from '@/lib/site'

// Display: Bricolage Grotesque (variável, com eixos de largura e tamanho óptico)
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  axes: ['opsz', 'wdth'],
  display: 'swap',
})

// Texto: Geist
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

// Números/detalhes: Geist Mono
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

// Dados estruturados (schema.org) — ajudam Google/IA a entender a empresa
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#organizacao`,
  name: 'GAM Studio',
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  description:
    'Agência de marketing, mídia e desenvolvimento digital em Goiânia. Sites, Google ADS, SEO, Branding, Redes Sociais e Agentes de IA.',
  foundingDate: String(FOUNDED_YEAR),
  telephone: `+${WHATSAPP_NUMBER}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Goiânia',
    addressRegion: 'GO',
    addressCountry: 'BR',
  },
  areaServed: ['Brasil', 'Estados Unidos', 'Europa'],
  sameAs: [INSTAGRAM_URL],
  founder: { '@type': 'Person', name: FOUNDER.name },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Serviços',
    itemListElement: SERVICES.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name, description: s.short },
    })),
  },
}

export const viewport: Viewport = {
  themeColor: '#f2f3f5',
}

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
    <html lang="pt-BR" className={`${bricolage.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="bg-paper text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, '\\u003c') }}
        />
        <LenisProvider>
          <AmbientBackground />
          <ScrollProgressBar />
          <Cursor />
          {/* Conteúdo acima do fundo vivo (z-0) e do grain (z-1) */}
          <div className="relative z-[2]">{children}</div>
        </LenisProvider>
      </body>
    </html>
  )
}
