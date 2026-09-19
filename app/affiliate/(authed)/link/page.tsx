import { createAdminClient } from '@/lib/supabase/server'
import { requireAffiliateContext } from '@/lib/affiliate-auth'
import AffiliateLinkCopyBox from '@/components/AffiliateLinkCopyBox'

export default async function AffiliateLinkPage() {
  const affiliate = await requireAffiliateContext()
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

  const referrals = (referralsRes.data ?? []) as { status: string }[]
  const fullUrl = `https://znajdzswojczas.pl/?ref=${affiliate.referral_code}`

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">🔗 Twój link afiliacyjny</h1>

      <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-6 space-y-4">
        <p className="text-sm text-gray-600 dark:text-[#9A9AA3]">
          Udostępniaj ten link i otrzymuj prowizję za zakwalifikowane zamówienia.
        </p>

        <AffiliateLinkCopyBox fullUrl={fullUrl} displayUrl={`znajdzswojczas.pl/?ref=${affiliate.referral_code}`} />

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-[#25252D]">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">{clicksRes.count ?? 0}</p>
            <p className="text-xs text-gray-400 dark:text-[#555]">Kliknięcia</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">{referrals.length}</p>
            <p className="text-xs text-gray-400 dark:text-[#555]">Polecenia</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F7]">
              {referrals.filter((r) => r.status === 'available' || r.status === 'reserved' || r.status === 'paid').length}
            </p>
            <p className="text-xs text-gray-400 dark:text-[#555]">Zatwierdzone</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111114] border border-gray-200 dark:border-[#25252D] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-[#F5F5F7] mb-3">Jak to działa?</h2>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-[#9A9AA3]">
          <li className="flex items-start gap-2">
            <span className="text-violet-600 dark:text-[#9277FF] mt-0.5">1.</span>
            Udostępnij swój link afiliacyjny.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-600 dark:text-[#9277FF] mt-0.5">2.</span>
            Klient przechodzi na stronę i składa zamówienie.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-600 dark:text-[#9277FF] mt-0.5">3.</span>
            Po zrealizowaniu i opłaceniu usługi otrzymujesz prowizję.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-600 dark:text-[#9277FF] mt-0.5">4.</span>
            Prowizję możesz wypłacić po osiągnięciu minimalnej kwoty (100 zł).
          </li>
        </ul>
      </div>
    </div>
  )
}
