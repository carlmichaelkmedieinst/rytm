-- Isolated Marketing Automation demo.
-- Does not read or write public.events, user_settings, user_state, workouts, or workout_entries.

create table public.demo_control (
  id smallint primary key default 1 check (id = 1),
  generation_id uuid not null default gen_random_uuid(),
  access_secret_hash text,
  last_reset_at timestamptz,
  created_at timestamptz not null default now()
);

insert into public.demo_control (id) values (1);

create table public.demo_participants (
  participant_id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  fictional_email text,
  waitlist_id uuid,
  account_id uuid,
  registration_token text,
  qr_id text not null,
  lifecycle_status text not null default 'visitor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  generation_id uuid not null,
  constraint demo_participants_lifecycle_check check (
    lifecycle_status in ('visitor', 'waitlist', 'account_created', 'awaiting_comparison', 'activated')
  ),
  constraint demo_participants_email_check check (
    fictional_email is null
    or fictional_email ~ '^[a-z0-9]([a-z0-9._-]{0,30}[a-z0-9])?@rytm[.]test$'
  ),
  constraint demo_participants_qr_check check (qr_id ~ '^[a-z0-9_]{1,64}$'),
  unique (auth_user_id, generation_id)
);

create unique index demo_participants_email_uidx
  on public.demo_participants (generation_id, fictional_email)
  where fictional_email is not null;

create table public.demo_visits (
  visit_id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.demo_participants (participant_id) on delete cascade,
  qr_id text not null,
  client_visit_key uuid not null,
  created_at timestamptz not null default now(),
  generation_id uuid not null,
  unique (participant_id, client_visit_key),
  constraint demo_visits_qr_check check (qr_id ~ '^[a-z0-9_]{1,64}$')
);

create table public.demo_events (
  event_id uuid primary key default gen_random_uuid(),
  event_seq bigint generated always as identity,
  participant_id uuid not null references public.demo_participants (participant_id) on delete cascade,
  visit_id uuid references public.demo_visits (visit_id) on delete set null,
  event_name text not null,
  event_kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default clock_timestamp(),
  generation_id uuid not null,
  constraint demo_events_kind_check check (event_kind in ('TRIGGER', 'ACTION', 'HÄNDELSE')),
  constraint demo_events_name_check check (event_name ~ '^[a-z0-9_]{1,64}$'),
  constraint demo_events_payload_object check (jsonb_typeof(payload) = 'object')
);

create unique index demo_events_milestone_uidx
  on public.demo_events (participant_id, event_name)
  where event_name <> 'demo_visit';

create unique index demo_events_visit_uidx
  on public.demo_events (visit_id)
  where event_name = 'demo_visit';

create index demo_events_participant_seq_idx
  on public.demo_events (participant_id, event_seq);

create index demo_visits_participant_idx
  on public.demo_visits (participant_id, created_at);

alter table public.demo_control enable row level security;
alter table public.demo_participants enable row level security;
alter table public.demo_visits enable row level security;
alter table public.demo_events enable row level security;

revoke all on public.demo_control from public, anon, authenticated;
revoke all on public.demo_participants from public, anon, authenticated;
revoke all on public.demo_visits from public, anon, authenticated;
revoke all on public.demo_events from public, anon, authenticated;

grant select (
  participant_id,
  auth_user_id,
  fictional_email,
  waitlist_id,
  account_id,
  qr_id,
  lifecycle_status,
  created_at,
  updated_at,
  generation_id
) on public.demo_participants to authenticated;

grant select on public.demo_visits to authenticated;
grant select on public.demo_events to authenticated;

create or replace function public.demo_events_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.payload ?| array['registration_token', 'access_token', 'refresh_token', 'token', 'authorization'] then
    raise exception 'payload_rejected' using errcode = 'P0001';
  end if;
  if new.generation_id is distinct from (select generation_id from public.demo_control where id = 1) then
    raise exception 'stale_generation' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger demo_events_guard
  before insert or update on public.demo_events
  for each row execute function public.demo_events_guard();

create or replace function public.demo_generation_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.generation_id is distinct from (select generation_id from public.demo_control where id = 1) then
    raise exception 'stale_generation' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger demo_participants_generation_guard
  before insert or update on public.demo_participants
  for each row execute function public.demo_generation_guard();

create trigger demo_visits_generation_guard
  before insert or update on public.demo_visits
  for each row execute function public.demo_generation_guard();

create or replace function public.demo_current_generation()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select generation_id from public.demo_control where id = 1
$$;

create policy demo_participants_select_own
  on public.demo_participants
  for select
  to authenticated
  using (
    auth_user_id = (select auth.uid())
    and generation_id = public.demo_current_generation()
  );

create policy demo_visits_select_own
  on public.demo_visits
  for select
  to authenticated
  using (
    generation_id = public.demo_current_generation()
    and exists (
      select 1
      from public.demo_participants as participant
      where participant.participant_id = demo_visits.participant_id
        and participant.auth_user_id = (select auth.uid())
    )
  );

create policy demo_events_select_own
  on public.demo_events
  for select
  to authenticated
  using (
    generation_id = public.demo_current_generation()
    and exists (
      select 1
      from public.demo_participants as participant
      where participant.participant_id = demo_events.participant_id
        and participant.auth_user_id = (select auth.uid())
    )
  );
