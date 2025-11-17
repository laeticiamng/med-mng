# Comprehensive Missing Files Analysis

## Executive Summary

Found **41 missing file imports** in the frontend build. However, **ALL 41 files actually exist** in the `/home/user/med-mng/packages/shared/` package.

**Root Cause**: The imports use `@/` prefix which maps to `apps/frontend/src/`, but the files are in `packages/shared/src/`. The `vite.config.ts` is missing the `@shared` alias that exists in `tsconfig.json`.

---

## Missing Files Breakdown

### 1. Services (24 files)
All exist in `/home/user/med-mng/packages/shared/src/services/`

| Missing Import Path | Expected Exports | Imported By | Actual Location |
|---------------------|------------------|-------------|-----------------|
| `@/services/ednTableauxService` | `ednTableauxService, CompletenessAuditResult, ItemCompleteness` | CompletenessAuditDashboard.tsx | ✅ `shared/src/services/ednTableauxService.ts` |
| `@/services/pedagogicalContentService` | `pedagogicalContentService, ContentAnalytics` | ContentGenerationMonitor.tsx | ✅ `shared/src/services/pedagogicalContentService.ts` |
| `@/services/ecosService` | `ecosService, EcosAnalytics` | EcosDashboard.tsx | ✅ `shared/src/services/ecosService.ts` |
| `@/services/badges.service` | `UserAura` | AuraDisplay.tsx | ✅ `shared/src/services/badges.service.ts` |
| `@/services/pushNotifications` | `pushNotifications` | NotificationPermissionDialog.tsx | ✅ `shared/src/services/pushNotifications.ts` |
| `@/services/musicQueueService` | `MusicQueueService` | MusicDashboard.tsx | ✅ `shared/src/services/musicQueueService.ts` |
| `@/services/musicService` | `musicService` | MusicDashboard.tsx | ✅ `shared/src/services/musicService.ts` |
| `@/services/notifications.service` | `NotificationPreferences` (type) | NotificationPreferences.tsx | ✅ `shared/src/services/notifications.service.ts` |
| `@/services/performanceAnalyticsService` | `PerformanceAlert` | PerformanceAlertsPanel.tsx | ✅ `shared/src/services/performanceAnalyticsService.ts` |
| `@/services/posts.service` | `Comment` | CommentThread.tsx | ✅ `shared/src/services/posts.service.ts` |
| `@/services/qcmService` | `qcmService, QcmQuestion, QcmSession` | QcmPlayer.tsx | ✅ `shared/src/services/qcmService.ts` |
| `@/services/musicCacheService` | `MusicCacheService` | useMusicCache.ts | ✅ `shared/src/services/musicCacheService.ts` |
| `@/services/activity-feed.service` | `activityFeedService, ActivityType` | useActivityFeed.ts | ✅ `shared/src/services/activity-feed.service.ts` |
| `@/services/user-collections.service` | `userCollectionsService` | useCollections.ts | ✅ `shared/src/services/user-collections.service.ts` |
| `@/services/data-export.service` | `dataExportService, ExportType, ExportFormat` | useDataExport.ts | ✅ `shared/src/services/data-export.service.ts` |
| `@/services/user-favorites.service` | `userFavoritesService` | useFavorites.ts | ✅ `shared/src/services/user-favorites.service.ts` |
| `@/services/help.service` | `helpService, HelpCategory, TutorialDifficulty, TicketPriority, TicketStatus` | useHelp.ts | ✅ `shared/src/services/help.service.ts` |
| `@/services/post-comments.service` | `postCommentsService` | usePostComments.ts | ✅ `shared/src/services/post-comments.service.ts` |
| `@/services/recommendations.service` | `recommendationsService, ContentType, UserPreferences` | useRecommendations.ts | ✅ `shared/src/services/recommendations.service.ts` |
| `@/services/revision-methods.service` | `* as revisionService` | useRevisionMethods.ts | ✅ `shared/src/services/revision-methods.service.ts` |
| `@/services/user-profile.service` | `userProfileService, AchievementType` | useUserProfile.ts | ✅ `shared/src/services/user-profile.service.ts` |
| `@/services/user-viewing-history.service` | `userViewingHistoryService` | useViewingHistory.ts | ✅ `shared/src/services/user-viewing-history.service.ts` |
| `@/services/wellness.service` | `wellnessService, ActivityType, RitualCategory, GoalType, GoalStatus` | useWellness.ts | ✅ `shared/src/services/wellness.service.ts` |
| `@/services/search.service` | `SearchFilters` | AdvancedSearch.tsx | ✅ `shared/src/services/search.service.ts` |

