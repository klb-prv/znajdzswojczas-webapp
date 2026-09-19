import { createAdminClient } from '@/lib/supabase/server'

type SupabaseClient = ReturnType<typeof createAdminClient>

interface ReservationCodeInfo {
  id: string
  topic: string
  final_price: number | null
  affiliate_promo_code_id: string | null
  discount_code_id: string | null
}

interface ResolvedAffiliate {
  affiliateId: string
  promoCodeId: string | null
  promoCode: string | null
  clientDiscountRate: number
  affiliateCommissionRate: number
}

async function getReservationWithCodes(supabase: SupabaseClient, reservationId: string): Promise<ReservationCodeInfo | null> {
  const { data } = await supabase
    .from('reservations')
    .select('id, topic, final_price, affiliate_promo_code_id, discount_code_id')
    .eq('id', reservationId)
    .maybeSingle()
  return (data as ReservationCodeInfo | null) ?? null
}

// Resolves the affiliate + rates for the code attached to a reservation.
// Affiliate promo codes resolve directly; discount codes resolve via admin assignment.
async function resolveAffiliateForReservation(
  supabase: SupabaseClient,
  res: ReservationCodeInfo
): Promise<ResolvedAffiliate | null> {
  if (res.affiliate_promo_code_id) {
    const { data: promo } = await supabase
      .from('affiliate_promo_codes')
      .select('id, code, affiliate_id, client_discount_rate, affiliate_commission_rate')
      .eq('id', res.affiliate_promo_code_id)
      .maybeSingle()

    if (!promo) return null
    return {
      affiliateId: promo.affiliate_id,
      promoCodeId: promo.id,
      promoCode: promo.code,
      clientDiscountRate: promo.client_discount_rate,
      affiliateCommissionRate: promo.affiliate_commission_rate,
    }
  }

  if (res.discount_code_id) {
    const { data: assignment } = await supabase
      .from('affiliate_discount_code_assignments')
      .select('affiliate_id, affiliate_commission_rate, discount_codes(code)')
      .eq('discount_code_id', res.discount_code_id)
      .maybeSingle()

    if (!assignment) return null
    const dc = assignment.discount_codes as { code: string } | { code: string }[] | null
    const dcCode = Array.isArray(dc) ? dc[0]?.code ?? null : dc?.code ?? null

    return {
      affiliateId: assignment.affiliate_id,
      promoCodeId: null,
      promoCode: dcCode,
      clientDiscountRate: 0,
      affiliateCommissionRate: assignment.affiliate_commission_rate,
    }
  }

  return null
}

async function getExistingCommission(supabase: SupabaseClient, reservationId: string) {
  const { data } = await supabase
    .from('affiliate_commissions')
    .select('id, status, affiliate_commission_rate')
    .eq('order_id', reservationId)
    .maybeSingle()
  return data as { id: string; status: string; affiliate_commission_rate: number } | null
}

function commissionAmount(orderAmount: number, ratePercent: number): number {
  return Math.round(orderAmount * ratePercent) / 100
}

/**
 * Phase 1 - reservation created with an affiliate/discount code.
 * Inserts a 'pending' commission (amounts finalized at payment).
 * Idempotent per order.
 */
export async function createPendingCommissionForReservation(reservationId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const res = await getReservationWithCodes(supabase, reservationId)
  if (!res) return false
  if (!res.affiliate_promo_code_id && !res.discount_code_id) return false

  const existing = await getExistingCommission(supabase, reservationId)
  if (existing) return false

  const resolved = await resolveAffiliateForReservation(supabase, res)
  if (!resolved) return false

  const { error } = await supabase.from('affiliate_commissions').insert({
    affiliate_id: resolved.affiliateId,
    promo_code_id: resolved.promoCodeId,
    promo_code: resolved.promoCode,
    order_id: res.id,
    service_name: res.topic,
    client_discount_rate: resolved.clientDiscountRate,
    affiliate_commission_rate: resolved.affiliateCommissionRate,
    order_amount: 0,
    discount_amount: 0,
    final_amount: 0,
    commission_amount: 0,
    status: 'pending',
  })

  return !error
}

/**
 * Phase 2 - admin confirmed payment. Finalizes amounts and makes the
 * commission 'available' for payout. Handles legacy reservations that
 * have no pending row yet. Never touches reserved/paid/cancelled rows.
 */
export async function finalizeCommissionForPaidReservation(reservationId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const res = await getReservationWithCodes(supabase, reservationId)
  if (!res) return false
  if (!res.affiliate_promo_code_id && !res.discount_code_id) return false

  const orderAmount = Number(res.final_price ?? 0)
  const existing = await getExistingCommission(supabase, reservationId)

  if (existing) {
    if (existing.status !== 'pending') return false

    const commissionAmountValue = commissionAmount(orderAmount, Number(existing.affiliate_commission_rate))
    const { error } = await supabase
      .from('affiliate_commissions')
      .update({
        order_amount: orderAmount,
        final_amount: orderAmount,
        commission_amount: commissionAmountValue,
        status: 'available',
      })
      .eq('id', existing.id)
    return !error
  }

  const resolved = await resolveAffiliateForReservation(supabase, res)
  if (!resolved) return false

  const commissionAmountValue = commissionAmount(orderAmount, resolved.affiliateCommissionRate)
  const { error } = await supabase.from('affiliate_commissions').insert({
    affiliate_id: resolved.affiliateId,
    promo_code_id: resolved.promoCodeId,
    promo_code: resolved.promoCode,
    order_id: res.id,
    service_name: res.topic,
    client_discount_rate: resolved.clientDiscountRate,
    affiliate_commission_rate: resolved.affiliateCommissionRate,
    order_amount: orderAmount,
    discount_amount: 0,
    final_amount: orderAmount,
    commission_amount: commissionAmountValue,
    status: 'available',
  })

  return !error
}

/**
 * Reservation cancelled - drop the pending commission so it never
 * becomes payable. Paid/completed commissions are left untouched.
 */
export async function cancelPendingCommissionsForReservation(reservationId: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('affiliate_commissions')
    .update({ status: 'cancelled' })
    .eq('order_id', reservationId)
    .eq('status', 'pending')
  return !error
}
