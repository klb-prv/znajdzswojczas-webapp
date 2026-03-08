'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import { SERVICES, SERVICE_OPTIONS } from '@/lib/services'

interface Props {
  reservationId: string
  reservationNumber: string
  freeDates: string[]  // YYYY-MM-DD
  currentTopic: string
  currentStatus: string
}

type Mode = 'idle' | 'cancel' | 'reschedule' | 'change_topic'

const PRESET_REASONS: string[] = [
  'Błędna kategoria przy zgłoszeniu',
  'Doprecyzowanie zakresu prac',
  'Zmiana technologii na życzenie klienta',
  'Korekta na podstawie nowych informacji',
  'Rozszerzenie zlecenia o dodatkowe elementy',
  'Podział zlecenia na etapy',
  'Zmiana priorytetu projektu',
  'Nowe wymagania od klienta',
  'Zmiana budżetu projektu',
  'Aktualizacja po analizie technicznej',
  'Zgodność z innymi projektami',
  'Zmiana na prośbę klienta',
  'Korekta administracyjna',
  'Własny powód…',
]

const CUSTOM_SENTINEL = 'Własny powód…'

function getServiceIdFromTopic(topic: string): string | null {
  const base = topic.replace(/ \[[^\]]+\]/g, '').trim()
  const withoutVariant = base.replace(/ -.*$/, '').trim()
  return SERVICES.find(s => s.label === withoutVariant)?.id ?? null
}

function getCurrentOptionsFromTopic(topic: string): string[] {
  const stripped = topic
    .replace(/ \[Priorytet\]/g, '')
    .replace(/ \[Kontakt: Discord[^\]]+\]/g, '')
    .trim()
  const match = stripped.match(/ \[([^\]]+)\]$/)
  if (!match) return []
  return match[1].split(', ').filter(Boolean)
}

const CANCEL_REASONS: string[] = [
  'Brak możliwości realizacji w terminie',
  'Klient zrezygnował',
  'Usługa poza zakresem działalności',
  'Duplikat zgłoszenia',
  'Brak odpowiedzi od klienta',
  'Błędne dane kontaktowe',
  'Zmiana zakresu - wymagane nowe zgłoszenie',
  'Niedostępność techniczna',
  'Zgłoszenie testowe',
  'Własny powód…',
]

