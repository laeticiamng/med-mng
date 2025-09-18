-- Ensure deployment integrity tracking tables and helpers exist
set search_path = public;

create table if not exists public.deployment_integrity_checks (
    check_name text primary key,
    category text not null,
    severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
    description text not null,
    remediation text not null,
    created_at timestamptz not null default timezone('utc', now())
);

comment on table public.deployment_integrity_checks is
    'Registry of integrity checks executed after each deployment, used to drive post-deploy runbooks and CI reporting.';

comment on column public.deployment_integrity_checks.check_name is 'Stable identifier for an integrity check (machine readable).';
comment on column public.deployment_integrity_checks.category is 'Functional area covered by the check (database, policies, storage, analytics, etc.).';
comment on column public.deployment_integrity_checks.severity is 'Business impact if the check fails.';
comment on column public.deployment_integrity_checks.description is 'Short human description of what is being validated.';
comment on column public.deployment_integrity_checks.remediation is 'Guidance to resolve a failing check.';

create table if not exists public.deployment_integrity_snapshots (
    id uuid primary key default gen_random_uuid(),
    environment text not null check (environment in ('development', 'staging', 'production')),
    check_name text not null references public.deployment_integrity_checks (check_name) on delete cascade,
    status text not null check (status in ('pass', 'warn', 'fail')),
    details jsonb not null default '{}'::jsonb,
    executed_at timestamptz not null default timezone('utc', now()),
    executed_by uuid,
    constraint deployment_integrity_snapshots_unique unique (environment, check_name, executed_at)
);

comment on table public.deployment_integrity_snapshots is
    'Audit trail of integrity checks executed after a deploy (one row per check run).';

comment on column public.deployment_integrity_snapshots.environment is 'Target environment of the deploy (development, staging or production).';
comment on column public.deployment_integrity_snapshots.check_name is 'Identifier of the check executed (FK to deployment_integrity_checks).';
comment on column public.deployment_integrity_snapshots.status is 'Result of the check: pass, warn or fail.';
comment on column public.deployment_integrity_snapshots.details is 'Structured payload describing evidence collected for the check.';
comment on column public.deployment_integrity_snapshots.executed_at is 'UTC timestamp for when the check completed.';
comment on column public.deployment_integrity_snapshots.executed_by is 'User or service who triggered the check (nullable for automated runs).';

create index if not exists deployment_integrity_snapshots_env_idx
    on public.deployment_integrity_snapshots (environment, executed_at desc);

create index if not exists deployment_integrity_snapshots_check_idx
    on public.deployment_integrity_snapshots (check_name, executed_at desc);

alter table if exists public.deployment_integrity_checks enable row level security;
alter table if exists public.deployment_integrity_snapshots enable row level security;

create policy if not exists "integrity_checks_read_any"
    on public.deployment_integrity_checks
    for select
    using (true);

create policy if not exists "integrity_checks_service_role_manage"
    on public.deployment_integrity_checks
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy if not exists "integrity_snapshots_service_role_full"
    on public.deployment_integrity_snapshots
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create or replace function public.record_deployment_integrity(
    p_environment text,
    p_check_name text,
    p_status text,
    p_details jsonb default '{}'::jsonb,
    p_executed_by uuid default null
) returns void
language plpgsql
security definer
set search_path = public
as
$$
begin
    if p_environment not in ('development', 'staging', 'production') then
        raise exception 'Unknown environment: %', p_environment;
    end if;

    if p_status not in ('pass', 'warn', 'fail') then
        raise exception 'Unsupported integrity status: %', p_status;
    end if;

    insert into public.deployment_integrity_snapshots(environment, check_name, status, details, executed_by)
    values (p_environment, p_check_name, p_status, coalesce(p_details, '{}'::jsonb), p_executed_by);
end;
$$;

comment on function public.record_deployment_integrity(text, text, text, jsonb, uuid) is
    'Helper invoked by the CI integrity script to append a deployment integrity snapshot.';

create or replace view public.deployment_integrity_latest as
select distinct on (environment, check_name)
    environment,
    check_name,
    status,
    details,
    executed_at,
    executed_by
from public.deployment_integrity_snapshots
order by environment, check_name, executed_at desc;

comment on view public.deployment_integrity_latest is
    'Convenience view exposing the latest status per check and environment.';

grant select on public.deployment_integrity_latest to authenticated;
grant select on public.deployment_integrity_latest to service_role;
