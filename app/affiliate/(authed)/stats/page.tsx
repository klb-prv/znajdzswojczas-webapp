import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'

export default async function AffiliateStatsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value
  if (!token) redirect('/affiliate/login')

  const affiliateId = await verifyAffiliateSession(token)
  if (!affiliateId) redirect('/affiliate/login')

  const supabase = createAdminClient()

  const { data: referrals } = await supabase
    .from('affiliate_referrals')
    .select('commission_amount, order_value, status, created_at')
    .eq('affiliate_id', affiliateId) as { data: { commission_amount: number; order_value: number; status: string; created_at: string }[] | null }

  const { data: clicks } = await supabase
    .from('affiliate_clicks')
    .select('created_at')
    .eq('affiliate_id', affiliateId) as { data: { created_at: string }[] | null }

  const totalClicks = clicks?.length ?? 0
  const totalReferrals = referrals?.length ?? 0
  const conversionRate = totalClicks > 0 ? ((totalReferrals / totalClicks) * 100).toFixed(1) : '0.0'
  const totalRevenue = referrals
    ?.filter((r) => r.status === 'approved' || r.status === 'paid')
    .reduce((sum, r) => sum + Number(r.order_value), 0) ?? 0
  const totalCommission = referrals
    ?.filter((r) => r.status === 'approved' || r.status === 'paid')
    .reduce((sum, r) => sum + Number(r.commission_amount), 0) ?? 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-[#F5F5F7]">📈 Statystyki</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">👆 Kliknięcia</p>
          <p className="text-2xl font-bold text-[#F5F5F7]">{totalClicks}</p>
        </div>
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">👥 Konwersja</p>
          <p className="text-2xl font-bold text-[#F5F5F7]">{conversionRate}%</p>
        </div>
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">💰 Przychód</p>
          <p className="text-2xl font-bold text-[#F5F5F7]">{totalRevenue.toLocaleString('pl-PL', { minimumFractionDigits: 0 })} zł</p>
        </div>
        <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-[#555] mb-1">📦 Zamówienia</p>
          <p className="text-2xl font-bold text-[#F5F5F7]">{totalReferrals}</p>
        </div>
      </div>

      <div className="bg-[#111114] border border-[#25252D] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-[#F5F5F7] mb-4">Podsumowanie</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-[#25252D]">
            <span className="text-sm text-[#9A9AA3]">Łączny przychód z poleceń</span>
            <span className="text-sm font-bold text-[#F5F5F7]">{totalRevenue.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#25252D]">
            <span className="text-sm text-[#9A9AA3]">Łączne prowizje</span>
            <span className="text-sm font-bold text-[#7C5CFC]">{totalCommission.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#25252D]">
            <span className="text-sm text-[#9A9AA3]">Wskaźnik konwersji</span>
            <span className="text-sm font-bold text-[#F5F5F7]">{conversionRate}%</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-[#9A9AA3]">Łączna liczba kliknięć</span>
            <span className="text-sm font-bold text-[#F5F5F7]">{totalClicks}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
