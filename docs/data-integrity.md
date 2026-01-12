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

## Batch test quick validation (count >= 50)

After a test batch run, validate that at least 50 competencies were ingested before proceeding:

```sql
SELECT COUNT(*) AS oic_rows
FROM public.oic_competences;
```

Expected: `oic_rows >= 50` for the test batch.

## Document the “OK” state before reactivating cron

Before reactivating any automated cron job, record the state as **OK** only when the following checks are true:

1. **Batch test volume OK**
   ```sql
   SELECT COUNT(*) AS oic_rows
   FROM public.oic_competences;
   ```
   - `oic_rows >= 50`

2. **Extraction session OK**
   ```sql
   SELECT session_id, status, items_extracted, total_expected, error_message
   FROM public.oic_extraction_progress
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   - `status = 'termine'`
   - `error_message IS NULL`

3. **Global report OK**
   ```sql
   SELECT * FROM public.get_oic_extraction_report();
   ```
   - No “incomplete” flags and a non‑zero total extracted count.

## Extending the rules

New checks can be added in `scripts/dataIntegrityAudit.ts`. The audit script exports a `runIntegrityAudit` function that can be imported and reused in other tools.
