-- HeistMatch Row Level Security. Every table has RLS on; anything not
-- explicitly allowed here is denied. Server-only writes use the service role.

alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.user_blocks enable row level security;
alter table public.heist_types enable row level security;
alter table public.heists enable row level security;
alter table public.heist_members enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.marketing_consents enable row level security;
alter table public.consent_events enable row level security;
alter table public.blog_posts enable row level security;
alter table public.analytics_events enable row level security;
alter table public.rate_limits enable row level security;

-- profiles ------------------------------------------------------------------
create policy "profiles are public" on public.profiles
  for select using (true);
create policy "users update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
create policy "admins update any profile" on public.profiles
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- profile_private -------------------------------------------------------------
create policy "owner reads private profile" on public.profile_private
  for select to authenticated using (user_id = (select auth.uid()));
create policy "owner inserts private profile" on public.profile_private
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "owner updates private profile" on public.profile_private
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- user_blocks -------------------------------------------------------------------
create policy "owner reads blocks" on public.user_blocks
  for select to authenticated using (blocker_user_id = (select auth.uid()));
create policy "owner creates blocks" on public.user_blocks
  for insert to authenticated with check (blocker_user_id = (select auth.uid()));
create policy "owner deletes blocks" on public.user_blocks
  for delete to authenticated using (blocker_user_id = (select auth.uid()));

-- heist_types -------------------------------------------------------------------
create policy "heist types are public" on public.heist_types
  for select using (true);
create policy "admins manage heist types" on public.heist_types
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- heists ------------------------------------------------------------------------
create policy "listings are public unless removed" on public.heists
  for select using (
    status <> 'removed'
    or host_user_id = (select auth.uid())
    or (select public.is_admin())
  );
create policy "authenticated users create own listings" on public.heists
  for insert to authenticated
  with check (host_user_id = (select auth.uid()));
create policy "hosts update own listings" on public.heists
  for update to authenticated
  using (host_user_id = (select auth.uid()))
  with check (host_user_id = (select auth.uid()) and status <> 'removed');
create policy "admins update listings" on public.heists
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "admins delete listings" on public.heists
  for delete to authenticated using ((select public.is_admin()));

-- heist_members: read-only for clients; writes only through join/leave RPCs ---
create policy "crew membership is public" on public.heist_members
  for select using (true);

-- reviews -----------------------------------------------------------------------
create policy "reviews are public" on public.reviews
  for select using (true);
create policy "participants review crew mates after the start" on public.reviews
  for insert to authenticated
  with check (
    reviewer_user_id = (select auth.uid())
    and public.is_heist_participant(heist_id, reviewer_user_id)
    and public.is_heist_participant(heist_id, reviewed_user_id)
    and exists (select 1 from public.heists h where h.id = heist_id and h.start_at < now())
  );
create policy "admins delete reviews" on public.reviews
  for delete to authenticated using ((select public.is_admin()));

-- reports -----------------------------------------------------------------------
create policy "users create reports" on public.reports
  for insert to authenticated
  with check (reporter_user_id = (select auth.uid()));
create policy "users read own reports, admins read all" on public.reports
  for select to authenticated
  using (reporter_user_id = (select auth.uid()) or (select public.is_admin()));
create policy "admins handle reports" on public.reports
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- marketing consent: users see their own; all writes are server-side -------------
create policy "users read own consent" on public.marketing_consents
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "admins read consent events" on public.consent_events
  for select to authenticated using ((select public.is_admin()));

-- blog_posts --------------------------------------------------------------------
create policy "published posts are public" on public.blog_posts
  for select using (
    (status = 'published' and published_at <= now())
    or (select public.is_admin())
  );
create policy "admins manage posts" on public.blog_posts
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- analytics_events: written server-side only ------------------------------------
create policy "admins read analytics" on public.analytics_events
  for select to authenticated using ((select public.is_admin()));

-- rate_limits: no client access at all (no policies).

-- Column-level hardening: clients never write counters or moderation columns
-- directly, even where a row policy would allow the row.
revoke insert, update on public.heist_members from anon, authenticated;
revoke all on public.rate_limits from anon, authenticated;
revoke insert, update, delete on public.marketing_consents from anon, authenticated;
revoke insert, update, delete on public.consent_events from anon, authenticated;
revoke insert, update, delete on public.analytics_events from anon, authenticated;
