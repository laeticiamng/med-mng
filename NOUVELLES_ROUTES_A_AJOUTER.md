# 🎯 NOUVELLES ROUTES À AJOUTER - GUIDE D'IMPLÉMENTATION

**Date:** 2025-11-14
**Fichier à modifier:** `/src/config/routes.ts`

---

## 📝 ROUTES À AJOUTER DANS `ROUTE_PATHS`

### Copier-coller ce code dans `/src/config/routes.ts`

```typescript
export const ROUTE_PATHS = {
  // ==================== ROUTES EXISTANTES ====================
  home: '/',
  sitemap: '/sitemap',
  shareTest: '/share-test',
  modularDashboard: '/modular-dashboard',
  dashboard: '/dashboard',
  learningDashboard: '/learning-dashboard',
  platformStatus: '/platform-status',
  monitoring: '/monitoring',
  systemManagement: '/system-management',
  platformSettings: '/platform-settings',
  optimizedIndex: '/optimized',
  generator: '/generator',
  ednComplete: '/edn-complete',
  ednCompleteDetail: '/edn-complete/:slug',
  ednImmersive: '/edn/:slug/immersive',
  ednMusicLibrary: '/edn/music-library',
  ecosIndex: '/ecos',
  ecosScenario: '/ecos/:scenarioId',
  store: '/store',
  productDetail: '/product/:handle',
  audit: '/audit',
  auditCompleteness: '/audit-completeness',
  migrationDashboard: '/migration-dashboard',
  mngMethod: '/mng-method',
  mentionsLegales: '/mentions-legales',
  politiqueConfidentialite: '/politique-confidentialite',
  cgu: '/cgu',
  declarationAccessibilite: '/declaration-accessibilite',
  medMngLogin: '/med-mng/login',
  medMngSignup: '/med-mng/signup',
  medMngPricing: '/med-mng/pricing',
  medMngSubscribe: '/med-mng/subscribe/:planId',
  medMngSuccess: '/med-mng/success',
  medMngCreate: '/med-mng/create',
  medMngLibrary: '/med-mng/library',
  medMngProfile: '/med-mng/profile',
  medMngPlayer: '/med-mng/player/:songId',
  medMngPlaylists: '/med-mng/playlists',
  medMngPlaylistDetail: '/med-mng/playlists/:playlistId',
  medMngAnalytics: '/med-mng/analytics',
  chat: '/chat',
  ednAudit: '/edn-audit',
  adminIndex: '/admin',
  adminImport: '/admin/import',
  adminAudit: '/admin/audit',
  adminExtractEdn: '/admin/extract-edn',
  adminExtractEcos: '/admin/extract-ecos',
  adminExtractObjectifs: '/admin/extract-objectifs',
  adminOicQuality: '/admin/oic-quality',
  adminComplete: '/admin/complete',
  adminPanel: '/admin/panel',
  adminRoles: '/admin/roles',
  auditSecurity: '/audit-security',
  sharedTemplates: '/shared-templates',
  templateAnalytics: '/template-analytics',
  library: '/library',
  accessibilityDashboard: '/accessibility-dashboard',
  effectivenessDashboard: '/effectiveness-dashboard',
  rlsDocumentation: '/rls-documentation',
  securityMonitoring: '/security-monitoring',
  statistics: '/statistics',
  studyPlanner: '/study-planner',
  community: '/community',
  homepage: '/homepage',
  achievements: '/achievements',
  favorites: '/favorites',
  settings: '/settings',
  designSystem: '/design-system',
  mesDonneesRgpd: '/mes-donnees-rgpd',
  installPwa: '/install',
  pwaAnalytics: '/pwa-analytics',
  ednLegacy: '/edn',
  ednLegacyWithSlug: '/edn/:slug',
  ednItemsLegacy: '/items-edn',
  auditGeneral: '/audit-general',
  auditEdn: '/audit-edn',
  auditUnified: '/audit-unified',
  auditIc1: '/audit-ic1',
  auditIc2: '/audit-ic2',
  auditIc4: '/audit-ic4',
  auditCompleteLegacy: '/audit-complete',

  // ==================== ROUTES MANQUANTES (hardcodées) ====================
  // À déplacer ici depuis App.tsx
  adminDashboardAnalytics: '/admin/dashboard',
  performanceDashboard: '/performance-dashboard',

  // ==================== NOUVELLES ROUTES PRIORITÉ 1 🔥 ====================

  // Journal & Notes
  journal: '/journal',
  journalNew: '/journal/new',
  journalEntry: '/journal/:entryId',
  journalEdit: '/journal/:entryId/edit',

  // Challenges Quotidiens
  challenges: '/challenges',
  challengesDaily: '/challenges/daily',
  challengeDetail: '/challenges/:challengeId',
  challengesHistory: '/challenges/history',

  // Leaderboard
  leaderboard: '/leaderboard',
  leaderboardFocus: '/leaderboard/focus',
  leaderboardLearning: '/leaderboard/learning',
  leaderboardWeekly: '/leaderboard/weekly',

  // Profils Utilisateurs
  users: '/users',
  userProfile: '/users/:userId',
  profileEdit: '/profile/edit',
  profilePrivacy: '/profile/privacy',

  // Sessions & Activités
  sessions: '/sessions',
  sessionsStudy: '/sessions/study',
  sessionsFocus: '/sessions/focus',
  sessionsMeditation: '/sessions/meditation',
  sessionDetail: '/sessions/:sessionId',

  // Notifications
  notifications: '/notifications',
  notificationsSettings: '/notifications/settings',
  notificationDetail: '/notifications/:notifId',

  // Quests & Ambitions
  quests: '/quests',
  questDetail: '/quests/:questId',
  questStart: '/quests/:questId/start',
  ambitions: '/ambitions',

  // ==================== NOUVELLES ROUTES PRIORITÉ 2 🟡 ====================

  // Help & Support
  help: '/help',
  helpFaq: '/help/faq',
  helpTutorials: '/help/tutorials',
  helpContact: '/help/contact',
  helpSearch: '/help/search',

  // Activity Feed
  activity: '/activity',
  activityMe: '/activity/me',
  activityUser: '/activity/:userId',

  // Posts & Community
  posts: '/posts',
  postsNew: '/posts/new',
  postDetail: '/posts/:postId',
  postEdit: '/posts/:postId/edit',

  // Wellness & Rituals
  wellness: '/wellness',
  wellnessStreak: '/wellness/streak',
  wellnessRituals: '/wellness/rituals',
  ritualDetail: '/wellness/rituals/:ritualId',

  // Badges & Auras
  badges: '/badges',
  badgeDetail: '/badges/:badgeId',
  auras: '/auras',
  auraDetail: '/auras/:auraId',

  // ==================== NOUVELLES ROUTES PRIORITÉ 3 🟢 ====================

  // API Developer Portal
  developers: '/developers',
  developersDocs: '/developers/docs',
  developersKeys: '/developers/keys',
  developersWebhooks: '/developers/webhooks',

  // Reporting & Export
  reports: '/reports',
  reportsGenerate: '/reports/generate',
  reportViewer: '/reports/:reportId',
  dataExport: '/export',

  // Advanced Search
  search: '/search',
  searchGlobal: '/search/global',
  searchSaved: '/search/saved',

  // Teams & Collaboration
  teams: '/teams',
  teamsCreate: '/teams/create',
  teamDashboard: '/teams/:teamId',
  teamMembers: '/teams/:teamId/members',
  teamChallenges: '/teams/:teamId/challenges',

  // Events & Calendar
  events: '/events',
  eventDetail: '/events/:eventId',
  eventCreate: '/events/create',
  calendar: '/calendar',

  // ==================== CATCH-ALL ====================
  notFound: '*',
} as const;
```

