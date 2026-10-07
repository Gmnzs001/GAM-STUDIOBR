import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE_URL,                 lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/servicos`,   lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/portfolio`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/sobre`,      lastModified: now, changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${SITE_URL}/contato`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.8 },
  ]
}
