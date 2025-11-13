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
import { CookieBanner } from "@/components/common/CookieBanner";
import { Bell } from 'lucide-react';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { Footer } from '@/components/layout/Footer';
import { InternationalizationProvider } from '@/contexts/InternationalizationContext';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { AccessibilityCenter } from '@/components/accessibility/AccessibilityCenter';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { usePWAMetrics } from '@/hooks/usePWAMetrics';
import DesignSystemDevTools from '@/components/devtools/DesignSystemDevTools';
import { ROUTE_PATHS } from '@/config/routes';

// ⚡ LAZY LOADING - Composants non-critiques chargés à la demande
const DynamicOnboarding = lazy(() => import("@/components/onboarding/DynamicOnboarding").then(module => ({
  default: module.DynamicOnboarding
})));
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { AuthProvider } from "./components/med-mng/AuthProvider";
import { ProtectedRoute } from "./components/med-mng/withAuth";
import { AdminRoute } from "./components/auth/AdminRoute";

// ⚡ CRITICAL PAGES - Chargement immédiat
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// 🎵 EDN PAGES - Lazy loaded
const EdnComplete = lazy(() => import("./pages/EdnComplete"));
const EdnImmersive = lazy(() => import("./pages/EdnImmersive"));
const EdnMusicLibrary = lazy(() => import("./pages/EdnMusicLibrary"));
const EdnAuditDashboard = lazy(() => import("./pages/EdnAuditDashboard").then(m => ({ default: m.EdnAuditDashboard })));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const ShareTestPage = lazy(() => import("./pages/ShareTestPage"));
const AuditPage = lazy(() => import("./pages/AuditPage"));

// 🎯 ECOS PAGES - Lazy loaded
const EcosIndex = lazy(() => import("./pages/EcosIndex"));
const EcosScenario = lazy(() => import("./pages/EcosScenario"));

// 🔒 SECURITY PAGES - Lazy loaded
const SecurityMonitoring = lazy(() => import("./pages/SecurityMonitoring"));
const RLSDocumentation = lazy(() => import("./pages/RLSDocumentation"));

// 👨‍💼 ADMIN PAGES - Lazy loaded
const AdminIndex = lazy(() => import("./pages/AdminIndex").then(m => ({ default: m.AdminIndex })));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(m => ({ default: m.AdminPanel })));
const AdminImport = lazy(() => import("./pages/AdminImport"));
const AdminAudit = lazy(() => import("./pages/AdminAudit"));
const AdminExtractEdn = lazy(() => import("./pages/AdminExtractEdn"));
const AdminExtractEcos = lazy(() => import("./pages/AdminExtractEcos"));
const AdminCompleteProcess = lazy(() => import("./pages/AdminCompleteProcess"));
const EdnObjectifsExtractionPage = lazy(() => import("./pages/EdnObjectifsExtraction"));
const OicDataQualityManager = lazy(() => import("./pages/OicDataQualityManager"));

// 🏥 MEDMNG PAGES - Lazy loaded
const MedMngLogin = lazy(() => import("./pages/MedMngLogin").then(m => ({ default: m.MedMngLogin })));
const MedMngSignup = lazy(() => import("./pages/MedMngSignup").then(m => ({ default: m.MedMngSignup })));
const MedMngPricing = lazy(() => import("./pages/MedMngPricing").then(m => ({ default: m.MedMngPricing })));
const MedMngSubscribe = lazy(() => import("./pages/MedMngSubscribe").then(m => ({ default: m.MedMngSubscribe })));
const MedMngSuccess = lazy(() => import("./pages/MedMngSuccess").then(m => ({ default: m.MedMngSuccess })));
const MedMngCreate = lazy(() => import("./pages/MedMngCreate").then(m => ({ default: m.MedMngCreate })));
const MedMngLibrary = lazy(() => import("./pages/MedMngLibrary").then(m => ({ default: m.MedMngLibrary })));
const MedMngProfile = lazy(() => import("./pages/MedMngProfile").then(m => ({ default: m.MedMngProfile })));
const MedMngPlayer = lazy(() => import("./pages/MedMngPlayer").then(m => ({ default: m.MedMngPlayer })));
const PlaylistManager = lazy(() => import("./components/playlists/PlaylistManager").then(m => ({ default: m.PlaylistManager })));
const PlaylistDetail = lazy(() => import("./components/playlists/PlaylistDetail").then(m => ({ default: m.PlaylistDetail })));
const MusicAnalytics = lazy(() => import("./components/analytics/MusicAnalytics").then(m => ({ default: m.MusicAnalytics })));
const MedChat = lazy(() => import("./pages/MedChat").then(m => ({ default: m.MedChat })));

