'use client'

import { useState } from 'react'

interface Props {
  fullUrl: string
  displayUrl: string
}

function CopyButton({ fullUrl }: { fullUrl: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button
      onClick={handleCopy}
      disabled={!fullUrl}
      className="px-5 py-3 bg-violet-600 hover:bg-violet-700 dark:bg-[#7C5CFC] dark:hover:bg-[#9277FF] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap"
    >
      {copied ? '✓ Skopiowano' : '📋 Kopiuj'}
    </button>
  )
}

export default function AffiliateLinkCopyBox({ fullUrl, displayUrl }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 dark:bg-[#15151A] border border-gray-200 dark:border-[#25252D] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-[#F5F5F7] font-mono truncate">
        {displayUrl}
      </div>
      <CopyButton fullUrl={fullUrl} />
    </div>
  )
}
