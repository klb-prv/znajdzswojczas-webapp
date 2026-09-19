-- Email partnera: wymagany przy tworzeniu, potrzebny do wysyłki zaproszenia
-- ze danymi do logowania. Nullable dla już istniejących kont.
alter table affiliates
  add column if not exists email text;
