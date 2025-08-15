import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelpButton } from "@/components/onboarding/HelpButton";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { ViewportProvider } from "@/components/responsive/ViewportProvider";
import { SkipLinks } from "@/components/navigation/SkipLinks";

// ⚡ LAZY LOADING - Composants non-critiques chargés à la demande
const DynamicOnboarding = lazy(() => import("@/components/onboarding/DynamicOnboarding").then(module => ({ default: module.DynamicOnboarding })));
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { PageThemeProvider } from "@/components/layout/PageThemeProvider";
import Index from "./pages/Index";
import Generator from "./pages/Generator";
import Monitoring from "./pages/Monitoring";
import LibraryPage from "./pages/LibraryPage";
// Pages EDN fusionnées dans EdnComplete

import EcosIndex from "./pages/EcosIndex";
import EcosScenario from "./pages/EcosScenario";
import AuditComplete from "./pages/AuditComplete";
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
import { AuthProvider } from "./components/med-mng/AuthProvider";
import { ProtectedRoute } from "./components/med-mng/withAuth";
import { MedMngSuccess } from "./pages/MedMngSuccess";
import { MedMngProfile } from "./pages/MedMngProfile";
import { PlaylistManager } from "./components/playlists/PlaylistManager";
import { PlaylistDetail } from "./components/playlists/PlaylistDetail";
import { MusicAnalytics } from "./components/analytics/MusicAnalytics";
import { MedChat } from "./pages/MedChat";
import { SubscriptionTest } from "./pages/SubscriptionTest";
import AdminImport from "./pages/AdminImport";
import AdminAudit from "./pages/AdminAudit";
import AdminExtractEdn from "./pages/AdminExtractEdn";
import AdminCompleteProcess from "./pages/AdminCompleteProcess";
import AdminExtractEcos from "./pages/AdminExtractEcos";
import { AdminPanel } from "./pages/AdminPanel"; // Nouveau panel admin unifié Point X
import EdnObjectifsExtractionPage from "./pages/EdnObjectifsExtraction";
import OicDataQualityManager from "./pages/OicDataQualityManager";
import AuditCompleteness from "./pages/AuditCompleteness";
import TestExtraction from "./pages/TestExtraction";
import EdnImmersive from "./pages/EdnImmersive";
import EdnCompleteFast from "./pages/EdnComplete.fast";
import EdnCompleteOptimized from "./pages/EdnComplete.optimized";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Composant de redirection pour /edn-complete/:slug vers /edn/:slug
const EdnCompleteRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/edn/${slug}`} replace />;
};

// ⚡ OPTIMISATION QueryClient - Configuration pour chargement rapide
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Pas de retry au chargement initial pour plus de rapidité
      staleTime: 10 * 60 * 1000, // 10 minutes - Garde les données plus longtemps
      gcTime: 15 * 60 * 1000, // 15 minutes - Garde en cache plus longtemps
      refetchOnWindowFocus: false, // Évite les requêtes inutiles
      refetchOnMount: false, // Ne pas refetch si les données sont récentes
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
            <Route path="/" element={<Index />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/monitoring" element={<Monitoring />} />
            {/* EDN Interface Unifiée - toutes les fonctionnalités fusionnées */}
            <Route path="/edn" element={<EdnCompleteOptimized />} />
            <Route path="/edn/:slug" element={<EdnCompleteFast />} />
            
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
             <Route path="/admin/import" element={<AdminImport />} />
             <Route path="/admin/audit" element={<AdminAudit />} />
             <Route path="/admin/extract-edn" element={<AdminExtractEdn />} />
             <Route path="/admin/extract-ecos" element={<AdminExtractEcos />} />
             <Route path="/admin/extract-objectifs" element={<EdnObjectifsExtractionPage />} />
             <Route path="/admin/oic-quality" element={<OicDataQualityManager />} />
             <Route path="/admin/complete" element={<AdminCompleteProcess />} />
             <Route path="/admin-panel" element={<AdminPanel />} /> {/* Panel admin unifié Point X */}
            <Route path="/test-subscriptions" element={<SubscriptionTest />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/test-extraction" element={<TestExtraction />} />
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