import * as Sentry from '@sentry/react';

/**
 * Custom error type for application errors
 */
export interface AppError extends Error {
  statusCode?: number;
  category?: string;
  severity?: string;
  context?: any;
}

/**
 * Capture and send exception to Sentry
 * @param error - Error or AppError to capture
 */
export function captureException(error: Error | AppError): void {
  try {
    // Add additional context if it's an AppError
    if ('statusCode' in error || 'category' in error) {
      const appError = error as AppError;
      Sentry.withScope((scope) => {
        if (appError.statusCode) {
          scope.setTag('statusCode', appError.statusCode);
        }
        if (appError.category) {
          scope.setTag('category', appError.category);
        }
        if (appError.severity) {
          scope.setLevel(appError.severity as Sentry.SeverityLevel);
        }
        if (appError.context) {
          scope.setContext('error_context', appError.context);
        }
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch (e) {
    console.error('Failed to capture exception in Sentry:', e);
  }
}

/**
 * Add breadcrumb for error tracking
 * @param breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category: string;
  level: string;
  data?: any;
}): void {
  try {
    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level as Sentry.SeverityLevel,
      data: breadcrumb.data,
    });
  } catch (e) {
    console.error('Failed to add breadcrumb in Sentry:', e);
  }
}
