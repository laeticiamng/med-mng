# Large Migration Playbook – med-mng

_Last updated: 2025-10-01_

## When to use this guide

Activate this playbook when a database change:
- Touches tables larger than 1M rows
- Alters primary keys or introduces backfill-heavy columns
- Requires Supabase function changes coupled with SQL migrations
- Has downtime risk for EDN/ECOS or music orchestration workflows

## Planning Checklist

- [ ] Migration proposal reviewed with backend + product stakeholders
- [ ] Rollback strategy documented (see [rollback](rollback.md))
- [ ] Performance impact assessed using `EXPLAIN ANALYZE` on a staging clone
- [ ] Feature flags or dual-write strategy prepared if needed
- [ ] Integrity check coverage defined (new `deployment_integrity_checks` entries if applicable)

## Dry Run Procedure

1. **Clone staging data** into a disposable database (Supabase branch or local `supabase start`).
2. **Apply migrations**
   ```bash
   supabase db reset --linked
   supabase db push
   psql $SUPABASE_DB_URL -f supabase/seeds/staging.sql
   ```
3. **Measure** query timings before/after using saved `EXPLAIN ANALYZE` plans.
4. **Run automated tests** (`pnpm test`, Cypress happy path, analytics smoke tests).
5. **Capture integrity snapshot** with status `warn` to highlight pending production roll-out.

## Deployment Day

1. Schedule a maintenance window and announce to stakeholders.
2. Run migrations using CI or manual `supabase db push`.
3. Execute environment-specific seed.
4. Run `pnpm postdeploy:check` with Supabase credentials.
5. Validate dashboards, analytics ingestion and panic overlay toggling.
6. Record `record_deployment_integrity('production', '<check>', 'pass', details)` for each critical check.

## Post-Deployment Monitoring

- Track database CPU/IO metrics in Supabase for 24 hours.
- Ensure analytics dashboards refresh within expected latency.
- Watch rate limiting dashboards for anomalies (spikes may signal regressions).
- Keep the incident commander on standby for fast rollback if anomalies appear.

## Templates

Create an issue titled **"[DB] <Feature> large migration"** including:
- Summary & motivation
- Migration steps with SQL references
- Backfill strategy
- Rollback plan
- Integrity checks to update or add

Attach the issue link to the deployment calendar invite.
