import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAffiliateSession, AFFILIATE_SESSION_COOKIE } from '@/lib/affiliate-session'
import AffiliateSidebar from '@/components/AffiliateSidebar'

export default async function AffiliateAuthedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AFFILIATE_SESSION_COOKIE)?.value

  if (!token) {
    redirect('/affiliate/login')
  }

  const affiliateId = await verifyAffiliateSession(token)
  if (!affiliateId) {
    redirect('/affiliate/login')
  }

  const supabase = createAdminClient()
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, login, name, referral_code, commission_percent')
    .eq('id', affiliateId)
    .single() as { data: { id: string; login: string; name: string; referral_code: string; commission_percent: number } | null }

  if (!affiliate) {
    redirect('/affiliate/login')
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <AffiliateSidebar affiliateName={affiliate.name} affiliateLogin={affiliate.login} />
      <main className="flex-1 p-6 lg:p-8 lg:ml-64">
        {children}
      </main>
    </div>
  )
}
