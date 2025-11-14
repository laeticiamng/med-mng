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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Bell } from 'lucide-react';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { GlobalHeader } from '@/components/layout/GlobalHeader';
import { Footer } from '@/components/layout/Footer';
import { InternationalizationProvider } from '@/contexts/InternationalizationContext';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { AccessibilityCenter } from '@/components/accessibility/AccessibilityCenter';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { usePWAMetrics } from '@/hooks/usePWAMetrics';
import DesignSystemDevTools from '@/components/devtools/DesignSystemDevTools';
import { ROUTE_PATHS } from '@/config/routes';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useSidebarState } from '@/hooks/useSidebarState';

// ⚡ LAZY LOADING - Composants non-critiques chargés à la demande
const DynamicOnboarding = lazy(() => import("@/components/onboarding/DynamicOnboarding").then(module => ({
  default: module.DynamicOnboarding
})));
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalAudioProvider } from "@/contexts/GlobalAudioContext";
import { AuthProvider } from "./components/med-mng/AuthProvider";
import { ProtectedRoute } from "./components/med-mng/withAuth";
import { AdminRoute } from "./components/auth/AdminRoute";
import { queryClient } from "@/lib/queryClient";
import { createIDBPersister } from "@/lib/persistQueryClient";

// ⚡ CRITICAL PAGES - Lazy loaded for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// 🎵 EDN PAGES - Lazy loaded
const EdnComplete = lazy(() => import("./pages/EdnComplete"));
const EdnImmersive = lazy(() => import("./pages/EdnImmersive"));
const EdnMusicLibrary = lazy(() => import("./pages/EdnMusicLibrary"));
const EdnAuditDashboard = lazy(() => import("./pages/EdnAuditDashboard").then(m => ({ default: m.EdnAuditDashboard })));
const EdnItemDetail = lazy(() => import("./pages/EdnItemDetail"));

const Sitemap = lazy(() => import("./pages/Sitemap"));
const ShareTestPage = lazy(() => import("./pages/ShareTestPage"));
const AuditPage = lazy(() => import("./pages/AuditPage"));
const RolesManagementPage = lazy(() => import("./pages/RolesManagementPage"));

// 🎯 ECOS PAGES - Lazy loaded
const EcosIndex = lazy(() => import("./pages/EcosIndex"));
const EcosScenario = lazy(() => import("./pages/EcosScenario"));

// 📊 ADMIN & ANALYTICS - Lazy loaded
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// 🔒 SECURITY PAGES - Lazy loaded
const SecurityMonitoring = lazy(() => import("./pages/SecurityMonitoring"));
const RLSDocumentation = lazy(() => import("./pages/RLSDocumentation"));
const SharedTemplatesPage = lazy(() => import("./pages/SharedTemplatesPage").then(m => ({ default: m.SharedTemplatesPage })));
const TemplateAnalyticsDashboard = lazy(() => import("./pages/TemplateAnalyticsDashboard").then(m => ({ default: m.TemplateAnalyticsDashboard })));

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
const GamificationDashboard = lazy(() => import("./pages/GamificationDashboard"));
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

// 📊 PERFORMANCE DASHBOARD - Lazy loaded
const PerformanceDashboard = lazy(() => import("./pages/PerformanceDashboard"));

// 🆕 NOUVELLES PAGES PRIORITÉ 1 - Lazy loaded
// Leaderboard
const LeaderboardDashboard = lazy(() => import("./pages/LeaderboardDashboard"));
const FocusLeaderboard = lazy(() => import("./pages/FocusLeaderboard"));
const LearningLeaderboard = lazy(() => import("./pages/LearningLeaderboard"));
const WeeklyLeaderboard = lazy(() => import("./pages/WeeklyLeaderboard"));

