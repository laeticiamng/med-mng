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

// ============================================================================
// NOUVELLES INTÉGRATIONS PREMIUM (v9.4)
// ============================================================================

// Firecrawl - Web scraping IA
export { firecrawlApi } from './api/firecrawl';
export type { ScrapeOptions, SearchOptions, FirecrawlResponse } from './api/firecrawl';

// Perplexity - Chat IA avec recherche web temps réel
export { perplexityApi } from './api/perplexity';
export type { PerplexityModel, PerplexityMessage, PerplexityOptions, PerplexityResponse } from './api/perplexity';

// Whisper - Transcription audio
export { whisperApi } from './api/whisper';
export type { TranscribeOptions, TranscribeResponse } from './api/whisper';

// ============================================================================
// MEDICAL AI COPILOT (v9.5 - Révolutionnaire)
// ============================================================================

// Medical AI Copilot - Orchestration intelligente de tous les services
export { medicalCopilot, default as MedicalCopilot } from './api/medicalCopilot';
export type { CopilotMode, CopilotContext, CopilotOptions, CopilotResponse } from './api/medicalCopilot';
