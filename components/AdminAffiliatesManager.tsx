'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface Affiliate {
  id: string
  login: string
  name: string
  referral_code: string
  commission_percent: number
  active: boolean
  created_at: string
}

interface Props {
  affiliates: Affiliate[]
  referralCounts: Record<string, number>
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active:    { label: 'Aktywny',       color: 'bg-green-100 text-green-700' },
  blocked:   { label: 'Zablokowany',   color: 'bg-red-100 text-red-700' },
  archived:  { label: 'Zarchiwizowany', color: 'bg-gray-100 text-gray-500' },
}

function getLoginName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  const suffix = Math.floor(100 + Math.random() * 900)
  return `${base}_${suffix}`
}

function getReferralCode(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  const initials = parts.map((p) => p[0] ?? '').join('').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const num = Math.floor(100 + Math.random() * 900)
  return `${initials}${num}`
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pass = ''
  for (let i = 0; i < 16; i++) pass += chars[Math.floor(Math.random() * chars.length)]
  return pass
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function AdminAffiliatesManager({ affiliates, referralCounts }: Props) {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdData, setCreatedData] = useState<{ name: string; login: string; password: string; referralCode: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editId, setEditId] = useState('')
  const [editName, setEditName] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetId, setResetId] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetData, setResetData] = useState<{ login: string; password: string; referralCode: string } | null>(null)
  const [showResetPassword, setShowResetPassword] = useState(false)

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusId, setStatusId] = useState('')
  const [statusAction, setStatusAction] = useState<'block' | 'activate' | 'archive'>('block')
  const [statusLoading, setStatusLoading] = useState(false)

  const handleAdd = async () => {
    if (!newName.trim()) return
    setAddLoading(true)
    setAddError('')
    try {
      const login = getLoginName(newName.trim())
      const password = generatePassword()
      const referralCode = getReferralCode(newName.trim())
      const passwordHash = await hashPassword(password)

      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newName.trim(),
          login,
          password_hash: passwordHash,
          referral_code: referralCode,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddError(data.error ?? 'Błąd')
        return
      }
      setCreatedData({ name: newName.trim(), login, password, referralCode })
      setShowAddModal(false)
      setShowSuccessModal(true)
      setNewName('')
      router.refresh()
    } catch {
      setAddError('Błąd połączenia')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editName.trim()) return
    setEditLoading(true)
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit_name', id: editId, name: editName.trim() }),
      })
      if (!res.ok) return
      setShowEditModal(false)
      router.refresh()
    } catch {} finally {
      setEditLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setResetLoading(true)
    try {
      const password = generatePassword()
      const passwordHash = await hashPassword(password)
      const aff = affiliates.find((a) => a.id === resetId)
      const res = await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', id: resetId, password_hash: passwordHash }),
      })
      if (!res.ok) return
      setResetData({ login: aff?.login ?? '', password, referralCode: aff?.referral_code ?? '' })
      setShowResetModal(false)
      setShowResetPassword(true)
      setShowResetPassword(true)
    } catch {} finally {
      setResetLoading(false)
    }
  }

  const handleStatusChange = async () => {
    setStatusLoading(true)
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: statusAction, id: statusId }),
      })
      if (!res.ok) return
      setShowStatusModal(false)
      router.refresh()
    } catch {} finally {
      setStatusLoading(false)
    }
  }

  const copyLoginData = (login: string, password: string) => {
    navigator.clipboard.writeText(
      `Panel afiliacyjny:\nhttps://znajdzswojczas.pl/affiliate\n\nLogin: ${login}\nHasło: ${password}`
    )
  }

  const copyAffiliateLink = (code: string) => {
    navigator.clipboard.writeText(`https://znajdzswojczas.pl/?ref=${code}`)
  }

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => { setNewName(''); setAddError(''); setShowAddModal(true) }}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          + Dodaj partnera
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Nazwa', 'Login', 'Kod', 'Status', 'Polecenia', 'Utworzono', 'Akcje'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {affiliates.map((a) => {
              const s = STATUS_MAP[a.active ? 'active' : 'blocked']
              const date = a.created_at ? format(new Date(a.created_at), 'd MMM yyyy', { locale: pl }) : '-'
              const refCount = referralCounts[a.id] ?? 0
              return (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {a.name}
                    {a.login === 'demo' && (
                      <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">Demo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{a.login}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{a.referral_code}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{refCount}</td>
                  <td className="px-4 py-3 text-gray-500">{date}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Link
                        href={`/admin/affiliates/${a.id}`}
                        className="text-xs px-2.5 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition font-medium"
                      >
                        Podgląd
                      </Link>
                      <button
                        onClick={() => { setEditId(a.id); setEditName(a.name); setShowEditModal(true) }}
                        className="text-xs px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition font-medium"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => copyAffiliateLink(a.referral_code)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium"
                      >
                        📋 Link
                      </button>
                      {a.login !== 'demo' && (
                        <button
                          onClick={() => { setResetId(a.id); setShowResetModal(true) }}
                          className="text-xs px-2.5 py-1 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition font-medium"
                        >
                          🔑 Reset
                        </button>
                      )}
                      {a.login !== 'demo' && (
                        <button
                          onClick={() => { setStatusId(a.id); setStatusAction(a.active ? 'block' : 'activate'); setShowStatusModal(true) }}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                            a.active
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {a.active ? '🔴 Zablokuj' : '🟢 Aktywuj'}
                        </button>
                      )}
                      {a.login !== 'demo' && (
                        <button
                          onClick={() => { setStatusId(a.id); setStatusAction('archive'); setShowStatusModal(true) }}
                          className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition font-medium"
                        >
                          📦 Archiwizuj
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {!affiliates.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Brak partnerów
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {affiliates.map((a) => {
          const s = STATUS_MAP[a.active ? 'active' : 'blocked']
          const date = a.created_at ? format(new Date(a.created_at), 'd MMM yyyy', { locale: pl }) : '-'
          const refCount = referralCounts[a.id] ?? 0
          return (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-semibold text-gray-800 text-sm">{a.name}</span>
                  {a.login === 'demo' && (
                    <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">Demo</span>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${s.color}`}>
                  {s.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">{a.login}</p>
              <p className="text-xs text-gray-500 mt-0.5">{refCount} poleceń · {date}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Link href={`/admin/affiliates/${a.id}`} className="text-xs text-blue-600 font-medium hover:underline">
                  Podgląd →
                </Link>
                <button onClick={() => copyAffiliateLink(a.referral_code)} className="text-xs text-gray-500 hover:text-gray-700">
                  📋 Kopiuj link
                </button>
                <button onClick={() => { setEditId(a.id); setEditName(a.name); setShowEditModal(true) }} className="text-xs text-indigo-600 hover:text-indigo-800">
                  Edytuj
                </button>
              </div>
            </div>
          )
        })}
        {!affiliates.length && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            Brak partnerów
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">👥</div>
              <h2 className="text-lg font-bold text-gray-900">Dodaj partnera</h2>
              <p className="text-sm text-gray-500 mt-1">Podaj imię i nazwisko partnera</p>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Imię i nazwisko / nazwa</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="np. Jan Kowalski"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            {addError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center mb-4">{addError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                Anuluj
              </button>
              <button onClick={handleAdd} disabled={addLoading || !newName.trim()} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {addLoading ? 'Tworzenie…' : 'Utwórz partnera'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSuccessModal && createdData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowSuccessModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">✅</div>
              <h2 className="text-lg font-bold text-gray-900">Partner utworzony</h2>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 text-sm">Nazwa</span>
                <span className="font-medium text-sm text-right">{createdData.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 text-sm">Login</span>
                <span className="font-mono font-medium text-sm text-right">{createdData.login}</span>
              </div>
              <div className="flex justify-between gap-3 items-center">
                <span className="text-gray-500 text-sm">Hasło</span>
                <span className="font-mono font-medium text-sm text-right">
                  {showPassword ? createdData.password : '••••••••••••'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 text-sm">Kod afiliacyjny</span>
                <span className="font-mono font-medium text-sm text-right">{createdData.referralCode}</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-4">
              Hasło jest wyświetlane jednorazowo. Zapisz je lub bezpiecznie przekaż partnerowi.
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="w-full border border-gray-200 text-gray-600 rounded-xl py-2 text-sm hover:bg-gray-50 transition"
              >
                {showPassword ? '🙈 Ukryj hasło' : '👁️ Pokaż hasło'}
              </button>
              <button
                onClick={() => copyLoginData(createdData.login, createdData.password)}
                className="w-full border border-blue-200 text-blue-600 rounded-xl py-2 text-sm font-medium hover:bg-blue-50 transition"
              >
                📋 Kopiuj dane logowania
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
              >
                Gotowe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password success modal */}
      {showResetPassword && resetData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowResetPassword(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🔑</div>
              <h2 className="text-lg font-bold text-gray-900">Hasło zresetowane</h2>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500 text-sm">Login</span>
                <span className="font-mono font-medium text-sm text-right">{resetData.login}</span>
              </div>
              <div className="flex justify-between gap-3 items-center">
                <span className="text-gray-500 text-sm">Nowe hasło</span>
                <span className="font-mono font-medium text-sm text-right">
                  {showResetPassword ? resetData.password : '••••••••••••'}
                </span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-4">
              Nowe hasło jest wyświetlane jednorazowo. Przekaż je partnerowi.
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => copyLoginData(resetData.login, resetData.password)}
                className="w-full border border-blue-200 text-blue-600 rounded-xl py-2 text-sm font-medium hover:bg-blue-50 transition"
              >
                📋 Kopiuj dane logowania
              </button>
              <button
                onClick={() => { setShowResetPassword(false); setShowResetPassword(false) }}
                className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
              >
                Gotowe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit name modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">✏️</div>
              <h2 className="text-lg font-bold text-gray-900">Edytuj nazwę</h2>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Nazwa partnera</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                Anuluj
              </button>
              <button onClick={handleEdit} disabled={editLoading || !editName.trim()} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
                {editLoading ? 'Zapisywanie…' : 'Zapisz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password confirm modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowResetModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🔑</div>
              <h2 className="text-lg font-bold text-gray-900">Resetuj hasło</h2>
              <p className="text-sm text-gray-500 mt-1">Zostanie wygenerowane nowe hasło</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                Anuluj
              </button>
              <button onClick={handleResetPassword} disabled={resetLoading} className="flex-1 bg-amber-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition">
                {resetLoading ? 'Resetowanie…' : 'Resetuj hasło'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status change modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowStatusModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">{statusAction === 'block' ? '🔴' : statusAction === 'activate' ? '🟢' : '📦'}</div>
              <h2 className="text-lg font-bold text-gray-900">
                {statusAction === 'block' ? 'Zablokuj partnera' : statusAction === 'activate' ? 'Aktywuj partnera' : 'Archiwizuj partnera'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {statusAction === 'archive'
                  ? 'Partner zostanie zarchiwizowany. Zachowa historię, ale utraci dostęp.'
                  : statusAction === 'block'
                  ? 'Partner zostanie zablokowany. Nie będzie mógł się logować.'
                  : 'Partner zostanie aktywowany i odzyska dostęp.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowStatusModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                Anuluj
              </button>
              <button
                onClick={handleStatusChange}
                disabled={statusLoading}
                className={`flex-1 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition ${
                  statusAction === 'block' ? 'bg-red-500 hover:bg-red-600'
                  : statusAction === 'activate' ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-700 hover:bg-gray-800'
                }`}
              >
                {statusLoading ? '…' : statusAction === 'block' ? 'Zablokuj' : statusAction === 'activate' ? 'Aktywuj' : 'Archiwizuj'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
