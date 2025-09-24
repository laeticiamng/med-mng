import * as Sentry from '@sentry/react';

let isInitialized = false;

const resolveRelease = () => {
  const releaseCandidates = [
    import.meta.env.VITE_SENTRY_RELEASE,
    import.meta.env.VITE_BUILD_SHA,
    import.meta.env.VITE_BUILD_HASH,
    import.meta.env.VITE_COMMIT_SHA,
    import.meta.env.VITE_GIT_COMMIT_SHA,
  ].filter((value): value is string => Boolean(value));

  return releaseCandidates[0] ?? 'local-dev';
};

const resolveEnvironment = () =>
  import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || 'development';

const resolveDsn = () =>
  import.meta.env.VITE_SENTRY_DSN || (import.meta as unknown as { env?: Record<string, string> }).env?.SENTRY_DSN;

// Configuration Sentry pour monitoring des erreurs frontend
export const initSentry = () => {
  if (isInitialized) {
    return;
  }

  const dsn = resolveDsn();

  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info('[Sentry] DSN non fourni, monitoring désactivé.');
    }
    return;
  }

  const release = resolveRelease();
  const environment = resolveEnvironment();
  const isProduction = environment === 'production';

  Sentry.init({
    dsn,
    release,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],

    // Taux d'échantillonnage des erreurs (100% en dev, 50% en prod)
    sampleRate: isProduction ? 0.5 : 1.0,

    // Taux d'échantillonnage des performances (10% en prod pour éviter les quotas)
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Configuration avancée
    beforeSend(event, hint) {
      // Filtrer les erreurs non critiques
      if (event.exception) {
        const error = hint.originalException as Error;

        // Ignorer les erreurs réseau temporaires
        if (error?.message?.includes('Network Error') ||
            error?.message?.includes('fetch')) {
          return null;
        }

        // Ignorer les erreurs de quota API (déjà gérées côté UX)
        if (error?.message?.includes('quota') ||
            error?.message?.includes('rate limit')) {
          return null;
        }
      }

      return event;
    },

    // Tags par défaut pour faciliter le debug
    initialScope: {
      tags: {
        component: 'frontend',
        'build.hash': release,
      },
    },
  });

  Sentry.setTag('build.hash', release);

  isInitialized = true;
};

// Hook pour capturer les erreurs de composants React
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Utilitaires pour logging manuel
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const addBreadcrumb = Sentry.addBreadcrumb;

// Contexte utilisateur pour tracer les erreurs par user
export const setUserContext = (user: { id: string; email?: string; role?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};

// Tags personnalisés pour catégoriser les erreurs
export const setErrorTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags);
};

// Exemple d'utilisation dans les hooks métier
export const withSentryError = <T extends (...args: any[]) => any>(
  fn: T,
  context: string
): T => {
  return ((...args) => {
    try {
      const result = fn(...args);
      
      // Si c'est une Promise, capturer les erreurs async
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureException(error, {
            tags: { context },
            extra: { args }
          });
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      captureException(error, {
        tags: { context },
        extra: { args }
      });
      throw error;
    }
  }) as T;
};