export default function AdminReservationActions({ reservationId, reservationNumber, freeDates, currentTopic, currentStatus }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('idle')
  const [reason, setReason] = useState('')
  const [newDate, setNewDate] = useState('')
  // change_topic state
  const [newTopic, setNewTopic] = useState(
    SERVICES.find(s => s.label === currentTopic || s.id === currentTopic)?.id ?? ''
  )
  const [selectedPreset, setSelectedPreset] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [cancelPreset, setCancelPreset] = useState('')
  const [cancelCustom, setCancelCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [finalPrice, setFinalPrice] = useState('')
  const [paymentDays, setPaymentDays] = useState<7 | 14>(14)
  const [completeLoading, setCompleteLoading] = useState(false)
  const [completeError, setCompleteError] = useState('')
  const [showStartWorkDialog, setShowStartWorkDialog] = useState(false)
  const [estimatedDays, setEstimatedDays] = useState('')
  const [startWorkLoading, setStartWorkLoading] = useState(false)
  const [startWorkError, setStartWorkError] = useState('')
  const [confirmPaymentStep, setConfirmPaymentStep] = useState<0 | 1 | 2>(0)
  const [confirmPaymentInput, setConfirmPaymentInput] = useState('')
  const [confirmPaymentLoading, setConfirmPaymentLoading] = useState(false)
  const [confirmPaymentError, setConfirmPaymentError] = useState('')
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const [editOptions, setEditOptions] = useState<string[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [optionsError, setOptionsError] = useState('')

  const resetState = () => {
    setMode('idle')
    setReason('')
    setNewDate('')
    setNewTopic(SERVICES.find(s => s.label === currentTopic || s.id === currentTopic)?.id ?? '')
    setSelectedPreset('')
    setCustomReason('')
    setCancelPreset('')
    setCancelCustom('')
    setError('')
  }

  const serviceIdFromTopic = getServiceIdFromTopic(currentTopic)
  const availableOptionsForTopic = serviceIdFromTopic ? (SERVICE_OPTIONS[serviceIdFromTopic] ?? []) : []

  const handleUpdateOptions = async () => {
    setOptionsError('')
    setOptionsLoading(true)
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_options', new_options: editOptions }),
      })
      const data = await res.json()
      if (!res.ok) { setOptionsError(data.error); return }
      setShowOptionsDialog(false)
      router.refresh()
    } catch {
      setOptionsError('Błąd połączenia')
    } finally {
      setOptionsLoading(false)
    }
  }

  const effectiveReason =
    mode === 'change_topic'
      ? selectedPreset === CUSTOM_SENTINEL ? customReason : selectedPreset
      : mode === 'cancel'
      ? cancelPreset === CUSTOM_SENTINEL ? cancelCustom : cancelPreset
      : reason

  const handleSubmit = async () => {
    if (mode === 'reschedule' && !newDate) { setError('Wybierz nowy termin'); return }
    if (!effectiveReason.trim()) { setError('Podaj powód'); return }
    if (mode === 'change_topic' && !newTopic.trim()) { setError('Wybierz nową kategorię'); return }

    setError('')
    setLoading(true)
    try {
      let body: Record<string, string>
      if (mode === 'cancel') {
        body = { action: 'cancel', reason: effectiveReason }
      } else if (mode === 'reschedule') {
        body = { action: 'reschedule', reason: effectiveReason, new_date: newDate }
      } else {
        const svcLabel = SERVICES.find(s => s.id === newTopic)?.label ?? newTopic
        body = { action: 'change_topic', new_topic: svcLabel, reason: effectiveReason }
      }

      const res = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    const price = parseFloat(finalPrice.replace(',', '.'))
    if (!finalPrice.trim() || isNaN(price) || price <= 0) {
      setCompleteError('Podaj prawidłową kwotę')
      return
    }
    setCompleteError('')
    setCompleteLoading(true)
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', final_price: price, payment_days: paymentDays }),
      })
      const data = await res.json()
      if (!res.ok) { setCompleteError(data.error); return }
      router.push('/admin')
      router.refresh()
    } catch {
      setCompleteError('Błąd połączenia')
    } finally {
      setCompleteLoading(false)
    }
  }

  const handleStartWork = async () => {
    const days = parseInt(estimatedDays)
    if (!estimatedDays.trim() || isNaN(days) || days < 1) {
      setStartWorkError('Podaj prawidłową liczbę dni')
      return
    }
    setStartWorkError('')
    setStartWorkLoading(true)
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_work', estimated_days: days }),
      })
      const data = await res.json()
      if (!res.ok) { setStartWorkError(data.error); return }
      setShowStartWorkDialog(false)
      router.push('/admin')
      router.refresh()
    } catch {
      setStartWorkError('Błąd połączenia')
    } finally {
      setStartWorkLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    setConfirmPaymentError('')
    setConfirmPaymentLoading(true)
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_payment' }),
      })
      const data = await res.json()
      if (!res.ok) { setConfirmPaymentError(data.error); return }
      setConfirmPaymentStep(0)
      router.push('/admin')
      router.refresh()
    } catch {
      setConfirmPaymentError('Błąd połączenia')
    } finally {
      setConfirmPaymentLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Akcje</h2>

        {mode === 'idle' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={() => setMode('reschedule')}
                className="flex-1 border border-blue-200 text-blue-600 rounded-lg py-2 text-sm font-medium hover:bg-blue-50 transition"
              >
                Przenieś termin
              </button>
              <button
                onClick={() => setMode('cancel')}
                className="flex-1 border border-red-200 text-red-600 rounded-lg py-2 text-sm font-medium hover:bg-red-50 transition"
              >
                Odwołaj
              </button>
            </div>
            <button
              onClick={() => setMode('change_topic')}
              className="w-full border border-indigo-200 text-indigo-600 rounded-lg py-2 text-sm font-medium hover:bg-indigo-50 transition"
            >
              Zmień kategorię
            </button>
            {availableOptionsForTopic.length > 0 && (
              <button
                onClick={() => {
                  setEditOptions(getCurrentOptionsFromTopic(currentTopic))
                  setOptionsError('')
                  setShowOptionsDialog(true)
                }}
                className="w-full border border-violet-200 text-violet-700 rounded-lg py-2 text-sm font-medium hover:bg-violet-50 transition"
              >
                📋 Edytuj konkretne wymagania
              </button>
            )}
            {currentStatus !== 'in_progress' && (
              <button
                onClick={() => { setEstimatedDays(''); setStartWorkError(''); setShowStartWorkDialog(true) }}
                className="w-full border border-blue-200 text-blue-700 rounded-lg py-2 text-sm font-medium hover:bg-blue-50 transition"
              >
                🔄 Zgłoszenie w realizacji
              </button>
            )}
            {currentStatus === 'awaiting_payment' && (
              <button
                onClick={() => { setConfirmPaymentInput(''); setConfirmPaymentError(''); setConfirmPaymentStep(1) }}
                className="w-full border border-emerald-300 text-emerald-700 bg-emerald-50 rounded-lg py-2 text-sm font-medium hover:bg-emerald-100 transition"
              >
                💰 Potwierdź zapłatę
              </button>
            )}
            <button
              onClick={() => { setFinalPrice(''); setCompleteError(''); setShowCompleteDialog(true) }}
              className="w-full border border-green-200 text-green-700 rounded-lg py-2 text-sm font-medium hover:bg-green-50 transition"
            >
              ✅ Zrealizowane - wystaw do zapłaty
            </button>
          </div>
        )}

        {mode !== 'idle' && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">
            {mode === 'cancel'
              ? 'Odwołanie rezerwacji'
              : mode === 'reschedule'
              ? 'Przeniesienie terminu'
              : 'Zmiana kategorii'}
          </p>

          {/* Reschedule: date picker */}
          {mode === 'reschedule' && (
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nowy termin</label>
              {freeDates.length > 0 ? (
                <select
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Wybierz termin...</option>
                  {freeDates.map((d) => (
                    <option key={d} value={d}>
                      {format(parseISO(d), 'EEEE, d MMMM yyyy', { locale: pl })}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          )}

          {/* Change topic: service dropdown */}
          {mode === 'change_topic' && (
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nowa kategoria</label>
              <select
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Wybierz kategorię...</option>
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reason: presets for change_topic and cancel, plain textarea for reschedule */}
          {mode === 'change_topic' ? (
            <div className="space-y-2">
              <label className="block text-sm text-gray-500">Powód zmiany</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_REASONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setSelectedPreset(p); if (p !== CUSTOM_SENTINEL) setCustomReason('') }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      selectedPreset === p
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {selectedPreset === CUSTOM_SENTINEL && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  placeholder="Wpisz własny powód..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              )}
            </div>
          ) : mode === 'cancel' ? (
            <div className="space-y-2">
              <label className="block text-sm text-gray-500">Powód odwołania</label>
              <div className="flex flex-wrap gap-2">
                {CANCEL_REASONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setCancelPreset(p); if (p !== CUSTOM_SENTINEL) setCancelCustom('') }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      cancelPreset === p
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {cancelPreset === CUSTOM_SENTINEL && (
                <textarea
                  value={cancelCustom}
                  onChange={(e) => setCancelCustom(e.target.value)}
                  rows={3}
                  placeholder="Wpisz własny powód odwołania..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-500 mb-1">Powód</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Podaj powód..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={resetState}
              className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition"
            >
              Anuluj
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 rounded-lg py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
                mode === 'cancel'
                  ? 'bg-red-500 hover:bg-red-600'
                  : mode === 'change_topic'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Wysyłanie...' : 'Potwierdź'}
            </button>
          </div>
        </div>
      )}
    </div>

    {showCompleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCompleteDialog(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">💳</div>
              <h2 className="text-lg font-bold text-gray-900">Zrealizowane - wystaw do zapłaty</h2>
              <p className="text-sm text-gray-500 mt-1">Podaj ostateczną kwotę za usługę</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">Kwota (zł)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">zł</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">Termin płatności</label>
              <div className="flex gap-2">
                {([14, 7] as const).map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setPaymentDays(days)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                      paymentDays === days
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {days} dni
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {paymentDays === 14 ? 'Konsultacje i usługi standardowe' : 'Strony internetowe, programowanie'}
              </p>
            </div>

            {completeError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center mb-4">{completeError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteDialog(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleComplete}
                disabled={completeLoading}
                className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {completeLoading ? 'Wysyłanie...' : 'Wyślij'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmPaymentStep > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmPaymentStep(0) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">

            {confirmPaymentStep === 1 && (
              <>
                <div className="text-center mb-5">
                  <div className="text-3xl mb-2">💰</div>
                  <h2 className="text-lg font-bold text-gray-900">Potwierdzić zapłatę?</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Na pewno chcesz oznaczyć to zgłoszenie jako <strong>opłacone</strong>? Klient otrzyma email z potwierdzeniem.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmPaymentStep(0)}
                    className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={() => { setConfirmPaymentInput(''); setConfirmPaymentStep(2) }}
                    className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 transition"
                  >
                    Dalej →
                  </button>
                </div>
              </>
            )}

            {confirmPaymentStep === 2 && (
              <>
                <div className="text-center mb-5">
                  <div className="text-3xl mb-2">🔐</div>
                  <h2 className="text-lg font-bold text-gray-900">Potwierdź operację</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Przepisz numer zamówienia, aby potwierdzić:
                  </p>
                  <p className="font-mono font-bold text-gray-800 mt-2 text-lg tracking-widest">#{reservationNumber}</p>
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    value={confirmPaymentInput}
                    onChange={(e) => setConfirmPaymentInput(e.target.value.toUpperCase())}
                    placeholder={`#${reservationNumber}`}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center font-mono text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                {confirmPaymentError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center mb-4">{confirmPaymentError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmPaymentStep(1)}
                    className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition"
                  >
                    ← Wróć
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={confirmPaymentLoading || confirmPaymentInput.replace(/^#/, '') !== reservationNumber}
                    className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 transition"
                  >
                    {confirmPaymentLoading ? 'Potwierdzanie...' : '✅ Potwierdź zapłatę'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {showStartWorkDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowStartWorkDialog(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">🔄</div>
              <h2 className="text-lg font-bold text-gray-900">Zgłoszenie w realizacji</h2>
              <p className="text-sm text-gray-500 mt-1">Podaj szacowany czas realizacji w dniach</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">Szacowany czas (dni)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="np. 7"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">dni</span>
              </div>
            </div>
            {startWorkError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center mb-4">{startWorkError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowStartWorkDialog(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleStartWork}
                disabled={startWorkLoading}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {startWorkLoading ? 'Wysyłanie...' : 'Potwierdź'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showOptionsDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowOptionsDialog(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="text-3xl mb-2">📋</div>
              <h2 className="text-lg font-bold text-gray-900">Konkretne wymagania</h2>
              <p className="text-sm text-gray-500 mt-1">Zaznacz wymagania do doliczonej opłaty</p>
            </div>
            <div className="space-y-2 mb-5">
              {availableOptionsForTopic.map((opt) => {
                const checked = editOptions.includes(opt)
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition ${
                      checked
                        ? 'bg-violet-50 border-violet-300 text-violet-800'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setEditOptions((prev) =>
                          prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
                        )
                      }
                      className="accent-violet-600 w-4 h-4"
                    />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                )
              })}
            </div>
            {optionsError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center mb-4">{optionsError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowOptionsDialog(false)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleUpdateOptions}
                disabled={optionsLoading}
                className="flex-1 bg-violet-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition"
              >
                {optionsLoading ? 'Zapisywanie...' : 'Zapisz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
