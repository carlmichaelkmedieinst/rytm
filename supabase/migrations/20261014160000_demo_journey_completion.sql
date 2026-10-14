-- The second simulated workout records a product event, then a separate automation action.
-- Token handoff stays on the authenticated participant and is not written to events.

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
    'HÄNDELSE',
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

create or replace function public.demo_session_registration_token(p_generation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.demo_participants;
begin
  row := public.demo_lock_participant(p_generation_id);
  if row.lifecycle_status <> 'waitlist'
    or row.account_id is not null
    or row.waitlist_id is null
    or row.registration_token is null
    or not exists (
      select 1
      from public.demo_events
      where participant_id = row.participant_id
        and event_name = 'launch_notification_sent'
    )
  then
    return jsonb_build_object('available', false);
  end if;

  return jsonb_build_object(
    'available', true,
    'registration_token', row.registration_token
  );
end;
$$;

revoke all on function public.demo_session_registration_token(uuid) from public, anon, authenticated;
grant execute on function public.demo_session_registration_token(uuid) to authenticated, service_role;

notify pgrst, 'reload schema';
