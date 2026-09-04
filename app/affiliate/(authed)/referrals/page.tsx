import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Oczekuje',    color: 'bg-amber-900/30 text-amber-400 border-amber-800/50' },
  approved:  { label: 'Zatwierdzona', color: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' },
  rejected:  { label: 'Odrzucona',    color: 'bg-red-900/30 text-red-400 border-red-800/50' },
  paid:      { label: 'Wypłacono',    color: 'bg-[#7C5CFC]/15 text-[#9277FF] border-[#7C5CFC]/30' },
}

export default async function AffiliateReferralsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value
  if (!token) redirect('/affiliate/login')

  const affiliateId = await verifyAffiliateSession(token)
  if (!affiliateId) redirect('/affiliate/login')

  const supabase = createAdminClient()

  const { data: referrals } = await supabase
    .from('affiliate_referrals')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false }) as { data: { id: string; service_name: string; client_label: string; order_value: number; commission_amount: number; status: string; created_at: string }[] | null }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#F5F5F7]">👥 Polecenia</h1>

      {/* Desktop table */}
      <div className="hidden md:block bg-[#111114] border border-[#25252D] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#15151A] border-b border-[#25252D]">
            <tr>
              {['Data', 'Klient', 'Zamówienie', 'Wartość', 'Prowizja', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555] font-medium text-xs">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {referrals?.map((r) => {
              const s = STATUS_MAP[r.status] ?? STATUS_MAP.pending
              const date = format(new Date(r.created_at), 'd.MM.yyyy', { locale: pl })
              return (
                <tr key={r.id} className="border-b border-[#1a1a20] hover:bg-[#15151A] transition">
                  <td className="px-4 py-3 text-[#9A9AA3]">{date}</td>
                  <td className="px-4 py-3 text-[#F5F5F7] font-medium">{r.client_label}</td>
                  <td className="px-4 py-3 text-[#9A9AA3]">{r.service_name}</td>
                  <td className="px-4 py-3 text-[#F5F5F7]">{Number(r.order_value).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</td>
                  <td className="px-4 py-3 text-[#F5F5F7] font-semibold">{Number(r.commission_amount).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.color}`}>
                      {s.label}
                    </span>
                  </td>
                </tr>
              )
            })}
            {!referrals?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#555]">
                  Brak poleceń
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {referrals?.map((r) => {
          const s = STATUS_MAP[r.status] ?? STATUS_MAP.pending
          const date = format(new Date(r.created_at), 'd.MM.yyyy', { locale: pl })
          return (
            <div key={r.id} className="bg-[#111114] border border-[#25252D] rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs text-[#555]">{date}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.color}`}>
                  {s.label}
                </span>
              </div>
              <p className="text-sm font-medium text-[#F5F5F7]">{r.service_name}</p>
              <p className="text-xs text-[#555] mt-0.5">{r.client_label}</p>
              <div className="flex justify-between mt-3 pt-2 border-t border-[#25252D]">
                <span className="text-xs text-[#555]">Zamówienie</span>
                <span className="text-xs text-[#9A9AA3]">{Number(r.order_value).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-[#555]">Prowizja</span>
                <span className="text-xs font-bold text-[#F5F5F7]">{Number(r.commission_amount).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span>
              </div>
            </div>
          )
        })}
        {!referrals?.length && (
          <div className="bg-[#111114] border border-[#25252D] rounded-xl p-8 text-center text-[#555] text-sm">
            Brak poleceń
          </div>
        )}
      </div>
    </div>
  )
}
