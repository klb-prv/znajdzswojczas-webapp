import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminLogoutButton from '@/components/AdminLogoutButton'
import AdminAffiliateDetail from '@/components/AdminAffiliateDetail'

export default async function AdminAffiliateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let affiliate: { id: string; login: string; name: string; referral_code: string; commission_percent: number; active: boolean; created_at: string } | null = null
  let referrals: { id: string; client_label: string; service_name: string; order_value: number; commission_amount: number; status: string; created_at: string }[] = []
  let clickCount = 0
  let payouts: { id: string; amount: number; status: string; created_at: string }[] = []
  let promoCodes: { id: string; code: string; client_discount_rate: number; affiliate_commission_rate: number; status: string; usage_count: number }[] = []

  try {
    const supabase = createAdminClient()

    const { data } = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', id)
      .single() as { data: { id: string; login: string; name: string; referral_code: string; commission_percent: number; active: boolean; created_at: string } | null }

    affiliate = data

    if (affiliate) {
      const { data: refData } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_id', id)
        .order('created_at', { ascending: false }) as { data: { id: string; client_label: string; service_name: string; order_value: number; commission_amount: number; status: string; created_at: string }[] | null }

      referrals = refData ?? []

      const { count } = await supabase
        .from('affiliate_clicks')
        .select('id', { count: 'exact', head: true })
        .eq('affiliate_id', id)

      clickCount = count ?? 0

      const { data: payData } = await supabase
        .from('affiliate_payouts')
        .select('*')
        .eq('affiliate_id', id)
        .order('created_at', { ascending: false }) as { data: { id: string; amount: number; status: string; created_at: string }[] | null }

      payouts = payData ?? []

      const { data: codeData } = await supabase
        .from('affiliate_promo_codes')
        .select('*')
        .eq('affiliate_id', id)
        .order('created_at', { ascending: false }) as { data: { id: string; code: string; client_discount_rate: number; affiliate_commission_rate: number; status: string; usage_count: number }[] | null }

      promoCodes = codeData ?? []
    }
  } catch {}

  if (!affiliate) {
    return (
      <main className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
        <div className="max-w-xl mx-auto text-center text-gray-400">
          Nie znaleziono partnera lub tabele nie zostały utworzone.
        </div>
      </main>
    )
  }

  const totalCommission = referrals.reduce((sum, r) => sum + Number(r.commission_amount), 0)
  const approvedCommission = referrals.filter((r) => r.status === 'approved' || r.status === 'paid').reduce((sum, r) => sum + Number(r.commission_amount), 0)
  const pendingCommission = referrals.filter((r) => r.status === 'pending').reduce((sum, r) => sum + Number(r.commission_amount), 0)
  const paidCommission = referrals.filter((r) => r.status === 'paid').reduce((sum, r) => sum + Number(r.commission_amount), 0)
  const paidOrders = referrals.filter((r) => r.status === 'paid').length
  const totalPaidOut = payouts.filter((p) => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <Link href="/admin/affiliates" className="text-sm text-blue-600 hover:underline">← Partnerzy afiliacji</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{affiliate.name}</h1>
          </div>
          <AdminLogoutButton />
        </div>

        <AdminAffiliateDetail
          affiliate={affiliate}
          stats={{
            clicks: clickCount,
            referrals: referrals.length,
            paidOrders,
            totalCommission,
            pendingCommission,
            approvedCommission,
            totalPaid: totalPaidOut,
          }}
          referrals={referrals}
          payouts={payouts}
          promoCodes={promoCodes}
        />
      </div>
    </main>
  )
}
