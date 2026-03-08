'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AnulujPage() {
  const [id, setId] = useState('')
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [doneName, setDoneName] = useState('')

  const handleCancel = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/reservations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Błąd')
        setStep('form')
        return
      }
      setDoneName(data.name ?? '')
      setStep('done')
    } catch {
      setError('Błąd połączenia')
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Wróć</Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-100/60 dark:shadow-none border border-gray-100/80 dark:border-gray-800 p-8">

          {step === 'form' && (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">❌</div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Anuluj zgłoszenie</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Wpisz numer zgłoszenia, który znajdziesz w mailu potwierdzającym.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Numer zgłoszenia</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="np. #A1B2C3D4"
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 rounded-xl px-4 py-3 text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  onKeyDown={(e) => { if (e.key === 'Enter' && id.trim()) setStep('confirm') }}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center mb-4">{error}</p>
              )}

              <button
                onClick={() => { setError(''); setStep('confirm') }}
                disabled={!id.trim()}
                className="w-full bg-red-500 text-white rounded-xl py-3 font-semibold hover:bg-red-600 disabled:opacity-40 transition"
              >
                Dalej
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">⚠️</div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Na pewno?</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Zamierzasz anulować zgłoszenie{' '}
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{id.trim().toUpperCase()}</span>.
                </p>
                <p className="text-sm text-red-500 mt-1">Tej operacji nie można cofnąć.</p>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center mb-4">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setError(''); setStep('form') }}
                  className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Wróć
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition"
                >
                  {loading ? 'Anulowanie...' : 'Tak, anuluj'}
                </button>
              </div>
            </>
          )}

          {step === 'done' && (
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Zgłoszenie anulowane</h1>
              {doneName && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Cześć, {doneName} - Twoje zgłoszenie zostało anulowane.</p>
              )}
              <Link
                href="/"
                className="inline-block mt-6 bg-blue-600 text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition"
              >
                Wróć na stronę główną
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
