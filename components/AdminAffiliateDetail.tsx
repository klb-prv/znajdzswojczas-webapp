'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

interface Stats {
  clicks: number
  referrals: number
  paidOrders: number
  totalCommission: number
  pendingCommission: number
  approvedCommission: number
  totalPaid: number
}

interface Referral {
  id: string
  client_label: string
  service_name: string
  order_value: number
  commission_amount: number
  status: string
  created_at: string
}

interface Payout {
  id: string
  amount: number
  status: string
  created_at: string
}

interface PromoCode {
  id: string
  code: string
  client_discount_rate: number
  affiliate_commission_rate: number
  status: string
  usage_count: number
}

interface Props {
  affiliate: Affiliate
  stats: Stats
  referrals: Referral[]
  payouts: Payout[]
  promoCodes: PromoCode[]
}

const REFERRAL_STATUS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Oczekuje',    color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Zatwierdzona', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Odrzucona',   color: 'bg-red-100 text-red-700' },
  paid:     { label: 'Wypłacono',   color: 'bg-emerald-100 text-emerald-700' },
}

const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Oczekuje',   color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'W trakcie',  color: 'bg-blue-100 text-blue-700' },
  completed:  { label: 'Wypłacono',  color: 'bg-green-100 text-green-700' },
  rejected:   { label: 'Odrzucono',  color: 'bg-red-100 text-red-700' },
}

