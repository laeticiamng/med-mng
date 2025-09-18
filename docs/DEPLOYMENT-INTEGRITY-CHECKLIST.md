# Deployment Integrity Checklist

_Updated 2025-10-01_

This document summarises the assets introduced to guarantee reproducible deployments and traceability.

## Database Registry

- **Migration**: `supabase/migrations/20251001100000-deployment-integrity-registry.sql`
- Creates the tables `deployment_integrity_checks` and `deployment_integrity_snapshots`
- Provides the helper function `record_deployment_integrity` and the view `deployment_integrity_latest`
- Enforces Row Level Security with service-role only mutations and public read access for the registry

## Seed Strategy

Each environment has a dedicated seed file in `supabase/seeds/`:
- `development.sql` – baseline fixtures + intentional `warn` snapshot highlighting partial seeds
- `staging.sql` – parity with production plus sandbox analytics warning
- `production.sql` – registry only, no snapshot to avoid polluting history

Run them via `psql $SUPABASE_DB_URL -f supabase/seeds/<environment>.sql` after migrations.

## Integrity Script (`pnpm postdeploy:check`)

The script performs three categories of checks:
1. **Filesystem** – verifies migration and seed files exist and contain idempotent statements
2. **SQL audit** – ensures policies use `IF NOT EXISTS` and RLS is enabled for the registry tables
3. **Live Supabase (optional)** – when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided, fetches registry data and latest snapshots

The command exits with `code 1` if mandatory assets are missing and prints a CI-friendly summary table.

## Runbooks

Detailed remediation is documented in `/docs/runbooks`:
- `incident-response.md` – end-to-end incident handling
- `rollback.md` – safe rollback with integrity snapshots
- `large-migrations.md` – planning and executing heavy schema changes

Always capture a new snapshot after running these procedures.
