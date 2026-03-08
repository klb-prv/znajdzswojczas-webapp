'use client'

import { useState } from 'react'
import type { SiteStatus } from '@/lib/types'

const OPTIONS: {
  value: SiteStatus
  label: string
  desc: string
  activeClass: string
  dotClass: string
}[] = [
  {
    value: 'accepting',
    label: 'Przyjmujemy zgłoszenia',
    desc: 'Formularz rezerwacji jest aktywny',
    activeClass: 'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-300 shadow-md',
    dotClass: 'bg-blue-400',
  },
  {
    value: 'maintenance',
    label: 'Przerwa techniczna',
    desc: 'Formularz tymczasowo wyłączony',
    activeClass: 'bg-amber-500 border-amber-500 text-white ring-2 ring-amber-300 shadow-md',
    dotClass: 'bg-amber-400',
  },
  {
    value: 'closed',
    label: 'Zgłoszenia zablokowane',
    desc: 'Nowe rezerwacje są wyłączone',
    activeClass: 'bg-red-600 border-red-600 text-white ring-2 ring-red-300 shadow-md',
    dotClass: 'bg-red-400',
  },
]

interface Props {
  initialStatus: SiteStatus
}

export default function AdminStatusSwitcher({ initialStatus }: Props) {
  const [status, setStatus] = useState<SiteStatus>(initialStatus)
  const [saving, setSaving] = useState(false)
  const [pending, setPending] = useState<SiteStatus | null>(null)

  const requestChange = (newStatus: SiteStatus) => {
    if (newStatus === status || saving) return
    setPending(newStatus)
  }

  const confirmChange = async () => {
    if (!pending) return
    const newStatus = pending
    setPending(null)
    setSaving(true)
    setStatus(newStatus)
    await fetch('/api/admin/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setSaving(false)
  }

  const cancelChange = () => setPending(null)

  const pendingOption = OPTIONS.find((o) => o.value === pending)
  const currentOption = OPTIONS.find((o) => o.value === status)

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Status serwisu</h2>
          {saving && <span className="text-xs text-gray-400 animate-pulse">Zapisywanie…</span>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {OPTIONS.map((o) => {
            const active = status === o.value
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => requestChange(o.value)}
                disabled={saving}
                className={`flex-1 flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer select-none
                  ${active
                    ? o.activeClass
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-white'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${active ? 'bg-white opacity-80' : o.dotClass}`} />
                  {o.label}
                </span>
                <span className={`text-xs pl-4 ${active ? 'opacity-75' : 'text-gray-400'}`}>
                  {o.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Confirmation modal */}
      {pending && pendingOption && currentOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={cancelChange}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="text-2xl leading-none mt-0.5">⚠️</div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Zmiana statusu serwisu</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Czy na pewno chcesz zmienić status z{' '}
                  <strong className="text-gray-700">{currentOption.label}</strong> na{' '}
                  <strong className="text-gray-700">{pendingOption.label}</strong>?
                </p>
                {pending !== 'accepting' && (
                  <p className="text-xs text-red-500 mt-2 bg-red-50 rounded-lg px-3 py-2">
                    {pending === 'maintenance'
                      ? 'Użytkownicy nie będą mogli składać nowych zgłoszeń.'
                      : 'Przyjmowanie nowych rezerwacji zostanie całkowicie wstrzymane.'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelChange}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Anuluj
              </button>
              <button
                onClick={confirmChange}
                className={`flex-1 py-2 rounded-xl text-sm font-medium text-white transition ${
                  pending === 'accepting'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : pending === 'maintenance'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Tak, zmień
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