const PROMO_STATUS: Record<string, { label: string; color: string }> = {
  active:   { label: 'Aktywny',     color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Nieaktywny',  color: 'bg-gray-100 text-gray-500' },
  archived: { label: 'Archiwalny',  color: 'bg-gray-100 text-gray-400' },
}

const RATE_OPTIONS = [3, 5, 10]

export default function AdminAffiliateDetail({ affiliate, stats, referrals, payouts, promoCodes }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const [showAddPromoModal, setShowAddPromoModal] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newDiscountRate, setNewDiscountRate] = useState(3)
  const [newCommissionRate, setNewCommissionRate] = useState(3)
  const [addPromoLoading, setAddPromoLoading] = useState(false)
  const [addPromoError, setAddPromoError] = useState('')

  const [showEditRateModal, setShowEditRateModal] = useState(false)
  const [editRateId, setEditRateId] = useState('')
  const [editDiscountRate, setEditDiscountRate] = useState(3)
  const [editCommissionRate, setEditCommissionRate] = useState(3)
  const [editRateLoading, setEditRateLoading] = useState(false)

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const copyLink = () => {
    navigator.clipboard.writeText(`https://znajdzswojczas.pl/?ref=${affiliate.referral_code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const date = affiliate.created_at ? format(new Date(affiliate.created_at), 'd MMMM yyyy', { locale: pl }) : '-'

  const handleAddPromo = async () => {
    if (!newCode.trim()) return
    setAddPromoLoading(true)
    setAddPromoError('')
    try {
      const res = await fetch('/api/admin/affiliate-promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliate_id: affiliate.id,
          code: newCode.trim().toUpperCase(),
          client_discount_rate: newDiscountRate,
          affiliate_commission_rate: newCommissionRate,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddPromoError(data.error ?? 'Błąd')
        return
      }
      setShowAddPromoModal(false)
      setNewCode('')
      setNewDiscountRate(3)
      setNewCommissionRate(3)
      router.refresh()
    } catch {
      setAddPromoError('Błąd połączenia')
    } finally {
      setAddPromoLoading(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    setActionLoading(id)
    try {
      await fetch('/api/admin/affiliate-promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', id }),
      })
      router.refresh()
    } catch {} finally {
      setActionLoading(null)
    }
  }

  const handleArchive = async (id: string) => {
    setActionLoading(id)
    try {
      await fetch('/api/admin/affiliate-promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive', id }),
      })
      router.refresh()
    } catch {} finally {
      setActionLoading(null)
    }
  }

  const handleUpdateRate = async () => {
    setEditRateLoading(true)
    try {
      await fetch('/api/admin/affiliate-promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_rate',
          id: editRateId,
          client_discount_rate: editDiscountRate,
          affiliate_commission_rate: editCommissionRate,
        }),
      })
      setShowEditRateModal(false)
      router.refresh()
    } catch {} finally {
      setEditRateLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Partner info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Dane partnera</h2>
        <div className="space-y-3">
          {[
            ['Nazwa', affiliate.name],
            ['ID', affiliate.id],
            ['Login', affiliate.login],
            ['Kod afiliacyjny', affiliate.referral_code],
            ['Prowizja', `${affiliate.commission_percent}%`],
            ['Status', affiliate.active ? '🟢 Aktywny' : '🔴 Zablokowany'],
            ['Utworzono', date],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <span className="text-gray-500 text-sm flex-shrink-0">{label}</span>
              <span className="font-medium text-sm text-right break-all">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">Link afiliacyjny</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-mono truncate flex-1">
              https://znajdzswojczas.pl/?ref={affiliate.referral_code}
            </span>
            <button
              onClick={copyLink}
              className="text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition font-medium flex-shrink-0"
            >
              {copied ? '✓' : '📋 Kopiuj'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Statystyki</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['👆 Kliknięcia', stats.clicks],
            ['👥 Polecenia', stats.referrals],
            ['📦 Opłacone', stats.paidOrders],
            ['💰 Prowizje', `${stats.totalCommission.toLocaleString('pl-PL')} zł`],
          ].map(([label, value]) => (
            <div key={String(label)} className="text-center">
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          {[
            ['⏳ Oczekujące', `${stats.pendingCommission.toLocaleString('pl-PL')} zł`],
            ['✅ Zatwierdzone', `${stats.approvedCommission.toLocaleString('pl-PL')} zł`],
            ['💸 Wypłacone', `${stats.totalPaid.toLocaleString('pl-PL')} zł`],
          ].map(([label, value]) => (
            <div key={String(label)} className="text-center">
              <p className="text-sm font-bold text-gray-700">{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Promo codes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">🎟️ Kody promocyjne</h2>
          <button
            onClick={() => { setNewCode(''); setNewDiscountRate(3); setNewCommissionRate(3); setAddPromoError(''); setShowAddPromoModal(true) }}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
          >
            + Dodaj kod
          </button>
        </div>
        {promoCodes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Kod', 'Zniżka', 'Prowizja', 'Status', 'Użycia', 'Akcje'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((pc) => {
                  const s = PROMO_STATUS[pc.status] ?? PROMO_STATUS.inactive
                  return (
                    <tr key={pc.id} className="border-b border-gray-50">
                      <td className="px-3 py-2.5 font-mono font-medium text-gray-800">{pc.code}</td>
                      <td className="px-3 py-2.5 text-gray-600">{pc.client_discount_rate}%</td>
                      <td className="px-3 py-2.5 text-gray-600">{pc.affiliate_commission_rate}%</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{pc.usage_count}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {pc.status !== 'archived' && (
                            <>
                              <button
                                onClick={() => { setEditRateId(pc.id); setEditDiscountRate(pc.client_discount_rate); setEditCommissionRate(pc.affiliate_commission_rate); setShowEditRateModal(true) }}
                                className="text-xs px-2 py-0.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition font-medium"
                              >
                                Edytuj
                              </button>
                              <button
                                onClick={() => handleToggleStatus(pc.id)}
                                disabled={actionLoading === pc.id}
                                className={`text-xs px-2 py-0.5 rounded-lg border font-medium transition ${
                                  pc.status === 'active'
                                    ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                    : 'border-green-200 text-green-600 hover:bg-green-50'
                                }`}
                              >
                                {pc.status === 'active' ? 'Wyłącz' : 'Włącz'}
                              </button>
                              <button
                                onClick={() => handleArchive(pc.id)}
                                disabled={actionLoading === pc.id}
                                className="text-xs px-2 py-0.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition font-medium"
                              >
                                📦
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Brak kodów promocyjnych</p>
        )}
      </div>

      {/* Referrals */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Polecenia</h2>
        {referrals.length > 0 ? (
          <div className="space-y-2">
            {referrals.map((r) => {
              const s = REFERRAL_STATUS[r.status] ?? REFERRAL_STATUS.pending
              const date = format(new Date(r.created_at), 'd.MM.yyyy', { locale: pl })
              return (
                <div key={r.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.service_name}</p>
                    <p className="text-xs text-gray-400">{date} · {r.client_label}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-800">{Number(r.commission_amount).toLocaleString('pl-PL')} zł</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.color}`}>{s.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Brak poleceń</p>
        )}
      </div>

      {/* Payouts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Wypłaty</h2>
        {payouts.length > 0 ? (
          <div className="space-y-2">
            {payouts.map((p) => {
              const s = PAYOUT_STATUS[p.status] ?? PAYOUT_STATUS.pending
              const date = format(new Date(p.created_at), 'd.MM.yyyy', { locale: pl })
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-600">{date}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{Number(p.amount).toLocaleString('pl-PL')} zł</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.color}`}>{s.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Brak wypłat</p>
        )}
      </div>

      {/* Add promo code modal */}
      {showAddPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowAddPromoModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🎟️</div>
              <h2 className="text-lg font-bold text-gray-900">Dodaj kod promocyjny</h2>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Kod</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="np. PROMO2024"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Zniżka dla klienta</label>
              <div className="flex gap-2">
                {RATE_OPTIONS.map((r) => (
                  <button
                    key={`disc-${r}`}
                    onClick={() => setNewDiscountRate(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition border ${
                      newDiscountRate === r
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Prowizja afiliacyjna</label>
              <div className="flex gap-2">
                {RATE_OPTIONS.map((r) => (
                  <button
                    key={`comm-${r}`}
                    onClick={() => setNewCommissionRate(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition border ${
                      newCommissionRate === r
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
            {addPromoError && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center mb-4">{addPromoError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowAddPromoModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                Anuluj
              </button>
              <button onClick={handleAddPromo} disabled={addPromoLoading || !newCode.trim()} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {addPromoLoading ? 'Tworzenie…' : 'Utwórz kod'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit rate modal */}
      {showEditRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowEditRateModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">✏️</div>
              <h2 className="text-lg font-bold text-gray-900">Edytuj stawki</h2>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Zniżka dla klienta</label>
              <div className="flex gap-2">
                {RATE_OPTIONS.map((r) => (
                  <button
                    key={`edit-disc-${r}`}
                    onClick={() => setEditDiscountRate(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition border ${
                      editDiscountRate === r
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Prowizja afiliacyjna</label>
              <div className="flex gap-2">
                {RATE_OPTIONS.map((r) => (
                  <button
                    key={`edit-comm-${r}`}
                    onClick={() => setEditCommissionRate(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition border ${
                      editCommissionRate === r
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEditRateModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                Anuluj
              </button>
              <button onClick={handleUpdateRate} disabled={editRateLoading} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
                {editRateLoading ? 'Zapisywanie…' : 'Zapisz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
