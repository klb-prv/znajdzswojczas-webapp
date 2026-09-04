'use client'

import { useState } from 'react'

interface Props {
  available: number
}

export default function AffiliatePayoutButton({ available }: Props) {
  const [show, setShow] = useState(false)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const minPayout = 10
  const canRequest = available >= minPayout

  const handleSubmit = async () => {
    const parsed = parseFloat(amount.replace(',', '.'))
    if (isNaN(parsed) || parsed < minPayout || parsed > available) {
      setError(`Kwota musi wynosić od ${minPayout} do ${available.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł`)
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/affiliate/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      setSuccess(true)
      setShow(false)
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => { setAmount(minPayout.toString()); setError(''); setSuccess(false); setShow(true) }}
        disabled={!canRequest}
        className="px-6 py-3 bg-[#7C5CFC] hover:bg-[#9277FF] text-white rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        💸 Zleć wypłatę
      </button>

      {success && (
        <p className="text-sm text-emerald-400 mt-3">Wypłata została zlecona. Oczekuj na realizację.</p>
      )}

      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShow(false) }}
        >
          <div className="bg-[#111114] rounded-2xl border border-[#25252D] w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">💸</div>
              <h2 className="text-lg font-bold text-[#F5F5F7]">Zleć wypłatę</h2>
              <p className="text-sm text-[#9A9AA3] mt-1">
                Dostępne środki: <strong className="text-[#F5F5F7]">{available.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-[#9A9AA3] mb-1.5">Kwota (zł)</label>
              <div className="relative">
                <input
                  type="number"
                  min={minPayout}
                  max={available}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#15151A] border border-[#25252D] rounded-xl px-4 py-3 text-lg font-bold text-center text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] font-medium">zł</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl px-3 py-2 text-center mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShow(false)}
                className="flex-1 border border-[#25252D] text-[#9A9AA3] rounded-xl py-2.5 text-sm hover:bg-[#15151A] transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-[#7C5CFC] hover:bg-[#9277FF] text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition"
              >
                {loading ? 'Zlecanie…' : 'Zleć wypłatę'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
