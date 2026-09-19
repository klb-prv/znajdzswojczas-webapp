-- Link reservations to the affiliate code used at checkout so commissions
-- can be recorded when the order is marked as paid.
alter table reservations
  add column if not exists affiliate_promo_code_id uuid references affiliate_promo_codes(id) on delete set null,
  add column if not exists discount_code_id uuid references discount_codes(id) on delete set null;

create index if not exists reservations_affiliate_promo_code_id_idx
  on reservations(affiliate_promo_code_id);

create index if not exists reservations_discount_code_id_idx
  on reservations(discount_code_id);
