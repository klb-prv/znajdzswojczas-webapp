'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface PromoCodeItem {
  id: string
  code: string
  client_discount_rate: number
  affiliate_commission_rate: number
  status: string
  usage_count: number
}

export interface DiscountAssignmentItem {
  id: string
  code: string
  discount_type: string
  discount_value: number
  affiliate_commission_rate: number
  used_count: number
  active: boolean
}

interface Props {
  selfCode: PromoCodeItem | null
  adminPromoCodes: PromoCodeItem[]
  discountAssignments: DiscountAssignmentItem[]
  selfCodeDiscountPercent: number
}

const PROMO_STATUS: Record<string, { label: string; className: string }> = {
  active:   { label: 'Aktywny',    className: 'bg-green-100 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  inactive: { label: 'Nieaktywny', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  archived: { label: 'Archiwalny', className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 dark:bg-[#7C5CFC]/15 dark:text-[#9277FF] dark:border-[#7C5CFC]/30 dark:hover:bg-[#7C5CFC]/25 transition whitespace-nowrap"
    >
      {copied ? '✓ Skopiowano' : '📋 Kopiuj'}
    </button>
  )
}

function PromoCodeCard({ item, badge, onEdit }: { item: PromoCodeItem; badge?: React.ReactNode; onEdit?: () => void }) {
  const s = PROMO_STATUS[item.status] ?? PROMO_STATUS.inactive
  return (
    <div className="bg-gray-50 dark:bg-[#15151A] border border-gray-200 dark:border-[#25252D] rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono font-bold text-gray-900 dark:text-[#F5F5F7] text-lg break-all">{item.code}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.className}`}>{s.label}</span>
            {badge}
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400 dark:text-[#555]">
            <span>Zniżka klienta: <strong className="text-gray-600 dark:text-[#9A9AA3]">{item.client_discount_rate}%</strong></span>
            <span>Twoja prowizja: <strong className="text-gray-600 dark:text-[#9A9AA3]">{item.affiliate_commission_rate}%</strong></span>
            <span>Użycia: <strong className="text-gray-600 dark:text-[#9A9AA3]">{item.usage_count}</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 dark:bg-[#15151A] dark:text-[#9A9AA3] dark:border-[#25252D] dark:hover:bg-[#1c1c22] transition whitespace-nowrap"
            >
              ✏️ Edytuj
            </button>
          )}
          <CopyCodeButton code={item.code} />
        </div>
      </div>
    </div>
  )
}

export default function AffiliateCodesClient({ selfCode, adminPromoCodes, discountAssignments, selfCodeDiscountPercent }: Props) {
  const router = useRouter()
  const [newCode, setNewCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [showEditModal, setShowEditModal] = useState(false)
  const [editCodeInput, setEditCodeInput] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  const openEditModal = () => {
    setEditCodeInput('')
    setEditError('')
    setShowEditModal(true)
  }

  const handleEditCode = async () => {
    if (!selfCode) return
    const code = editCodeInput.trim().toUpperCase()
    if (code.length < 4) return
    setEditLoading(true)
    setEditError('')
    try {
      const res = await fetch('/api/affiliate/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selfCode.id, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEditError(data.error ?? 'Nie udało się zmienić kodu')
        return
      }
      setShowEditModal(false)
      router.refresh()
    } catch {
      setEditError('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = newCode.trim().toUpperCase()
    if (!code) return
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/affiliate/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error ?? 'Nie udało się utworzyć kodu')
        return
      }
      setNewCode('')
      router.refresh()
    } catch {
      setCreateError('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">🎟️ Moje kody</h1>

      {/* Twój kod promocyjny */}
      <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F7] mb-1">Twój kod promocyjny</h2>
        <p className="text-sm text-gray-500 dark:text-[#9A9AA3] mb-4">
          {selfCode
            ? 'Udostępniaj ten kod klientom. Każdy użyty kod generuje prowizję przypisaną do Twojego konta.'
            : `Możesz utworzyć jeden własny kod promocyjny z ${selfCodeDiscountPercent}% zniżki dla klienta.`}
        </p>

        {selfCode ? (
          <div className="space-y-3">
            <PromoCodeCard
              item={selfCode}
              onEdit={openEditModal}
              badge={<span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-100 text-violet-700 dark:bg-[#7C5CFC]/15 dark:text-[#9277FF]">Twój kod</span>}
            />
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCode}
                onChange={(e) => { setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setCreateError('') }}
                placeholder="np. MARCIN15"
                maxLength={20}
                className="flex-1 min-w-0 bg-gray-50 dark:bg-[#15151A] border border-gray-200 dark:border-[#25252D] rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-[#7C5CFC] transition"
              />
              <button
                type="submit"
                disabled={creating || newCode.trim().length < 4}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 dark:bg-[#7C5CFC] dark:hover:bg-[#9277FF] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap"
              >
                {creating ? 'Tworzenie…' : `Utwórz kod −${selfCodeDiscountPercent}%`}
              </button>
            </div>
            {createError && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-3 py-2">{createError}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-[#555]">
              Tylko litery i cyfry, 4–20 znaków. Kod jest unikalny w całym serwisie.
            </p>
          </form>
        )}
      </div>

      {/* Kody promocyjne dodane przez admina */}
      {adminPromoCodes.length > 0 && (
        <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F7]">Kody promocyjne administratora</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">tylko odczyt</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-[#9A9AA3] mb-4">
            Te kody zostały utworzone przez administratora dla Twojego konta.
          </p>
          <div className="space-y-3">
            {adminPromoCodes.map((c) => (
              <PromoCodeCard key={c.id} item={c} />
            ))}
          </div>
        </div>
      )}

      {/* Przypisane kody rabatowe */}
      <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F7]">Przypisane kody rabatowe</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">tylko odczyt</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-[#9A9AA3] mb-4">
          Kody rabatowe przypisane do Twojego konta przez administratora.
        </p>

        {discountAssignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#25252D]">
                  {['Kod', 'Zniżka', 'Twoja prowizja', 'Użycia', 'Akcje'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-gray-400 dark:text-[#555] font-medium text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {discountAssignments.map((a) => {
                  const discLabel = a.discount_type === 'percent' ? `${a.discount_value}%` : `${a.discount_value} zł`
                  return (
                    <tr key={a.id} className="border-b border-gray-100 dark:border-[#25252D]/50">
                      <td className="px-3 py-2.5 font-mono font-medium text-gray-900 dark:text-[#F5F5F7] whitespace-nowrap">
                        {a.code}
                        {!a.active && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">nieaktywny</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 dark:text-[#9A9AA3]">{discLabel}</td>
                      <td className="px-3 py-2.5 text-gray-600 dark:text-[#9A9AA3]">{a.affiliate_commission_rate}%</td>
                      <td className="px-3 py-2.5 text-gray-400 dark:text-[#555]">{a.used_count}</td>
                      <td className="px-3 py-2.5">
                        <CopyCodeButton code={a.code} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-[#555] text-sm">
            Nie masz jeszcze przypisanych kodów rabatowych.
          </div>
        )}
      </div>

      {/* Modal: zmiana własnego kodu */}
      {showEditModal && selfCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false) }}
        >
          <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">✏️</div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-[#F5F5F7]">Zmień swój kod promocyjny</h2>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                Zmiana działa <strong>niezwłocznie</strong>. Poprzedni kod{' '}
                <span className="font-mono font-bold">{selfCode.code}</span> zostanie{' '}
                <strong>unieważniony</strong> i klienci próbujący go użyć nie otrzymają zniżki.
                Dotychczas naliczone prowizje pozostają bez zmian.
              </p>
            </div>

            <label className="block text-xs text-gray-500 dark:text-[#9A9AA3] mb-1.5">Nowy kod</label>
            <input
              type="text"
              value={editCodeInput}
              onChange={(e) => { setEditCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setEditError('') }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleEditCode())}
              placeholder="np. NOWYKOD15"
              maxLength={20}
              autoFocus
              className="w-full mb-3 bg-gray-50 dark:bg-[#15151A] border border-gray-200 dark:border-[#25252D] rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-[#7C5CFC] transition"
            />

            {editError && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-3 py-2 mb-3">{editError}</p>
            )}

            <p className="text-sm text-gray-600 dark:text-[#9A9AA3] text-center mb-4">Czy chcesz kontynuować?</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 border border-gray-200 dark:border-[#25252D] text-gray-600 dark:text-[#9A9AA3] rounded-xl py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-[#15151A] transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleEditCode}
                disabled={editLoading || editCodeInput.trim().length < 4 || editCodeInput.trim().toUpperCase() === selfCode.code}
                className="flex-1 bg-violet-600 hover:bg-violet-700 dark:bg-[#7C5CFC] dark:hover:bg-[#9277FF] text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition"
              >
                {editLoading ? 'Zmieniam…' : 'Zmień kod'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
