/**
 * Barrel exports pour les services du projet
 * Centralise l'accès aux services business
 */

// Core services
export { apiService } from './core/ApiService';
export { authService } from './core/AuthService';
export { errorService } from './core/ErrorService';
export { analyticsService } from './core/AnalyticsService';

// Business services
export { musicService } from './business/MusicService';
export { generationService } from './business/GenerationService';
export { contentService } from './business/ContentService';

// Types
export type { ApiServiceConfig } from './core/ApiService';
export type { ExtendedGenerationRequest, ExtendedGenerationResponse } from './business/GenerationService';