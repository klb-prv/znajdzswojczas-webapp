'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'email' | 'setup' | 'verify'

export default function AdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [setupData, setSetupData] = useState<{ secret: string; qrUrl: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'check', email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      if (data.mode === 'setup') {
        setSetupData({ secret: data.secret, qrUrl: data.qrUrl })
        setStep('setup')
      } else {
        setStep('verify')
      }
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'verify', email, code }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-xl font-bold text-gray-900">Panel admina</h1>
          <p className="text-xs text-gray-500 mt-1">
            {step === 'email' && 'Zaloguj się emailem i kodem 2FA'}
            {step === 'setup' && 'Pierwsze logowanie -skonfiguruj 2FA'}
            {step === 'verify' && 'Wprowadź kod z aplikacji uwierzytelniającej'}
          </p>
        </div>

        {/* Step 1: email */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Adres email administratora</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 border border-red-100">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Sprawdzanie…' : 'Dalej →'}
            </button>
          </form>
        )}

        {/* Step 2a: first-time TOTP setup */}
        {step === 'setup' && setupData && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Konfiguracja 2FA (jednorazowa)</p>
              <p>Zeskanuj kod QR aplikacją uwierzytelniającą, np. Google Authenticator lub Authy.</p>
            </div>

            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setupData.qrUrl}
                alt="Kod QR do 2FA"
                width={192}
                height={192}
                className="rounded-xl border border-gray-200 p-2"
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Klucz ręczny (jeśli nie możesz zeskanować)</p>
              <p className="font-mono text-sm font-bold tracking-widest text-gray-800 break-all select-all">
                {setupData.secret}
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Wpisz kod z aplikacji (6 cyfr) aby potwierdzić</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 border border-red-100">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Weryfikacja…' : 'Potwierdź i zaloguj się'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2b: TOTP verify */}
        {step === 'verify' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Kod 2FA z aplikacji (6 cyfr)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 border border-red-100">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Logowanie…' : 'Zaloguj się'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); setError('') }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 transition py-1"
            >
              ← Zmień adres email
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
