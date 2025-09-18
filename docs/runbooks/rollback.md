# Deployment Rollback Runbook – med-mng

_Last updated: 2025-10-01_

## Purpose

Provide a controlled procedure to revert a faulty deployment while keeping the database schema, Supabase functions and analytics contracts consistent.

## Preconditions

- Latest `pnpm postdeploy:check` output attached to the incident thread
- Access to the Supabase project with service role credentials
- Git commit hash of the last known good release
- Knowledge of whether any irreversible migrations were included (see [large-migrations](large-migrations.md))

## Rollback Flow

1. **Freeze traffic**
   - Enable maintenance mode or panic overlay if users are impacted.
   - Ensure rate limiting is not blocking admin accounts.
2. **Identify assets to revert**
   - Web frontend build (Vercel/Netlify/Static host)
   - Supabase functions
   - Database migrations and seeds
3. **Restore application code**
   ```bash
   git checkout <good_commit>
   pnpm install
   pnpm build
   ```
   Redeploy the frontend (CI redeploy or manual upload).
4. **Redeploy Supabase functions**
   ```bash
   supabase functions deploy suno-music-optimized
   supabase functions deploy sync-edn-content
   supabase functions deploy analytics-tracker
   ```
   Confirm logs show successful cold boot.
5. **Database rollback**
   - If the faulty release introduced migrations, run:
     ```bash
     supabase db reset --linked
     supabase db push
     psql $SUPABASE_DB_URL -f supabase/seeds/<environment>.sql
     ```
   - For production, prefer `pg_dump` backups if available.
6. **Integrity snapshot**
   ```bash
   psql $SUPABASE_DB_URL -c "select record_deployment_integrity('<environment>', 'database_migrations_applied', 'pass', '{"action":"rollback"}'::jsonb);"
   ```
   Attach the snapshot ID in the incident channel.
7. **Verification**
   - Re-run `pnpm postdeploy:check`
   - Execute `pnpm integrity:audit` to confirm migrations include the hardened indexes/policies
   - Execute smoke tests (music generation, EDN sync, analytics ping)
   - Disable panic overlay and communicate recovery

## Post-Rollback

- Update the incident post-mortem with root cause and remediation
- Create tasks for missing regression tests or guardrails
- Schedule a follow-up deployment once fixes are merged
