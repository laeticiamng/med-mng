import React, { Suspense, lazy, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelpButton } from "@/components/onboarding/HelpButton";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { ViewportProvider } from "@/components/responsive/ViewportProvider";
import { SkipLinks } from "@/components/navigation/SkipLinks";

// ⚡ LAZY LOADING - Composants chargés uniquement quand nécessaire
const DynamicOnboarding = lazy(() => import("@/components/onboarding/DynamicOnboarding").then(module => ({ default: module.DynamicOnboarding })));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { PageThemeProvider } from "@/components/layout/PageThemeProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { GlobalNavigation } from "@/components/layout/GlobalNavigation";
import { GlobalMusicPlayer } from "@/components/layout/GlobalMusicPlayer";

// ⚡ PAGES LAZY LOADED pour performances optimales
const Index = lazy(() => import("./pages/Index"));
const Generator = lazy(() => import("./pages/Generator"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const EcosIndex = lazy(() => import("./pages/EcosIndex"));
const EcosScenario = lazy(() => import("./pages/EcosScenario"));
const AuditComplete = lazy(() => import("./pages/AuditComplete"));
const MngMethod = lazy(() => import("./pages/MngMethod"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite"));
const MedMngLogin = lazy(() => import("./pages/MedMngLogin").then(module => ({ default: module.MedMngLogin })));
const MedMngSignup = lazy(() => import("./pages/MedMngSignup").then(module => ({ default: module.MedMngSignup })));
const MedMngPricing = lazy(() => import("./pages/MedMngPricing").then(module => ({ default: module.MedMngPricing })));
const MedMngSubscribe = lazy(() => import("./pages/MedMngSubscribe").then(module => ({ default: module.MedMngSubscribe })));
const MedMngCreate = lazy(() => import("./pages/MedMngCreate").then(module => ({ default: module.MedMngCreate })));
const MedMngLibrary = lazy(() => import("./pages/MedMngLibrary").then(module => ({ default: module.MedMngLibrary })));
const MedMngPlayer = lazy(() => import("./pages/MedMngPlayer").then(module => ({ default: module.MedMngPlayer })));
const MedMngSuccess = lazy(() => import("./pages/MedMngSuccess").then(module => ({ default: module.MedMngSuccess })));
const MedMngProfile = lazy(() => import("./pages/MedMngProfile").then(module => ({ default: module.MedMngProfile })));
const PlaylistManager = lazy(() => import("./components/playlists/PlaylistManager").then(module => ({ default: module.PlaylistManager })));
const PlaylistDetail = lazy(() => import("./components/playlists/PlaylistDetail").then(module => ({ default: module.PlaylistDetail })));
const MusicAnalytics = lazy(() => import("./components/analytics/MusicAnalytics").then(module => ({ default: module.MusicAnalytics })));
const MedChat = lazy(() => import("./pages/MedChat").then(module => ({ default: module.MedChat })));
const SubscriptionTest = lazy(() => import("./pages/SubscriptionTest").then(module => ({ default: module.SubscriptionTest })));
const AdminImport = lazy(() => import("./pages/AdminImport"));
const AdminAudit = lazy(() => import("./pages/AdminAudit"));
const AdminExtractEdn = lazy(() => import("./pages/AdminExtractEdn"));
const AdminCompleteProcess = lazy(() => import("./pages/AdminCompleteProcess"));
const AdminExtractEcos = lazy(() => import("./pages/AdminExtractEcos"));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(module => ({ default: module.AdminPanel })));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const EdnObjectifsExtractionPage = lazy(() => import("./pages/EdnObjectifsExtraction"));
const OicDataQualityManager = lazy(() => import("./pages/OicDataQualityManager"));
const AuditCompleteness = lazy(() => import("./pages/AuditCompleteness"));
const TestExtraction = lazy(() => import("./pages/TestExtraction"));
const EdnImmersive = lazy(() => import("./pages/EdnImmersive"));
const EdnComplete = lazy(() => import("./pages/EdnComplete"));
const EdnCompleteDetail = lazy(() => import("./pages/EdnCompleteDetail"));

import { AuthProvider } from "./components/med-mng/AuthProvider";
import { ProtectedRoute } from "./components/med-mng/withAuth";

// Composant de redirection pour /edn-complete/:slug vers /edn/:slug
const EdnCompleteRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/edn/${slug}`} replace />;
};

// ⚡ LOADING FALLBACK optimisé
const PageLoadingFallback = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-sm">Chargement...</p>
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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <ViewportProvider>
          <LanguageProvider>
            <GlobalAudioProvider>
              <AuthProvider>
                <ToastProvider>
                  <TooltipProvider>
                    <HelmetProvider>
                      <BrowserRouter>
                        <SkipLinks />
                        <div id="app-root" className="min-h-screen flex flex-col">
                          {/* Navigation globale */}
                          <GlobalNavigation />
                          
                          <main id="main-content" tabIndex={-1} className="flex-1 pb-20">
                            <PageThemeProvider>
                              <ErrorBoundary>
                                <Suspense fallback={<PageLoadingFallback />}>
                                  <Routes>
                                    <Route path="/" element={<Index />} />
                                    <Route path="/generator" element={<Generator />} />
                                    <Route path="/monitoring" element={<Monitoring />} />
                                    
                                     {/* EDN Interface Unifiée */}
                                     <Route path="/edn" element={<EdnComplete />} />
                                     <Route path="/edn/:slug" element={<EdnCompleteDetail />} />
                                    
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
                                    <Route path="/auth" element={<MedMngLogin />} />
                                    <Route path="/auth/signup" element={<MedMngSignup />} />
                                    <Route path="/med-mng/login" element={<MedMngLogin />} />
                                    <Route path="/med-mng/signup" element={<MedMngSignup />} />
                                    <Route path="/med-mng/pricing" element={<MedMngPricing />} />
                                    <Route path="/med-mng/subscribe/:planId" element={<ProtectedRoute><MedMngSubscribe /></ProtectedRoute>} />
                                    <Route path="/med-mng/success" element={<ProtectedRoute><MedMngSuccess /></ProtectedRoute>} />
                                    <Route path="/med-mng/create" element={<ProtectedRoute><MedMngCreate /></ProtectedRoute>} />
                                    <Route path="/med-mng/library" element={<ProtectedRoute><MedMngLibrary /></ProtectedRoute>} />
                                    <Route path="/med-mng/profile" element={<ProtectedRoute><MedMngProfile /></ProtectedRoute>} />
                                    <Route path="/med-mng/player/:songId" element={<ProtectedRoute><MedMngPlayer /></ProtectedRoute>} />
                                    <Route path="/med-mng/playlists" element={<ProtectedRoute><PlaylistManager /></ProtectedRoute>} />
                                    <Route path="/med-mng/playlists/:playlistId" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
                                    <Route path="/med-mng/analytics" element={<ProtectedRoute><MusicAnalytics /></ProtectedRoute>} />
                                    <Route path="/chat" element={<MedChat />} />
                                    
                                    <Route path="/system-health" element={<SystemHealth />} />
                                    <Route path="/admin/import" element={<AdminImport />} />
                                    <Route path="/admin/audit" element={<AdminAudit />} />
                                    <Route path="/admin/extract-edn" element={<AdminExtractEdn />} />
                                    <Route path="/admin/extract-ecos" element={<AdminExtractEcos />} />
                                    <Route path="/admin/extract-objectifs" element={<EdnObjectifsExtractionPage />} />
                                    <Route path="/admin/oic-quality" element={<OicDataQualityManager />} />
                                    <Route path="/admin/complete" element={<AdminCompleteProcess />} />
                                    <Route path="/admin-panel" element={<AdminPanel />} />
                                    
                                    <Route path="/test-subscriptions" element={<SubscriptionTest />} />
                                    <Route path="/library" element={<LibraryPage />} />
                                    <Route path="/test-extraction" element={<TestExtraction />} />
                                    <Route path="*" element={<NotFound />} />
                                  </Routes>
                                </Suspense>
                              </ErrorBoundary>
                            </PageThemeProvider>
                          </main>
                        
                          {/* Lecteur musical global */}
                          <GlobalMusicPlayer />
                        
                          {/* Global UI Components - LAZY LOADED */}
                          <Suspense fallback={null}>
                            <DynamicOnboarding />
                          </Suspense>
                          <HelpButton />
                        </div>
                        <Toaster />
                        <Sonner />
                      </BrowserRouter>
                    </HelmetProvider>
                  </TooltipProvider>
                </ToastProvider>
              </AuthProvider>
            </GlobalAudioProvider>
          </LanguageProvider>
        </ViewportProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
};

export default App;