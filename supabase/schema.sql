-- ============================================================
-- BLOCKED DATES (admin blokuje dni -urlop lub ręcznie)
-- Domyślnie wszystkie przyszłe daty są wolne.
-- Admin dodaje TYLKO daty, które mają być zablokowane.
-- ============================================================
create type block_type as enum ('vacation', 'manual');

create table blocked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  block_type block_type not null default 'manual',
  reason text,
  created_at timestamptz default now()
);

-- ============================================================
-- RESERVATIONS
-- Data przechowywana bezpośrednio (bez FK do blocked_dates).
-- ============================================================
create type reservation_status as enum (
  'pending_confirmation', -- czeka na kod z maila
  'confirmed',            -- potwierdzona
  'rescheduled',          -- przełożona przez admina
  'cancelled',            -- odwołana
  'awaiting_payment'      -- zrealizowana, oczekuje na płatność
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  name text not null,
  email text not null,
  topic text not null,
  description text not null check (char_length(description) >= 100),
  status reservation_status default 'pending_confirmation',
  cancel_reason text,
  reschedule_reason text,
  notes text,
  final_price numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- VERIFICATION CODES
-- ============================================================
create table verification_codes (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- ADMIN USERS -stwórz usera w Supabase Auth Dashboard

-- Trigger: updated_at na reservations
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger reservations_updated_at
  before update on reservations
  for each row execute function update_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table blocked_dates enable row level security;
alter table reservations enable row level security;
alter table verification_codes enable row level security;

-- Publiczny odczyt zablokowanych dat (potrzebny do kalendarza)
create policy "Public read blocked_dates"
  on blocked_dates for select using (true);

-- Publiczne tworzenie i odczyt rezerwacji
create policy "Public insert reservations"
  on reservations for insert with check (true);

create policy "Public read reservations"
  on reservations for select using (true);

-- Kody weryfikacyjne
create policy "Public insert verification_codes"
  on verification_codes for insert with check (true);

create policy "Public read verification_codes"
  on verification_codes for select using (true);

create policy "Public update verification_codes"
  on verification_codes for update using (true);

-- Admin ma pełny dostęp (przez service_role key w API)

-- ============================================================
-- KODY ZNIŻKOWE
-- ============================================================
create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  expires_at timestamptz,     -- null = nigdy nie wygasa
  max_uses integer,           -- null = nieograniczone użycia
  used_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table discount_codes enable row level security;

-- Osobne polityki dla każdej operacji (service_role przez bypass, ale dla bezpieczeństwa explicite)
create policy "Service role full access on discount_codes"
  on discount_codes for all using (true) with check (true);

-- ============================================================
-- USTAWIENIA SERWISU (singleton -zawsze wiersz z id=1)
-- ============================================================
create table site_settings (
  id integer primary key default 1 check (id = 1),
  status text not null default 'accepting'
    check (status in ('accepting', 'maintenance', 'closed')),
  status_message text,
  updated_at timestamptz default now()
);

insert into site_settings (id, status)
  values (1, 'accepting')
  on conflict (id) do nothing;

alter table site_settings enable row level security;
create policy "Public read site_settings"
  on site_settings for select using (true);
create policy "Service role update site_settings"
  on site_settings for update using (true);

-- ============================================================
-- ADMIN USERS -logowanie emailem + TOTP 2FA
-- ============================================================
create table admin_users (
  id serial primary key,
  email text not null unique,
  totp_secret text,
  totp_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;
-- Brak policies = dostęp wyłącznie przez service_role (pomija RLS)
