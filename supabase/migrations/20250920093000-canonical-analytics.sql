-- Canonical analytics event schema and privacy preferences
create extension if not exists pgcrypto;

-- Opt-in preferences table to enforce privacy by design
create table if not exists public.user_privacy_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  analytics_opt_in boolean not null default false,
  pseudonymized_user_id uuid not null default gen_random_uuid(),
  consent_version text not null default '2025-09',
  consent_updated_at timestamptz not null default now(),
  retention_days integer not null default 180,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_privacy_preferences_retention_chk check (retention_days >= 30)
);

create unique index if not exists user_privacy_preferences_pseudo_idx
  on public.user_privacy_preferences (pseudonymized_user_id);

create trigger user_privacy_preferences_set_updated_at
before update on public.user_privacy_preferences
for each row execute function public.handle_updated_at();

alter table public.user_privacy_preferences enable row level security;

create policy if not exists "privacy_preferences_own_read"
  on public.user_privacy_preferences
  for select
  using (auth.uid() = user_id);

create policy if not exists "privacy_preferences_own_write"
  on public.user_privacy_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "privacy_preferences_insert_self"
  on public.user_privacy_preferences
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "privacy_preferences_service_role"
  on public.user_privacy_preferences
  for all
  using (auth.role() = 'service_role')
  with check (true);

-- Canonical event type enum to avoid free-form strings
create type public.analytics_event_type as enum (
  'generate_start',
  'generate_success',
  'generate_fail',
  'lyrics_timecode_done',
  'play',
  'seek_segment',
  'qcm_start',
  'qcm_submit',
  'qcm_complete',
  'bd_generate_start',
  'bd_generate_success',
  'bd_generate_fail',
  'study_start',
  'study_end',
  'sync_success',
  'sync_fail'
);

-- Canonical analytics events storage (pseudonymised)
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  pseudonymized_user_id uuid not null references public.user_privacy_preferences(pseudonymized_user_id) on delete cascade,
  event_type public.analytics_event_type not null,
  occurred_at timestamptz not null default now(),
  content_ref uuid null,
  session_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.analytics_events is 'Canonical analytics events with pseudonymised user identifiers and consent-aware ingestion.';

create index if not exists analytics_events_type_idx on public.analytics_events(event_type, occurred_at desc);
create index if not exists analytics_events_session_idx on public.analytics_events(session_id);
create index if not exists analytics_events_content_idx on public.analytics_events(content_ref);

alter table public.analytics_events enable row level security;

create policy if not exists "analytics_events_service_role"
  on public.analytics_events
  for all
  using (auth.role() = 'service_role')
  with check (true);

-- Helpers ---------------------------------------------------------------

create or replace function public.set_analytics_opt_in(
  p_user_id uuid,
  p_opt_in boolean,
  p_consent_version text default '2025-09',
  p_retention_days integer default 180
)
returns public.user_privacy_preferences
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_record public.user_privacy_preferences;
begin
  if p_user_id is null then
    raise exception 'User id is required';
  end if;

  insert into public.user_privacy_preferences as pref (
    user_id,
    analytics_opt_in,
    consent_version,
    consent_updated_at,
    retention_days
  ) values (
    p_user_id,
    coalesce(p_opt_in, false),
    coalesce(nullif(trim(p_consent_version), ''), '2025-09'),
    now(),
    greatest(30, coalesce(p_retention_days, 180))
  )
  on conflict (user_id)
  do update
    set analytics_opt_in = excluded.analytics_opt_in,
        consent_version = excluded.consent_version,
        consent_updated_at = now(),
        retention_days = greatest(30, excluded.retention_days),
        updated_at = now(),
        pseudonymized_user_id = case
          when excluded.analytics_opt_in = false then gen_random_uuid()
          when pref.analytics_opt_in = false and excluded.analytics_opt_in = true then gen_random_uuid()
          else pref.pseudonymized_user_id
        end
  returning * into v_record;

  return v_record;
end;
$$;

grant execute on function public.set_analytics_opt_in(uuid, boolean, text, integer) to authenticated;

grant execute on function public.set_analytics_opt_in(uuid, boolean, text, integer) to anon;

