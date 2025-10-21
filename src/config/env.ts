/**
 * Environment configuration
 * Use these constants instead of direct import.meta.env checks
 */
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_TEST = import.meta.env.MODE === 'test';

/**
 * Enable debug features only in development
 */
export const ENABLE_DEBUG = IS_DEVELOPMENT;

/**
 * Enable verbose logging only in development
 */
export const ENABLE_VERBOSE_LOGGING = IS_DEVELOPMENT;
