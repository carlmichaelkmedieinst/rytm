create or replace function public.demo_reject_stale(p_generation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_generation_id is distinct from public.demo_current_generation() then
    raise exception 'stale_generation' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.demo_require_user()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;
  return uid;
end;
$$;

create or replace function public.demo_source_location(p_qr_id text)
returns text
language sql
immutable
set search_path = public
as $$
  select case p_qr_id
    when 'rydeback_utegym' then 'Rydebäck utegym'
    else null
  end
$$;

create or replace function public.demo_fictional_email(p_local_part text)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  local_part text := lower(btrim(coalesce(p_local_part, '')));
begin
  if local_part !~ '^[a-z0-9]([a-z0-9._-]{0,30}[a-z0-9])?$' then
    raise exception 'invalid_email' using errcode = 'P0001';
  end if;
  return local_part || '@rytm.test';
end;
$$;

create or replace function public.demo_public_participant(p public.demo_participants)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'participant_id', p.participant_id,
    'generation_id', p.generation_id,
    'qr_id', p.qr_id,
    'lifecycle_status', p.lifecycle_status,
    'fictional_email', p.fictional_email,
    'waitlist_id', p.waitlist_id,
    'account_id', p.account_id,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  )
$$;

create or replace function public.demo_participant_events(p_participant_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'event_id', event_id,
        'visit_id', visit_id,
        'event_name', event_name,
        'event_kind', event_kind,
        'payload', payload,
        'created_at', created_at
      )
      order by event_seq
    ),
    '[]'::jsonb
  )
  from public.demo_events
  where participant_id = p_participant_id
$$;

