import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAffiliateContext } from '@/lib/affiliate-auth'

export async function GET() {
  const affiliate = await getAffiliateContext()
  if (!affiliate) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const [clicksRes, referralsRes] = await Promise.all([
    supabase
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('affiliate_id', affiliate.id),
    supabase
      .from('affiliate_commissions')
      .select('status')
      .eq('affiliate_id', affiliate.id),
  ])

  const referrals = referralsRes.data as { status: string }[] | null
  const totalReferrals = referrals?.length ?? 0
  const approved = referrals?.filter((r) => r.status === 'available' || r.status === 'reserved' || r.status === 'paid').length ?? 0

  return NextResponse.json({
    referralCode: affiliate.referral_code,
    stats: {
      clicks: clicksRes.count ?? 0,
      referrals: totalReferrals,
      approved,
    },
  })
}
