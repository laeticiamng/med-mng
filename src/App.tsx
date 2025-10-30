import React, { Suspense, lazy, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelmetProvider } from "react-helmet-async";
import { HelpButton } from "@/components/onboarding/HelpButton";
import { ViewportProvider } from "@/components/responsive/ViewportProvider";
import { SkipLinks } from "@/components/navigation/SkipLinks";
import { HelpCenter } from "@/components/help/HelpCenter";
import { NotificationSystem } from "@/components/advanced/NotificationSystem";
import { KeyboardShortcuts } from "@/components/advanced/KeyboardShortcuts";
import { Bell } from 'lucide-react';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { InternationalizationProvider } from '@/contexts/InternationalizationContext';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { AccessibilityCenter } from '@/components/accessibility/AccessibilityCenter';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';

// ⚡ LAZY LOADING - Composants non-critiques chargés à la demande
const DynamicOnboarding = lazy(() => import("@/components/onboarding/DynamicOnboarding").then(module => ({
  default: module.DynamicOnboarding
})));
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import PlatformSettings from "./pages/PlatformSettings";
import Dashboard from "./pages/Dashboard";
import SystemManagement from "./pages/SystemManagement";
import OptimizedIndex from "./pages/OptimizedIndex";
import ModularDashboard from "./pages/ModularDashboard";
import Index from "./pages/Index";
import Generator from "./pages/Generator";
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
import { EdnAuditDashboard } from "./pages/EdnAuditDashboard";
import AdminImport from "./pages/AdminImport";
import AdminAudit from "./pages/AdminAudit";
import AdminExtractEdn from "./pages/AdminExtractEdn";
import AdminCompleteProcess from "./pages/AdminCompleteProcess";
import AdminExtractEcos from "./pages/AdminExtractEcos";
import { AdminPanel } from "./pages/AdminPanel";
import EdnObjectifsExtractionPage from "./pages/EdnObjectifsExtraction";
import OicDataQualityManager from "./pages/OicDataQualityManager";
import AuditCompleteness from "./pages/AuditCompleteness";
import EdnImmersive from "./pages/EdnImmersive";
import EdnComplete from "./pages/EdnComplete";
import EdnMusicLibrary from "./pages/EdnMusicLibrary";
import LearningDashboard from "./pages/LearningDashboard";
import PlatformStatusPage from "./pages/PlatformStatusPage";
import Monitoring from "./pages/Monitoring";

// Nouvelles pages complètes avec lazy loading
const Statistics = lazy(() => import("./pages/Statistics"));
const StudyPlanner = lazy(() => import("./pages/StudyPlanner"));
const CommunityHub = lazy(() => import("./pages/CommunityHub"));
const ModernHomepage = lazy(() => import("./pages/ModernHomepage"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Favorites = lazy(() => import("./pages/Favorites"));
const UserSettings = lazy(() => import("./pages/UserSettings"));

// ⚡ OPTIMISATION QueryClient - Configuration pour chargement rapide
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      // Pas de retry au chargement initial pour plus de rapidité
      staleTime: 10 * 60 * 1000,
      // 10 minutes - Garde les données plus longtemps
      gcTime: 15 * 60 * 1000,
      // 15 minutes - Garde en cache plus longtemps
      refetchOnWindowFocus: false,
      // Évite les requêtes inutiles
      refetchOnMount: false // Ne pas refetch si les données sont récentes
    }
  }
});
const App = () => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HelmetProvider>
          <AuthProvider>
            <LanguageProvider>
              <GlobalAudioProvider>
                <TooltipProvider>
                  <ViewportProvider>
                    <AccessibilityProvider>
                      <InternationalizationProvider>
                        <PerformanceProvider>
                          <SkipLinks />
                          <div id="app-root" className="min-h-screen bg-background">
                            <MainNavigation />
                            <main id="main-content" tabIndex={-1} className="pt-16">
                              <Routes>
        <Route path="/modular-dashboard" element={<ModularDashboard />} />
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/learning-dashboard" element={<LearningDashboard />} />
           <Route path="/platform-status" element={<PlatformStatusPage />} />
           <Route path="/monitoring" element={<Monitoring />} />
           <Route path="/system-management" element={<SystemManagement />} />
          <Route path="/platform-settings" element={<PlatformSettings />} />
          <Route path="/optimized" element={<OptimizedIndex />} />
          <Route path="/" element={<Index />} />
          <Route path="/generator" element={<Generator />} />
          {/* EDN Interface Unifiée - toutes les fonctionnalités fusionnées */}
          <Route path="/edn-complete" element={<EdnComplete />} />
          <Route path="/edn-complete/:slug" element={<EdnComplete />} />
          
          {/* Redirections vers l'interface unifiée */}
          <Route path="/edn" element={<Navigate to="/edn-complete" replace />} />
          <Route path="/edn/:slug" element={<Navigate to="/edn-complete/:slug" replace />} />
          <Route path="/items-edn" element={<Navigate to="/edn-complete" replace />} />
          <Route path="/edn/:slug/immersive" element={<EdnImmersive />} />
          <Route path="/edn/music-library" element={<EdnMusicLibrary />} />
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
          <Route path="/edn-audit" element={<EdnAuditDashboard />} />
           <Route path="/admin/import" element={<AdminImport />} />
           <Route path="/admin/audit" element={<AdminAudit />} />
           <Route path="/admin/extract-edn" element={<AdminExtractEdn />} />
           <Route path="/admin/extract-ecos" element={<AdminExtractEcos />} />
           <Route path="/admin/extract-objectifs" element={<EdnObjectifsExtractionPage />} />
           <Route path="/admin/oic-quality" element={<OicDataQualityManager />} />
           <Route path="/admin/complete" element={<AdminCompleteProcess />} />
           <Route path="/admin-panel" element={<AdminPanel />} /> {/* Panel admin unifié Point X */}
            <Route path="/library" element={<LibraryPage />} />
           
           {/* Nouvelles pages complètes avec lazy loading */}
           <Route path="/statistics" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Statistics /></Suspense>} />
           <Route path="/study-planner" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><StudyPlanner /></Suspense>} />
           <Route path="/community" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CommunityHub /></Suspense>} />
            <Route path="/homepage" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ModernHomepage /></Suspense>} />
            <Route path="/achievements" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Achievements /></Suspense>} />
            <Route path="/favorites" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Favorites /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><UserSettings /></Suspense>} />
           
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </main>
                            
                            {/* Global UI Components */}
                            <HelpButton />
                            <NotificationSystem 
                              isOpen={isNotificationCenterOpen} 
                              onClose={() => setIsNotificationCenterOpen(false)} 
                            />
                            {isHelpCenterOpen && <HelpCenter />}
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setIsNotificationCenterOpen(true)} 
                              className="fixed bottom-4 right-4 z-40 my-[36px]"
                            >
                              <Bell className="w-4 h-4 mr-2" />
                              Notifications
                            </Button>
                            
                            {/* Raccourcis Clavier Globaux */}
                            <KeyboardShortcuts />
                            
                            {/* Centre d'Accessibilité */}
                            <AccessibilityCenter />
                          </div>
                          <Toaster />
                          <Sonner />
                        </PerformanceProvider>
                      </InternationalizationProvider>
                    </AccessibilityProvider>
                  </ViewportProvider>
                </TooltipProvider>
              </GlobalAudioProvider>
            </LanguageProvider>
          </AuthProvider>
        </HelmetProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
export default App;