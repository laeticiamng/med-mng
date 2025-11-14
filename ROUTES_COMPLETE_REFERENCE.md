# 🗺️ RÉFÉRENCE COMPLÈTE DES ROUTES ET PAGES

**Date:** 2025-11-14  
**Format:** Quick Reference Guide  
**Usage:** Pour navigation rapide dans la codebase

---

## 📌 INDEX DES ROUTES PAR CATÉGORIE

### PUBLIC ROUTES (32)
```
Home & Core
├── /                          → Index.tsx
├── /design-system             → DesignSystem.tsx
├── /sitemap                   → Sitemap.tsx
├── /mng-method                → MngMethod.tsx

EDN (Education Development Number)
├── /edn-complete              → EdnComplete.tsx [HOME]
├── /edn-complete/:slug        → EdnComplete.tsx [DETAIL]
├── /edn/:slug/immersive       → EdnImmersive.tsx
├── /edn/music-library         → EdnMusicLibrary.tsx
├── /edn/item/:itemNumber      → EdnItemDetail.tsx
├── /edn-audit                 → EdnAuditDashboard.tsx

ECOS (Scenarios)
├── /ecos                      → EcosIndex.tsx
├── /ecos/:scenarioId          → EcosScenario.tsx

Content & Tools
├── /generator                 → Generator.tsx [Music Gen]
├── /chat                      → MedChat.tsx [AI Doctor]
├── /store                     → Store.tsx [Shop]
├── /product/:handle           → ProductDetail.tsx

Dashboards & Analytics
├── /dashboard                 → Dashboard.tsx
├── /modular-dashboard         → ModularDashboard.tsx
├── /learning-dashboard        → LearningDashboard.tsx
├── /audit                     → AuditComplete.tsx
├── /audit-completeness        → AuditCompleteness.tsx
├── /migration-dashboard       → MigrationDashboard.tsx

Learning & Social
├── /community                 → CommunityHub.tsx
├── /study-planner             → StudyPlanner.tsx
├── /statistics                → Statistics.tsx
├── /achievements              → Achievements.tsx
├── /favorites                 → Favorites.tsx
├── /library                   → LibraryPage.tsx

Infrastructure & Settings
├── /settings                  → UserSettings.tsx
├── /platform-status           → PlatformStatusPage.tsx
├── /monitoring                → Monitoring.tsx
├── /accessibility-dashboard   → AccessibilityDashboard.tsx
├── /effectiveness-dashboard   → EffectivenessDashboard.tsx
├── /rls-documentation         → RLSDocumentation.tsx
├── /security-monitoring       → SecurityMonitoring.tsx

PWA & Installation
├── /install                   → InstallPWA.tsx
├── /pwa-analytics             → PWAAnalytics.tsx

Templates
├── /shared-templates          → SharedTemplatesPage.tsx
├── /template-analytics        → TemplateAnalyticsDashboard.tsx
```

### PROTECTED ROUTES - USER (18)
```
Med-Mng Suite (Music Management)
├── /med-mng/login             → MedMngLogin.tsx
├── /med-mng/signup            → MedMngSignup.tsx
├── /med-mng/pricing           → MedMngPricing.tsx
├── /med-mng/subscribe/:planId → MedMngSubscribe.tsx [PROTECTED]
├── /med-mng/success           → MedMngSuccess.tsx [PROTECTED]
├── /med-mng/create            → MedMngCreate.tsx [PROTECTED]
├── /med-mng/library           → MedMngLibrary.tsx [PROTECTED]
├── /med-mng/profile           → MedMngProfile.tsx [PROTECTED]
├── /med-mng/player/:songId    → MedMngPlayer.tsx [PROTECTED]
├── /med-mng/playlists         → PlaylistManager.tsx [PROTECTED]
├── /med-mng/playlists/:id     → PlaylistDetail.tsx [PROTECTED]
└── /med-mng/analytics         → MusicAnalytics.tsx [PROTECTED]
```

### ADMIN ROUTES (12)
```
Admin Console (All PROTECTED by AdminRoute)
├── /admin                     → AdminIndex.tsx
├── /admin/panel               → AdminPanel.tsx
├── /admin/import              → AdminImport.tsx [Data Import]
├── /admin/audit               → AdminAudit.tsx [Audit Console]
├── /admin/extract-edn         → AdminExtractEdn.tsx
├── /admin/extract-ecos        → AdminExtractEcos.tsx
├── /admin/extract-objectifs   → EdnObjectifsExtraction.tsx
├── /admin/oic-quality         → OicDataQualityManager.tsx
├── /admin/complete            → AdminCompleteProcess.tsx
├── /admin/roles               → RolesManagementPage.tsx
└── /admin/dashboard           → AdminDashboard.tsx [Analytics]
```

