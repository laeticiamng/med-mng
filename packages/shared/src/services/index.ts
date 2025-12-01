// Barrel export for all services
// This allows importing services like: import { musicService } from '@shared/services'

// Activity & Social
export * from './activity-feed.service.js';
export * from './posts.service.js';
export * from './post-comments.service.js';
export * from './user-activity.service.js';

// Admin & Monitoring
export * from './admin.service.js';
export * from './moderation.service.js';
export * from './monitoringService.js';
export * from './performanceAnalyticsService.js';
export * from './platformAnalytics.service.js';
export * from './reports.service.js';

// Content & Learning
export * from './ecosService.js';
export * from './ednTableauxService.js';
export * from './pedagogicalContentService.js';
export * from './qcmService.js';
export * from './recommendations.service.js';
export * from './search.service.js';

// User Management
export * from './user-collections.service.js';
export * from './user-favorites.service.js';
export * from './user-profile.service.js';
export * from './user-security.service.js';
export * from './user-viewing-history.service.js';
export * from './userManagement.service.js';

// Revision & Study Methods
export * from './revision-methods.service.js';

// Music & Media
export * from './musicService.js';
export * from './musicQueueService.js';
export * from './musicCacheService.js';
export * from './musicAnalyticsService.js';

// Notifications & Communication
export * from './notifications.service.js';
export * from './pushNotifications.js';
export * from './newsletter.service.js';

// Support & Help
export * from './contact-support.service.js';
export * from './help.service.js';

// Gamification
export * from './badges.service.js';

// Health & Wellness
export * from './wellness.service.js';

// Data Management
export * from './data-export.service.js';
export * from './export-jobs.service.js';

// Infrastructure
export * from './api.service.js';
export * from './alertService.js';
export * from './contentReporting.service.js';
export * from './events.service.js';
export * from './healthService.js';
export * from './logService.js';
export * from './performanceMonitoringService.js';
export * from './rateLimitService.js';
// Note: teams.service.js doesn't exist yet, so we don't export it
// searchTeams is already exported from search.service.js
