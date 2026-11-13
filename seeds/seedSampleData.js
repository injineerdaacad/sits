// Sample data for showing SITS (interview / presentation).
//
//   node seeds/seedSampleData.js           remove old sample data, then create it again
//   node seeds/seedSampleData.js --reset   only remove the sample data
//
// Runs SQL on the Supabase project through the Supabase CLI (`npx supabase login`
// first). Everything created here has a fixed id derived from a key, so re-runs
// replace only this data; existing cities, stations, users and bookings are left
// alone. Departure times are relative to now (Africa/Mogadishu, UTC+3).
//
// Accounts: tester1..tester4@sits.kalsooni.com (USER) and
// admin.baidoa@sits.kalsooni.com (ADMIN of the Baidoa station), email confirmed.
// Password: SAMPLE_PASSWORD from the environment, or a random one printed at the
// end. It is never stored in this repository.
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'jidbnnanhjerqviabiey'
const RESET_ONLY = process.argv.includes('--reset')
const PASSWORD = process.env.SAMPLE_PASSWORD || randomBytes(6).toString('base64url')
if (PASSWORD.length < 6) throw new Error('SAMPLE_PASSWORD must be at least 6 characters')

const lit = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
const id = (key) => `md5('sits-sample:${key}')::uuid`

// --- data -----------------------------------------------------------------
const CITIES = ['Baidoa', 'Beledweyne', 'Galkacyo', 'Garowe']
const STATIONS = [
  { key: 'st-baidoa', name: 'Baidoa Central', city: 'Baidoa', details: 'Near Baidoa main market' },
  { key: 'st-beledweyne', name: 'Beledweyne Koshin', city: 'Beledweyne', details: 'Koshin district, by the bridge' },
  { key: 'st-galkacyo', name: 'Galkacyo Garsoor', city: 'Galkacyo', details: 'Garsoor, on the main road' },
  { key: 'st-garowe', name: 'Garowe Main', city: 'Garowe', details: 'Next to Garowe livestock market' },
]
const USERS = [
  { key: 'u-admin-baidoa', email: 'admin.baidoa@sits.kalsooni.com', first: 'Abdullahi', last: 'Baidoa Admin', role: 'ADMIN', station: 'st-baidoa', phone: '+252610000101' },
  { key: 'u-tester1', email: 'tester1@sits.kalsooni.com', first: 'Hodan', last: 'Abdi', role: 'USER', phone: '+252610000201' },
  { key: 'u-tester2', email: 'tester2@sits.kalsooni.com', first: 'Ahmed', last: 'Warsame', role: 'USER', phone: '+252610000202' },
  { key: 'u-tester3', email: 'tester3@sits.kalsooni.com', first: 'Fadumo', last: 'Nur', role: 'USER', phone: '+252610000203' },
  { key: 'u-tester4', email: 'tester4@sits.kalsooni.com', first: 'Yusuf', last: 'Omar', role: 'USER', phone: '+252610000204' },
]
// station: a key from STATIONS, or the name of an existing station
const VEHICLES = [
  { key: 'v-xamar', name: 'Xamar Minibus', type: 'MINIBUS', service: 'BOTH', station: { existing: 'Bakaaraha' } },
  { key: 'v-baydhabo', name: 'Baydhabo Express', type: 'BUS', service: 'PASSENGER', station: 'st-baidoa', admin: 'u-admin-baidoa' },
  { key: 'v-baycargo', name: 'Bay Cargo', type: 'TRUCK', service: 'CARGO', station: 'st-baidoa', admin: 'u-admin-baidoa' },
  { key: 'v-mudug', name: 'Mudug Coaster', type: 'COASTER', service: 'BOTH', station: 'st-galkacyo' },
  { key: 'v-nugaal', name: 'Nugaal Van', type: 'VAN', service: 'PASSENGER', station: 'st-garowe' },
]
// day: days from today, at: local time HH:MM
const ROUTES = [
  { key: 'r1', vehicle: 'v-xamar', from: 'Mogadishu', to: 'Baidoa', day: 1, at: '06:30', place: 'Bakaaraha station', pp: 25, cp: 0.5 },
  { key: 'r2', vehicle: 'v-baydhabo', from: 'Baidoa', to: 'Mogadishu', day: 2, at: '07:00', place: 'Baidoa Central station', pp: 25, cp: null },
  { key: 'r3', vehicle: 'v-xamar', from: 'Mogadishu', to: 'Beledweyne', day: 3, at: '06:00', place: 'Bakaaraha station', pp: 30, cp: 0.6 },
  { key: 'r4', vehicle: 'v-baycargo', from: 'Baidoa', to: 'Kismaayo', day: 4, at: '05:00', place: 'Baidoa Central station', pp: null, cp: 0.8 },
  { key: 'r5', vehicle: 'v-mudug', from: 'Galkacyo', to: 'Garowe', day: 2, at: '08:00', place: 'Garsoor station', pp: 20, cp: 0.4 },
  { key: 'r6', vehicle: 'v-nugaal', from: 'Garowe', to: 'Galkacyo', day: 3, at: '14:00', place: 'Garowe Main station', pp: 20, cp: null },
  { key: 'r7', vehicle: 'v-mudug', from: 'Galkacyo', to: 'Mogadishu', day: 5, at: '05:30', place: 'Garsoor station', pp: 45, cp: 0.7 },
]
const PASSENGER_BOOKINGS = [
  { key: 'pb1', route: 'r1', user: 'u-tester1', seats: 2, status: 'CONFIRMED', pay: { method: 'MOBILE_MONEY', status: 'PAID', ref: 'EVC-48213' } },
  { key: 'pb2', route: 'r2', user: 'u-tester2', seats: 1, status: 'PENDING', pay: { method: 'MOBILE_MONEY', status: 'PENDING', ref: 'EVC-55190' } },
  { key: 'pb3', route: 'r5', user: 'u-tester3', seats: 1, status: 'CANCELLED' },
  { key: 'pb4', route: 'r7', user: 'u-tester2', seats: 3, status: 'CONFIRMED', pay: { method: 'CASH', status: 'PAID', ref: null } },
]
const CARGO_BOOKINGS = [
  { key: 'cb1', route: 'r4', user: 'u-tester1', kg: 120, status: 'CONFIRMED', sender: ['Hodan Abdi', '+252610000201'], receiver: ['Ali Hassan', '+252610000301'], pay: { method: 'CASH', status: 'PAID' } },
  { key: 'cb2', route: 'r1', user: 'u-tester3', kg: 40, status: 'PENDING', sender: ['Fadumo Nur', '+252610000203'], receiver: ['Mariam Aden', '+252610000302'] },
]

