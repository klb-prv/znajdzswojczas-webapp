import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const affiliateId = await verifyAffiliateSession(token)
  if (!affiliateId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('referral_code')
    .eq('id', affiliateId)
    .single()

  const { count: clicks } = await supabase
    .from('affiliate_clicks')
    .select('id', { count: 'exact', head: true })
    .eq('affiliate_id', affiliateId)

  const { data: referrals } = await supabase
    .from('affiliate_referrals')
    .select('status')
    .eq('affiliate_id', affiliateId) as { data: { status: string }[] | null }

  const totalReferrals = referrals?.length ?? 0
  const approved = referrals?.filter((r) => r.status === 'approved' || r.status === 'paid').length ?? 0

  return NextResponse.json({
    referralCode: affiliate?.referral_code ?? '',
    stats: {
      clicks: clicks ?? 0,
      referrals: totalReferrals,
      approved,
    },
  })
}
