-- Seed baseline integrity checks for production (no snapshot seeded to keep history clean)
set search_path = public;

insert into public.deployment_integrity_checks (check_name, category, severity, description, remediation)
values
    ('database_migrations_applied', 'database', 'critical', 'All SQL migrations have been executed without drift.', 'Run `supabase db push` or re-apply the migration bundle until the checksum matches.'),
    ('rls_policies_enforced', 'security', 'high', 'Row Level Security policies are active for user-owned data sets.', 'Review `supabase/migrations` for missing `enable row level security` or missing policies and redeploy.'),
    ('seed_data_loaded', 'operations', 'medium', 'Baseline lookup/fixture data is present for the current environment.', 'Execute the appropriate seed file via `supabase db remote commit` or psql.'),
    ('analytics_pipeline_healthy', 'analytics', 'medium', 'Analytics ingestion pipeline is reachable and accepts canonical events.', 'Check the analytics edge function logs and redeploy if the health probe fails.'),
    ('panic_overlay_ready', 'observability', 'low', 'Panic overlay health endpoint is reachable and can be toggled off.', 'Verify the panic overlay endpoint and redeploy the edge function if needed.'),
    ('runbooks_accessible', 'operations', 'low', 'Runbook documentation is published with the expected version hash.', 'Trigger the docs pipeline or sync the `/docs/runbooks` folder.');

on conflict (check_name) do update
set
    category = excluded.category,
    severity = excluded.severity,
    description = excluded.description,
    remediation = excluded.remediation;
