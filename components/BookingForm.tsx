'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERVICES, SERVICE_OPTIONS, SERVICE_VARIANTS, OPTION_PRICE, PRIORITY_PRICE, EXTRA_PRIORITY_PRICE, SERVICE_PACKAGES } from '@/lib/services'
import Link from 'next/link'

interface Props {
  date: string   // YYYY-MM-DD
  onSuccess: () => void
}

export default function BookingForm({ date, onSuccess }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'uslugi' | 'pakiety'>('uslugi')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [form, setForm] = useState({ name: '', email: '', description: '', contact_method: 'email' as 'email' | 'discord', discord_nick: '' })
  const [priorityTier, setPriorityTier] = useState<'none' | 'priority' | 'immediate'>('none')
  const [consentPersonal, setConsentPersonal] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)

  // Kod zniżkowy
  const [discountInput, setDiscountInput]       = useState('')
  const [validatingCode, setValidatingCode]     = useState(false)
  const [discountCodeError, setDiscountCodeError] = useState('')
  const [appliedDiscount, setAppliedDiscount]   = useState<{
    code: string
    discount_type: 'percent' | 'fixed'
    discount_value: number
  } | null>(null)

  const selectedSvc       = SERVICES.find((s) => s.id === selectedService) ?? null
  const selectedPkg       = SERVICE_PACKAGES.find((p) => p.id === selectedPackage) ?? null
  const availableVariants = selectedService ? (SERVICE_VARIANTS[selectedService] ?? []) : []
  const requiresVariant   = availableVariants.length > 0
  const selectedVarObj    = availableVariants.find((v) => v.id === selectedVariant) ?? null
  const availableOptions  = selectedService ? (SERVICE_OPTIONS[selectedService] ?? []) : []
  const hasOptions        = selectedOptions.length > 0
  const totalSurcharge    = selectedOptions.length * OPTION_PRICE
  const prioritySurcharge = priorityTier === 'priority' ? PRIORITY_PRICE : priorityTier === 'immediate' ? EXTRA_PRIORITY_PRICE : 0
  const basePrice         = selectedPackage ? 0 : (selectedVarObj?.price ?? selectedSvc?.basePrice ?? 0)
  const baseAmount        = basePrice + totalSurcharge
  const discountAmount    = appliedDiscount
    ? appliedDiscount.discount_type === 'percent'
      ? Math.floor(baseAmount * appliedDiscount.discount_value / 100)
      : Math.min(appliedDiscount.discount_value, baseAmount)
    : 0
  const finalPrice        = baseAmount - discountAmount + prioritySurcharge
  const descLen           = form.description.length
  const descValid         = descLen >= 100

  const handleServiceChange = (id: string) => {
    setSelectedService(id)
    setSelectedPackage(null)
    setSelectedVariant(null)
    setSelectedOptions([])
    setAppliedDiscount(null)
    setDiscountInput('')
    setDiscountCodeError('')
  }

  const handlePackageChange = (id: string) => {
    setSelectedPackage(id)
    setSelectedService(null)
    setSelectedVariant(null)
    setSelectedOptions([])
    setAppliedDiscount(null)
    setDiscountInput('')
    setDiscountCodeError('')
  }

  const toggleOption = (opt: string) => {
    setSelectedOptions((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    )
  }

  const handleApplyCode = async () => {
    if (!discountInput.trim()) return
    setValidatingCode(true)
    setDiscountCodeError('')
    try {
      const res = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountInput.trim() }),
      })
      const result = await res.json()
      if (result.valid) {
        setAppliedDiscount({
          code: result.code,
          discount_type: result.discount_type,
          discount_value: result.discount_value,
        })
        setDiscountCodeError('')
      } else {
        setDiscountCodeError(result.error ?? 'Nieprawidłowy kod')
        setAppliedDiscount(null)
      }
    } catch {
      setDiscountCodeError('Błąd połączenia')
    } finally {
      setValidatingCode(false)
    }
  }

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null)
    setDiscountInput('')
    setDiscountCodeError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!selectedService && !selectedPackage) {
      setError('Wybierz rodzaj usługi lub pakiet')
      return
    }
    if (selectedService && requiresVariant && !selectedVariant) {
      setError('Wybierz typ realizacji (np. Single Page lub Web Application)')
      return
    }
    if (!descValid) {
      setError(`Opis musi mieć minimum 100 znaków (teraz: ${descLen})`)
      return
    }
    setLoading(true)

    let baseTopic: string
    if (selectedPackage) {
      const pkg = SERVICE_PACKAGES.find((p) => p.id === selectedPackage)
      baseTopic = `Pakiet: ${pkg?.title ?? selectedPackage}`
    } else {
      const svc = SERVICES.find((s) => s.id === selectedService)
      const serviceLabel = svc?.label ?? selectedService ?? ''
      const variantLabel  = availableVariants.find((v) => v.id === selectedVariant)?.label ?? ''
      baseTopic = variantLabel ? `${serviceLabel} -${variantLabel}` : serviceLabel
    }
    const topicBase = hasOptions
      ? `${baseTopic} [${selectedOptions.join(', ')}]`
      : baseTopic
    const priorityLabel = priorityTier === 'priority' ? ' [Priorytet]' : priorityTier === 'immediate' ? ' [Priorytet - Natychmiast]' : ''
    const topic = topicBase + priorityLabel
    try {
      const contactSuffix = form.contact_method === 'discord' && form.discord_nick.trim()
        ? ` [Kontakt: Discord -${form.discord_nick.trim()}]`
        : ''
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          description: form.description,
          topic: topic + contactSuffix,
          date,
          ...(appliedDiscount ? { discount_code: appliedDiscount.code } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      router.push(`/confirm/${data.reservation_id}`)
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Link do cen */}
      <Link
        href="/uslugi"
        className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        → Zobacz ceny dostępnych usług
      </Link>

      {/* Przełącznik Usługi / Pakiety */}
      <div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-3">
          <button
            type="button"
            onClick={() => { setViewMode('uslugi'); setSelectedPackage(null) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer select-none ${
              viewMode === 'uslugi'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            💻 Usługi
          </button>
          <button
            type="button"
            onClick={() => { setViewMode('pakiety'); setSelectedService(null) }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer select-none ${
              viewMode === 'pakiety'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📦 Pakiety
          </button>
        </div>

        {viewMode === 'uslugi' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 shadow-sm">
            <div className="flex flex-col gap-1.5">
              {SERVICES.map((s) => {
                const active = selectedService === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleServiceChange(s.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all duration-150 cursor-pointer select-none
                      ${active
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                        : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:shadow-sm'
                      }`}
                  >
                    <span className="text-xl leading-none">{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {viewMode === 'pakiety' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 shadow-sm">
            <div className="flex flex-col gap-1.5">
              {SERVICE_PACKAGES.map((p) => {
                const active = selectedPackage === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePackageChange(p.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all duration-150 cursor-pointer select-none
                      ${active
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 hover:shadow-sm'
                      }`}
                  >
                    <span className="text-xl leading-none">{p.emoji}</span>
                    <span>{p.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Typ realizacji -obowiązkowy radio dla wybranych usług */}
      {availableVariants.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-0.5">
            Typ realizacji <span className="text-red-500">*</span>
          </p>
          <p className="text-xs text-gray-400 mb-3">Wybierz jeden -wymagane</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {availableVariants.map((v) => {
              const active = selectedVariant === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v.id)}
                  className={`flex-1 flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer select-none
                    ${active
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm'
                    }`}
                >
                  <span className="font-semibold">{v.label}</span>
                  <span className={`text-xs ${active ? 'text-blue-200' : 'text-gray-400'}`}>{v.sublabel}</span>
                  <span className={`text-xs font-bold mt-0.5 ${active ? 'text-white' : 'text-gray-500'}`}>od {v.price} zł</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Konkretne wymagania technologiczne */}
      {availableOptions.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-0.5">Konkretne wymagania</p>
          <p className="text-xs text-gray-400 mb-3">
            Opcjonalnie - wybranie opcji dolicza +{OPTION_PRICE} zł do wyceny
          </p>
          <div className="flex flex-wrap gap-2">
            {availableOptions.map((opt) => {
              const checked = selectedOptions.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-150 cursor-pointer select-none
                    ${checked
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                >
                  {checked && <span>✓</span>}
                  {opt}
                  {checked && <span className="text-indigo-300">+{OPTION_PRICE} zł</span>}
                </button>
              )
            })}
          </div>
          {!hasOptions && (
            <p className="text-xs text-gray-400 mt-2.5">
              Nie wybrano dodatkowych wymagań - wycena bez zmian
            </p>
          )}
        </div>
      )}

      {/* Wstępna wycena / paragon */}
      {(selectedSvc || selectedPkg) && (
        <div className="border border-dashed border-gray-300 rounded-2xl p-4 bg-white font-mono text-xs">
          <p className="text-center text-gray-500 mb-3 uppercase tracking-widest text-[10px] font-semibold">
            ── Wstępna wycena ──
          </p>
          <div className="space-y-1.5">
            {selectedPkg && (
              <div className="flex justify-between text-gray-700">
                <span className="font-medium">📦 {selectedPkg.title}</span>
                <span className="text-gray-500">{selectedPkg.priceRange}</span>
              </div>
            )}
            {selectedSvc && (
              <>
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">{selectedSvc.label}</span>
                  <span className="text-gray-500">
                    {selectedVarObj ? '-' : `od ${selectedSvc.basePrice},00 zł`}
                  </span>
                </div>
                {selectedVarObj && (
                  <div className="flex justify-between text-gray-500 pl-2">
                    <span className="before:content-['└_'] before:text-gray-300">{selectedVarObj.label}</span>
                    <span className="text-gray-500">od {selectedVarObj.price},00 zł</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400 text-[10px] pl-1">
                  <span>({selectedSvc.priceNote})</span>
                </div>
              </>
            )}

            {selectedOptions.map((opt) => (
              <div key={opt} className="flex justify-between text-gray-500">
                <span className="pl-2 before:content-['+_'] before:text-gray-300">{opt}</span>
                <span>+{OPTION_PRICE},00 zł</span>
              </div>
            ))}
          </div>

          {/* Podsumowanie */}
          <div className="border-t border-dashed border-gray-200 mt-3 pt-2.5 space-y-1">
            {hasOptions && (
              <div className="flex justify-between text-gray-500">
                <span>Dopłata za wymagania</span>
                <span>+{totalSurcharge},00 zł</span>
              </div>
            )}
            {appliedDiscount && (
              <div className="flex justify-between text-green-600">
                <span>Kod {appliedDiscount.code}</span>
                <span>
                  −{appliedDiscount.discount_type === 'percent'
                    ? `${appliedDiscount.discount_value}% (−${discountAmount},00 zł)`
                    : `${discountAmount},00 zł`
                  }
                </span>
              </div>
            )}
            {priorityTier === 'priority' && (
              <div className="flex justify-between text-orange-600">
                <span>⚡ Priorytetowa realizacja</span>
                <span>+{PRIORITY_PRICE},00 zł</span>
              </div>
            )}
            {priorityTier === 'immediate' && (
              <div className="flex justify-between text-red-600">
                <span>🔥 Natychmiastowa realizacja</span>
                <span>+{EXTRA_PRIORITY_PRICE},00 zł</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-800 text-sm">
              <span>RAZEM (wstępnie)</span>
              <span className={appliedDiscount ? 'text-green-600' : 'text-blue-600'}>
                {selectedPkg ? selectedPkg.priceRange : `od ${finalPrice},00 zł`}
              </span>
            </div>
          </div>

          <p className="text-center text-gray-300 mt-3 text-[10px]">
            Ostateczna cena ustalana indywidualnie po konsultacji i realizacji zgłoszenia
          </p>
        </div>
      )}

      {/* Kod zniżkowy */}
      {selectedSvc && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kod zniżkowy</label>
          {appliedDiscount ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <span className="text-green-600 text-sm font-medium flex-1">
                ✓ {appliedDiscount.code} -{appliedDiscount.discount_type === 'percent'
                  ? `−${appliedDiscount.discount_value}% (oszczędzasz ${discountAmount} zł)`
                  : `−${discountAmount} zł`
                }
              </span>
              <button
                type="button"
                onClick={handleRemoveDiscount}
                className="text-xs text-red-400 hover:text-red-600 transition"
              >
                Usuń
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={discountInput}
                onChange={(e) => { setDiscountInput(e.target.value.toUpperCase()); setDiscountCodeError('') }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCode())}
                placeholder="np. LATO2026"
                className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 font-mono shadow-sm
                  ${discountCodeError ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500'}`}
              />
              <button
                type="button"
                onClick={handleApplyCode}
                disabled={validatingCode || !discountInput.trim()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                {validatingCode ? '…' : 'Zastosuj'}
              </button>
            </div>
          )}
          {discountCodeError && (
            <p className="text-xs text-red-500 mt-1">{discountCodeError}</p>
          )}
        </div>
      )}

      {/* Priorytet / Natychmiast */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPriorityTier(priorityTier === 'priority' ? 'none' : 'priority')}
          className={`rounded-2xl p-4 border text-left transition-all duration-150 cursor-pointer select-none ${
            priorityTier === 'priority'
              ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-200 hover:shadow-sm'
          }`}
        >
          <p className={`text-sm font-semibold ${priorityTier === 'priority' ? 'text-orange-800 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
            ⚡ Priorytet
          </p>
          <p className={`text-xs mt-0.5 ${priorityTier === 'priority' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}`}>
            Do 3 dni roboczych
          </p>
          <p className={`text-base font-bold mt-1 ${priorityTier === 'priority' ? 'text-orange-900 dark:text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>
            +{PRIORITY_PRICE} zł
          </p>
        </button>
        <button
          type="button"
          onClick={() => setPriorityTier(priorityTier === 'immediate' ? 'none' : 'immediate')}
          className={`rounded-2xl p-4 border text-left transition-all duration-150 cursor-pointer select-none ${
            priorityTier === 'immediate'
              ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 shadow-md'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-200 hover:shadow-sm'
          }`}
        >
          <p className={`text-sm font-semibold ${priorityTier === 'immediate' ? 'text-red-800 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
            🔥 Natychmiast
          </p>
          <p className={`text-xs mt-0.5 ${priorityTier === 'immediate' ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
            Do 24h (w miarę dostępności)
          </p>
          <p className={`text-base font-bold mt-1 ${priorityTier === 'immediate' ? 'text-red-900 dark:text-red-200' : 'text-gray-500 dark:text-gray-400'}`}>
            +{EXTRA_PRIORITY_PRICE} zł
          </p>
        </button>
      </div>

      {/* Dane osobowe */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imię i nazwisko</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          📧 Adres email jest wymagany -wysyłamy na niego informacje o statusie zgłoszenia.
        </p>
      </div>

      {/* Forma kontaktu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preferowana forma kontaktu</label>
        <div className="flex gap-3">
          {(['email', 'discord'] as const).map((method) => {
            const active = form.contact_method === method
            return (
              <button
                key={method}
                type="button"
                onClick={() => setForm((f) => ({ ...f, contact_method: method }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition ${
                  active
                    ? method === 'discord'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {method === 'email' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.317 4.37a19.78 19.78 0 0 0-4.885-1.515.074.074 0 0 0-.078.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.078-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .032.06 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.06c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                )}
                {method === 'email' ? 'Email' : 'Discord'}
              </button>
            )
          })}
        </div>

        {form.contact_method === 'discord' && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nick na Discordzie</label>
            <input
              type="text"
              value={form.discord_nick}
              onChange={(e) => setForm((f) => ({ ...f, discord_nick: e.target.value }))}
              placeholder="np. jankowalski#1234 lub jankowalski"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Opis */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Szczegółowy opis problemu
          <span className={`ml-2 text-xs font-normal ${descValid ? 'text-green-500' : 'text-gray-400'}`}>
            {descLen}/100 znaków
          </span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={5}
          placeholder="Opisz dokładnie czego potrzebujesz (min. 100 znaków)..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
          required
        />
        {descValid && <div className="h-1 rounded-full bg-green-400 mt-1 transition-all" />}
        {!descValid && descLen > 0 && (
          <div
            className="h-1 rounded-full bg-blue-300 mt-1 transition-all"
            style={{ width: `${Math.min(100, (descLen / 100) * 100)}%` }}
          />
        )}
      </div>

      {consentTerms && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">Brak zwrotów za rozpoczęte i zrealizowane usługi</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 leading-relaxed">
                Realizacja Usługi rozpoczyna się niezwłocznie po potwierdzeniu Zgłoszenia. Rozpoczęta lub w pełni zrealizowana Usługa <strong>nie podlega zwrotowi</strong>. Klientowi przysługuje wyłącznie prawo do{' '}
                <a href="/regulamin#reklamacje" target="_blank" className="underline font-semibold hover:no-underline">reklamacji</a>.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 border border-red-100">
          {error}
        </p>
      )}

      {/* Zgody */}
      <div className="space-y-3 border border-gray-100 rounded-2xl p-4 bg-gray-50">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={consentPersonal}
            onChange={(e) => setConsentPersonal(e.target.checked)}
            className="mt-0.5 w-4 h-4 flex-shrink-0 accent-blue-600 cursor-pointer"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-800">Składam zgłoszenie wyłącznie jako osoba fizyczna</strong> - oświadczam, że nie działam w imieniu ani na rzecz osoby prawnej (np. spółki z o.o., spółki akcyjnej, fundacji, stowarzyszenia) ani innej jednostki organizacyjnej. Usługa przeznaczona jest wyłącznie dla osób fizycznych, w celach prywatnych.
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={consentTerms}
            onChange={(e) => setConsentTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 flex-shrink-0 accent-blue-600 cursor-pointer"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            Zapoznałem/am się i akceptuję{' '}
            <a href="/regulamin" target="_blank" className="text-blue-600 hover:underline font-medium">Regulamin serwisu</a>,
            w tym zasady płatności, <b className="font-extrabold">brak możliwości</b> wystawienia <b>faktury VAT</b> na działalność gospodarczą oraz politykę <b>braku zwrotów</b> środków za zrealizowane usługi.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || (selectedService && requiresVariant && !selectedVariant) || (!selectedService && !selectedPackage) || !consentPersonal || !consentTerms}
        className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition shadow-lg shadow-blue-200 active:scale-[0.98]"
      >
        {loading ? 'Wysyłanie...' : hasOptions ? 'Przygotuj zlecenie →' : 'Wyślij zgłoszenie →'}
      </button>
      {requiresVariant && !selectedVariant && (
        <p className="text-xs text-gray-400 text-center -mt-2">
          Wybierz typ realizacji, aby kontynuować
        </p>
      )}

      <p className="text-xs text-gray-400 text-center">
        Po wysłaniu zgłoszenia otrzymasz kod potwierdzający na podany adres email
      </p>
    </form>
  )
}
