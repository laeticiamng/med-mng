# Missing Files Quick Reference

## Summary
- **Total Missing Imports**: 41
- **All files exist**: ✅ YES - in `packages/shared/src/`
- **Root cause**: Vite config missing `@shared` alias
- **Solution**: Add `@shared` alias to vite.config.ts + update imports

---

## By Category

### Services (24)
```
activity-feed.service.ts
badges.service.ts
data-export.service.ts
ecosService.ts
ednTableauxService.ts
help.service.ts
musicCacheService.ts
musicQueueService.ts
musicService.ts
notifications.service.ts
pedagogicalContentService.ts
performanceAnalyticsService.ts
post-comments.service.ts
posts.service.ts
pushNotifications.ts
qcmService.ts
recommendations.service.ts
revision-methods.service.ts
search.service.ts
user-collections.service.ts
user-favorites.service.ts
user-profile.service.ts
user-viewing-history.service.ts
wellness.service.ts
```

### Scripts (8)
```
scripts/audit/types.ts
scripts/audit/itemIC1Completeness.ts
scripts/audit/completeIC2Item.ts
scripts/audit/comprehensiveAuditor.ts
scripts/audit/comprehensiveAudit.ts
scripts/audit/ic2CompletenessCheck.ts
scripts/auditItems.ts
scripts/launch-edn-objectifs-extraction.ts
```

### Types (5)
```
types/advancedFilters.ts
types/database-custom.ts
types/edn.ts
types/music.ts
types/revision-methods.ts
```

### Other (4)
```
schemas/itemEDNSchema.ts
parsers/ednItemParser.ts
openai/chat/completions.ts
music/generate.ts
```

---

## Quick Fix

### 1. Update vite.config.ts
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@shared": path.resolve(__dirname, "../../packages/shared/src"),
  }
}
```

### 2. Run auto-fix script
```bash
# Replace @/services/ with @shared/services/
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i 's|from ["'"'"']@/services/|from "@shared/services/|g' {} +

# Replace @/scripts/ with @shared/scripts/
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i 's|from ["'"'"']@/scripts/|from "@shared/scripts/|g' {} +

# Replace @/types/ with @shared/types/
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i 's|from ["'"'"']@/types/|from "@shared/types/|g' {} +

# Replace @/schemas/ with @shared/schemas/
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i 's|from ["'"'"']@/schemas/|from "@shared/schemas/|g' {} +

# Replace @/parsers/ with @shared/parsers/
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i 's|from ["'"'"']@/parsers/|from "@shared/parsers/|g' {} +

# Replace @/openai/ with @shared/openai/
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i 's|from ["'"'"']@/openai/|from "@shared/openai/|g' {} +

# Fix music/generate relative import
sed -i 's|from ["'"'"']../music/generate|from "@shared/music/generate|g' \
  apps/frontend/src/hooks/useSunoGeneration.ts
```

### 3. Test
```bash
cd apps/frontend
npm run build
```

---

## Files That Import Shared Code (35 files)

### Components (15)
1. components/admin/CompletenessAuditDashboard.tsx
2. components/admin/ContentGenerationMonitor.tsx
3. components/admin/EcosDashboard.tsx
4. components/ai/ContextualAIChat.tsx
5. components/audit/AuditHeader.tsx
6. components/audit/AuditIC1Completeness.tsx
7. components/audit/AuditIC2CompletionDashboard.tsx
8. components/audit/ComprehensiveAuditDashboard.tsx
9. components/audit/ComprehensiveAuditPanel.tsx
10. components/badges/AuraDisplay.tsx
11. components/common/NotificationPermissionDialog.tsx
12. components/edn/AdvancedSearchModal.tsx
13. components/edn/EdnFilters.tsx
14. components/edn/EdnObjectifsExtraction.tsx
15. components/edn/audit/AuditIC2Completeness.tsx
(continued...)

### Hooks (15)
1. hooks/music/useMusicCache.ts
2. hooks/music/useMusicPolling.ts
3. hooks/useActivityFeed.ts
4. hooks/useAuditItems.ts
5. hooks/useCollections.ts
6. hooks/useDataExport.ts
7. hooks/useEdnItemV2.ts
8. hooks/useFavorites.ts
9. hooks/useHelp.ts
10. hooks/usePostComments.ts
11. hooks/useRecommendations.ts
12. hooks/useRevisionMethods.ts
13. hooks/useSunoGeneration.ts
14. hooks/useUserProfile.ts
15. hooks/useViewingHistory.ts
(continued...)

---

See `MISSING_FILES_ANALYSIS.md` for complete details.
