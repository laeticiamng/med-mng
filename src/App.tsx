import { GlobalOverflowWrapper } from "@/components/layout/GlobalOverflowWrapper";
import React, { Suspense, lazy, memo, StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { ToastProvider } from "@/components/feedback/ToastProvider";
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

// ⚡ UNIFIED ROUTES - Optimisées et nettoyées
const UnifiedPlatform = lazy(() => import("./pages/unified/UnifiedPlatform"));
const UnifiedAdmin = lazy(() => import("./pages/unified/UnifiedAdmin"));
const UnifiedAnalytics = lazy(() => import("./pages/unified/UnifiedAnalytics"));
const OptimizedPlatform = lazy(() => import("./pages/OptimizedPlatform"));
const FinalOptimizedPlatform = lazy(() => import("./pages/FinalOptimizedPlatform"));
const PlatformOptimizedDashboard = lazy(() => import("./pages/PlatformOptimizedDashboard"));

// ⚡ CORE PAGES - Essentielles
const Index = lazy(() => import("./pages/Index"));
const PlatformOverview = lazy(() => import("./pages/PlatformOverview"));
const Generator = lazy(() => import("./pages/Generator"));
const MeditationCenter = lazy(() => import("./pages/MeditationCenter"));
const PremiumDashboard = lazy(() => import("./pages/PremiumDashboard"));
const PremiumAnalytics = lazy(() => import("./pages/PremiumAnalytics"));
const PremiumCommunity = lazy(() => import("./pages/PremiumCommunity"));
const PremiumProfile = lazy(() => import("./pages/PremiumProfile"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Notifications = lazy(() => import("./pages/Notifications"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ⚡ EDN & ECOS SYSTEM
const EdnComplete = lazy(() => import("./pages/EdnComplete"));
const EdnItem = lazy(() => import("./pages/EdnItem"));
const EdnImmersive = lazy(() => import("./pages/EdnImmersive"));
const EcosIndex = lazy(() => import("./pages/EcosIndex"));
const EcosScenario = lazy(() => import("./pages/EcosScenario"));

// ⚡ MEDICAL PLATFORM
const MedicalPlatform = lazy(() => import("./pages/MedicalPlatform").then(module => ({ default: module.MedicalPlatform })));
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

// ⚡ ADMIN & MONITORING
const MonitoringCenter = lazy(() => import("./pages/MonitoringCenter"));
const SystemAdmin = lazy(() => import("./pages/SystemAdmin"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const SystemDashboard = lazy(() => import("./pages/SystemDashboard"));
const UltimateAdministration = lazy(() => import("./pages/UltimateAdministration"));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(module => ({ default: module.AdminPanel })));
const RouteValidator = lazy(() => import("./pages/RouteValidator"));

// ⚡ AUDIT & ANALYSIS
const AuditComplete = lazy(() => import("./pages/AuditComplete"));
const AuditCompleteness = lazy(() => import("./pages/AuditCompleteness"));
const NavigationAuditPage = lazy(() => import("./pages/NavigationAuditPage"));

// ⚡ CHAT & AI
const MedChat = lazy(() => import("./pages/MedChat"));
const UltimateAIHub = lazy(() => import("./pages/UltimateAIHub"));

// ⚡ LEGAL PAGES
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite"));
const Conditions = lazy(() => import("./pages/Conditions"));
const Support = lazy(() => import("./pages/Support"));

import { AuthProvider } from "./components/med-mng/AuthProvider";
import { ProtectedRoute } from "./components/med-mng/withAuth";
import { UndoRedoProvider } from '@/components/ux/UndoRedoProvider';
import { UXToolbar } from '@/components/ux/UXToolbar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SkipToMain } from '@/components/ux/AccessibilityEnhancements';
import { PageSkeleton } from "@/components/loading/SkeletonLoader";
import { PremiumNavigation } from "@/components/navigation/PremiumNavigation";

// Component to handle keyboard shortcuts inside Router context
const AppKeyboardShortcuts = memo(() => {
  useKeyboardShortcuts(); // Called inside Router context
  return null; // This component only provides keyboard functionality
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
  return (
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <HelmetProvider>
          <TooltipProvider>
            <AccessibilityProvider>
              <ViewportProvider>
                <LanguageProvider>
                  <GlobalAudioProvider>
                    <AuthProvider>
                      <ToastProvider>
                        <UndoRedoProvider>
                          <GlobalOverflowWrapper className="min-h-screen">
                            <BrowserRouter>
                              <NavigatorBridge />
                              <AppKeyboardShortcuts />
                              <UXToastProvider>
                                  <SkipToMain />
                                  <SkipLinks />
                                   <div id="app-root" className="min-h-screen flex flex-col overflow-safe" style={{ display: 'block' }}>
                                      {/* Navigation Premium Unifiée */}
                                      <PremiumNavigation />
                                     
                                     <main id="main-content" tabIndex={-1} className="flex-1 pb-20 overflow-safe">
                                      <PageThemeProvider>
                                        <GlobalErrorBoundary>
                                          <Suspense fallback={<PageSkeleton />}>
                                           <Routes>
                                             {/* ⚡ CORE ROUTES */}
                                             <Route path="/" element={<Index />} />
                              <Route path="/platform" element={<PlatformOverview />} />
                              <Route path="/features" element={<Navigate to="/platform" replace />} />
                              <Route path="/optimized" element={<OptimizedPlatform />} />
                              <Route path="/final-optimized" element={<FinalOptimizedPlatform />} />
                              <Route path="/platform-dashboard" element={<PlatformOptimizedDashboard />} />
                              <Route path="/unified" element={<UnifiedPlatform />} />
                              <Route path="/admin" element={<UnifiedAdmin />} />
                              <Route path="/analytics" element={<UnifiedAnalytics />} />
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
                                  <Sonner richColors closeButton />
                                </UXToastProvider>
                            </BrowserRouter>
                          </GlobalOverflowWrapper>
                        </UndoRedoProvider>
                      </ToastProvider>
                    </AuthProvider>
                  </GlobalAudioProvider>
                </LanguageProvider>
              </ViewportProvider>
            </AccessibilityProvider>
          </TooltipProvider>
        </HelmetProvider>
      </StrictMode>
    </QueryClientProvider>
  );
};

const App = AppWithUX;
export default App;