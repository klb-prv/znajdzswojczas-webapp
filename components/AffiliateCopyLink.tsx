'use client'

import { useState } from 'react'

interface Props {
  referralCode: string
}

export default function AffiliateCopyLink({ referralCode }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://znajdzswojczas.pl/?ref=${referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-6">
      <h2 className="text-sm font-bold text-[#F5F5F7] mb-3">🔗 Twój link afiliacyjny</h2>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-[#15151A] border border-[#25252D] rounded-xl px-4 py-2.5 text-sm text-[#9A9AA3] font-mono truncate">
          znajdzswojczas.pl/?ref={referralCode}
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2.5 bg-[#7C5CFC]/15 text-[#9277FF] rounded-xl text-sm font-medium hover:bg-[#7C5CFC]/25 transition whitespace-nowrap"
        >
          {copied ? '✓' : '📋 Kopiuj'}
        </button>
      </div>
    </div>
  )
}