---

## 📋 PAGES À CRÉER

### Priorité 1 - Créer ces fichiers dans `/src/pages/`

```bash
# Journal & Notes
touch src/pages/JournalDashboard.tsx
touch src/pages/JournalNewEntry.tsx
touch src/pages/JournalEntry.tsx
touch src/pages/JournalEdit.tsx

# Challenges
touch src/pages/ChallengesDashboard.tsx
touch src/pages/DailyChallenges.tsx
touch src/pages/ChallengeDetail.tsx
touch src/pages/ChallengesHistory.tsx

# Leaderboard
touch src/pages/LeaderboardDashboard.tsx
touch src/pages/FocusLeaderboard.tsx
touch src/pages/LearningLeaderboard.tsx
touch src/pages/WeeklyLeaderboard.tsx

# Profils
touch src/pages/UsersDirectory.tsx
touch src/pages/UserPublicProfile.tsx
touch src/pages/ProfileEdit.tsx
touch src/pages/ProfilePrivacySettings.tsx

# Sessions
touch src/pages/SessionsDashboard.tsx
touch src/pages/StudySessions.tsx
touch src/pages/FocusSessions.tsx
touch src/pages/MeditationSessions.tsx
touch src/pages/SessionDetail.tsx

# Notifications
touch src/pages/NotificationsCenter.tsx
touch src/pages/NotificationSettings.tsx
touch src/pages/NotificationDetail.tsx

# Quests
touch src/pages/QuestsDashboard.tsx
touch src/pages/QuestDetail.tsx
touch src/pages/QuestStart.tsx
touch src/pages/AmbitionsManager.tsx
```

