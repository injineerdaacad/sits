-- RLS tests: run with supabase/tests/run.sh. Every line printed must be PASS.
\set ON_ERROR_STOP 1
-- ids: S=super, A1/A2=admins of station 1/2, U1/U2=users
insert into cities values ('c0000000-0000-0000-0000-000000000001','Mogadishu'),('c0000000-0000-0000-0000-000000000002','Baidoa');
insert into stations values ('50000000-0000-0000-0000-000000000001','St1','c0000000-0000-0000-0000-000000000001'),('50000000-0000-0000-0000-000000000002','St2','c0000000-0000-0000-0000-000000000002');
insert into profiles(id,first_name,role,station_id) values
 ('00000000-0000-0000-0000-00000000005a','Super','SUPER_ADMIN',null),
 ('00000000-0000-0000-0000-0000000000a1','Admin1','ADMIN','50000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-0000000000a2','Admin2','ADMIN','50000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-0000000000b1','User1','USER',null),
 ('00000000-0000-0000-0000-0000000000b2','User2','USER',null);
insert into vehicles values ('e0000000-0000-0000-0000-000000000001','V1','50000000-0000-0000-0000-000000000001',null),('e0000000-0000-0000-0000-000000000002','V2','50000000-0000-0000-0000-000000000002',null);
insert into routes values ('70000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002',true),('70000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000001',true);
insert into passenger_bookings values ('b0000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000b1','U1',1,'PENDING'),('b0000000-0000-0000-0000-000000000002','70000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-0000000000b2','U2',1,'PENDING');
insert into cargo_bookings values ('cb000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000b1','PENDING');
insert into payments values ('90000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000b1','b0000000-0000-0000-0000-000000000001',null,10,'PENDING'),('90000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-0000000000b2','b0000000-0000-0000-0000-000000000002',null,10,'PENDING');
insert into storage.objects(bucket_id,name) values ('avatars','00000000-0000-0000-0000-0000000000b2-x.png');

create table public.results(n serial, label text, ok boolean);
grant all on public.results, public.results_n_seq to anon, authenticated;
alter table public.results disable row level security;
create function public.expect(label text, cond boolean) returns void language plpgsql as $$ begin insert into public.results(label, ok) values (label, coalesce(cond,false)); raise notice '%: %', case when coalesce(cond,false) then 'PASS' else 'FAIL' end, label; end $$;
create function public.expect_denied(label text, stmt text) returns void language plpgsql as $$
declare n int;
begin
  begin
    execute stmt; get diagnostics n = row_count;
    insert into public.results(label, ok) values (label, n = 0); raise notice '%: %', case when n = 0 then 'PASS' else 'FAIL' end, label;
  exception when others then
    insert into public.results(label, ok) values (label, true); raise notice 'PASS: %', label;
  end;
end $$;
grant execute on all functions in schema public to anon, authenticated;

