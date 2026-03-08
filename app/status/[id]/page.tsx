import { createAdminClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const statusMap = {
  pending_confirmation: { label: 'Oczekuje potwierdzenia', color: 'bg-yellow-100 text-yellow-700', emoji: '📋' },
  confirmed:            { label: 'Potwierdzona ✓',         color: 'bg-green-100 text-green-700',   emoji: '✅' },
  rescheduled:          { label: 'Przełożona',             color: 'bg-blue-100 text-blue-700',     emoji: '📅' },
  cancelled:            { label: 'Odwołana',               color: 'bg-red-100 text-red-700',       emoji: '❌' },
  in_progress:          { label: 'W trakcie realizacji',   color: 'bg-blue-100 text-blue-700',     emoji: '🔄' },
  awaiting_payment:     { label: 'Oczekuje na płatność',   color: 'bg-pink-100 text-pink-700',     emoji: '💳' },
  paid:                 { label: 'Opłacone',               color: 'bg-emerald-100 text-emerald-700', emoji: '✅' },
}

export default async function StatusPage({
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

  const status = statusMap[reservation.status as keyof typeof statusMap]
    ?? { label: reservation.status, color: 'bg-gray-100 text-gray-700', emoji: '📋' }
  const date = format(new Date(reservation.date), 'd MMMM yyyy', { locale: pl })

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">{status.emoji}</div>
          <h1 className="text-xl font-bold text-gray-900">Status rezerwacji</h1>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Termin</span>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Imię</span>
            <span className="font-medium">{reservation.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Temat</span>
            <span className="font-medium text-right max-w-[60%]">{reservation.topic}</span>
          </div>

          {reservation.cancel_reason && (
            <div className="bg-red-50 rounded-lg p-3 mt-2">
              <p className="text-xs text-red-600 font-medium">Powód odwołania:</p>
              <p className="text-xs text-red-500 mt-1">{reservation.cancel_reason}</p>
            </div>
          )}

          {reservation.reschedule_reason && (
            <div className="bg-blue-50 rounded-lg p-3 mt-2">
              <p className="text-xs text-blue-600 font-medium">Powód przełożenia:</p>
              <p className="text-xs text-blue-500 mt-1">{reservation.reschedule_reason}</p>
            </div>
          )}
        </div>

        <Link href="/" className="block mt-6 text-center text-sm text-blue-600 hover:underline">
          ← Wróć do strony głównej
        </Link>
      </div>
    </main>
  )
}