### Priorité 2 - Créer ces fichiers

```bash
# Help
touch src/pages/HelpCenter.tsx
touch src/pages/FAQ.tsx
touch src/pages/Tutorials.tsx
touch src/pages/ContactSupport.tsx
touch src/pages/HelpSearch.tsx

# Activity
touch src/pages/ActivityFeed.tsx
touch src/pages/MyActivity.tsx
touch src/pages/UserActivity.tsx

# Posts
touch src/pages/PostsFeed.tsx
touch src/pages/CreatePost.tsx
touch src/pages/PostDetail.tsx
touch src/pages/PostEdit.tsx

# Wellness
touch src/pages/WellnessDashboard.tsx
touch src/pages/WellnessStreak.tsx
touch src/pages/RitualsManager.tsx
touch src/pages/RitualDetail.tsx

# Badges & Auras
touch src/pages/BadgesGallery.tsx
touch src/pages/BadgeDetail.tsx
touch src/pages/AurasCollection.tsx
touch src/pages/AuraDetail.tsx
```

---

## 🔧 MODIFICATIONS DANS `App.tsx`

### Structure à ajouter dans le routeur

```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { AdminRoute } from '@/components/routing/AdminRoute';
import { GuestOnlyRoute } from '@/components/routing/GuestOnlyRoute'; // À créer

// ==================== LAZY IMPORTS PRIORITÉ 1 ====================

// Journal
const JournalDashboard = lazy(() => import('@/pages/JournalDashboard'));
const JournalNewEntry = lazy(() => import('@/pages/JournalNewEntry'));
const JournalEntry = lazy(() => import('@/pages/JournalEntry'));
const JournalEdit = lazy(() => import('@/pages/JournalEdit'));

// Challenges
const ChallengesDashboard = lazy(() => import('@/pages/ChallengesDashboard'));
const DailyChallenges = lazy(() => import('@/pages/DailyChallenges'));
const ChallengeDetail = lazy(() => import('@/pages/ChallengeDetail'));
const ChallengesHistory = lazy(() => import('@/pages/ChallengesHistory'));

// Leaderboard
const LeaderboardDashboard = lazy(() => import('@/pages/LeaderboardDashboard'));
const FocusLeaderboard = lazy(() => import('@/pages/FocusLeaderboard'));
const LearningLeaderboard = lazy(() => import('@/pages/LearningLeaderboard'));
const WeeklyLeaderboard = lazy(() => import('@/pages/WeeklyLeaderboard'));

// Profils
const UsersDirectory = lazy(() => import('@/pages/UsersDirectory'));
const UserPublicProfile = lazy(() => import('@/pages/UserPublicProfile'));
const ProfileEdit = lazy(() => import('@/pages/ProfileEdit'));
const ProfilePrivacySettings = lazy(() => import('@/pages/ProfilePrivacySettings'));

// Sessions
const SessionsDashboard = lazy(() => import('@/pages/SessionsDashboard'));
const StudySessions = lazy(() => import('@/pages/StudySessions'));
const FocusSessions = lazy(() => import('@/pages/FocusSessions'));
const MeditationSessions = lazy(() => import('@/pages/MeditationSessions'));
const SessionDetail = lazy(() => import('@/pages/SessionDetail'));

// Notifications
const NotificationsCenter = lazy(() => import('@/pages/NotificationsCenter'));
const NotificationSettings = lazy(() => import('@/pages/NotificationSettings'));
const NotificationDetail = lazy(() => import('@/pages/NotificationDetail'));

// Quests
const QuestsDashboard = lazy(() => import('@/pages/QuestsDashboard'));
const QuestDetail = lazy(() => import('@/pages/QuestDetail'));
const QuestStart = lazy(() => import('@/pages/QuestStart'));
const AmbitionsManager = lazy(() => import('@/pages/AmbitionsManager'));

// ==================== ROUTES JSX ====================

function App() {
  return (
    <Routes>
      {/* ... routes existantes ... */}

      {/* ==================== NOUVELLES ROUTES PRIORITÉ 1 🔥 ==================== */}

      {/* Journal & Notes - PROTECTED */}
      <Route
        path={ROUTE_PATHS.journal}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <JournalDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.journalNew}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <JournalNewEntry />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.journalEntry}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <JournalEntry />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.journalEdit}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <JournalEdit />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Challenges - PUBLIC avec protection pour participation */}
      <Route
        path={ROUTE_PATHS.challenges}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ChallengesDashboard />
          </Suspense>
        }
      />
      <Route
        path={ROUTE_PATHS.challengesDaily}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <DailyChallenges />
          </Suspense>
        }
      />
      <Route
        path={ROUTE_PATHS.challengeDetail}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ChallengeDetail />
          </Suspense>
        }
      />
      <Route
        path={ROUTE_PATHS.challengesHistory}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ChallengesHistory />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Leaderboard - PUBLIC */}
      <Route
        path={ROUTE_PATHS.leaderboard}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <LeaderboardDashboard />
          </Suspense>
        }
      />
      <Route
        path={ROUTE_PATHS.leaderboardFocus}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <FocusLeaderboard />
          </Suspense>
        }
      />
      <Route
        path={ROUTE_PATHS.leaderboardLearning}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <LearningLeaderboard />
          </Suspense>
        }
      />
      <Route
        path={ROUTE_PATHS.leaderboardWeekly}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <WeeklyLeaderboard />
          </Suspense>
        }
      />

      {/* Profils Utilisateurs - PUBLIC lecture, PROTECTED édition */}
      <Route
        path={ROUTE_PATHS.users}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <UsersDirectory />
          </Suspense>
        }
      />
      <Route
        path={ROUTE_PATHS.userProfile}
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <UserPublicProfile />
          </Suspense>
        }
      />
      <Route
        path={ROUTE_PATHS.profileEdit}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ProfileEdit />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.profilePrivacy}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ProfilePrivacySettings />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Sessions - PROTECTED */}
      <Route
        path={ROUTE_PATHS.sessions}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SessionsDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.sessionsStudy}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <StudySessions />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.sessionsFocus}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <FocusSessions />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.sessionsMeditation}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <MeditationSessions />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.sessionDetail}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SessionDetail />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Notifications - PROTECTED */}
      <Route
        path={ROUTE_PATHS.notifications}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <NotificationsCenter />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.notificationsSettings}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <NotificationSettings />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.notificationDetail}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <NotificationDetail />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Quests - PROTECTED */}
      <Route
        path={ROUTE_PATHS.quests}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <QuestsDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.questDetail}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <QuestDetail />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.questStart}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <QuestStart />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.ambitions}
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AmbitionsManager />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* ... continuer avec Priorité 2 et 3 ... */}

      {/* 404 */}
      <Route path={ROUTE_PATHS.notFound} element={<NotFound />} />
    </Routes>
  );
}

export default App;
```

