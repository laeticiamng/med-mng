# EDN Completeness - Manual Verification Guide

**Purpose**: Step-by-step guide to verify EDN-OIC competencies completeness when database access is available.

**Date**: 2025-11-16

---

## Prerequisites

You need one of the following to proceed:

### Option A: Supabase Client (Recommended)
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Option B: Direct PostgreSQL Connection
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

---

## Step 1: Schema Verification (CRITICAL)

Before running any verification, you MUST first verify the schema is correct.

### Run This Query

```sql
-- Check which OIC competency columns exist
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'edn_items_complete'
  AND column_name LIKE '%oic%'
ORDER BY ordinal_position;
```

### Expected Results (After Fix)

You should see **all 4 columns**:
| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| competences_oic_rang_a | jsonb | YES | '[]'::jsonb |
| competences_oic_rang_b | jsonb | YES | '[]'::jsonb |
| oic_rang_a | jsonb | YES | '[]'::jsonb |
| oic_rang_b | jsonb | YES | '[]'::jsonb |

### If Columns Are Missing

Run the schema fix migration:
```bash
psql $DATABASE_URL -f supabase/migrations/20251116070000_fix_edn_oic_columns_schema.sql
```

---

## Step 2: Data Presence Check

Verify that competencies are actually populated:

```sql
-- Check data in both column sets
SELECT
  'competences_oic_rang_a' as column_name,
  COUNT(*) FILTER (WHERE jsonb_array_length(competences_oic_rang_a) > 0) as items_with_data,
  COUNT(*) as total_items,
  ROUND(COUNT(*) FILTER (WHERE jsonb_array_length(competences_oic_rang_a) > 0) * 100.0 / COUNT(*), 1) as pct_populated
FROM edn_items_complete
UNION ALL
SELECT
  'competences_oic_rang_b',
  COUNT(*) FILTER (WHERE jsonb_array_length(competences_oic_rang_b) > 0),
  COUNT(*),
  ROUND(COUNT(*) FILTER (WHERE jsonb_array_length(competences_oic_rang_b) > 0) * 100.0 / COUNT(*), 1)
FROM edn_items_complete
UNION ALL
SELECT
  'oic_rang_a',
  COUNT(*) FILTER (WHERE jsonb_array_length(oic_rang_a) > 0),
  COUNT(*),
  ROUND(COUNT(*) FILTER (WHERE jsonb_array_length(oic_rang_a) > 0) * 100.0 / COUNT(*), 1)
FROM edn_items_complete
UNION ALL
SELECT
  'oic_rang_b',
  COUNT(*) FILTER (WHERE jsonb_array_length(oic_rang_b) > 0),
  COUNT(*),
  ROUND(COUNT(*) FILTER (WHERE jsonb_array_length(oic_rang_b) > 0) * 100.0 / COUNT(*), 1)
FROM edn_items_complete;
```

### Expected Results (After Sync)

| column_name | items_with_data | total_items | pct_populated |
|-------------|-----------------|-------------|---------------|
| competences_oic_rang_a | ~350 | 367 | ~95.0% |
| competences_oic_rang_b | ~310 | 367 | ~85.0% |
| oic_rang_a | ~350 | 367 | ~95.0% |
| oic_rang_b | ~310 | 367 | ~85.0% |

**Important**: Both column sets should have IDENTICAL values.

---

## Step 3: Synchronization Verification

Ensure both column sets are synchronized:

```sql
-- Check for discrepancies
SELECT
  item_code,
  jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'::jsonb)) as comp_a_len,
  jsonb_array_length(COALESCE(oic_rang_a, '[]'::jsonb)) as oic_a_len,
  jsonb_array_length(COALESCE(competences_oic_rang_b, '[]'::jsonb)) as comp_b_len,
  jsonb_array_length(COALESCE(oic_rang_b, '[]'::jsonb)) as oic_b_len
FROM edn_items_complete
WHERE jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'::jsonb)) !=
      jsonb_array_length(COALESCE(oic_rang_a, '[]'::jsonb))
   OR jsonb_array_length(COALESCE(competences_oic_rang_b, '[]'::jsonb)) !=
      jsonb_array_length(COALESCE(oic_rang_b, '[]'::jsonb))
LIMIT 20;
```

### Expected Results

**No rows should be returned.** If rows appear, the columns are not synchronized.