### LEGAL ROUTES (5)
```
Compliance & RGPD
├── /mentions-legales          → MentionsLegales.tsx
├── /politique-confidentialite → PolitiqueConfidentialite.tsx
├── /declaration-accessibilite → DeclarationAccessibilite.tsx
├── /mes-donnees-rgpd          → MesDonneesRGPD.tsx
└── /cgu                       → CGU.tsx
```

### REDIRECT ROUTES (10)
```
Legacy → New Mappings (Auto via <Navigate>)
/edn                 → /edn-complete
/edn/:slug           → /edn-complete/:slug
/items-edn           → /edn-complete
/audit-general       → /audit
/audit-edn           → /audit
/audit-unified       → /audit
/audit-ic1           → /audit
/audit-ic2           → /audit
/audit-ic4           → /audit
/audit-complete      → /audit
```

### SPECIAL ROUTES (5)
```
Special Purpose
├── /optimized                 → OptimizedIndex.tsx [Alias]
├── /share-test                → ShareTestPage.tsx [Debug]
├── /audit-security            → AuditPage.tsx [Security]
├── /performance-dashboard     → PerformanceDashboard.tsx [Monitor]
├── /homepage                  → ModernHomepage.tsx [Alt Home]
└── *                          → NotFound.tsx [404]
```

---

## 📄 PAGES FILE MAPPING (81 files)

### Root Pages
```
Index.tsx                    ← Route: /
NotFound.tsx                 ← Route: * (404)
```

### EDN Pages (10)
```
EdnComplete.tsx              ← Routes: /edn-complete, /edn-complete/:slug
EdnImmersive.tsx             ← Route: /edn/:slug/immersive
EdnMusicLibrary.tsx          ← Route: /edn/music-library
EdnItemDetail.tsx            ← Route: /edn/item/:itemNumber
EdnIndex.tsx                 ← [LEGACY] No active route
EdnCompleteDetail.tsx        ← [LEGACY] No active route
EdnAuditDashboard.tsx        ← Route: /edn-audit
EdnItemImmersive.tsx         ← [SUB-COMPONENT] Used in EdnItemDetail
EdnItemTableauxPage.tsx      ← [SUB-COMPONENT] Used in EdnItemDetail
EcosPage.tsx                 ← [LEGACY] No active route
```

### ECOS Pages (3)
```
EcosIndex.tsx                ← Route: /ecos
EcosScenario.tsx             ← Route: /ecos/:scenarioId
```

### Med-Mng Pages (10)
```
MedMngLogin.tsx              ← Route: /med-mng/login
MedMngSignup.tsx             ← Route: /med-mng/signup
MedMngPricing.tsx            ← Route: /med-mng/pricing
MedMngSubscribe.tsx          ← Route: /med-mng/subscribe/:planId [PROTECTED]
MedMngSuccess.tsx            ← Route: /med-mng/success [PROTECTED]
MedMngCreate.tsx             ← Route: /med-mng/create [PROTECTED]
MedMngLibrary.tsx            ← Route: /med-mng/library [PROTECTED]
MedMngProfile.tsx            ← Route: /med-mng/profile [PROTECTED]
MedMngPlayer.tsx             ← Route: /med-mng/player/:songId [PROTECTED]
```

### Admin Pages (10+)
```
AdminIndex.tsx               ← Route: /admin [ADMIN]
AdminPanel.tsx               ← Route: /admin/panel [ADMIN]
AdminImport.tsx              ← Route: /admin/import [ADMIN]
AdminAudit.tsx               ← Route: /admin/audit [ADMIN]
AdminExtractEdn.tsx          ← Route: /admin/extract-edn [ADMIN]
AdminExtractEcos.tsx         ← Route: /admin/extract-ecos [ADMIN]
EdnObjectifsExtraction.tsx   ← Route: /admin/extract-objectifs [ADMIN]
OicDataQualityManager.tsx    ← Route: /admin/oic-quality [ADMIN]
AdminCompleteProcess.tsx     ← Route: /admin/complete [ADMIN]
RolesManagementPage.tsx      ← Route: /admin/roles [ADMIN]
AdminDashboard.tsx           ← Route: /admin/dashboard [ADMIN]
OicExtraction.tsx            ← [LEGACY] No active route
```

