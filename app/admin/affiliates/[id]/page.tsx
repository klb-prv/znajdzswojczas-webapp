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
  let discountCodeAssignments: { id: string; discount_code_id: string; code: string; discount_type: string; discount_value: number; active: boolean; used_count: number; affiliate_commission_rate: number }[] = []
  let availableDiscountCodes: { id: string; code: string; discount_type: string; discount_value: number; active: boolean }[] = []

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

      const { data: dcAssignData } = await supabase
        .from('affiliate_discount_code_assignments')
        .select('id, discount_code_id, affiliate_commission_rate, created_at, discount_codes(id, code, discount_type, discount_value, active, used_count)')
        .eq('affiliate_id', id)
        .order('created_at', { ascending: false })

      discountCodeAssignments = (dcAssignData ?? []).map((row: Record<string, unknown>) => {
        const dc = row.discount_codes as Record<string, unknown> | null
        return {
          id: row.id as string,
          discount_code_id: row.discount_code_id as string,
          code: (dc?.code as string) ?? '',
          discount_type: (dc?.discount_type as string) ?? '',
          discount_value: (dc?.discount_value as number) ?? 0,
          active: (dc?.active as boolean) ?? false,
          used_count: (dc?.used_count as number) ?? 0,
          affiliate_commission_rate: row.affiliate_commission_rate as number,
        }
      })

      const assignedIds = discountCodeAssignments.map((a) => a.discount_code_id)

      const { data: allDcData } = await supabase
        .from('discount_codes')
        .select('id, code, discount_type, discount_value, active')
        .order('code')

      availableDiscountCodes = (allDcData ?? []).filter((dc: { id: string }) => !assignedIds.includes(dc.id))
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
          discountCodeAssignments={discountCodeAssignments}
          availableDiscountCodes={availableDiscountCodes}
        />
      </div>
    </main>
  )
}
