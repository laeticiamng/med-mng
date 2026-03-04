// App.tsx - Force rebuild v2026.02.06
import { AccessibilityCenter } from '@/components/accessibility/AccessibilityCenter';
import { KeyboardShortcuts } from "@/components/advanced/KeyboardShortcuts";
import { NotificationSystem } from "@/components/advanced/NotificationSystem";
import { EnhancedAITutor } from '@/components/ai/EnhancedAITutor';
import { CookieBanner } from "@/components/common/CookieBanner";
import { PageLoader } from "@/components/common/PageLoader";
import DesignSystemDevTools from '@/components/devtools/DesignSystemDevTools';
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { LanguageSelector } from '@/components/global/LanguageSelector';
import { SkipLinks } from "@/components/navigation/SkipLinks";
import { HelpButton } from "@/components/onboarding/HelpButton";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { PersistentMiniPlayer } from "@/components/player/PersistentMiniPlayer";
import { PWAPrompt } from "@/components/pwa/PWAPrompt";
// ViewportProvider removed — using CSS media queries
import { ComposedProviders } from '@/providers/ComposedProviders';
import { Button } from "@/components/ui/button";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from "@/components/ui/toaster";

import { ROUTE_PATHS } from '@/config/routes';
import { AutoSEO } from '@/components/seo/AutoSEO';
import { GlobalJsonLd } from '@/components/seo/GlobalJsonLd';
// GlobalAudioProvider, LanguageProvider, TooltipProvider, AccessibilityProvider → ComposedProviders
import { usePWAMetrics } from '@/hooks/usePWAMetrics';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Suspense, lazy, useState, useEffect, useCallback } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AuthProvider } from "./components/med-mng/AuthProvider";
import { ProtectedRoute } from "./components/med-mng/withAuth";

// ⚡ LAZY LOADING - Composants non-critiques chargés à la demande
const AppFooter = lazy(() => import("@/components/AppFooter").then(module => ({
  default: module.AppFooter
})));

