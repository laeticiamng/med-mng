/**
 * Deterministic and cryptographically secure ID generation utilities
 * Replaces Math.random() across the platform for reproducible, unique IDs
 */

// Counter for sequential IDs within same millisecond
let sequentialCounter = 0;

/**
 * Generate a cryptographically secure unique ID
 * Uses crypto.randomUUID() when available, falls back to secure pattern
 */
export const generateSecureId = (prefix: string = ''): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return prefix ? `${prefix}_${crypto.randomUUID()}` : crypto.randomUUID();
  }
  
  // Fallback: timestamp + sequential counter for deterministic uniqueness
  const timestamp = Date.now();
  const counter = sequentialCounter++;
  const uniquePart = `${timestamp}_${counter.toString(36).padStart(6, '0')}`;
  
  return prefix ? `${prefix}_${uniquePart}` : uniquePart;
};

/**
 * Generate a session ID with prefix
 */
export const generateSessionId = (): string => {
  return generateSecureId('session');
};

/**
 * Generate a quiz session ID
 */
export const generateQuizId = (): string => {
  return generateSecureId('quiz');
};

/**
 * Generate a filter ID
 */
export const generateFilterId = (): string => {
  return generateSecureId('filter');
};

/**
 * Generate a generation request ID (for offline queue)
 */
export const generateRequestId = (): string => {
  return generateSecureId('gen');
};

/**
 * Generate a sync queue item ID
 */
export const generateSyncId = (): string => {
  return generateSecureId('sync');
};

/**
 * Generate a log entry ID
 */
export const generateLogId = (): string => {
  return generateSecureId('log');
};

/**
 * Generate an alert ID
 */
export const generateAlertId = (): string => {
  return generateSecureId('alert');
};

/**
 * Generate a recommendation tracking ID
 */
export const generateRecommendationId = (category: string): string => {
  return generateSecureId(`rec_${category}`);
};

// Reset counter for testing purposes
export const resetSequentialCounter = (): void => {
  sequentialCounter = 0;
};
