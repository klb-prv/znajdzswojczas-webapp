'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface Props {
  affiliateName: string
  affiliateLogin: string
}

const NAV_ITEMS = [
  { href: '/affiliate', label: 'Panel', emoji: '📊' },
  { href: '/affiliate/link', label: 'Mój link', emoji: '🔗' },
  { href: '/affiliate/codes', label: 'Moje kody', emoji: '🎟️' },
  { href: '/affiliate/commissions', label: 'Prowizje', emoji: '💰' },
  { href: '/affiliate/payouts', label: 'Wypłaty', emoji: '💸' },
  { href: '/affiliate/stats', label: 'Statystyki', emoji: '📈' },
]

export default function AffiliateSidebar({ affiliateName, affiliateLogin }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/affiliate/auth/logout', { method: 'POST' })
    router.push('/affiliate/login')
    router.refresh()
  }

  const nav = (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== '/affiliate' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              active
                ? 'bg-[#7C5CFC]/15 text-[#9277FF]'
                : 'text-[#9A9AA3] hover:text-[#F5F5F7] hover:bg-[#15151A]'
            }`}
          >
            <span className="text-lg">{item.emoji}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#111114] border border-[#25252D] rounded-xl text-[#F5F5F7]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          {mobileOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </>
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-[#111114] border-r border-[#25252D] flex flex-col transition-transform duration-200
        lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 border-b border-[#25252D]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✦</span>
            <div>
              <p className="text-sm font-bold text-[#F5F5F7]">ZSC</p>
              <p className="text-[10px] text-[#555]">Program afiliacyjny</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {nav}

          <div className="border-t border-[#25252D] pt-4">
            <div className="px-3 mb-3">
              <p className="text-xs text-[#555]">Zalogowano jako</p>
              <p className="text-sm font-medium text-[#F5F5F7] truncate">{affiliateName}</p>
              <p className="text-[10px] text-[#555] font-mono">@{affiliateLogin}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#9A9AA3] hover:text-red-400 hover:bg-red-950/20 transition w-full"
            >
              <span className="text-lg">🚪</span>
              Wyloguj
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
