-- ============================================================
-- PANEL AFILIACYJNY - pełna, samowystarczalna, idempotentna migracja
-- Uruchom CAŁOŚĆ w Supabase Dashboard -> SQL Editor -> Run.
-- Tworzy brakujące tabele afiliacyjne, dokleja brakujące kolumny
-- i indeksy. Bezpieczna do wielokrotnego uruchomienia.
-- ============================================================

-- ─── Typy enum (CREATE TYPE nie ma IF NOT EXISTS - używamy DO) ───
do $$ begin
  if not exists (select 1 from pg_type where typname = 'promo_code_status') then
    create type promo_code_status as enum ('active', 'inactive', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'commission_status') then
    create type commission_status as enum ('pending', 'available', 'reserved', 'paid', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'payout_status') then
    create type payout_status as enum ('pending', 'approved', 'paid', 'rejected');
  end if;
end $$;

-- ─── Tabele bazowe (jeśli starsza baza ich nie ma) ───
create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  expires_at timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- ─── Tabele afiliacyjne ───
create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  login text not null unique,
  name text not null,
  password_hash text not null,
  referral_code text not null unique,
  commission_percent integer not null default 3 check (commission_percent > 0 and commission_percent <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists affiliate_promo_codes (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  code text not null unique,
  client_discount_rate integer not null default 3 check (client_discount_rate > 0 and client_discount_rate <= 100),
  affiliate_commission_rate integer not null default 3 check (affiliate_commission_rate > 0 and affiliate_commission_rate <= 100),
  status promo_code_status not null default 'active',
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists affiliate_commissions (
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

create table if not exists affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  amount numeric not null check (amount > 0),
  status payout_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  paid_at timestamptz
);

create table if not exists affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists affiliate_discount_code_assignments (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  discount_code_id uuid not null references discount_codes(id) on delete cascade,
  affiliate_commission_rate integer not null default 3 check (affiliate_commission_rate > 0 and affiliate_commission_rate <= 100),
  created_at timestamptz not null default now(),
  unique(discount_code_id)
);

-- ─── Kolumny doklejane do już istniejących tabel ───

-- 1. Kto utworzył kod promocyjny: 'admin' czy 'affiliate' (limit 1 własnego kodu 15%)
alter table affiliate_promo_codes
  add column if not exists created_by text not null default 'admin'
  check (created_by in ('admin', 'affiliate'));

-- 2. Powiązanie rezerwacji z użytym kodem (prowizje + zniżki w checkout)
alter table reservations
  add column if not exists affiliate_promo_code_id uuid references affiliate_promo_codes(id) on delete set null,
  add column if not exists discount_code_id uuid references discount_codes(id) on delete set null;

-- ─── RLS (włączony, pełny dostęp przez service_role, który go omija) ───
alter table affiliates enable row level security;
alter table affiliate_promo_codes enable row level security;
alter table affiliate_commissions enable row level security;
alter table affiliate_payouts enable row level security;
alter table affiliate_clicks enable row level security;
alter table affiliate_discount_code_assignments enable row level security;
alter table discount_codes enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'discount_codes' and policyname = 'Service role full access on discount_codes'
  ) then
    create policy "Service role full access on discount_codes"
      on discount_codes for all using (true) with check (true);
  end if;
end $$;

-- ─── Indeksy pod zapytania panelu i checkout ───
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
