-- Uruchom w Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- 1. Dodaj nowy status do enuma
ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'awaiting_payment';

-- 2. Dodaj kolumnę final_price do tabeli rezerwacji
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS final_price numeric;

-- 3. Dodaj kolumnę reservation_number (krótkie ID wyświetlane klientowi)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS reservation_number text;

-- 4. Uzupełnij reservation_number dla istniejących rekordów
UPDATE reservations SET reservation_number = UPPER(LEFT(id::text, 8)) WHERE reservation_number IS NULL;