create or replace function public.demo_add_event(
  p_participant_id uuid,
  p_visit_id uuid,
  p_event_name text,
  p_event_kind text,
  p_payload jsonb,
  p_generation_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.demo_events (
    participant_id,
    visit_id,
    event_name,
    event_kind,
    payload,
    generation_id
  ) values (
    p_participant_id,
    p_visit_id,
    p_event_name,
    p_event_kind,
    p_payload,
    p_generation_id
  );
end;
$$;

create or replace function public.demo_lock_participant(p_generation_id uuid)
returns public.demo_participants
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.demo_require_user();
  row public.demo_participants;
begin
  perform public.demo_reject_stale(p_generation_id);
  select *
  into row
  from public.demo_participants
  where auth_user_id = uid
    and generation_id = p_generation_id
  for update;
  if not found then
    raise exception 'participant_not_found' using errcode = 'P0001';
  end if;
  return row;
end;
$$;

create or replace function public.demo_ensure_participant(p_generation_id uuid, p_qr_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := public.demo_require_user();
  row public.demo_participants;
  created boolean := false;
begin
  perform public.demo_reject_stale(p_generation_id);
  if p_qr_id is null or p_qr_id !~ '^[a-z0-9_]{1,64}$' then
    raise exception 'invalid_qr' using errcode = 'P0001';
  end if;

  select *
  into row
  from public.demo_participants
  where auth_user_id = uid
    and generation_id = p_generation_id;

  if not found then
    begin
      insert into public.demo_participants (auth_user_id, qr_id, generation_id)
      values (uid, p_qr_id, p_generation_id)
      returning * into row;
      created := true;
    exception
      when unique_violation then
        select *
        into row
        from public.demo_participants
        where auth_user_id = uid
          and generation_id = p_generation_id;
    end;
  end if;

  return public.demo_public_participant(row) || jsonb_build_object('already', not created);
end;
$$;

create or replace function public.demo_register_visit(
  p_generation_id uuid,
  p_qr_id text,
  p_client_visit_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  participant public.demo_participants;
  visit public.demo_visits;
  created boolean := false;
begin
  if p_client_visit_key is null then
    raise exception 'invalid_visit_key' using errcode = 'P0001';
  end if;
  if p_qr_id is null or p_qr_id !~ '^[a-z0-9_]{1,64}$' then
    raise exception 'invalid_qr' using errcode = 'P0001';
  end if;

  participant := public.demo_lock_participant(p_generation_id);

  insert into public.demo_visits (participant_id, qr_id, client_visit_key, generation_id)
  values (participant.participant_id, p_qr_id, p_client_visit_key, p_generation_id)
  on conflict (participant_id, client_visit_key) do nothing
  returning * into visit;

  if found then
    created := true;
    perform public.demo_add_event(
      participant.participant_id,
      visit.visit_id,
      'demo_visit',
      'TRIGGER',
      jsonb_build_object('qr_id', visit.qr_id, 'visit_id', visit.visit_id),
      p_generation_id
    );
  else
    select *
    into visit
    from public.demo_visits
    where participant_id = participant.participant_id
      and client_visit_key = p_client_visit_key;
  end if;

  return jsonb_build_object(
    'visit_id', visit.visit_id,
    'participant_id', visit.participant_id,
    'qr_id', visit.qr_id,
    'generation_id', visit.generation_id,
    'created_at', visit.created_at,
    'already', not created
  );
end;
$$;

create or replace function public.demo_waitlist_signup(
  p_generation_id uuid,
  p_local_part text,
  p_launch_consent boolean,
  p_marketing_consent boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.demo_participants;
  email text;
  location text;
  token text;
begin
  if p_marketing_consent is null then
    raise exception 'invalid_body' using errcode = 'P0001';
  end if;

  row := public.demo_lock_participant(p_generation_id);
  if row.lifecycle_status <> 'visitor' then
    return public.demo_public_participant(row) || jsonb_build_object(
      'already', true,
      'registration_token', row.registration_token
    );
  end if;
  if p_launch_consent is distinct from true then
    raise exception 'consent_required' using errcode = 'P0001';
  end if;

  email := public.demo_fictional_email(p_local_part);
  location := public.demo_source_location(row.qr_id);
  token := encode(extensions.gen_random_bytes(24), 'hex');

  begin
    update public.demo_participants
    set
      fictional_email = email,
      waitlist_id = gen_random_uuid(),
      registration_token = token,
      lifecycle_status = 'waitlist',
      updated_at = now()
    where participant_id = row.participant_id
    returning * into row;
  exception
    when unique_violation then
      raise exception 'email_taken' using errcode = 'P0001';
  end;

  perform public.demo_add_event(
    row.participant_id,
    null,
    'waitlist_signup',
    'TRIGGER',
    jsonb_build_object(
      'email', row.fictional_email,
      'waitlist_id', row.waitlist_id,
      'qr_id', row.qr_id,
      'launch_notification_consent', true,
      'marketing_consent', p_marketing_consent,
      'token_issued', true,
      'lifecycle_status', 'waitlist'
    ),
    row.generation_id
  );

  perform public.demo_add_event(
    row.participant_id,
    null,
    'segment_assigned',
    'ACTION',
    jsonb_strip_nulls(jsonb_build_object(
      'source_segment', 'platsbunden_qr',
      'source_location', location,
      'qr_id', row.qr_id
    )),
    row.generation_id
  );

  return public.demo_public_participant(row) || jsonb_build_object(
    'already', false,
    'registration_token', row.registration_token
  );
end;
$$;

create or replace function public.demo_simulate_launch(p_generation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.demo_participants;
  signup jsonb;
begin
  row := public.demo_lock_participant(p_generation_id);
  if exists (
    select 1
    from public.demo_events
    where participant_id = row.participant_id
      and event_name = 'launch_notification_sent'
  ) then
    return public.demo_public_participant(row) || jsonb_build_object('already', true);
  end if;
  if row.lifecycle_status <> 'waitlist' then
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  select payload
  into signup
  from public.demo_events
  where participant_id = row.participant_id
    and event_name = 'waitlist_signup';

  if coalesce((signup ->> 'launch_notification_consent')::boolean, false) is not true then
    raise exception 'consent_required' using errcode = 'P0001';
  end if;

  perform public.demo_add_event(
    row.participant_id,
    null,
    'launch_notification_sent',
    'ACTION',
    jsonb_build_object(
      'to', row.fictional_email,
      'channel', 'e-post',
      'consent', 'launch_notification_consent',
      'simulated', true
    ),
    row.generation_id
  );

  return public.demo_public_participant(row) || jsonb_build_object('already', false);
end;
$$;
