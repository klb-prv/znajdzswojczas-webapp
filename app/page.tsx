import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/server'
import BookingCalendar from '@/components/BookingCalendar'
import ReservationStatusButton from '@/components/ReservationStatusButton'
import ReviewsCarousel from '@/components/ReviewsCarousel'
import type { Review } from '@/components/ReviewsCarousel'
import type { SiteStatus } from '@/lib/types'

const STATUS_CONFIG: Record<SiteStatus, { banner: string; icon: string; label: string; block: boolean }> = {
  accepting: {
    banner: 'bg-blue-100 text-blue-700',
    icon: '🟢',
    label: 'Zgłoszenia aktywne',
    block: false,
  },
  maintenance: {
    banner: 'bg-amber-100 text-amber-700',
    icon: '🔧',
    label: 'Przerwa techniczna',
    block: true,
  },
  closed: {
    banner: 'bg-red-100 text-red-700',
    icon: '🔴',
    label: 'Nowe zgłoszenia są zablokowane',
    block: true,
  },
}

export default async function HomePage() {
  const supabase = createAdminClient()

  const [
    { data: blockedRows },
    { data: takenRows },
    { data: settings },
  ] = await Promise.all([
    supabase.from('blocked_dates').select('date, block_type'),
    supabase.from('reservations').select('date').in('status', ['pending_confirmation', 'confirmed']),
    supabase.from('site_settings').select('status, status_message').eq('id', 1).single(),
  ])

  const siteStatus = (settings?.status ?? 'accepting') as SiteStatus
  const cfg = STATUS_CONFIG[siteStatus]

  const blockedDates = blockedRows?.map((r: { date: string }) => r.date) ?? []
  const takenDates   = takenRows?.map((r: { date: string }) => r.date)   ?? []

  const reviews: Review[] = [
    {
      id: 1,
      nickname: 'OlekOfficial',
      rating: 5,
      description: 'Bardzo profesjonalna i szybka obsługa, wszystko IT działa pod transmisję. Polecam!',
      verified: true,
      channel_link: 'https://kick.com/olekofficial',
      avatar_url: 'https://files.kick.com/images/user/51192452/profile_image/conversion/2496d34f-f6e1-44f0-8b3d-a6a7dab5cbe8-fullsize.webp',
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 sm:py-12 px-4">
      <Suspense>
        <ReservationStatusButton />
      </Suspense>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6 sm:mb-10">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4 shadow-sm ${cfg.banner}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${siteStatus === 'accepting' ? 'bg-blue-500 animate-pulse' : siteStatus === 'maintenance' ? 'bg-amber-500' : 'bg-red-500'}`} />
            {cfg.label}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Znajdź swój czas
          </h1>
          <div className="mt-2">
            <a href="/regulamin" className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition">Regulamin</a>
          </div>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            Konsultacje IT, instalacje, konfiguracje i więcej -{' '}
            <span className="text-blue-600 font-medium">wybierz termin i umów wizytę</span>
          </p>
          <ReviewsCarousel reviews={reviews} />
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/60 border border-gray-100/80 p-4 sm:p-6 backdrop-blur">
          {cfg.block ? (
            <div className={`rounded-2xl p-6 text-center ${siteStatus === 'maintenance' ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-3xl mb-3">{siteStatus === 'maintenance' ? '🔧' : '🔒'}</p>
              <p className={`font-semibold text-base mb-1 ${siteStatus === 'maintenance' ? 'text-amber-800' : 'text-red-800'}`}>
                {siteStatus === 'maintenance' ? 'Przerwa techniczna' : 'Zgłoszenia zostały tymczasowo wstrzymane'}
              </p>
              <p className={`text-sm ${siteStatus === 'maintenance' ? 'text-amber-600' : 'text-red-600'}`}>
                {settings?.status_message ?? (siteStatus === 'maintenance'
                  ? 'Trwają prace techniczne. Wróć za chwilę.'
                  : 'Przyjmowanie nowych rezerwacji jest zablokowane.'
                )}
              </p>
            </div>
          ) : (
            <BookingCalendar blockedDates={blockedDates} takenDates={takenDates} />
          )}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">znajdźswójczas.pl - szybka pomoc techniczna</p>
        <p className="text-center mt-1 flex items-center justify-center gap-3">
          <a href="/polityka-prywatnosci" className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition">Polityka prywatności</a>
          <span className="text-gray-300 text-xs">|</span>
          <a href="/rodo" className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition">RODO</a>
          <span className="text-gray-300 text-xs">|</span>
          <a href="/promo" className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition">Materiały promocyjne</a>
        </p>
      </div>
    </main>
  )
}

