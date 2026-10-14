-- Supabase preloads safeupdate for the API role. Unqualified DELETE is rejected
-- before any row is removed. The presenter secret checks are unchanged.

create or replace function public.demo_reset_generation(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  removed bigint;
  next_generation uuid;
begin
  if coalesce(public.demo_access_configured(), false) is not true then
    raise exception 'not_configured' using errcode = 'P0001';
  end if;
  if public.demo_secret_ok(p_secret) is not true then
    raise exception 'unauthorized' using errcode = 'P0001';
  end if;

  select count(*) into removed from public.demo_participants;
  delete from public.demo_events where event_id is not null;
  delete from public.demo_visits where visit_id is not null;
  delete from public.demo_participants where participant_id is not null;

  update public.demo_control
  set
    generation_id = gen_random_uuid(),
    last_reset_at = now()
  where id = 1
  returning generation_id into next_generation;

  return jsonb_build_object(
    'generation_id', next_generation,
    'deleted_participants', removed,
    'last_reset_at', (select last_reset_at from public.demo_control where id = 1)
  );
end;
$$;

revoke all on function public.demo_reset_generation(text) from public, anon, authenticated;
grant execute on function public.demo_reset_generation(text) to anon, service_role;