### 2. Scripts (8 files)
All exist in `/home/user/med-mng/packages/shared/src/scripts/`

| Missing Import Path | Expected Exports | Imported By | Actual Location |
|---------------------|------------------|-------------|-----------------|
| `@/scripts/audit/types` | `AuditReport` (type) | AuditHeader.tsx | ✅ `shared/src/scripts/audit/types.ts` |
| `@/scripts/audit/itemIC1Completeness` | `IC1CompletenessAuditor` | AuditIC1Completeness.tsx | ✅ `shared/src/scripts/audit/itemIC1Completeness.ts` |
| `@/scripts/audit/completeIC2Item` | `completeIC2Item` | AuditIC2CompletionDashboard.tsx | ✅ `shared/src/scripts/audit/completeIC2Item.ts` |
| `@/scripts/audit/comprehensiveAuditor` | `ComprehensiveSystemAuditor, ComprehensiveAuditResult` | ComprehensiveAuditDashboard.tsx | ✅ `shared/src/scripts/audit/comprehensiveAuditor.ts` |
| `@/scripts/audit/comprehensiveAudit` | `ComprehensiveAuditReport` (type) | ComprehensiveAuditPanel.tsx | ✅ `shared/src/scripts/audit/comprehensiveAudit.ts` |
| `@/scripts/launch-edn-objectifs-extraction` | `EdnObjectifsExtractor` | EdnObjectifsExtraction.tsx | ✅ `shared/src/scripts/launch-edn-objectifs-extraction.ts` |
| `@/scripts/audit/ic2CompletenessCheck` | `checkIC2Completeness` | AuditIC2Completeness.tsx | ✅ `shared/src/scripts/audit/ic2CompletenessCheck.ts` |
| `@/scripts/auditItems` | `EDNItemsAuditor, AuditReportGenerators` | useAuditItems.ts | ✅ `shared/src/scripts/auditItems.ts` |

### 3. Types (5 files)
All exist in `/home/user/med-mng/packages/shared/src/types/`

| Missing Import Path | Expected Exports | Imported By | Actual Location |
|---------------------|------------------|-------------|-----------------|
| `@/types/advancedFilters` | `AdvancedFilters, DifficultyLevel, ProgressStatus` (types) | AdvancedSearchModal.tsx | ✅ `shared/src/types/advancedFilters.ts` |
| `@/types/edn` | `CategoryType, SortByType` (types) | EdnFilters.tsx | ✅ `shared/src/types/edn.ts` |
| `@/types/revision-methods` | `TodayRevisionItem, BlockMethodConfigDB` | BlockMethodView.tsx | ✅ `shared/src/types/revision-methods.ts` |
| `@/types/music` | `MusicGenerationRequest, PollingProgress` | useMusicPolling.ts | ✅ `shared/src/types/music.ts` |
| `@/types/database-custom` | `ItemType, UserFavorite` | useFavorites.ts | ✅ `shared/src/types/database-custom.ts` |

### 4. Schemas & Parsers (2 files)
All exist in `/home/user/med-mng/packages/shared/src/`

| Missing Import Path | Expected Exports | Imported By | Actual Location |
|---------------------|------------------|-------------|-----------------|
| `@/schemas/itemEDNSchema` | `validateItemEDN, ItemEDNV2` | useEdnItemV2.ts | ✅ `shared/src/schemas/itemEDNSchema.ts` |
| `@/parsers/ednItemParser` | `EDNItemParser, ParsedEDNItem` | useEdnItemV2.ts | ✅ `shared/src/parsers/ednItemParser.ts` |

### 5. Other (2 files)

