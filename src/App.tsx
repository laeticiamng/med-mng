import { GlobalOverflowWrapper } from "@/components/layout/GlobalOverflowWrapper";
import React, { Suspense, lazy, memo, StrictMode, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { UXToastProvider } from "@/components/feedback/UXToastProvider";
import NavigatorBridge from "@/lib/NavigatorBridge";
import { ViewportProvider } from "@/components/responsive/ViewportProvider";
import { SkipLinks } from "@/components/navigation/SkipLinks";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { PageThemeProvider } from "@/components/layout/PageThemeProvider";
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary";
import { GlobalNavigation } from "@/components/layout/GlobalNavigation";
import { GlobalMusicPlayer } from "@/components/layout/GlobalMusicPlayer";

// ⚡ CORE PAGES - Architecture unifiée et optimisée
const OptimizedIndex = lazy(() => import("./pages/OptimizedIndex"));
const PlatformOverview = lazy(() => import("./pages/PlatformOverview"));
const PlatformComplete = lazy(() => import("./pages/PlatformComplete"));
const QuickStart = lazy(() => import("./pages/QuickStart"));
const Generator = lazy(() => import("./pages/Generator"));
const ItemsCompleteness = lazy(() => import("./pages/ItemsCompleteness"));
const MeditationCenter = lazy(() => import("./pages/MeditationCenter"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
// ⚡ CONSOLIDATED PLATFORM
const ConsolidatedPlatform = lazy(() => import("./pages/ConsolidatedPlatform"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Notifications = lazy(() => import("./pages/Notifications"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ItemPage = lazy(() => import("./pages/ItemPage"));

// ⚡ ANALYTICS & DASHBOARDS - Version unifiée
const UnifiedAnalytics = lazy(() => import("./pages/unified/UnifiedAnalytics"));
const UnifiedDashboard = lazy(() => import("./pages/unified/UnifiedDashboard"));

// ⚡ COMMUNITY & SOCIAL
const Community = lazy(() => import("./pages/Community"));
const Profile = lazy(() => import("./pages/Profile"));

import { OptimizedEdnRouter } from '@/components/edn/production/OptimizedEdnRouter';
const EdnItem = lazy(() => import("./pages/EdnItem"));
const EdnImmersive = lazy(() => import("./pages/EdnImmersive"));
const EcosIndex = lazy(() => import("./pages/EcosIndex"));
const EcosScenario = lazy(() => import("./pages/EcosScenario"));
const EcosEightMinuteTemplate = lazy(() => import("./pages/ecos/EcosEightMinuteTemplate"));

// ⚡ ADMIN & MONITORING - Composants manquants
const UnifiedAdmin = lazy(() => import("./pages/unified/UnifiedAdmin"));
const MonitoringCenter = lazy(() => import("./pages/MonitoringCenter"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const AuditComplete = lazy(() => import("./pages/AuditComplete"));
const UltimateAIHub = lazy(() => import("./pages/UltimateAIHub"));

// ⚡ MEDICAL PLATFORM
const EnhancedMedicalPlatform = lazy(() => import("./pages/EnhancedMedicalPlatform"));
const MedMngLogin = lazy(() => import("./pages/MedMngLogin").then(module => ({ default: module.MedMngLogin })));
const MedMngSignup = lazy(() => import("./pages/MedMngSignup").then(module => ({ default: module.MedMngSignup })));
const MedMngPricing = lazy(() => import("./pages/MedMngPricing").then(module => ({ default: module.MedMngPricing })));
const MedMngSubscribe = lazy(() => import("./pages/MedMngSubscribe").then(module => ({ default: module.MedMngSubscribe })));
const MedMngSuccess = lazy(() => import("./pages/MedMngSuccess").then(module => ({ default: module.MedMngSuccess })));
const MedMngDashboard = lazy(() => import("./pages/med-mng/Dashboard"));
const MedMngCreate = lazy(() => import("./pages/med-mng/Create"));
const MedMngLibrary = lazy(() => import("./pages/med-mng/Library"));
const MedMngProfile = lazy(() => import("./pages/med-mng/Profile"));
const MedMngPlayer = lazy(() => import("./pages/med-mng/Player"));
const MedMngAnalytics = lazy(() => import("./pages/med-mng/Analytics"));
const MedMngSettings = lazy(() => import("./pages/med-mng/Settings"));
const MedMngCommunity = lazy(() => import("./pages/med-mng/Community"));
const MedMngPlaylists = lazy(() => import("./pages/med-mng/Playlists"));
const MedMngPlaylistDetail = lazy(() => import("./pages/med-mng/PlaylistDetail"));
const ComprehensiveDashboard = lazy(() => import("./components/med-mng/ComprehensiveDashboard").then(module => ({ default: module.ComprehensiveDashboard })));
const ComprehensivePlatform = lazy(() => import("./pages/ComprehensivePlatform"));
const UniversalPlatform = lazy(() => import("./pages/UniversalPlatform"));
const FeatureHub = lazy(() => import("./pages/FeatureHub"));
const LearningPath = lazy(() => import("./pages/LearningPath"));

// ⚡ CHAT & LEGAL & ADDITIONAL
const MedChat = lazy(() => import("./pages/MedChat"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite"));
const Conditions = lazy(() => import("./pages/Conditions"));
const Support = lazy(() => import("./pages/Support"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

import { AuthProvider } from "./components/providers/AuthProvider";
import { ProtectedRoute } from "./components/med-mng/withAuth";
import { UndoRedoProvider } from '@/components/ux/UndoRedoProvider';
import { UXToolbar } from '@/components/ux/UXToolbar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SkipToMain } from '@/components/ux/AccessibilityEnhancements';
import { PageSkeleton } from "@/components/loading/SkeletonLoader";
import PremiumGlobalNavigation from "@/components/layout/PremiumGlobalNavigation";
import AccessibilityOverlay from "@/components/premium/AccessibilityOverlay";
import { PanicOverlay } from '@/components/system/PanicOverlay';
import { usePanicMonitor } from '@/hooks/usePanicMonitor';
import { AnalyticsConsentManager } from '@/components/analytics/AnalyticsConsentManager';
import { UXOrchestrator } from '@/components/ux/UXOrchestrator';
import { SmartNavigationProvider } from '@/components/ux/SmartNavigationEnhancer';

// Component to handle keyboard shortcuts inside Router context
const AppKeyboardShortcuts = memo(() => {
  useKeyboardShortcuts(); // Called inside Router context
  return null; // This component only provides keyboard functionality
});

// Global Accessibility State
const GlobalAccessibilityProvider = memo(() => {
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  
  // Global keyboard shortcut for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setIsAccessibilityOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AccessibilityOverlay 
      isOpen={isAccessibilityOpen} 
      onClose={() => setIsAccessibilityOpen(false)} 
    />
  );
});

// Composant de redirection pour /edn-complete/:slug vers /edn/:slug
const EdnCompleteRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/edn/${slug}`} replace />;
};

// ⚡ LOADING FALLBACK optimisé pour étudiant médical
const PageLoadingFallback = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border gpu-accelerated">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary mx-auto mb-6 will-change-transform"></div>
        <div className="absolute inset-0 animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mx-auto blur-sm gpu-accelerated"></div>
        </div>
      </div>
      <p className="text-foreground font-medium text-lg mb-2 text-container break-words-normal overflow-safe">Chargement MED-MNG</p>
      <p className="text-muted-foreground text-sm text-container break-words-normal overflow-safe">Préparation de votre environnement d'apprentissage...</p>
    </div>
  </div>
));

// ⚡ OPTIMISATION QueryClient - Configuration pour performances maximales
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Pas de retry pour chargement plus rapide
      staleTime: 15 * 60 * 1000, // 15 minutes - garde données longtemps
      gcTime: 30 * 60 * 1000, // 30 minutes - cache très long
      refetchOnWindowFocus: false, // Évite requêtes inutiles
      refetchOnMount: false, // Ne pas refetch si récent
      refetchOnReconnect: false, // Pas de refetch sur reconnexion
    },
  },
});

const AppWithUX = () => {
  const panic = usePanicMonitor();

  // App rendering optimized and cleaned

  return (
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <HelmetProvider>
          <TooltipProvider>
            <UXOrchestrator>
              <AccessibilityProvider>
                <ViewportProvider>
                  <LanguageProvider>
                    <GlobalAudioProvider>
                      <AuthProvider>
                        <AnalyticsConsentManager />
                        <UndoRedoProvider>
                          <GlobalOverflowWrapper className="min-h-screen">
                            <PanicOverlay
                              state={panic.state}
                              retryCountdown={panic.retryCountdown}
                              onRetry={panic.retry}
                            />
                            <BrowserRouter>
                              <SmartNavigationProvider>
                                <NavigatorBridge />
                                <AppKeyboardShortcuts />
                                <UXToastProvider>
                                    <SkipToMain />
                                    <SkipLinks />
                                     <div id="app-root" className="min-h-screen flex flex-col overflow-safe" style={{ display: 'block' }}>
                                        {/* Navigation Premium Unifiée */}
                                        <PremiumGlobalNavigation />
                                       
                                        <main id="main-content" tabIndex={-1} className="flex-1 pb-20 overflow-safe">
                                         <PageThemeProvider>
                                           <GlobalErrorBoundary>
                                             <Suspense fallback={<PageSkeleton />}>
                                               <Routes>
                                                {/* ⚡ CORE ROUTES - Architecture propre */}
                                                <Route path="/" element={<OptimizedIndex />} />
                                                <Route path="/platform" element={<PlatformOverview />} />
                                                <Route path="/generator" element={<Generator />} />
                                                <Route path="/items" element={<ItemsCompleteness />} />
                                                <Route path="/meditation/*" element={<MeditationCenter />} />
                                                
                                                {/* ⚡ DASHBOARD & ANALYTICS - Version unifiée */}
                                                <Route path="/dashboard" element={<UnifiedDashboard />} />
                                                <Route path="/analytics" element={<UnifiedAnalytics />} />
                                                
                                                 {/* ⚡ COMMUNITY & PROFILE */}
                                                 <Route path="/community" element={<Community />} />
                                                 <Route path="/profile" element={<Profile />} />
                                                 <Route path="/platform-complete" element={<ComprehensivePlatform />} />
                                                 <Route path="/universal" element={<UniversalPlatform />} />
                                                
                                                 {/* ⚡ SUPPORT & SETTINGS */}
                                                 <Route path="/settings" element={<UserSettings />} />
                                                 <Route path="/documentation" element={<Documentation />} />
                                                <Route path="/platform-optimization" element={<ConsolidatedPlatform />} />
                                                <Route path="/admin/duplicate-analysis" element={<ConsolidatedPlatform />} />
                                                <Route path="/consolidated" element={<ConsolidatedPlatform />} />
                                                 <Route path="/help" element={<HelpCenter />} />
                                                 <Route path="/features" element={<Navigate to="/platform-complete" replace />} />
                                                 <Route path="/feature-hub" element={<FeatureHub />} />
                                                 <Route path="/learning-path" element={<LearningPath />} />

                {/* ⚡ EDN SYSTEM - Production optimisée */}
                <Route path="/edn" element={<Navigate to="/edn-production" replace />} />
                <Route path="/edn-production/*" element={
                  <Suspense fallback={<PageSkeleton />}>
                    <OptimizedEdnRouter />
                  </Suspense>
                } />
                {/* Compatibilité routes anciennes EDN */}
                <Route path="/edn/:slug" element={<Navigate to="/edn-production" replace />} />
                <Route path="/edn/:slug/immersive" element={<Navigate to="/edn-production" replace />} />
                <Route path="/edn-complete" element={<Navigate to="/edn-production" replace />} />
                <Route path="/edn-complete/:slug" element={<EdnCompleteRedirect />} />

                                               {/* ⚡ ECOS SYSTEM */}
                                               <Route path="/ecos" element={<EcosIndex />} />
                                               <Route path="/ecos/template" element={<EcosEightMinuteTemplate />} />
                                               <Route path="/ecos/:scenarioId" element={<EcosScenario />} />

                                                {/* ⚡ MEDICAL PLATFORM */}
                                                <Route path="/med-mng/login" element={<MedMngLogin />} />
                                                <Route path="/med-mng/signup" element={<MedMngSignup />} />
                                                <Route path="/med-mng/pricing" element={<MedMngPricing />} />
                                                <Route path="/med-mng/platform" element={<EnhancedMedicalPlatform />} />
                                                <Route path="/med-mng/comprehensive" element={<ComprehensiveDashboard />} />
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

                                                {/* ⚡ ADMIN & MONITORING - Architecture consolidée */}
                                                <Route path="/admin" element={<UnifiedAdmin />} />
                                                <Route path="/monitoring" element={<MonitoringCenter />} />
                                                <Route path="/system-health" element={<SystemHealth />} />
                                                <Route path="/audit" element={<AuditComplete />} />

                                               {/* ⚡ AI & CHAT */}
                                               <Route path="/chat" element={<MedChat />} />
                                               <Route path="/ai-hub" element={<UltimateAIHub />} />

                                               {/* ⚡ AUTH & LEGAL */}
                                               <Route path="/auth" element={<MedMngLogin />} />
                                               <Route path="/reset-password" element={<ResetPassword />} />
                                               <Route path="/mentions-legales" element={<MentionsLegales />} />
                                               <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                                               <Route path="/conditions" element={<Conditions />} />
                                               <Route path="/support" element={<Support />} />
                                               <Route path="/notifications" element={<Notifications />} />
                                               <Route path="/faq" element={<FAQ />} />
                                               <Route path="/quickstart" element={<QuickStart />} />

                                                {/* ⚡ 404 FALLBACK */}
                                                <Route path="*" element={<NotFound />} />
                                               </Routes>
                                             </Suspense>
                                           </GlobalErrorBoundary>
                                         </PageThemeProvider>
                                        </main>
                                       
                                         {/* Lecteur musical global */}
                                         <GlobalMusicPlayer />
                                         <GlobalAccessibilityProvider />
                                         <UXToolbar />
                                       
                                       </div>
                                      <Sonner richColors closeButton />
                                </UXToastProvider>
                              </SmartNavigationProvider>
                            </BrowserRouter>
                          </GlobalOverflowWrapper>
                        </UndoRedoProvider>
                      </AuthProvider>
                    </GlobalAudioProvider>
                  </LanguageProvider>
                </ViewportProvider>
              </AccessibilityProvider>
            </UXOrchestrator>
          </TooltipProvider>
        </HelmetProvider>
      </StrictMode>
    </QueryClientProvider>
  );
};

const App = AppWithUX;
export default App;