create or replace function public.demo_link_account(
  p_generation_id uuid,
  p_registration_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.demo_participants;
begin
  row := public.demo_lock_participant(p_generation_id);
  if row.account_id is not null then
    return public.demo_public_participant(row) || jsonb_build_object('already', true);
  end if;
  if row.lifecycle_status <> 'waitlist' or row.waitlist_id is null then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;
  if not exists (
    select 1
    from public.demo_events
    where participant_id = row.participant_id
      and event_name = 'launch_notification_sent'
  ) then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;
  if row.registration_token is null
    or p_registration_token is null
    or length(p_registration_token) <> length(row.registration_token)
    or row.registration_token <> p_registration_token then
    raise exception 'invalid_token' using errcode = 'P0001';
  end if;

  update public.demo_participants
  set
    account_id = gen_random_uuid(),
    registration_token = null,
    lifecycle_status = 'account_created',
    updated_at = now()
  where participant_id = row.participant_id
  returning * into row;

  perform public.demo_add_event(
    row.participant_id,
    null,
    'account_created',
    'TRIGGER',
    jsonb_build_object(
      'waitlist_id', row.waitlist_id,
      'account_id', row.account_id,
      'linking', 'simulated_registration_token',
      'simulated', true
    ),
    row.generation_id
  );

  return public.demo_public_participant(row) || jsonb_build_object('already', false);
end;
$$;

create or replace function public.demo_register_workout(p_generation_id uuid, p_step text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.demo_participants;
begin
  if p_step not in ('first', 'second') then
    raise exception 'invalid_step' using errcode = 'P0001';
  end if;

  row := public.demo_lock_participant(p_generation_id);

  if p_step = 'first' then
    if row.lifecycle_status in ('awaiting_comparison', 'activated') then
      return public.demo_public_participant(row) || jsonb_build_object('already', true);
    end if;
    if row.lifecycle_status <> 'account_created' then
      raise exception 'invalid_transition' using errcode = 'P0001';
    end if;

    update public.demo_participants
    set lifecycle_status = 'awaiting_comparison', updated_at = now()
    where participant_id = row.participant_id
    returning * into row;

    perform public.demo_add_event(
      row.participant_id,
      null,
      'first_workout_completed',
      'HÄNDELSE',
      jsonb_build_object('simulated', true),
      row.generation_id
    );
    return public.demo_public_participant(row) || jsonb_build_object('already', false);
  end if;

  if row.lifecycle_status = 'activated' then
    return public.demo_public_participant(row) || jsonb_build_object('already', true);
  end if;
  if row.lifecycle_status <> 'awaiting_comparison' then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  update public.demo_participants
  set lifecycle_status = 'activated', updated_at = now()
  where participant_id = row.participant_id
  returning * into row;

  perform public.demo_add_event(
    row.participant_id,
    null,
    'first_comparison_available',
    'TRIGGER',
    jsonb_build_object('simulated', true, 'first_comparison_available', true),
    row.generation_id
  );
  perform public.demo_add_event(
    row.participant_id,
    null,
    'activation_communication_stopped',
    'ACTION',
    jsonb_build_object('reason', 'first_comparison_available'),
    row.generation_id
  );

  return public.demo_public_participant(row) || jsonb_build_object('already', false);
end;
$$;

create or replace function public.demo_my_timeline(p_generation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.demo_participants;
begin
  row := public.demo_lock_participant(p_generation_id);
  return public.demo_public_participant(row) || jsonb_build_object(
    'events', public.demo_participant_events(row.participant_id)
  );
end;
$$;

create or replace function public.demo_access_configured()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select access_secret_hash is not null and length(access_secret_hash) = 64
  from public.demo_control
  where id = 1
$$;

create or replace function public.demo_secret_ok(p_secret text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  expected text;
  actual text;
begin
  if p_secret is null or length(p_secret) < 24 then
    return false;
  end if;
  select access_secret_hash into expected from public.demo_control where id = 1;
  if expected is null or length(expected) <> 64 then
    return false;
  end if;
  actual := encode(extensions.digest(convert_to(p_secret, 'utf8'), 'sha256'), 'hex');
  return actual = expected;
end;
$$;

create or replace function public.demo_backstage(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_generation uuid;
begin
  if coalesce(public.demo_access_configured(), false) is not true then
    raise exception 'not_configured' using errcode = 'P0001';
  end if;
  if public.demo_secret_ok(p_secret) is not true then
    raise exception 'unauthorized' using errcode = 'P0001';
  end if;

  current_generation := public.demo_current_generation();

  return jsonb_build_object(
    'generation_id', current_generation,
    'last_reset_at', (select last_reset_at from public.demo_control where id = 1),
    'kpis', (
      select jsonb_build_object(
        'visits', (select count(*) from public.demo_visits where generation_id = current_generation),
        'unique_participants', (select count(*) from public.demo_participants where generation_id = current_generation),
        'signups', (
          select count(*) from public.demo_participants
          where generation_id = current_generation and lifecycle_status <> 'visitor'
        ),
        'accounts', (
          select count(*) from public.demo_participants
          where generation_id = current_generation and account_id is not null
        ),
        'activated', (
          select count(*) from public.demo_participants
          where generation_id = current_generation and lifecycle_status = 'activated'
        ),
        'activation_rate', (
          select case
            when count(*) filter (where account_id is not null) = 0 then null
            else round(
              count(*) filter (where lifecycle_status = 'activated')::numeric
              / count(*) filter (where account_id is not null),
              4
            )
          end
          from public.demo_participants
          where generation_id = current_generation
        )
      )
    ),
    'participants', coalesce((
      select jsonb_agg(item order by item ->> 'created_at', item ->> 'participant_id')
      from (
        select public.demo_public_participant(participant) || jsonb_build_object(
          'latest_event', (
            select jsonb_build_object(
              'event_name', event_name,
              'event_kind', event_kind,
              'created_at', created_at
            )
            from public.demo_events
            where participant_id = participant.participant_id
            order by event_seq desc
            limit 1
          ),
          'events', public.demo_participant_events(participant.participant_id)
        ) as item
        from public.demo_participants as participant
        where participant.generation_id = current_generation
      ) as rows
    ), '[]'::jsonb)
  );
end;
$$;

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
  delete from public.demo_events;
  delete from public.demo_visits;
  delete from public.demo_participants;

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

revoke all on function public.demo_events_guard() from public, anon, authenticated;
revoke all on function public.demo_generation_guard() from public, anon, authenticated;
revoke all on function public.demo_current_generation() from public, anon, authenticated;
revoke all on function public.demo_reject_stale(uuid) from public, anon, authenticated;
revoke all on function public.demo_require_user() from public, anon, authenticated;
revoke all on function public.demo_source_location(text) from public, anon, authenticated;
revoke all on function public.demo_fictional_email(text) from public, anon, authenticated;
revoke all on function public.demo_public_participant(public.demo_participants) from public, anon, authenticated;
revoke all on function public.demo_participant_events(uuid) from public, anon, authenticated;
revoke all on function public.demo_add_event(uuid, uuid, text, text, jsonb, uuid) from public, anon, authenticated;
revoke all on function public.demo_lock_participant(uuid) from public, anon, authenticated;
revoke all on function public.demo_ensure_participant(uuid, text) from public, anon, authenticated;
revoke all on function public.demo_register_visit(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.demo_waitlist_signup(uuid, text, boolean, boolean) from public, anon, authenticated;
revoke all on function public.demo_simulate_launch(uuid) from public, anon, authenticated;
revoke all on function public.demo_link_account(uuid, text) from public, anon, authenticated;
revoke all on function public.demo_register_workout(uuid, text) from public, anon, authenticated;
revoke all on function public.demo_my_timeline(uuid) from public, anon, authenticated;
revoke all on function public.demo_access_configured() from public, anon, authenticated;
revoke all on function public.demo_secret_ok(text) from public, anon, authenticated;
revoke all on function public.demo_backstage(text) from public, anon, authenticated;
revoke all on function public.demo_reset_generation(text) from public, anon, authenticated;

grant execute on function public.demo_current_generation() to anon, authenticated, service_role;
grant execute on function public.demo_ensure_participant(uuid, text) to authenticated, service_role;
grant execute on function public.demo_register_visit(uuid, text, uuid) to authenticated, service_role;
grant execute on function public.demo_waitlist_signup(uuid, text, boolean, boolean) to authenticated, service_role;
grant execute on function public.demo_simulate_launch(uuid) to authenticated, service_role;
grant execute on function public.demo_link_account(uuid, text) to authenticated, service_role;
grant execute on function public.demo_register_workout(uuid, text) to authenticated, service_role;
grant execute on function public.demo_my_timeline(uuid) to authenticated, service_role;
grant execute on function public.demo_backstage(text) to anon, service_role;
grant execute on function public.demo_reset_generation(text) to anon, service_role;

notify pgrst, 'reload schema';