### Dashboard Pages (8+)
```
Dashboard.tsx                ← Route: /dashboard
ModularDashboard.tsx         ← Route: /modular-dashboard
LearningDashboard.tsx        ← Route: /learning-dashboard
AccessibilityDashboard.tsx   ← Route: /accessibility-dashboard
EffectivenessDashboard.tsx   ← Route: /effectiveness-dashboard
MigrationDashboard.tsx       ← Route: /migration-dashboard
PerformanceDashboard.tsx     ← Route: /performance-dashboard [HARDCODED]
PlatformStatusPage.tsx       ← Route: /platform-status
```

### Learning & Engagement Pages (8)
```
CommunityHub.tsx             ← Route: /community
StudyPlanner.tsx             ← Route: /study-planner
Statistics.tsx               ← Route: /statistics
Achievements.tsx             ← Route: /achievements
Favorites.tsx                ← Route: /favorites
Generator.tsx                ← Route: /generator
MedChat.tsx                  ← Route: /chat
LibraryPage.tsx              ← Route: /library
```

### Shop & Products (2)
```
Store.tsx                    ← Route: /store
ProductDetail.tsx            ← Route: /product/:handle
```

### Playlists & Music (3)
```
PlaylistManager.tsx          ← Route: /med-mng/playlists [PROTECTED]
PlaylistDetail.tsx           ← Route: /med-mng/playlists/:playlistId [PROTECTED]
MusicAnalytics.tsx           ← Route: /med-mng/analytics [PROTECTED]
```

### Legal & Policy Pages (5)
```
MentionsLegales.tsx          ← Route: /mentions-legales
PolitiqueConfidentialite.tsx ← Route: /politique-confidentialite
DeclarationAccessibilite.tsx ← Route: /declaration-accessibilite
MesDonneesRGPD.tsx           ← Route: /mes-donnees-rgpd
CGU.tsx                      ← Route: /cgu
```

### System & Infrastructure (7)
```
Monitoring.tsx               ← Route: /monitoring
SecurityMonitoring.tsx       ← Route: /security-monitoring
RLSDocumentation.tsx         ← Route: /rls-documentation
Sitemap.tsx                  ← Route: /sitemap
ShareTestPage.tsx            ← Route: /share-test [DEBUG]
DesignSystem.tsx             ← Route: /design-system
AuditPage.tsx                ← Route: /audit-security [MINIMAL]
```

### Settings & Config (3)
```
UserSettings.tsx             ← Route: /settings
MngMethod.tsx                ← Route: /mng-method
OptimizedIndex.tsx           ← Route: /optimized [ALIAS]
```

### PWA (2)
```
InstallPWA.tsx               ← Route: /install
PWAAnalytics.tsx             ← Route: /pwa-analytics
```

### Templates & Sharing (2)
```
SharedTemplatesPage.tsx      ← Route: /shared-templates
TemplateAnalyticsDashboard.tsx ← Route: /template-analytics
```

### Legacy/Alternative (3)
```
Homepage.tsx                 ← [LEGACY] Replaced by ModernHomepage
Community.tsx                ← [LEGACY] Replaced by CommunityHub
ModernHomepage.tsx           ← Route: /homepage [ALT HOME]
```

---

## 🔍 ORPHANED PAGES (No Active Route)

### Currently Unused (10 files)
```
1. EdnIndex.tsx              - Legacy, redirected via /edn
2. EcosPage.tsx              - Replaced by EcosIndex.tsx
3. EdnCompleteDetail.tsx     - Merged into EdnComplete.tsx
4. Homepage.tsx              - Replaced by ModernHomepage.tsx
5. Community.tsx             - Replaced by CommunityHub.tsx
6. OicExtraction.tsx         - Legacy admin page
7. EdnItemImmersive.tsx      - Used as sub-component (KEEP?)
8. EdnItemTableauxPage.tsx   - Used as sub-component (KEEP?)
9. MonitoringCenter.tsx      - Component, not a page
10. AuditPage.tsx            - Minimal, via /audit-security
```

**Action:** Review + delete after dependency audit

---

## 🚨 HARDCODED ROUTES (Not in ROUTE_PATHS)

```
⚠️ /admin/dashboard          - Line 232 in App.tsx
⚠️ /performance-dashboard    - Line 274 in App.tsx
⚠️ /admin-panel (implicit)   - May be ambiguous with /admin/panel
```

**Action:** Add to ROUTE_PATHS constant

