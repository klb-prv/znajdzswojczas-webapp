import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminLogoutButton from '@/components/AdminLogoutButton'
import AdminAffiliatesManager from '@/components/AdminAffiliatesManager'

export default async function AdminAffiliatesPage() {
  let affiliates: { id: string; login: string; name: string; referral_code: string; commission_percent: number; active: boolean; created_at: string }[] = []
  let counts: Record<string, number> = {}

  try {
    const supabase = createAdminClient()

    const { data } = await supabase
      .from('affiliates')
      .select('*')
      .order('created_at', { ascending: false }) as { data: { id: string; login: string; name: string; referral_code: string; commission_percent: number; active: boolean; created_at: string }[] | null }

    affiliates = data ?? []

    const { data: referralCounts } = await supabase
      .from('affiliate_referrals')
      .select('affiliate_id') as { data: { affiliate_id: string }[] | null }

    referralCounts?.forEach((r) => {
      counts[r.affiliate_id] = (counts[r.affiliate_id] ?? 0) + 1
    })
  } catch {}

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partnerzy afiliacji</h1>
            <p className="text-sm text-gray-500 mt-1">Zarządzaj partnerami programu afiliacyjnego</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
            <Link href="/admin" className="text-blue-600 hover:underline">
              ← Panel admina
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        {affiliates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            Tabele afiliacji nie zostały jeszcze utworzone. Uruchom skrypt SQL w Supabase.
          </div>
        ) : (
          <AdminAffiliatesManager affiliates={affiliates} referralCounts={counts} />
        )}
      </div>
    </main>
  )
}