// --- SQL ------------------------------------------------------------------
const users = Object.fromEntries(USERS.map((u) => [u.key, u]))
const keysOf = (rows) => rows.map((r) => id(r.key)).join(', ')

const removeSql = `
delete from public.payments where id in (${[...PASSENGER_BOOKINGS, ...CARGO_BOOKINGS].map((b) => id('pay-' + b.key)).join(', ')});
delete from public.passenger_bookings where id in (${keysOf(PASSENGER_BOOKINGS)});
delete from public.cargo_bookings where id in (${keysOf(CARGO_BOOKINGS)});
delete from public.routes where id in (${keysOf(ROUTES)});
delete from public.vehicles where id in (${keysOf(VEHICLES)});
delete from public.profiles where id in (${keysOf(USERS)});
delete from auth.identities where user_id in (${keysOf(USERS)});
delete from auth.users where id in (${keysOf(USERS)});
delete from public.stations where id in (${keysOf(STATIONS)});
delete from public.cities where id in (${CITIES.map((c) => id('city-' + c)).join(', ')});
`

const cityId = (name) => `(select id from public.cities where name = ${lit(name)})`
const stationId = (s) => (typeof s === 'string' ? id(s) : `(select id from public.stations where name = ${lit(s.existing)} limit 1)`)
const mogTime = (day, at) => `((current_timestamp at time zone 'Africa/Mogadishu')::date + ${day} + time ${lit(at)}) at time zone 'Africa/Mogadishu'`
const price = (route, b, kind) => (kind === 'p' ? route.pp * b.seats : route.cp * b.kg)

const seedSql = `
-- cities (existing names are kept as they are)
insert into public.cities (id, name) values
${CITIES.map((c) => `  (${id('city-' + c)}, ${lit(c)})`).join(',\n')}
on conflict (name) do nothing;

insert into public.stations (id, name, city_id, location_details) values
${STATIONS.map((s) => `  (${id(s.key)}, ${lit(s.name)}, ${cityId(s.city)}, ${lit(s.details)})`).join(',\n')};

-- accounts: confirmed email + password; on_auth_user_created makes the profile
${USERS.map((u) => `
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', ${id(u.key)}, 'authenticated', 'authenticated', ${lit(u.email)},
  extensions.crypt(${lit(PASSWORD)}, extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('first_name', ${lit(u.first)}, 'last_name', ${lit(u.last)}), now(), now(), '', '', '', '');
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), ${id(u.key)}, ${id(u.key)}::text,
  jsonb_build_object('sub', ${id(u.key)}::text, 'email', ${lit(u.email)}, 'email_verified', true), 'email', now(), now(), now());
