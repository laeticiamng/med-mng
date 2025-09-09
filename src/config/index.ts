/**
 * Configuration centralisée de l'application
 */

export const appConfig = {
  // Environnement
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  
  // API
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '',
    timeout: 30000,
    retryAttempts: 3
  },

  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID || ''
  },

  // Features
  features: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableMusicGeneration: true,
    enableOfflineMode: false,
    enablePWA: true
  },

  // Limites
  limits: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxPlaylistItems: 1000,
    maxSearchResults: 100,
    defaultPageSize: 20
  },

  // Cache
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxEntries: 1000,
    enableServiceWorker: true
  },

  // Audio
  audio: {
    defaultVolume: 0.8,
    fadeInDuration: 500,
    fadeOutDuration: 300,
    supportedFormats: ['mp3', 'wav', 'ogg', 'm4a']
  },

  // Generation
  generation: {
    maxConcurrentRequests: 3,
    timeoutMs: 120000, // 2 minutes
    pollIntervalMs: 2000,
    maxRetries: 5
  },

  // UI
  ui: {
    defaultTheme: 'system' as const,
    animationDuration: 300,
    debounceDelay: 300,
    toastDuration: 5000,
    maxToasts: 3
  },

  // Analytics
  analytics: {
    trackPageViews: true,
    trackUserActions: true,
    trackErrors: true,
    trackPerformance: true,
    batchSize: 10,
    flushInterval: 30000 // 30 seconds
  },

  // Performance
  performance: {
    enableVirtualization: true,
    lazyLoadThreshold: 50,
    imageOptimization: true,
    bundleSplitting: true
  }
} as const;

// Types pour la configuration
export type AppConfig = typeof appConfig;
export type FeatureFlags = typeof appConfig.features;