**Fix**: Re-run the schema fix migration.

---

## Step 4: Run Full Verification

### Method A: SQL Script (Detailed)

```bash
psql $DATABASE_URL -f scripts/verify-edn-competencies-completeness.sql > edn-audit-$(date +%Y%m%d-%H%M%S).log 2>&1
```

This generates a comprehensive 12-section report including:
1. Schema verification
2. Global statistics
3. Competencies coverage
4. Items without competencies
5. Distribution analysis
6. Specialty breakdown
7. Imbalanced competencies
8. Completeness correlation
9. Content without competencies
10. Top items by coverage
11. **Priority fix list**
12. Competency usage stats

### Method B: TypeScript Script (JSON Export)

```bash
cd apps/functions/admin
npm install
npm run verify:edn:export
```

This generates:
- Console report with statistics
- `edn-completeness-report.json` for programmatic access
- Exit code 1 if critical issues found (for CI/CD)

---

## Step 5: Interpret Results

### Metrics to Check

| Metric | Target | Critical If |
|--------|--------|-------------|
| Items with Rang A | >90% (>330 items) | <80% (<294 items) |
| Items with Rang B | >80% (>294 items) | <70% (<257 items) |
| Average completeness score | >85% | <70% |
| Items without ANY competencies | 0 | >10 items |
| Published items without comp | 0 | >1 item |

### Issue Severity Levels

**🔴 Critical** (Fix Immediately):
- Published items with 0 competencies
- Items with pedagogical content but 0 competencies

**🟠 High** (Fix This Week):
- Published items with <5 competencies
- Imbalanced competencies (20+ Rang A, 0 Rang B)

**🟡 Medium** (Fix This Month):
- Completeness score <70%
- Missing metadata fields

**🟢 Low** (Ongoing Improvement):
- Minor imbalances
- Optimization opportunities

---

## Step 6: Address Issues

### Critical: Published Item Without Competencies

**Example**: IC-045 (0 competencies, published)

1. Find appropriate competencies:
   ```sql
   SELECT objectif_id, intitule, rang
   FROM oic_competences
   WHERE item_parent = '045'
   ORDER BY rang, ordre;
   ```

2. Update item (update BOTH column sets):
   ```sql
   UPDATE edn_items_complete
   SET
     competences_oic_rang_a = '[...]'::jsonb,
     oic_rang_a = '[...]'::jsonb,
     competences_oic_rang_b = '[...]'::jsonb,
     oic_rang_b = '[...]'::jsonb
   WHERE item_code = 'IC-045';
   ```

3. Verify:
   ```sql
   SELECT item_code, completeness_score,
     jsonb_array_length(competences_oic_rang_a) as a_count,
     jsonb_array_length(competences_oic_rang_b) as b_count
   FROM edn_items_complete
   WHERE item_code = 'IC-045';
   ```

### High: Insufficient Competencies

**Example**: IC-078 (3 competencies, should have ~15)

Use the auto-enrichment function:
```sql
-- This function analyzes item content and suggests competencies
SELECT * FROM analyze_edn_item_quality('IC-078');
SELECT enrich_edn_item_metadata('IC-078');
```

### Medium: Low Completeness Score

**Example**: IC-123 (completeness: 45%)

1. Check what's missing:
   ```sql
   SELECT
     item_code,
     tableau_rang_a IS NOT NULL as has_tableau_a,
     tableau_rang_b IS NOT NULL as has_tableau_b,
     quiz_questions IS NOT NULL as has_quiz,
     scene_immersive IS NOT NULL as has_scene,
     jsonb_array_length(competences_oic_rang_a) as comp_a,
     jsonb_array_length(competences_oic_rang_b) as comp_b
   FROM edn_items_complete
   WHERE item_code = 'IC-123';
   ```

2. Add missing components or use enrichment function

---

## Step 7: Monitor Progress

### Create a Monitoring View

