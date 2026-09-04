-- ============================================================
-- AFFILIATES
-- ============================================================
create table affiliates (
  id uuid primary key default gen_random_uuid(),
  login text not null unique,
  name text not null,
  password_hash text not null,
  referral_code text not null unique,
  commission_percent integer not null default 3 check (commission_percent > 0 and commission_percent <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table affiliates enable row level security;

-- ============================================================
-- AFFILIATE PROMO CODES
-- ============================================================
create type promo_code_status as enum ('active', 'inactive', 'archived');

create table affiliate_promo_codes (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  code text not null unique,
  client_discount_rate integer not null default 3 check (client_discount_rate > 0 and client_discount_rate <= 100),
  affiliate_commission_rate integer not null default 3 check (affiliate_commission_rate > 0 and affiliate_commission_rate <= 100),
  status promo_code_status not null default 'active',
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table affiliate_promo_codes enable row level security;

-- ============================================================
-- AFFILIATE COMMISSIONS
-- ============================================================
create type commission_status as enum ('pending', 'available', 'reserved', 'paid', 'cancelled');

create table affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  promo_code_id uuid references affiliate_promo_codes(id) on delete set null,
  promo_code text,
  order_id text,
  service_name text,
  client_discount_rate integer not null default 0,
  affiliate_commission_rate integer not null default 0,
  order_amount numeric not null default 0,
  discount_amount numeric not null default 0,
  final_amount numeric not null default 0,
  commission_amount numeric not null default 0,
  status commission_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table affiliate_commissions enable row level security;

-- ============================================================
-- AFFILIATE PAYOUTS
-- ============================================================
create type payout_status as enum ('pending', 'approved', 'paid', 'rejected');

create table affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  amount numeric not null check (amount > 0),
  status payout_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  paid_at timestamptz
);

alter table affiliate_payouts enable row level security;

-- ============================================================
-- AFFILIATE LINK CLICKS (for stats)
-- ============================================================
create table affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table affiliate_clicks enable row level security;
