-- HeistMatch functions and triggers: integrity, anti-spam and business rules
-- enforced in the database so no client can bypass them.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and not is_banned
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger profile_private_set_updated_at before update on public.profile_private
  for each row execute function public.set_updated_at();
create trigger heists_set_updated_at before update on public.heists
  for each row execute function public.set_updated_at();
create trigger marketing_consents_set_updated_at before update on public.marketing_consents
  for each row execute function public.set_updated_at();
create trigger blog_posts_set_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- Fixed-window rate limiter. Returns true when the call is allowed.
-- Only callable server-side (service role), see grants at the bottom.
create or replace function public.rate_limit_hit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits integer;
begin
  insert into public.rate_limits (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;

  -- Opportunistic cleanup of stale windows.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_max;
end;
$$;

-- ---------------------------------------------------------------------------
-- New auth user -> profile (+ optional marketing consent, pending until the
-- e-mail address is verified).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_username text := meta ->> 'username';
  v_platform text := coalesce(meta ->> 'platform', 'ps5');
  v_region text := coalesce(meta ->> 'region', 'eu');
  v_language text := coalesce(meta ->> 'language', 'en');
  v_consent_id uuid;
begin
  if v_username is null
     or v_username !~ '^[A-Za-z0-9_]{3,20}$'
     or exists (select 1 from public.profiles where lower(username) = lower(v_username)) then
    v_username := 'player_' || substr(replace(new.id::text, '-', ''), 1, 10);
  end if;
  if v_platform not in ('ps5', 'xbox', 'pc') then v_platform := 'ps5'; end if;
  if v_region not in ('eu', 'na', 'sa', 'asia', 'oce', 'mea') then v_region := 'eu'; end if;
  if v_language !~ '^[a-z]{2}$' then v_language := 'en'; end if;

  insert into public.profiles (id, username, platform, region, primary_language, languages)
  values (new.id, v_username, v_platform, v_region, v_language, array[v_language]);

  insert into public.profile_private (user_id) values (new.id);

  if (meta ->> 'marketing_opt_in')::boolean is true and new.email is not null then
    insert into public.marketing_consents (user_id, email, consent, status, consent_version, source)
    values (new.id, lower(new.email), false, 'pending', coalesce(meta ->> 'consent_version', 'unknown'), 'signup')
    on conflict ((lower(email))) do update
      set user_id = excluded.user_id,
          consent_version = excluded.consent_version,
          source = excluded.source,
          status = case when public.marketing_consents.status = 'confirmed' then 'confirmed' else 'pending' end,
          withdrawn_at = null
    returning id into v_consent_id;

    insert into public.consent_events (consent_id, event, consent_version, source)
    values (v_consent_id, 'opt_in_requested', coalesce(meta ->> 'consent_version', 'unknown'), 'signup');
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Account e-mail verified -> a pending signup consent is confirmed
-- (the account verification is the double opt-in for that address).
create or replace function public.handle_user_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_consent record;
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    for v_consent in
      update public.marketing_consents
         set status = 'confirmed', consent = true, confirmed_at = now()
       where user_id = new.id and status = 'pending' and lower(email) = lower(new.email)
      returning id, consent_version, source
    loop
      insert into public.consent_events (consent_id, event, consent_version, source)
      values (v_consent.id, 'confirmed', v_consent.consent_version, v_consent.source);
    end loop;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_user_email_confirmed();

-- ---------------------------------------------------------------------------
-- Profiles: users can never promote or unban themselves.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.is_banned := old.is_banned;
    new.created_at := old.created_at;
    new.id := old.id;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_columns before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ---------------------------------------------------------------------------
-- Heists: anti-spam on create, protected columns on update.
-- ---------------------------------------------------------------------------
create or replace function public.heists_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_active integer;
  v_recent integer;
begin
  if auth.uid() is not null then
    new.host_user_id := auth.uid();
  end if;

  if exists (select 1 from public.profiles where id = new.host_user_id and is_banned) then
    raise exception 'account_banned' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.heist_types where slug = new.heist_type and is_active) then
    raise exception 'invalid_heist_type' using errcode = 'P0001';
  end if;

  select count(*) into v_active
    from public.heists
   where host_user_id = new.host_user_id
     and status in ('open', 'full', 'in_progress')
     and expires_at > now();
  if v_active >= 2 then
    raise exception 'too_many_active_listings' using errcode = 'P0001';
  end if;

  select count(*) into v_recent
    from public.heists
   where host_user_id = new.host_user_id
     and created_at > now() - interval '1 hour';
  if v_recent >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if new.start_at < now() - interval '5 minutes' or new.start_at > now() + interval '14 days' then
    raise exception 'invalid_start_time' using errcode = 'P0001';
  end if;

  new.status := 'open';
  new.players_joined := 0;
  new.created_at := now();
  -- A listing lives until 3 hours after its start time.
  new.expires_at := greatest(new.start_at, now()) + interval '3 hours';
  return new;
