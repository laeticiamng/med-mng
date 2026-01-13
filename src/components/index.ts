// ============================================
// MED MNG - Central Component Exports
// ============================================
// IMPORTANT: Some modules have overlapping exports
// Import directly from specific modules to avoid conflicts
// Example: import { MusicLibrary } from '@/components/music';

// Core modules without conflicts
export * from './analytics';
export * from './gamification';
export * from './pwa';
export * from './mentorship';
export * from './ai';
export * from './auth';
export * from './profile';
export * from './settings';
export * from './store';
export * from './chat';
export * from './help';
export * from './search';
export * from './feedback';
export * from './security';
export * from './onboarding';
export * from './common';
export * from './qcm';
export * from './responsive';
export * from './content';
export * from './modern';
export * from './home';
export * from './subscription';
export * from './migration';
export * from './extraction';
export * from './shared';
export * from './quota';
export * from './priority';
export * from './items';
export * from './backup';
export * from './debug';
export * from './devtools';
export * from './documentation';
export * from './effectiveness';
export * from './enhanced';
export * from './platform';
export * from './seo';
export * from './test';
export * from './tests';
export * from './welcome';
export * from './providers';
export * from './completion';
export * from './dashboard';
export * from './quiz';
export * from './recommendations';
export * from './audit';

// Modules with selective exports to avoid conflicts
// Accessibility
export { 
  AccessibilityPanel, 
  AccessibilityCenter, 
  AccessibilityProvider, 
  AccessibilityDashboardMetrics 
} from './accessibility';

// Admin
export { 
  AdminDashboard, 
  AdminAnalytics, 
  AdminContentManager,
  AdminUsersManager 
} from './admin';

// Music (unique exports only)
export { 
  AdvancedMusicGenerator, 
  MusicGenerator, 
  MusicPlayer,
  MusicVersionDisplay,
  SpotifyAIPlayer,
  SpotifyLibrary,
  LyricsViewer,
  EnhancedMusicPlayerControls
} from './music';

// Player (unique exports only)
export { 
  MiniPlayer 
} from './player';

// Mobile (unique exports only)
export { 
  MobileNavigation, 
  MobileOptimizedDashboard, 
  PWAInstallPrompt 
} from './mobile';

// Navigation (unique exports only)
export { 
  AppSidebar, 
  SkipLinks 
} from './navigation';

// Monitoring (unique exports only)
export { 
  AlertsConfiguration, 
  MonitoringDashboard, 
  ProductionMonitor,
  SentryErrorMonitor,
  UnifiedMonitoringDashboard,
  UptimeMonitor
} from './monitoring';

// Global
export { GlobalControls } from './global';

// Notifications (correct exports)
export { 
  SystemAlertManager, 
  SRSNotificationSettings,
  DataQualityMonitor
} from './notifications';

// Social (correct exports - avoiding SocialShare conflict with advanced)
export { 
  CommentThread,
  CommunityHub,
  DirectMessaging,
  ResourceSharing,
  ForumDiscussion
} from './social';

// Layout (correct exports - avoiding GlobalControls conflict)
export { 
  MainNavigation
} from './layout';

// Calendar (correct exports)
export { 
  CalendarSync
} from './calendar';

// Revision (correct exports)
export { 
  SmartReminders,
  RevisionPlanCreator,
  TodayRevisionSession,
  ProgressAnalytics,
  ProgressHeatmap,
  QuizProgressChart
} from './revision';

// Export module (correct exports)
export { 
  PDFExportService,
  ProgressExport
} from './export';

// Ecos
export * from './ecos';

// Study (correct exports)
export { 
  CollaborativeStudy, 
  StudyPlanManager, 
  StudySessionTimer 
} from './study';

// Advanced (correct exports - avoiding SocialShare conflict)
export { 
  AnalyticsTracker,
  BookmarkSystem,
  DragDropManager,
  NotificationSystem,
  OfflineMode,
  SearchSystem,
  UserPersonalization
} from './advanced';

// Performance
export * from './performance';

// Playlists (correct exports)
export { 
  PlaylistDetail,
  PlaylistSearch
} from './playlists';

// Generator (selective exports)
export { 
  GeneratorForm, 
  GenerationHistory, 
  GenerationProgress, 
  GenerationStats,
  StyleSelector,
  RangSelector,
  EdnItemSelector
} from './generator';

// Library (selective exports)
export { 
  LibraryStats, 
  SpotifyLikeLibrary,
  ContinuousPlayer,
  BatchActions
} from './library';

// Lyrics
export { 
  KaraokePlayer 
} from './lyrics';

// Shortcuts (correct export)
export { 
  KeyboardShortcuts as ShortcutsDisplay
} from './shortcuts';

// Audio
export * from './audio';

// System (unique exports only)
export { 
  SystemMonitor 
} from './system';

// EDN
export * from './edn';

// Learning
export { 
  ActivityHeatmap as LearningActivityHeatmap,
  LearningInsights,
  ItemMasteryGrid
} from './learning';

// Med-MNG (selective exports)
export { 
  AuthProvider, 
  MedMngLayout, 
  MedMngNavigation, 
  PricingPlans, 
  SongCard, 
  withAuth 
} from './med-mng';
