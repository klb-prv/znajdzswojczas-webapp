-- Historia logowań kont afiliacyjnych (sekcja "Ostatnie logowania")
create table if not exists affiliate_login_events (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  ip_address text,
  user_agent text,
  success boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists affiliate_login_events_affiliate_id_created_at_idx
  on affiliate_login_events(affiliate_id, created_at desc);

alter table affiliate_login_events enable row level security;
-- brak polityk publicznych: dostęp wyłącznie przez service_role (omija RLS)
