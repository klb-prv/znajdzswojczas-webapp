'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ConfirmPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/reservations/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: id, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      router.push(`/status/${id}`)
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📧</div>
          <h1 className="text-xl font-bold text-gray-900">Potwierdź rezerwację</h1>
          <p className="text-sm text-gray-500 mt-2">
            Wpisz 6-cyfrowy kod, który wysłaliśmy na Twój email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Sprawdzanie...' : 'Potwierdź'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Kod jest ważny przez 30 minut. Sprawdź folder spam jeśli nie widzisz maila.
        </p>
      </div>
    </main>
  )
}
