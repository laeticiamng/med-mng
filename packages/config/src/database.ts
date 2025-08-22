import { getEnvironment } from './env';

/**
 * Database configuration
 */
export interface DatabaseConfig {
  url: string;
  poolSize: number;
  timeout: number;
  ssl: boolean;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Get database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  const env = getEnvironment();
  
  return {
    url: env.VITE_SUPABASE_URL,
    poolSize: env.NODE_ENV === 'production' ? 20 : 5,
    timeout: 30000, // 30 seconds
    ssl: env.NODE_ENV === 'production',
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  };
}

/**
 * Get connection string for database operations
 */
export function getConnectionString(): string {
  const config = getDatabaseConfig();
  return config.url;
}

/**
 * Validate database connection
 */
export async function validateDatabaseConnection(): Promise<boolean> {
  try {
    const env = getEnvironment();
    
    // Basic URL validation
    const url = new URL(env.VITE_SUPABASE_URL);
    if (!url.hostname.includes('supabase') && !url.hostname.includes('localhost')) {
      throw new Error('Invalid Supabase URL format');
    }
    
    console.log('✅ Database URL validation passed');
    return true;
  } catch (error) {
    console.error('❌ Database connection validation failed:', error);
    return false;
  }
}