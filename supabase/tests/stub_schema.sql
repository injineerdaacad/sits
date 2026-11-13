-- Minimal stand-in for Supabase (roles, auth.uid(), storage.objects) plus the SITS
-- tables, so the RLS migration can be tested on any plain PostgreSQL.
-- Stand-in for Supabase: roles, auth.uid(), storage.objects, and the SITS tables
do $$ begin if not exists (select from pg_roles where rolname='anon') then create role anon nologin; end if; if not exists (select from pg_roles where rolname='authenticated') then create role authenticated nologin; end if; end $$;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
create schema storage; create table storage.objects (id serial primary key, bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated; grant all on storage.objects to anon, authenticated; grant usage on all sequences in schema storage to anon, authenticated;
create table public.cities (id uuid primary key default gen_random_uuid(), name text);
create table public.stations (id uuid primary key default gen_random_uuid(), name text, city_id uuid references public.cities);
create table public.profiles (id uuid primary key, first_name text, last_name text, role text default 'USER', station_id uuid references public.stations, phone text);
create table public.vehicles (id uuid primary key default gen_random_uuid(), plate text, station_id uuid references public.stations, admin_id uuid references public.profiles);
create table public.routes (id uuid primary key default gen_random_uuid(), vehicle_id uuid references public.vehicles, from_city_id uuid references public.cities, to_city_id uuid references public.cities, is_active boolean default true);
create table public.passenger_bookings (id uuid primary key default gen_random_uuid(), route_id uuid references public.routes, user_id uuid references public.profiles, full_name text, seat_count int, status text default 'PENDING');
create table public.cargo_bookings (id uuid primary key default gen_random_uuid(), route_id uuid references public.routes, user_id uuid references public.profiles, status text default 'PENDING');
create table public.payments (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles, passenger_booking_id uuid references public.passenger_bookings, cargo_booking_id uuid references public.cargo_bookings, amount numeric, status text default 'PENDING');
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
