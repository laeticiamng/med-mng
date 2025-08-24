import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { captureException, addBreadcrumb } from '@/utils/monitoring/sentry';

export interface UnifiedError {
  id: string;
  type: 'network' | 'validation' | 'auth' | 'quota' | 'system' | 'external_api' | 'business_logic';
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    url?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  };
  timestamp: Date;
  resolved?: boolean;
  retryable?: boolean;
}

interface ErrorHandlingOptions {
  showToast?: boolean;
  logToSentry?: boolean;
  retryable?: boolean;
  context?: string;
  metadata?: Record<string, unknown>;
  userMessage?: string;
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export const useUnifiedErrorHandling = () => {
  const [errors, setErrors] = useState<UnifiedError[]>([]);

  // Global error handlers
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      handleError(new Error(event.error?.message || event.message || 'Unhandled error'), {
        context: 'global-error-handler',
        showToast: true,
        logToSentry: true,
        metadata: {
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason?.message || 'Unhandled promise rejection'), {
        context: 'promise-rejection-handler',
        showToast: true,
        logToSentry: true,
        metadata: {
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const createUnifiedError = useCallback((
    error: unknown,
    options: ErrorHandlingOptions = {}
  ): UnifiedError => {
    const {
      context = 'unknown',
      metadata = {},
      retryable = false
    } = options;

    let type: UnifiedError['type'] = 'system';
    let severity: UnifiedError['severity'] = 'medium';
    let code = 'UNKNOWN_ERROR';
    let message = 'An unexpected error occurred';

    if (error instanceof Error) {
      message = error.message;
      
      // Classify error based on message content and error type
      if (error.message.includes('fetch') || error.message.includes('network')) {
        type = 'network';
        code = 'NETWORK_ERROR';
        severity = 'high';
      } else if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        type = 'auth';
        code = 'AUTH_ERROR';
        severity = 'high';
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        type = 'validation';
        code = 'VALIDATION_ERROR';
        severity = 'medium';
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        type = 'quota';
        code = 'QUOTA_ERROR';
        severity = 'high';
      }
    }

    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      code,
      message,
      severity,
      details: error,
      context: {
        component: context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        metadata
      },
      timestamp: new Date(),
      resolved: false,
      retryable
    };
  }, []);

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlingOptions = {}
  ): string => {
    const {
      showToast = true,
      logToSentry = true,
      userMessage,
      context = 'unknown',
      metadata = {}
    } = options;

    const unifiedError = createUnifiedError(error, options);
    
    // Store error
    setErrors(prev => [unifiedError, ...prev.slice(0, 49)]);

    // Log to Sentry
    if (logToSentry) {
      addBreadcrumb({
        message: `Error in ${context}`,
        category: unifiedError.type,
        level: getSentryLevel(unifiedError.severity),
        data: metadata
      });
      captureException(error instanceof Error ? error : new Error(unifiedError.message));
    }

    // Show toast notification
    if (showToast && shouldNotifyUser(unifiedError)) {
      const displayMessage = userMessage || getDefaultUserMessage(unifiedError);
      const emoji = getErrorEmoji(unifiedError.type);
      toast.error(`${emoji} ${displayMessage}`);
    }

    // Console log in development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error in ${context}`);
      console.error('Unified Error:', unifiedError);
      console.error('Original error:', error);
      console.groupEnd();
    }

    return unifiedError.id;
  }, [createUnifiedError]);

  const withErrorBoundary = useCallback(<T extends (...args: unknown[]) => unknown>(
    fn: T,
    context: string = 'function-call'
  ): T => {
    return ((...args: unknown[]) => {
      try {
        const result = fn(...args);
        
        if (result instanceof Promise) {
          return result.catch((error) => {
            handleError(error, { context });
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        handleError(error, { context });
        throw error;
      }
    }) as T;
  }, [handleError]);

  const withRetry = useCallback(async <T>(
    fn: () => Promise<T>,
    retryOptions: RetryOptions = {},
    context: string = 'retry-operation'
  ): Promise<T> => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoffMultiplier = 2
    } = retryOptions;

    let lastError: unknown;
    let currentDelay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        
        if (attempt > 0) {
          addBreadcrumb({
            message: `Operation succeeded after ${attempt} retries`,
            category: 'retry',
            level: 'info',
            data: { context, attempt, maxRetries }
          });
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !isRetryableError(error)) {
          break;
        }
        
        addBreadcrumb({
          message: `Retry attempt ${attempt + 1}/${maxRetries} failed`,
          category: 'retry',
          level: 'warning',
          data: { 
            context, 
            attempt: attempt + 1, 
            maxRetries,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }

    throw handleError(lastError, { 
      context: `${context}-retry-exhausted`,
      metadata: { maxRetries, attempts: maxRetries + 1 }
    });
  }, [handleError]);

  const resolveError = useCallback((errorId: string) => {
    setErrors(prev => 
      prev.map(error => 
        error.id === errorId 
          ? { ...error, resolved: true }
          : error
      )
    );
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getErrorsByType = useCallback((type: UnifiedError['type']) => {
    return errors.filter(error => error.type === type && !error.resolved);
  }, [errors]);

  const hasUnresolvedErrors = useCallback(() => {
    return errors.some(error => !error.resolved);
  }, [errors]);

  return {
    errors,
    handleError,
    withErrorBoundary,
    withRetry,
    resolveError,
    clearErrors,
    getErrorsByType,
    hasUnresolvedErrors
  };
};

// Helper functions
function shouldNotifyUser(error: UnifiedError): boolean {
  return error.severity !== 'low';
}

function getSentryLevel(severity: UnifiedError['severity']): 'debug' | 'info' | 'warning' | 'error' | 'fatal' {
  switch (severity) {
    case 'critical': return 'fatal';
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'debug';
  }
}

function getErrorEmoji(type: UnifiedError['type']): string {
  switch (type) {
    case 'auth': return '🔒';
    case 'quota': return '⚠️';
    case 'network': return '🌐';
    case 'validation': return '⚠️';
    case 'external_api': return '🔌';
    default: return '❌';
  }
}

function getDefaultUserMessage(error: UnifiedError): string {
  switch (error.type) {
    case 'auth':
      return 'Erreur d\'authentification. Veuillez vous reconnecter.';
    case 'quota':
      return 'Quota dépassé. Améliorez votre abonnement.';
    case 'network':
      return 'Erreur de connexion. Vérifiez votre internet.';
    case 'validation':
      return 'Données invalides. Vérifiez vos saisies.';
    case 'external_api':
      return 'Service temporairement indisponible.';
    case 'business_logic':
      return error.message;
    default:
      return 'Une erreur inattendue s\'est produite.';
  }
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('502') || 
           message.includes('503') || 
           message.includes('504');
  }
  return false;
}