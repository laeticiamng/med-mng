import { getEnvironment } from './env';

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  musicGeneration: boolean;
  realTimeFeatures: boolean;
  analytics: boolean;
  advancedAudioControls: boolean;
  socialFeatures: boolean;
  offlineMode: boolean;
  betaFeatures: boolean;
}

/**
 * Get feature flags based on environment and configuration
 */
export function getFeatureFlags(): FeatureFlags {
  const env = getEnvironment();
  
  return {
    musicGeneration: env.ENABLE_MUSIC_GENERATION,
    realTimeFeatures: env.ENABLE_REAL_TIME_FEATURES,
    analytics: env.ENABLE_ANALYTICS,
    
    // Environment-specific features
    advancedAudioControls: env.NODE_ENV !== 'development',
    socialFeatures: env.NODE_ENV === 'production',
    offlineMode: env.NODE_ENV === 'production',
    betaFeatures: env.NODE_ENV === 'development' || env.NODE_ENV === 'staging',
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Feature flag middleware for Express routes
 */
export function requireFeature(feature: keyof FeatureFlags) {
  return (req: any, res: any, next: any) => {
    if (!isFeatureEnabled(feature)) {
      return res.status(404).json({
        error: 'Feature not available',
        message: `The ${feature} feature is currently disabled`
      });
    }
    next();
  };
}