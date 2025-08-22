import { getEnvironment } from './env';

/**
 * Security configuration
 */
export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    algorithm: string;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
    optionsSuccessStatus: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  helmet: {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
    hsts: boolean;
  };
}

/**
 * Get security configuration
 */
export function getSecurityConfig(): SecurityConfig {
  const env = getEnvironment();
  
  return {
    jwt: {
      secret: env.JWT_SECRET || 'default-jwt-secret-change-in-production',
      expiresIn: env.NODE_ENV === 'production' ? '1h' : '24h',
      algorithm: 'HS256',
    },
    cors: {
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
      optionsSuccessStatus: 200,
    },
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
      skipSuccessfulRequests: false,
    },
    helmet: {
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false, // Disable for Supabase compatibility
      hsts: env.NODE_ENV === 'production',
    },
  };
}

/**
 * Get CORS configuration
 */
export function getCorsConfig() {
  return getSecurityConfig().cors;
}

/**
 * Get JWT configuration
 */
export function getJwtConfig() {
  return getSecurityConfig().jwt;
}

/**
 * Get allowed origins for CORS
 */
export function getAllowedOrigins(): string[] {
  const env = getEnvironment();
  
  const baseOrigins = ['http://localhost:3000', 'http://localhost:5173'];
  
  if (env.NODE_ENV === 'production') {
    return [
      ...baseOrigins,
      'https://med-music-platform.com',
      'https://app.med-music-platform.com',
      `https://${env.VITE_SUPABASE_URL.split('//')[1]}`,
    ];
  }
  
  if (env.NODE_ENV === 'staging') {
    return [
      ...baseOrigins,
      'https://staging.med-music-platform.com',
      `https://${env.VITE_SUPABASE_URL.split('//')[1]}`,
    ];
  }
  
  return [...baseOrigins, 'http://localhost:*'];
}