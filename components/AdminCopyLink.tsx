'use client'

import { useState } from 'react'

interface Props {
  reservationId: string
}

export default function AdminCopyLink({ reservationId }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const shortId = reservationId.slice(0, 8).toUpperCase()
    const url = `${window.location.origin}/?check=${shortId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full border border-gray-200 text-gray-600 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
    >
      {copied ? '✓ Skopiowano!' : '🔗 Kopiuj link do statusu (dla klienta)'}
    </button>
  )
}
