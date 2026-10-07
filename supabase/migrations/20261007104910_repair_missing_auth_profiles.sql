-- Accounts created before the profile trigger was installed can authenticate,
-- but cannot use any feature whose foreign keys point at public.profiles.
-- Restore that invariant without touching accounts that already have a profile.
insert into public.profiles (
  id,
  username,
  platform,
  region,
  primary_language,
  languages
)
select
  u.id,
  case
    when coalesce(u.raw_user_meta_data ->> 'username', '') ~ '^[A-Za-z0-9_]{3,20}$'
      and not exists (
        select 1
        from public.profiles existing
        where lower(existing.username) = lower(u.raw_user_meta_data ->> 'username')
      )
      and count(*) over (
        partition by lower(u.raw_user_meta_data ->> 'username')
      ) = 1
      then u.raw_user_meta_data ->> 'username'
    else 'player_' || substr(replace(u.id::text, '-', ''), 1, 13)
  end,
  case
    when u.raw_user_meta_data ->> 'platform' in ('ps5', 'xbox', 'pc')
      then u.raw_user_meta_data ->> 'platform'
    else 'ps5'
  end,
  case
    when u.raw_user_meta_data ->> 'region' in ('eu', 'na', 'sa', 'asia', 'oce', 'mea')
      then u.raw_user_meta_data ->> 'region'
    else 'eu'
  end,
  case
    when coalesce(u.raw_user_meta_data ->> 'language', '') ~ '^[a-z]{2}$'
      then u.raw_user_meta_data ->> 'language'
    else 'en'
  end,
  array[
    case
      when coalesce(u.raw_user_meta_data ->> 'language', '') ~ '^[a-z]{2}$'
        then u.raw_user_meta_data ->> 'language'
      else 'en'
    end
  ]::text[]
from auth.users u
where not exists (
  select 1
  from public.profiles existing
  where existing.id = u.id
);

-- Keep the one-to-one private profile invariant in sync as well.
insert into public.profile_private (user_id)
select p.id
from public.profiles p
where not exists (
  select 1
  from public.profile_private private_profile
  where private_profile.user_id = p.id
)
on conflict (user_id) do nothing;
