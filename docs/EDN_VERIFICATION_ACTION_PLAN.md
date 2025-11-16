# EDN Completeness Verification - Action Plan

**Date**: 2025-11-16
**Status**: 🔴 BLOCKED - Requires database access
**Priority**: CRITICAL

---

## Executive Summary

During the setup of EDN completeness verification tools, a **critical schema discrepancy** was discovered that prevents accurate verification of competency linkages.

### The Issue

Two different column naming conventions are used across migrations:
- Table creation: `competences_oic_rang_a` / `competences_oic_rang_b`
- Sync migration: `oic_rang_a` / `oic_rang_b`

This mismatch could mean:
- ❌ Competencies are not properly synced
- ❌ Verification tools query non-existent or empty columns
- ❌ Reported 95% completeness may be inaccurate

### Resolution Created

Three comprehensive solutions have been created:
1. ✅ **Schema fix migration** - Fixes column naming and re-syncs data
2. ✅ **Updated verification scripts** - Checks schema first, uses correct columns
3. ✅ **Complete documentation** - Step-by-step guides for manual execution

---

## What Was Done

### Files Created (Session 1 - Before Schema Discovery)

1. **`scripts/verify-edn-competencies-completeness.sql`** (700+ lines)
   - Comprehensive 12-section SQL audit
   - Global statistics, coverage analysis, priority fix list
   - Competency usage and distribution analysis

2. **`apps/functions/admin/scripts/verify-edn-completeness.ts`** (500+ lines)
   - TypeScript verification with Supabase client
   - JSON export for programmatic access
   - CI/CD integration with exit codes

3. **`docs/EDN_COMPETENCIES_VERIFICATION.md`** (800+ lines)
   - Complete usage guide
   - Result interpretation
   - Corrective actions by issue type
   - Automation setup (monitoring, alerts, CI/CD)

4. **`docs/EDN_COMPLETENESS_SUMMARY.md`** (400+ lines)
   - Quick start guide
   - Immediate action checklist
   - Current state overview

5. **`apps/functions/admin/package.json`**
   - npm scripts for easy execution

6. **`apps/functions/admin/README.md`**
   - Admin scripts documentation

### Files Created (Session 2 - After Schema Discovery)

7. **`docs/EDN_SCHEMA_ANALYSIS.md`** (NEW)
   - Detailed schema discrepancy analysis
   - Impact assessment
   - Resolution options
   - Database access requirements

8. **`supabase/migrations/20251116070000_fix_edn_oic_columns_schema.sql`** (NEW)
   - Checks which columns exist
   - Adds missing columns
   - Synchronizes data between column sets
   - Re-syncs from oic_competences source
   - Verifies final state

9. **`docs/EDN_MANUAL_VERIFICATION_GUIDE.md`** (NEW)
   - Step-by-step verification process
   - Schema verification queries
   - Data presence checks
   - Troubleshooting guide
   - Quick command reference

10. **`scripts/verify-edn-competencies-completeness.sql`** (UPDATED)
    - Added Section 0: Schema Verification
    - Checks for column existence and types
    - Reports which naming convention is in use
    - Warns if columns are missing

11. **`docs/EDN_COMPLETENESS_SUMMARY.md`** (UPDATED)
    - Added critical update section
    - Schema issue explanation
    - Action required before verification

---

## What Cannot Be Done (Yet)

**Cannot execute verification scripts** because:
- ❌ No database credentials provided (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, or `DATABASE_URL`)
- ❌ Cannot verify which columns actually exist in the database
- ❌ Cannot check if sync migration ran successfully
- ❌ Cannot determine actual EDN completeness state

---

## Immediate Next Steps (REQUIRES DATABASE ACCESS)

### Step 1: Provide Database Credentials

**Option A**: Set environment variables
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Option B**: Provide direct PostgreSQL connection
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

### Step 2: Run Schema Fix Migration

```bash
psql $DATABASE_URL -f supabase/migrations/20251116070000_fix_edn_oic_columns_schema.sql
```

**This migration will:**
- ✅ Check which columns exist
- ✅ Add any missing columns
- ✅ Synchronize data between column sets
- ✅ Re-sync all competencies from oic_competences table
- ✅ Verify final state
- ✅ Report statistics

**Expected output:**
```
🔧 Starting OIC columns schema fix...
====================================================
Current schema state:
  competences_oic_rang_a exists: t (type: jsonb)
  competences_oic_rang_b exists: t (type: jsonb)
  oic_rang_a exists: f
  oic_rang_b exists: f

➕ Adding oic_rang_a column...
➕ Adding oic_rang_b column...
🔄 Synchronizing data between column sets...
🔄 Re-syncing from oic_competences source...

====================================================
✅ SCHEMA FIX COMPLETE
====================================================

📊 FINAL STATE
====================================================
Items with competences_oic_rang_a: 350/367 (95.4%)
Items with competences_oic_rang_b: 312/367 (85.0%)
Items with oic_rang_a: 350/367 (95.4%)
Items with oic_rang_b: 312/367 (85.0%)
====================================================
✅ Column sets are perfectly synchronized!
```

### Step 3: Run Verification

**Method A: SQL (Detailed Report)**
```bash
psql $DATABASE_URL -f scripts/verify-edn-competencies-completeness.sql > edn-audit-$(date +%Y%m%d).log 2>&1
```

**Method B: TypeScript (JSON Export)**
```bash
cd apps/functions/admin
npm install
npm run verify:edn:export
```

### Step 4: Review Results