// 📊 AUDIT PAGES - Lazy loaded
const AuditComplete = lazy(() => import("./pages/AuditComplete"));
const AuditCompleteness = lazy(() => import("./pages/AuditCompleteness"));
const MigrationDashboardPage = lazy(() => import("./pages/MigrationDashboard"));

// ⚙️ PLATFORM PAGES - Lazy loaded
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ModularDashboard = lazy(() => import("./pages/ModularDashboard"));
const LearningDashboard = lazy(() => import("./pages/LearningDashboard"));
const PlatformStatusPage = lazy(() => import("./pages/PlatformStatusPage"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
const SystemManagement = lazy(() => import("./pages/SystemManagement"));
const PlatformSettings = lazy(() => import("./pages/PlatformSettings"));
const OptimizedIndex = lazy(() => import("./pages/OptimizedIndex"));
const AccessibilityDashboard = lazy(() => import("./pages/AccessibilityDashboard"));
const EffectivenessDashboard = lazy(() => import("./pages/EffectivenessDashboard"));

// 📚 CONTENT PAGES - Lazy loaded
const Generator = lazy(() => import("./pages/Generator"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const MngMethod = lazy(() => import("./pages/MngMethod"));
const Statistics = lazy(() => import("./pages/Statistics"));
const StudyPlanner = lazy(() => import("./pages/StudyPlanner"));
const CommunityHub = lazy(() => import("./pages/CommunityHub"));
const ModernHomepage = lazy(() => import("./pages/ModernHomepage"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Favorites = lazy(() => import("./pages/Favorites"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const PWAAnalytics = lazy(() => import("./pages/PWAAnalytics"));

// 🛒 STORE PAGES - Lazy loaded
const Store = lazy(() => import("./pages/Store"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));

// 📄 LEGAL PAGES - Lazy loaded
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite"));
const CGU = lazy(() => import("./pages/CGU"));
const DeclarationAccessibilite = lazy(() => import("./pages/DeclarationAccessibilite"));
const MesDonneesRGPD = lazy(() => import("./pages/MesDonneesRGPD"));
const InstallPWA = lazy(() => import("./pages/InstallPWA"));
const DesignSystemPage = lazy(() => import("./pages/DesignSystem"));

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
  
  // Tracker les métriques PWA automatiquement
  usePWAMetrics();
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="med-mng-ui-theme">
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
        <Route path={ROUTE_PATHS.modularDashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ModularDashboard /></Suspense>} />
           <Route path={ROUTE_PATHS.dashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Dashboard /></Suspense>} />
           <Route path={ROUTE_PATHS.learningDashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><LearningDashboard /></Suspense>} />
           <Route path={ROUTE_PATHS.platformStatus} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PlatformStatusPage /></Suspense>} />
           <Route path={ROUTE_PATHS.monitoring} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Monitoring /></Suspense>} />
           <Route path={ROUTE_PATHS.systemManagement} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><SystemManagement /></Suspense>} />
          <Route path={ROUTE_PATHS.platformSettings} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PlatformSettings /></Suspense>} />
          <Route path={ROUTE_PATHS.optimizedIndex} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><OptimizedIndex /></Suspense>} />
          <Route path={ROUTE_PATHS.sitemap} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Sitemap /></Suspense>} />
          <Route path={ROUTE_PATHS.shareTest} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ShareTestPage /></Suspense>} />
          <Route path="/audit-security" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AuditPage /></Suspense>} />
          <Route path={ROUTE_PATHS.home} element={<Index />} />
          <Route path={ROUTE_PATHS.generator} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Generator /></Suspense>} />
          {/* EDN Interface Unifiée - toutes les fonctionnalités fusionnées */}
          <Route path={ROUTE_PATHS.ednComplete} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EdnComplete /></Suspense>} />
          <Route path={ROUTE_PATHS.ednCompleteDetail} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EdnComplete /></Suspense>} />
          
          {/* Redirections vers l'interface unifiée */}
          <Route path={ROUTE_PATHS.ednLegacy} element={<Navigate to={ROUTE_PATHS.ednComplete} replace />} />
          <Route path={ROUTE_PATHS.ednLegacyWithSlug} element={<Navigate to={ROUTE_PATHS.ednCompleteDetail} replace />} />
          <Route path={ROUTE_PATHS.ednItemsLegacy} element={<Navigate to={ROUTE_PATHS.ednComplete} replace />} />
          <Route path={ROUTE_PATHS.ednImmersive} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EdnImmersive /></Suspense>} />
          <Route path={ROUTE_PATHS.ednMusicLibrary} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EdnMusicLibrary /></Suspense>} />
          <Route path={ROUTE_PATHS.ecosIndex} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EcosIndex /></Suspense>} />
          <Route path={ROUTE_PATHS.ecosScenario} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EcosScenario /></Suspense>} />
          <Route path={ROUTE_PATHS.store} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Store /></Suspense>} />
          <Route path={ROUTE_PATHS.productDetail} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ProductDetail /></Suspense>} />
          
          {/* Unified audit page */}
          <Route path={ROUTE_PATHS.audit} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AuditComplete /></Suspense>} />
          <Route path={ROUTE_PATHS.auditCompleteness} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AuditCompleteness /></Suspense>} />
          <Route path={ROUTE_PATHS.migrationDashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MigrationDashboardPage /></Suspense>} />
         
          {/* Redirect all old audit routes to new unified page */}
          <Route path={ROUTE_PATHS.auditGeneral} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
          <Route path={ROUTE_PATHS.auditEdn} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
          <Route path={ROUTE_PATHS.auditUnified} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
          <Route path={ROUTE_PATHS.auditIc1} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
          <Route path={ROUTE_PATHS.auditIc2} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
          <Route path={ROUTE_PATHS.auditIc4} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
          <Route path={ROUTE_PATHS.auditCompleteLegacy} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
          
          <Route path={ROUTE_PATHS.mngMethod} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MngMethod /></Suspense>} />
          <Route path={ROUTE_PATHS.mentionsLegales} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MentionsLegales /></Suspense>} />
          <Route path={ROUTE_PATHS.politiqueConfidentialite} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PolitiqueConfidentialite /></Suspense>} />
          <Route path={ROUTE_PATHS.cgu} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CGU /></Suspense>} />
          <Route path={ROUTE_PATHS.declarationAccessibilite} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DeclarationAccessibilite /></Suspense>} />
          <Route path={ROUTE_PATHS.medMngLogin} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MedMngLogin /></Suspense>} />
          <Route path={ROUTE_PATHS.medMngSignup} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MedMngSignup /></Suspense>} />
          <Route path={ROUTE_PATHS.medMngPricing} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MedMngPricing /></Suspense>} />
          <Route path={ROUTE_PATHS.medMngSubscribe} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MedMngSubscribe /></Suspense></ProtectedRoute>} />
          <Route path={ROUTE_PATHS.medMngSuccess} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MedMngSuccess /></Suspense></ProtectedRoute>} />
          <Route path={ROUTE_PATHS.medMngCreate} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MedMngCreate /></Suspense></ProtectedRoute>} />
          <Route path={ROUTE_PATHS.medMngLibrary} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MedMngLibrary /></Suspense></ProtectedRoute>} />
          <Route path={ROUTE_PATHS.medMngProfile} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MedMngProfile /></Suspense></ProtectedRoute>} />
          <Route path={ROUTE_PATHS.medMngPlayer} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MedMngPlayer /></Suspense></ProtectedRoute>} />
          <Route path={ROUTE_PATHS.medMngPlaylists} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PlaylistManager /></Suspense></ProtectedRoute>} />
          <Route path={ROUTE_PATHS.medMngPlaylistDetail} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PlaylistDetail /></Suspense></ProtectedRoute>} />
          <Route path={ROUTE_PATHS.medMngAnalytics} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MusicAnalytics /></Suspense></ProtectedRoute>} />
           <Route path={ROUTE_PATHS.chat} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MedChat /></Suspense>} />
           <Route path={ROUTE_PATHS.ednAudit} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EdnAuditDashboard /></Suspense>} />
           
          {/* Routes Admin - Protégées par AdminRoute */}
            <Route path={ROUTE_PATHS.adminIndex} element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminIndex /></Suspense></AdminRoute>} />
            <Route path={ROUTE_PATHS.adminImport} element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminImport /></Suspense></AdminRoute>} />
            <Route path={ROUTE_PATHS.adminAudit} element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminAudit /></Suspense></AdminRoute>} />
            <Route path={ROUTE_PATHS.adminExtractEdn} element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminExtractEdn /></Suspense></AdminRoute>} />
            <Route path={ROUTE_PATHS.adminExtractEcos} element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminExtractEcos /></Suspense></AdminRoute>} />
            <Route path={ROUTE_PATHS.adminExtractObjectifs} element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EdnObjectifsExtractionPage /></Suspense></AdminRoute>} />
            <Route path={ROUTE_PATHS.adminOicQuality} element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><OicDataQualityManager /></Suspense></AdminRoute>} />
            <Route path={ROUTE_PATHS.adminComplete} element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminCompleteProcess /></Suspense></AdminRoute>} />
            <Route path={ROUTE_PATHS.adminPanel} element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminPanel /></Suspense></AdminRoute>} />
            <Route path={ROUTE_PATHS.library} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><LibraryPage /></Suspense>} />
             <Route path={ROUTE_PATHS.accessibilityDashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AccessibilityDashboard /></Suspense>} />
             <Route path={ROUTE_PATHS.effectivenessDashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EffectivenessDashboard /></Suspense>} />
             <Route path={ROUTE_PATHS.rlsDocumentation} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><RLSDocumentation /></Suspense>} />
             <Route path={ROUTE_PATHS.securityMonitoring} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><SecurityMonitoring /></Suspense>} />
           
           {/* Nouvelles pages complètes avec lazy loading */}
           <Route path={ROUTE_PATHS.statistics} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Statistics /></Suspense>} />
           <Route path={ROUTE_PATHS.studyPlanner} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><StudyPlanner /></Suspense>} />
           <Route path={ROUTE_PATHS.community} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CommunityHub /></Suspense>} />
            <Route path={ROUTE_PATHS.homepage} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ModernHomepage /></Suspense>} />
            <Route path={ROUTE_PATHS.achievements} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Achievements /></Suspense>} />
            <Route path={ROUTE_PATHS.favorites} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Favorites /></Suspense>} />
             <Route path={ROUTE_PATHS.settings} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><UserSettings /></Suspense>} />
             <Route path={ROUTE_PATHS.designSystem} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DesignSystemPage /></Suspense>} />
             {/* Page RGPD - DOIT être publique selon la loi */}
             <Route path={ROUTE_PATHS.mesDonneesRgpd} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MesDonneesRGPD /></Suspense>} />
            <Route path={ROUTE_PATHS.installPwa} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><InstallPWA /></Suspense>} />
            <Route path={ROUTE_PATHS.pwaAnalytics} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PWAAnalytics /></Suspense>} />
                                <Route path={ROUTE_PATHS.notFound} element={<NotFound />} />
                              </Routes>
                            </main>
                            <Footer />

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
                            
                            {/* Bannière Cookies RGPD */}
                            <CookieBanner />
                            
                            {/* DevTools pour inspection du design system */}
                            <DesignSystemDevTools />
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
    </ThemeProvider>
  );
};

export default App;