create or replace function public.log_analytics_event(
  p_user_id uuid,
  p_event_type public.analytics_event_type,
  p_metadata jsonb default '{}'::jsonb,
  p_content_ref uuid default null,
  p_session_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_pref public.user_privacy_preferences;
  v_event_id uuid;
begin
  if p_user_id is null then
    return null;
  end if;

  select * into v_pref
  from public.user_privacy_preferences
  where user_id = p_user_id;

  if v_pref is null or v_pref.analytics_opt_in is false then
    return null;
  end if;

  insert into public.analytics_events (
    id,
    pseudonymized_user_id,
    event_type,
    occurred_at,
    content_ref,
    session_id,
    metadata
  ) values (
    gen_random_uuid(),
    v_pref.pseudonymized_user_id,
    p_event_type,
    now(),
    p_content_ref,
    coalesce(p_session_id, gen_random_uuid()),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

grant execute on function public.log_analytics_event(uuid, public.analytics_event_type, jsonb, uuid, uuid) to authenticated;

grant execute on function public.log_analytics_event(uuid, public.analytics_event_type, jsonb, uuid, uuid) to anon;

create or replace function public.purge_expired_analytics_events()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_deleted integer;
begin
  delete from public.analytics_events ae
  using public.user_privacy_preferences pref
  where ae.pseudonymized_user_id = pref.pseudonymized_user_id
    and ae.occurred_at < now() - (pref.retention_days || ' days')::interval;

  get diagnostics v_deleted = row_count;
  return coalesce(v_deleted, 0);
end;
$$;

grant execute on function public.purge_expired_analytics_events() to authenticated;

grant execute on function public.purge_expired_analytics_events() to anon;

create or replace function public.try_cast_numeric(value text)
returns numeric
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_numeric numeric;
begin
  if value is null then
    return null;
  end if;

  begin
    v_numeric := trim(value)::numeric;
  exception when others then
    return null;
  end;

  return v_numeric;
end;
$$;

grant execute on function public.try_cast_numeric(text) to authenticated;

grant execute on function public.try_cast_numeric(text) to anon;

create or replace function public.get_analytics_dashboard(p_timeframe text default '7d')
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_start timestamptz;
  v_result jsonb;
begin
  v_start := case coalesce(p_timeframe, '7d')
    when '24h' then now() - interval '24 hours'
    when '7d' then now() - interval '7 days'
    when '30d' then now() - interval '30 days'
    when '90d' then now() - interval '90 days'
    else now() - interval '7 days'
  end;

  v_result := jsonb_build_object(
    'generated_at', now(),
    'timeframe', coalesce(p_timeframe, '7d'),
    'event_breakdown', coalesce((
      select jsonb_agg(jsonb_build_object('event_type', event_type, 'count', event_count))
      from (
        select event_type, count(*) as event_count
        from public.analytics_events
        where occurred_at >= v_start
        group by event_type
        order by event_count desc
      ) breakdown
    ), '[]'::jsonb),
    'top_frictions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'event_type', event_type,
        'count', event_count,
        'last_occurrence', last_occurrence,
        'sample_metadata', sample_metadata
      ))
      from (
        select event_type,
               count(*) as event_count,
               max(occurred_at) as last_occurrence,
               (array_agg(metadata order by occurred_at desc))[1] as sample_metadata
        from public.analytics_events
        where occurred_at >= v_start
          and event_type in ('generate_fail', 'sync_fail', 'bd_generate_fail')
        group by event_type
        order by event_count desc
        limit 5
      ) frictions
    ), '[]'::jsonb),
    'top_contents', coalesce((
      select jsonb_agg(jsonb_build_object(
        'content_ref', content_ref,
        'event_type', event_type,
        'count', event_count
      ))
      from (
        select content_ref,
               event_type,
               count(*) as event_count
        from public.analytics_events
        where occurred_at >= v_start
          and event_type in (
            'generate_success',
            'lyrics_timecode_done',
            'study_end',
            'play',
            'qcm_complete',
            'bd_generate_success'
          )
          and content_ref is not null
        group by content_ref, event_type
        order by event_count desc
        limit 10
      ) contents
    ), '[]'::jsonb),
    'top_played_items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'item_code', item_code,
        'item_title', item_title,
        'play_count', play_count
      ))
      from (
        select
          nullif(trim(metadata ->> 'item_code'), '') as item_code,
          max(nullif(trim(metadata ->> 'item_title'), '')) as item_title,
          count(*) as play_count
        from public.analytics_events
        where occurred_at >= v_start
          and event_type = 'play'
          and metadata ? 'item_code'
        group by nullif(trim(metadata ->> 'item_code'), '')
        order by play_count desc
        limit 10
      ) plays
    ), '[]'::jsonb),
    'recent_qcm_scores', coalesce((
      select jsonb_agg(jsonb_build_object(
        'item_code', metadata ->> 'item_code',
        'score', try_cast_numeric(metadata ->> 'score'),
        'time_spent_seconds', try_cast_numeric(metadata ->> 'time_spent_seconds'),
        'occurred_at', occurred_at
      ) order by occurred_at desc)
      from (
        select metadata, occurred_at
        from public.analytics_events
        where occurred_at >= v_start
          and event_type = 'qcm_complete'
          and metadata ? 'score'
        order by occurred_at desc
        limit 10
      ) qcm
    ), '[]'::jsonb),
    'kpis', jsonb_build_object(
      'total_events', (
        select count(*)
        from public.analytics_events
        where occurred_at >= v_start
      ),
      'generation_success_rate', (
        select case
          when generation_started > 0 then round((generation_success::numeric / generation_started) * 100, 2)
          else null
        end
        from (
          select
            sum(case when event_type = 'generate_start' then 1 else 0 end) as generation_started,
            sum(case when event_type = 'generate_success' then 1 else 0 end) as generation_success
          from public.analytics_events
          where occurred_at >= v_start
        ) stats
      ),
      'average_generation_time_ms', (
        select round(avg(try_cast_numeric(metadata ->> 'duration_ms')))
        from public.analytics_events
        where occurred_at >= v_start
          and event_type = 'generate_success'
          and metadata ? 'duration_ms'
      ),
      'average_qcm_score', (
        select round(avg(try_cast_numeric(metadata ->> 'score')), 2)
        from public.analytics_events
        where occurred_at >= v_start
          and event_type = 'qcm_complete'
          and metadata ? 'score'
      ),
      'qcm_attempts', (
        select count(*)
        from public.analytics_events
        where occurred_at >= v_start
          and event_type = 'qcm_submit'
      ),
      'karaoke_seek_events', (
        select count(*)
        from public.analytics_events
        where occurred_at >= v_start
          and event_type = 'seek_segment'
      )
    ),
    'timeseries', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bucket', bucket,
        'event_type', event_type,
        'count', event_count
      ) order by bucket asc)
      from (
        select date_trunc(case when p_timeframe = '24h' then 'hour' else 'day' end, occurred_at) as bucket,
               event_type,
               count(*) as event_count
        from public.analytics_events
        where occurred_at >= v_start
        group by 1, 2
        order by bucket asc
      ) ts
    ), '[]'::jsonb)
  );

  return v_result;
end;
$$;

grant execute on function public.get_analytics_dashboard(text) to authenticated;

grant execute on function public.get_analytics_dashboard(text) to anon;