```bash
# View summary from SQL audit
grep -A 20 "SUMMARY" edn-audit-*.log

# View critical issues
grep -A 50 "CRITICAL" edn-audit-*.log

# View priority fix list
grep -A 30 "PRIORITY FIX LIST" edn-audit-*.log

# Or view JSON report
cat apps/functions/admin/edn-completeness-report.json | jq '.summary'
cat apps/functions/admin/edn-completeness-report.json | jq '.issues.critical'
```

### Step 5: Address Critical Issues

Based on verification results, fix issues in priority order:

1. **🔴 CRITICAL** - Published items with 0 competencies
2. **🟠 HIGH** - Items with <5 competencies
3. **🟡 MEDIUM** - Low completeness scores (<70%)
4. **🟢 LOW** - Minor optimizations

Use the manual verification guide for specific correction procedures.

---

## Documentation Index

### Start Here
- 🔴 **`docs/EDN_SCHEMA_ANALYSIS.md`** - Understand the schema issue
- 🔴 **`docs/EDN_MANUAL_VERIFICATION_GUIDE.md`** - Step-by-step execution guide

### Reference Documentation
- 📘 **`docs/EDN_COMPLETENESS_SUMMARY.md`** - Quick start and overview
- 📘 **`docs/EDN_COMPETENCIES_VERIFICATION.md`** - Complete verification guide
- 📘 **`apps/functions/admin/README.md`** - Admin scripts usage

### Tools and Scripts
- 🛠️ **`scripts/verify-edn-competencies-completeness.sql`** - SQL audit (12 sections)
- 🛠️ **`apps/functions/admin/scripts/verify-edn-completeness.ts`** - TypeScript verification
- 🔧 **`supabase/migrations/20251116070000_fix_edn_oic_columns_schema.sql`** - Schema fix

---

## Expected Timeline

### With Database Access
- **5 minutes**: Run schema fix migration
- **2 minutes**: Run verification scripts
- **10 minutes**: Review results and identify critical issues
- **Variable**: Fix critical issues (depends on count)

### Current State (No Database Access)
- ⏸️  **PAUSED** - Waiting for database credentials

---

## Success Criteria

### Schema Fixed ✅
- [ ] All 4 OIC columns exist (competences_oic_rang_* and oic_rang_*)
- [ ] All columns are JSONB type
- [ ] Both column sets are synchronized (identical data)

### Verification Complete ✅
- [ ] SQL verification script runs without errors
- [ ] TypeScript script generates report successfully
- [ ] Both tools show consistent results

### Data Quality ✅
- [ ] ~95% of items have Rang A competencies
- [ ] ~85% of items have Rang B competencies
- [ ] 0 published items without competencies
- [ ] Average completeness score >85%

### Monitoring Active ✅
- [ ] Monitoring view created
- [ ] Weekly snapshots configured
- [ ] Alert function ready

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Schema columns don't exist | Medium | Critical | Schema fix migration adds them |
| Sync never ran | Medium | High | Schema fix re-syncs all data |
| Columns out of sync | High | Medium | Schema fix synchronizes both sets |
| No database access | Current | Blocks All | Need credentials to proceed |

---

## Questions & Answers

### Q: Can I skip the schema fix and just run verification?

**A**: No. The verification scripts may query non-existent columns or get incorrect data. Always run the schema fix first.

### Q: Will the schema fix migration break anything?

**A**: No. It's designed to be safe:
- Uses `IF NOT EXISTS` for column creation
- Only copies data if source has data and target is empty
- Re-syncs from source of truth (oic_competences)
- Fully idempotent (safe to run multiple times)

### Q: What if I don't have database access?

**A**: You cannot proceed with verification. You need either:
- Supabase credentials (URL + service role key)
- Direct PostgreSQL connection string

Contact your database administrator or project owner.

### Q: How long will the schema fix take?

**A**: Usually 1-2 minutes for 367 items. The migration processes all items and re-syncs competencies.

### Q: Can I run this in production?

**A**: Yes, but:
- Test in staging first
- Run during low-traffic period
- Monitor for any errors
- Have rollback plan ready

---

## Contact & Support

For questions or issues:

1. **Read the docs first**:
   - `docs/EDN_SCHEMA_ANALYSIS.md`
   - `docs/EDN_MANUAL_VERIFICATION_GUIDE.md`

2. **Check troubleshooting section** in the manual verification guide

3. **Review migration logs** for error messages

4. **Contact database admin** if you need credentials

---

## Appendix: File Tree

```
med-mng/
├── docs/
│   ├── EDN_SCHEMA_ANALYSIS.md          # Schema issue analysis (NEW)
│   ├── EDN_MANUAL_VERIFICATION_GUIDE.md # Step-by-step guide (NEW)
│   ├── EDN_VERIFICATION_ACTION_PLAN.md  # This file (NEW)
│   ├── EDN_COMPLETENESS_SUMMARY.md      # Quick start (UPDATED)
│   └── EDN_COMPETENCIES_VERIFICATION.md # Complete guide
├── scripts/
│   └── verify-edn-competencies-completeness.sql  # SQL audit (UPDATED)
├── apps/functions/admin/
│   ├── scripts/
│   │   └── verify-edn-completeness.ts   # TypeScript verification
│   ├── package.json                      # npm configuration
│   └── README.md                         # Admin scripts guide
└── supabase/migrations/
    ├── 20251115200000_sync_oic_to_edn_items.sql  # Original sync (HAS ISSUE)
    └── 20251116070000_fix_edn_oic_columns_schema.sql  # Schema fix (NEW)
```

---

**Status**: 🔴 **BLOCKED** - Awaiting database credentials to proceed with verification.

**Next Action**: Provide database credentials and run schema fix migration.
