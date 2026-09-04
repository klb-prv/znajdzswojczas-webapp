import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminLogoutButton from '@/components/AdminLogoutButton'
import AdminAffiliatesManager from '@/components/AdminAffiliatesManager'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active:    { label: 'Aktywny',    color: 'bg-green-100 text-green-700' },
  blocked:   { label: 'Zablokowany', color: 'bg-red-100 text-red-700' },
  archived:  { label: 'Zarchiwizowany', color: 'bg-gray-100 text-gray-500' },
}

export default async function AdminAffiliatesPage() {
  const supabase = createAdminClient()

  const { data: affiliates } = await supabase
    .from('affiliates')
    .select('*')
    .order('created_at', { ascending: false }) as { data: { id: string; login: string; name: string; referral_code: string; commission_percent: number; active: boolean; created_at: string }[] | null }

  const { data: referralCounts } = await supabase
    .from('affiliate_referrals')
    .select('affiliate_id') as { data: { affiliate_id: string }[] | null }

  const counts: Record<string, number> = {}
  referralCounts?.forEach((r) => {
    counts[r.affiliate_id] = (counts[r.affiliate_id] ?? 0) + 1
  })

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

        <AdminAffiliatesManager affiliates={affiliates ?? []} referralCounts={counts} />
      </div>
    </main>
  )
}
