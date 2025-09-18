-- Create singleton table to store panic overlay state
create table if not exists public.panic_overlay_state (
  id boolean primary key default true,
  is_active boolean not null default false,
  message text,
  details text,
  severity text not null default 'critical',
  retry_seconds integer not null default 60,
  last_triggered_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.panic_overlay_state enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'panic_overlay_state'
      and policyname = 'panic_overlay_read'
  ) then
    execute $$create policy panic_overlay_read on public.panic_overlay_state
      for select
      using (true)$$;
  end if;
end$$;

insert into public.panic_overlay_state (id, is_active)
values (true, false)
on conflict (id) do nothing;

create or replace function public.panic_overlay_get_state()
returns table (
  is_active boolean,
  message text,
  details text,
  severity text,
  retry_seconds integer,
  last_triggered_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    pos.is_active,
    pos.message,
    pos.details,
    pos.severity,
    pos.retry_seconds,
    pos.last_triggered_at,
    pos.updated_at
  from public.panic_overlay_state pos
  where pos.id = true;
end;
$$;

grant execute on function public.panic_overlay_get_state() to anon;
grant execute on function public.panic_overlay_get_state() to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_proc
    where proname = 'panic_overlay_set_state'
      and pg_catalog.pg_function_is_visible(oid)
  ) then
    null;
  end if;
end$$;

create or replace function public.panic_overlay_set_state(
  p_is_active boolean,
  p_message text default null,
  p_severity text default 'critical',
  p_details text default null,
  p_retry_seconds integer default 60
)
returns table (
  is_active boolean,
  message text,
  details text,
  severity text,
  retry_seconds integer,
  last_triggered_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_retry_seconds integer := greatest(5, coalesce(p_retry_seconds, 60));
  v_message text := nullif(trim(coalesce(p_message, '')), '');
  v_details text := nullif(trim(coalesce(p_details, '')), '');
  v_severity text := coalesce(nullif(trim(coalesce(p_severity, '')), ''), 'critical');
begin
  insert into public.panic_overlay_state as pos (
    id,
    is_active,
    message,
    details,
    severity,
    retry_seconds,
    last_triggered_at,
    updated_at
  )
  values (
    true,
    p_is_active,
    v_message,
    v_details,
    v_severity,
    v_retry_seconds,
    case when p_is_active then now() else pos.last_triggered_at end,
    now()
  )
  on conflict (id) do update
    set is_active = excluded.is_active,
        message = excluded.message,
        details = excluded.details,
        severity = excluded.severity,
        retry_seconds = excluded.retry_seconds,
        last_triggered_at = case when excluded.is_active then now() else pos.last_triggered_at end,
        updated_at = now()
  returning
    pos.is_active,
    pos.message,
    pos.details,
    pos.severity,
    pos.retry_seconds,
    pos.last_triggered_at,
    pos.updated_at;
end;
$$;

revoke all on function public.panic_overlay_set_state(boolean, text, text, text, integer) from public;
revoke all on function public.panic_overlay_set_state(boolean, text, text, text, integer) from anon;
revoke all on function public.panic_overlay_set_state(boolean, text, text, text, integer) from authenticated;

grant execute on function public.panic_overlay_set_state(boolean, text, text, text, integer) to service_role;
