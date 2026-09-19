-- Indexes backing the affiliate panel queries (hot paths: per-affiliate lists and code lookups)

create index if not exists affiliate_commissions_affiliate_id_created_at_idx
  on affiliate_commissions(affiliate_id, created_at desc);

create index if not exists affiliate_commissions_order_id_idx
  on affiliate_commissions(order_id);

create index if not exists affiliate_promo_codes_affiliate_id_idx
  on affiliate_promo_codes(affiliate_id);

create index if not exists affiliate_payouts_affiliate_id_created_at_idx
  on affiliate_payouts(affiliate_id, created_at desc);

create index if not exists affiliate_clicks_affiliate_id_idx
  on affiliate_clicks(affiliate_id);

create index if not exists affiliate_discount_code_assignments_affiliate_id_idx
  on affiliate_discount_code_assignments(affiliate_id);