| Missing Import Path | Expected Exports | Imported By | Actual Location |
|---------------------|------------------|-------------|-----------------|
| `@/openai/chat/completions` | `createChatCompletion, ChatCompletionMessage` | ContextualAIChat.tsx | ✅ `shared/src/openai/chat/completions.ts` |
| `../music/generate` | `generateMusic, GenerateMusicPayload` (type) | useSunoGeneration.ts | ✅ `shared/src/music/generate.ts` |

---

## Root Cause Analysis

### Current Configuration

**tsconfig.json** (apps/frontend/tsconfig.json):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../../packages/shared/src/*"]  // ✅ Defined
    }
  }
}
```

**vite.config.ts** (apps/frontend/vite.config.ts):
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    // ❌ MISSING: "@shared" alias not defined!
  }
}
```

### The Problem

1. TypeScript knows about both `@/*` and `@shared/*` aliases
2. Vite (the build tool) only knows about `@/*` alias
3. Frontend code imports from `@/services/...` expecting files in `apps/frontend/src/services/`
4. Files actually exist in `packages/shared/src/services/`
5. Build fails because Vite cannot resolve the imports

---

## Solutions

### ✅ RECOMMENDED: Option 1 - Add @shared Alias to Vite Config

**Update** `apps/frontend/vite.config.ts`:

```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),  // ADD THIS
    },
  },
  // ... rest of config
});
```

**Then update all 41 imports** to use `@shared/*` instead of `@/*`:

```typescript
// BEFORE:
import { ednTableauxService } from '@/services/ednTableauxService';
import type { EdnItem } from '@/types/edn';

// AFTER:
import { ednTableauxService } from '@shared/services/ednTableauxService';
import type { EdnItem } from '@shared/types/edn';
```

**Pros:**
- Clean separation between frontend and shared code
- Explicit about what's coming from shared package
- Follows monorepo best practices
- No file duplication

**Cons:**
- Requires updating 41 import statements
- Need to update vite.config.ts

---

### Option 2 - Copy Shared Files to Frontend (Not Recommended)

Copy all files from `packages/shared/src/` to `apps/frontend/src/`.

**Pros:**
- No config changes needed
- Imports already correct

**Cons:**
- ❌ File duplication
- ❌ Maintenance nightmare
- ❌ Breaks monorepo architecture
- ❌ Violates DRY principle

---

### Option 3 - Symlinks (Not Recommended for This Case)

Create symlinks from `apps/frontend/src/` to `packages/shared/src/`.

**Pros:**
- No import changes needed

**Cons:**
- ❌ Can cause issues with build tools
- ❌ Platform-dependent (Windows issues)
- ❌ Not portable
- ❌ Git complications

---

## Implementation Checklist for Option 1 (Recommended)

### Step 1: Update Vite Config
- [ ] Edit `apps/frontend/vite.config.ts`
- [ ] Add `"@shared": path.resolve(__dirname, "../../packages/shared/src")` to resolve.alias

### Step 2: Update Imports (41 files to change)

#### Services (24 files):
- [ ] `apps/frontend/src/components/admin/CompletenessAuditDashboard.tsx`
- [ ] `apps/frontend/src/components/admin/ContentGenerationMonitor.tsx`
- [ ] `apps/frontend/src/components/admin/EcosDashboard.tsx`
- [ ] `apps/frontend/src/components/badges/AuraDisplay.tsx`
- [ ] `apps/frontend/src/components/common/NotificationPermissionDialog.tsx`
- [ ] `apps/frontend/src/components/music/MusicDashboard.tsx` (2 imports)
- [ ] `apps/frontend/src/components/notifications/NotificationPreferences.tsx`
- [ ] `apps/frontend/src/components/performance/PerformanceAlertsPanel.tsx`
- [ ] `apps/frontend/src/components/posts/CommentThread.tsx`
- [ ] `apps/frontend/src/components/qcm/QcmPlayer.tsx`
- [ ] `apps/frontend/src/hooks/music/useMusicCache.ts`
- [ ] `apps/frontend/src/hooks/useActivityFeed.ts`
- [ ] `apps/frontend/src/hooks/useCollections.ts`
- [ ] `apps/frontend/src/hooks/useDataExport.ts`
- [ ] `apps/frontend/src/hooks/useFavorites.ts` (2 imports - service + type)
- [ ] `apps/frontend/src/hooks/useHelp.ts`
- [ ] `apps/frontend/src/hooks/usePostComments.ts`
- [ ] `apps/frontend/src/hooks/useRecommendations.ts`
- [ ] `apps/frontend/src/hooks/useRevisionMethods.ts`
- [ ] `apps/frontend/src/hooks/useUserProfile.ts`
- [ ] `apps/frontend/src/hooks/useViewingHistory.ts`
- [ ] `apps/frontend/src/hooks/useWellness.ts`
- [ ] `apps/frontend/src/pages/AdvancedSearch.tsx`

#### Scripts (8 files):
- [ ] `apps/frontend/src/components/audit/AuditHeader.tsx`
- [ ] `apps/frontend/src/components/audit/AuditIC1Completeness.tsx`
- [ ] `apps/frontend/src/components/audit/AuditIC2CompletionDashboard.tsx`
- [ ] `apps/frontend/src/components/audit/ComprehensiveAuditDashboard.tsx`
- [ ] `apps/frontend/src/components/audit/ComprehensiveAuditPanel.tsx`
- [ ] `apps/frontend/src/components/edn/EdnObjectifsExtraction.tsx`
- [ ] `apps/frontend/src/components/edn/audit/AuditIC2Completeness.tsx`
- [ ] `apps/frontend/src/hooks/useAuditItems.ts`

#### Types (5 files):
- [ ] `apps/frontend/src/components/edn/AdvancedSearchModal.tsx`
- [ ] `apps/frontend/src/components/edn/EdnFilters.tsx`
- [ ] `apps/frontend/src/components/revision/BlockMethodView.tsx`
- [ ] `apps/frontend/src/hooks/music/useMusicPolling.ts`
- [ ] `apps/frontend/src/hooks/useFavorites.ts` (already counted above)

#### Schemas & Parsers (1 file with 2 imports):
- [ ] `apps/frontend/src/hooks/useEdnItemV2.ts` (2 imports)

#### Other (2 files):
- [ ] `apps/frontend/src/components/ai/ContextualAIChat.tsx`
- [ ] `apps/frontend/src/hooks/useSunoGeneration.ts`

### Step 3: Test Build
- [ ] Run `npm run build` in frontend
- [ ] Verify all imports resolve correctly
- [ ] Check for any new errors

---

## Quick Fix Script

Create a script to automatically update all imports:

```bash
#!/bin/bash
# Save as: fix-shared-imports.sh

# Services
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ["'"'"']@/services/|from "@shared/services/|g' {} +

# Scripts
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ["'"'"']@/scripts/|from "@shared/scripts/|g' {} +

# Types
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ["'"'"']@/types/|from "@shared/types/|g' {} +

# Schemas
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ["'"'"']@/schemas/|from "@shared/schemas/|g' {} +

# Parsers
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ["'"'"']@/parsers/|from "@shared/parsers/|g' {} +

# OpenAI
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ["'"'"']@/openai/|from "@shared/openai/|g' {} +

echo "✅ Updated all imports from @/ to @shared/ for shared package files"
```

---

## Files to Modify Summary

**Total Files**: 41 missing imports across ~35 unique files

**Configuration Files**: 1
- `apps/frontend/vite.config.ts`

**Component Files**: 15
**Hook Files**: 15
**Page Files**: 1

---

## Additional Notes

1. **All files exist** - No files need to be created
2. **Monorepo structure is correct** - Shared code is properly in `packages/shared`
3. **TypeScript config is correct** - `@shared/*` alias is defined
4. **Vite config is incomplete** - Missing `@shared` alias
5. **Imports are incorrect** - Using `@/*` instead of `@shared/*` for shared files

---

## Related Files

- Analysis script: `/home/user/med-mng/check-missing-imports.cjs`
- JSON report: `/home/user/med-mng/missing-imports.json`
- This report: `/home/user/med-mng/MISSING_FILES_ANALYSIS.md`

---

Generated: 2025-11-17
