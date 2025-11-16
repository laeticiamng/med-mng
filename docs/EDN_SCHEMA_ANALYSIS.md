# EDN Items Completeness - Schema Analysis & Discrepancy Report

**Date**: 2025-11-16
**Priority**: 🔴 CRITICAL - Schema Mismatch Detected

---

## 🚨 Critical Issue Identified

A **schema discrepancy** has been found between the table definition and the sync migration that could prevent proper competency linkages.

### The Problem

**Table Definition** (from `20250716175901-90e57fa5-372d-48b7-85d2-b762eeb55f6a.sql`):
```sql
CREATE TABLE IF NOT EXISTS public.edn_items_complete (
  ...
  competences_oic_rang_a jsonb DEFAULT '[]'::jsonb,
  competences_oic_rang_b jsonb DEFAULT '[]'::jsonb,
  competences_count_total integer DEFAULT 0,
  competences_count_rang_a integer DEFAULT 0,
  competences_count_rang_b integer DEFAULT 0,
  ...
);
```

**Sync Migration** (from `20251115200000_sync_oic_to_edn_items.sql`):
```sql
UPDATE edn_items_complete
SET
  oic_rang_a = oic_a_data,        -- ❌ Wrong column name!
  oic_rang_b = oic_b_data,        -- ❌ Wrong column name!
  updated_at = NOW()
WHERE code_item = 'IC-' || item_code;
```

### Impact

- The sync migration may be **failing silently** or creating columns that don't exist
- Competencies may **not be properly synced** from `oic_competences` to `edn_items_complete`
- The reported 95% completeness may be **inaccurate**
- Verification scripts may be querying **non-existent or empty columns**

---

## 📋 Schema Verification Checklist

To resolve this, we need to:

1. ✅ **Verify actual database schema**
   ```sql
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'edn_items_complete'
     AND column_name LIKE '%oic%'
   ORDER BY ordinal_position;
   ```

2. ✅ **Check if sync migration ran successfully**
   ```sql
   -- Check oic_extraction_progress for sync records
   SELECT * FROM oic_extraction_progress
   WHERE session_id LIKE 'sync_%'
   ORDER BY last_activity DESC
   LIMIT 5;
   ```

3. ✅ **Verify actual data presence**
   ```sql
   -- Try both column name patterns
   SELECT
     item_code,
     COALESCE(jsonb_array_length(competences_oic_rang_a), 0) as comp_oic_a,
     COALESCE(jsonb_array_length(competences_oic_rang_b), 0) as comp_oic_b,
     COALESCE(jsonb_array_length(oic_rang_a), 0) as oic_a,
     COALESCE(jsonb_array_length(oic_rang_b), 0) as oic_b
   FROM edn_items_complete
   LIMIT 5;
   ```

---

## 🔧 Resolution Options

### Option 1: Add Missing Columns (If They Don't Exist)

```sql
-- Add oic_rang_a and oic_rang_b if they don't exist
ALTER TABLE edn_items_complete
ADD COLUMN IF NOT EXISTS oic_rang_a jsonb DEFAULT '[]'::jsonb;

ALTER TABLE edn_items_complete
ADD COLUMN IF NOT EXISTS oic_rang_b jsonb DEFAULT '[]'::jsonb;

-- Then re-run the sync migration
```

### Option 2: Fix Sync Migration (Recommended)

Update the sync migration to use correct column names:

```sql
UPDATE edn_items_complete
SET
  competences_oic_rang_a = oic_a_data,  -- ✅ Correct column name
  competences_oic_rang_b = oic_b_data,  -- ✅ Correct column name
  updated_at = NOW()
WHERE item_code = 'IC-' || item_code;  -- Also note: code_item vs item_code
```

### Option 3: Consolidate Column Names

Decide on ONE naming convention and stick to it:
- Either: `competences_oic_rang_a` / `competences_oic_rang_b`
- Or: `oic_rang_a` / `oic_rang_b`

Then update all migrations and code accordingly.

---

## 📊 What This Means for Completeness Verification

Until this schema issue is resolved, we **cannot accurately verify** EDN completeness because:

1. ❌ We don't know which column names are actually in use
2. ❌ We don't know if the sync migration succeeded
3. ❌ The verification scripts may be querying the wrong columns
4. ❌ The reported 95% completeness may be based on empty data

---

## ✅ Action Plan

### Immediate (Required Before Verification)

1. **Access the database** and run schema verification query
2. **Determine which column names exist** in the actual table
3. **Check if sync migration ran** and completed successfully
4. **Create corrective migration** based on findings
5. **Update all scripts** to use consistent column names

### Once Schema is Fixed

6. Re-run sync migration (if needed)
7. Execute verification scripts
8. Generate completeness report
9. Address identified issues
10. Document final state

---

## 🔍 Database Access Required

**This issue cannot be resolved without database access.**

You need to:
1. Set `SUPABASE_URL` environment variable
2. Set `SUPABASE_SERVICE_ROLE_KEY` environment variable
3. Or provide `DATABASE_URL` for direct PostgreSQL connection

Example:
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Then run verification
cd apps/functions/admin
npm run verify:edn:export
```

---

## 📁 Files Affected

### Migrations
- ✅ `20250716175901-90e57fa5-372d-48b7-85d2-b762eeb55f6a.sql` - Table creation (uses `competences_oic_rang_*`)
- ⚠️  `20251115200000_sync_oic_to_edn_items.sql` - Sync migration (uses `oic_rang_*`)
- ⚠️  `20251028190505_85a6e324-5dd9-4b2c-9d9d-559208f2f1ea.sql` - Unknown, may also be affected

### Scripts
- ⚠️  `scripts/verify-edn-competencies-completeness.sql` - May use wrong column names
- ⚠️  `apps/functions/admin/scripts/verify-edn-completeness.ts` - May use wrong column names

### Documentation
- ✅ `docs/EDN_COMPLETENESS_SUMMARY.md` - Assumes columns exist correctly
- ✅ `docs/EDN_COMPETENCIES_VERIFICATION.md` - Assumes columns exist correctly

---

## 🎯 Expected Outcome

Once the schema is fixed and verified:

- ✅ All column names consistent across migrations
- ✅ Competencies properly synced from `oic_competences` to `edn_items_complete`
- ✅ Verification scripts query correct columns
- ✅ Accurate completeness metrics (should be ~95% as documented)
- ✅ 367 EDN items properly linked to ~4,872 OIC competencies

---

## 📞 Next Steps

**Please provide database credentials** or run the following query manually and share results:

```sql
-- 1. Check which columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'edn_items_complete'
  AND column_name LIKE '%oic%';

-- 2. Check sample data
SELECT
  item_code,
  CASE WHEN competences_oic_rang_a IS NOT NULL
    THEN jsonb_array_length(competences_oic_rang_a)
    ELSE NULL END as competences_oic_a_len,
  CASE WHEN competences_oic_rang_b IS NOT NULL
    THEN jsonb_array_length(competences_oic_rang_b)
    ELSE NULL END as competences_oic_b_len,
  CASE WHEN oic_rang_a IS NOT NULL
    THEN jsonb_array_length(oic_rang_a)
    ELSE NULL END as oic_a_len,
  CASE WHEN oic_rang_b IS NOT NULL
    THEN jsonb_array_length(oic_rang_b)
    ELSE NULL END as oic_b_len
FROM edn_items_complete
LIMIT 10;
```

---

**Status**: 🔴 **BLOCKED** - Waiting for database access to verify schema and fix discrepancies.
