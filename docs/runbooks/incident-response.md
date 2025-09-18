# Incident Response Runbook – med-mng

_Last updated: 2025-10-01_

## Scope

This runbook covers any production or staging outage impacting:
- Music generation orchestration
- EDN/ECOS synchronisation and eight-minute sessions
- Authentication and access to the unified library
- Supabase availability, rate limiting or analytics ingestion

## Roles & Communication

| Role | Owner | Escalation |
| --- | --- | --- |
| Incident Commander | @laeticiamng | `+33 6 xx xx xx xx` |
| Comms / Stakeholders | Product Ops | `ops@medmng.com` |
| Engineering On-call | Backend rotation | `#medmng-oncall` Slack |

All incidents must be logged in `#incidents` with a link to the integrity snapshot when available.

## Detection & Classification

1. **Automated alerts**
   - GitHub Actions failures on `ci.yml`
   - Supabase health alerts or 5XX rate spikes
   - Sentry alerts tagged `panic-overlay`
2. **User reports** (support tickets, Discord, email)
3. **Integrity script** failures (`pnpm postdeploy:check`)

Classify severity immediately:
- **SEV0** – Full outage / data loss / security breach
- **SEV1** – Core flows degraded (music generation, EDN sync, analytics ingestion)
- **SEV2** – Partial impact (single feature unavailable) with workaround

## Response Steps

1. **Acknowledge** within 5 minutes in `#incidents`. Assign an Incident Commander.
2. **Stabilise the platform**
   - Activate the panic overlay via Supabase function `panic_overlay_set_state(true)` if user experience is degraded.
   - Engage rate limiting overrides if the incident is caused by abusive traffic.
3. **Collect telemetry**
   - Pull latest entries from `deployment_integrity_latest`.
   - Inspect Supabase logs (`Database ➜ Logs`) and the analytics edge function logs.
   - Capture recent orchestrator jobs from `public.music_jobs` (last 20 entries).
4. **Mitigation**
   - Roll back to the last green release following [`rollback.md`](rollback.md) if migrations are involved.
   - Restart failing edge functions (`supabase functions deploy <name>`).
   - Re-sync EDN data using `supabase functions invoke sync-edn-content` if alignment failures are the root cause.
5. **Communication**
   - Update `#announcements` and affected customer channels every 30 minutes.
   - Once resolved, post-mortem summary (impact, root cause, fix) in `#incidents` and attach the integrity snapshot ID.
6. **Follow-up**
   - File retrospective issues within 48 hours.
   - Ensure `pnpm postdeploy:check` passes before closing the incident.

## Panic Overlay Guidelines

- Display the overlay only when critical workflows fail or Supabase is unreachable.
- Provide an actionable CTA (retry later, contact support) and timestamp the activation.
- Deactivate the overlay immediately after recovery using the panic overlay endpoint or dashboard toggle.

## Checklists

**During incident**
- [ ] Incident Commander assigned
- [ ] Severity confirmed (SEV0/SEV1/SEV2)
- [ ] Panic overlay decision taken
- [ ] Latest integrity snapshot reviewed
- [ ] Stakeholders informed (Product, Support)

**After recovery**
- [ ] Root cause documented in post-mortem
- [ ] Integrity snapshot recorded via `record_deployment_integrity`
- [ ] Follow-up tasks created and prioritised
- [ ] Runbook updated if new steps were needed
