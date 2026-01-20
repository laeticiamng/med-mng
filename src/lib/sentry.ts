// Sentry error tracking configuration
import * as Sentry from '@sentry/react';

// Sentry DSN from environment or secrets
const SENTRY_DSN: string | undefined = import.meta.env.VITE_SENTRY_DSN;

// Déterminer l'environnement dynamiquement
const getEnvironment = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development';
    if (hostname.includes('preview') || hostname.includes('lovable.app')) return 'staging';
    if (hostname === 'med-mng.lovable.app') return 'production';
  }
  return import.meta.env.MODE || 'production';
};

// Version depuis package.json ou build
const getRelease = (): string => {
  return import.meta.env.VITE_APP_VERSION || `med-mng@${new Date().toISOString().slice(0, 10)}`;
};

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
    tracesSampleRate: getEnvironment() === 'production' ? 0.1 : 0.5,
    // Environment dynamique
    environment: getEnvironment(),
    // Release tracking dynamique
    release: getRelease(),
    // Filter out known non-critical errors
    beforeSend(event) {
      // Filter chunk loading errors (network issues)
      if (event.exception?.values?.[0]?.value?.includes('Loading chunk')) {
        return null;
      }
      // Filter ResizeObserver errors (browser quirk)
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
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
