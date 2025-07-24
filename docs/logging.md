# Logging & Monitoring

This project uses **Sentry** to centralise backend logs. To enable it, provide a DSN in your environment:

```bash
SENTRY_DSN=your-dsn
```

## Backend

The Express server initialises Sentry in `src/index.ts` and reports uncaught errors via `errorHandler.ts`. Context such as environment and release version is automatically attached.

Operations are also stored in the `operation_logs` table through `logService.ts` when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured. This enables building dashboards in Metabase or Grafana directly from the database.

## Supabase Edge Functions

Edge functions currently log to the console. They can be extended to push errors to Sentry using the HTTP API if needed.

Logs are visible in real time from the Sentry dashboard where you can filter by environment or release.

## Alerts

Critical incidents trigger notifications through Discord or Slack when the `DISCORD_WEBHOOK_URL` or `SLACK_WEBHOOK_URL` variables are set. The helper in `src/services/alertService.ts` posts a simple JSON payload to the configured webhook URL.