-- ---------------- USER 1
begin; set local role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b1',true);
select expect('U1 sees only own passenger bookings', (select count(*) from passenger_bookings)=1 and (select bool_and(user_id='00000000-0000-0000-0000-0000000000b1') from passenger_bookings));
select expect('U1 sees only own payments', (select count(*) from payments)=1);
select expect('U1 sees only own profile', (select count(*) from profiles)=1);
select expect('U1 can read routes/cities/stations/vehicles', (select count(*) from routes)=2 and (select count(*) from cities)=2 and (select count(*) from vehicles)=2);
select expect_denied('U1 cannot make self SUPER_ADMIN', $$update profiles set role='SUPER_ADMIN' where id='00000000-0000-0000-0000-0000000000b1'$$);
select expect_denied('U1 cannot assign self a station', $$update profiles set station_id='50000000-0000-0000-0000-000000000001' where id='00000000-0000-0000-0000-0000000000b1'$$);
select expect_denied('U1 cannot edit U2 profile', $$update profiles set first_name='x' where id='00000000-0000-0000-0000-0000000000b2'$$);
select expect_denied('U1 cannot create an ADMIN profile', $$insert into profiles(id,first_name,role) values (gen_random_uuid(),'x','ADMIN')$$);
select expect_denied('U1 cannot book for U2', $$insert into passenger_bookings(route_id,user_id,status) values ('70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000b2','PENDING')$$);
select expect_denied('U1 cannot create a CONFIRMED booking', $$insert into passenger_bookings(route_id,user_id,status) values ('70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000b1','CONFIRMED')$$);
select expect_denied('U1 cannot confirm own booking', $$update passenger_bookings set status='CONFIRMED' where id='b0000000-0000-0000-0000-000000000001'$$);
select expect_denied('U1 cannot touch U2 booking', $$update passenger_bookings set status='CANCELLED' where id='b0000000-0000-0000-0000-000000000002'$$);
select expect_denied('U1 cannot mark own payment PAID', $$update payments set status='PAID' where id='90000000-0000-0000-0000-000000000001'$$);
select expect_denied('U1 cannot insert a PAID payment', $$insert into payments(user_id,passenger_booking_id,amount,status) values ('00000000-0000-0000-0000-0000000000b1','b0000000-0000-0000-0000-000000000001',1,'PAID')$$);
select expect_denied('U1 cannot pay against U2 booking', $$insert into payments(user_id,passenger_booking_id,amount,status) values ('00000000-0000-0000-0000-0000000000b1','b0000000-0000-0000-0000-000000000002',1,'PENDING')$$);
select expect_denied('U1 cannot add a vehicle', $$insert into vehicles(plate,station_id) values ('X','50000000-0000-0000-0000-000000000001')$$);
select expect_denied('U1 cannot delete a city', $$delete from cities$$);
select expect_denied('U1 cannot overwrite U2 avatar', $$update storage.objects set name='hacked' where name like '00000000-0000-0000-0000-0000000000b2-%'$$);
select expect_denied('U1 cannot upload a city image', $$insert into storage.objects(bucket_id,name) values ('cities','x.png')$$);
select expect_denied('U1 cannot upload a vehicle image', $$insert into storage.objects(bucket_id,name) values ('vehicles','x.png')$$);
select expect_denied('U1 cannot upload an avatar named for U2', $$insert into storage.objects(bucket_id,name) values ('avatars','00000000-0000-0000-0000-0000000000b2-y.png')$$);
commit;
begin; set local role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b1',true);
insert into passenger_bookings(route_id,user_id,full_name,seat_count,status) values ('70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000b1','U1',2,'PENDING');
select expect('U1 can create own PENDING booking', true);
insert into payments(user_id,passenger_booking_id,amount,status) values ('00000000-0000-0000-0000-0000000000b1','b0000000-0000-0000-0000-000000000001',5,'PENDING');
select expect('U1 can submit PENDING payment for own booking', true);
update passenger_bookings set status='CANCELLED' where id='b0000000-0000-0000-0000-000000000001';
select expect('U1 can cancel own pending booking', (select status from passenger_bookings where id='b0000000-0000-0000-0000-000000000001')='CANCELLED');
update profiles set first_name='Ali' where id='00000000-0000-0000-0000-0000000000b1';
select expect('U1 can edit own name', (select first_name from profiles where id='00000000-0000-0000-0000-0000000000b1')='Ali');
insert into storage.objects(bucket_id,name) values ('avatars','00000000-0000-0000-0000-0000000000b1-a.png');
select expect('U1 can upload own avatar', true);
rollback;

