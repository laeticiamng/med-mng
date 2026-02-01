/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIB CENTRAL INDEX - Exports unifiés
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Core utilities
export * from './analytics';
export * from './api-client';
export * from './audioCache';
export * from './secureApiClient';
export * from './sentry';
export * from './shopify';
export * from './utils';

// Unified API Client (RECOMMANDÉ pour Edge Functions)
export { 
  audioApi, 
  coreApi, 
  systemApi, 
  contentApi, 
  unifiedApi 
} from './unifiedApiClient';
