export const ROUTE_PATHS = {
  home: '/',
  sitemap: '/sitemap',
  shareTest: '/share-test',
  modularDashboard: '/modular-dashboard',
  dashboard: '/dashboard',
  learningDashboard: '/learning-dashboard',
  platformStatus: '/platform-status',
  monitoring: '/monitoring',
  systemManagement: '/system-management',
  platformSettings: '/platform-settings',
  optimizedIndex: '/optimized',
  generator: '/generator',
  ednComplete: '/edn-complete',
  ednCompleteDetail: '/edn-complete/:slug',
  ednImmersive: '/edn/:slug/immersive',
  ednMusicLibrary: '/edn/music-library',
  ednQualityDashboard: '/edn/quality-dashboard',
  ecosIndex: '/ecos',
  ecosScenario: '/ecos/:scenarioId',
  store: '/store',
  productDetail: '/product/:handle',
  audit: '/audit',
  auditCompleteness: '/audit-completeness',
  migrationDashboard: '/migration-dashboard',
  mngMethod: '/mng-method',
  mentionsLegales: '/mentions-legales',
  politiqueConfidentialite: '/politique-confidentialite',
  cgu: '/cgu',
  declarationAccessibilite: '/declaration-accessibilite',
  medMngLogin: '/med-mng/login',
  medMngSignup: '/med-mng/signup',
  medMngPricing: '/med-mng/pricing',
  medMngSubscribe: '/med-mng/subscribe/:planId',
  medMngSuccess: '/med-mng/success',
  medMngCreate: '/med-mng/create',
  medMngLibrary: '/med-mng/library',
  medMngProfile: '/med-mng/profile',
  medMngPlayer: '/med-mng/player/:songId',
  medMngPlaylists: '/med-mng/playlists',
  medMngPlaylistDetail: '/med-mng/playlists/:playlistId',
  medMngAnalytics: '/med-mng/analytics',
  chat: '/chat',
  ednAudit: '/edn-audit',
  adminIndex: '/admin',
  adminImport: '/admin/import',
  adminAudit: '/admin/audit',
  adminExtractEdn: '/admin/extract-edn',
  adminExtractEcos: '/admin/extract-ecos',
  adminExtractObjectifs: '/admin/extract-objectifs',
  adminOicQuality: '/admin/oic-quality',
  adminComplete: '/admin/complete',
  adminPanel: '/admin-panel',
  adminRoles: '/admin/roles',
  adminDashboardAnalytics: '/admin/dashboard',
  performanceDashboard: '/performance-dashboard',
  auditSecurity: '/audit-security',
  sharedTemplates: '/shared-templates',
  templateAnalytics: '/template-analytics',
  library: '/library',
  accessibilityDashboard: '/accessibility-dashboard',
  effectivenessDashboard: '/effectiveness-dashboard',
  rlsDocumentation: '/rls-documentation',
  securityMonitoring: '/security-monitoring',
  statistics: '/statistics',
  advancedAnalytics: '/advanced-analytics',
  studyPlanner: '/study-planner',
  community: '/community',
  homepage: '/homepage',
  achievements: '/achievements',
  favorites: '/favorites',
  settings: '/settings',
  viewingHistory: '/viewing-history',
  collections: '/collections',
  collectionDetail: '/collections/:collectionId',
  designSystem: '/design-system',
  mesDonneesRgpd: '/mes-donnees-rgpd',
  installPwa: '/install',
  pwaAnalytics: '/pwa-analytics',
  ednLegacy: '/edn',
  ednLegacyWithSlug: '/edn/:slug',
  ednItemsLegacy: '/items-edn',
  auditGeneral: '/audit-general',
  auditEdn: '/audit-edn',
  auditUnified: '/audit-unified',
  auditIc1: '/audit-ic1',
  auditIc2: '/audit-ic2',
  auditIc4: '/audit-ic4',
  auditCompleteLegacy: '/audit-complete',

  // ==================== NOUVELLES ROUTES PRIORITÉ 1 🔥 ====================

  // Journal & Notes
  journal: '/journal',
  journalNew: '/journal/new',
  journalEntry: '/journal/:entryId',
  journalEdit: '/journal/:entryId/edit',

  // Challenges Quotidiens
  challenges: '/challenges',
  challengesDaily: '/challenges/daily',
  challengeDetail: '/challenges/:challengeId',
  challengesHistory: '/challenges/history',

  // Leaderboard
  leaderboard: '/leaderboard',
  leaderboardFocus: '/leaderboard/focus',
  leaderboardLearning: '/leaderboard/learning',
  leaderboardWeekly: '/leaderboard/weekly',

  // Profils Utilisateurs
  users: '/users',
  userProfile: '/users/:userId',
  profileEdit: '/profile/edit',
  profilePrivacy: '/profile/privacy',

  // Sessions & Activités
  sessions: '/sessions',
  sessionsStudy: '/sessions/study',
  sessionsFocus: '/sessions/focus',
  sessionsMeditation: '/sessions/meditation',
  sessionDetail: '/sessions/:sessionId',

  // Notifications
  notifications: '/notifications',
  notificationsSettings: '/notifications/settings',
  notificationDetail: '/notifications/:notifId',

  // Quests & Ambitions
  quests: '/quests',
  questDetail: '/quests/:questId',
  questStart: '/quests/:questId/start',
  ambitions: '/ambitions',

  // Goals & Objectives
  goals: '/goals',
  goalDetail: '/goals/:goalId',
  goalsCreate: '/goals/create',

  // ==================== NOUVELLES ROUTES PRIORITÉ 2 🟡 ====================

  // Help & Support
  help: '/help',
  helpFaq: '/help/faq',
  helpTutorials: '/help/tutorials',
  helpContact: '/help/contact',
  helpSearch: '/help/search',
  helpArticle: '/help/article/:articleId',

  // Activity Feed
  activity: '/activity',
  activityMe: '/activity/me',
  activityUser: '/activity/:userId',

  // Posts & Community
  posts: '/posts',
  postsNew: '/posts/new',
  postDetail: '/posts/:postId',
  postEdit: '/posts/:postId/edit',

  // Wellness & Rituals
  wellness: '/wellness',
  wellnessStreak: '/wellness/streak',
  wellnessRituals: '/wellness/rituals',
  ritualDetail: '/wellness/rituals/:ritualId',

  // Badges & Auras
  badges: '/badges',
  badgeDetail: '/badges/:badgeId',
  auras: '/auras',
  auraDetail: '/auras/:auraId',
  gamificationDashboard: '/gamification',
  badgeCollection: '/badges/collection',
  communityLeaderboard: '/leaderboard/community',

  // ==================== NOUVELLES ROUTES PRIORITÉ 3 🟢 ====================

  // API Developer Portal
  developers: '/developers',
  developersDocs: '/developers/docs',
  developersKeys: '/developers/keys',
  developersWebhooks: '/developers/webhooks',

  // Reporting & Export
  reports: '/reports',
  reportsGenerate: '/reports/generate',
  reportViewer: '/reports/:reportId',
  dataExport: '/export',

  // Advanced Search
  search: '/search',
  searchGlobal: '/search/global',
  searchSaved: '/search/saved',

  // Teams & Collaboration
  teams: '/teams',
  teamsCreate: '/teams/create',
  teamDashboard: '/teams/:teamId',
  teamMembers: '/teams/:teamId/members',
  teamChallenges: '/teams/:teamId/challenges',

  // Events & Calendar
  events: '/events',
  eventDetail: '/events/:eventId',
  eventCreate: '/events/create',
  calendar: '/calendar',

  notFound: '*',
} as const;

export const ROUTE_REDIRECTS = [
  ROUTE_PATHS.ednLegacy,
  ROUTE_PATHS.ednLegacyWithSlug,
  ROUTE_PATHS.ednItemsLegacy,
  ROUTE_PATHS.auditGeneral,
  ROUTE_PATHS.auditEdn,
  ROUTE_PATHS.auditUnified,
  ROUTE_PATHS.auditIc1,
  ROUTE_PATHS.auditIc2,
  ROUTE_PATHS.auditIc4,
  ROUTE_PATHS.auditCompleteLegacy,
] as const;

export const ROUTE_LIST = Object.values(ROUTE_PATHS);

export const ALL_KNOWN_ROUTES: readonly string[] = [
  ...ROUTE_LIST,
  ...ROUTE_REDIRECTS,
];