// Notifications
const NotificationsCenter = lazy(() => import("./pages/NotificationsCenter"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const NotificationSettingsPage = lazy(() => import("./pages/NotificationSettingsPage"));
const NotificationDetail = lazy(() => import("./pages/NotificationDetail"));

// Challenges
const ChallengesDashboard = lazy(() => import("./pages/ChallengesDashboard"));
const DailyChallenges = lazy(() => import("./pages/DailyChallenges"));
const ChallengeDetail = lazy(() => import("./pages/ChallengeDetail"));
const ChallengesHistory = lazy(() => import("./pages/ChallengesHistory"));

// Journal
const JournalDashboard = lazy(() => import("./pages/JournalDashboard"));
const JournalNewEntry = lazy(() => import("./pages/JournalNewEntry"));
const JournalEntry = lazy(() => import("./pages/JournalEntry"));
const JournalEdit = lazy(() => import("./pages/JournalEdit"));

// Profils
const UsersDirectory = lazy(() => import("./pages/UsersDirectory"));
const UserPublicProfile = lazy(() => import("./pages/UserPublicProfile"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const ProfilePrivacySettings = lazy(() => import("./pages/ProfilePrivacySettings"));

// Sessions
const SessionsDashboard = lazy(() => import("./pages/SessionsDashboard"));
const StudySessions = lazy(() => import("./pages/StudySessions"));
const FocusSessions = lazy(() => import("./pages/FocusSessions"));
const MeditationSessions = lazy(() => import("./pages/MeditationSessions"));
const SessionDetail = lazy(() => import("./pages/SessionDetail"));

// Quests
const QuestsDashboard = lazy(() => import("./pages/QuestsDashboard"));
const QuestDetail = lazy(() => import("./pages/QuestDetail"));
const QuestStart = lazy(() => import("./pages/QuestStart"));
const AmbitionsManager = lazy(() => import("./pages/AmbitionsManager"));

// 🆕 NOUVELLES PAGES PRIORITÉ 2 - Lazy loaded
// Help & Support
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const ContactSupport = lazy(() => import("./pages/ContactSupport"));
const HelpSearch = lazy(() => import("./pages/HelpSearch"));

// Activity Feed
const ActivityFeed = lazy(() => import("./pages/ActivityFeed"));
const MyActivity = lazy(() => import("./pages/MyActivity"));
const UserActivity = lazy(() => import("./pages/UserActivity"));

// Posts & Community
const PostsFeed = lazy(() => import("./pages/PostsFeed"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const PostEdit = lazy(() => import("./pages/PostEdit"));

// Wellness & Rituals
const WellnessDashboard = lazy(() => import("./pages/WellnessDashboard"));
const WellnessStreak = lazy(() => import("./pages/WellnessStreak"));
const RitualsManager = lazy(() => import("./pages/RitualsManager"));
const RitualDetail = lazy(() => import("./pages/RitualDetail"));

// Badges & Auras
const BadgesGallery = lazy(() => import("./pages/BadgesGallery"));
const BadgeDetail = lazy(() => import("./pages/BadgeDetail"));
const AurasCollection = lazy(() => import("./pages/AurasCollection"));
const AuraDetail = lazy(() => import("./pages/AuraDetail"));
const BadgeCollection = lazy(() => import("./pages/BadgeCollection"));
const CommunityLeaderboard = lazy(() => import("./pages/Leaderboard"));

// 🆕 NOUVELLES PAGES PRIORITÉ 3 - Lazy loaded
// API Developer Portal
const DevelopersPortal = lazy(() => import("./pages/DevelopersPortal"));
const DevelopersDocs = lazy(() => import("./pages/DevelopersDocs"));
const DevelopersKeys = lazy(() => import("./pages/DevelopersKeys"));
const DevelopersWebhooks = lazy(() => import("./pages/DevelopersWebhooks"));

// Reporting & Export
const ReportsDashboard = lazy(() => import("./pages/ReportsDashboard"));
const ReportsGenerate = lazy(() => import("./pages/ReportsGenerate"));
const ReportViewer = lazy(() => import("./pages/ReportViewer"));
const DataExport = lazy(() => import("./pages/DataExport"));

// Advanced Search
const GlobalSearch = lazy(() => import("./pages/GlobalSearch"));
const SearchGlobal = lazy(() => import("./pages/SearchGlobal"));
const SearchSaved = lazy(() => import("./pages/SearchSaved"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const AdvancedSearch = lazy(() => import("./pages/AdvancedSearch"));

// Teams & Collaboration
const TeamsDashboard = lazy(() => import("./pages/TeamsDashboard"));
const TeamsCreate = lazy(() => import("./pages/TeamsCreate"));
const TeamDashboard = lazy(() => import("./pages/TeamDashboard"));
const TeamMembers = lazy(() => import("./pages/TeamMembers"));
const TeamChallenges = lazy(() => import("./pages/TeamChallenges"));

// Events & Calendar
const EventsDashboard = lazy(() => import("./pages/EventsDashboard"));
const EventsCalendar = lazy(() => import("./pages/EventsCalendar"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const EventCreate = lazy(() => import("./pages/EventCreate"));
const CalendarView = lazy(() => import("./pages/CalendarView"));

// 🛡️ MODERATION & SAFETY - Lazy loaded
const ModerationWorkflow = lazy(() => import("./pages/ModerationWorkflow"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const ContentReporting = lazy(() => import("./pages/ContentReporting"));
const ReportsAdminPanel = lazy(() => import("./pages/ReportsAdminPanel"));
const PlatformAnalytics = lazy(() => import("./pages/PlatformAnalytics"));

const App = () => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen } = useSidebarState();
  
  // Tracker les métriques PWA automatiquement
  usePWAMetrics();
  
  // ⚡ CACHE PERSISTANT: Créer le persister IndexedDB pour React Query
  const persister = React.useMemo(() => createIDBPersister(), []);
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="med-mng-ui-theme">
      <PersistQueryClientProvider 
        client={queryClient} 
        persistOptions={{ persister, maxAge: 24 * 60 * 60 * 1000 }}
      >
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
                          <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SkipLinks />
                            <div id="app-root" className="min-h-screen bg-background flex w-full">
                              {/* Sidebar - Collapsible with Cmd+B */}
                              <AppSidebar />
                              
                              {/* Main Content Area */}
                              <div className="flex-1 flex flex-col min-w-0">
                                {/* Show GlobalHeader on homepage only, MainNavigation on other pages */}
                                <MainNavigation />
                            <main id="main-content" tabIndex={-1} className="pt-16">
                              <Routes>
        <Route path={ROUTE_PATHS.modularDashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ModularDashboard /></Suspense>} />
           <Route path={ROUTE_PATHS.dashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Dashboard /></Suspense>} />
           <Route path={ROUTE_PATHS.learningDashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><LearningDashboard /></Suspense>} />
           <Route path={ROUTE_PATHS.gamificationDashboard} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><GamificationDashboard /></Suspense></ProtectedRoute>} />
           <Route path={ROUTE_PATHS.platformStatus} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PlatformStatusPage /></Suspense>} />
           <Route path={ROUTE_PATHS.monitoring} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Monitoring /></Suspense>} />
           <Route path={ROUTE_PATHS.systemManagement} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><SystemManagement /></Suspense>} />
          <Route path={ROUTE_PATHS.platformSettings} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PlatformSettings /></Suspense>} />
          <Route path={ROUTE_PATHS.optimizedIndex} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><OptimizedIndex /></Suspense>} />
          <Route path={ROUTE_PATHS.sitemap} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Sitemap /></Suspense>} />
          <Route path={ROUTE_PATHS.shareTest} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ShareTestPage /></Suspense>} />
          <Route path={ROUTE_PATHS.auditSecurity} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AuditPage /></Suspense>} />
          <Route path={ROUTE_PATHS.sharedTemplates} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><SharedTemplatesPage /></Suspense>} />
          <Route path={ROUTE_PATHS.templateAnalytics} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><TemplateAnalyticsDashboard /></Suspense>} />
          <Route path={ROUTE_PATHS.home} element={<Index />} />
          <Route path={ROUTE_PATHS.generator} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Generator /></Suspense>} />
          {/* EDN Interface Unifiée - toutes les fonctionnalités fusionnées */}
          <Route path={ROUTE_PATHS.ednComplete} element={
            <ErrorBoundary>
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <EdnComplete />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path={ROUTE_PATHS.ednCompleteDetail} element={
            <ErrorBoundary>
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <EdnComplete />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="/edn/item/:itemNumber" element={
            <ErrorBoundary>
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <EdnItemDetail />
              </Suspense>
            </ErrorBoundary>
          } />
          
          {/* Redirections vers l'interface unifiée */}
          <Route path={ROUTE_PATHS.ednLegacy} element={<Navigate to={ROUTE_PATHS.ednComplete} replace />} />
          <Route path={ROUTE_PATHS.ednLegacyWithSlug} element={<Navigate to={ROUTE_PATHS.ednCompleteDetail} replace />} />
          <Route path={ROUTE_PATHS.ednItemsLegacy} element={<Navigate to={ROUTE_PATHS.ednComplete} replace />} />
          <Route path={ROUTE_PATHS.ednImmersive} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EdnImmersive /></Suspense>} />
          <Route path={ROUTE_PATHS.ednMusicLibrary} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EdnMusicLibrary /></Suspense>} />
          
          {/* 📊 Admin Dashboard Analytics */}
          <Route path={ROUTE_PATHS.adminDashboardAnalytics} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdminDashboard /></Suspense>} />
          
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
           
           {/* 📊 Performance Dashboard */}
           <Route path={ROUTE_PATHS.performanceDashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PerformanceDashboard /></Suspense>} />
           
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
            <Route path={ROUTE_PATHS.adminRoles} element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><RolesManagementPage /></Suspense></AdminRoute>} />
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

             {/* 🆕 NOUVELLES ROUTES PRIORITÉ 1 */}
             {/* Leaderboard - PUBLIC */}
             <Route path={ROUTE_PATHS.leaderboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><LeaderboardDashboard /></Suspense>} />
             <Route path={ROUTE_PATHS.leaderboardFocus} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><FocusLeaderboard /></Suspense>} />
             <Route path={ROUTE_PATHS.leaderboardLearning} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><LearningLeaderboard /></Suspense>} />
             <Route path={ROUTE_PATHS.leaderboardWeekly} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><WeeklyLeaderboard /></Suspense>} />

             {/* Notifications - PROTECTED */}
             <Route path={ROUTE_PATHS.notifications} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><NotificationsPage /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.notificationsSettings} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><NotificationSettingsPage /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.notificationDetail} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><NotificationDetail /></Suspense></ProtectedRoute>} />

             {/* Challenges - PUBLIC avec historique PROTECTED */}
             <Route path={ROUTE_PATHS.challenges} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ChallengesDashboard /></Suspense>} />
             <Route path={ROUTE_PATHS.challengesDaily} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DailyChallenges /></Suspense>} />
             <Route path={ROUTE_PATHS.challengeDetail} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ChallengeDetail /></Suspense>} />
             <Route path={ROUTE_PATHS.challengesHistory} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ChallengesHistory /></Suspense></ProtectedRoute>} />

             {/* 🆕 PHASE 3 - NOUVELLES ROUTES */}
             {/* Journal - PROTECTED */}
             <Route path={ROUTE_PATHS.journal} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><JournalDashboard /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.journalNew} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><JournalNewEntry /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.journalEntry} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><JournalEntry /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.journalEdit} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><JournalEdit /></Suspense></ProtectedRoute>} />

             {/* Profils - PUBLIC lecture, PROTECTED édition */}
             <Route path={ROUTE_PATHS.users} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><UsersDirectory /></Suspense>} />
             <Route path={ROUTE_PATHS.userProfile} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><UserPublicProfile /></Suspense>} />
             <Route path={ROUTE_PATHS.profileEdit} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ProfileEdit /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.profilePrivacy} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ProfilePrivacySettings /></Suspense></ProtectedRoute>} />

             {/* Sessions - PROTECTED */}
             <Route path={ROUTE_PATHS.sessions} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><SessionsDashboard /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.sessionsStudy} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><StudySessions /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.sessionsFocus} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><FocusSessions /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.sessionsMeditation} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MeditationSessions /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.sessionDetail} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><SessionDetail /></Suspense></ProtectedRoute>} />

             {/* Quests - PROTECTED */}
             <Route path={ROUTE_PATHS.quests} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><QuestsDashboard /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.questDetail} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><QuestDetail /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.questStart} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><QuestStart /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.ambitions} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AmbitionsManager /></Suspense></ProtectedRoute>} />

             {/* 🆕 NOUVELLES ROUTES PRIORITÉ 2 */}
             {/* Help & Support - PUBLIC */}
             <Route path={ROUTE_PATHS.help} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><HelpCenter /></Suspense>} />
             <Route path={ROUTE_PATHS.helpFaq} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><FAQ /></Suspense>} />
             <Route path={ROUTE_PATHS.helpTutorials} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><Tutorials /></Suspense>} />
             <Route path={ROUTE_PATHS.helpContact} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ContactSupport /></Suspense>} />
             <Route path={ROUTE_PATHS.helpSearch} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><HelpSearch /></Suspense>} />

             {/* Activity Feed - PUBLIC/PROTECTED mix */}
             <Route path={ROUTE_PATHS.activity} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ActivityFeed /></Suspense>} />
             <Route path={ROUTE_PATHS.activityMe} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><MyActivity /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.activityUser} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><UserActivity /></Suspense>} />

             {/* Posts & Community - PUBLIC read, PROTECTED write */}
             <Route path={ROUTE_PATHS.posts} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PostsFeed /></Suspense>} />
             <Route path={ROUTE_PATHS.postsNew} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CreatePost /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.postDetail} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PostDetail /></Suspense>} />
             <Route path={ROUTE_PATHS.postEdit} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PostEdit /></Suspense></ProtectedRoute>} />

             {/* Wellness & Rituals - PROTECTED */}
             <Route path={ROUTE_PATHS.wellness} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><WellnessDashboard /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.wellnessStreak} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><WellnessStreak /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.wellnessRituals} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><RitualsManager /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.ritualDetail} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><RitualDetail /></Suspense></ProtectedRoute>} />

             {/* Badges & Auras - PUBLIC read, progression tracking */}
             <Route path={ROUTE_PATHS.badges} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BadgesGallery /></Suspense>} />
             <Route path={ROUTE_PATHS.badgeDetail} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BadgeDetail /></Suspense>} />
             <Route path={ROUTE_PATHS.badgeCollection} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><BadgeCollection /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.auras} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AurasCollection /></Suspense>} />
             <Route path={ROUTE_PATHS.auraDetail} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AuraDetail /></Suspense>} />
             <Route path={ROUTE_PATHS.communityLeaderboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CommunityLeaderboard /></Suspense>} />

             {/* 🆕 NOUVELLES ROUTES PRIORITÉ 3 */}
             {/* API Developer Portal - PROTECTED (developer accounts) */}
             <Route path={ROUTE_PATHS.developers} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DevelopersPortal /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.developersDocs} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DevelopersDocs /></Suspense>} />
             <Route path={ROUTE_PATHS.developersKeys} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DevelopersKeys /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.developersWebhooks} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DevelopersWebhooks /></Suspense></ProtectedRoute>} />

             {/* Reporting & Export - PROTECTED */}
             <Route path={ROUTE_PATHS.reports} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ReportsDashboard /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.reportsGenerate} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ReportsGenerate /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.reportViewer} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ReportViewer /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.dataExport} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><DataExport /></Suspense></ProtectedRoute>} />

             {/* Advanced Search - PUBLIC */}
             <Route path={ROUTE_PATHS.search} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><SearchResults /></Suspense>} />
             <Route path="/search/advanced" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><AdvancedSearch /></Suspense>} />
             <Route path={ROUTE_PATHS.searchGlobal} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><SearchGlobal /></Suspense>} />
             <Route path={ROUTE_PATHS.searchSaved} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><SearchSaved /></Suspense></ProtectedRoute>} />

             {/* Teams & Collaboration - PROTECTED */}
             <Route path={ROUTE_PATHS.teams} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><TeamsDashboard /></Suspense>} />
             <Route path={ROUTE_PATHS.teamsCreate} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><TeamsCreate /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.teamDashboard} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><TeamDashboard /></Suspense>} />
             <Route path={ROUTE_PATHS.teamMembers} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><TeamMembers /></Suspense>} />
             <Route path={ROUTE_PATHS.teamChallenges} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><TeamChallenges /></Suspense>} />

             {/* Events & Calendar - PUBLIC read, PROTECTED write */}
             <Route path={ROUTE_PATHS.events} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EventsDashboard /></Suspense>} />
             <Route path="/events/calendar" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EventsCalendar /></Suspense>} />
             <Route path={ROUTE_PATHS.eventDetail} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EventDetail /></Suspense>} />
             <Route path={ROUTE_PATHS.eventCreate} element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><EventCreate /></Suspense></ProtectedRoute>} />
             <Route path={ROUTE_PATHS.calendar} element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><CalendarView /></Suspense>} />

             {/* Moderation & Safety */}
             <Route path="/admin/moderation" element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ModerationWorkflow /></Suspense></AdminRoute>} />
             <Route path="/admin/users" element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><UserManagement /></Suspense></AdminRoute>} />
             <Route path="/reports" element={<ProtectedRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ContentReporting /></Suspense></ProtectedRoute>} />
             <Route path="/admin/reports" element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><ReportsAdminPanel /></Suspense></AdminRoute>} />
             <Route path="/admin/analytics" element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}><PlatformAnalytics /></Suspense></AdminRoute>} />

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
                            </div>
                          </SidebarProvider>
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
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
