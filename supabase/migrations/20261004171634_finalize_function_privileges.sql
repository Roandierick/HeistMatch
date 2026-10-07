-- The project still has legacy default function grants enabled. Explicitly
-- remove the anon grant added when the SECURITY INVOKER wrapper was created.
revoke all on function public.is_heist_participant(uuid, uuid) from public, anon;
grant execute on function public.is_heist_participant(uuid, uuid) to authenticated, service_role;
