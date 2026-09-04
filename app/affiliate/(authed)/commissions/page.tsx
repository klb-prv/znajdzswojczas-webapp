import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

const STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Oczekuje',     color: 'bg-amber-900/30 text-amber-400 border-amber-800/50' },
  available: { label: 'Dostępna',     color: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' },
  reserved:  { label: 'Zarezerwowana', color: 'bg-blue-900/30 text-blue-400 border-blue-800/50' },
  paid:      { label: 'Wypłacona',    color: 'bg-[#7C5CFC]/15 text-[#9277FF] border-[#7C5CFC]/30' },
  cancelled: { label: 'Anulowana',    color: 'bg-red-900/30 text-red-400 border-red-800/50' },
}

export default async function AffiliateCommissionsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value
  if (!token) redirect('/affiliate/login')

  const affiliateId = await verifyAffiliateSession(token)
  if (!affiliateId) redirect('/affiliate/login')

  const supabase = createAdminClient()

  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('created_at', { ascending: false }) as { data: { id: string; promo_code: string | null; service_name: string | null; order_id: string | null; commission_amount: number; order_amount: number; discount_amount: number; affiliate_commission_rate: number; status: string; created_at: string }[] | null }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#F5F5F7]">💰 Prowizje</h1>

      {/* Desktop table */}
      <div className="hidden md:block bg-[#111114] border border-[#25252D] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#15151A] border-b border-[#25252D]">
            <tr>
              {['Data', 'Kod', 'Zamówienie', 'Wartość', 'Prowizja', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555] font-medium text-xs">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commissions?.map((c) => {
              const s = STATUS[c.status] ?? STATUS.pending
              const date = format(new Date(c.created_at), 'd.MM.yyyy', { locale: pl })
              return (
                <tr key={c.id} className="border-b border-[#1a1a20] hover:bg-[#15151A] transition">
                  <td className="px-4 py-3 text-[#9A9AA3]">{date}</td>
                  <td className="px-4 py-3 text-[#F5F5F7] font-mono text-xs">{c.promo_code ?? '—'}</td>
                  <td className="px-4 py-3 text-[#9A9AA3]">{c.order_id ?? c.service_name ?? '—'}</td>
                  <td className="px-4 py-3 text-[#F5F5F7]">{Number(c.order_amount).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</td>
                  <td className="px-4 py-3 text-[#F5F5F7] font-semibold">{Number(c.commission_amount).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.color}`}>
                      {s.label}
                    </span>
                  </td>
                </tr>
              )
            })}
            {!commissions?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#555]">
                  Brak prowizji
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {commissions?.map((c) => {
          const s = STATUS[c.status] ?? STATUS.pending
          const date = format(new Date(c.created_at), 'd.MM.yyyy', { locale: pl })
          return (
            <div key={c.id} className="bg-[#111114] border border-[#25252D] rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs text-[#555]">{date}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${s.color}`}>
                  {s.label}
                </span>
              </div>
              <p className="text-sm font-medium text-[#F5F5F7]">{c.service_name ?? 'Zamówienie'}</p>
              {c.promo_code && <p className="text-xs text-[#555] mt-0.5">Kod: {c.promo_code}</p>}
              <div className="flex justify-between mt-3 pt-2 border-t border-[#25252D]">
                <span className="text-xs text-[#555]">Zamówienie</span>
                <span className="text-xs text-[#9A9AA3]">{Number(c.order_amount).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-[#555]">Prowizja ({c.affiliate_commission_rate}%)</span>
                <span className="text-xs font-bold text-[#F5F5F7]">{Number(c.commission_amount).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span>
              </div>
            </div>
          )
        })}
        {!commissions?.length && (
          <div className="bg-[#111114] border border-[#25252D] rounded-xl p-8 text-center text-[#555] text-sm">
            Brak prowizji
          </div>
        )}
      </div>
    </div>
  )
}
