# Dead Code Report

Generated: 2026-04-04

## 1. Unused Component Directories (25 directories, ~65 files)

All directories below have **zero imports** anywhere in the codebase (including via barrel `src/components/index.ts`, which itself is never imported).

| Directory | Files | Status |
|-----------|-------|--------|
| `src/components/ai-tutor/` | 1 | Deleted |
| `src/components/collaboration/` | 1 | Deleted |
| `src/components/completion/` | 2 | Deleted |
| `src/components/connectors/` | 2 | Deleted |
| `src/components/documentation/` | 2 | Deleted |
| `src/components/education/` | 2 | Deleted |
| `src/components/enhanced/` | 2 | Deleted |
| `src/components/extraction/` | 2 | Deleted |
| `src/components/goals/` | 2 | Deleted |
| `src/components/items/` | 2 | Deleted |
| `src/components/karaoke/` | 2 | Duplicate of `lyrics/KaraokePlayer.tsx` — Deleted |
| `src/components/mentorship/` | 2 | Deleted |
| `src/components/mobile/` | 4 | Deleted |
| `src/components/modern/` | 6 | Deleted |
| `src/components/monitoring/` | 8 | Deleted |
| `src/components/multitenancy/` | 2 | Deleted |
| `src/components/offline/` | 3 | Deleted |
| `src/components/paywall/` | 2 | Deleted |
| `src/components/security/` | 11 | Deleted |
| `src/components/shared/` | 2 | Deleted |
| `src/components/shortcuts/` | 2 | Deleted |
| `src/components/store/` | 2 | Deleted |
| `src/components/subscription/` | 3 | Deleted |
| `src/components/test/` | 3 | Deleted |
| `src/components/tests/` | 2 | Deleted |

## 2. Unused Utility Files (7 files)

Only re-exported via `src/utils/index.ts` barrel (never consumed).

| File | Reason | Status |
|------|--------|--------|
| `src/utils/exportUtilsEnhanced.ts` | No consumer outside barrel | Deleted |
| `src/utils/generateAdvancedLyrics.ts` | No consumer outside barrel | Deleted |
| `src/utils/generateAllLyrics.ts` | Intentionally disabled (no-op stub) | Deleted |
| `src/utils/oicFixLauncher.ts` | Intentionally disabled (no-op stub) | Deleted |
| `src/utils/oicItemParent.ts` | No consumer outside barrel | Deleted |
| `src/utils/oicProgressMonitor.ts` | No consumer outside barrel | Deleted |
| `src/utils/migrationHelpers.ts` | Legacy v1→v2 migration — no longer needed | Deleted |
| `src/utils/platformHealth.ts` | No consumer outside barrel | Deleted |

## 3. Unused Route Definitions

Routes defined in `src/config/routes.ts` with no corresponding `<Route>` in `App.tsx`:

| Route key | Path | Status |
|-----------|------|--------|
| `sharedMusic` | `/shared-music/:trackId` | Definition kept (no page exists) |
| `sharedMusicIndex` | `/shared-music` | Definition kept |
| `community` | `/community` | Definition kept |
| `b2b` | `/b2b` | Definition kept |
| `auditIc1` | `/audit-ic1` | Definition kept |
| `auditIc2` | `/audit-ic2` | Definition kept |
| `auditIc4` | `/audit-ic4` | Definition kept |
| `moodTracker` | `/mood-tracker` | Definition kept |
| `pomodoro` | `/pomodoro` | Definition kept |

> Route definitions were **not deleted** — they are cheap (string constants) and may be
> wired up in future. No associated page files exist for them.

## 4. Empty/Skeleton Test Files

No empty or skeleton test files found. All test files in `tests/` contain substantive assertions.

## 5. Barrel Exports Cleaned

- `src/components/index.ts` — removed re-exports of deleted directories
- `src/utils/index.ts` — removed re-exports of deleted utility files
