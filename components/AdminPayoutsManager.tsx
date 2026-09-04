'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface Payout {
  id: string
  affiliate_id: string
  affiliate_name: string
  amount: number
  status: string
  rejection_reason: string | null
  created_at: string
  approved_at: string | null
  paid_at: string | null
}

interface Props {
  payouts: Payout[]
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Oczekuje',    color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Zaakceptowana', color: 'bg-green-100 text-green-700' },
  paid:     { label: 'Wypłacona',   color: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Odrzucona',   color: 'bg-red-100 text-red-700' },
}

export default function AdminPayoutsManager({ payouts }: Props) {
  const router = useRouter()

  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approveId, setApproveId] = useState('')
  const [approveLoading, setApproveLoading] = useState(false)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectId, setRejectId] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)

  const [showPaidModal, setShowPaidModal] = useState(false)
  const [paidId, setPaidId] = useState('')
  const [paidLoading, setPaidLoading] = useState(false)

  const handleApprove = async () => {
    setApproveLoading(true)
    try {
      const res = await fetch('/api/admin/affiliate-payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id: approveId }),
      })
      if (!res.ok) return
      setShowApproveModal(false)
      router.refresh()
    } catch {} finally {
      setApproveLoading(false)
    }
  }

  const handleReject = async () => {
    setRejectLoading(true)
    try {
      const res = await fetch('/api/admin/affiliate-payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', id: rejectId, rejection_reason: rejectReason.trim() || undefined }),
      })
      if (!res.ok) return
      setShowRejectModal(false)
      setRejectReason('')
      router.refresh()
    } catch {} finally {
      setRejectLoading(false)
    }
  }

  const handleMarkPaid = async () => {
    setPaidLoading(true)
    try {
      const res = await fetch('/api/admin/affiliate-payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid', id: paidId }),
      })
      if (!res.ok) return
      setShowPaidModal(false)
      router.refresh()
    } catch {} finally {
      setPaidLoading(false)
    }
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Partner', 'Kwota', 'Data', 'Status', 'Akcje'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => {
              const s = STATUS_MAP[p.status] ?? STATUS_MAP.pending
              const date = p.created_at ? format(new Date(p.created_at), 'd MMM yyyy', { locale: pl }) : '-'
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.affiliate_name}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{Number(p.amount).toLocaleString('pl-PL')} zł</td>
                  <td className="px-4 py-3 text-gray-500">{date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                      {s.label}
                    </span>
                    {p.status === 'rejected' && p.rejection_reason && (
                      <p className="text-[10px] text-red-500 mt-1 max-w-[200px] truncate">{p.rejection_reason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setApproveId(p.id); setShowApproveModal(true) }}
                            className="text-xs px-2.5 py-1 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition font-medium"
                          >
                            Zaakceptuj
                          </button>
                          <button
                            onClick={() => { setRejectId(p.id); setRejectReason(''); setShowRejectModal(true) }}
                            className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition font-medium"
                          >
                            Odrzuć
                          </button>
                        </>
                      )}
                      {p.status === 'approved' && (
                        <button
                          onClick={() => { setPaidId(p.id); setShowPaidModal(true) }}
                          className="text-xs px-2.5 py-1 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition font-medium"
                        >
                          Oznacz jako wypłaconą
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {!payouts.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Brak wypłat
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {payouts.map((p) => {
          const s = STATUS_MAP[p.status] ?? STATUS_MAP.pending
          const date = p.created_at ? format(new Date(p.created_at), 'd MMM yyyy', { locale: pl }) : '-'
          return (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-semibold text-gray-800 text-sm">{p.affiliate_name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${s.color}`}>
                  {s.label}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-800">{Number(p.amount).toLocaleString('pl-PL')} zł</p>
              <p className="text-xs text-gray-400 mt-0.5">{date}</p>
              {p.status === 'rejected' && p.rejection_reason && (
                <p className="text-xs text-red-500 mt-1">{p.rejection_reason}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.status === 'pending' && (
                  <>
                    <button
                      onClick={() => { setApproveId(p.id); setShowApproveModal(true) }}
                      className="text-xs text-green-600 font-medium hover:underline"
                    >
                      Zaakceptuj
                    </button>
                    <button
                      onClick={() => { setRejectId(p.id); setRejectReason(''); setShowRejectModal(true) }}
                      className="text-xs text-red-600 font-medium hover:underline"
                    >
                      Odrzuć
                    </button>
                  </>
                )}
                {p.status === 'approved' && (
                  <button
                    onClick={() => { setPaidId(p.id); setShowPaidModal(true) }}
                    className="text-xs text-blue-600 font-medium hover:underline"
                  >
                    Oznacz jako wypłaconą
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {!payouts.length && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            Brak wypłat
          </div>
        )}
      </div>

      {/* Approve modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowApproveModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🟢</div>
              <h2 className="text-lg font-bold text-gray-900">Zaakceptuj wypłatę</h2>
              <p className="text-sm text-gray-500 mt-1">Czy na pewno chcesz zaakceptować tę wypłatę?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                Anuluj
              </button>
              <button onClick={handleApprove} disabled={approveLoading} className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition">
                {approveLoading ? 'Zatwierdzanie…' : 'Zaakceptuj'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowRejectModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🔴</div>
              <h2 className="text-lg font-bold text-gray-900">Odrzuć wypłatę</h2>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Powód odrzucenia (opcjonalnie)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="np. Nieprawidłowa kwota"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                Anuluj
              </button>
              <button onClick={handleReject} disabled={rejectLoading} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition">
                {rejectLoading ? 'Odrzucanie…' : 'Odrzuć'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark paid modal */}
      {showPaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowPaidModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">💸</div>
              <h2 className="text-lg font-bold text-gray-900">Oznacz jako wypłaconą</h2>
              <p className="text-sm text-gray-500 mt-1">Czy potwierdzasz dokonanie wypłaty?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPaidModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition">
                Anuluj
              </button>
              <button onClick={handleMarkPaid} disabled={paidLoading} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {paidLoading ? 'Zapisywanie…' : 'Potwierdź wypłatę'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
