// Barrel export for all services
// This allows importing services like: import { musicService } from '@shared/services'
// Note: Types from services use 'Service' prefix to avoid conflicts with global types

// Activity & Social
export {
  type ActivityType,
  type TargetType,
  type ActivityItem,
  activityFeedService,
} from './activity-feed.service';

export * from './posts.service';
export * from './post-comments.service';
export * from './user-activity.service';

// Admin & Monitoring
export * from './admin.service';
export * from './moderation.service';
export * from './monitoringService';
export * from './performanceAnalyticsService';
export {
  type PlatformHealthMetrics,
  type UserActivityAnalytics,
  type PlatformContentAnalytics,
  platformAnalyticsService,
} from './platformAnalytics.service';
export * from './reports.service';

// Content & Learning
export * from './ecosService';
export * from './ednTableauxService';
export * from './pedagogicalContentService';
export * from './qcmService';
export * from './recommendations.service';
export {
  type ServiceSearchResult,
  type PostServiceSearchResult,
  type UserServiceSearchResult,
  type TeamServiceSearchResult,
  type WellnessServiceSearchResult,
  type SearchSuggestion,
  type SearchHistory,
  type ServiceSearchFilters,
  globalSearch,
  searchPosts,
  searchUsers,
  searchTeamsGlobal,
  searchWellness,
  getSearchSuggestions,
  getSearchHistory,
  getTrendingSearches,
  getRecentSearches,
  getPopularSearches,
  clearSearchHistory,
  deleteSearchHistoryItem,
  logSearch,
  logSearchResultClick,
  searchWithCursor,
} from './search.service';

// User Management
export * from './user-collections.service';
export * from './user-favorites.service';
export * from './user-profile.service';
export * from './user-security.service';
export * from './user-viewing-history.service';
export * from './userManagement.service';

// Revision & Study Methods
export * from './revision-methods.service';

// Music & Media
export * from './musicService';
export * from './musicQueueService';
export * from './musicCacheService';
export * from './musicAnalyticsService';

// Notifications & Communication
export * from './notifications.service';
export * from './pushNotifications';
export * from './newsletter.service';

// Support & Help
export {
  type SupportTicket,
  type SupportTicketResponse,
  contactSupportService,
} from './contact-support.service';
export * from './help.service';

// Gamification
export * from './badges.service';

// Teams
export {
  type Team,
  type TeamMember,
  type TeamInvitation,
  type TeamChannel,
  type TeamMessage,
  createTeam,
  getTeam,
  getTeamBySlug,
  getUserTeams,
  updateTeam,
  deleteTeam,
  searchTeamsService,
  searchTeams,
  addTeamMember,
  getTeamMembers,
  getTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  inviteToTeam,
  getTeamInvitations,
  acceptInvitation,
  declineInvitation,
  createChannel,
  getTeamChannels,
  getChannel,
  updateChannel,
  deleteChannel,
  postMessage,
  getChannelMessages,
  updateMessage,
  deleteMessage,
  logTeamActivity,
  getTeamActivityLog,
} from './teams.service';

// Health & Wellness
export * from './wellness.service';

// Data Management
export * from './data-export.service';
export * from './export-jobs.service';

// Infrastructure
export * from './api.service';
export * from './alertService';
export * from './contentReporting.service';
export * from './events.service';
export * from './healthService';
export * from './logService';
export * from './performanceMonitoringService';
export * from './rateLimitService';
