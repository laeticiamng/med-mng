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

// ⚡ LAZY LOADING - Composants chargés uniquement quand nécessaire
const DynamicOnboarding = lazy(() => import("@/components/onboarding/DynamicOnboarding").then(module => ({ default: module.DynamicOnboarding })));
const HelpButton = lazy(() => import("@/components/onboarding/HelpButton").then(module => ({ default: module.HelpButton })));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { PageThemeProvider } from "@/components/layout/PageThemeProvider";
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary";
import { GlobalNavigation } from "@/components/layout/GlobalNavigation";
import { GlobalMusicPlayer } from "@/components/layout/GlobalMusicPlayer";

// ⚡ PAGES LAZY LOADED pour performances optimales
const Index = lazy(() => import("./pages/Index"));
const AllFeaturesPage = lazy(() => import("./pages/AllFeaturesPage"));
const Generator = lazy(() => import("./pages/Generator"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
const CompleteDashboard = lazy(() => import("./pages/CompleteDashboard"));
const SuperDashboard = lazy(() => import("./pages/SuperDashboard"));
const Analytics = lazy(() => import("./pages/Analytics").then(module => ({ default: module.Analytics })));
const Admin = lazy(() => import("./pages/Admin").then(module => ({ default: module.Admin })));
const Export = lazy(() => import("./pages/Export").then(module => ({ default: module.Export })));

const EcosIndex = lazy(() => import("./pages/EcosIndex"));
const EcosScenario = lazy(() => import("./pages/EcosScenario"));
const AuditComplete = lazy(() => import("./pages/AuditComplete"));
const MngMethod = lazy(() => import("./pages/MngMethod"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite"));
const Conditions = lazy(() => import("./pages/Conditions"));
const Support = lazy(() => import("./pages/Support"));
const OptimizationCenter = lazy(() => import("./pages/OptimizationCenter"));
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
const PlaylistManager = lazy(() => import("./components/playlists/PlaylistManager").then(module => ({ default: module.PlaylistManager })));
const PlaylistDetail = lazy(() => import("./components/playlists/PlaylistDetail").then(module => ({ default: module.PlaylistDetail })));
const MusicAnalytics = lazy(() => import("./components/analytics/MusicAnalytics").then(module => ({ default: module.MusicAnalytics })));
const MedChat = lazy(() => import("./pages/MedChat"));
const AdminImport = lazy(() => import("./pages/AdminImport"));
const AdminAudit = lazy(() => import("./pages/AdminAudit"));
const AdminExtractEdn = lazy(() => import("./pages/AdminExtractEdn"));
const AdminCompleteProcess = lazy(() => import("./pages/AdminCompleteProcess"));
const AdminExtractEcos = lazy(() => import("./pages/AdminExtractEcos"));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(module => ({ default: module.AdminPanel })));
const ContentQualityDashboard = lazy(() => import("./components/admin/ContentQualityDashboard").then(module => ({ default: module.ContentQualityDashboard })));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const EdnObjectifsExtractionPage = lazy(() => import("./pages/EdnObjectifsExtraction"));
const OicDataQualityManager = lazy(() => import("./pages/OicDataQualityManager"));
const AuditCompleteness = lazy(() => import("./pages/AuditCompleteness"));
// Development-only components
const UXValidationDashboard = lazy(() => import("./components/validation/UXValidationDashboard").then(module => ({ default: module.UXValidationDashboard })));
const EdnImmersive = lazy(() => import("./pages/EdnImmersive"));
const EdnComplete = lazy(() => import("./pages/EdnComplete"));
const EdnItem = lazy(() => import("./pages/EdnItem"));
const PlatformOverview = lazy(() => import("./pages/PlatformOverview"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Community = lazy(() => import("./pages/Community"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));

import { AuthProvider } from "./components/med-mng/AuthProvider";
import { ProtectedRoute } from "./components/med-mng/withAuth";

// UX Integration - Components for 100% UX Score
import { UndoRedoProvider } from '@/components/ux/UndoRedoProvider';
import { UXToolbar } from '@/components/ux/UXToolbar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SkipToMain } from '@/components/ux/AccessibilityEnhancements';
import { DevTools } from '@/components/DevTools';

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
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 gpu-accelerated">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200/30 border-t-purple-400 mx-auto mb-6 will-change-transform"></div>
        <div className="absolute inset-0 animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full mx-auto blur-sm gpu-accelerated"></div>
        </div>
      </div>
      <p className="text-white font-medium text-lg mb-2">Chargement MED-MNG</p>
      <p className="text-gray-300 text-sm">Préparation de votre environnement d'apprentissage...</p>
    </div>
  </div>
));

// Import skeleton loader
import { PageSkeleton } from "@/components/loading/SkeletonLoader";
import { UniversalNavBar } from "@/components/navigation/UniversalNavBar";

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
                          <BrowserRouter>
                            <NavigatorBridge />
                            <AppKeyboardShortcuts />
                            <UXToastProvider>
                                <SkipToMain />
                                <SkipLinks />
                                 <div id="app-root" className="min-h-screen flex flex-col" style={{ display: 'block' }}>
                                   {/* Navigation universelle */}
                                   <UniversalNavBar />
                                   
                                   <main id="main-content" tabIndex={-1} className="flex-1 pb-20">
                                    <PageThemeProvider>
                                      <GlobalErrorBoundary>
                                        <Suspense fallback={<PageSkeleton />}>
                                          <Routes>
                                                <Route path="/" element={<Index />} />
                                                 <Route path="/platform" element={<PlatformOverview />} />
                                                 <Route path="/features" element={<AllFeaturesPage />} />
                                                <Route path="/generator" element={<Generator />} />
                                                <Route path="/monitoring" element={<Monitoring />} />
                                                <Route path="/analytics" element={<Analytics />} />
                                                <Route path="/dashboard" element={<SuperDashboard />} />
                                                <Route path="/optimization" element={<OptimizationCenter />} />
                                             <Route path="/admin" element={<Admin />} />
                                             <Route path="/export" element={<Export />} />
                                             <Route path="/settings" element={<UserSettings />} />
                                             <Route path="/documentation" element={<Documentation />} />
                                             <Route path="/community" element={<Community />} />
                                             <Route path="/profile" element={<Profile />} />
                                             <Route path="/notifications" element={<Notifications />} />
                                             <Route path="/faq" element={<FAQ />} />
                                             <Route path="/help" element={<HelpCenter />} />
                                            
                                            {/* EDN Interface Unifiée */}
                                            <Route path="/edn" element={<EdnComplete />} />
                                            <Route path="/edn/:slug" element={<EdnItem />} />
                                            
                                            {/* Redirections automatiques vers l'interface unifiée */}
                                            <Route path="/edn-complete" element={<Navigate to="/edn" replace />} />
                                            <Route path="/edn-complete/:slug" element={<EdnCompleteRedirect />} />
                                            <Route path="/edn/:slug/immersive" element={<EdnImmersive />} />
                                            <Route path="/edn/music-library" element={<Navigate to="/edn" replace />} />
                                            
                                            <Route path="/ecos" element={<EcosIndex />} />
                                            <Route path="/ecos/:scenarioId" element={<EcosScenario />} />
                                            
                                            {/* Unified audit page */}
                                            <Route path="/audit" element={<AuditComplete />} />
                                            <Route path="/audit-completeness" element={<AuditCompleteness />} />
                                           
                                            {/* Redirect all old audit routes to new unified page */}
                                            <Route path="/audit-general" element={<Navigate to="/audit" replace />} />
                                            <Route path="/audit-edn" element={<Navigate to="/audit" replace />} />
                                            <Route path="/audit-unified" element={<Navigate to="/audit" replace />} />
                                            <Route path="/audit-ic1" element={<Navigate to="/audit" replace />} />
                                            <Route path="/audit-ic2" element={<Navigate to="/audit" replace />} />
                                            <Route path="/audit-ic4" element={<Navigate to="/audit" replace />} />
                                            <Route path="/audit-complete" element={<Navigate to="/audit" replace />} />
                                            
                                            <Route path="/mng-method" element={<MngMethod />} />
                                            <Route path="/mentions-legales" element={<MentionsLegales />} />
                                            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                                            <Route path="/conditions" element={<Conditions />} />
                                            <Route path="/support" element={<Support />} />
                                            <Route path="/auth" element={<MedMngLogin />} />
                                            <Route path="/auth/signup" element={<MedMngSignup />} />
                                            <Route path="/med-mng/login" element={<MedMngLogin />} />
                                            <Route path="/med-mng/signup" element={<MedMngSignup />} />
                                             <Route path="/med-mng/pricing" element={<MedMngPricing />} />
                                             <Route path="/med-mng/subscribe/:planId" element={<ProtectedRoute><MedMngSubscribe /></ProtectedRoute>} />
                                             <Route path="/med-mng/success" element={<ProtectedRoute><MedMngSuccess /></ProtectedRoute>} />
                                             <Route path="/med-mng/create" element={<ProtectedRoute><MedMngCreate /></ProtectedRoute>} />
                                             <Route path="/med-mng/library" element={<ProtectedRoute><MedMngLibrary /></ProtectedRoute>} />
                                             <Route path="/med-mng/dashboard" element={<ProtectedRoute><MedMngDashboard /></ProtectedRoute>} />
                                             <Route path="/med-mng/profile" element={<ProtectedRoute><MedMngProfile /></ProtectedRoute>} />
                                             <Route path="/med-mng/analytics" element={<ProtectedRoute><MedMngAnalytics /></ProtectedRoute>} />
                                             <Route path="/med-mng/settings" element={<ProtectedRoute><MedMngSettings /></ProtectedRoute>} />
                                             <Route path="/med-mng/community" element={<ProtectedRoute><MedMngCommunity /></ProtectedRoute>} />
                                             <Route path="/med-mng/playlists" element={<ProtectedRoute><MedMngPlaylists /></ProtectedRoute>} />
                                             <Route path="/med-mng/playlists/:playlistId" element={<ProtectedRoute><MedMngPlaylistDetail /></ProtectedRoute>} />
                                             <Route path="/med-mng/player/:trackId" element={<ProtectedRoute><MedMngPlayer /></ProtectedRoute>} />
                                            <Route path="/chat" element={<MedChat />} />
                                            
                                            <Route path="/system-health" element={<SystemHealth />} />
                                            <Route path="/content-quality" element={<ContentQualityDashboard />} />
                                            <Route path="/admin/import" element={<AdminImport />} />
                                            <Route path="/admin/audit" element={<AdminAudit />} />
                                            <Route path="/admin/extract-edn" element={<AdminExtractEdn />} />
                                            <Route path="/admin/extract-ecos" element={<AdminExtractEcos />} />
                                            <Route path="/admin/extract-objectifs" element={<EdnObjectifsExtractionPage />} />
                                            <Route path="/admin/oic-quality" element={<OicDataQualityManager />} />
                                            <Route path="/admin/complete" element={<AdminCompleteProcess />} />
                                             <Route path="/admin-panel" element={<AdminPanel />} />
                                             
                                             {/* Routes de gestion avancées */}
                                             <Route path="/system-health" element={<SystemHealth />} />
                                             <Route path="/content-quality" element={<ContentQualityDashboard />} />
                                             <Route path="/monitoring-center" element={<MonitoringCenter />} />
                                             
                                             {/* Routes de redirection pour éviter 404 */}
                                             <Route path="/med-mng" element={<Navigate to="/med-mng/dashboard" replace />} />
                                             <Route path="/platform-overview" element={<Navigate to="/platform" replace />} />
                                             <Route path="/complete-dashboard" element={<Navigate to="/dashboard" replace />} />
                                             <Route path="/library" element={<Navigate to="/med-mng/library" replace />} />
                                             <Route path="/music-library" element={<Navigate to="/med-mng/library" replace />} />
                                             
                                             {/* Development/Admin Test Routes (conditional) */}
                                             {process.env.NODE_ENV === 'development' && (
                                               <>
                                                 <Route path="/validation-ux" element={<UXValidationDashboard />} />
                                               </>
                                             )}
                                              
                                             {/* Fallback 404 avec suggestions intelligentes */}
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
                                
                                  {/* Global UI Components - LAZY LOADED */}
                                  <Suspense fallback={null}>
                                    <DynamicOnboarding />
                                  </Suspense>
                                  <Suspense fallback={null}>
                                    <HelpButton />
                                  </Suspense>
                                  
                                  {/* Dev Tools - Development environment only */}
                                  {process.env.NODE_ENV === 'development' && <DevTools />}
                                </div>
                                <Sonner richColors closeButton />
                              </UXToastProvider>
                          </BrowserRouter>
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