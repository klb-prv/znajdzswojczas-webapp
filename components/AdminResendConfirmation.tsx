'use client'

import { useState } from 'react'

interface Props {
  reservationId: string
  email: string
  status?: string
}

export default function AdminResendConfirmation({ reservationId, email, status }: Props) {
  const isPayment = status === 'awaiting_payment'
  const isPaid = status === 'paid'
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/resend-confirmation`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Błąd')
        return
      }
      setSent(true)
      setShowDialog(false)
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => { setSent(false); setError(''); setShowDialog(true) }}
        className="w-full border border-blue-200 text-blue-600 rounded-lg py-2 text-sm font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2"
      >
        {isPaid
          ? '✅ Wyślij potwierdzenie zapłaty / realizacji'
          : isPayment
          ? '💳 Wyślij przypomnienie o zapłacie'
          : '✉️ Wyślij ponownie potwierdzenie'}
      </button>

      {sent && (
        <p className="text-xs text-green-600 text-center mt-1">✓ Mail został wysłany</p>
      )}

      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDialog(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">{isPaid ? '✅' : isPayment ? '💳' : '✉️'}</div>
              <h2 className="text-lg font-bold text-gray-900">{isPaid ? 'Wysłać potwierdzenie?' : isPayment ? 'Wysłać przypomnienie?' : 'Wysłać ponownie?'}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isPaid ? 'Potwierdzenie zapłaty i realizacji usługi' : isPayment ? 'Przypomnienie o zapłacie' : 'Potwierdzenie'} zostanie wysłane na adres<br />
                <strong className="text-gray-700">{email}</strong>
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Wysyłanie…' : 'Wyślij'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
