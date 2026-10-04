-- Admin reporting views. security_invoker: they inherit the RLS of the base
-- tables, so only admins (who can read analytics_events) get rows back.

create or replace view public.analytics_daily
with (security_invoker = true)
as
select
  date_trunc('day', created_at)::date as day,
  name,
  count(*)::integer as events,
  count(distinct session_id)::integer as sessions
from public.analytics_events
where created_at > now() - interval '90 days'
group by 1, 2;

create or replace view public.analytics_top_pages
with (security_invoker = true)
as
select
  path,
  count(*)::integer as views,
  count(distinct session_id)::integer as sessions,
  count(*) filter (where referrer_host is not null)::integer as external_referrals
from public.analytics_events
where name = 'page_view' and created_at > now() - interval '30 days'
group by path
order by views desc
limit 50;

-- Organic acquisition: first page view of a session coming from a search engine.
create or replace view public.analytics_referrers
with (security_invoker = true)
as
select
  referrer_host,
  count(*)::integer as visits
from public.analytics_events
where name = 'page_view' and referrer_host is not null and created_at > now() - interval '30 days'
group by referrer_host
order by visits desc
limit 50;
