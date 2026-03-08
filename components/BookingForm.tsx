'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SERVICES, SERVICE_OPTIONS, SERVICE_VARIANTS, OPTION_PRICE, PRIORITY_PRICE } from '@/lib/services'

interface Props {
  date: string   // YYYY-MM-DD
  onSuccess: () => void
}

export default function BookingForm({ date, onSuccess }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [form, setForm] = useState({ name: '', email: '', description: '', contact_method: 'email' as 'email' | 'discord', discord_nick: '' })
  const [priority, setPriority] = useState(false)
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

  const selectedSvc      = SERVICES.find((s) => s.id === selectedService) ?? null
  const availableVariants = selectedService ? (SERVICE_VARIANTS[selectedService] ?? []) : []
  const requiresVariant   = availableVariants.length > 0
  const selectedVarObj    = availableVariants.find((v) => v.id === selectedVariant) ?? null
  const availableOptions  = selectedService ? (SERVICE_OPTIONS[selectedService] ?? []) : []
  const hasOptions        = selectedOptions.length > 0
  const totalSurcharge    = selectedOptions.length * OPTION_PRICE
  const prioritySurcharge = priority ? PRIORITY_PRICE : 0
  const basePrice         = selectedVarObj?.price ?? selectedSvc?.basePrice ?? 0
  const totalPrice        = basePrice + totalSurcharge + prioritySurcharge
  const discountAmount    = appliedDiscount
    ? appliedDiscount.discount_type === 'percent'
      ? Math.floor(totalPrice * appliedDiscount.discount_value / 100)
      : Math.min(appliedDiscount.discount_value, totalPrice)
    : 0
  const finalPrice        = totalPrice - discountAmount
  const descLen           = form.description.length
  const descValid         = descLen >= 100

  const handleServiceChange = (id: string) => {
    setSelectedService(id)
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
    if (!selectedService) {
      setError('Wybierz rodzaj usługi')
      return
    }
    if (requiresVariant && !selectedVariant) {
      setError('Wybierz typ realizacji (np. Single Page lub Web Application)')
      return
    }
    if (!descValid) {
      setError(`Opis musi mieć minimum 100 znaków (teraz: ${descLen})`)
      return
    }
    setLoading(true)
    const serviceLabel = SERVICES.find((s) => s.id === selectedService)?.label ?? selectedService
    const variantLabel  = availableVariants.find((v) => v.id === selectedVariant)?.label
    const baseTopic     = variantLabel ? `${serviceLabel} -${variantLabel}` : serviceLabel
    const topicBase = hasOptions
      ? `${baseTopic} [${selectedOptions.join(', ')}]`
      : baseTopic
    const topic = priority ? `${topicBase} [Priorytet]` : topicBase
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

      {/* Rodzaj usługi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Rodzaj usługi</label>
        <div className="flex gap-2 pb-2 -mx-1 px-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:flex-wrap sm:overflow-x-visible sm:snap-none sm:pb-1">
          {SERVICES.map((s) => {
            const active = selectedService === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleServiceChange(s.id)}
                className={`flex-shrink-0 snap-start flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border text-xs font-medium transition-all duration-150 cursor-pointer select-none
                  ${active
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50'
                  }`}
              >
                <span className="text-2xl leading-none">{s.emoji}</span>
                <span className="whitespace-nowrap">{s.label}</span>
                <span className={`text-[10px] font-semibold ${active ? 'text-blue-200' : 'text-gray-400'}`}>
                  od {s.basePrice} zł
                </span>
              </button>
            )
          })}
        </div>
        {!selectedService && (
          <p className="text-xs text-gray-400 mt-1.5 sm:hidden">← przewiń, żeby zobaczyć więcej opcji</p>
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

      {/* Wstępna wycena / paragon -pokazywany zawsze gdy wybrano usługę */}
      {selectedSvc && (
        <div className="border border-dashed border-gray-300 rounded-2xl p-4 bg-white font-mono text-xs">
          <p className="text-center text-gray-500 mb-3 uppercase tracking-widest text-[10px] font-semibold">
            ── Wstępna wycena ──
          </p>
          <div className="space-y-1.5">
            {/* Usługa bazowa */}
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

            {/* Dodatki technologiczne */}
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
            {priority && (
              <div className="flex justify-between text-orange-600">
                <span>⚡ Priorytetowa realizacja</span>
                <span>+{PRIORITY_PRICE},00 zł</span>
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
            <div className="flex justify-between font-bold text-gray-800 text-sm">
              <span>RAZEM (wstępnie)</span>
              <span className={appliedDiscount ? 'text-green-600' : 'text-blue-600'}>
                od {finalPrice},00 zł
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

      {/* Priorytetowa realizacja */}
      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-2xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">⚡ Priorytetowa realizacja</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Do 3 dni roboczych · w miarę dostępności · <span className="font-semibold text-orange-600 dark:text-orange-400">+{PRIORITY_PRICE} zł</span></p>
          </div>
          <button
            type="button"
            onClick={() => setPriority((p) => !p)}
            className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
              priority ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              priority ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
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
                <span>{method === 'email' ? '📧' : '🎮'}</span>
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
            w tym zasady płatności, brak możliwości faktury VAT na działalność gospodarczą oraz politykę braku zwrotów środków za zrealizowane usługi.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || (requiresVariant && !selectedVariant) || !consentPersonal || !consentTerms}
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
