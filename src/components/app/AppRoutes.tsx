/**
 * 🚀 ROUTAGE D'APPLICATION OPTIMISÉ - MED-MNG v2.0
 * Lazy loading intelligent avec preloading pour de meilleures performances
 */

import React, { Suspense, lazy, memo, useEffect } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { logger } from '@/lib/logger';

// Components de base
import GlobalErrorBoundary from '@/components/error/GlobalErrorBoundary';
import { PageThemeProvider } from '@/components/layout/PageThemeProvider';
import { SkipLinks } from '@/components/navigation/SkipLinks';
import { SkipToMain } from '@/components/ux/AccessibilityEnhancements';
import { PageSkeleton } from '@/components/loading/SkeletonLoader';
import { PremiumNavigation } from '@/components/navigation/PremiumNavigation';
import { UXToolbar } from '@/components/ux/UXToolbar';
import { GlobalMusicPlayer } from '@/components/layout/GlobalMusicPlayer';

// Authentication
import { ProtectedRoute } from '@/components/med-mng/withAuth';

// ==========================================
// LAZY LOADING AVEC PRELOADING INTELLIGENT
// ==========================================

// Fonction utilitaire pour créer des imports lazy avec preloading
const createLazyComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  preload = false
) => {
  const LazyComponent = lazy(importFn);
  
  // Preload si demandé
  if (preload) {
    importFn().catch(error => {
      logger.error('app', 'Failed to preload component', { error });
    });
  }
  
  return LazyComponent;
};

// ⚡ PAGES CRITIQUES - Preloaded
const Index = createLazyComponent(() => import('@/pages/Index'), true);
const Generator = createLazyComponent(() => import('@/pages/Generator'), true);
const MeditationCenter = createLazyComponent(() => import('@/pages/MeditationCenter'), true);

// ⚡ PAGES CORE - Chargement standard
const PlatformOverview = createLazyComponent(() => import('@/pages/PlatformOverview'));
const PremiumAllFeatures = createLazyComponent(() => import('@/pages/PremiumAllFeatures'));
const PremiumDashboard = createLazyComponent(() => import('@/pages/PremiumDashboard'));
const PremiumAnalytics = createLazyComponent(() => import('@/pages/PremiumAnalytics'));
const PremiumCommunity = createLazyComponent(() => import('@/pages/PremiumCommunity'));
const PremiumProfile = createLazyComponent(() => import('@/pages/PremiumProfile'));
const UserSettings = createLazyComponent(() => import('@/pages/UserSettings'));
const Documentation = createLazyComponent(() => import('@/pages/Documentation'));
const Notifications = createLazyComponent(() => import('@/pages/Notifications'));
const FAQ = createLazyComponent(() => import('@/pages/FAQ'));
const HelpCenter = createLazyComponent(() => import('@/pages/HelpCenter'));

// ⚡ EDN SYSTEM
const EdnComplete = createLazyComponent(() => import('@/pages/EdnComplete'));
const EdnItem = createLazyComponent(() => import('@/pages/EdnItem'));
const EdnImmersive = createLazyComponent(() => import('@/pages/EdnImmersive'));

// ⚡ ECOS SYSTEM
const EcosIndex = createLazyComponent(() => import('@/pages/EcosIndex'));
const EcosScenario = createLazyComponent(() => import('@/pages/EcosScenario'));

// ⚡ MEDICAL PLATFORM
const MedicalPlatform = createLazyComponent(() => 
  import('@/pages/MedicalPlatform').then(module => ({ default: module.MedicalPlatform }))
);
const MedMngLogin = createLazyComponent(() => 
  import('@/pages/MedMngLogin').then(module => ({ default: module.MedMngLogin }))
);
const MedMngSignup = createLazyComponent(() => 
  import('@/pages/MedMngSignup').then(module => ({ default: module.MedMngSignup }))
);
const MedMngPricing = createLazyComponent(() => 
  import('@/pages/MedMngPricing').then(module => ({ default: module.MedMngPricing }))
);
const MedMngSubscribe = createLazyComponent(() => 
  import('@/pages/MedMngSubscribe').then(module => ({ default: module.MedMngSubscribe }))
);
const MedMngSuccess = createLazyComponent(() => 
  import('@/pages/MedMngSuccess').then(module => ({ default: module.MedMngSuccess }))
);

