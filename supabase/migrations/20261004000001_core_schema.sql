-- HeistMatch core schema
-- Tables, constraints and indexes. Security (RLS, triggers, RPCs) lives in the next migrations.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user. profiles.id == auth.users.id.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  avatar_url text,
  platform text not null default 'ps5',
  region text not null default 'eu',
  primary_language text not null default 'en',
  languages text[] not null default '{}',
  preferred_roles text[] not null default '{}',
  bio text,
  role text not null default 'user',
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  constraint profiles_platform_check check (platform in ('ps5', 'xbox', 'pc')),
  constraint profiles_region_check check (region in ('eu', 'na', 'sa', 'asia', 'oce', 'mea')),
  constraint profiles_language_check check (primary_language ~ '^[a-z]{2}$'),
  constraint profiles_role_check check (role in ('user', 'admin')),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 280),
  constraint profiles_avatar_url_check check (avatar_url is null or avatar_url ~ '^https://')
);

create unique index profiles_username_lower_idx on public.profiles (lower(username));

-- Contact handles are private: only the owner and crew mates of a shared heist can read them.
create table public.profile_private (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  platform_handle text,
  discord_handle text,
  updated_at timestamptz not null default now(),
  constraint profile_private_platform_handle_length check (platform_handle is null or char_length(platform_handle) between 2 and 32),
  constraint profile_private_discord_handle_length check (discord_handle is null or char_length(discord_handle) between 2 and 37)
);

-- Prepared for later: user blocking.
create table public.user_blocks (
  blocker_user_id uuid not null references public.profiles (id) on delete cascade,
  blocked_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id),
  constraint user_blocks_not_self check (blocker_user_id <> blocked_user_id)
);

-- ---------------------------------------------------------------------------
-- Heist catalog: managed in the database so new GTA 6 heists can be added
-- by an admin without a deploy. Also the future base for per-heist pages.
-- ---------------------------------------------------------------------------
create table public.heist_types (
  slug text primary key,
  name text not null,
  game text not null default 'gta6',
  description text,
  max_crew smallint not null default 4,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint heist_types_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint heist_types_game_check check (game in ('gta6', 'gta-online')),
  constraint heist_types_max_crew_check check (max_crew between 2 and 8)
);

