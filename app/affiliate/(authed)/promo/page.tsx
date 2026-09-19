import { createAdminClient } from '@/lib/supabase/server'
import { requireAffiliateContext } from '@/lib/affiliate-auth'
import AffiliatePromoMaterials from '@/components/AffiliatePromoMaterials'

export default async function AffiliatePromoPage() {
  const affiliate = await requireAffiliateContext()
  const supabase = createAdminClient()

  // Preferuj aktywny kod promocyjny partnera, w ostateczności aktywny przypisany kod rabatowy.
  const { data: promoCodes } = await supabase
    .from('affiliate_promo_codes')
    .select('code')
    .eq('affiliate_id', affiliate.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  let partnerCode = promoCodes?.[0]?.code ?? ''

  if (!partnerCode) {
    const { data: assigns } = await supabase
      .from('affiliate_discount_code_assignments')
      .select('discount_codes(code, active)')
      .eq('affiliate_id', affiliate.id)

    const active = (assigns ?? [])
      .map((row: Record<string, unknown>) => row.discount_codes as { code: string; active: boolean } | null)
      .find((dc: { code: string; active: boolean } | null) => dc?.active)

    partnerCode = active?.code ?? ''
  }

  return <AffiliatePromoMaterials partnerCode={partnerCode} />
}
