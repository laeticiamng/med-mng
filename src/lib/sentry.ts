// Sentry error tracking configuration
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.debug('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    // Environment
    environment: import.meta.env.MODE,
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    // Filter out known non-critical errors
    beforeSend(event) {
      // Filter chunk loading errors (network issues)
      if (event.exception?.values?.[0]?.value?.includes('Loading chunk')) {
        return null;
      }
      return event;
    },
  });
}

// Error boundary wrapper for React components
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Manual error capture
export function captureError(error: Error, context?: Record<string, any>) {
  if (!SENTRY_DSN) {
    console.error('Error (Sentry disabled):', error, context);
    return;
  }
  
  Sentry.captureException(error, {
    extra: context,
  });
}

// User identification for error tracking
export function identifyUser(userId: string, email?: string) {
  if (!SENTRY_DSN) return;
  
  Sentry.setUser({
    id: userId,
    email,
  });
}

// Clear user on logout
export function clearUser() {
  if (!SENTRY_DSN) return;
  
  Sentry.setUser(null);
}

// Add breadcrumb for debugging
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  if (!SENTRY_DSN) return;
  
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
