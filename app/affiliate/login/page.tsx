'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AffiliateLoginPage() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/affiliate/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      router.push('/affiliate')
      router.refresh()
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#09090B] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✦</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F7]">znajdźswójczas.pl</h1>
          <p className="text-sm text-gray-600 dark:text-[#9A9AA3] mt-1">Program afiliacyjny</p>
        </div>

        <div className="bg-white dark:bg-[#111114] rounded-2xl border border-gray-200 dark:border-[#25252D] p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#F5F5F7] mb-6">Zaloguj się</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-[#9A9AA3] mb-1.5">Login</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="username"
                className="w-full bg-gray-100 dark:bg-[#15151A] border border-gray-200 dark:border-[#25252D] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-[#F5F5F7] placeholder-gray-400 dark:placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-[#7C5CFC] transition"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-[#9A9AA3] mb-1.5">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-gray-100 dark:bg-[#15151A] border border-gray-200 dark:border-[#25252D] rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-[#F5F5F7] placeholder-gray-400 dark:placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-[#7C5CFC] transition"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !login.trim() || !password}
              className="w-full bg-violet-600 hover:bg-violet-700 dark:bg-[#7C5CFC] dark:hover:bg-[#9277FF] text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Logowanie…' : 'Zaloguj się →'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-gray-400 dark:text-[#555] hover:text-gray-600 dark:text-[#9A9AA3] transition">
            ← Wróć na stronę główną
          </Link>
        </div>
      </div>
    </main>
  )
}
