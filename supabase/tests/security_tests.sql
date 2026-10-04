-- Security and business-rule tests for the HeistMatch schema.
-- Run with supabase/tests/run-local.sh. Any failed assertion aborts with an error.
\set ON_ERROR_STOP on

-- Fixtures (as superuser, like the auth service would) -----------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'host@example.com',
   '{"username":"HostPlayer","platform":"ps5","region":"eu","language":"en","marketing_opt_in":true,"consent_version":"2026-10"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.com', '{"username":"PlayerB"}'),
  ('00000000-0000-0000-0000-00000000000c', 'c@example.com', '{"username":"hostplayer"}'),
  ('00000000-0000-0000-0000-00000000000d', 'd@example.com', '{"username":"PlayerD"}');

create or replace function pg_temp.as_user(p_uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', p_uid, true);
  execute 'set local role authenticated';
end $$;

-- 1. Profiles are created by the signup trigger; duplicate usernames fall back.
do $$ begin
  assert (select count(*) from public.profiles) = 4, 'profiles created';
  assert (select username from public.profiles where id = '00000000-0000-0000-0000-00000000000c') like 'player_%',
    'case-insensitive duplicate username replaced';
  assert (select status from public.marketing_consents where email = 'host@example.com') = 'pending',
    'signup opt-in is pending until verified';
  assert not exists (select 1 from public.marketing_consents where email = 'b@example.com'), 'no consent without opt-in';
end $$;

-- 2. Verifying the e-mail confirms the consent.
update auth.users set email_confirmed_at = now() where id = '00000000-0000-0000-0000-00000000000a';
do $$ begin
  assert (select status from public.marketing_consents where email = 'host@example.com') = 'confirmed', 'consent confirmed';
  assert (select count(*) from public.consent_events) = 2, 'consent audit log written';
end $$;

-- 3. A user cannot make themselves admin.
begin;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
update public.profiles set role = 'admin', bio = 'hi' where id = '00000000-0000-0000-0000-00000000000b';
reset role;
do $$ begin
  assert (select role from public.profiles where id = '00000000-0000-0000-0000-00000000000b') = 'user', 'role escalation blocked';
  assert (select bio from public.profiles where id = '00000000-0000-0000-0000-00000000000b') = 'hi', 'own profile editable';
end $$;
commit;

-- 4. A user cannot edit someone else's profile.
begin;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
update public.profiles set bio = 'hacked' where id = '00000000-0000-0000-0000-00000000000a';
reset role;
do $$ begin
  assert (select bio from public.profiles where id = '00000000-0000-0000-0000-00000000000a') is null, 'foreign profile untouched';
end $$;
commit;

-- 5. Creating a heist: host is forced to the caller, counters are reset.
begin;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into public.heists (id, host_user_id, title, heist_type, platform, region, language, players_needed, players_joined, status)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'Cayo Perico elite run', 'cayo-perico',
        'ps5', 'eu', 'en', 2, 2, 'completed');
reset role;
do $$ begin
  assert (select host_user_id from public.heists where id = '10000000-0000-0000-0000-000000000001') = '00000000-0000-0000-0000-00000000000a', 'host forced';
  assert (select status from public.heists where id = '10000000-0000-0000-0000-000000000001') = 'open', 'status forced open';
  assert (select players_joined from public.heists where id = '10000000-0000-0000-0000-000000000001') = 0, 'counter reset';
end $$;
commit;

-- 6. Max two active listings per user.
begin;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into public.heists (title, heist_type, platform, region, language, players_needed)
values ('Second listing ok', 'doomsday', 'ps5', 'eu', 'en', 3);
do $$ begin
  begin
    insert into public.heists (title, heist_type, platform, region, language, players_needed)
    values ('Third listing blocked', 'doomsday', 'ps5', 'eu', 'en', 3);
    raise exception 'third active listing should fail';
  exception when others then
    assert sqlerrm = 'too_many_active_listings', 'expected too_many_active_listings, got ' || sqlerrm;
  end;
end $$;
rollback;

-- 7. Hosts cannot tamper with counters; other users cannot update the listing.
begin;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
update public.heists set players_joined = 2, title = 'Cayo Perico elite run v2' where id = '10000000-0000-0000-0000-000000000001';
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
update public.heists set title = 'Hijacked title' where id = '10000000-0000-0000-0000-000000000001';
reset role;
do $$ begin
  assert (select players_joined from public.heists where id = '10000000-0000-0000-0000-000000000001') = 0, 'counter protected';
  assert (select title from public.heists where id = '10000000-0000-0000-0000-000000000001') = 'Cayo Perico elite run v2', 'host edit ok, foreign edit blocked';
end $$;
commit;