---

## 🛡️ ROUTE PROTECTION MATRIX

### Public (No Auth Required)
```
✅ Home, EDN, ECOS, Generator, Chat, Store
✅ Dashboards, Audit, Community, Learning, Gamification
✅ Legal pages, Settings, All public features
```

### Protected (ProtectedRoute Wrapper)
```
✅ /med-mng/subscribe    - Requires auth
✅ /med-mng/success      - Requires auth
✅ /med-mng/create       - Requires auth
✅ /med-mng/library      - Requires auth
✅ /med-mng/profile      - Requires auth
✅ /med-mng/player/*     - Requires auth
✅ /med-mng/playlists    - Requires auth
✅ /med-mng/analytics    - Requires auth
```

### Admin Only (AdminRoute Wrapper)
```
✅ /admin/*              - Requires admin role
✅ All admin features    - RLS protected on DB level
```

### Guest Only (⚠️ NOT IMPLEMENTED)
```
❌ /med-mng/login        - Should prevent access if logged in
❌ /med-mng/signup       - Should prevent access if logged in
❌ /med-mng/pricing      - Accessible but redirect if premium?
```

**Action:** Implement GuestOnlyRoute component

---

## 📊 QUICK STATS

```
Total Routes:         66+
├─ Public:            32
├─ Protected User:    18
├─ Admin Only:        12
├─ Legal/RGPD:        5
└─ Redirects:         10

Pages Implemented:    81
├─ Active Routes:     71
├─ Orphaned:          10
└─ Sub-Components:    3

Status:
✅ 92% routes have active pages
⚠️ 8% pages are orphaned
⚠️ 3 routes hardcoded (not in ROUTE_PATHS)
⚠️ 8 routes missing GuestOnly protection
```

---

## 🔄 COMMON PATTERNS

### Lazy Loading (Standard)
```typescript
const PageName = lazy(() => import("./pages/PageName"));

<Route path={ROUTE_PATHS.route} element={
  <Suspense fallback={<LoadingSpinner />}>
    <PageName />
  </Suspense>
} />
```

### Error Boundary (Critical Routes)
```typescript
<Route path={ROUTE_PATHS.route} element={
  <ErrorBoundary>
    <Suspense fallback={<Spinner />}>
      <PageName />
    </Suspense>
  </ErrorBoundary>
} />
```

### Protected Routes
```typescript
<Route path={ROUTE_PATHS.protected} element={
  <ProtectedRoute>
    <Suspense fallback={<Spinner />}>
      <ProtectedPage />
    </Suspense>
  </ProtectedRoute>
} />
```

### Admin Routes
```typescript
<Route path={ROUTE_PATHS.adminRoute} element={
  <AdminRoute>
    <Suspense fallback={<Spinner />}>
      <AdminPage />
    </Suspense>
  </AdminRoute>
} />
```

### Redirects (Old Routes)
```typescript
<Route path={ROUTE_PATHS.oldRoute} element={
  <Navigate to={ROUTE_PATHS.newRoute} replace />
} />
```

---

## 📚 FEATURE ROUTES MAPPING

| Feature | Routes | Primary Page |
|---------|--------|--------------|
| **EDN** | 6 | EdnComplete |
| **ECOS** | 2 | EcosIndex |
| **Med-Mng** | 10 | MedMngLibrary |
| **Chat** | 1 | MedChat |
| **Store** | 2 | Store |
| **Admin** | 12 | AdminIndex |
| **Gamification** | 5 | Achievements |
| **Learning** | 4 | LearningDashboard |
| **Analytics** | 8 | Dashboard |
| **Legal** | 5 | MentionsLegales |

---

## 💡 QUICK NAVIGATION

**Want to find a page?**
```
1. Search ROUTE_PATHS in this doc
2. Find the route path
3. Locate the .tsx file in the table above
4. Check /src/pages/{PageName}.tsx
```

**Want to add a new route?**
```
1. Add to ROUTE_PATHS in /src/config/routes.ts
2. Create .tsx file in /src/pages/
3. Add Route element in App.tsx
4. Add to this reference doc
5. Consider metadata in route-metadata.ts (TODO)
```

**Want to delete orphaned page?**
```
1. Grep for imports: grep -r "PageName" src/
2. Check dependencies
3. Remove from /src/pages/
4. Verify build succeeds
5. Remove from this reference doc
```

---

**Last Updated:** 2025-11-14  
**Maintainer:** Claude Code  
**Version:** 1.0

