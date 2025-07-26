import * as Sentry from '@sentry/react';

// Configuration Sentry pour monitoring des erreurs frontend
export const initSentry = () => {
  Sentry.init({
    dsn: 'https://your-sentry-dsn@sentry.io/project-id', // À remplacer par votre DSN Sentry
    environment: import.meta.env.MODE || 'development',
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    
    // Taux d'échantillonnage des erreurs (100% en dev, 50% en prod)
    sampleRate: import.meta.env.MODE === 'production' ? 0.5 : 1.0,
    
    // Taux d'échantillonnage des performances (10% en prod pour éviter les quotas)
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
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
        version: '1.0.0'
      },
    },
  });
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