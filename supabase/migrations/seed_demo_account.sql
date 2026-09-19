-- ============================================================
-- KONTO DEMO panelu afiliacyjnego (login: demo / hasło: demo)
-- Uruchom raz w Supabase SQL Editor.
-- Login 'demo' wlacza tryb demo: brak wyplat, kod na 3% zamiast 15%.
-- ============================================================
insert into affiliates (login, name, password_hash, referral_code, commission_percent, active)
values (
  'demo',
  'Konto demo',
  '2a97516c354b68848cdbd8f54a226a0a55b21ed138e207ad6c5cbb9c00aa5aea', -- sha256('demo')
  'DEMO2026',
  10,
  true
)
on conflict (login) do nothing;
