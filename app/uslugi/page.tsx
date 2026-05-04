import Link from 'next/link'
import { SERVICES, SERVICE_VARIANTS, SERVICE_OPTIONS, OPTION_PRICE } from '@/lib/services'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Usługi – Znajdź swój czas',
  description: 'Pełna lista dostępnych usług IT: konsultacje, instalacje, konfiguracje i więcej.',
}

export default function UslugiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Wróć na stronę główną</Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-100/60 dark:shadow-none border border-gray-100/80 dark:border-gray-800 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">Dostępne usługi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Konsultacje IT, instalacje, konfiguracje i więcej –{' '}
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">umów wizytę</Link>
          </p>

          <ul className="space-y-4">
            {SERVICES.map((service) => {
              const variants = SERVICE_VARIANTS[service.id] ?? []
              const options = SERVICE_OPTIONS[service.id] ?? []

              return (
                <li
                  key={service.id}
                  className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none mt-0.5" aria-hidden="true">{service.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">{service.label}</h2>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {service.basePrice} zł{' '}
                          <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                            {service.priceNote}
                          </span>
                        </span>
                      </div>

                      {variants.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Warianty</p>
                          <ul className="space-y-1.5">
                            {variants.map((v) => (
                              <li key={v.id} className="flex items-start justify-between gap-2 text-sm">
                                <span className="text-gray-700 dark:text-gray-300">
                                  <span className="font-medium">{v.label}</span>
                                  {v.sublabel && (
                                    <span className="text-gray-400 dark:text-gray-500"> – {v.sublabel}</span>
                                  )}
                                </span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{v.price} zł</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {options.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            Konkretne wymagania <span className="normal-case font-normal">(+{OPTION_PRICE} zł / opcja)</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {options.map((opt) => (
                              <span
                                key={opt}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-8 text-xs text-gray-400 dark:text-gray-600 space-y-1">
            <p>Podane ceny mają charakter orientacyjny. Ostateczna cena ustalana jest indywidualnie.</p>
            <p>
              Szczegółowe warunki znajdziesz w{' '}
              <Link href="/regulamin" className="text-blue-500 dark:text-blue-400 hover:underline">Regulaminie</Link>.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">znajdźswójczas.pl – szybka pomoc techniczna</p>
      </div>
    </main>
  )
}
