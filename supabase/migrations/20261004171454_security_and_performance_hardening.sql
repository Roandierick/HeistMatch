-- Keep privileged helper and trigger functions out of the exposed public API.
-- Public SECURITY INVOKER wrappers remain for RLS expressions that need to run
-- for anon/authenticated roles; the privileged implementations live in a schema
-- that PostgREST does not expose.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

alter function public.is_admin() set schema private;
alter function public.is_heist_participant(uuid, uuid) set schema private;
alter function public.heists_before_insert() set schema private;
alter function public.reports_before_insert() set schema private;

revoke all on function private.is_admin() from public, anon, authenticated;
revoke all on function private.is_heist_participant(uuid, uuid) from public, anon, authenticated;
revoke all on function private.heists_before_insert() from public, anon, authenticated;
revoke all on function private.reports_before_insert() from public, anon, authenticated;

grant execute on function private.is_admin() to anon, authenticated, service_role;
grant execute on function private.is_heist_participant(uuid, uuid) to authenticated, service_role;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_admin();
$$;

create or replace function public.is_heist_participant(p_heist_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_heist_participant(p_heist_id, p_user_id);
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_heist_participant(uuid, uuid) from public, anon;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_heist_participant(uuid, uuid) to authenticated, service_role;

-- Consolidate overlapping permissive policies without changing authorization.
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "admins update any profile" on public.profiles;
create policy "users or admins update profiles" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "admins manage heist types" on public.heist_types;
create policy "admins insert heist types" on public.heist_types
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins update heist types" on public.heist_types
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "admins delete heist types" on public.heist_types
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "hosts update own listings" on public.heists;
drop policy if exists "admins update listings" on public.heists;
create policy "hosts or admins update listings" on public.heists
  for update to authenticated
  using (host_user_id = (select auth.uid()) or (select public.is_admin()))
  with check (
    (host_user_id = (select auth.uid()) and status <> 'removed')
    or (select public.is_admin())
  );

drop policy if exists "admins manage posts" on public.blog_posts;
create policy "admins insert posts" on public.blog_posts
  for insert to authenticated with check ((select public.is_admin()));
create policy "admins update posts" on public.blog_posts
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "admins delete posts" on public.blog_posts
  for delete to authenticated using ((select public.is_admin()));

-- Cover foreign keys used by joins, cascades and moderation/admin filters.
create index if not exists analytics_events_user_id_idx on public.analytics_events (user_id);
create index if not exists blog_posts_author_id_idx on public.blog_posts (author_id);
create index if not exists consent_events_consent_id_idx on public.consent_events (consent_id);
create index if not exists reports_heist_id_idx on public.reports (heist_id);
create index if not exists reports_reported_user_id_idx on public.reports (reported_user_id);
create index if not exists reports_reporter_user_id_idx on public.reports (reporter_user_id);
create index if not exists reports_resolved_by_idx on public.reports (resolved_by);
create index if not exists reviews_heist_id_idx on public.reviews (heist_id);
create index if not exists user_blocks_blocked_user_id_idx on public.user_blocks (blocked_user_id);

-- Supabase is making Data API exposure opt-in. Declare every client grant so a
-- fresh project keeps working without relying on legacy default privileges.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.profile_private from anon, authenticated;
revoke all on table public.user_blocks from anon, authenticated;
revoke all on table public.heist_types from anon, authenticated;
revoke all on table public.heists from anon, authenticated;
revoke all on table public.heist_members from anon, authenticated;
revoke all on table public.reviews from anon, authenticated;
revoke all on table public.reports from anon, authenticated;
revoke all on table public.marketing_consents from anon, authenticated;
revoke all on table public.consent_events from anon, authenticated;
revoke all on table public.blog_posts from anon, authenticated;
revoke all on table public.analytics_events from anon, authenticated;
revoke all on table public.rate_limits from anon, authenticated;
revoke all on table public.profile_stats from anon, authenticated;
revoke all on table public.analytics_daily from anon, authenticated;
revoke all on table public.analytics_top_pages from anon, authenticated;
revoke all on table public.analytics_referrers from anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant update on table public.profiles to authenticated;
grant select, insert, update on table public.profile_private to authenticated;
grant select, insert, delete on table public.user_blocks to authenticated;
grant select on table public.heist_types to anon, authenticated;
grant insert, update, delete on table public.heist_types to authenticated;
grant select on table public.heists to anon, authenticated;
grant insert, update, delete on table public.heists to authenticated;
grant select on table public.heist_members to anon, authenticated;
grant select on table public.reviews to anon, authenticated;
grant insert, delete on table public.reviews to authenticated;
grant select, insert, update on table public.reports to authenticated;
grant select on table public.marketing_consents to authenticated;
grant select on table public.consent_events to authenticated;
grant select on table public.blog_posts to anon, authenticated;
grant insert, update, delete on table public.blog_posts to authenticated;
grant select on table public.analytics_events to authenticated;
grant select on table public.profile_stats to anon, authenticated;
grant select on table public.analytics_daily, public.analytics_top_pages, public.analytics_referrers to authenticated;

-- Trigger helpers are never direct API endpoints.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_confirmed() from public, anon, authenticated;
revoke execute on function public.protect_profile_columns() from public, anon, authenticated;
revoke execute on function public.heists_before_update() from public, anon, authenticated;
revoke execute on function private.heists_before_insert() from public, anon, authenticated;
revoke execute on function private.reports_before_insert() from public, anon, authenticated;