```sql
CREATE OR REPLACE VIEW edn_completeness_monitoring AS
SELECT
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE jsonb_array_length(competences_oic_rang_a) > 0) as with_rang_a,
  COUNT(*) FILTER (WHERE jsonb_array_length(competences_oic_rang_b) > 0) as with_rang_b,
  COUNT(*) FILTER (WHERE
    jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'::jsonb)) = 0
    AND jsonb_array_length(COALESCE(competences_oic_rang_b, '[]'::jsonb)) = 0
  ) as without_competencies,
  ROUND(AVG(completeness_score), 2) as avg_completeness,
  COUNT(*) FILTER (WHERE status = 'published' AND
    jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'::jsonb)) = 0
    AND jsonb_array_length(COALESCE(competences_oic_rang_b, '[]'::jsonb)) = 0
  ) as critical_published_without_comp,
  now() as measured_at
FROM edn_items_complete;

-- Query it regularly
SELECT * FROM edn_completeness_monitoring;
```

### Track Weekly Progress

```sql
-- Store weekly snapshots
CREATE TABLE IF NOT EXISTS edn_completeness_history (
  measured_at timestamp with time zone PRIMARY KEY DEFAULT now(),
  total_items integer,
  with_rang_a integer,
  with_rang_b integer,
  without_competencies integer,
  avg_completeness numeric(5,2),
  critical_issues integer
);

-- Snapshot current state
INSERT INTO edn_completeness_history
SELECT * FROM edn_completeness_monitoring;

-- View progress over time
SELECT
  measured_at::date,
  without_competencies,
  critical_issues,
  avg_completeness
FROM edn_completeness_history
ORDER BY measured_at DESC;
```

---

## Step 8: Set Up Alerts

### Email Alert for Critical Issues

```sql
-- Function to check for critical issues
CREATE OR REPLACE FUNCTION check_edn_critical_issues()
RETURNS TABLE (
  issue_type text,
  item_code text,
  item_title text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'PUBLISHED_NO_COMP' as issue_type,
    e.item_code,
    e.title
  FROM edn_items_complete e
  WHERE e.status = 'published'
    AND jsonb_array_length(COALESCE(e.competences_oic_rang_a, '[]'::jsonb)) = 0
    AND jsonb_array_length(COALESCE(e.competences_oic_rang_b, '[]'::jsonb)) = 0;
END;
$$ LANGUAGE plpgsql;

-- Run daily and send alerts if issues found
SELECT * FROM check_edn_critical_issues();
```

---

## Troubleshooting

### Issue: "Column does not exist"

**Cause**: Schema not fixed yet
**Solution**: Run `20251116070000_fix_edn_oic_columns_schema.sql`

### Issue: "All items show 0 competencies"

**Cause**: Sync never ran or failed
**Solution**:
1. Verify `oic_competences` table has data
2. Re-run schema fix migration (includes sync)
3. Check `oic_extraction_progress` for errors

### Issue: "Columns are out of sync"

**Cause**: Partial migration or concurrent updates
**Solution**: Re-run schema fix migration - it synchronizes both column sets

### Issue: "Cannot connect to database"

**Cause**: Missing credentials
**Solution**: Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL`

---

## Quick Command Reference

```bash
# 1. Fix schema (if needed)
psql $DATABASE_URL -f supabase/migrations/20251116070000_fix_edn_oic_columns_schema.sql

# 2. Run SQL verification
psql $DATABASE_URL -f scripts/verify-edn-competencies-completeness.sql > audit.log 2>&1

# 3. Run TypeScript verification
cd apps/functions/admin && npm run verify:edn:export

# 4. View summary from SQL audit
grep -A 20 "SUMMARY" audit.log

# 5. View critical issues
grep -A 50 "CRITICAL" audit.log

# 6. Check schema
psql $DATABASE_URL -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'edn_items_complete' AND column_name LIKE '%oic%';"

# 7. Quick stats
psql $DATABASE_URL -c "SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(competences_oic_rang_a, '[]'::jsonb)) > 0) as with_rang_a FROM edn_items_complete;"
```

---

## Success Criteria

✅ **Schema Fixed**:
- All 4 OIC columns exist (competences_oic_rang_* and oic_rang_*)
- All columns are JSONB type
- Both column sets are synchronized

✅ **Data Synced**:
- ~95% of items have Rang A competencies
- ~85% of items have Rang B competencies
- 0 published items without competencies

✅ **Verification Working**:
- SQL script runs without errors
- TypeScript script connects and generates report
- Both tools show consistent results

✅ **Monitoring Active**:
- Monitoring view created
- Weekly snapshots configured
- Alert function ready

---

**Next**: Once verification is complete and issues are identified, proceed to fix critical items following the priority list in the verification report.
