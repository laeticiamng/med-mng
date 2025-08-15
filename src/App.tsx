import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelpButton } from "@/components/onboarding/HelpButton";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { ViewportProvider } from "@/components/responsive/ViewportProvider";
import { SkipLinks } from "@/components/navigation/SkipLinks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { PageThemeProvider } from "@/components/layout/PageThemeProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AuthProvider } from "./components/med-mng/AuthProvider";
import { ProtectedRoute } from "./components/med-mng/withAuth";

// Pages optimisées
import IndexOptimized from "./pages/IndexOptimized";
import EdnInstant from "./pages/EdnInstant";
import EdnItemDetail from "./pages/EdnItemDetail";

// Pages existantes
import Generator from "./pages/Generator";
import Monitoring from "./pages/Monitoring";
import EcosIndex from "./pages/EcosIndex";
import EcosScenario from "./pages/EcosScenario";
import AuditComplete from "./pages/AuditComplete";
import AuditCompleteness from "./pages/AuditCompleteness";
import MngMethod from "./pages/MngMethod";
import NotFound from "./pages/NotFound";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import { MedMngLogin } from "./pages/MedMngLogin";
import { MedMngSignup } from "./pages/MedMngSignup";
import { MedMngPricing } from "./pages/MedMngPricing";
import { MedMngSubscribe } from "./pages/MedMngSubscribe";
import { MedMngCreate } from "./pages/MedMngCreate";
import { MedMngLibrary } from "./pages/MedMngLibrary";
import { MedMngPlayer } from "./pages/MedMngPlayer";
import { MedMngSuccess } from "./pages/MedMngSuccess";
import { MedMngProfile } from "./pages/MedMngProfile";
import { PlaylistManager } from "./components/playlists/PlaylistManager";
import { PlaylistDetail } from "./components/playlists/PlaylistDetail";
import { MusicAnalytics } from "./components/analytics/MusicAnalytics";
import { MedChat } from "./pages/MedChat";
import { SubscriptionTest } from "./pages/SubscriptionTest";
import LibraryPage from "./pages/LibraryPage";

// Lazy loading pour les composants non-critiques
const DynamicOnboarding = lazy(() => import("@/components/onboarding/DynamicOnboarding").then(module => ({ default: module.DynamicOnboarding })));

// Composant de redirection pour /edn-complete/:slug vers /edn/:slug
const EdnCompleteRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/edn/${slug}`} replace />;
};

// Configuration QueryClient optimisée
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
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
                        <div id="app-root" className="min-h-screen">
                          <main id="main-content" tabIndex={-1}>
                            <PageThemeProvider>
                              <ErrorBoundary>
                                <Routes>
                                  {/* Pages principales optimisées */}
                                  <Route path="/" element={<IndexOptimized />} />
                                  <Route path="/generator" element={<Generator />} />
                                  <Route path="/monitoring" element={<Monitoring />} />
                                  
                                  {/* EDN Interface Ultra-Rapide */}
                                  <Route path="/edn" element={<EdnInstant />} />
                                  <Route path="/edn/:slug" element={<EdnItemDetail />} />
                                  
                                  {/* Redirections EDN */}
                                  <Route path="/edn-complete" element={<Navigate to="/edn" replace />} />
                                  <Route path="/edn-complete/:slug" element={<EdnCompleteRedirect />} />
                                  <Route path="/edn/music-library" element={<Navigate to="/edn" replace />} />
                                  
                                  {/* ECOS */}
                                  <Route path="/ecos" element={<EcosIndex />} />
                                  <Route path="/ecos/:scenarioId" element={<EcosScenario />} />
                                  
                                  {/* Audit */}
                                  <Route path="/audit" element={<AuditComplete />} />
                                  <Route path="/audit-completeness" element={<AuditCompleteness />} />
                                  <Route path="/audit-general" element={<Navigate to="/audit" replace />} />
                                  <Route path="/audit-edn" element={<Navigate to="/audit" replace />} />
                                  <Route path="/audit-unified" element={<Navigate to="/audit" replace />} />
                                  <Route path="/audit-complete" element={<Navigate to="/audit" replace />} />
                                  
                                  {/* Pages statiques */}
                                  <Route path="/mng-method" element={<MngMethod />} />
                                  <Route path="/mentions-legales" element={<MentionsLegales />} />
                                  <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
                                  
                                  {/* Auth */}
                                  <Route path="/auth" element={<MedMngLogin />} />
                                  <Route path="/auth/signup" element={<MedMngSignup />} />
                                  <Route path="/med-mng/login" element={<MedMngLogin />} />
                                  <Route path="/med-mng/signup" element={<MedMngSignup />} />
                                  <Route path="/med-mng/pricing" element={<MedMngPricing />} />
                                  
                                  {/* Protected Routes */}
                                  <Route path="/med-mng/subscribe/:planId" element={<ProtectedRoute><MedMngSubscribe /></ProtectedRoute>} />
                                  <Route path="/med-mng/success" element={<ProtectedRoute><MedMngSuccess /></ProtectedRoute>} />
                                  <Route path="/med-mng/create" element={<ProtectedRoute><MedMngCreate /></ProtectedRoute>} />
                                  <Route path="/med-mng/library" element={<ProtectedRoute><MedMngLibrary /></ProtectedRoute>} />
                                  <Route path="/med-mng/profile" element={<ProtectedRoute><MedMngProfile /></ProtectedRoute>} />
                                  <Route path="/med-mng/player/:songId" element={<ProtectedRoute><MedMngPlayer /></ProtectedRoute>} />
                                  <Route path="/med-mng/playlists" element={<ProtectedRoute><PlaylistManager /></ProtectedRoute>} />
                                  <Route path="/med-mng/playlists/:playlistId" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
                                  <Route path="/med-mng/analytics" element={<ProtectedRoute><MusicAnalytics /></ProtectedRoute>} />
                                  
                                  {/* Chat et autres */}
                                  <Route path="/chat" element={<MedChat />} />
                                  <Route path="/test-subscriptions" element={<SubscriptionTest />} />
                                  <Route path="/library" element={<LibraryPage />} />
                                  
                                  {/* 404 */}
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </ErrorBoundary>
                            </PageThemeProvider>
                          </main>
                          
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