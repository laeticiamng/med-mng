/**
 * Services unifiés - doublons supprimés
 */

// Service analytics unifié (remplace tous les anciens services analytics)
export { analyticsService } from './UnifiedAnalyticsService';

// Service musical unifié (remplace tous les anciens services musicaux)
export { musicService } from './UnifiedMusicService';
export { generationService } from './business/GenerationService';
export { musicOrchestrator } from './musicOrchestrator';
export { contentLibraryService } from './library/ContentLibraryService';
export { trackCanonicalEvent, setAnalyticsContext } from './CanonicalAnalyticsTracker';
// Service de contenu unifié (remplace tous les anciens services de contenu)
export { contentService } from './UnifiedContentService';

// Services core
export { apiService } from './core/ApiService';
export { authService } from './core/AuthService';
export { errorService } from './core/ErrorService';
export { cacheService } from './core/CacheService';

// Types
export type { ApiServiceConfig } from './core/ApiService';
export type { ExtendedGenerationRequest, ExtendedGenerationResponse } from './business/GenerationService';