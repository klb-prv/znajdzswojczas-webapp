import { createAdminClient } from '@/lib/supabase/server'
import { requireAffiliateContext } from '@/lib/affiliate-auth'

export default async function AffiliateStatsPage() {
  const affiliate = await requireAffiliateContext()
  const supabase = createAdminClient()

  const [referralsRes, clicksRes] = await Promise.all([
    supabase
      .from('affiliate_commissions')
      .select('commission_amount, order_amount, status, created_at')
      .eq('affiliate_id', affiliate.id),
    supabase
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('affiliate_id', affiliate.id),
  ])

  const referrals = referralsRes.data as { commission_amount: number; order_amount: number; status: string; created_at: string }[] | null
  const totalClicks = clicksRes.count ?? 0
  const totalReferrals = referrals?.length ?? 0
  const conversionRate = totalClicks > 0 ? ((totalReferrals / totalClicks) * 100).toFixed(1) : '0.0'
  const totalRevenue = referrals
    ?.filter((r) => r.status === 'available' || r.status === 'reserved' || r.status === 'paid')
    .reduce((sum, r) => sum + Number(r.order_amount), 0) ?? 0
  const totalCommission = referrals
    ?.filter((r) => r.status === 'available' || r.status === 'reserved' || r.status === 'paid')
    .reduce((sum, r) => sum + Number(r.commission_amount), 0) ?? 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">📈 Statystyki</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-gray-400 dark:text-[#555] mb-1">👆 Kliknięcia</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">{totalClicks}</p>
        </div>
        <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-gray-400 dark:text-[#555] mb-1">👥 Konwersja</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">{conversionRate}%</p>
        </div>
        <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-gray-400 dark:text-[#555] mb-1">💰 Przychód</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">{totalRevenue.toLocaleString('pl-PL', { minimumFractionDigits: 0 })} zł</p>
        </div>
        <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-5">
          <p className="text-xs text-gray-400 dark:text-[#555] mb-1">📦 Zamówienia</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">{totalReferrals}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-[#F5F5F7] mb-4">Podsumowanie</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#25252D]">
            <span className="text-sm text-gray-600 dark:text-[#9A9AA3]">Łączny przychód z poleceń</span>
            <span className="text-sm font-bold text-gray-900 dark:text-[#F5F5F7]">{totalRevenue.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#25252D]">
            <span className="text-sm text-gray-600 dark:text-[#9A9AA3]">Łączne prowizje</span>
            <span className="text-sm font-bold text-violet-600 dark:text-[#9277FF]">{totalCommission.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#25252D]">
            <span className="text-sm text-gray-600 dark:text-[#9A9AA3]">Wskaźnik konwersji</span>
            <span className="text-sm font-bold text-gray-900 dark:text-[#F5F5F7]">{conversionRate}%</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600 dark:text-[#9A9AA3]">Łączna liczba kliknięć</span>
            <span className="text-sm font-bold text-gray-900 dark:text-[#F5F5F7]">{totalClicks}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
