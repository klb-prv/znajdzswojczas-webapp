'use client'

interface Reservation {
  id: string
  reservationNumber: string
  date: string
  topic: string
  status: string
  createdAt: string
  clientIp: string | null
}

interface Entry {
  name: string
  email: string
  discordNick: string | null
  reservations: Reservation[]
}

interface Props {
  entry: Entry
}

export default function AdminRodoExport({ entry }: Props) {
  const handleExport = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      gdpr_basis: 'Art. 20 RODO - prawo do przenoszenia danych',
      subject: {
        name: entry.name,
        email: entry.email,
        ...(entry.discordNick ? { discord_nick: entry.discordNick } : {}),
      },
      reservations: entry.reservations.map((r) => ({
        reservation_number: `#${r.reservationNumber}`,
        id: r.id,
        date: r.date,
        topic: r.topic,
        status: r.status,
        submitted_at: r.createdAt,
        ...(r.clientIp ? { client_ip: r.clientIp } : {}),
      })),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rodo_${entry.email.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition"
    >
      ⬇️ Eksportuj
    </button>
  )
}
