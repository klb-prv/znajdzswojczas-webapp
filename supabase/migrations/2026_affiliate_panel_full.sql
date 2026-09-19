-- ============================================================
-- PANEL AFILIACYJNY - pełna, idempotentna migracja
-- Uruchom CAŁOŚĆ w Supabase Dashboard -> SQL Editor -> Run.
-- Można wykonywać wielokrotnie (if not exists / IF NOT EXISTS).
-- ============================================================

-- 1. Kto utworzył kod promocyjny: 'admin' czy 'affiliate' (limit 1 własnego kodu 15%)
alter table affiliate_promo_codes
  add column if not exists created_by text not null default 'admin'
  check (created_by in ('admin', 'affiliate'));

-- 2. Powiązanie rezerwacji z użytym kodem (prowizje + zniżki w checkout)
alter table reservations
  add column if not exists affiliate_promo_code_id uuid references affiliate_promo_codes(id) on delete set null,
  add column if not exists discount_code_id uuid references discount_codes(id) on delete set null;

-- 3. Indeksy pod zapytania panelu
create index if not exists reservations_affiliate_promo_code_id_idx
  on reservations(affiliate_promo_code_id);

create index if not exists reservations_discount_code_id_idx
  on reservations(discount_code_id);

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
