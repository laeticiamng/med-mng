/**
 * Analytics Events Configuration
 * Définit tous les événements trackés dans l'application
 */

export const ANALYTICS_EVENTS = {
  // 📄 Page Views
  pageView: "page_view",
  pageExit: "page_exit",

  // 🔍 Search & Filter
  searchPerformed: "search_performed",
  advancedSearchUsed: "advanced_search_used",
  filterApplied: "filter_applied",
  sortApplied: "sort_applied",

  // 💾 Favorites & Collections
  favoriteAdded: "favorite_added",
  favoriteRemoved: "favorite_removed",
  collectionCreated: "collection_created",
  itemAddedToCollection: "item_added_to_collection",

  // 👀 Content Consumption
  itemViewed: "item_viewed",
  itemExportedToExcel: "item_exported_to_excel",
  itemExportedToCSV: "item_exported_to_csv",
  itemExportedToPDF: "item_exported_to_pdf",
  itemShared: "item_shared",
  itemRated: "item_rated",

  // 🎵 Music & Library
  songPlayed: "song_played",
  songPaused: "song_paused",
  songStopped: "song_stopped",
  playlistCreated: "playlist_created",
  playlistEdited: "playlist_edited",
  playlistDeleted: "playlist_deleted",
  songAddedToPlaylist: "song_added_to_playlist",
  songRemovedFromPlaylist: "song_removed_from_playlist",

  // 📚 Study & Learning
  quizStarted: "quiz_started",
  quizCompleted: "quiz_completed",
  scenarioStarted: "scenario_started",
  scenarioCompleted: "scenario_completed",
  goalCreated: "goal_created",
  goalCompleted: "goal_completed",
  noteCreated: "note_created",
  noteEdited: "note_edited",
  noteDeleted: "note_deleted",

  // 💳 E-commerce
  productViewed: "product_viewed",
  productAddedToCart: "product_added_to_cart",
  productRemovedFromCart: "product_removed_from_cart",
  checkoutStarted: "checkout_started",
  checkoutAbandoned: "checkout_abandoned",
  purchaseCompleted: "purchase_completed",
  wishlistCreated: "wishlist_created",
  productReviewSubmitted: "product_review_submitted",

  // 💬 Social & Community
  commentPosted: "comment_posted",
  discussionCreated: "discussion_created",
  userFollowed: "user_followed",
  userUnfollowed: "user_unfollowed",
  messageCreated: "message_created",
  messageSent: "message_sent",

  // ⚙️ Settings & Profile
  profileEdited: "profile_edited",
  passwordChanged: "password_changed",
  twoFactorEnabled: "two_factor_enabled",
  twoFactorDisabled: "two_factor_disabled",
  settingChanged: "setting_changed",
  languageChanged: "language_changed",
  themeChanged: "theme_changed",

  // 🔐 Auth Events
  loginSuccessful: "login_successful",
  loginFailed: "login_failed",
  signupSuccessful: "signup_successful",
  signupFailed: "signup_failed",
  logoutSuccessful: "logout_successful",
  passwordResetRequested: "password_reset_requested",
  passwordResetCompleted: "password_reset_completed",

  // 📊 Dashboard & Analytics
  dashboardViewed: "dashboard_viewed",
  reportGenerated: "report_generated",
  reportExported: "report_exported",
  metricsViewed: "metrics_viewed",

  // 🛠️ Admin Events
  contentImported: "content_imported",
  contentExported: "content_exported",
  userManaged: "user_managed",
  dataDeleted: "data_deleted",
  auditLogViewed: "audit_log_viewed",

  // 🐛 Error & Performance
  errorOccurred: "error_occurred",
  performanceIssueDetected: "performance_issue_detected",
  apiCallFailed: "api_call_failed",
  pageLoadSlow: "page_load_slow",

  // 💼 Business Events
  subscriptionCreated: "subscription_created",
  subscriptionCancelled: "subscription_cancelled",
  subscriptionDowngraded: "subscription_downgraded",
  subscriptionUpgraded: "subscription_upgraded",
  trialStarted: "trial_started",
  trialEnded: "trial_ended",
};

/**
 * Interface pour tracker les événements
 */
export interface AnalyticsEventData {
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Catégories d'événements pour organisation
 */
export const ANALYTICS_CATEGORIES = {
  NAVIGATION: "navigation",
  SEARCH: "search",
  CONTENT: "content",
  MUSIC: "music",
  LEARNING: "learning",
  ECOMMERCE: "ecommerce",
  SOCIAL: "social",
  SETTINGS: "settings",
  AUTH: "auth",
  ADMIN: "admin",
  ERROR: "error",
  PERFORMANCE: "performance",
};

/**
 * Propriétés standards pour tous les événements
 */
export interface StandardEventProperties {
  pagePath?: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  connectionSpeed?: string;
  timeSpentMs?: number;
}

/**
 * Configuration pour le suivi des pages
 */
export const PAGE_TRACKING_CONFIG = {
  trackPageLoadTime: true,
  trackTimeOnPage: true,
  trackScrollDepth: true,
  trackClickTracking: true,
  trackFormInteractions: true,
  trackVideoPlays: false,
  trackDownloads: true,
};

/**
 * Configuration pour les timeouts et limites
 */
export const ANALYTICS_CONFIG = {
  // Batching de requêtes
  batchSize: 10,
  batchTimeout: 5000, // 5 secondes

  // Limites de rétention
  maxStoredEvents: 1000,
  eventRetentionDays: 90,

  // Sampling (pour les apps à fort traffic)
  samplingRate: 1.0, // 100% par défaut

  // Debugging
  debug: false,
  logEvents: false,
};
