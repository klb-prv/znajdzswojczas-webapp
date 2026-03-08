import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import Link from 'next/link'
import AdminStatusSwitcher from '@/components/AdminStatusSwitcher'
import AdminLogoutButton from '@/components/AdminLogoutButton'
import type { SiteStatus } from '@/lib/types'
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react'

const statusMap = {
  pending_confirmation: { label: 'Oczekuje', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Potwierdzona', color: 'bg-green-100 text-green-700' },
  rescheduled: { label: 'Przełożona', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Odwołana', color: 'bg-red-100 text-red-700' },
  awaiting_payment: { label: 'Do zapłaty', color: 'bg-pink-100 text-pink-700' },
  in_progress: { label: 'W trakcie', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Opłacone', color: 'bg-emerald-100 text-emerald-700' },
}

export default async function AdminPage() {
  const supabase = createAdminClient()

  const [{ data: reservations }, { data: settings }] = await Promise.all([
    supabase.from('reservations').select('*').order('created_at', { ascending: false }),
    supabase.from('site_settings').select('status').eq('id', 1).single(),
  ])

  const siteStatus = (settings?.status ?? 'accepting') as SiteStatus

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Panel admina</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
            <Link href="/admin/discount-codes" className="text-indigo-600 hover:underline">
              Kody zniżowe →
            </Link>
            <Link href="/admin/dates" className="text-blue-600 hover:underline">
              Blokady terminów →
            </Link>
            <Link href="/admin/rodo" className="text-emerald-600 hover:underline">
              RODO →
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        <AdminStatusSwitcher initialStatus={siteStatus} />

        <h2 className="font-semibold text-gray-700 mb-3">Zgłoszenia</h2>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2">
          {reservations?.map((r: { status: string; date: string | number | Date; id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; email: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; topic: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => {
            const s = statusMap[r.status as keyof typeof statusMap]
            const date = r.date ? format(new Date(r.date), 'd MMM yyyy', { locale: pl }) : '-'
            return (
              <div key={String(r.id)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-gray-800 text-sm">{date}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${s?.color}`}>{s?.label}</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">{r.name}</p>
                <p className="text-xs text-gray-400 truncate">{r.email}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{r.topic}</p>
                <Link
                  href={`/admin/reservations/${String(r.id)}`}
                  className="inline-block mt-3 text-xs text-blue-600 font-medium hover:underline"
                >
                  Szczegóły →
                </Link>
              </div>
            )
          })}
          {!reservations?.length && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
              Brak zgłoszeń
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Data', 'Imię', 'Email', 'Temat', 'Status', 'Akcje'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations?.map((r: { status: string; date: string | number | Date; id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; email: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; topic: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }) => {
                const s = statusMap[r.status as keyof typeof statusMap]
                const date = r.date
                  ? format(new Date(r.date), 'd MMM yyyy', { locale: pl })
                  : '-'
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{date}</td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3 text-gray-500">{r.email}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{r.topic}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s?.color}`}>
                        {s?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/reservations/${String(r.id)}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Szczegóły
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {!reservations?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Brak zgłoszeń
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
