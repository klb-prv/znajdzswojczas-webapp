import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminRodoExport from '@/components/AdminRodoExport'

export default async function AdminRodoPage() {
  const supabase = createAdminClient()

  const { data: reservations } = await supabase
    .from('reservations')
    .select('id, name, email, topic, status, date, created_at, reservation_number, client_ip')
    .order('email', { ascending: true })

  // Group by email, extract discord nick from topic
  const byEmail: Record<string, {
    name: string
    email: string
    discordNick: string | null
    reservations: { id: string; reservationNumber: string; date: string; topic: string; status: string; createdAt: string; clientIp: string | null }[]
  }> = {}

  for (const r of (reservations ?? [])) {
    const discordMatch = (r.topic as string).match(/\[Kontakt: Discord -(.+?)\]/)
    const discordNick = discordMatch ? discordMatch[1].trim() : null

    if (!byEmail[r.email]) {
      byEmail[r.email] = {
        name: r.name,
        email: r.email,
        discordNick,
        reservations: [],
      }
    }
    // update discord nick if found
    if (discordNick && !byEmail[r.email].discordNick) {
      byEmail[r.email].discordNick = discordNick
    }

    byEmail[r.email].reservations.push({
      id: r.id,
      reservationNumber: r.reservation_number ?? (r.id as string).slice(0, 8).toUpperCase(),
      date: r.date,
      topic: (r.topic as string).replace(/ ?\[Kontakt: Discord -.+?\]$/, '').trim(),
      status: r.status,
      createdAt: r.created_at,
      clientIp: r.client_ip ?? null,
    })
  }

  const entries = Object.values(byEmail)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition border border-gray-200 rounded-xl px-3 py-1.5 bg-white shadow-sm hover:shadow"
          >
            ← Panel admina
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">RODO - Dane użytkowników</h1>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Lista wszystkich osób, które złożyły zgłoszenie. Eksport dostępny w formacie JSON zgodnym z RODO (art. 20 RODO - prawo do przenoszenia danych).
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Imię i nazwisko', 'Email', 'Discord', 'Zgłoszenia', 'Eksport RODO'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.email} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{entry.name}</td>
                  <td className="px-4 py-3 text-gray-600">{entry.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {entry.discordNick
                      ? <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-mono">{entry.discordNick}</span>
                      : <span className="text-gray-300 text-xs">-</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {entry.reservations.length} {entry.reservations.length === 1 ? 'zgłoszenie' : 'zgłoszeń'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminRodoExport entry={entry} />
                  </td>
                </tr>
              ))}
              {!entries.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Brak danych</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
