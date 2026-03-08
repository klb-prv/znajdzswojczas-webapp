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
