import { createAdminClient } from '@/lib/supabase/server'
import { requireAffiliateContext } from '@/lib/affiliate-auth'
import { summarizeUserAgent } from '@/lib/user-agent'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface LoginEvent {
  id: string
  ip_address: string | null
  user_agent: string | null
  success: boolean
  created_at: string
}

export default async function AffiliateLoginsPage() {
  const affiliate = await requireAffiliateContext()
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('affiliate_login_events')
    .select('id, ip_address, user_agent, success, created_at')
    .eq('affiliate_id', affiliate.id)
    .order('created_at', { ascending: false })
    .limit(30)

  const events = (data ?? []) as LoginEvent[]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">🔑 Ostatnie logowania</h1>
        <p className="text-sm text-gray-600 dark:text-[#9A9AA3] mt-1">
          Historia logowań na Twoje konto (ostatnie 30 zdarzeń). Nie rozpoznajesz któregoś? Zmień hasło.
        </p>
      </div>

      <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-6">
        {events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#25252D]">
                  {['Data i czas', 'Urządzenie', 'IP', 'Wynik'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-gray-400 dark:text-[#555] font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 dark:border-[#25252D]/50">
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-900 dark:text-[#F5F5F7]">
                      {format(new Date(e.created_at), 'd.MM.yyyy, HH:mm', { locale: pl })}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-[#9A9AA3]">{summarizeUserAgent(e.user_agent)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-600 dark:text-[#9A9AA3]">{e.ip_address ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      {e.success ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-400">Zalogowano</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Nieudane</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-[#555] text-sm">
            Brak zarejestrowanych logowań — historia pojawi się po następnym zalogowaniu.
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-4">
        <p className="text-xs text-gray-500 dark:text-[#9A9AA3]">
          💡 Nieznane logowanie? <a href="/affiliate/change-password" className="underline underline-offset-2 font-medium">Zmień hasło</a> — sesje wygasną wraz z nim.
        </p>
      </div>
    </div>
  )
}
