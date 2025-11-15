import React, { lazy, ReactNode } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { SuspenseWrapper } from '@/components/common/SuspenseLoader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/med-mng/withAuth';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { ROUTE_PATHS } from './routes';

// ==================== LAZY LOADED PAGES ====================
// Critical pages
const Index = lazy(() => import('@/pages/Index'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// EDN Pages
const EdnComplete = lazy(() => import('@/pages/EdnComplete'));
const EdnImmersive = lazy(() => import('@/pages/EdnImmersive'));
const EdnMusicLibrary = lazy(() => import('@/pages/EdnMusicLibrary'));
const EdnItemDetail = lazy(() => import('@/pages/EdnItemDetail'));
const EdnAuditDashboard = lazy(() =>
  import('@/pages/EdnAuditDashboard').then(m => ({ default: m.EdnAuditDashboard }))
);

// ECOS Pages
const EcosIndex = lazy(() => import('@/pages/EcosIndex'));
const EcosScenario = lazy(() => import('@/pages/EcosScenario'));

// Admin Pages
const AdminIndex = lazy(() =>
  import('@/pages/AdminIndex').then(m => ({ default: m.AdminIndex }))
);
const AdminPanel = lazy(() =>
  import('@/pages/AdminPanel').then(m => ({ default: m.AdminPanel }))
);
const AdminImport = lazy(() => import('@/pages/AdminImport'));
const AdminAudit = lazy(() => import('@/pages/AdminAudit'));
const AdminExtractEdn = lazy(() => import('@/pages/AdminExtractEdn'));
const AdminExtractEcos = lazy(() => import('@/pages/AdminExtractEcos'));
const AdminCompleteProcess = lazy(() => import('@/pages/AdminCompleteProcess'));
const EdnObjectifsExtractionPage = lazy(() => import('@/pages/EdnObjectifsExtraction'));
const OicDataQualityManager = lazy(() => import('@/pages/OicDataQualityManager'));
const RolesManagementPage = lazy(() => import('@/pages/RolesManagementPage'));

// Med-Mng Pages
const MedMngLogin = lazy(() =>
  import('@/pages/MedMngLogin').then(m => ({ default: m.MedMngLogin }))
);
const MedMngSignup = lazy(() =>
  import('@/pages/MedMngSignup').then(m => ({ default: m.MedMngSignup }))
);
const MedMngPricing = lazy(() =>
  import('@/pages/MedMngPricing').then(m => ({ default: m.MedMngPricing }))
);
const MedMngSubscribe = lazy(() =>
  import('@/pages/MedMngSubscribe').then(m => ({ default: m.MedMngSubscribe }))
);
const MedMngSuccess = lazy(() =>
  import('@/pages/MedMngSuccess').then(m => ({ default: m.MedMngSuccess }))
);
const MedMngCreate = lazy(() =>
  import('@/pages/MedMngCreate').then(m => ({ default: m.MedMngCreate }))
);
const MedMngLibrary = lazy(() =>
  import('@/pages/MedMngLibrary').then(m => ({ default: m.MedMngLibrary }))
);
const MedMngProfile = lazy(() =>
  import('@/pages/MedMngProfile').then(m => ({ default: m.MedMngProfile }))
);
const MedMngPlayer = lazy(() =>
  import('@/pages/MedMngPlayer').then(m => ({ default: m.MedMngPlayer }))
);
const PlaylistManager = lazy(() =>
  import('@/components/playlists/PlaylistManager').then(m => ({ default: m.PlaylistManager }))
);
const PlaylistDetail = lazy(() =>
  import('@/components/playlists/PlaylistDetail').then(m => ({ default: m.PlaylistDetail }))
);
const MusicAnalytics = lazy(() =>
  import('@/components/analytics/MusicAnalytics').then(m => ({ default: m.MusicAnalytics }))
);
const MedChat = lazy(() =>
  import('@/pages/MedChat').then(m => ({ default: m.MedChat }))
);

// Dashboard Pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ModularDashboard = lazy(() => import('@/pages/ModularDashboard'));
const LearningDashboard = lazy(() => import('@/pages/LearningDashboard'));
const PlatformStatusPage = lazy(() => import('@/pages/PlatformStatusPage'));
const Monitoring = lazy(() => import('@/pages/Monitoring'));
const SystemManagement = lazy(() => import('@/pages/SystemManagement'));
const PlatformSettings = lazy(() => import('@/pages/PlatformSettings'));
const AccessibilityDashboard = lazy(() => import('@/pages/AccessibilityDashboard'));
const EffectivenessDashboard = lazy(() => import('@/pages/EffectivenessDashboard'));
const PerformanceDashboard = lazy(() => import('@/pages/PerformanceDashboard'));

// Content Pages
const Sitemap = lazy(() => import('@/pages/Sitemap'));
const ShareTestPage = lazy(() => import('@/pages/ShareTestPage'));
const AuditPage = lazy(() => import('@/pages/AuditPage'));
const Generator = lazy(() => import('@/pages/Generator'));
const LibraryPage = lazy(() => import('@/pages/LibraryPage'));
const MngMethod = lazy(() => import('@/pages/MngMethod'));
const Statistics = lazy(() => import('@/pages/Statistics'));
const StudyPlanner = lazy(() => import('@/pages/StudyPlanner'));
const CommunityHub = lazy(() => import('@/pages/CommunityHub'));
const ModernHomepage = lazy(() => import('@/pages/ModernHomepage'));
const Achievements = lazy(() => import('@/pages/Achievements'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const ViewingHistory = lazy(() => import('@/pages/ViewingHistory'));
const Collections = lazy(() => import('@/pages/Collections'));
const GamificationDashboard = lazy(() => import('@/pages/GamificationDashboard'));
const AdvancedAnalyticsDashboard = lazy(() => import('@/pages/AdvancedAnalyticsDashboard'));
const UserSettings = lazy(() => import('@/pages/UserSettings'));
const PWAAnalytics = lazy(() => import('@/pages/PWAAnalytics'));
const OptimizedIndex = lazy(() => import('@/pages/OptimizedIndex'));
const AuditComplete = lazy(() => import('@/pages/AuditComplete'));
const AuditCompleteness = lazy(() => import('@/pages/AuditCompleteness'));
const MigrationDashboardPage = lazy(() => import('@/pages/MigrationDashboard'));

// Legal Pages
const MentionsLegales = lazy(() => import('@/pages/MentionsLegales'));
const PolitiqueConfidentialite = lazy(() => import('@/pages/PolitiqueConfidentialite'));
const CGU = lazy(() => import('@/pages/CGU'));
const DeclarationAccessibilite = lazy(() => import('@/pages/DeclarationAccessibilite'));
const MesDonneesRGPD = lazy(() => import('@/pages/MesDonneesRGPD'));
const InstallPWA = lazy(() => import('@/pages/InstallPWA'));
const DesignSystemPage = lazy(() => import('@/pages/DesignSystem'));

// Store Pages
const Store = lazy(() => import('@/pages/Store'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));

// Audit & Security Pages
const SecurityMonitoring = lazy(() => import('@/pages/SecurityMonitoring'));
const RLSDocumentation = lazy(() => import('@/pages/RLSDocumentation'));
const SharedTemplatesPage = lazy(() =>
  import('@/pages/SharedTemplatesPage').then(m => ({ default: m.SharedTemplatesPage }))
);
const TemplateAnalyticsDashboard = lazy(() =>
  import('@/pages/TemplateAnalyticsDashboard').then(m => ({ default: m.TemplateAnalyticsDashboard }))
);

// Priority 1 - Leaderboards
const LeaderboardDashboard = lazy(() => import('@/pages/LeaderboardDashboard'));
const FocusLeaderboard = lazy(() => import('@/pages/FocusLeaderboard'));
const LearningLeaderboard = lazy(() => import('@/pages/LearningLeaderboard'));
const WeeklyLeaderboard = lazy(() => import('@/pages/WeeklyLeaderboard'));

// Priority 1 - Notifications
const NotificationsCenter = lazy(() => import('@/pages/NotificationsCenter'));
const NotificationSettings = lazy(() => import('@/pages/NotificationSettings'));
const NotificationDetail = lazy(() => import('@/pages/NotificationDetail'));

// Priority 1 - Challenges
const ChallengesDashboard = lazy(() => import('@/pages/ChallengesDashboard'));
const DailyChallenges = lazy(() => import('@/pages/DailyChallenges'));
const ChallengeDetail = lazy(() => import('@/pages/ChallengeDetail'));
const ChallengesHistory = lazy(() => import('@/pages/ChallengesHistory'));

// Priority 1 - Journal
const JournalDashboard = lazy(() => import('@/pages/JournalDashboard'));
const JournalNewEntry = lazy(() => import('@/pages/JournalNewEntry'));
const JournalEntry = lazy(() => import('@/pages/JournalEntry'));
const JournalEdit = lazy(() => import('@/pages/JournalEdit'));

// Priority 1 - Profiles
const UsersDirectory = lazy(() => import('@/pages/UsersDirectory'));
const UserPublicProfile = lazy(() => import('@/pages/UserPublicProfile'));
const ProfileEdit = lazy(() => import('@/pages/ProfileEdit'));
const ProfilePrivacySettings = lazy(() => import('@/pages/ProfilePrivacySettings'));

// Priority 1 - Sessions
const SessionsDashboard = lazy(() => import('@/pages/SessionsDashboard'));
const StudySessions = lazy(() => import('@/pages/StudySessions'));
const FocusSessions = lazy(() => import('@/pages/FocusSessions'));
const MeditationSessions = lazy(() => import('@/pages/MeditationSessions'));
const SessionDetail = lazy(() => import('@/pages/SessionDetail'));

// Priority 1 - Quests
const QuestsDashboard = lazy(() => import('@/pages/QuestsDashboard'));
const QuestDetail = lazy(() => import('@/pages/QuestDetail'));
const QuestStart = lazy(() => import('@/pages/QuestStart'));
const AmbitionsManager = lazy(() => import('@/pages/AmbitionsManager'));

// Priority 1 - Goals
const Goals = lazy(() => import('@/pages/Goals'));

// Priority 2 - Help & Support
const HelpCenter = lazy(() => import('@/pages/HelpCenter'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Tutorials = lazy(() => import('@/pages/Tutorials'));
const ContactSupport = lazy(() => import('@/pages/ContactSupport'));
const HelpSearch = lazy(() => import('@/pages/HelpSearch'));
const HelpArticle = lazy(() => import('@/pages/HelpArticle'));

// Priority 2 - Activity Feed
const ActivityFeed = lazy(() => import('@/pages/ActivityFeed'));
const MyActivity = lazy(() => import('@/pages/MyActivity'));
const UserActivity = lazy(() => import('@/pages/UserActivity'));

// Priority 2 - Posts & Community
const PostsFeed = lazy(() => import('@/pages/PostsFeed'));
const CreatePost = lazy(() => import('@/pages/CreatePost'));
const PostDetail = lazy(() => import('@/pages/PostDetail'));
const PostEdit = lazy(() => import('@/pages/PostEdit'));

// Priority 2 - Wellness & Rituals
const WellnessDashboard = lazy(() => import('@/pages/WellnessDashboard'));
const WellnessStreak = lazy(() => import('@/pages/WellnessStreak'));
const RitualsManager = lazy(() => import('@/pages/RitualsManager'));
const RitualDetail = lazy(() => import('@/pages/RitualDetail'));

// Priority 2 - Badges & Auras
const BadgesGallery = lazy(() => import('@/pages/BadgesGallery'));
const BadgeDetail = lazy(() => import('@/pages/BadgeDetail'));
const AurasCollection = lazy(() => import('@/pages/AurasCollection'));
const AuraDetail = lazy(() => import('@/pages/AuraDetail'));

// Priority 3 - API Developer Portal
const DevelopersPortal = lazy(() => import('@/pages/DevelopersPortal'));
const DevelopersDocs = lazy(() => import('@/pages/DevelopersDocs'));
const DevelopersKeys = lazy(() => import('@/pages/DevelopersKeys'));
const DevelopersWebhooks = lazy(() => import('@/pages/DevelopersWebhooks'));

// Priority 3 - Reporting & Export
const ReportsDashboard = lazy(() => import('@/pages/ReportsDashboard'));
const ReportsGenerate = lazy(() => import('@/pages/ReportsGenerate'));
const ReportViewer = lazy(() => import('@/pages/ReportViewer'));
const DataExport = lazy(() => import('@/pages/DataExport'));

// Priority 3 - Advanced Search
const GlobalSearch = lazy(() => import('@/pages/GlobalSearch'));
const SearchGlobal = lazy(() => import('@/pages/SearchGlobal'));
const SearchSaved = lazy(() => import('@/pages/SearchSaved'));

// Priority 3 - Teams & Collaboration
const TeamsDashboard = lazy(() => import('@/pages/TeamsDashboard'));
const TeamsCreate = lazy(() => import('@/pages/TeamsCreate'));
const TeamDashboard = lazy(() => import('@/pages/TeamDashboard'));
const TeamMembers = lazy(() => import('@/pages/TeamMembers'));
const TeamChallenges = lazy(() => import('@/pages/TeamChallenges'));

// Priority 3 - Events & Calendar
const EventsDashboard = lazy(() => import('@/pages/EventsDashboard'));
const EventDetail = lazy(() => import('@/pages/EventDetail'));
const EventCreate = lazy(() => import('@/pages/EventCreate'));
const CalendarView = lazy(() => import('@/pages/CalendarView'));

// ==================== ROUTE BUILDERS ====================

/**
 * Wraps component with Suspense and optional protection
 */
interface RouteWrapperOptions {
  protected?: boolean;
  admin?: boolean;
  errorBoundary?: boolean;
}

export const wrapRoute = (
  Component: React.LazyExoticComponent<React.ComponentType<any>>,
  options: RouteWrapperOptions = {}
): ReactNode => {
  const { protected: isProtected = false, admin = false, errorBoundary = true } = options;

  let element = (
    <SuspenseWrapper>
      <Component />
    </SuspenseWrapper>
  );

  if (errorBoundary) {
    element = (
      <ErrorBoundary>
        {element}
      </ErrorBoundary>
    );
  }

  if (admin) {
    element = <AdminRoute>{element}</AdminRoute>;
  } else if (isProtected) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  }

  return element;
};

// ==================== ROUTE CONFIGURATIONS ====================

/**
 * Core platform routes
 */
export const coreRoutes: RouteObject[] = [
  { path: ROUTE_PATHS.home, element: <Index /> },
  { path: ROUTE_PATHS.dashboard, element: wrapRoute(Dashboard) },
  { path: ROUTE_PATHS.modularDashboard, element: wrapRoute(ModularDashboard) },
  { path: ROUTE_PATHS.learningDashboard, element: wrapRoute(LearningDashboard) },
  { path: ROUTE_PATHS.platformStatus, element: wrapRoute(PlatformStatusPage) },
  { path: ROUTE_PATHS.monitoring, element: wrapRoute(Monitoring) },
  { path: ROUTE_PATHS.systemManagement, element: wrapRoute(SystemManagement) },
  { path: ROUTE_PATHS.platformSettings, element: wrapRoute(PlatformSettings) },
  { path: ROUTE_PATHS.optimizedIndex, element: wrapRoute(OptimizedIndex) },
  { path: ROUTE_PATHS.generator, element: wrapRoute(Generator) },
];

/**
 * EDN system routes (medical education)
 */
export const ednRoutes: RouteObject[] = [
  { path: ROUTE_PATHS.ednComplete, element: wrapRoute(EdnComplete, { errorBoundary: true }) },
  { path: ROUTE_PATHS.ednCompleteDetail, element: wrapRoute(EdnComplete, { errorBoundary: true }) },
  { path: '/edn/item/:itemNumber', element: wrapRoute(EdnItemDetail, { errorBoundary: true }) },
  { path: ROUTE_PATHS.ednImmersive, element: wrapRoute(EdnImmersive) },
  { path: ROUTE_PATHS.ednMusicLibrary, element: wrapRoute(EdnMusicLibrary) },
  { path: ROUTE_PATHS.ednAudit, element: wrapRoute(EdnAuditDashboard) },
];

/**
 * ECOS routes
 */
export const ecosRoutes: RouteObject[] = [
  { path: ROUTE_PATHS.ecosIndex, element: wrapRoute(EcosIndex) },
  { path: ROUTE_PATHS.ecosScenario, element: wrapRoute(EcosScenario) },
];

/**
 * Admin routes (require admin role)
 */
export const adminRoutes: RouteObject[] = [
  { path: ROUTE_PATHS.adminIndex, element: wrapRoute(AdminIndex, { admin: true }) },
  { path: ROUTE_PATHS.adminPanel, element: wrapRoute(AdminPanel, { admin: true }) },
  { path: ROUTE_PATHS.adminImport, element: wrapRoute(AdminImport, { admin: true }) },
  { path: ROUTE_PATHS.adminAudit, element: wrapRoute(AdminAudit, { admin: true }) },
  { path: ROUTE_PATHS.adminExtractEdn, element: wrapRoute(AdminExtractEdn, { admin: true }) },
  { path: ROUTE_PATHS.adminExtractEcos, element: wrapRoute(AdminExtractEcos, { admin: true }) },
  { path: ROUTE_PATHS.adminExtractObjectifs, element: wrapRoute(EdnObjectifsExtractionPage, { admin: true }) },
  { path: ROUTE_PATHS.adminOicQuality, element: wrapRoute(OicDataQualityManager, { admin: true }) },
  { path: ROUTE_PATHS.adminComplete, element: wrapRoute(AdminCompleteProcess, { admin: true }) },
  { path: ROUTE_PATHS.adminRoles, element: wrapRoute(RolesManagementPage, { admin: true }) },
  { path: ROUTE_PATHS.adminDashboardAnalytics, element: wrapRoute(AdminIndex, { admin: true }) },
];

/**
 * Med-Mng music/meditation routes
 */
export const medMngRoutes: RouteObject[] = [
  { path: ROUTE_PATHS.medMngLogin, element: wrapRoute(MedMngLogin, { errorBoundary: false }) },
  { path: ROUTE_PATHS.medMngSignup, element: wrapRoute(MedMngSignup, { errorBoundary: false }) },
  { path: ROUTE_PATHS.medMngPricing, element: wrapRoute(MedMngPricing) },
  { path: ROUTE_PATHS.medMngSubscribe, element: wrapRoute(MedMngSubscribe, { protected: true }) },
  { path: ROUTE_PATHS.medMngSuccess, element: wrapRoute(MedMngSuccess, { protected: true }) },
  { path: ROUTE_PATHS.medMngCreate, element: wrapRoute(MedMngCreate, { protected: true }) },
  { path: ROUTE_PATHS.medMngLibrary, element: wrapRoute(MedMngLibrary, { protected: true }) },
  { path: ROUTE_PATHS.medMngProfile, element: wrapRoute(MedMngProfile, { protected: true }) },
  { path: ROUTE_PATHS.medMngPlayer, element: wrapRoute(MedMngPlayer, { protected: true }) },
  { path: ROUTE_PATHS.medMngPlaylists, element: wrapRoute(PlaylistManager, { protected: true }) },
  { path: ROUTE_PATHS.medMngPlaylistDetail, element: wrapRoute(PlaylistDetail, { protected: true }) },
  { path: ROUTE_PATHS.medMngAnalytics, element: wrapRoute(MusicAnalytics, { protected: true }) },
  { path: ROUTE_PATHS.chat, element: wrapRoute(MedChat) },
];

/**
 * Priority 1 - Core engagement routes
 */
export const priority1Routes: RouteObject[] = [
  // Leaderboards (public)
  { path: ROUTE_PATHS.leaderboard, element: wrapRoute(LeaderboardDashboard) },
  { path: ROUTE_PATHS.leaderboardFocus, element: wrapRoute(FocusLeaderboard) },
  { path: ROUTE_PATHS.leaderboardLearning, element: wrapRoute(LearningLeaderboard) },
  { path: ROUTE_PATHS.leaderboardWeekly, element: wrapRoute(WeeklyLeaderboard) },

  // Notifications (protected)
  { path: ROUTE_PATHS.notifications, element: wrapRoute(NotificationsCenter, { protected: true }) },
  { path: ROUTE_PATHS.notificationsSettings, element: wrapRoute(NotificationSettings, { protected: true }) },
  { path: ROUTE_PATHS.notificationDetail, element: wrapRoute(NotificationDetail, { protected: true }) },

  // Challenges (mixed)
  { path: ROUTE_PATHS.challenges, element: wrapRoute(ChallengesDashboard) },
  { path: ROUTE_PATHS.challengesDaily, element: wrapRoute(DailyChallenges) },
  { path: ROUTE_PATHS.challengeDetail, element: wrapRoute(ChallengeDetail) },
  { path: ROUTE_PATHS.challengesHistory, element: wrapRoute(ChallengesHistory, { protected: true }) },

  // Journal (protected)
  { path: ROUTE_PATHS.journal, element: wrapRoute(JournalDashboard, { protected: true }) },
  { path: ROUTE_PATHS.journalNew, element: wrapRoute(JournalNewEntry, { protected: true }) },
  { path: ROUTE_PATHS.journalEntry, element: wrapRoute(JournalEntry, { protected: true }) },
  { path: ROUTE_PATHS.journalEdit, element: wrapRoute(JournalEdit, { protected: true }) },

  // Profiles (mixed)
  { path: ROUTE_PATHS.users, element: wrapRoute(UsersDirectory) },
  { path: ROUTE_PATHS.userProfile, element: wrapRoute(UserPublicProfile) },
  { path: ROUTE_PATHS.profileEdit, element: wrapRoute(ProfileEdit, { protected: true }) },
  { path: ROUTE_PATHS.profilePrivacy, element: wrapRoute(ProfilePrivacySettings, { protected: true }) },

  // Sessions (protected)
  { path: ROUTE_PATHS.sessions, element: wrapRoute(SessionsDashboard, { protected: true }) },
  { path: ROUTE_PATHS.sessionsStudy, element: wrapRoute(StudySessions, { protected: true }) },
  { path: ROUTE_PATHS.sessionsFocus, element: wrapRoute(FocusSessions, { protected: true }) },
  { path: ROUTE_PATHS.sessionsMeditation, element: wrapRoute(MeditationSessions, { protected: true }) },
  { path: ROUTE_PATHS.sessionDetail, element: wrapRoute(SessionDetail, { protected: true }) },

  // Quests (protected)
  { path: ROUTE_PATHS.quests, element: wrapRoute(QuestsDashboard, { protected: true }) },
  { path: ROUTE_PATHS.questDetail, element: wrapRoute(QuestDetail, { protected: true }) },
  { path: ROUTE_PATHS.questStart, element: wrapRoute(QuestStart, { protected: true }) },
  { path: ROUTE_PATHS.ambitions, element: wrapRoute(AmbitionsManager, { protected: true }) },
];

/**
 * Priority 2 - Community & support routes
 */
export const priority2Routes: RouteObject[] = [
  // Help & Support (public)
  { path: ROUTE_PATHS.help, element: wrapRoute(HelpCenter) },
  { path: ROUTE_PATHS.helpFaq, element: wrapRoute(FAQ) },
  { path: ROUTE_PATHS.helpTutorials, element: wrapRoute(Tutorials) },
  { path: ROUTE_PATHS.helpContact, element: wrapRoute(ContactSupport) },
  { path: ROUTE_PATHS.helpSearch, element: wrapRoute(HelpSearch) },
  { path: ROUTE_PATHS.helpArticle, element: wrapRoute(HelpArticle) },

  // Activity Feed (mixed)
  { path: ROUTE_PATHS.activity, element: wrapRoute(ActivityFeed) },
  { path: ROUTE_PATHS.activityMe, element: wrapRoute(MyActivity, { protected: true }) },
  { path: ROUTE_PATHS.activityUser, element: wrapRoute(UserActivity) },

  // Posts & Community (mixed)
  { path: ROUTE_PATHS.posts, element: wrapRoute(PostsFeed) },
  { path: ROUTE_PATHS.postsNew, element: wrapRoute(CreatePost, { protected: true }) },
  { path: ROUTE_PATHS.postDetail, element: wrapRoute(PostDetail) },
  { path: ROUTE_PATHS.postEdit, element: wrapRoute(PostEdit, { protected: true }) },

  // Wellness & Rituals (protected)
  { path: ROUTE_PATHS.wellness, element: wrapRoute(WellnessDashboard, { protected: true }) },
  { path: ROUTE_PATHS.wellnessStreak, element: wrapRoute(WellnessStreak, { protected: true }) },
  { path: ROUTE_PATHS.wellnessRituals, element: wrapRoute(RitualsManager, { protected: true }) },
  { path: ROUTE_PATHS.ritualDetail, element: wrapRoute(RitualDetail, { protected: true }) },

  // Badges & Auras (mixed)
  { path: ROUTE_PATHS.badges, element: wrapRoute(BadgesGallery) },
  { path: ROUTE_PATHS.badgeDetail, element: wrapRoute(BadgeDetail) },
  { path: ROUTE_PATHS.auras, element: wrapRoute(AurasCollection) },
  { path: ROUTE_PATHS.auraDetail, element: wrapRoute(AuraDetail) },
];

/**
 * Priority 3 - Developer & advanced routes
 */
export const priority3Routes: RouteObject[] = [
  // API Developer Portal (protected)
  { path: ROUTE_PATHS.developers, element: wrapRoute(DevelopersPortal, { protected: true }) },
  { path: ROUTE_PATHS.developersDocs, element: wrapRoute(DevelopersDocs) },
  { path: ROUTE_PATHS.developersKeys, element: wrapRoute(DevelopersKeys, { protected: true }) },
  { path: ROUTE_PATHS.developersWebhooks, element: wrapRoute(DevelopersWebhooks, { protected: true }) },

  // Reporting & Export (protected)
  { path: ROUTE_PATHS.reports, element: wrapRoute(ReportsDashboard, { protected: true }) },
  { path: ROUTE_PATHS.reportsGenerate, element: wrapRoute(ReportsGenerate, { protected: true }) },
  { path: ROUTE_PATHS.reportViewer, element: wrapRoute(ReportViewer, { protected: true }) },
  { path: ROUTE_PATHS.dataExport, element: wrapRoute(DataExport, { protected: true }) },

  // Advanced Search (mixed)
  { path: ROUTE_PATHS.search, element: wrapRoute(GlobalSearch) },
  { path: ROUTE_PATHS.searchGlobal, element: wrapRoute(SearchGlobal) },
  { path: ROUTE_PATHS.searchSaved, element: wrapRoute(SearchSaved, { protected: true }) },

  // Teams & Collaboration (mixed)
  { path: ROUTE_PATHS.teams, element: wrapRoute(TeamsDashboard) },
  { path: ROUTE_PATHS.teamsCreate, element: wrapRoute(TeamsCreate) },
  { path: ROUTE_PATHS.teamDashboard, element: wrapRoute(TeamDashboard) },
  { path: ROUTE_PATHS.teamMembers, element: wrapRoute(TeamMembers) },
  { path: ROUTE_PATHS.teamChallenges, element: wrapRoute(TeamChallenges) },

  // Events & Calendar (public)
  { path: ROUTE_PATHS.events, element: wrapRoute(EventsDashboard) },
  { path: ROUTE_PATHS.eventDetail, element: wrapRoute(EventDetail) },
  { path: ROUTE_PATHS.eventCreate, element: wrapRoute(EventCreate) },
  { path: ROUTE_PATHS.calendar, element: wrapRoute(CalendarView) },
];

/**
 * Audit & Security routes
 */
export const auditRoutes: RouteObject[] = [
  { path: ROUTE_PATHS.audit, element: wrapRoute(AuditComplete) },
  { path: ROUTE_PATHS.auditCompleteness, element: wrapRoute(AuditCompleteness) },
  { path: ROUTE_PATHS.auditSecurity, element: wrapRoute(AuditPage) },
  { path: ROUTE_PATHS.securityMonitoring, element: wrapRoute(SecurityMonitoring) },
  { path: ROUTE_PATHS.rlsDocumentation, element: wrapRoute(RLSDocumentation) },
  { path: ROUTE_PATHS.migrationDashboard, element: wrapRoute(MigrationDashboardPage) },
];

/**
 * Content & Legal routes
 */
export const contentRoutes: RouteObject[] = [
  { path: ROUTE_PATHS.sitemap, element: wrapRoute(Sitemap) },
  { path: ROUTE_PATHS.shareTest, element: wrapRoute(ShareTestPage) },
  { path: ROUTE_PATHS.library, element: wrapRoute(LibraryPage) },
  { path: ROUTE_PATHS.mngMethod, element: wrapRoute(MngMethod) },
  { path: ROUTE_PATHS.statistics, element: wrapRoute(Statistics) },
  { path: ROUTE_PATHS.studyPlanner, element: wrapRoute(StudyPlanner) },
  { path: ROUTE_PATHS.community, element: wrapRoute(CommunityHub) },
  { path: ROUTE_PATHS.homepage, element: wrapRoute(ModernHomepage) },
  { path: ROUTE_PATHS.achievements, element: wrapRoute(Achievements) },
  { path: ROUTE_PATHS.favorites, element: wrapRoute(Favorites) },
  { path: ROUTE_PATHS.viewingHistory, element: wrapRoute(ViewingHistory) },
  { path: ROUTE_PATHS.collections, element: wrapRoute(Collections) },
  { path: ROUTE_PATHS.gamificationDashboard, element: wrapRoute(GamificationDashboard) },
  { path: ROUTE_PATHS.advancedAnalytics, element: wrapRoute(AdvancedAnalyticsDashboard) },
  { path: ROUTE_PATHS.settings, element: wrapRoute(UserSettings) },
  { path: ROUTE_PATHS.designSystem, element: wrapRoute(DesignSystemPage) },
  { path: ROUTE_PATHS.performanceDashboard, element: wrapRoute(PerformanceDashboard) },
  { path: ROUTE_PATHS.accessibilityDashboard, element: wrapRoute(AccessibilityDashboard) },
  { path: ROUTE_PATHS.effectivenessDashboard, element: wrapRoute(EffectivenessDashboard) },
  { path: ROUTE_PATHS.pwaAnalytics, element: wrapRoute(PWAAnalytics) },
  { path: ROUTE_PATHS.sharedTemplates, element: wrapRoute(SharedTemplatesPage) },
  { path: ROUTE_PATHS.templateAnalytics, element: wrapRoute(TemplateAnalyticsDashboard) },
];

/**
 * Legal & Policy routes
 */
export const legalRoutes: RouteObject[] = [
  { path: ROUTE_PATHS.mentionsLegales, element: wrapRoute(MentionsLegales) },
  { path: ROUTE_PATHS.politiqueConfidentialite, element: wrapRoute(PolitiqueConfidentialite) },
  { path: ROUTE_PATHS.cgu, element: wrapRoute(CGU) },
  { path: ROUTE_PATHS.declarationAccessibilite, element: wrapRoute(DeclarationAccessibilite) },
  { path: ROUTE_PATHS.mesDonneesRgpd, element: wrapRoute(MesDonneesRGPD) },
  { path: ROUTE_PATHS.installPwa, element: wrapRoute(InstallPWA) },
];

/**
 * Store routes
 */
export const storeRoutes: RouteObject[] = [
  { path: ROUTE_PATHS.store, element: wrapRoute(Store) },
  { path: ROUTE_PATHS.productDetail, element: wrapRoute(ProductDetail) },
];

/**
 * Redirect routes - Legacy support
 */
export const redirectRoutes: RouteObject[] = [
  // EDN legacy redirects
  { path: ROUTE_PATHS.ednLegacy, element: <Navigate to={ROUTE_PATHS.ednComplete} replace /> },
  { path: ROUTE_PATHS.ednLegacyWithSlug, element: <Navigate to={ROUTE_PATHS.ednCompleteDetail} replace /> },
  { path: ROUTE_PATHS.ednItemsLegacy, element: <Navigate to={ROUTE_PATHS.ednComplete} replace /> },

  // Audit legacy redirects
  { path: ROUTE_PATHS.auditGeneral, element: <Navigate to={ROUTE_PATHS.audit} replace /> },
  { path: ROUTE_PATHS.auditEdn, element: <Navigate to={ROUTE_PATHS.audit} replace /> },
  { path: ROUTE_PATHS.auditUnified, element: <Navigate to={ROUTE_PATHS.audit} replace /> },
  { path: ROUTE_PATHS.auditIc1, element: <Navigate to={ROUTE_PATHS.audit} replace /> },
  { path: ROUTE_PATHS.auditIc2, element: <Navigate to={ROUTE_PATHS.audit} replace /> },
  { path: ROUTE_PATHS.auditIc4, element: <Navigate to={ROUTE_PATHS.audit} replace /> },
  { path: ROUTE_PATHS.auditCompleteLegacy, element: <Navigate to={ROUTE_PATHS.audit} replace /> },
];

/**
 * All routes combined
 */
export const allRoutes: RouteObject[] = [
  ...coreRoutes,
  ...ednRoutes,
  ...ecosRoutes,
  ...adminRoutes,
  ...medMngRoutes,
  ...priority1Routes,
  ...priority2Routes,
  ...priority3Routes,
  ...auditRoutes,
  ...contentRoutes,
  ...legalRoutes,
  ...storeRoutes,
  ...redirectRoutes,
  { path: ROUTE_PATHS.notFound, element: wrapRoute(NotFound) },
];
