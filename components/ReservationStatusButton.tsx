'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface ReservationStatus {
  id: string
  name: string
  topic: string
  description: string
  status: string
  statusLabel: string
  statusEmoji: string
  date: string
  notes: string | null
  finalPrice: number | null
  reservationNumber: string
}

const STATUS_COLORS: Record<string, string> = {
  pending_confirmation: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  confirmed:            'bg-green-50 border-green-200 text-green-800',
  rescheduled:          'bg-blue-50 border-blue-200 text-blue-800',
  cancelled:            'bg-red-50 border-red-200 text-red-800',
  awaiting_payment:     'bg-emerald-50 border-emerald-200 text-emerald-800',
  in_progress:          'bg-blue-50 border-blue-200 text-blue-800',
}

export default function ReservationStatusButton() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [idInput, setIdInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReservationStatus | null>(null)

  useEffect(() => {
    const checkId = searchParams.get('check')
    if (!checkId) return
    setIdInput(checkId)
    setOpen(true)
    // auto-submit
    fetch('/api/reservations/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: checkId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setResult(data)
      })
      .catch(() => setError('Błąd połączenia.'))
    // remove ?check= from URL without reload
    const url = new URL(window.location.href)
    url.searchParams.delete('check')
    router.replace(url.pathname + (url.search || ''), { scroll: false })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch('/api/reservations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Błąd')
        return
      }
      setResult(data)
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setIdInput('')
    setError('')
    setResult(null)
  }

  const shortId = result?.reservationNumber ?? ''

  return (
    <>
      {/* Trigger button -top-left fixed */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg shadow-blue-200 transition"
      >
        Status zgłoszenia
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 relative">
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>

            {!result ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">📋</div>
                  <h2 className="text-xl font-bold text-gray-900">Sprawdź status zgłoszenia</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Wpisz ID zgłoszenia, z maila potwierdzajaącego
                  </p>
                </div>

                <form onSubmit={handleCheck} className="space-y-4">
                  <input
                    type="text"
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !idInput.trim()}
                    className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {loading ? 'Sprawdzanie…' : 'Sprawdź status'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-5">
                  <div className="text-4xl mb-2">{result.statusEmoji}</div>
                  <h2 className="text-xl font-bold text-gray-900">{result.statusLabel}</h2>
                  <p className="text-sm text-gray-500 mt-1">{result.name}</p>
                </div>

                <div className={`rounded-xl border p-4 mb-4 ${STATUS_COLORS[result.status] ?? 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                  <p className="text-sm font-semibold mb-1">{result.topic}</p>
                  <p className="text-xs leading-relaxed line-clamp-4">{result.description}</p>
                  <p className="text-xs mt-2 opacity-70">
                    o nr <strong>{shortId}</strong>
                    {result.date && (
                      <> · {format(new Date(result.date), 'd MMMM yyyy', { locale: pl })}</>
                    )}
                  </p>
                </div>

                {result.notes && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 mb-4">
                    ℹ️ {result.notes}
                  </p>
                )}

                {result.status === 'awaiting_payment' && result.finalPrice != null && (
                  <div className="bg-green-600 text-white rounded-xl p-4 mb-4 text-center">
                    <p className="text-xs opacity-80 mb-1">Do zapłaty</p>
                    <p className="text-2xl font-bold">
                      {result.finalPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
                    </p>
                  </div>
                )}

                <button
                  onClick={() => { setResult(null); setIdInput('') }}
                  className="w-full border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition"
                >
                  Sprawdź inne zgłoszenie
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
