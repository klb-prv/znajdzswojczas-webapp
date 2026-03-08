'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  reservationId: string
  currentPrice: number
}

export default function AdminCorrectPrice({ reservationId, currentPrice }: Props) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [price, setPrice] = useState(currentPrice.toFixed(2))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const parsed = parseFloat(price.replace(',', '.'))
    if (isNaN(parsed) || parsed <= 0) { setError('Podaj prawidłową kwotę'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'correct_price', final_price: parsed }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Błąd'); return }
      setShow(false)
      router.refresh()
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => { setPrice(currentPrice.toFixed(2)); setError(''); setShow(true) }}
        className="border border-pink-200 text-pink-600 rounded-lg px-2.5 py-1 text-xs font-medium hover:bg-pink-50 transition"
      >
        ✏️ Korekta
      </button>

      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShow(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">✏️</div>
              <h2 className="text-lg font-bold text-gray-900">Korekta ceny</h2>
              <p className="text-sm text-gray-500 mt-1">
                Aktualna kwota: <strong>{currentPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">Nowa kwota (zł)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">zł</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShow(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-pink-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-pink-700 disabled:opacity-50 transition"
              >
                {loading ? 'Zapisywanie…' : 'Zapisz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
