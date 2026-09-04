'use client'

import { useState, useEffect } from 'react'

interface LinkStats {
  clicks: number
  referrals: number
  approved: number
}

export default function AffiliateLinkPage() {
  const [refCode, setRefCode] = useState('')
  const [stats, setStats] = useState<LinkStats>({ clicks: 0, referrals: 0, approved: 0 })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/affiliate/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.referralCode) setRefCode(data.referralCode)
        if (data.stats) setStats(data.stats)
      })
      .catch(() => {})
  }, [])

  const fullUrl = refCode ? `https://znajdzswojczas.pl/?ref=${refCode}` : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-[#F5F5F7]">🔗 Twój link afiliacyjny</h1>

      <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-6 space-y-4">
        <p className="text-sm text-[#9A9AA3]">
          Udostępniaj ten link i otrzymuj prowizję za zakwalifikowane zamówienia.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#15151A] border border-[#25252D] rounded-xl px-4 py-3 text-sm text-[#F5F5F7] font-mono truncate">
            {fullUrl || '…'}
          </div>
          <button
            onClick={handleCopy}
            disabled={!refCode}
            className="px-5 py-3 bg-[#7C5CFC] hover:bg-[#9277FF] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap"
          >
            {copied ? '✓ Skopiowano' : '📋 Kopiuj'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#25252D]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#F5F5F7]">{stats.clicks}</p>
            <p className="text-xs text-[#555]">Kliknięcia</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#F5F5F7]">{stats.referrals}</p>
            <p className="text-xs text-[#555]">Polecenia</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#F5F5F7]">{stats.approved}</p>
            <p className="text-xs text-[#555]">Zatwierdzone</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-[#F5F5F7] mb-3">Jak to działa?</h2>
        <ul className="space-y-2 text-sm text-[#9A9AA3]">
          <li className="flex items-start gap-2">
            <span className="text-[#7C5CFC] mt-0.5">1.</span>
            Udostępnij swój link afiliacyjny.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7C5CFC] mt-0.5">2.</span>
            Klient przechodzi na stronę i składa zamówienie.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7C5CFC] mt-0.5">3.</span>
            Po zrealizowaniu i opłaceniu usługi otrzymujesz prowizję.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#7C5CFC] mt-0.5">4.</span>
            Prowizję możesz wypłacić po osiągnięciu minimalnej kwoty (100 zł).
          </li>
        </ul>
      </div>
    </div>
  )
}
