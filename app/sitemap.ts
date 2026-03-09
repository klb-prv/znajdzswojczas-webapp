import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://znajdzswojczas.pl'

  const today = new Date().toISOString().split('T')[0]
  const staticDate = "2026-03-08"
  return [
    {
      url: `${base}/`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${base}/regulamin`,
      lastModified: staticDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/polityka-prywatnosci`,
      lastModified: staticDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/rodo`,
      lastModified: staticDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${base}/anuluj`,
      lastModified: staticDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
