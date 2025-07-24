# Data Integrity Audit

This project includes a lightweight script that validates the OIC extraction tables after each batch.
The goal is to quickly detect incomplete or corrupted data before it impacts the user experience.

## Rules checked

- Mandatory columns are present (`objectif_id`, `intitule`, `item_parent`, `rang`).
- `rang` must be either `A` or `B`.
- Each `objectif_id` is unique and linked to a unique `url_source`.
- Global completeness is computed via the `get_oic_extraction_report()` SQL function.

## Running the audit

```bash
pnpm integrity:audit
```

A JSON report is written under `audit_reports/` with the timestamp, the number of issues and the global extraction summary. The command exits with a non‑zero code if any problem is detected, making it suitable for a nightly CRON job or a CI pipeline.

## Extending the rules

New checks can be added in `scripts/dataIntegrityAudit.ts`. The audit script exports a `runIntegrityAudit` function that can be imported and reused in other tools.