// Med-Mng Dashboard Pages
const MedMngDashboard = createLazyComponent(() => import('@/pages/med-mng/Dashboard'));
const MedMngCreate = createLazyComponent(() => import('@/pages/med-mng/Create'));
const MedMngLibrary = createLazyComponent(() => import('@/pages/med-mng/Library'));
const MedMngProfile = createLazyComponent(() => import('@/pages/med-mng/Profile'));
const MedMngPlayer = createLazyComponent(() => import('@/pages/med-mng/Player'));
const MedMngAnalytics = createLazyComponent(() => import('@/pages/med-mng/Analytics'));
const MedMngSettings = createLazyComponent(() => import('@/pages/med-mng/Settings'));
const MedMngCommunity = createLazyComponent(() => import('@/pages/med-mng/Community'));
const MedMngPlaylists = createLazyComponent(() => import('@/pages/med-mng/Playlists'));
const MedMngPlaylistDetail = createLazyComponent(() => import('@/pages/med-mng/PlaylistDetail'));

// ⚡ ADMIN & MONITORING - Lazy uniquement (pas critiques)
const MonitoringCenter = createLazyComponent(() => import('@/pages/MonitoringCenter'));
const SystemAdmin = createLazyComponent(() => import('@/pages/SystemAdmin'));
const SystemHealth = createLazyComponent(() => import('@/pages/SystemHealth'));
const SystemDashboard = createLazyComponent(() => import('@/pages/SystemDashboard'));
const UltimateAdministration = createLazyComponent(() => import('@/pages/UltimateAdministration'));
const AdminPanel = createLazyComponent(() => 
  import('@/pages/AdminPanel').then(module => ({ default: module.AdminPanel }))
);
const RouteValidator = createLazyComponent(() => import('@/pages/RouteValidator'));

// ⚡ AUDIT & ANALYSIS
const AuditComplete = createLazyComponent(() => import('@/pages/AuditComplete'));
const AuditCompleteness = createLazyComponent(() => import('@/pages/AuditCompleteness'));
const NavigationAuditPage = createLazyComponent(() => import('@/pages/NavigationAuditPage'));

// ⚡ CHAT & AI
const MedChat = createLazyComponent(() => import('@/pages/MedChat'));
const UltimateAIHub = createLazyComponent(() => import('@/pages/UltimateAIHub'));

// ⚡ LEGAL PAGES
const MentionsLegales = createLazyComponent(() => import('@/pages/MentionsLegales'));
const PolitiqueConfidentialite = createLazyComponent(() => import('@/pages/PolitiqueConfidentialite'));
const Conditions = createLazyComponent(() => import('@/pages/Conditions'));
const Support = createLazyComponent(() => import('@/pages/Support'));

// ⚡ ERROR PAGE
const NotFound = createLazyComponent(() => import('@/pages/NotFound'));

// ==========================================
// COMPOSANT DE REDIRECTION EDN
// ==========================================

const EdnCompleteRedirect = memo(() => {
  const { slug } = useParams();
  logger.debug('app', 'EDN redirect', { from: `/edn-complete/${slug}`, to: `/edn/${slug}` });
  return <Navigate to={`/edn/${slug}`} replace />;
});

EdnCompleteRedirect.displayName = 'EdnCompleteRedirect';

// ==========================================
// COMPOSANT PRINCIPAL DES ROUTES
// ==========================================

interface AppRoutesProps {
  className?: string;
}

