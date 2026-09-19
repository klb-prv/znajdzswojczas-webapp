import { createAdminClient } from '@/lib/supabase/server'

/**
 * Records a pending affiliate commission for a paid reservation.
 * Idempotent: skips if a commission already exists for the order.
 * Returns true when a commission row was inserted.
 */
export async function recordAffiliateCommissionForReservation(reservationId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { data: res } = await supabase
    .from('reservations')
    .select('id, topic, final_price, affiliate_promo_code_id, discount_code_id')
    .eq('id', reservationId)
    .maybeSingle()

  if (!res) return false
  if (!res.affiliate_promo_code_id && !res.discount_code_id) return false

  const { data: existing } = await supabase
    .from('affiliate_commissions')
    .select('id')
    .eq('order_id', reservationId)
    .maybeSingle()

  if (existing) return false

  let affiliateId: string | null = null
  let promoCodeId: string | null = null
  let promoCode: string | null = null
  let clientDiscountRate = 0
  let affiliateCommissionRate = 0

  if (res.affiliate_promo_code_id) {
    const { data: promo } = await supabase
      .from('affiliate_promo_codes')
      .select('id, code, affiliate_id, client_discount_rate, affiliate_commission_rate')
      .eq('id', res.affiliate_promo_code_id)
      .maybeSingle()

    if (!promo) return false
    affiliateId = promo.affiliate_id
    promoCodeId = promo.id
    promoCode = promo.code
    clientDiscountRate = promo.client_discount_rate
    affiliateCommissionRate = promo.affiliate_commission_rate
  } else if (res.discount_code_id) {
    const { data: assignment } = await supabase
      .from('affiliate_discount_code_assignments')
      .select('affiliate_id, affiliate_commission_rate, discount_codes(code)')
      .eq('discount_code_id', res.discount_code_id)
      .maybeSingle()

    if (!assignment) return false
    const dc = assignment.discount_codes as { code: string } | { code: string }[] | null
    const dcCode = Array.isArray(dc) ? dc[0]?.code ?? null : dc?.code ?? null

    affiliateId = assignment.affiliate_id
    promoCode = dcCode
    clientDiscountRate = 0
    affiliateCommissionRate = assignment.affiliate_commission_rate
  }

  if (!affiliateId) return false

  const orderAmount = Number(res.final_price ?? 0)
  const commissionAmount = Math.round(orderAmount * affiliateCommissionRate) / 100

  const { error } = await supabase.from('affiliate_commissions').insert({
    affiliate_id: affiliateId,
    promo_code_id: promoCodeId,
    promo_code: promoCode,
    order_id: res.id,
    service_name: res.topic,
    client_discount_rate: clientDiscountRate,
    affiliate_commission_rate: affiliateCommissionRate,
    order_amount: orderAmount,
    discount_amount: 0,
    final_amount: orderAmount,
    commission_amount: commissionAmount,
    status: 'pending',
  })

  return !error
}
