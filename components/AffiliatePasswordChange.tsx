'use client'

import { useState } from 'react'

interface Check {
  label: string
  ok: boolean
}

export default function AffiliatePasswordChange() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const checks: Check[] = [
    { label: 'Minimum 12 znaków', ok: next.length >= 12 },
    { label: 'Co najmniej 1 wielka litera', ok: /[A-Z]/.test(next) },
    { label: 'Co najmniej 2 cyfry', ok: (next.match(/\d/g) ?? []).length >= 2 },
    { label: 'Co najmniej 3 znaki specjalne', ok: (next.match(/[^A-Za-z0-9]/g) ?? []).length >= 3 },
  ]
  const allOk = checks.every((c) => c.ok)
  const matchesConfirm = next.length > 0 && next === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allOk || !matchesConfirm || !current) return
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/affiliate/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: current, new_password: next }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Nie udało się zmienić hasła')
        return
      }
      setCurrent('')
      setNext('')
      setConfirm('')
      setSuccess(true)
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full bg-gray-50 dark:bg-[#15151A] border border-gray-200 dark:border-[#25252D] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-[#7C5CFC] transition'

  return (
    <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-6">
      <h2 className="text-sm font-bold text-gray-900 dark:text-[#F5F5F7] mb-1">🔐 Zmiana hasła</h2>
      <p className="text-xs text-gray-400 dark:text-[#555] mb-4">
        Podaj obecne hasło, aby potwierdzić tożsamość. Nowe hasło musi spełniać wszystkie wymagania.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-[#9A9AA3] mb-1.5">Obecne hasło</label>
          <input
            type={show ? 'text' : 'password'}
            value={current}
            onChange={(e) => { setCurrent(e.target.value); setSuccess(false) }}
            autoComplete="current-password"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-[#9A9AA3] mb-1.5">Nowe hasło</label>
          <input
            type={show ? 'text' : 'password'}
            value={next}
            onChange={(e) => { setNext(e.target.value); setSuccess(false) }}
            autoComplete="new-password"
            className={inputCls}
          />
          <label className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-400 dark:text-[#555] cursor-pointer select-none">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="w-3 h-3 accent-violet-600" />
            Pokaż hasła
          </label>
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-[#9A9AA3] mb-1.5">Powtórz nowe hasło</label>
          <input
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setSuccess(false) }}
            autoComplete="new-password"
            className={inputCls}
          />
          {confirm.length > 0 && !matchesConfirm && (
            <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">Hasła nie są identyczne</p>
          )}
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          {checks.map((c) => (
            <li key={c.label} className={`flex items-center gap-1.5 text-[11px] ${c.ok ? 'text-green-600 dark:text-emerald-400' : 'text-gray-400 dark:text-[#555]'}`}>
              <span>{c.ok ? '✓' : '○'}</span>
              {c.label}
            </li>
          ))}
        </ul>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 dark:text-emerald-400 bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-900/50 rounded-xl px-3 py-2">
            ✓ Hasło zostało zmienione. Przy następnym logowaniu użyj nowego hasła.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !current || !allOk || !matchesConfirm}
          className="w-full bg-violet-600 hover:bg-violet-700 dark:bg-[#7C5CFC] dark:hover:bg-[#9277FF] text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Zapisywanie…' : 'Zmień hasło'}
        </button>
      </form>
    </div>
  )
}
