/**
 * @med-music/config
 * Centralized configuration management for Med Music Platform
 */

// Environment validation
export {
  validateEnvironment,
  getEnvironment,
  isDevelopment,
  isProduction,
  isStaging,
  getSupabaseConfig,
  getRateLimitConfig,
  getLoggingConfig,
  createEnvValidationMiddleware,
  type Environment
} from './env';

// Feature flags
export {
  getFeatureFlags,
  isFeatureEnabled,
  type FeatureFlags
} from './features';

// Database configuration
export {
  getDatabaseConfig,
  getConnectionString,
  type DatabaseConfig
} from './database';

// Security configuration
export {
  getSecurityConfig,
  getCorsConfig,
  getJwtConfig,
  type SecurityConfig
} from './security';