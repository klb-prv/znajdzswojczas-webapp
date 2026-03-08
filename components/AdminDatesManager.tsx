'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlockedDate } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'

interface Props {
  initialDates: BlockedDate[]
}

const blockTypeLabels: Record<string, { label: string; color: string; emoji: string }> = {
  vacation: { label: 'Urlop', color: 'bg-yellow-100 text-yellow-700', emoji: '🏖️' },
  manual:   { label: 'Blokada', color: 'bg-red-100 text-red-600',    emoji: '🔒' },
}

const today = new Date().toISOString().split('T')[0]

export default function AdminDatesManager({ initialDates }: Props) {
  const router = useRouter()
  const [dates, setDates] = useState(initialDates)
  const [blockType, setBlockType] = useState<'vacation' | 'manual'>('manual')
  // single date (manual)
  const [newDate, setNewDate] = useState('')
  // vacation range
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [reason, setReason]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const isVacation = blockType === 'vacation'

  const canSubmit = isVacation ? (!!dateFrom && !!dateTo) : !!newDate

  const addDate = async () => {
    if (!canSubmit) return
    setError('')
    setLoading(true)
    try {
      const body = isVacation
        ? { date_from: dateFrom, date_to: dateTo, block_type: 'vacation', reason: reason || undefined }
        : { date: newDate, block_type: 'manual', reason: reason || undefined }

      const res = await fetch('/api/admin/dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      // API returns array for range, single object for single date
      const newRows: BlockedDate[] = Array.isArray(data) ? data : [data]
      setDates((prev) =>
        [...prev, ...newRows]
          .filter((d, i, arr) => arr.findIndex((x) => x.id === d.id) === i)
          .sort((a, b) => a.date.localeCompare(b.date))
      )
      setNewDate('')
      setDateFrom('')
      setDateTo('')
      setReason('')
      router.refresh()
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  const deleteDate = async (id: string) => {
    const res = await fetch(`/api/admin/dates?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDates((prev) => prev.filter((d) => d.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Dodaj blokadę</h2>

        {/* Typ blokady */}
        <div className="flex gap-3">
          {(['manual', 'vacation'] as const).map((t) => {
            const meta = blockTypeLabels[t]
            return (
              <button
                key={t}
                type="button"
                onClick={() => setBlockType(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition
                  ${blockType === t
                    ? t === 'vacation'
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                      : 'bg-red-50 border-red-300 text-red-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
              >
                <span>{meta.emoji}</span> {meta.label}
              </button>
            )
          })}
        </div>

        {/* Date picker(s) */}
        {isVacation ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Zakres urlopu</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Od</label>
                <input
                  type="date"
                  value={dateFrom}
                  min={today}
                  onChange={(e) => {
                    setDateFrom(e.target.value)
                    if (dateTo && e.target.value > dateTo) setDateTo('')
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Do</label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || today}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
            {dateFrom && dateTo && (
              <p className="text-xs text-yellow-600">
                🏖️ Zakres: {format(parseISO(dateFrom), 'd MMM', { locale: pl })} – {format(parseISO(dateTo), 'd MMM yyyy', { locale: pl })}
              </p>
            )}
          </div>
        ) : (
          <input
            type="date"
            value={newDate}
            min={today}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Powód (opcjonalnie)..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={addDate}
          disabled={loading || !canSubmit}
          className={`w-full py-2.5 rounded-xl text-sm font-medium text-white transition disabled:opacity-40 ${
            isVacation ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-900 hover:bg-gray-700'
          }`}
        >
          {loading ? '...' : isVacation ? '🏖️ Zablokuj urlop' : '🔒 Zablokuj dzień'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-700">Zablokowane terminy ({dates.length})</h2>
        </div>
        {dates.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Brak blokad -wszystkie terminy są wolne</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {dates.map((d) => {
              const meta = blockTypeLabels[d.block_type] ?? blockTypeLabels.manual
              return (
                <li key={d.id} className="flex items-center justify-between px-6 py-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                      {meta.emoji} {meta.label}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {format(parseISO(d.date), 'EEEE, d MMMM yyyy', { locale: pl })}
                      </p>
                      {d.reason && (
                        <p className="text-xs text-gray-400 truncate">{d.reason}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDate(d.id)}
                    className="shrink-0 text-xs text-red-500 hover:text-red-700 transition"
                  >
                    Usuń
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
