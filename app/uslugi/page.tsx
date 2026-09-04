import Link from 'next/link'
import { SERVICES, SERVICE_VARIANTS, SERVICE_PACKAGES } from '@/lib/services'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Usługi i cennik - Znajdź swój czas',
  description: 'Cennik usług IT: konsultacje, streaming, strony internetowe, programowanie.',
}

const CATEGORY_META: Record<string, { title: string; emoji: string; note?: string }> = {
  it:          { title: 'Pomoc IT i obsługa techniczna',     emoji: '🖥️' },
  streaming:   { title: 'Streaming, OBS i IRL',              emoji: '🎥', note: 'Pakiety streamingowe znajdziesz powyżej. Poniżej usługi dodatkowe.' },
  websites:    { title: 'Strony internetowe',                emoji: '🌐' },
  programming: { title: 'Programowanie',                     emoji: '💻' },
}

const CATEGORY_ORDER = ['it', 'streaming', 'websites', 'programming'] as const

export default function UslugiPage() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    meta: CATEGORY_META[cat],
    services: SERVICES.filter((s) => s.category === cat),
  }))

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Wróć na stronę główną</Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-100/60 dark:shadow-none border border-gray-100/80 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">Cennik usług</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Aktualna oferta –{' '}
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">umów wizytę</Link>
          </p>

          {SERVICE_PACKAGES.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-50 mb-4">📦 Pakiety usług</h2>
              <div className="space-y-4">
                {SERVICE_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5" aria-hidden="true">{pkg.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">{pkg.title}</h3>
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                            {pkg.priceRange}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pkg.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 pl-1">Pakiety usług są przygotowane jako korzystniejsze cenowo zestawy najczęściej wybieranych usług.</p>
            </div>
          )}

          {grouped.map(({ category, meta, services }) => (
            <div key={category} className="mb-10">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-50 mb-4">
                {meta.emoji} {meta.title}
              </h2>

              <ul className="space-y-3">
                {services.map((service) => {
                  const variants = SERVICE_VARIANTS[service.id] ?? []

                  return (
                    <li
                      key={service.id}
                      className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl leading-none mt-0.5" aria-hidden="true">{service.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">{service.label}</h3>
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              {service.basePrice > 0
                                ? <>od {service.basePrice} zł{service.priceNote && <>{' '}{service.priceNote}</>}</>
                                : 'wycena indywidualna'
                              }
                            </span>
                          </div>

                          {variants.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Warianty</p>
                              {variants.map((v) => (
                                <div key={v.id} className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-3">
                                  <div className="flex items-baseline justify-between gap-2">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{v.label}</span>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">od {v.price} zł</span>
                                  </div>
                                  {v.sublabel && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{v.sublabel}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {meta.note && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 pl-1">{meta.note}</p>
              )}
            </div>
          ))}

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6 space-y-3 text-xs text-gray-400 dark:text-gray-600">
            <p>
              <strong className="text-gray-500 dark:text-gray-400">Minimalna wartość zlecenia:</strong> 100 zł
            </p>
            <p>
              <strong className="text-gray-500 dark:text-gray-400">Prace pilne:</strong> realizacja w trybie pilnym może wiązać się z dopłatą do 50% wartości usługi.
            </p>
            <p>
              Cena końcowa zależy od zakresu prac. W przypadku usług wymagających większego nakładu pracy klient otrzymuje indywidualną wycenę <strong>przed rozpoczęciem realizacji</strong>.
            </p>
            <p>
              Ceny podawane w Serwisie są cenami brutto. Szczegółowe warunki znajdziesz w{' '}
              <Link href="/regulamin" className="text-blue-500 dark:text-blue-400 hover:underline">Regulaminie</Link>.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">znajdźswójczas.pl – szybka pomoc techniczna</p>
      </div>
    </main>
  )
}
