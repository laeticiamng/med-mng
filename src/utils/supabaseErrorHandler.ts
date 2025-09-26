/**
 * Supabase Error Handler - Wrapper utilitaire pour gérer les erreurs de connexion
 * et éviter le spam dans les logs lorsque Supabase n'est pas accessible.
 */

// Circuit breaker global pour éviter les appels répétés quand Supabase n'est pas accessible
let isSupabaseAccessible = true;
let lastFailureTime = 0;
const CIRCUIT_BREAKER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface SupabaseErrorDetails {
  isConnectionError: boolean;
  shouldRetry: boolean;
  message: string;
}

/**
 * Analyse une erreur pour déterminer si c'est une erreur de connexion
 */
function analyzeSupabaseError(error: any): SupabaseErrorDetails {
  const connectionErrorIndicators = [
    'Failed to fetch',
    'Network Error',
    'ENOTFOUND',
    'ECONNREFUSED',
    'relation',
    'does not exist',
    'TypeError: fetch'
  ];

  const errorMessage = error?.message || error?.toString() || '';
  const isConnectionError = connectionErrorIndicators.some(indicator => 
    errorMessage.includes(indicator)
  );

  return {
    isConnectionError,
    shouldRetry: !isConnectionError,
    message: errorMessage
  };
}

/**
 * Vérifie si le circuit breaker est actif
 */
function isCircuitBreakerActive(): boolean {
  if (isSupabaseAccessible) return false;
  
  const now = Date.now();
  if (now - lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
    // Reset circuit breaker after timeout
    isSupabaseAccessible = true;
    return false;
  }
  
  return true;
}

/**
 * Active le circuit breaker
 */
function activateCircuitBreaker(): void {
  isSupabaseAccessible = false;
  lastFailureTime = Date.now();
}

/**
 * Reset le circuit breaker
 */
function resetCircuitBreaker(): void {
  isSupabaseAccessible = true;
}

/**
 * Wrapper pour les appels à supabase.functions.invoke
 */
export async function safeSupabaseInvoke<T = any>(
  functionName: string,
  options?: { body?: any; headers?: Record<string, string> }
): Promise<{ data: T | null; error: any; skipped: boolean }> {
  // Check circuit breaker
  if (isCircuitBreakerActive()) {
    console.debug(`[supabase] Circuit breaker active, skipping ${functionName} call`);
    return { data: null, error: null, skipped: true };
  }

  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke(functionName, options);
    
    if (error) {
      const errorDetails = analyzeSupabaseError(error);
      
      if (errorDetails.isConnectionError) {
        activateCircuitBreaker();
        console.debug(`[supabase] Connection error on ${functionName}, circuit breaker activated`);
      } else {
        console.warn(`[supabase] Function ${functionName} error:`, error);
      }
      
      return { data: null, error, skipped: false };
    }
    
    // Success - ensure circuit breaker is reset
    resetCircuitBreaker();
    return { data, error: null, skipped: false };
    
  } catch (error) {
    const errorDetails = analyzeSupabaseError(error);
    
    if (errorDetails.isConnectionError) {
      activateCircuitBreaker();
      console.debug(`[supabase] Network error on ${functionName}, circuit breaker activated`);
    } else {
      console.warn(`[supabase] Unexpected error on ${functionName}:`, error);
    }
    
    return { data: null, error, skipped: false };
  }
}

/**
 * Wrapper pour les queries Supabase (select, insert, update, delete)
 */
export async function safeSupabaseQuery<T = any>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any; skipped: boolean }> {
  // Check circuit breaker
  if (isCircuitBreakerActive()) {
    console.debug('[supabase] Circuit breaker active, skipping query');
    return { data: null, error: null, skipped: true };
  }

  try {
    const result = await queryFn();
    
    if (result.error) {
      const errorDetails = analyzeSupabaseError(result.error);
      
      if (errorDetails.isConnectionError) {
        activateCircuitBreaker();
        console.debug('[supabase] Connection error on query, circuit breaker activated');
      } else {
        console.warn('[supabase] Query error:', result.error);
      }
    } else {
      // Success - ensure circuit breaker is reset
      resetCircuitBreaker();
    }
    
    return { ...result, skipped: false };
    
  } catch (error) {
    const errorDetails = analyzeSupabaseError(error);
    
    if (errorDetails.isConnectionError) {
      activateCircuitBreaker();
      console.debug('[supabase] Network error on query, circuit breaker activated');
    } else {
      console.warn('[supabase] Unexpected query error:', error);
    }
    
    return { data: null, error, skipped: false };
  }
}

/**
 * Utilitaire pour gérer les erreurs de façon silencieuse avec fallback
 */
export function withSupabaseFallback<T>(
  fallbackValue: T,
  context?: string
): (result: { data: any; error: any; skipped: boolean }) => T {
  return (result) => {
    if (result.skipped) {
      if (context) {
        console.debug(`[supabase] Using fallback for ${context} (circuit breaker active)`);
      }
      return fallbackValue;
    }
    
    if (result.error) {
      const errorDetails = analyzeSupabaseError(result.error);
      
      if (errorDetails.isConnectionError) {
        if (context) {
          console.debug(`[supabase] Using fallback for ${context} (connection error)`);
        }
      } else if (context) {
        console.warn(`[supabase] Using fallback for ${context} due to error:`, result.error);
      }
      
      return fallbackValue;
    }
    
    return result.data || fallbackValue;
  };
}

/**
 * Statut du circuit breaker pour monitoring
 */
export function getCircuitBreakerStatus() {
  return {
    active: !isSupabaseAccessible,
    lastFailureTime: lastFailureTime > 0 ? new Date(lastFailureTime) : null,
    nextRetryTime: isSupabaseAccessible ? null : new Date(lastFailureTime + CIRCUIT_BREAKER_TIMEOUT)
  };
}