const AppRoutes = memo(({ className = '' }: AppRoutesProps) => {
  useEffect(() => {
    logger.performance('AppRoutes mounted');
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <SkipToMain />
      <SkipLinks />
      
      {/* Navigation Premium Unifiée */}
      <PremiumNavigation />
      
      <main className="flex-1 pb-20">
        <PageThemeProvider>
          <GlobalErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* ⚡ CORE ROUTES */}
                <Route path="/" element={<Index />} />
                <Route path="/platform" element={<PlatformOverview />} />
                <Route path="/features" element={<PremiumAllFeatures />} />
                <Route path="/generator" element={<Generator />} />
                <Route path="/meditation/*" element={<MeditationCenter />} />
                <Route path="/dashboard" element={<PremiumDashboard />} />
                <Route path="/analytics" element={<PremiumAnalytics />} />
                <Route path="/community" element={<PremiumCommunity />} />
                <Route path="/profile" element={<PremiumProfile />} />
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/help" element={<HelpCenter />} />

                {/* ⚡ EDN SYSTEM */}
                <Route path="/edn" element={<EdnComplete />} />
                <Route path="/edn/:slug" element={<EdnItem />} />
                <Route path="/edn/:slug/immersive" element={<EdnImmersive />} />
                <Route path="/edn-complete" element={<Navigate to="/edn" replace />} />
                <Route path="/edn-complete/:slug" element={<EdnCompleteRedirect />} />

                {/* ⚡ ECOS SYSTEM */}
                <Route path="/ecos" element={<EcosIndex />} />
                <Route path="/ecos/:scenarioId" element={<EcosScenario />} />

                {/* ⚡ MEDICAL PLATFORM */}
                <Route path="/med-mng/login" element={<MedMngLogin />} />
                <Route path="/med-mng/signup" element={<MedMngSignup />} />
                <Route path="/med-mng/pricing" element={<MedMngPricing />} />
                <Route path="/med-mng/platform" element={<MedicalPlatform />} />
                <Route path="/med-mng/subscribe/:planId" element={<ProtectedRoute><MedMngSubscribe /></ProtectedRoute>} />
                <Route path="/med-mng/success" element={<ProtectedRoute><MedMngSuccess /></ProtectedRoute>} />
                <Route path="/med-mng/dashboard" element={<ProtectedRoute><MedMngDashboard /></ProtectedRoute>} />
                <Route path="/med-mng/create" element={<ProtectedRoute><MedMngCreate /></ProtectedRoute>} />
                <Route path="/med-mng/library" element={<ProtectedRoute><MedMngLibrary /></ProtectedRoute>} />
                <Route path="/med-mng/profile" element={<ProtectedRoute><MedMngProfile /></ProtectedRoute>} />
                <Route path="/med-mng/analytics" element={<ProtectedRoute><MedMngAnalytics /></ProtectedRoute>} />
                <Route path="/med-mng/settings" element={<ProtectedRoute><MedMngSettings /></ProtectedRoute>} />
                <Route path="/med-mng/community" element={<ProtectedRoute><MedMngCommunity /></ProtectedRoute>} />
                <Route path="/med-mng/playlists" element={<ProtectedRoute><MedMngPlaylists /></ProtectedRoute>} />
                <Route path="/med-mng/playlists/:playlistId" element={<ProtectedRoute><MedMngPlaylistDetail /></ProtectedRoute>} />
                <Route path="/med-mng/player/:trackId" element={<ProtectedRoute><MedMngPlayer /></ProtectedRoute>} />

                {/* ⚡ AUDIT & MONITORING */}
                <Route path="/audit" element={<AuditComplete />} />
                <Route path="/audit-completeness" element={<AuditCompleteness />} />
                <Route path="/navigation-audit" element={<NavigationAuditPage />} />
                <Route path="/route-validator" element={<RouteValidator />} />
                <Route path="/monitoring" element={<MonitoringCenter />} />
                <Route path="/system-admin" element={<SystemAdmin />} />
                <Route path="/system-health" element={<SystemHealth />} />
                <Route path="/system-dashboard" element={<SystemDashboard />} />
                <Route path="/administration" element={<UltimateAdministration />} />
                <Route path="/admin-panel" element={<AdminPanel />} />

                {/* ⚡ AI & CHAT */}
                <Route path="/chat" element={<MedChat />} />
                <Route path="/ai-hub" element={<UltimateAIHub />} />

                {/* ⚡ AUTH & LEGAL */}
                <Route path="/auth" element={<MedMngLogin />} />
                <Route path="/auth/signup" element={<MedMngSignup />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                <Route path="/conditions" element={<Conditions />} />
                <Route path="/support" element={<Support />} />

                {/* ⚡ REDIRECTIONS */}
                <Route path="/med-mng" element={<Navigate to="/med-mng/dashboard" replace />} />
                <Route path="/audit-general" element={<Navigate to="/audit" replace />} />
                <Route path="/audit-edn" element={<Navigate to="/audit" replace />} />
                <Route path="/audit-complete" element={<Navigate to="/audit" replace />} />

                {/* ⚡ FALLBACK */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            
            {/* UX Toolbar - Floating bottom-right */}
            <UXToolbar />
          </GlobalErrorBoundary>
        </PageThemeProvider>
      </main>
      
      {/* Lecteur musical global */}
      <GlobalMusicPlayer />
    </div>
  );
});

AppRoutes.displayName = 'AppRoutes';

export default AppRoutes;