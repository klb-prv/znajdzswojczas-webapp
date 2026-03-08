import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import ThemeToggle from '@/components/ThemeToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Znajdz swój czas',
  description: 'Wybierz termin i opisz problem.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const theme = (cookieStore.get('theme')?.value ?? 'light') as 'light' | 'dark'

  return (
    <html lang="pl" className={theme === 'dark' ? 'dark' : ''}>
      <body className={inter.className}>
        <ThemeToggle initialTheme={theme} />
        {children}
      </body>
    </html>
  )
}