insert into public.profiles (id, first_name, last_name, role, station_id, phone)
values (${id(u.key)}, ${lit(u.first)}, ${lit(u.last)}, ${lit(u.role)}, ${u.station ? id(u.station) : 'null'}, ${lit(u.phone)})
on conflict (id) do update set first_name = excluded.first_name, last_name = excluded.last_name,
  role = excluded.role, station_id = excluded.station_id, phone = excluded.phone;`).join('\n')}

insert into public.vehicles (id, name, vehicle_type, service_type, station_id, admin_id) values
${VEHICLES.map((v) => `  (${id(v.key)}, ${lit(v.name)}, ${lit(v.type)}, ${lit(v.service)}, ${stationId(v.station)}, ${v.admin ? id(v.admin) : 'null'})`).join(',\n')};

insert into public.routes (id, vehicle_id, from_city_id, to_city_id, from_city_name, to_city_name,
  departure_time, departure_place, passenger_price, cargo_price_per_kg, contact_phone, whatsapp, notes, is_active) values
${ROUTES.map((r) => `  (${id(r.key)}, ${id(r.vehicle)}, ${cityId(r.from)}, ${cityId(r.to)}, ${lit(r.from)}, ${lit(r.to)},
   ${mogTime(r.day, r.at)}, ${lit(r.place)}, ${r.pp ?? 'null'}, ${r.cp ?? 'null'}, '+252610000100', '+252610000100',
   'Arrive 30 minutes before departure.', true)`).join(',\n')};

insert into public.passenger_bookings (id, route_id, user_id, full_name, phone, seat_count, status) values
${PASSENGER_BOOKINGS.map((b) => { const u = users[b.user]; return `  (${id(b.key)}, ${id(b.route)}, ${id(b.user)}, ${lit(u.first + ' ' + u.last)}, ${lit(u.phone)}, ${b.seats}, ${lit(b.status)})` }).join(',\n')};

insert into public.cargo_bookings (id, route_id, user_id, sender_name, sender_phone, receiver_name, receiver_phone, cargo_weight, price, status) values
${CARGO_BOOKINGS.map((b) => { const r = ROUTES.find((x) => x.key === b.route); return `  (${id(b.key)}, ${id(b.route)}, ${id(b.user)}, ${lit(b.sender[0])}, ${lit(b.sender[1])}, ${lit(b.receiver[0])}, ${lit(b.receiver[1])}, ${b.kg}, ${price(r, b, 'c')}, ${lit(b.status)})` }).join(',\n')};

insert into public.payments (id, user_id, passenger_booking_id, cargo_booking_id, amount, method, status, reference) values
${[
  ...PASSENGER_BOOKINGS.filter((b) => b.pay).map((b) => { const r = ROUTES.find((x) => x.key === b.route); return `  (${id('pay-' + b.key)}, ${id(b.user)}, ${id(b.key)}, null, ${price(r, b, 'p')}, ${lit(b.pay.method)}, ${lit(b.pay.status)}, ${lit(b.pay.ref)})` }),
  ...CARGO_BOOKINGS.filter((b) => b.pay).map((b) => { const r = ROUTES.find((x) => x.key === b.route); return `  (${id('pay-' + b.key)}, ${id(b.user)}, null, ${id(b.key)}, ${price(r, b, 'c')}, ${lit(b.pay.method)}, ${lit(b.pay.status)}, null)` }),
].join(',\n')};
`

const sql = `begin;\n${removeSql}\n${RESET_ONLY ? '' : seedSql}\ncommit;\n`

if (process.env.PRINT_SQL) {
  process.stdout.write(sql)
  process.exit(0)
}

const dir = mkdtempSync(join(tmpdir(), 'sits-seed-'))
const file = join(dir, 'seed.sql')
try {
  writeFileSync(file, sql, { mode: 0o600 })
  execFileSync('npx', ['--yes', 'supabase@3.1.0', 'db', 'query', `--remote=${PROJECT_REF}`, '--yes', '--file', file],
    { stdio: ['ignore', 'ignore', 'inherit'] })
} finally {
  rmSync(dir, { recursive: true, force: true })
}

if (RESET_ONLY) {
  console.log('Sample data removed.')
} else {
  console.log(`Created ${CITIES.length} cities (if missing), ${STATIONS.length} stations, ${VEHICLES.length} vehicles, ` +
    `${ROUTES.length} routes, ${PASSENGER_BOOKINGS.length + CARGO_BOOKINGS.length} bookings and ${USERS.length} accounts.`)
  console.log('\nAccounts (sign in at https://sits.kalsooni.com/auth/login):')
  for (const u of USERS) console.log(`  ${u.role.padEnd(5)}  ${u.email}`)
  console.log(`  Password for all: ${PASSWORD}`)
}
