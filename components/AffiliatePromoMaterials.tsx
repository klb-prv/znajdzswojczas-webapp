'use client'

import { useState } from 'react'
import Link from 'next/link'

const BASE = 'https://znajdzswojczas.pl'

interface Widget {
  id: string
  label: string
  path: string
  width: number
  height: number
  description: string
}

const WIDGETS: Widget[] = [
  {
    id: 'mini_block',
    label: 'Mini Block',
    path: '/promo/mini_block',
    width: 380,
    height: 48,
    description: 'Poziomy baner – adres serwisu w pierwszej linii, rabat i kod w drugiej.',
  },
  {
    id: 'macro_block',
    label: 'Macro Block',
    path: '/promo/macro_block',
    width: 320,
    height: 48,
    description: 'Kompaktowy baner – domena na górze, rabat i kod poniżej.',
  },
]

function CopyButton({ text, label = '📋 Kopiuj' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button
      onClick={handle}
      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 dark:bg-[#7C5CFC]/15 dark:text-[#9277FF] dark:border-[#7C5CFC]/30 dark:hover:bg-[#7C5CFC]/25 transition whitespace-nowrap"
    >
      {copied ? '✓ Skopiowano' : label}
    </button>
  )
}

export default function AffiliatePromoMaterials({ partnerCode }: { partnerCode: string }) {
  const [size, setSize] = useState(1)
  const [alt, setAlt] = useState(false)

  const query = (path: string) => {
    const params = new URLSearchParams()
    if (partnerCode) params.set('promo_code', partnerCode)
    if (size !== 1) params.set('size', String(size))
    if (alt) params.set('alternative_version', '1')
    const qs = params.toString()
    return qs ? `${path}?${qs}` : path
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">🧩 Materiały promocyjne</h1>
        <p className="text-sm text-gray-600 dark:text-[#9A9AA3] mt-1">
          Osadzalne banery z Twoim kodem. Dostosuj wygląd, skopiuj link lub kod iframe i wstaw na swojej stronie.
        </p>
      </div>

      {!partnerCode && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5">
          <p className="text-sm text-amber-800 dark:text-amber-400">
            Nie masz jeszcze aktywnego kodu promocyjnego.{' '}
            <Link href="/affiliate/codes" className="font-semibold underline underline-offset-2">Utwórz kod w sekcji „Moje kody”</Link>
            , aby banery wyświetlały Twoją zniżkę.
          </p>
        </div>
      )}

      {/* Sandbox controls */}
      <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-5 flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 dark:text-[#9A9AA3] font-medium">Rozmiar</label>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="accent-violet-600 dark:accent-[#7C5CFC]"
          />
          <span className="text-xs font-mono text-gray-600 dark:text-[#9A9AA3] w-8">{size}×</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={alt}
            onChange={(e) => setAlt(e.target.checked)}
            className="w-4 h-4 accent-violet-600 dark:accent-[#7C5CFC]"
          />
          <span className="text-xs text-gray-600 dark:text-[#9A9AA3]">Wersja alternatywna (z niebieskim gradient)</span>
        </label>
      </div>

      {WIDGETS.map((w) => {
        const previewSrc = query(w.path)
        const absoluteUrl = `${BASE}${query(w.path)}`
        // Baner skaluje się CSS-owym zoom (1 + (size-1)*0.5), więc ramka iframe musi
        // urosnąć tym samym czynnikiem - inaczej powiększona treść wychodzi poza
        // stały wymiar iframe i jest przycinana.
        const zoom = 1 + (size - 1) * 0.5
        const dispW = Math.round(w.width * zoom)
        const dispH = Math.round(w.height * zoom)
        const iframeSnippet = `<iframe\n  src="${absoluteUrl}"\n  width="${dispW}" height="${dispH}"\n  frameborder="0" scrolling="no"\n  style="border:none; overflow:hidden;"\n></iframe>`

        return (
          <div key={w.id} className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F7]">{w.label}</h2>
              <p className="text-sm text-gray-500 dark:text-[#9A9AA3]">{w.description}</p>
            </div>

            {/* Live preview */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-[#555] font-semibold mb-2">Podgląd na żywo</p>
              <div className="bg-gray-100 dark:bg-[#0d0d10] rounded-xl p-4 overflow-auto">
                <iframe
                  src={previewSrc}
                  width={dispW}
                  height={dispH}
                  scrolling="no"
                  title={w.label}
                  style={{ border: 'none', overflow: 'hidden', display: 'block' }}
                />
              </div>
            </div>

            {/* Link */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-[#555] font-semibold mb-2">Link z Twoim kodem</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 bg-gray-50 dark:bg-[#15151A] border border-gray-200 dark:border-[#25252D] rounded-xl px-3 py-2 text-xs font-mono text-gray-700 dark:text-[#9A9AA3] truncate">
                  {absoluteUrl}
                </div>
                <CopyButton text={absoluteUrl} />
                <a
                  href={absoluteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 dark:bg-[#15151A] dark:text-[#9A9AA3] dark:border-[#25252D] dark:hover:bg-[#1c1c22] transition whitespace-nowrap"
                >
                  Otwórz ↗
                </a>
              </div>
            </div>

            {/* Iframe snippet */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-[#555] font-semibold mb-2">Kod iframe do wklejenia</p>
              <div className="relative bg-gray-50 dark:bg-[#0d0d10] border border-gray-200 dark:border-[#25252D] rounded-xl p-3.5 overflow-x-auto">
                <pre className="font-mono text-[12px] text-violet-700 dark:text-[#a5d6ff] whitespace-pre-wrap break-all m-0">{iframeSnippet}</pre>
              </div>
              <div className="mt-2 flex justify-end">
                <CopyButton text={iframeSnippet} label="📋 Kopiuj iframe" />
              </div>
            </div>
          </div>
        )
      })}

      <p className="text-xs text-gray-400 dark:text-[#555] text-center">
        Banery automatycznie pobierają wartość zniżki dla Twojego kodu. Szczegóły API:{' '}
        <a href={`${BASE}/promo`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-[#9A9AA3]">
          /promo
        </a>
      </p>
    </div>
  )
}