---

## 🛡️ COMPOSANT `GuestOnlyRoute` À CRÉER

### Créer `/src/components/routing/GuestOnlyRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS } from '@/config/routes';

interface GuestOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const GuestOnlyRoute = ({
  children,
  redirectTo = ROUTE_PATHS.dashboard
}: GuestOnlyRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
```

### Utilisation

```typescript
// Dans App.tsx, pour les routes login/signup
<Route
  path={ROUTE_PATHS.medMngLogin}
  element={
    <GuestOnlyRoute>
      <Suspense fallback={<LoadingSpinner />}>
        <MedMngLogin />
      </Suspense>
    </GuestOnlyRoute>
  }
/>
```

---

## 📝 TEMPLATE DE PAGE

### Template pour créer une nouvelle page

```typescript
// src/pages/NomDeLaPage.tsx
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '@/hooks/useTranslation';

export default function NomDeLaPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('page.title')} | Med-Mng</title>
        <meta name="description" content={t('page.description')} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {t('page.heading')}
        </h1>

        {/* Contenu de la page */}
        <div className="space-y-6">
          {/* ... */}
        </div>
      </div>
    </>
  );
}
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Phase 1: Préparation (1 jour)
```
[ ] Mettre à jour ROUTE_PATHS dans routes.ts
[ ] Créer GuestOnlyRoute component
[ ] Mettre à jour les imports dans App.tsx
[ ] Créer les dossiers nécessaires
```

### Phase 2: Implémentation Priorité 1 (2-3 semaines)
```
[ ] Journal & Notes (4 pages)
[ ] Challenges (4 pages)
[ ] Leaderboard (4 pages)
[ ] Profils (4 pages)
[ ] Sessions (5 pages)
[ ] Notifications (3 pages)
[ ] Quests (4 pages)
```

### Phase 3: Tests & Validation (1 semaine)
```
[ ] Tests unitaires pour chaque page
[ ] Tests E2E pour navigation
[ ] Tests d'accessibilité
[ ] Review code
[ ] Validation UX
```

---

**Prêt à démarrer l'implémentation!** 🚀

Commencer par la Phase 1, puis implémenter les pages par ordre de priorité.
