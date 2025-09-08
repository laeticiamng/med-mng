/**
 * 🎯 TYPES CONFIGURATION - MED-MNG v3.0
 * Types pour la configuration de l'application
 */

// ==========================================
// TYPES DE CONFIGURATION
// ==========================================

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    musicGeneration: boolean;
    socialFeatures: boolean;
    analytics: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    animations: boolean;
    reducedMotion: boolean;
  };
}