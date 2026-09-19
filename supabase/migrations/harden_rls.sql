-- ============================================================
-- HARDENING RLS - usunięcie publicznych polityk zezwalających
-- anon key (wbudowany w bundle przeglądarki) na odczyt/zapis
-- tabel z danymi osobowymi.
--
-- Cały dostęp do aplikacji idzie przez service_role (API routes),
-- który OMIJA RLS - więc po usunięciu tych polityk nic w działaniu
-- serwisu się nie zmienia, a wyciek danych przez REST API znika.
-- ============================================================

-- reservations: publiczny odczyt/wstawianie ujawniał PII (imię, email,
-- opis zgłoszenia, IP, ceny) i pozwalał anon tworzyć rekordy
drop policy if exists "Public insert reservations" on reservations;
drop policy if exists "Public read reservations" on reservations;

-- verification_codes: publiczny odczyt ujawniał kody potwierdzające
-- (przejęcie rezerwacji), publiczny update pozwalał je unieważniać
drop policy if exists "Public insert verification_codes" on verification_codes;
drop policy if exists "Public read verification_codes" on verification_codes;
drop policy if exists "Public update verification_codes" on verification_codes;

-- Polityki "for all using (true)" formalnie dopuszczały KAŻDĄ rolę
-- (anon też), nie tylko service_role - zastąpione scopingiem do roli
drop policy if exists "Service role full access on discount_codes" on discount_codes;
create policy "Service role full access on discount_codes"
  on discount_codes for all to service_role using (true) with check (true);

drop policy if exists "Service role update site_settings" on site_settings;
create policy "Service role update site_settings"
  on site_settings for update to service_role using (true) with check (true);