-- ---------------------------------------------------------------------------
-- Heist listings
-- players_needed = extra players the host is looking for (host excluded)
-- players_joined = currently joined players (host excluded)
-- ---------------------------------------------------------------------------
create table public.heists (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null,
  heist_type text not null references public.heist_types (slug),
  platform text not null,
  region text not null,
  language text not null,
  players_needed smallint not null,
  players_joined smallint not null default 0,
  open_slots smallint generated always as (players_needed - players_joined) stored,
  mic_required boolean not null default false,
  min_rank integer,
  skill_level text not null default 'any',
  playstyle text not null default 'normal',
  payout_split text,
  start_at timestamptz not null default now(),
  description text,
  status text not null default 'open',
  expires_at timestamptz not null default (now() + interval '4 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint heists_title_length check (char_length(title) between 4 and 80),
  constraint heists_platform_check check (platform in ('ps5', 'xbox', 'pc')),
  constraint heists_region_check check (region in ('eu', 'na', 'sa', 'asia', 'oce', 'mea')),
  constraint heists_language_check check (language ~ '^[a-z]{2}$'),
  constraint heists_players_needed_check check (players_needed between 1 and 7),
  constraint heists_players_joined_check check (players_joined between 0 and players_needed),
  constraint heists_min_rank_check check (min_rank is null or min_rank between 1 and 8000),
  constraint heists_skill_level_check check (skill_level in ('any', 'beginner', 'intermediate', 'experienced')),
  constraint heists_playstyle_check check (playstyle in ('casual', 'normal', 'experienced', 'efficient', 'speedrun')),
  constraint heists_payout_split_check check (payout_split is null or payout_split in ('equal', 'host_favored', 'negotiable')),
  constraint heists_description_length check (description is null or char_length(description) <= 600),
  constraint heists_status_check check (status in ('open', 'full', 'in_progress', 'completed', 'cancelled', 'expired', 'removed'))
);

create index heists_finder_idx on public.heists (status, expires_at desc);
create index heists_platform_region_idx on public.heists (platform, region) where status = 'open';
create index heists_type_idx on public.heists (heist_type);
create index heists_host_idx on public.heists (host_user_id, created_at desc);
create index heists_start_idx on public.heists (start_at);
create index heists_open_slots_idx on public.heists (open_slots) where status = 'open';

create table public.heist_members (
  id uuid primary key default gen_random_uuid(),
  heist_id uuid not null references public.heists (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'joined',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  constraint heist_members_unique unique (heist_id, user_id),
  constraint heist_members_status_check check (status in ('joined', 'left', 'kicked'))
);

create index heist_members_user_idx on public.heist_members (user_id, joined_at desc);

-- ---------------------------------------------------------------------------
-- Reputation
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reviewed_user_id uuid not null references public.profiles (id) on delete cascade,
  heist_id uuid not null references public.heists (id) on delete cascade,
  rating smallint,
  play_again boolean not null,
  created_at timestamptz not null default now(),
  constraint reviews_unique unique (reviewer_user_id, reviewed_user_id, heist_id),
  constraint reviews_not_self check (reviewer_user_id <> reviewed_user_id),
  constraint reviews_rating_check check (rating is null or rating between 1 and 5)
);

create index reviews_reviewed_idx on public.reviews (reviewed_user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Moderation
-- ---------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_type text not null,
  heist_id uuid references public.heists (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open',
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reports_target_type_check check (target_type in ('heist', 'user')),
  constraint reports_target_present check (
    (target_type = 'heist' and heist_id is not null) or (target_type = 'user' and reported_user_id is not null)
  ),
  constraint reports_reason_check check (reason in ('spam', 'harassment', 'scam', 'cheating', 'inappropriate', 'other')),
  constraint reports_details_length check (details is null or char_length(details) <= 500),
  constraint reports_status_check check (status in ('open', 'resolved', 'dismissed'))
);

create index reports_status_idx on public.reports (status, created_at desc);

-- ---------------------------------------------------------------------------
-- E-mail audience. Current state per address + an append-only audit log.
-- Written only server-side with the service role.
-- ---------------------------------------------------------------------------
create table public.marketing_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  consent boolean not null default false,
  status text not null default 'pending',
  consent_version text not null,
  source text not null,
  confirm_token uuid not null default gen_random_uuid(),
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  withdrawn_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint marketing_consents_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  constraint marketing_consents_status_check check (status in ('pending', 'confirmed', 'unsubscribed')),
  constraint marketing_consents_source_check check (source in ('signup', 'newsletter_home', 'newsletter_blog', 'newsletter_article', 'account_settings', 'admin_import'))
);

create unique index marketing_consents_email_idx on public.marketing_consents (lower(email));
create unique index marketing_consents_confirm_token_idx on public.marketing_consents (confirm_token);
create unique index marketing_consents_unsubscribe_token_idx on public.marketing_consents (unsubscribe_token);
create index marketing_consents_user_idx on public.marketing_consents (user_id);

create table public.consent_events (
  id bigint generated always as identity primary key,
  consent_id uuid not null references public.marketing_consents (id) on delete cascade,
  event text not null,
  consent_version text not null,
  source text not null,
  created_at timestamptz not null default now(),
  constraint consent_events_event_check check (event in ('opt_in_requested', 'confirmed', 'withdrawn'))
);

-- ---------------------------------------------------------------------------
-- Blog / news / guides (Markdown content, rendered server-side)
-- ---------------------------------------------------------------------------
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  featured_image text,
  featured_image_alt text,
  author_id uuid references public.profiles (id) on delete set null,
  author_name text not null default 'HeistMatch Editorial',
  is_featured boolean not null default false,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  constraint blog_posts_title_length check (char_length(title) between 5 and 120),
  constraint blog_posts_excerpt_length check (char_length(excerpt) between 20 and 300),
  constraint blog_posts_seo_title_length check (seo_title is null or char_length(seo_title) <= 70),
  constraint blog_posts_seo_description_length check (seo_description is null or char_length(seo_description) <= 170),
  constraint blog_posts_category_check check (category in ('news', 'gta-online', 'heist-guides', 'guides', 'crews-lfg', 'money')),
  constraint blog_posts_status_check check (status in ('draft', 'published', 'archived')),
  constraint blog_posts_published_at_present check (status <> 'published' or published_at is not null),
  constraint blog_posts_featured_image_check check (featured_image is null or featured_image ~ '^(https://|/)')
);

create index blog_posts_published_idx on public.blog_posts (status, published_at desc);
create index blog_posts_category_idx on public.blog_posts (category, published_at desc);

-- ---------------------------------------------------------------------------
-- First-party analytics (no cookies, no IPs stored) and rate limiting
-- ---------------------------------------------------------------------------
create table public.analytics_events (
  id bigint generated always as identity primary key,
  name text not null,
  path text,
  referrer_host text,
  session_id text,
  user_id uuid references public.profiles (id) on delete set null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint analytics_events_name_format check (name ~ '^[a-z]+(_[a-z]+)*$' and char_length(name) <= 48)
);

create index analytics_events_name_idx on public.analytics_events (name, created_at desc);

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);
