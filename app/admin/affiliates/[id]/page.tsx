import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import AdminLogoutButton from '@/components/AdminLogoutButton'
import AdminAffiliateDetail from '@/components/AdminAffiliateDetail'

export default async function AdminAffiliateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', id)
    .single() as { data: { id: string; login: string; name: string; referral_code: string; commission_percent: number; active: boolean; created_at: string } | null }

  if (!affiliate) {
    return (
      <main className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
        <div className="max-w-xl mx-auto text-center text-gray-400">
          Nie znaleziono partnera
        </div>
      </main>
    )
  }

  const { data: referrals } = await supabase
    .from('affiliate_referrals')
    .select('*')
    .eq('affiliate_id', id)
    .order('created_at', { ascending: false }) as { data: { id: string; client_label: string; service_name: string; order_value: number; commission_amount: number; status: string; created_at: string }[] | null }

  const { count: clickCount } = await supabase
    .from('affiliate_clicks')
    .select('id', { count: 'exact', head: true })
    .eq('affiliate_id', id)

  const { data: payouts } = await supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('affiliate_id', id)
    .order('created_at', { ascending: false }) as { data: { id: string; amount: number; status: string; created_at: string }[] | null }

  const { data: promoCodes } = await supabase
    .from('affiliate_promo_codes')
    .select('*')
    .eq('affiliate_id', id)
    .order('created_at', { ascending: false }) as { data: { id: string; code: string; client_discount_rate: number; affiliate_commission_rate: number; status: string; usage_count: number }[] | null }

  const totalCommission = referrals?.reduce((sum, r) => sum + Number(r.commission_amount), 0) ?? 0
  const approvedCommission = referrals?.filter((r) => r.status === 'approved' || r.status === 'paid').reduce((sum, r) => sum + Number(r.commission_amount), 0) ?? 0
  const pendingCommission = referrals?.filter((r) => r.status === 'pending').reduce((sum, r) => sum + Number(r.commission_amount), 0) ?? 0
  const paidCommission = referrals?.filter((r) => r.status === 'paid').reduce((sum, r) => sum + Number(r.commission_amount), 0) ?? 0
  const paidOrders = referrals?.filter((r) => r.status === 'paid').length ?? 0
  const totalPaid = payouts?.filter((p) => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

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
            clicks: clickCount ?? 0,
            referrals: referrals?.length ?? 0,
            paidOrders,
            totalCommission,
            pendingCommission,
            approvedCommission,
            totalPaid,
          }}
          referrals={referrals ?? []}
          payouts={payouts ?? []}
          promoCodes={promoCodes ?? []}
        />
      </div>
    </main>
  )
}