end;
$$;

create trigger heists_before_insert before insert on public.heists
  for each row execute function public.heists_before_insert();

create or replace function public.heists_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null
     or public.is_admin()
     or current_setting('heistmatch.internal_write', true) = 'on' then
    return new;
  end if;

  -- Hosts may edit content and move their own listing through its lifecycle,
  -- but never touch counters, ownership or moderation state.
  new.id := old.id;
  new.host_user_id := old.host_user_id;
  new.players_joined := old.players_joined;
  new.created_at := old.created_at;
  new.expires_at := old.expires_at;
  new.heist_type := old.heist_type;
  new.platform := old.platform;
  new.start_at := old.start_at;

  if new.players_needed < old.players_joined then
    raise exception 'players_needed_below_joined' using errcode = 'P0001';
  end if;

  if new.status <> old.status then
    if old.status in ('removed', 'expired', 'completed', 'cancelled') then
      raise exception 'listing_closed' using errcode = 'P0001';
    end if;
    if new.status not in ('open', 'full', 'in_progress', 'completed', 'cancelled') then
      raise exception 'invalid_status' using errcode = 'P0001';
    end if;
  end if;

  if new.status = 'open' and new.players_joined >= new.players_needed then
    new.status := 'full';
  elsif new.status = 'full' and new.players_joined < new.players_needed then
    new.status := 'open';
  end if;
  return new;
end;
$$;

create trigger heists_before_update before update on public.heists
  for each row execute function public.heists_before_update();

-- ---------------------------------------------------------------------------
-- Join / leave: done through RPCs with a row lock to prevent overbooking.
-- ---------------------------------------------------------------------------
create or replace function public.join_heist(p_heist_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_heist public.heists%rowtype;
  v_recent integer;
  v_existing public.heist_members%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.profiles where id = v_uid and is_banned) then
    raise exception 'account_banned' using errcode = 'P0001';
  end if;

  select count(*) into v_recent
    from public.heist_members
   where user_id = v_uid and joined_at > now() - interval '1 hour';
  if v_recent >= 20 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  select * into v_heist from public.heists where id = p_heist_id for update;
  if not found then
    raise exception 'heist_not_found' using errcode = 'P0001';
  end if;
  if v_heist.host_user_id = v_uid then
    raise exception 'is_host' using errcode = 'P0001';
  end if;
  if v_heist.status <> 'open' or v_heist.expires_at <= now() then
    raise exception 'heist_not_open' using errcode = 'P0001';
  end if;
  if v_heist.players_joined >= v_heist.players_needed then
    raise exception 'heist_full' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.user_blocks
     where (blocker_user_id = v_heist.host_user_id and blocked_user_id = v_uid)
        or (blocker_user_id = v_uid and blocked_user_id = v_heist.host_user_id)
  ) then
    raise exception 'blocked' using errcode = 'P0001';
  end if;

  select * into v_existing from public.heist_members where heist_id = p_heist_id and user_id = v_uid;
  if found then
    if v_existing.status = 'joined' then
      return 'already_joined';
    elsif v_existing.status = 'kicked' then
      raise exception 'kicked' using errcode = 'P0001';
    end if;
    update public.heist_members
       set status = 'joined', joined_at = now(), left_at = null
     where id = v_existing.id;
  else
    insert into public.heist_members (heist_id, user_id) values (p_heist_id, v_uid);
  end if;

  perform set_config('heistmatch.internal_write', 'on', true);
  update public.heists
     set players_joined = players_joined + 1,
         status = case when players_joined + 1 >= players_needed then 'full' else status end
   where id = p_heist_id;
  perform set_config('heistmatch.internal_write', 'off', true);

  return 'joined';
