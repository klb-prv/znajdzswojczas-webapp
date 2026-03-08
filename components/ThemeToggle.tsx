'use client'

import { useEffect, useState } from 'react'

interface Props {
  initialTheme: 'light' | 'dark'
}

export default function ThemeToggle({ initialTheme }: Props) {
  const [dark, setDark] = useState(initialTheme === 'dark')

  // Sync HTML class on mount (client may differ from server cookie)
  useEffect(() => {
    const stored = document.cookie
      .split('; ')
      .find((c) => c.startsWith('theme='))
      ?.split('=')[1]
    const isDark = stored ? stored === 'dark' : initialTheme === 'dark'
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    const maxAge = 60 * 60 * 24 * 365 // 1 year
    document.cookie = `theme=${next ? 'dark' : 'light'}; path=/; max-age=${maxAge}; SameSite=Lax`
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
      title={dark ? 'Jasny motyw' : 'Ciemny motyw'}
      className="
        fixed top-4 right-4 z-50
        flex items-center gap-1.5
        px-3 py-1.5 rounded-full
        text-sm font-medium
        border
        transition-all duration-200
        bg-white border-gray-200 text-gray-600 shadow-sm hover:shadow-md hover:border-gray-300
        dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500
      "
    >
      <span className="text-base leading-none">{dark ? '☀️' : '🌙'}</span>
      <span className="hidden sm:inline">{dark ? 'Jasny' : 'Ciemny'}</span>
    </button>
  )
}
