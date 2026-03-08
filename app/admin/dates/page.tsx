import { createAdminClient } from '@/lib/supabase/server'
import AdminDatesManager from '@/components/AdminDatesManager'

export default async function AdminDatesPage() {
  const supabase = createAdminClient()

  const { data: blockedDates } = await supabase
    .from('blocked_dates')
    .select('*')
    .order('date', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Blokady terminów</h1>
        <p className="text-sm text-gray-500 mb-8">
          Wszystkie przyszłe terminy są domyślnie wolne.
          Tutaj blokujesz konkretne dni (urlop, brak dostępności).
        </p>
        <AdminDatesManager initialDates={blockedDates ?? []} />
      </div>
    </main>
  )
}
