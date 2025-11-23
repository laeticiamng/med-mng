/**
 * Environment variable helper
 * Works in both browser (Vite) and Node.js environments
 */

function getEnvVar(key: string): string | undefined {
  // Try Node.js environment first
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }

  // Browser environment (Vite) - using try/catch to avoid TypeScript errors
  try {
    // @ts-ignore - import.meta.env is only available in Vite
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // import.meta is not available in this environment
  }

  return undefined;
}

export const env = {
  get(key: string, defaultValue?: string): string {
    return getEnvVar(key) ?? defaultValue ?? '';
  },

  getRequired(key: string): string {
    const value = getEnvVar(key);
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  },

  // Specific environment variables
  get VITE_SUPABASE_URL(): string {
    return this.getRequired('VITE_SUPABASE_URL');
  },

  get VITE_SUPABASE_ANON_KEY(): string {
    return this.getRequired('VITE_SUPABASE_ANON_KEY');
  },

  get NODE_ENV(): string {
    return this.get('NODE_ENV', 'development');
  },

  get VITE_SENTRY_DSN(): string {
    return this.get('VITE_SENTRY_DSN', '');
  },

  get VITE_SENTRY_ENVIRONMENT(): string {
    return this.get('VITE_SENTRY_ENVIRONMENT', 'development');
  },

  get VITE_APP_VERSION(): string {
    return this.get('VITE_APP_VERSION', '1.0.0');
  },

  get VITE_GA_MEASUREMENT_ID(): string {
    return this.get('VITE_GA_MEASUREMENT_ID', '');
  },

  isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  },

  isProduction(): boolean {
    return this.NODE_ENV === 'production';
  },

  isTest(): boolean {
    return this.NODE_ENV === 'test';
  },
};
