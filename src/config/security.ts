/**
 * Configuration sécurisée centralisée
 * Remplace les constantes codées en dur
 */

import { SecurityConfig, RateLimitConfig } from '../types/security';

// Configuration par défaut pour le développement
const DEVELOPMENT_CONFIG: SecurityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // Plus permissif en dev
    strictMaxRequests: 50,
  },
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://yaincoxihiqdksxgrsrk.supabase.co'
    ],
    credentials: true,
  },
  headers: {
    enableCSP: false, // Désactivé en dev pour faciliter le debugging
    enableHSTS: false,
  }
};

// Configuration pour la production
const PRODUCTION_CONFIG: SecurityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // Plus strict en prod
    strictMaxRequests: 5,
  },
  cors: {
    allowedOrigins: [], // À définir via variables d'environnement
    credentials: true,
  },
  headers: {
    enableCSP: true,
    enableHSTS: true,
  }
};

/**
 * Obtient la configuration de sécurité basée sur l'environnement
 */
export function getSecurityConfig(): SecurityConfig {
  const env = process.env.NODE_ENV || 'development';
  
  // Configuration de base selon l'environnement
  let config = env === 'production' ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;
  
  // Override avec les variables d'environnement si disponibles
  if (process.env.CORS_ALLOWED_ORIGINS) {
    config.cors.allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
      .split(',')
      .map(origin => origin.trim());
  }
  
  if (process.env.RATE_LIMIT_WINDOW_MS) {
    config.rateLimit.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10);
  }
  
  if (process.env.RATE_LIMIT_MAX_REQUESTS) {
    config.rateLimit.maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10);
  }
  
  if (process.env.RATE_LIMIT_STRICT_MAX_REQUESTS) {
    config.rateLimit.strictMaxRequests = parseInt(process.env.RATE_LIMIT_STRICT_MAX_REQUESTS, 10);
  }
  
  return config;
}

/**
 * Configuration du rate limiting standard
 */
export function getStandardRateLimitConfig(): RateLimitConfig {
  const config = getSecurityConfig();
  
  return {
    windowMs: config.rateLimit.windowMs,
    maxRequests: config.rateLimit.maxRequests,
    keyGenerator: (req) => req.ip || 'unknown',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  };
}

/**
 * Configuration du rate limiting strict pour les APIs sensibles
 */
export function getStrictRateLimitConfig(): RateLimitConfig {
  const config = getSecurityConfig();
  
  return {
    windowMs: config.rateLimit.windowMs,
    maxRequests: config.rateLimit.strictMaxRequests,
    keyGenerator: (req) => req.ip || 'unknown',
    skipSuccessfulRequests: false,
    skipFailedRequests: true, // Ne pas compter les erreurs 4xx
  };
}

/**
 * Validation de la configuration sécurité au démarrage
 */
export function validateSecurityConfig(): void {
  const config = getSecurityConfig();
  
  // Validation CORS
  if (process.env.NODE_ENV === 'production' && config.cors.allowedOrigins.length === 0) {
    console.warn('⚠️  SECURITY WARNING: No CORS origins configured for production');
  }
  
  // Validation Rate Limiting
  if (config.rateLimit.maxRequests > 10000) {
    console.warn('⚠️  SECURITY WARNING: Rate limit is very high, potential DDoS vulnerability');
  }
  
  // Validation Headers
  if (process.env.NODE_ENV === 'production' && !config.headers.enableHSTS) {
    console.warn('⚠️  SECURITY WARNING: HSTS disabled in production');
  }
  
  console.log('✅ Security configuration validated successfully');
}