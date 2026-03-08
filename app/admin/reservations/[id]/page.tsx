import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminReservationActions from '@/components/AdminReservationActions'
import AdminResendConfirmation from '@/components/AdminResendConfirmation'
import AdminCopyLink from '@/components/AdminCopyLink'
import AdminCorrectPrice from '@/components/AdminCorrectPrice'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_confirmation: { label: 'Oczekuje', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Potwierdzona', color: 'bg-green-100 text-green-700' },
  rescheduled: { label: 'Przełożona', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Odwołana', color: 'bg-red-100 text-red-700' },
  awaiting_payment: { label: 'Do zapłaty', color: 'bg-pink-100 text-pink-700' },
  in_progress: { label: 'W trakcie', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Opłacone', color: 'bg-emerald-100 text-emerald-700' },
}

export default async function AdminReservationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: reservation } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single()

  if (!reservation) notFound()

  // Oblicz wolne daty na następne 90 dni (bez zajętych i zablokowanych)
  const today = new Date()
  const candidates: string[] = []
  for (let i = 1; i <= 90; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    candidates.push(d.toISOString().split('T')[0])
  }

  const { data: blockedRows } = await supabase.from('blocked_dates').select('date')
  const { data: takenRows } = await supabase
    .from('reservations')
    .select('date')
    .in('status', ['pending_confirmation', 'confirmed'])
    .neq('id', id)

  const unavailable = new Set([
    ...(blockedRows?.map((b: { date: string }) => b.date) ?? []),
    ...(takenRows?.map((r: { date: string }) => r.date) ?? []),
  ])

  const freeDates = candidates.filter((d) => !unavailable.has(d))
  const date = format(new Date(reservation.date), 'd MMMM yyyy', { locale: pl })

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition border border-gray-200 rounded-xl px-3 py-1.5 bg-white shadow-sm hover:shadow"
          >
            ← Zgłoszenia
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Szczegóły zgłoszenia</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4 text-sm mb-6">
          <Row label="Termin" value={date} />
          <Row label="Imię i nazwisko" value={reservation.name} />
          <Row label="Email" value={reservation.email} />
          <Row label="Temat" value={reservation.topic} />
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status</span>
            {(() => {
              const s = STATUS_MAP[reservation.status]
              return s
                ? <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
                : <span className="font-medium text-gray-800">{reservation.status}</span>
            })()}
          </div>
          <div>
            <p className="text-gray-500 mb-1">Opis</p>
            <p className="text-gray-800 bg-gray-50 rounded-lg p-3 leading-relaxed">
              {reservation.description}
            </p>
          </div>
          {reservation.notes && (
            <Row label="Dane dodatkowe" value={reservation.notes} />
          )}
          {reservation.cancel_reason && (
            <Row label="Powód odwołania" value={reservation.cancel_reason} />
          )}
          {reservation.reschedule_reason && (
            <Row label="Powód przełożenia" value={reservation.reschedule_reason} />
          )}
          {reservation.final_price != null && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Cena realizacji</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {reservation.final_price.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                </span>
                {reservation.status === 'awaiting_payment' && (
                  <AdminCorrectPrice
                    reservationId={reservation.id}
                    currentPrice={reservation.final_price}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {['confirmed', 'rescheduled', 'pending_confirmation', 'in_progress', 'awaiting_payment'].includes(reservation.status) && (
          <AdminReservationActions
            reservationId={reservation.id}
            reservationNumber={reservation.reservation_number ?? reservation.id.slice(0, 8).toUpperCase()}
            freeDates={freeDates}
            currentTopic={reservation.topic}
            currentStatus={reservation.status}
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-4 space-y-2">
          <AdminResendConfirmation
            reservationId={reservation.id}
            email={reservation.email}
            status={reservation.status}
          />
          <AdminCopyLink reservationId={reservation.id} />
        </div>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="font-medium text-right break-all">{value}</span>
    </div>
  )
}
