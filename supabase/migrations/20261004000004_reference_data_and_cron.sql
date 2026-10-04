-- Reference data that production needs (not demo data) and scheduled jobs.

-- Heist catalog. GTA 6 heists are not officially detailed yet: the GTA 6 list
-- starts with generic entries and admins add named heists once confirmed.
-- GTA Online heists let the finder be useful before GTA 6 Online launches.
insert into public.heist_types (slug, name, game, description, max_crew, sort_order) values
  ('gta6-any-heist', 'Any GTA 6 heist', 'gta6', 'Open to any heist. Agree on the job in the crew.', 8, 1),
  ('gta6-other', 'Other GTA 6 job', 'gta6', 'A job that is not in the list yet. Describe it in the listing.', 8, 2),
  ('cayo-perico', 'The Cayo Perico Heist', 'gta-online', null, 4, 50),
  ('diamond-casino', 'The Diamond Casino Heist', 'gta-online', null, 4, 51),
  ('doomsday', 'The Doomsday Heist', 'gta-online', null, 4, 52),
  ('pacific-standard', 'The Pacific Standard Job', 'gta-online', null, 4, 53),
  ('humane-labs', 'The Humane Labs Raid', 'gta-online', null, 4, 54),
  ('prison-break', 'The Prison Break', 'gta-online', null, 4, 55),
  ('series-a-funding', 'Series A Funding', 'gta-online', null, 4, 56),
  ('fleeca-job', 'The Fleeca Job', 'gta-online', null, 2, 57),
  ('gta-online-other', 'Other GTA Online job', 'gta-online', 'Contact missions, contracts, robberies and more.', 4, 99)
on conflict (slug) do nothing;

-- Expire stale listings every 10 minutes (pg_cron is available on Supabase).
create extension if not exists pg_cron;

select cron.schedule(
  'heistmatch-expire-stale-heists',
  '*/10 * * * *',
  $$ select public.expire_stale_heists(); $$
);