end;
$$;

create or replace function public.leave_heist(p_heist_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_heist public.heists%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  select * into v_heist from public.heists where id = p_heist_id for update;
  if not found then
    raise exception 'heist_not_found' using errcode = 'P0001';
  end if;

  update public.heist_members
     set status = 'left', left_at = now()
   where heist_id = p_heist_id and user_id = v_uid and status = 'joined';
  if not found then
    return 'not_member';
  end if;

  perform set_config('heistmatch.internal_write', 'on', true);
  update public.heists
     set players_joined = greatest(players_joined - 1, 0),
         status = case when status = 'full' then 'open' else status end
   where id = p_heist_id;
  perform set_config('heistmatch.internal_write', 'off', true);

  return 'left';
end;
$$;

-- Host or joined member of a heist.
create or replace function public.is_heist_participant(p_heist_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.heists where id = p_heist_id and host_user_id = p_user_id)
      or exists (select 1 from public.heist_members where heist_id = p_heist_id and user_id = p_user_id and status = 'joined');
$$;

-- Contact handles of the crew, only for the crew itself.
create or replace function public.get_heist_crew_contacts(p_heist_id uuid)
returns table (user_id uuid, username text, is_host boolean, platform_handle text, discord_handle text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_heist_participant(p_heist_id, auth.uid()) then
    return;
  end if;

  return query
    select p.id, p.username, (p.id = h.host_user_id), pp.platform_handle, pp.discord_handle
      from public.heists h
      join public.profiles p
        on p.id = h.host_user_id
        or p.id in (select m.user_id from public.heist_members m where m.heist_id = h.id and m.status = 'joined')
      left join public.profile_private pp on pp.user_id = p.id
     where h.id = p_heist_id
     order by (p.id = h.host_user_id) desc, p.username;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reports: per-user rate limit.
-- ---------------------------------------------------------------------------
create or replace function public.reports_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    new.reporter_user_id := auth.uid();
    new.status := 'open';
    new.resolved_by := null;
    new.resolved_at := null;
  end if;
  if (select count(*) from public.reports
       where reporter_user_id = new.reporter_user_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger reports_before_insert before insert on public.reports
  for each row execute function public.reports_before_insert();

-- ---------------------------------------------------------------------------
-- Expiration: open listings past expiry expire; filled/running ones are
-- considered completed. Scheduled with pg_cron (see next migration) and safe
-- to call any time. Queries also filter on expires_at so stale listings never show.
-- ---------------------------------------------------------------------------
create or replace function public.expire_stale_heists()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.heists
     set status = case when status = 'open' then 'expired' else 'completed' end
   where status in ('open', 'full', 'in_progress')
     and expires_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reputation aggregate, public.
-- ---------------------------------------------------------------------------
create or replace view public.profile_stats
with (security_invoker = true)
as
select
  p.id as user_id,
  (
    select count(*) from public.heists h
     where h.status = 'completed'
       and (h.host_user_id = p.id
            or exists (select 1 from public.heist_members m where m.heist_id = h.id and m.user_id = p.id and m.status = 'joined'))
  )::integer as completed_heists,
  (select count(*) from public.heists h where h.host_user_id = p.id)::integer as hosted_heists,
  (select count(*) from public.reviews r where r.reviewed_user_id = p.id)::integer as review_count,
  (select round(avg(r.rating)::numeric, 2) from public.reviews r where r.reviewed_user_id = p.id and r.rating is not null) as avg_rating,
  (
    select round(100.0 * count(*) filter (where r.play_again) / nullif(count(*), 0))
      from public.reviews r where r.reviewed_user_id = p.id
  )::integer as play_again_pct
from public.profiles p;

-- ---------------------------------------------------------------------------
-- Function privileges
-- ---------------------------------------------------------------------------
revoke execute on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.expire_stale_heists() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_confirmed() from public, anon, authenticated;
revoke execute on function public.join_heist(uuid) from public, anon;
revoke execute on function public.leave_heist(uuid) from public, anon;
revoke execute on function public.get_heist_crew_contacts(uuid) from public, anon;
grant execute on function public.join_heist(uuid) to authenticated;
grant execute on function public.leave_heist(uuid) to authenticated;
grant execute on function public.get_heist_crew_contacts(uuid) to authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.expire_stale_heists() to service_role;
