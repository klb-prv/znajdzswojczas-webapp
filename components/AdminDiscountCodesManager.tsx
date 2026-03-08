'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import type { DiscountCode } from '@/lib/types'

interface Props {
  initialCodes: DiscountCode[]
}

export default function AdminDiscountCodesManager({ initialCodes }: Props) {
  const [codes, setCodes] = useState<DiscountCode[]>(initialCodes)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ discount_type: 'percent' | 'fixed'; discount_value: string }>({
    discount_type: 'percent',
    discount_value: '',
  })
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: '',
    expires_at: '',
    max_uses: '',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: parseInt(form.discount_value),
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      }
      const res = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setCodes((prev) => [data, ...prev])
      setForm({ code: '', discount_type: 'percent', discount_value: '', expires_at: '', max_uses: '' })
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string, active: boolean) => {
    const res = await fetch(`/api/admin/discount-codes?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    if (res.ok) {
      setCodes((prev) => prev.map((c) => c.id === id ? { ...c, active: !active } : c))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Usunąć ten kod zniżkowy?')) return
    await fetch(`/api/admin/discount-codes?id=${id}`, { method: 'DELETE' })
    setCodes((prev) => prev.filter((c) => c.id !== id))
  }

  const handleEditOpen = (c: DiscountCode) => {
    setEditingId(c.id)
    setEditForm({ discount_type: c.discount_type, discount_value: String(c.discount_value) })
    setEditError('')
  }

  const handleEditSave = async (id: string) => {
    setEditError('')
    setEditLoading(true)
    try {
      const res = await fetch(`/api/admin/discount-codes?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discount_type: editForm.discount_type,
          discount_value: parseInt(editForm.discount_value),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setEditError(data.error ?? 'Błąd'); return }
      setCodes((prev) => prev.map((c) => c.id === id ? data : c))
      setEditingId(null)
    } catch {
      setEditError('Błąd połączenia')
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formularz tworzenia */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Nowy kod zniżkowy</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Kod (litery i cyfry)</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="np. LATO2026"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Typ zniżki</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percent' | 'fixed' }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percent">Procentowa (%)</option>
                <option value="fixed">Kwotowa (zł)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Wartość ({form.discount_type === 'percent' ? '%' : 'zł'})
              </label>
              <input
                type="number"
                min="1"
                max={form.discount_type === 'percent' ? '100' : undefined}
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                placeholder={form.discount_type === 'percent' ? 'np. 20' : 'np. 50'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Liczba użyć (puste = ∞)</label>
              <input
                type="number"
                min="1"
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                placeholder="∞ nieograniczone"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Ważny do (puste = zawsze)</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 border border-red-100">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Tworzenie…' : '+ Utwórz kod'}
          </button>
        </form>
      </div>

      {/* Lista kodów */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Kody zniżkowe ({codes.length})</h2>
        </div>
        {codes.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400 text-sm">Brak kodów zniżkowych</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {codes.map((c) => {
              const expired = c.expires_at ? new Date(c.expires_at) < new Date() : false
              const exhausted = c.max_uses !== null && c.used_count >= c.max_uses
              const isEditing = editingId === c.id

              return (
                <div key={c.id} className="px-5 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-gray-800">{c.code}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${c.active && !expired && !exhausted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                          }`}>
                          {!c.active ? 'Nieaktywny' : expired ? 'Wygasł' : exhausted ? 'Wyczerpany' : 'Aktywny'}
                        </span>
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                          {c.discount_type === 'percent' ? `-${c.discount_value}%` : `-${c.discount_value} zł`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 flex gap-3">
                        <span>Użyto: {c.used_count}{c.max_uses !== null ? ` / ${c.max_uses}` : ' / ∞'}</span>
                        {c.expires_at && (
                          <span>Ważny do: {format(new Date(c.expires_at), 'd MMM yyyy HH:mm', { locale: pl })}</span>
                        )}
                        {!c.expires_at && <span>Bez limitu czasu</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => isEditing ? setEditingId(null) : handleEditOpen(c)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition font-medium"
                      >
                        {isEditing ? 'Anuluj' : 'Edytuj'}
                      </button>
                      <button
                        onClick={() => handleToggle(c.id, c.active)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium
                          ${c.active
                            ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                      >
                        {c.active ? 'Wyłącz' : 'Włącz'}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition font-medium"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {isEditing && (
                    <div className="bg-indigo-50 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-medium text-indigo-700">Zmień wartość zniżki</p>
                      <div className="flex items-end gap-2 flex-wrap">
                        <div>
                          <label className="block text-xs text-indigo-600 mb-1">Typ</label>
                          <select
                            value={editForm.discount_type}
                            onChange={(e) => setEditForm((f) => ({ ...f, discount_type: e.target.value as 'percent' | 'fixed' }))}
                            className="border border-indigo-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          >
                            <option value="percent">Procentowa (%)</option>
                            <option value="fixed">Kwotowa (zł)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-indigo-600 mb-1">
                            Wartość ({editForm.discount_type === 'percent' ? '%' : 'zł'})
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={editForm.discount_type === 'percent' ? '100' : undefined}
                            value={editForm.discount_value}
                            onChange={(e) => setEditForm((f) => ({ ...f, discount_value: e.target.value }))}
                            placeholder={editForm.discount_type === 'percent' ? 'np. 20' : 'np. 50'}
                            className="border border-indigo-200 rounded-lg px-2 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                          />
                        </div>
                        <button
                          onClick={() => handleEditSave(c.id)}
                          disabled={editLoading}
                          className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition font-medium"
                        >
                          {editLoading ? 'Zapisywanie…' : 'Zapisz'}
                        </button>
                      </div>
                      {editError && (
                        <p className="text-xs text-red-500">{editError}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
