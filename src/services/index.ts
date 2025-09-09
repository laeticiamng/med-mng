/**
 * Services unifiés - doublons supprimés
 */

// Service analytics unifié (remplace tous les anciens services analytics)
export { analyticsService } from './UnifiedAnalyticsService';

// Services business
export { musicService } from './business/MusicService';
export { generationService } from './business/GenerationService';
export { contentService } from './business/ContentService';

// Services core
export { apiService } from './core/ApiService';
export { authService } from './core/AuthService';
export { errorService } from './core/ErrorService';
export { cacheService } from './core/CacheService';

// Types
export type { ApiServiceConfig } from './core/ApiService';
export type { ExtendedGenerationRequest, ExtendedGenerationResponse } from './business/GenerationService';