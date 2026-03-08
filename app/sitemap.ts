import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://znajdzswojczas.pl'

  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${base}/regulamin`,
      lastModified: new Date('2026-03-08'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/polityka-prywatnosci`,
      lastModified: new Date('2026-03-08'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/rodo`,
      lastModified: new Date('2026-03-08'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${base}/anuluj`,
      lastModified: new Date('2026-03-08'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
