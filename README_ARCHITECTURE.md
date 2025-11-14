# 🏗️ ARCHITECTURE MED-MNG - ONE-PAGE SUMMARY

## The Basics

**Tech Stack:**
- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **State:** Zustand + TanStack Query + Context API
- **UI:** Tailwind CSS + shadcn/ui + Radix UI
- **Routing:** React Router DOM v6

## By The Numbers

| What | Count | Status |
|------|-------|--------|
| Pages | 81 | All implemented |
| Routes | 66+ | All working |
| Tables in DB | 300+ | ⚠️ Needs audit |
| Hooks | 124+ | Well structured |
| Services | 12 | Functional |
| Contexts | 7 | Provider-based |

## Routes at a Glance

```
PUBLIC (32)              PROTECTED (18)           ADMIN (12)
├── /                   ├── /med-mng/login       ├── /admin
├── /edn-complete       ├── /med-mng/library     ├── /admin/import
├── /ecos               ├── /med-mng/profile     ├── /admin/audit
├── /generator          ├── /med-mng/player      ├── /admin/extract-*
├── /chat               ├── /med-mng/playlists   ├── /admin/roles
├── /store              ├── /settings             └── /admin/dashboard
├── /dashboard          └── /med-mng/analytics
├── /audit
├── /community          LEGAL (5)
└── ... 23 more         ├── /mentions-legales
                        ├── /politique-confidentialite
                        ├── /declaration-accessibilite
                        ├── /mes-donnees-rgpd
                        └── /cgu
```

## Architecture Diagram

```
App.tsx (Main Router)
├─ Providers (Auth, Query, Theme, Language, etc.)
├─ MainNavigation (Header)
├─ AppSidebar (Collapsible)
├─ Routes
│  ├─ Lazy Component
│  ├─ Suspense Fallback
│  ├─ Error Boundary (Critical routes)
│  └─ Protection Wrapper (if needed)
├─ Footer
└─ Global Components (Notifications, Help, etc.)
```

## Key Features By Module

### 🎵 Medical Music (Med-Mng)
- Full suite: Login → Create → Library → Player → Analytics
- Suno AI integration for music generation
- User playlists, subscriptions, quota management

### 📚 Educational (EDN + ECOS)
- 300+ educational items with therapeutic music
- Scenario-based learning (ECOS)
- Immersive modes, audit tracking

### 🎮 Gamification
- Achievement system (300+ badges)
- Challenges, streaks, leaderboards
- Points economy

### 📊 Analytics
- 8 different dashboards (learning, performance, accessibility, etc.)
- Real-time monitoring, custom widgets
- Export to CSV/Excel/PDF

### 🛡️ Security & RGPD
- Supabase RLS (Row Level Security)
- GDPR data export, consent management
- Security monitoring dashboard
- Audit logging

## Common Issues & How to Fix

### 🔴 Problem 1: Orphaned Pages
**Issue:** 10 page files with no active routes (EdnIndex, Homepage, Community, etc.)
**Fix:** Delete after dependency audit

### 🔴 Problem 2: Hardcoded Routes
**Issue:** `/admin/dashboard` and `/performance-dashboard` hardcoded in App.tsx
**Fix:** Add to ROUTE_PATHS constant in `/src/config/routes.ts`

### 🔴 Problem 3: Huge Database
**Issue:** 300+ tables, many likely unused
**Fix:** Audit Supabase, remove unused tables, document relationships

### 🟡 Problem 4: Missing GuestOnlyRoute
**Issue:** `/med-mng/login` and `/med-mng/signup` should redirect if already logged in
**Fix:** Implement GuestOnlyRoute wrapper component

## File Structure Quick Reference

```
src/
├── config/
│   ├── routes.ts          ← All route definitions (UPDATE THIS!)
│   ├── features.ts        ← Feature flags
│   └── analytics.ts       ← Analytics events
├── pages/                 ← 81 page components
├── components/            ← 70+ reusable components
├── hooks/                 ← 124+ custom hooks
├── contexts/              ← 7 global contexts
├── services/              ← 12 backend services
├── stores/                ← Zustand stores
├── lib/
│   ├── api-client.ts      ← API client configuration
│   ├── queryClient.ts     ← TanStack Query config
│   └── persistQueryClient.ts ← Persistence layer
└── integrations/
    └── supabase/          ← Supabase client & types
```

## API Endpoints

**Base URL:** `https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1`

Key endpoints:
- `/med-mng-api/*` - Music, subscriptions, library
- `/error-handling-service` - Error logging
- `/extract-edn-uness-complete` - Content extraction
- `/create-subscription-checkout` - Payments
- `/health` - Health check

## Quick Tips

### Add a New Route
1. Add to `ROUTE_PATHS` in `src/config/routes.ts`
2. Create page in `src/pages/PageName.tsx`
3. Add `<Route>` in `App.tsx`
4. Use lazy loading + Suspense

### Debug a Route
```bash
grep -r "routeName" src/  # Find all references
grep "routeName" src/App.tsx  # Check if defined
```

### Performance Optimization
- All pages are lazy-loaded ✅
- Suspense fallbacks in place ✅
- Error boundaries on critical routes ✅
- Progressive image loading ✅
- PWA with offline support ✅

### Testing
- Cypress E2E tests (see cypress/)
- Playwright tests (see tests/)
- Jest unit tests (see test/)
- Accessibility tests (Axe Core)

## Current Health Status

| Aspect | Status | Notes |
|--------|--------|-------|
| **Routes** | ✅ 99% | 3 hardcoded routes need fixing |
| **Pages** | ✅ 95% | 10 orphaned pages to clean |
| **Performance** | ✅ Good | Consider prefetching |
| **Security** | ✅ Good | RLS in place, need full audit |
| **Accessibility** | ✅ Good | WCAG compliance implemented |
| **Database** | ⚠️ Needs Review | 300+ tables need audit |
| **Documentation** | ⚠️ Partial | Needs route metadata config |
| **Tests** | ⚠️ Partial | E2E coverage incomplete |

## Next Steps (Priority Order)

1. **This Sprint:** Clean up orphaned pages
2. **This Sprint:** Centralize routes in ROUTE_PATHS
3. **Next Sprint:** Audit Supabase, remove unused tables
4. **Next Sprint:** Create route-metadata.ts for documentation
5. **Backlog:** Implement GuestOnlyRoute component
6. **Backlog:** Add breadcrumb system
7. **Backlog:** Auto-generate sitemap

## Most Important Files

```
src/config/routes.ts       ← Route definitions (SINGLE SOURCE OF TRUTH)
src/App.tsx                ← Main router config
src/integrations/supabase/ ← Database types & client
src/lib/api-client.ts      ← API configuration
src/pages/                 ← All page components
```

## Emergency Contacts

Need info about:
- **Routes?** → Check `src/config/routes.ts`
- **Pages?** → Check `src/pages/`
- **Database?** → Check `/src/integrations/supabase/types.ts`
- **API?** → Check `/src/lib/api-client.ts`
- **Auth?** → Check `/src/components/auth/`

## Resources

- [Full Analysis](./ARCHITECTURE_COMPLETE_2025.md) (50KB+, detailed)
- [Executive Summary](./ARCHITECTURE_SUMMARY.md) (3KB, actionable)
- [Routes Reference](./ROUTES_COMPLETE_REFERENCE.md) (10KB, quick lookup)
- [Original Route Analysis](./ANALYSE_ROUTES_DETAILLEE.md)

---

**Status: ✅ PRODUCTION READY** (with minor cleanups needed)

Last updated: 2025-11-14
