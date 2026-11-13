-- Row Level Security for SITS
--
-- The React app talks to Supabase directly with the public anon key, so these
-- policies are what actually enforce the three roles:
--   SUPER_ADMIN  everything
--   ADMIN        their own station: its vehicles, routes, bookings, payments
--   USER         their own profile, bookings and payments
-- Cities, stations, vehicles and routes are readable by everyone (the public
-- route search needs them).
--
-- Safe to run more than once.

-- ---------------------------------------------------------------------------
-- Helpers. SECURITY DEFINER so policies can read the caller's profile without
-- triggering the profiles policies again (which would recurse).
-- ---------------------------------------------------------------------------
create or replace function public.auth_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = auth.uid()
$$;

create or replace function public.auth_station()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select p.station_id from public.profiles p where p.id = auth.uid()
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(public.auth_role() = 'SUPER_ADMIN', false)
$$;

-- Station that a route belongs to (through its vehicle)
create or replace function public.route_station(p_route_id uuid)
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select v.station_id
  from public.routes r
  join public.vehicles v on v.id = r.vehicle_id
  where r.id = p_route_id
$$;

-- True when the caller is an ADMIN of the station that owns the route
create or replace function public.admins_route(p_route_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(
    public.auth_role() = 'ADMIN'
      and public.auth_station() is not null
      and public.route_station(p_route_id) = public.auth_station(),
    false)
$$;

-- True when the caller is an ADMIN of a station where this user has a booking
create or replace function public.admins_customer(p_user_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(public.auth_role() = 'ADMIN', false) and (
    exists (select 1 from public.passenger_bookings b
            where b.user_id = p_user_id and public.admins_route(b.route_id))
    or exists (select 1 from public.cargo_bookings b
               where b.user_id = p_user_id and public.admins_route(b.route_id))
  )
$$;

revoke all on function public.auth_role(), public.auth_station(), public.is_super_admin(),
  public.route_station(uuid), public.admins_route(uuid), public.admins_customer(uuid) from public;
grant execute on function public.auth_role(), public.auth_station(), public.is_super_admin(),
  public.route_station(uuid), public.admins_route(uuid), public.admins_customer(uuid)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS on every table
-- ---------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.cities              enable row level security;
alter table public.stations            enable row level security;
alter table public.vehicles            enable row level security;
alter table public.routes              enable row level security;
alter table public.passenger_bookings  enable row level security;
alter table public.cargo_bookings      enable row level security;
alter table public.payments            enable row level security;

-- Drop every existing policy on these tables so the set below is the only one
do $$
declare pol record;
begin
  for pol in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'cities', 'stations', 'vehicles', 'routes',
                        'passenger_bookings', 'cargo_bookings', 'payments')
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles: read own, super admin all, admin their customers"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_super_admin() or public.admins_customer(id));

-- Sign-up creates a plain USER profile; only a super admin can create staff
create policy "profiles: create own USER profile or super admin"
  on public.profiles for insert to authenticated
  with check (
    public.is_super_admin()
    or (id = auth.uid() and role = 'USER' and station_id is null)
  );

create policy "profiles: update own or super admin"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

create policy "profiles: super admin deletes"
  on public.profiles for delete to authenticated
  using (public.is_super_admin());

-- A user editing their own profile must not change their role or station
create or replace function public.protect_profile_role()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_super_admin()
     and (new.role is distinct from old.role
          or new.station_id is distinct from old.station_id) then
    raise exception 'Only a super admin can change role or station'
      using errcode = '42501';
  end if;
  return new;
end
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- cities, stations: public read, super admin writes
-- ---------------------------------------------------------------------------
create policy "cities: everyone reads" on public.cities
  for select to anon, authenticated using (true);
create policy "cities: super admin writes" on public.cities
  for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

create policy "stations: everyone reads" on public.stations
  for select to anon, authenticated using (true);
create policy "stations: super admin writes" on public.stations
  for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- vehicles: public read; super admin, or admin of the vehicle's station, writes
-- ---------------------------------------------------------------------------
create policy "vehicles: everyone reads" on public.vehicles
  for select to anon, authenticated using (true);
create policy "vehicles: super admin or station admin writes" on public.vehicles
  for all to authenticated
  using (public.is_super_admin()
         or (public.auth_role() = 'ADMIN' and station_id = public.auth_station()))
  with check (public.is_super_admin()
              or (public.auth_role() = 'ADMIN' and station_id = public.auth_station()));

-- ---------------------------------------------------------------------------
-- routes: public read; super admin, or admin of the route's station, writes
-- ---------------------------------------------------------------------------
create policy "routes: everyone reads" on public.routes
  for select to anon, authenticated using (true);
create policy "routes: super admin or station admin writes" on public.routes
  for all to authenticated
  using (public.is_super_admin()
         or (public.auth_role() = 'ADMIN' and exists (
               select 1 from public.vehicles v
               where v.id = vehicle_id and v.station_id = public.auth_station())))
  with check (public.is_super_admin()
              or (public.auth_role() = 'ADMIN' and exists (
                    select 1 from public.vehicles v
                    where v.id = vehicle_id and v.station_id = public.auth_station())));

-- ---------------------------------------------------------------------------
-- passenger_bookings, cargo_bookings
--   USER: own bookings; create as PENDING; while PENDING edit or cancel/delete
--   ADMIN: bookings on their station's routes
-- ---------------------------------------------------------------------------
create policy "passenger_bookings: read" on public.passenger_bookings
  for select to authenticated
  using (user_id = auth.uid() or public.is_super_admin() or public.admins_route(route_id));

create policy "passenger_bookings: create" on public.passenger_bookings
  for insert to authenticated
  with check (
    (user_id = auth.uid() and status = 'PENDING')
    or public.is_super_admin() or public.admins_route(route_id)
  );

create policy "passenger_bookings: update" on public.passenger_bookings
  for update to authenticated
  using (public.is_super_admin() or public.admins_route(route_id)
         or (user_id = auth.uid() and status = 'PENDING'))
  with check (public.is_super_admin() or public.admins_route(route_id)
              or (user_id = auth.uid() and status in ('PENDING', 'CANCELLED')));

create policy "passenger_bookings: delete" on public.passenger_bookings
  for delete to authenticated
  using (public.is_super_admin() or (user_id = auth.uid() and status = 'PENDING'));

create policy "cargo_bookings: read" on public.cargo_bookings
  for select to authenticated
  using (user_id = auth.uid() or public.is_super_admin() or public.admins_route(route_id));

create policy "cargo_bookings: create" on public.cargo_bookings
  for insert to authenticated
  with check (
    (user_id = auth.uid() and status = 'PENDING')
    or public.is_super_admin() or public.admins_route(route_id)
  );

create policy "cargo_bookings: update" on public.cargo_bookings
  for update to authenticated
  using (public.is_super_admin() or public.admins_route(route_id)
         or (user_id = auth.uid() and status = 'PENDING'))
  with check (public.is_super_admin() or public.admins_route(route_id)
              or (user_id = auth.uid() and status in ('PENDING', 'CANCELLED')));

create policy "cargo_bookings: delete" on public.cargo_bookings
  for delete to authenticated
  using (public.is_super_admin() or (user_id = auth.uid() and status = 'PENDING'));

-- ---------------------------------------------------------------------------
-- payments
--   USER: own payments; may only submit PENDING payments for their own booking
--   ADMIN: payments for bookings on their station's routes (mark PAID/FAILED)
-- ---------------------------------------------------------------------------
create or replace function public.admins_payment(p_passenger_booking_id uuid, p_cargo_booking_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(public.auth_role() = 'ADMIN', false) and (
    exists (select 1 from public.passenger_bookings b
            where b.id = p_passenger_booking_id and public.admins_route(b.route_id))
    or exists (select 1 from public.cargo_bookings b
               where b.id = p_cargo_booking_id and public.admins_route(b.route_id))
  )
$$;
revoke all on function public.admins_payment(uuid, uuid) from public;
grant execute on function public.admins_payment(uuid, uuid) to authenticated;

create policy "payments: read" on public.payments
  for select to authenticated
  using (user_id = auth.uid() or public.is_super_admin()
         or public.admins_payment(passenger_booking_id, cargo_booking_id));

create policy "payments: user submits pending payment for own booking" on public.payments
  for insert to authenticated
  with check (
    public.is_super_admin()
    or (user_id = auth.uid() and status = 'PENDING' and (
          exists (select 1 from public.passenger_bookings b
                  where b.id = passenger_booking_id and b.user_id = auth.uid())
          or exists (select 1 from public.cargo_bookings b
                     where b.id = cargo_booking_id and b.user_id = auth.uid())))
  );

create policy "payments: staff update" on public.payments
  for update to authenticated
  using (public.is_super_admin() or public.admins_payment(passenger_booking_id, cargo_booking_id))
  with check (public.is_super_admin() or public.admins_payment(passenger_booking_id, cargo_booking_id));

create policy "payments: super admin deletes" on public.payments
  for delete to authenticated
  using (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- Storage: avatars bucket. Files are named "<user id>-<random>.<ext>".
-- ---------------------------------------------------------------------------
drop policy if exists "avatars: everyone reads" on storage.objects;
drop policy if exists "avatars: users manage their own" on storage.objects;

create policy "avatars: everyone reads" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

create policy "avatars: users manage their own" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars'
         and (name like auth.uid()::text || '-%' or public.is_super_admin()))
  with check (bucket_id = 'avatars'
              and (name like auth.uid()::text || '-%' or public.is_super_admin()));