-- ---------------- ADMIN of station 1
begin; set local role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',true);
select expect('A1 sees only station-1 passenger bookings', (select count(*) from passenger_bookings)=1 and (select bool_and(route_id='70000000-0000-0000-0000-000000000001') from passenger_bookings));
select expect('A1 sees station-1 cargo bookings', (select count(*) from cargo_bookings)=1);
select expect('A1 sees only station-1 payments', (select count(*) from payments)=1);
select expect('A1 sees own profile + own customers only', (select count(*) from profiles)=2);
select expect_denied('A1 cannot confirm station-2 booking', $$update passenger_bookings set status='CONFIRMED' where id='b0000000-0000-0000-0000-000000000002'$$);
select expect_denied('A1 cannot mark station-2 payment PAID', $$update payments set status='PAID' where id='90000000-0000-0000-0000-000000000002'$$);
select expect_denied('A1 cannot add vehicle to station 2', $$insert into vehicles(plate,station_id) values ('X','50000000-0000-0000-0000-000000000002')$$);
select expect_denied('A1 cannot move own vehicle to station 2', $$update vehicles set station_id='50000000-0000-0000-0000-000000000002' where id='e0000000-0000-0000-0000-000000000001'$$);
select expect_denied('A1 cannot add route on station-2 vehicle', $$insert into routes(vehicle_id) values ('e0000000-0000-0000-0000-000000000002')$$);
select expect_denied('A1 cannot promote self', $$update profiles set role='SUPER_ADMIN' where id='00000000-0000-0000-0000-0000000000a1'$$);
select expect_denied('A1 cannot create stations', $$insert into stations(name) values ('x')$$);
select expect_denied('A1 cannot upload a city image', $$insert into storage.objects(bucket_id,name) values ('cities','x.png')$$);
commit;
begin; set local role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',true);
update passenger_bookings set status='CONFIRMED' where id='b0000000-0000-0000-0000-000000000001';
select expect('A1 can confirm station-1 booking', (select status from passenger_bookings where id='b0000000-0000-0000-0000-000000000001')='CONFIRMED');
update payments set status='PAID' where id='90000000-0000-0000-0000-000000000001';
select expect('A1 can mark station-1 payment PAID', (select status from payments where id='90000000-0000-0000-0000-000000000001')='PAID');
insert into vehicles(plate,station_id) values ('NEW','50000000-0000-0000-0000-000000000001');
select expect('A1 can add vehicle to own station', true);
insert into routes(vehicle_id) values ('e0000000-0000-0000-0000-000000000001');
select expect('A1 can add route for own vehicle', true);
insert into storage.objects(bucket_id,name) values ('vehicles','v1.png');
select expect('A1 can upload a vehicle image', true);
rollback;

-- ---------------- SUPER ADMIN
begin; set local role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000005a',true);
select expect('Super sees all bookings/payments/profiles', (select count(*) from passenger_bookings)=2 and (select count(*) from payments)=2 and (select count(*) from profiles)=5);
insert into profiles(id,first_name,role,station_id) values (gen_random_uuid(),'New admin','ADMIN','50000000-0000-0000-0000-000000000002');
select expect('Super can create an ADMIN profile', true);
update profiles set role='ADMIN', station_id='50000000-0000-0000-0000-000000000001' where id='00000000-0000-0000-0000-0000000000b2';
select expect('Super can change a role and station', (select role from profiles where id='00000000-0000-0000-0000-0000000000b2')='ADMIN');
insert into stations(name) values ('St3'); select expect('Super can create a station', true);
insert into storage.objects(bucket_id,name) values ('cities','mogadishu.png');
select expect('Super can upload a city image', true);
rollback;

-- ---------------- ANON (not logged in)
begin; set local role anon; select set_config('request.jwt.claim.sub','',true);
select expect('Anon can search routes and cities', (select count(*) from routes)=2 and (select count(*) from cities)=2);
select expect('Anon sees no bookings, payments or profiles', (select count(*) from passenger_bookings)=0 and (select count(*) from payments)=0 and (select count(*) from profiles)=0);
select expect_denied('Anon cannot create bookings', $$insert into passenger_bookings(route_id,user_id,status) values ('70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000b1','PENDING')$$);
select expect_denied('Anon cannot upload avatars', $$insert into storage.objects(bucket_id,name) values ('avatars','anon.png')$$);
select expect_denied('Anon cannot delete avatars', $$delete from storage.objects where bucket_id='avatars'$$);
select expect('Anon can view avatars', (select count(*) from storage.objects where bucket_id='avatars') >= 1);
commit;

-- New sign-up (no profile yet) creates own USER profile
begin; set local role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c1',true);
insert into profiles(id,first_name,last_name,role) values ('00000000-0000-0000-0000-0000000000c1','new','User','USER');
select expect('New user can create own USER profile', true);
rollback;

select n, case when ok then 'PASS' else 'FAIL' end as result, label from public.results order by n;
select count(*) filter (where ok) as passed, count(*) filter (where not ok) as failed from public.results;
