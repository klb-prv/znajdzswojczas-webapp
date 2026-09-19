import { createAdminClient } from '@/lib/supabase/server'

export interface PromoDiscount {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
}

/**
 * Walidacja kodu do baneru promo. Sprawdza kody rabatowe (discount_codes),
 * a następnie kody promocyjne partnerów (affiliate_promo_codes), żeby
 * partner mógł osadzać baner z własnym kodem.
 */
export async function fetchPromoDiscount(code: string): Promise<PromoDiscount | null> {
  const supabase = createAdminClient()
  const normalized = code.toUpperCase().trim()
  if (!normalized) return null

  const { data: dc } = await supabase
    .from('discount_codes')
    .select('code, discount_type, discount_value, active, expires_at, max_uses, used_count')
    .eq('code', normalized)
    .maybeSingle()

  if (dc) {
    if (!dc.active) return null
    if (dc.expires_at && new Date(dc.expires_at) < new Date()) return null
    if (dc.max_uses !== null && dc.used_count >= dc.max_uses) return null
    return {
      code: dc.code,
      discount_type: dc.discount_type as 'percent' | 'fixed',
      discount_value: dc.discount_value as number,
    }
  }

  const { data: promo } = await supabase
    .from('affiliate_promo_codes')
    .select('code, status, client_discount_rate')
    .eq('code', normalized)
    .maybeSingle()

  if (promo && promo.status === 'active') {
    return {
      code: promo.code,
      discount_type: 'percent',
      discount_value: promo.client_discount_rate,
    }
  }

  return null
}
