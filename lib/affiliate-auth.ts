import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'

export interface AffiliateContext {
  id: string
  name: string
  login: string
  referral_code: string
  commission_percent: number
}

// Memoized per-request: layout + page share one session verify + one DB round-trip.
export const getAffiliateContext = cache(async (): Promise<AffiliateContext | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value
  if (!token) return null

  const affiliateId = await verifyAffiliateSession(token)
  if (!affiliateId) return null

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('affiliates')
    .select('id, name, login, referral_code, commission_percent')
    .eq('id', affiliateId)
    .maybeSingle()

  return (data as AffiliateContext | null) ?? null
})

export async function requireAffiliateContext(returnTo = '/affiliate/login'): Promise<AffiliateContext> {
  const ctx = await getAffiliateContext()
  if (!ctx) redirect(returnTo)
  return ctx
}
