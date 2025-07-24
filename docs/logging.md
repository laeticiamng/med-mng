# Logging & Monitoring

This project uses **Sentry** to centralise backend logs. To enable it, provide a DSN in your environment:

```bash
SENTRY_DSN=your-dsn
```

## Backend

The Express server initialises Sentry in `src/index.ts` and reports uncaught errors via `errorHandler.ts`. Context such as environment and release version is automatically attached.

## Supabase Edge Functions

Edge functions currently log to the console. They can be extended to push errors to Sentry using the HTTP API if needed.

Logs are visible in real time from the Sentry dashboard where you can filter by environment or release.
