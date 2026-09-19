-- Track who created an affiliate promo code: 'admin' or 'affiliate'
-- Affiliates may self-create max 1 code (15%); admin-created codes are read-only for them.
alter table affiliate_promo_codes
  add column if not exists created_by text not null default 'admin'
  check (created_by in ('admin', 'affiliate'));