// ⚡ CRITICAL PAGES - Chargement immédiat
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// 🎵 EDN PAGES
const EdnComplete = lazy(() => import("./pages/EdnComplete"));
const EdnImmersive = lazy(() => import("./pages/EdnImmersive"));
const EdnMusicLibrary = lazy(() => import("./pages/EdnMusicLibrary"));
const EdnAuditDashboard = lazy(() => import("./pages/EdnAuditDashboard").then(m => ({ default: m.EdnAuditDashboard })));
const SRSReview = lazy(() => import("./pages/SRSReview"));
const ExamMode = lazy(() => import("./pages/ExamMode"));
const ClinicalCases = lazy(() => import("./pages/ClinicalCases"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const ProgressDashboard = lazy(() => import("./pages/ProgressDashboard"));
const SmartStudyPlanner = lazy(() => import("./pages/SmartStudyPlanner"));

// 🆕 PAGES PRIORITAIRES (actives)
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const DailyChallenges = lazy(() => import("./pages/DailyChallenges"));
const MyGoals = lazy(() => import("./pages/MyGoals"));

// 🎯 ECOS PAGES
const EcosIndex = lazy(() => import("./pages/EcosIndex"));
const EcosScenario = lazy(() => import("./pages/EcosScenario"));

// 🔒 SECURITY PAGES
const SecurityMonitoring = lazy(() => import("./pages/SecurityMonitoring"));
const RLSDocumentation = lazy(() => import("./pages/RLSDocumentation"));

// 👨‍💼 ADMIN PAGES
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(m => ({ default: m.AdminPanel })));
const AdminImport = lazy(() => import("./pages/AdminImport"));
const AdminAudit = lazy(() => import("./pages/AdminAudit"));
const AdminExtractEdn = lazy(() => import("./pages/AdminExtractEdn"));
const AdminExtractEcos = lazy(() => import("./pages/AdminExtractEcos"));
const AdminCompleteProcess = lazy(() => import("./pages/AdminCompleteProcess"));
const EdnObjectifsExtractionPage = lazy(() => import("./pages/EdnObjectifsExtraction"));
const OicDataQualityManager = lazy(() => import("./pages/OicDataQualityManager"));
const AdminExtractionQualityDashboard = lazy(() => import("./pages/AdminExtractionQualityDashboard"));

// 🏥 MEDMNG PAGES
const MedMngLogin = lazy(() => import("./pages/MedMngLogin").then(m => ({ default: m.MedMngLogin })));
const MedMngSignup = lazy(() => import("./pages/MedMngSignup").then(m => ({ default: m.MedMngSignup })));
const MedMngPricing = lazy(() => import("./pages/MedMngPricing").then(m => ({ default: m.MedMngPricing })));
const MedMngSubscribe = lazy(() => import("./pages/MedMngSubscribe").then(m => ({ default: m.MedMngSubscribe })));
const MedMngSuccess = lazy(() => import("./pages/MedMngSuccess").then(m => ({ default: m.MedMngSuccess })));
const MedMngCreate = lazy(() => import("./pages/MedMngCreate").then(m => ({ default: m.MedMngCreate })));
const MedMngResetPassword = lazy(() => import("./pages/MedMngResetPassword").then(m => ({ default: m.MedMngResetPassword })));
const MedMngLibrary = lazy(() => import("./pages/MedMngLibrary").then(m => ({ default: m.MedMngLibrary })));
const MedMngItemsLibrary = lazy(() => import("./pages/MedMngItemsLibrary").then(m => ({ default: m.MedMngItemsLibrary })));
const MedMngItemDetail = lazy(() => import("./pages/MedMngItemDetail").then(m => ({ default: m.MedMngItemDetail })));
const MedMngProfile = lazy(() => import("./pages/MedMngProfile").then(m => ({ default: m.MedMngProfile })));
const MedMngPlayer = lazy(() => import("./pages/MedMngPlayer").then(m => ({ default: m.MedMngPlayer })));
const PlaylistManager = lazy(() => import("./components/playlists/PlaylistManager").then(m => ({ default: m.PlaylistManager })));
const PlaylistDetail = lazy(() => import("./components/playlists/PlaylistDetail").then(m => ({ default: m.PlaylistDetail })));
const MusicAnalytics = lazy(() => import("./components/analytics/MusicAnalytics").then(m => ({ default: m.MusicAnalytics })));
const MedChat = lazy(() => import("./pages/MedChat").then(m => ({ default: m.MedChat })));
const MedMngProgress = lazy(() => import("./pages/MedMngProgress").then(m => ({ default: m.MedMngProgress })));
const MedMngFavorites = lazy(() => import("./pages/MedMngFavorites").then(m => ({ default: m.MedMngFavorites })));
const BillingPage = lazy(() => import("./pages/BillingPage"));

// 📊 AUDIT PAGES
const AuditComplete = lazy(() => import("./pages/AuditComplete"));
const AuditCompleteness = lazy(() => import("./pages/AuditCompleteness"));
const MigrationDashboardPage = lazy(() => import("./pages/MigrationDashboard"));

// ⚙️ PLATFORM PAGES
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ModularDashboard = lazy(() => import("./pages/ModularDashboard"));
const LearningDashboard = lazy(() => import("./pages/LearningDashboard"));
const PlatformStatusPage = lazy(() => import("./pages/PlatformStatusPage"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
const SystemManagement = lazy(() => import("./pages/SystemManagement"));
const PlatformSettings = lazy(() => import("./pages/PlatformSettings"));
const AccessibilityDashboard = lazy(() => import("./pages/AccessibilityDashboard"));
const EffectivenessDashboard = lazy(() => import("./pages/EffectivenessDashboard"));
const ExecutiveDashboard = lazy(() => import("./pages/ExecutiveDashboard"));

// 📚 CONTENT PAGES
const Generator = lazy(() => import("./pages/Generator"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const MngMethod = lazy(() => import("./pages/MngMethod"));
const Statistics = lazy(() => import("./pages/Statistics"));
const StudyPlanner = lazy(() => import("./pages/StudyPlanner"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Favorites = lazy(() => import("./pages/Favorites"));
const UserSettings = lazy(() => import("./pages/UserSettings"));
const PWAAnalytics = lazy(() => import("./pages/PWAAnalytics"));
const Diagnostics = lazy(() => import("./pages/Diagnostics"));

// 🎯 DEMO PAGE
const Demo = lazy(() => import("./pages/Demo"));

// ⚔️ KARAOKE DUELS
const KaraokeDuel = lazy(() => import("./pages/KaraokeDuel"));

// 🎵 DAILY SRS PLAYLIST
const DailySRSPlaylist = lazy(() => import("./pages/DailySRSPlaylist"));

// 🏥 NATIONAL EXAM SIMULATION
const NationalExamSimulation = lazy(() => import("./pages/NationalExamSimulation"));

// 🤝 SOCIAL SHARE HUB
const SocialShareHub = lazy(() => import("./pages/SocialShareHub"));

// 🎯 SPECIALTY PATHS
const SpecialtyPaths = lazy(() => import("./pages/SpecialtyPaths"));
const SpecialtyPathDetail = lazy(() => import("./pages/SpecialtyPathDetail"));

// 🛒 STORE PAGES — désactivés (pas de boutique active)
// const Store = lazy(() => import("./pages/Store"));
// const ProductDetail = lazy(() => import("./pages/ProductDetail"));

// 📄 LEGAL PAGES
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite"));
const CGU = lazy(() => import("./pages/CGU"));
const CGV = lazy(() => import("./pages/CGV"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const DeclarationAccessibilite = lazy(() => import("./pages/DeclarationAccessibilite"));
const MesDonneesRGPD = lazy(() => import("./pages/MesDonneesRGPD"));
const InstallPWA = lazy(() => import("./pages/InstallPWA"));
const DesignSystemPage = lazy(() => import("./pages/DesignSystem"));

// 📢 PUBLIC PAGES
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));

// 📈 SEO PILLAR PAGES
const PreparationEcos2026 = lazy(() => import("./pages/seo/PreparationEcos2026"));
const ReussirEdn = lazy(() => import("./pages/seo/ReussirEdn"));
const FichesEcosInteractives = lazy(() => import("./pages/seo/FichesEcosInteractives"));
const SimulationExamenEdn = lazy(() => import("./pages/seo/SimulationExamenEdn"));
const CasCliniqueEdn = lazy(() => import("./pages/seo/CasCliniqueEdn"));
const ErreursFrquentesEcos = lazy(() => import("./pages/seo/ErreursFrquentesEcos"));
const ClassementEdnExplique = lazy(() => import("./pages/seo/ClassementEdnExplique"));
const RangAvsRangB = lazy(() => import("./pages/seo/RangAvsRangB"));
const TravaillerCasCliniques = lazy(() => import("./pages/seo/TravaillerCasCliniques"));
const ExempleCasClinique = lazy(() => import("./pages/seo/ExempleCasClinique"));

const S: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// 🔄 Redirect /edn/:slug → /edn-complete/:slug with param forwarding
const EdnSlugRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/edn-complete/${slug}`} replace />;
};

// ⚡ QueryClient Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Écouter l'événement toggle-notifications depuis la MainNavigation
  useEffect(() => {
    const handler = () => setIsNotificationCenterOpen(prev => !prev);
    window.addEventListener('toggle-notifications', handler);
    return () => window.removeEventListener('toggle-notifications', handler);
  }, []);

  // Tracker les métriques PWA automatiquement
  usePWAMetrics();

  return (
    <GlobalErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="med-mng-ui-theme">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <HelmetProvider>
              <AuthProvider>
              <ComposedProviders>
                              <SkipLinks />
                              <AutoSEO />
                              <GlobalJsonLd />
                              <div id="app-root" className="min-h-screen bg-background">
                                <MainNavigation />
                                <LanguageSelector />
                                <main id="main-content" tabIndex={-1} className="pt-16">
                                  <Routes>
                                    {/* Platform */}
                                    <Route path={ROUTE_PATHS.home} element={<Index />} />
                                    <Route path={ROUTE_PATHS.modularDashboard} element={<AdminRoute><S><ModularDashboard /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.dashboard} element={<AdminRoute><S><Dashboard /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.learningDashboard} element={<AdminRoute><S><LearningDashboard /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.platformStatus} element={<AdminRoute><S><PlatformStatusPage /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.monitoring} element={<AdminRoute><S><Monitoring /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.systemManagement} element={<AdminRoute><S><SystemManagement /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.platformSettings} element={<AdminRoute><S><PlatformSettings /></S></AdminRoute>} />

                                    {/* Redirects */}
                                    <Route path={ROUTE_PATHS.optimizedIndex} element={<Navigate to={ROUTE_PATHS.home} replace />} />
                                    <Route path={ROUTE_PATHS.homepage} element={<Navigate to={ROUTE_PATHS.home} replace />} />

                                    {/* Content */}
                                    <Route path={ROUTE_PATHS.generator} element={<S><Generator /></S>} />

                                    {/* EDN */}
                                    <Route path={ROUTE_PATHS.ednComplete} element={<S><EdnComplete /></S>} />
                                    <Route path={ROUTE_PATHS.ednCompleteDetail} element={<S><EdnComplete /></S>} />
                                    <Route path={ROUTE_PATHS.ednLegacy} element={<Navigate to={ROUTE_PATHS.ednComplete} replace />} />
                                    <Route path={ROUTE_PATHS.ednLegacyWithSlug} element={<EdnSlugRedirect />} />
                                    <Route path={ROUTE_PATHS.ednItemsLegacy} element={<Navigate to={ROUTE_PATHS.ednComplete} replace />} />
                                    <Route path={ROUTE_PATHS.ednImmersive} element={<S><EdnImmersive /></S>} />
                                    <Route path={ROUTE_PATHS.ednMusicLibrary} element={<S><EdnMusicLibrary /></S>} />

                                    {/* Learning */}
                                    <Route path={ROUTE_PATHS.srsReview} element={<S><SRSReview /></S>} />
                                    <Route path={ROUTE_PATHS.examMode} element={<S><ExamMode /></S>} />
                                    <Route path={ROUTE_PATHS.clinicalCases} element={<S><ClinicalCases /></S>} />
                                    <Route path={ROUTE_PATHS.flashcards} element={<S><Flashcards /></S>} />
                                    <Route path={ROUTE_PATHS.progressDashboard} element={<S><ProgressDashboard /></S>} />
                                    <Route path={ROUTE_PATHS.smartStudyPlanner} element={<S><SmartStudyPlanner /></S>} />

                                    {/* Gamification */}
                                    <Route path={ROUTE_PATHS.leaderboard} element={<S><Leaderboard /></S>} />
                                    <Route path={ROUTE_PATHS.dailyChallenges} element={<S><DailyChallenges /></S>} />
                                    <Route path={ROUTE_PATHS.myGoals} element={<S><MyGoals /></S>} />

                                    {/* ECOS */}
                                    <Route path={ROUTE_PATHS.ecosIndex} element={<S><EcosIndex /></S>} />
                                    <Route path={ROUTE_PATHS.ecosScenario} element={<S><EcosScenario /></S>} />

                                    {/* Store — désactivé */}

                                    {/* Audit */}
                                    <Route path={ROUTE_PATHS.audit} element={<AdminRoute><S><AuditComplete /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.auditCompleteness} element={<AdminRoute><S><AuditCompleteness /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.migrationDashboard} element={<AdminRoute><S><MigrationDashboardPage /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.auditGeneral} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
                                    <Route path={ROUTE_PATHS.auditEdn} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
                                    <Route path={ROUTE_PATHS.auditUnified} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
                                    <Route path={ROUTE_PATHS.auditIc1} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
                                    <Route path={ROUTE_PATHS.auditIc2} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
                                    <Route path={ROUTE_PATHS.auditIc4} element={<Navigate to={ROUTE_PATHS.audit} replace />} />
                                    <Route path={ROUTE_PATHS.auditCompleteLegacy} element={<Navigate to={ROUTE_PATHS.audit} replace />} />

                                    {/* Legal */}
                                    <Route path={ROUTE_PATHS.mngMethod} element={<S><MngMethod /></S>} />
                                    <Route path={ROUTE_PATHS.mentionsLegales} element={<S><MentionsLegales /></S>} />
                                    <Route path={ROUTE_PATHS.politiqueConfidentialite} element={<S><PolitiqueConfidentialite /></S>} />
                                    <Route path={ROUTE_PATHS.cgu} element={<S><CGU /></S>} />
                                    <Route path={ROUTE_PATHS.cgv} element={<S><CGV /></S>} />
                                    <Route path={ROUTE_PATHS.cookies} element={<S><CookiesPolicy /></S>} />
                                    <Route path={ROUTE_PATHS.faq} element={<S><FAQ /></S>} />
                                    <Route path={ROUTE_PATHS.about} element={<S><About /></S>} />

                                    {/* SEO Pillar Pages */}
                                    <Route path={ROUTE_PATHS.seoPreparationEcos} element={<S><PreparationEcos2026 /></S>} />
                                    <Route path={ROUTE_PATHS.seoReussirEdn} element={<S><ReussirEdn /></S>} />
                                    <Route path={ROUTE_PATHS.seoFichesEcos} element={<S><FichesEcosInteractives /></S>} />
                                    <Route path={ROUTE_PATHS.seoSimulationEdn} element={<S><SimulationExamenEdn /></S>} />
                                    <Route path={ROUTE_PATHS.seoCasCliniqueEdn} element={<S><CasCliniqueEdn /></S>} />
                                    <Route path={ROUTE_PATHS.seoErreursFrquentesEcos} element={<S><ErreursFrquentesEcos /></S>} />
                                    <Route path={ROUTE_PATHS.seoClassementEdnExplique} element={<S><ClassementEdnExplique /></S>} />
                                    <Route path={ROUTE_PATHS.seoRangAvsRangB} element={<S><RangAvsRangB /></S>} />
                                    <Route path={ROUTE_PATHS.seoTravaillerCasCliniques} element={<S><TravaillerCasCliniques /></S>} />
                                    <Route path={ROUTE_PATHS.seoExempleCasClinique} element={<S><ExempleCasClinique /></S>} />
                                    <Route path={ROUTE_PATHS.declarationAccessibilite} element={<S><DeclarationAccessibilite /></S>} />

                                    {/* Auth (public) */}
                                    <Route path={ROUTE_PATHS.medMngLogin} element={<S><MedMngLogin /></S>} />
                                    <Route path={ROUTE_PATHS.medMngSignup} element={<S><MedMngSignup /></S>} />
                                    <Route path={ROUTE_PATHS.medMngPricing} element={<S><MedMngPricing /></S>} />
                                    {/* Raccourcis publics /signup, /login, /pricing */}
                                    <Route path="/signup" element={<Navigate to={ROUTE_PATHS.medMngSignup} replace />} />
                                    <Route path="/login" element={<Navigate to={ROUTE_PATHS.medMngLogin} replace />} />
                                    <Route path="/pricing" element={<Navigate to={ROUTE_PATHS.medMngPricing} replace />} />
                                    <Route path={ROUTE_PATHS.medMngResetPassword} element={<S><MedMngResetPassword /></S>} />

                                    {/* Med-MNG (protected) */}
                                    <Route path={ROUTE_PATHS.medMngSubscribe} element={<ProtectedRoute><S><MedMngSubscribe /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngSuccess} element={<ProtectedRoute><S><MedMngSuccess /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngCreate} element={<ProtectedRoute><S><MedMngCreate /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngLibrary} element={<Navigate to={ROUTE_PATHS.medMngMusicLibrary} replace />} />
                                    <Route path={ROUTE_PATHS.medMngMusicLibrary} element={<ProtectedRoute><S><MedMngLibrary /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngItemsLibrary} element={<ProtectedRoute><S><MedMngItemsLibrary /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngItemDetail} element={<ProtectedRoute><S><MedMngItemDetail /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngProfile} element={<ProtectedRoute><S><MedMngProfile /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngPlayer} element={<ProtectedRoute><S><MedMngPlayer /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngPlaylists} element={<ProtectedRoute><S><PlaylistManager /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngPlaylistDetail} element={<ProtectedRoute><S><PlaylistDetail /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngAnalytics} element={<ProtectedRoute><S><MusicAnalytics /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngProgress} element={<ProtectedRoute><S><MedMngProgress /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngFavorites} element={<ProtectedRoute><S><MedMngFavorites /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.medMngBilling} element={<ProtectedRoute><S><BillingPage /></S></ProtectedRoute>} />

                                    {/* Demo (public) */}
                                    <Route path={ROUTE_PATHS.demo} element={<S><Demo /></S>} />

                                    {/* Specialty Paths */}
                                    <Route path={ROUTE_PATHS.specialtyPaths} element={<S><SpecialtyPaths /></S>} />
                                    <Route path={ROUTE_PATHS.specialtyPathDetail} element={<S><SpecialtyPathDetail /></S>} />

                                    {/* Karaoke Duels */}
                                    <Route path={ROUTE_PATHS.karaokeDuel} element={<S><KaraokeDuel /></S>} />

                                    {/* Daily SRS Playlist */}
                                    <Route path={ROUTE_PATHS.dailySRSPlaylist} element={<S><DailySRSPlaylist /></S>} />

                                    {/* National Exam Simulation */}
                                    <Route path={ROUTE_PATHS.nationalExam} element={<S><NationalExamSimulation /></S>} />

                                    {/* Social Share Hub */}
                                    <Route path={ROUTE_PATHS.socialShare} element={<ProtectedRoute><S><SocialShareHub /></S></ProtectedRoute>} />

                                    {/* Raccourci /create */}
                                    <Route path={ROUTE_PATHS.createShortcut} element={<Navigate to={ROUTE_PATHS.medMngCreate} replace />} />

                                    {/* Chat & Audit */}
                                    <Route path={ROUTE_PATHS.chat} element={<S><MedChat /></S>} />
                                    <Route path={ROUTE_PATHS.ednAudit} element={<AdminRoute><S><EdnAuditDashboard /></S></AdminRoute>} />

                                    {/* Admin */}
                                    <Route path={ROUTE_PATHS.adminImport} element={<AdminRoute><S><AdminImport /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.adminAudit} element={<AdminRoute><S><AdminAudit /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.adminExtractEdn} element={<AdminRoute><S><AdminExtractEdn /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.adminExtractEcos} element={<AdminRoute><S><AdminExtractEcos /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.adminExtractObjectifs} element={<AdminRoute><S><EdnObjectifsExtractionPage /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.adminOicQuality} element={<AdminRoute><S><OicDataQualityManager /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.adminExtractionQuality} element={<AdminRoute><S><AdminExtractionQualityDashboard /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.adminComplete} element={<AdminRoute><S><AdminCompleteProcess /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.adminPanel} element={<AdminRoute><S><AdminPanel /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.executiveDashboard} element={<AdminRoute><S><ExecutiveDashboard /></S></AdminRoute>} />

                                    {/* Misc pages (admin) */}
                                    <Route path={ROUTE_PATHS.library} element={<S><LibraryPage /></S>} />
                                    <Route path={ROUTE_PATHS.accessibilityDashboard} element={<AdminRoute><S><AccessibilityDashboard /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.effectivenessDashboard} element={<AdminRoute><S><EffectivenessDashboard /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.rlsDocumentation} element={<AdminRoute><S><RLSDocumentation /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.securityMonitoring} element={<AdminRoute><S><SecurityMonitoring /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.statistics} element={<S><Statistics /></S>} />
                                    <Route path={ROUTE_PATHS.studyPlanner} element={<S><StudyPlanner /></S>} />
                                    {/* Misc pages (user-protected) */}
                                    <Route path={ROUTE_PATHS.achievements} element={<ProtectedRoute><S><Achievements /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.favorites} element={<ProtectedRoute><S><Favorites /></S></ProtectedRoute>} />
                                    <Route path={ROUTE_PATHS.settings} element={<ProtectedRoute><S><UserSettings /></S></ProtectedRoute>} />
                                    {/* Misc pages (admin) */}
                                    <Route path={ROUTE_PATHS.designSystem} element={<AdminRoute><S><DesignSystemPage /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.mesDonneesRgpd} element={<S><MesDonneesRGPD /></S>} />
                                    <Route path={ROUTE_PATHS.installPwa} element={<S><InstallPWA /></S>} />
                                    <Route path={ROUTE_PATHS.pwaAnalytics} element={<AdminRoute><S><PWAAnalytics /></S></AdminRoute>} />
                                    <Route path={ROUTE_PATHS.diagnostics} element={<AdminRoute><S><Diagnostics /></S></AdminRoute>} />

                                    {/* 404 */}
                                    <Route path={ROUTE_PATHS.notFound} element={<NotFound />} />
                                  </Routes>
                                </main>

                                {/* Footer */}
                                <Suspense fallback={<div className="h-20 bg-card border-t border-border" />}>
                                  <AppFooter />
                                </Suspense>

                                {/* Global UI */}
                                <HelpButton />
                                <NotificationSystem
                                  isOpen={isNotificationCenterOpen}
                                  onClose={() => setIsNotificationCenterOpen(false)}
                                />
                                <KeyboardShortcuts />
                                <AccessibilityCenter />
                                <CookieBanner />
                                {import.meta.env.DEV && <DesignSystemDevTools />}
                                <EnhancedAITutor />
                                <PWAPrompt />
                                <OfflineIndicator />
                                <PersistentMiniPlayer />
                              </div>
                              <Toaster />
                              <Sonner />
              </ComposedProviders>
              </AuthProvider>
            </HelmetProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
