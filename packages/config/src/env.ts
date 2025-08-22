import { z } from 'zod';

/**
 * Environment validation schema
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Node.js Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  
  // Supabase Configuration
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL').refine(
    (url) => url.includes('supabase.co') || url.includes('localhost'),
    'Supabase URL must be a valid Supabase endpoint'
  ),
  VITE_SUPABASE_ANON_KEY: z.string().min(100, 'Supabase anon key too short').refine(
    (key) => key.startsWith('eyJ'),
    'Invalid Supabase anon key format'
  ),
  
  // API Keys (Server-side only)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(100).optional(),
  OPENAI_API_KEY: z.string().min(40).optional(),
  SUNO_API_KEY: z.string().min(20).optional(),
  
  // Security Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters').optional(),
  CORS_ORIGIN: z.string().default('*'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().positive()).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().positive()).default('100'),
  
  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
  
  // External Services
  SENTRY_DSN: z.string().url().optional(),
  ANALYTICS_API_KEY: z.string().optional(),
  
  // Feature Flags
  ENABLE_MUSIC_GENERATION: z.string().transform(Boolean).default('true'),
  ENABLE_REAL_TIME_FEATURES: z.string().transform(Boolean).default('true'),
  ENABLE_ANALYTICS: z.string().transform(Boolean).default('true'),
  
  // Development/Testing
  SKIP_ENV_VALIDATION: z.string().transform(Boolean).default('false'),
  MOCK_EXTERNAL_APIS: z.string().transform(Boolean).default('false'),
});

/**
 * Runtime environment type
 */
export type Environment = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 */
let validatedEnv: Environment | null = null;

/**
 * Validate environment variables
 * This function should be called at application startup
 */
export function validateEnvironment(): Environment {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    // Skip validation in test environment or if explicitly disabled
    if (process.env.NODE_ENV === 'test' || process.env.SKIP_ENV_VALIDATION === 'true') {
      console.warn('⚠️  Environment validation skipped');
      validatedEnv = envSchema.parse(process.env);
      return validatedEnv;
    }

    console.log('🔍 Validating environment variables...');
    
    const result = envSchema.safeParse(process.env);
    
    if (!result.success) {
      console.error('❌ Environment validation failed:');
      console.error('Missing or invalid environment variables:');
      
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        console.error(`  - ${path}: ${error.message}`);
      });
      
      console.error('\n💡 Required environment variables:');
      console.error('  - VITE_SUPABASE_URL: Your Supabase project URL');
      console.error('  - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key');
      console.error('  - NODE_ENV: development, staging, or production');
      console.error('  - PORT: Server port (default: 3000)');
      
      if (result.data?.NODE_ENV === 'production') {
        console.error('\n🔒 Production-specific requirements:');
        console.error('  - JWT_SECRET: Strong JWT signing secret');
        console.error('  - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin operations');
        console.error('  - SENTRY_DSN: Error monitoring (optional but recommended)');
      }
      
      process.exit(1);
    }
    
    validatedEnv = result.data;
    
    // Log successful validation (without sensitive data)
    console.log('✅ Environment validation successful');
    console.log(`   - Environment: ${validatedEnv.NODE_ENV}`);
    console.log(`   - Port: ${validatedEnv.PORT}`);
    console.log(`   - Supabase URL: ${validatedEnv.VITE_SUPABASE_URL}`);
    console.log(`   - Features enabled: Music=${validatedEnv.ENABLE_MUSIC_GENERATION}, Analytics=${validatedEnv.ENABLE_ANALYTICS}`);
    
    // Production-specific warnings
    if (validatedEnv.NODE_ENV === 'production') {
      if (!validatedEnv.JWT_SECRET) {
        console.warn('⚠️  JWT_SECRET not set - using default (not recommended for production)');
      }
      
      if (!validatedEnv.SENTRY_DSN) {
        console.warn('⚠️  SENTRY_DSN not set - error monitoring disabled');
      }
      
      if (validatedEnv.CORS_ORIGIN === '*') {
        console.warn('⚠️  CORS_ORIGIN set to "*" - consider restricting in production');
      }
    }
    
    return validatedEnv;
    
  } catch (error) {
    console.error('❌ Fatal error during environment validation:', error);
    process.exit(1);
  }
}

/**
 * Get validated environment variables
 * Throws error if validation hasn't been run
 */
export function getEnvironment(): Environment {
  if (!validatedEnv) {
    throw new Error('Environment not validated. Call validateEnvironment() first.');
  }
  return validatedEnv;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnvironment().NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnvironment().NODE_ENV === 'production';
}

/**
 * Check if running in staging mode
 */
export function isStaging(): boolean {
  return getEnvironment().NODE_ENV === 'staging';
}

/**
 * Get Supabase configuration
 */
export function getSupabaseConfig() {
  const env = getEnvironment();
  return {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

/**
 * Get rate limiting configuration
 */
export function getRateLimitConfig() {
  const env = getEnvironment();
  return {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  };
}

/**
 * Get logging configuration
 */
export function getLoggingConfig() {
  const env = getEnvironment();
  return {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  };
}

/**
 * Environment validation middleware for Express
 */
export function createEnvValidationMiddleware() {
  return (req: any, res: any, next: any) => {
    try {
      getEnvironment(); // Will throw if not validated
      next();
    } catch (error) {
      res.status(500).json({
        error: 'Server configuration error',
        message: 'Environment variables not properly configured'
      });
    }
  };
}