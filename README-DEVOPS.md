# DevOps & Infrastructure – med-mng.lovable.app

This guide documents how to run, deploy and monitor the **med-mng** backend. It consolidates tribal knowledge so new contributors can be productive quickly.

## 1. Setup local & cloud

### Prerequisites
- Node.js **20** and [pnpm](https://pnpm.io) (`corepack enable && corepack prepare pnpm@latest --activate`)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker (optional for container builds)

### Local environment
```bash
pnpm install
cp .env.example .env # fill in secrets
supabase start       # launches PostgreSQL + storage
pnpm dev             # frontend + api
```
To run only the Express server:
```bash
pnpm start:server
```

### Cloud deployment
- Edge functions are deployed via `supabase functions deploy <name>`.
- The Node server can be containerised using the provided **Dockerfile**:
```bash
docker build -t med-mng .
docker run -p 3000:3000 med-mng
```
Adjust environment variables for your target platform.

## 2. Build / Test / Deploy

- **Build** the application:
  ```bash
  pnpm build
  ```
- **Lint** and **test** before pushing:
  ```bash
  pnpm lint && pnpm test
  ```
- **Deploy** edge functions through the Supabase CLI. The Docker image can be pushed to your registry and run on any container host.

## 3. CI/CD

GitHub Actions automate linting, tests and builds. The [`ci.yml`](.github/workflows/ci.yml) workflow runs on each push or pull request:
- checkout, set up Node 20
- install dependencies with pnpm
- `pnpm lint && pnpm test && pnpm build`

The [`extract-oic.yml`](.github/workflows/extract-oic.yml) workflow runs the OIC extraction job manually or on a schedule. Logs are visible in the GitHub Actions tab.

Badges in the main README reflect the CI status and project version.

## 4. Post-deploy integrity checks

Run the automated integrity sweep after every staging or production deployment:

```bash
pnpm integrity:audit
pnpm postdeploy:check
```

`pnpm integrity:audit` statically verifies that RLS statements, `IF NOT EXISTS` policy guards and the required indexes/constraints live in the SQL migrations and environment seed bundles.
`pnpm postdeploy:check` validates the presence of the idempotent migration, environment seed files and, when Supabase credentials are available, reads the live `deployment_integrity_checks` registry and the `deployment_integrity_latest` view while confirming the `db_constraints_valid` registry entry.
In CI you can export the service role credentials to capture live evidence and fail fast if the registry is unreachable:

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm postdeploy:check
```

To persist audit evidence after a successful deploy, call the helper from the migration bundle:

```bash
psql $SUPABASE_DB_URL -c "select record_deployment_integrity('staging', 'database_migrations_applied', 'pass');"
```

The latest snapshot is available via the `deployment_integrity_latest` view and remediation guidance is detailed in `/docs/runbooks`.

Reference checklist: [`docs/DEPLOYMENT-INTEGRITY-CHECKLIST.md`](docs/DEPLOYMENT-INTEGRITY-CHECKLIST.md).

## 5. Secrets & env

All secrets are loaded from environment variables. Important keys include:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- `UNES_EMAIL`, `UNES_PASSWORD`, `CAS_USER`, `CAS_PASS`
- `OPENAI_API_KEY`, `SUNO_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `DISCORD_WEBHOOK_URL`, `SLACK_WEBHOOK_URL`
- `JWT_SECRET`

Store them in `.env` for local use and configure the same variables as project secrets in Supabase and GitHub.

## 6. Monitoring / logs / alertes

- Supabase provides logs for edge functions, database and storage (dashboard ➜ Logs).
- The Express API logs to stdout via `supabase/functions/med-mng-api/logger.ts`.
- Alerts can be sent to Discord or Slack when `DISCORD_WEBHOOK_URL` or `SLACK_WEBHOOK_URL` are defined. See `src/services/alertService.ts`.
- Frontend errors are sent to Sentry when `VITE_SENTRY_DSN` is configured. The release tag is derived from `BUILD_SHA`/`APP_VERSION` to ease correlation with deployments.
- A cron-compatible uptime probe is available via `npm run monitor:uptime` (recommended every 5 minutes). It pings `UPTIME_HEALTH_URL` and triggers Slack/email alerts through `ALERT_EMAIL` + webhooks when the check fails.
- Database logs are stored in the `operation_logs` table via `logService.ts` and can feed a Metabase or Grafana dashboard (see `docs/dashboard-monitoring.md`).

## 7. Extraction batch / cleaning data

OIC extraction can be triggered via the admin interface `/admin/extract-objectifs` or with the helper scripts:
```bash
node run-extraction.js            # full automatic extraction
node fix-oic-data-script.js fix   # clean corrupted OIC data
```
Database utilities like `cleanup_old_extractions` are defined in `schema-oic.sql` and migrations.

## 8. Process incidents / runbook

Common incidents and how to react:
- **Extraction failure**: check GitHub Action `extract-oic.yml` logs, retry the workflow or run `node run-extraction.js` locally.
- **CI failing**: run `pnpm lint && pnpm test` locally and fix errors before pushing.
- **Quota Suno exceeded**: verify `SUNO_API_KEY` limits, consider rotating the key.
- **Payment or Stripe issues**: ensure `STRIPE_SECRET_KEY` and webhook secrets are valid. Check Stripe dashboard.
- **Production down**: inspect Supabase status and container logs, restart the container or redeploy.

Detailed remediation guides live in `/docs/runbooks`:
- [`incident-response.md`](docs/runbooks/incident-response.md) – triage checklist, escalation matrix and panic overlay handling.
- [`rollback.md`](docs/runbooks/rollback.md) – safe rollback flow using `record_deployment_integrity`.
- [`large-migrations.md`](docs/runbooks/large-migrations.md) – phased rollout strategy with dry-run validation.

## 9. FAQ onboarding/support

**How do I reset my local database?**
```bash
supabase stop
supabase start
```
**Tests fail locally** – make sure Node 20 is active and run `pnpm install` to refresh dependencies.

For additional questions check the other README files (`README-MED-MNG.md`, `README-OIC-EXTRACTION.md`) or contact the maintainers below.

## 10. Contacts & ownership

- Primary contact: [support@medmng.com](mailto:support@medmng.com)
- Issues can be opened on the GitHub repository
- Keep this document updated whenever the infrastructure or process changes.

---
_Last updated: 2025 (post-deploy integrity refresh)_
