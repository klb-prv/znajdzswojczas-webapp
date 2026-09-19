import { createAdminClient } from '@/lib/supabase/server'
import { requireAffiliateContext } from '@/lib/affiliate-auth'
import AffiliateCodesClient, { type PromoCodeItem, type DiscountAssignmentItem } from '@/components/AffiliateCodesClient'

export const SELF_CODE_DISCOUNT_PERCENT = 15

export default async function AffiliateCodesPage() {
  const affiliate = await requireAffiliateContext()
  const supabase = createAdminClient()

  const promoCols = 'id, code, client_discount_rate, affiliate_commission_rate, status, usage_count, created_by'
  const promoColsFallback = 'id, code, client_discount_rate, affiliate_commission_rate, status, usage_count'

  const [promoRes, assignRes] = await Promise.all([
    supabase
      .from('affiliate_promo_codes')
      .select(promoCols)
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('affiliate_discount_code_assignments')
      .select('id, affiliate_commission_rate, discount_codes(id, code, discount_type, discount_value, used_count, active)')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false }),
  ])

  // Fallback: kolumna created_by może jeszcze nie istnieć (migracja nie uruchomiona)
  let promoData = promoRes.data
  let promoMissingColumn = false
  if (promoRes.error) {
    promoMissingColumn = true
    const retry = await supabase
      .from('affiliate_promo_codes')
      .select(promoColsFallback)
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
    promoData = retry.data
  }

  const promoRows = (promoData ?? []) as (PromoCodeItem & { created_by?: string })[]
  // Bez kolumny created_by nie da się wyróżnić kodu własnego - wszystkie są read-only
  const selfCode = promoMissingColumn
    ? null
    : promoRows.find((p) => p.created_by === 'affiliate') ?? null
  const adminPromoCodes = promoMissingColumn
    ? promoRows
    : promoRows.filter((p) => p.created_by !== 'affiliate')

  const discountAssignments: DiscountAssignmentItem[] = ((assignRes.data ?? []) as Record<string, unknown>[]).map((row) => {
    const dc = row.discount_codes as Record<string, unknown> | null
    return {
      id: row.id as string,
      code: (dc?.code as string) ?? '',
      discount_type: (dc?.discount_type as string) ?? '',
      discount_value: (dc?.discount_value as number) ?? 0,
      affiliate_commission_rate: row.affiliate_commission_rate as number,
      used_count: (dc?.used_count as number) ?? 0,
      active: (dc?.active as boolean) ?? false,
    }
  })

  return (
    <AffiliateCodesClient
      selfCode={selfCode}
      adminPromoCodes={adminPromoCodes}
      discountAssignments={discountAssignments}
      selfCodeDiscountPercent={SELF_CODE_DISCOUNT_PERCENT}
    />
  )
}