-- 8. Join flow: counters, full state, no overbooking, host cannot join.
begin;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select public.join_heist('10000000-0000-0000-0000-000000000001');
select public.join_heist('10000000-0000-0000-0000-000000000001'); -- idempotent
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select public.join_heist('10000000-0000-0000-0000-000000000001');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
do $$ begin
  begin
    perform public.join_heist('10000000-0000-0000-0000-000000000001');
    raise exception 'join on full heist should fail';
  exception when others then
    assert sqlerrm = 'heist_not_open', 'expected heist_not_open, got ' || sqlerrm;
  end;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  begin
    perform public.join_heist('10000000-0000-0000-0000-000000000001');
    raise exception 'host join should fail';
  exception when others then
    assert sqlerrm = 'is_host', 'expected is_host, got ' || sqlerrm;
  end;
end $$;
reset role;
do $$ begin
  assert (select players_joined from public.heists where id = '10000000-0000-0000-0000-000000000001') = 2, 'two joined';
  assert (select status from public.heists where id = '10000000-0000-0000-0000-000000000001') = 'full', 'status full';
end $$;
commit;

-- 9. Leave re-opens the listing.
begin;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select public.leave_heist('10000000-0000-0000-0000-000000000001');
reset role;
do $$ begin
  assert (select players_joined from public.heists where id = '10000000-0000-0000-0000-000000000001') = 1, 'one joined after leave';
  assert (select status from public.heists where id = '10000000-0000-0000-0000-000000000001') = 'open', 'open again';
end $$;
commit;

-- 10. Clients cannot write membership rows directly.
begin;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
do $$ begin
  begin
    insert into public.heist_members (heist_id, user_id) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000d');
    raise exception 'direct member insert should fail';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;

-- 11. Contacts are visible to the crew only.
begin;
update public.profile_private set platform_handle = 'HostPSN' where user_id = '00000000-0000-0000-0000-00000000000a';
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ begin
  assert (select count(*) from public.get_heist_crew_contacts('10000000-0000-0000-0000-000000000001')) = 2, 'crew sees host + self';
  assert (select platform_handle from public.get_heist_crew_contacts('10000000-0000-0000-0000-000000000001') where is_host) = 'HostPSN', 'host handle visible to crew';
  assert (select count(*) from public.profile_private) = 1, 'only own private row readable';
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
do $$ begin
  assert (select count(*) from public.get_heist_crew_contacts('10000000-0000-0000-0000-000000000001')) = 0, 'outsider sees nothing';
end $$;
rollback;

-- 12. Reviews: only crew mates, only after start, not by outsiders.
begin;
update public.heists set start_at = now() - interval '1 hour' where id = '10000000-0000-0000-0000-000000000001';
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
insert into public.reviews (reviewed_user_id, heist_id, rating, play_again)
values ('00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000001', 5, true);
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
do $$ begin
  begin
    insert into public.reviews (reviewed_user_id, heist_id, rating, play_again)
    values ('00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000001', 1, false);
    raise exception 'outsider review should fail';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
do $$ begin
  assert (select review_count from public.profile_stats where user_id = '00000000-0000-0000-0000-00000000000a') = 1, 'stats count';
  assert (select play_again_pct from public.profile_stats where user_id = '00000000-0000-0000-0000-00000000000a') = 100, 'stats pct';
end $$;
rollback;

-- 13. Anonymous visitors can browse listings but not see consents or private data.
begin;
set local role anon;
do $$ begin
  assert (select count(*) from public.heists) >= 1, 'anon sees listings';
  assert (select count(*) from public.marketing_consents) = 0, 'anon sees no consents';
  assert (select count(*) from public.profile_private) = 0, 'anon sees no private data';
  begin
    perform public.rate_limit_hit('x', 1, 60);
    raise exception 'anon must not call rate_limit_hit';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;

-- 14. Removed listings disappear for the public; drafts are hidden.
begin;
update public.heists set status = 'removed' where id = '10000000-0000-0000-0000-000000000001';
insert into public.blog_posts (slug, title, excerpt, content, category, status)
values ('draft-post', 'A draft post', 'This draft must stay hidden from the public.', 'x', 'news', 'draft');
set local role anon;
do $$ begin
  assert (select count(*) from public.heists where id = '10000000-0000-0000-0000-000000000001') = 0, 'removed hidden';
  assert (select count(*) from public.blog_posts) = 0, 'draft hidden';
end $$;
rollback;

-- 15. Expiration job.
begin;
update public.heists set expires_at = now() - interval '1 minute' where id = '10000000-0000-0000-0000-000000000001';
do $$ begin
  assert public.expire_stale_heists() = 1, 'one listing expired';
  assert (select status from public.heists where id = '10000000-0000-0000-0000-000000000001') = 'expired', 'status expired';
end $$;
rollback;

-- 16. Rate limiter.
do $$ begin
  assert public.rate_limit_hit('t', 2, 60) and public.rate_limit_hit('t', 2, 60), 'first two allowed';
  assert not public.rate_limit_hit('t', 2, 60), 'third blocked';
end $$;

select 'ALL SECURITY TESTS PASSED' as result;
