import { toast } from '@/hooks/use-toast';
import { logService } from '@/services/logService';
import {
    AppError,
    ErrorCategory,
    ErrorSeverity,
    isRetryableError,
    shouldNotifyUser
} from '@/utils/errorStandardization';
import { addBreadcrumb, captureException } from '@/utils/sentry';
import { useCallback, useEffect } from 'react';

export interface ErrorHandlingOptions {
  showToast?: boolean;
  logToSentry?: boolean;
  retryable?: boolean;
  context?: string;
  metadata?: Record<string, any>;
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export function useErrorHandling() {
  // Global error handler for uncaught errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const error = new AppError(
        event.error?.message || event.message || 'Unhandled error',
        500,
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        {
          url: window.location.href,
          userAgent: navigator.userAgent,
          component: 'global-handler'
        }
      );
      
      handleError(error, { 
        showToast: true, 
        logToSentry: true,
        context: 'global-error-handler'
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new AppError(
        event.reason?.message || 'Unhandled promise rejection',
        500,
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        {
          url: window.location.href,
          userAgent: navigator.userAgent,
          component: 'promise-handler'
        }
      );
      
      handleError(error, { 
        showToast: true, 
        logToSentry: true,
        context: 'unhandled-promise-rejection'
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlingOptions = {}
  ): AppError => {
    const {
      showToast = true,
      logToSentry = true,
      context = 'unknown',
      metadata = {}
    } = options;

    // Convert to AppError if needed
    let appError: AppError;
    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new AppError(
        error.message,
        500,
        ErrorCategory.SYSTEM,
        ErrorSeverity.MEDIUM,
        {
          url: window.location.href,
          userAgent: navigator.userAgent,
          component: context,
          metadata
        }
      );
    } else {
      appError = new AppError(
        'An unexpected error occurred',
        500,
        ErrorCategory.SYSTEM,
        ErrorSeverity.MEDIUM,
        {
          url: window.location.href,
          userAgent: navigator.userAgent,
          component: context,
          metadata: { ...metadata, originalError: error }
        }
      );
    }

    // Log to Sentry with context
    if (logToSentry) {
      addBreadcrumb({
        message: `Error in ${context}`,
        category: appError.category,
        level: appError.severity as any,
        data: metadata
      });
      captureException(appError);
    }

    // Show user notification
    if (showToast && shouldNotifyUser(appError)) {
      const variant = getToastVariant(appError.severity);
      toast({
        variant,
        title: getErrorTitle(appError),
        description: getErrorDescription(appError),
        action: isRetryableError(appError) ? undefined : undefined
      });
    }

    // Log to browser console in development
    if (import.meta.env.DEV) {
      logService.error('system', `Error in ${context}`, {
        appError,
        originalError: error,
        errorContext: appError.context,
      });
    }

    return appError;
  }, []);

  const withErrorBoundary = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    context: string = 'function-call'
  ): T => {
    return ((...args: any[]) => {
      try {
        const result = fn(...args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((error) => {
            handleError(error, { context });
            throw error; // Re-throw so calling code can handle if needed
          });
        }
        
        return result;
      } catch (error) {
        handleError(error, { context });
        throw error; // Re-throw so calling code can handle if needed
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
        
        // Log successful retry
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
        
        // Don't retry on last attempt or non-retryable errors
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
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }

    // Final error handling
    throw handleError(lastError, { 
      context: `${context}-retry-exhausted`,
      metadata: { maxRetries, attempts: maxRetries + 1 }
    });
  }, [handleError]);

  return {
    handleError,
    withErrorBoundary,
    withRetry
  };
}

function getToastVariant(severity: ErrorSeverity): 'default' | 'destructive' {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.HIGH:
      return 'destructive';
    default:
      return 'default';
  }
}

function getErrorTitle(error: AppError): string {
  switch (error.category) {
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication Required';
    case ErrorCategory.AUTHORIZATION:
      return 'Access Denied';
    case ErrorCategory.VALIDATION:
      return 'Invalid Input';
    case ErrorCategory.NETWORK:
      return 'Connection Error';
    case ErrorCategory.EXTERNAL_API:
      return 'Service Unavailable';
    default:
      return 'Error';
  }
}

function getErrorDescription(error: AppError): string {
  // Return user-friendly message, not technical details
  switch (error.category) {
    case ErrorCategory.AUTHENTICATION:
      return 'Please log in to access this feature.';
    case ErrorCategory.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';
    case ErrorCategory.VALIDATION:
      return error.message; // Validation messages are usually user-friendly
    case ErrorCategory.NETWORK:
      return 'Please check your internet connection and try again.';
    case ErrorCategory.EXTERNAL_API:
      return 'The service is temporarily unavailable. Please try again later.';
    case ErrorCategory.BUSINESS_LOGIC:
      return error.message; // Business logic errors are usually user-friendly
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}