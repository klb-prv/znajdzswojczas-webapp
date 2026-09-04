export type ReservationStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'rescheduled'
  | 'cancelled'

export type BlockType = 'vacation' | 'manual'

export type SiteStatus = 'accepting' | 'maintenance' | 'closed'

export type DiscountType = 'percent' | 'fixed'

export interface SiteSettings {
  id: number
  status: SiteStatus
  status_message: string | null
  updated_at: string
}

export interface DiscountCode {
  id: string
  code: string
  discount_type: DiscountType
  discount_value: number
  expires_at: string | null
  max_uses: number | null
  used_count: number
  active: boolean
  created_at: string
}

export interface BlockedDate {
  id: string
  date: string
  block_type: BlockType
  reason: string | null
  created_at: string
}

export interface Reservation {
  id: string
  date: string
  name: string
  email: string
  topic: string
  description: string
  status: ReservationStatus
  cancel_reason: string | null
  reschedule_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface VerificationCode {
  id: string
  reservation_id: string
  code: string
  expires_at: string
  used: boolean
}

export interface Affiliate {
  id: string
  login: string
  name: string
  referral_code: string
  commission_percent: number
  active: boolean
  created_at: string
}

export type ReferralStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export interface AffiliateReferral {
  id: string
  affiliate_id: string
  reservation_id: string | null
  client_label: string
  service_name: string
  order_value: number
  commission_amount: number
  status: ReferralStatus
  created_at: string
}

export type CommissionStatus = 'pending' | 'available' | 'reserved' | 'paid' | 'cancelled'

export interface AffiliateCommission {
  id: string
  affiliate_id: string
  promo_code_id: string | null
  promo_code: string | null
  order_id: string | null
  service_name: string | null
  client_discount_rate: number
  affiliate_commission_rate: number
  order_amount: number
  discount_amount: number
  final_amount: number
  commission_amount: number
  status: CommissionStatus
  created_at: string
}

export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected'

export interface AffiliatePayout {
  id: string
  affiliate_id: string
  amount: number
  status: PayoutStatus
  rejection_reason: string | null
  created_at: string
  approved_at: string | null
  paid_at: string | null
}

export type PromoCodeStatus = 'active' | 'inactive' | 'archived'

export interface AffiliatePromoCode {
  id: string
  affiliate_id: string
  code: string
  client_discount_rate: number
  affiliate_commission_rate: number
  status: PromoCodeStatus
  usage_count: number
  created_at: string
}
