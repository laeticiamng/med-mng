import React, { Suspense, memo, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/components/Navigation';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import { useOptimizedAccessibility } from '@/hooks/useOptimizedAccessibility';
import { useEnhancedPerformance } from '@/hooks/useEnhancedPerformance';
import { logger } from '@/utils/structuredLogger';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface OptimizedLayoutProps {
  children?: React.ReactNode;
}

// Composant d'erreur optimisé
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = memo(
  ({ error, resetErrorBoundary }) => {
    const { announceToScreenReader } = useOptimizedAccessibility();
    
    useEffect(() => {
      logger.error('Erreur capturée par ErrorBoundary', 
        { component: 'OptimizedLayout' }, error);
      announceToScreenReader('Une erreur est survenue. Vous pouvez essayer de recharger la page.', 'assertive');
    }, [error, announceToScreenReader]);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-full max-w-lg mx-4 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Une erreur s'est produite
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Nous nous excusons pour cette gêne. Vous pouvez essayer de recharger la page.
                </p>
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Détails techniques
                  </summary>
                  <code className="block mt-2 p-2 bg-muted rounded text-xs">
                    {error.message}
                  </code>
                </details>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={resetErrorBoundary}
                  className="bg-primary hover:bg-primary/90"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Recharger la page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

ErrorFallback.displayName = 'ErrorFallback';

// Composant de chargement optimisé
const LoadingFallback: React.FC = memo(() => {
  const { announceToScreenReader } = useOptimizedAccessibility();
  
  useEffect(() => {
    announceToScreenReader('Chargement en cours...', 'polite');
  }, [announceToScreenReader]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <Loader2 className="w-6 h-6 text-primary absolute top-5 left-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-foreground mb-1">
            Chargement...
          </h2>
          <p className="text-sm text-muted-foreground">
            Préparation de votre contenu
          </p>
        </div>
      </div>
    </div>
  );
});

LoadingFallback.displayName = 'LoadingFallback';

export const OptimizedLayout: React.FC<OptimizedLayoutProps> = memo(({ children }) => {
  const location = useLocation();
  const { announceToScreenReader, isScreenReader } = useOptimizedAccessibility();
  const { 
    startRenderMeasurement, 
    endRenderMeasurement,
    trackError,
    trackSuccess 
  } = useEnhancedPerformance('OptimizedLayout');

  // Suivi des changements de route
  useEffect(() => {
    startRenderMeasurement();
    
    const pageName = location.pathname === '/' ? 'Accueil' : 
      location.pathname.split('/').pop()?.replace('-', ' ') || 'Page';
    
    logger.info(`Navigation vers: ${location.pathname}`, {
      component: 'OptimizedLayout',
      metadata: { pathname: location.pathname, pageName }
    });

    if (isScreenReader) {
      announceToScreenReader(`Navigation vers ${pageName}`, 'polite');
    }

    trackSuccess();
    endRenderMeasurement();
  }, [location, announceToScreenReader, isScreenReader, startRenderMeasurement, endRenderMeasurement, trackSuccess]);

  // Gestion globale des erreurs non capturées
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Promise rejetée non gérée', 
        { component: 'OptimizedLayout' }, 
        new Error(event.reason));
      trackError(new Error(event.reason), 'unhandled_promise_rejection');
    };

    const handleError = (event: ErrorEvent) => {
      logger.error('Erreur JavaScript globale', 
        { component: 'OptimizedLayout' }, 
        event.error);
      trackError(event.error, 'global_javascript_error');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [trackError]);

  const handleErrorBoundaryError = useCallback((error: Error, errorInfo: { componentStack: string }) => {
    logger.error('Erreur React capturée', 
      { component: 'OptimizedLayout', metadata: { componentStack: errorInfo.componentStack } }, 
      error);
    trackError(error, 'react_error_boundary');
  }, [trackError]);

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Helmet>
          <html lang="fr" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="theme-color" content="hsl(var(--primary))" />
          <meta name="description" content="Plateforme d'apprentissage médical avec génération de contenu musical et analyse EDN" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </Helmet>

        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={handleErrorBoundaryError}
          onReset={() => {
            // Reset application state si nécessaire
            logger.info('ErrorBoundary resetted', { component: 'OptimizedLayout' });
          }}
        >
          <div className="flex flex-col min-h-screen">
            {/* Navigation optimisée */}
            <header role="banner" className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
              <Navigation />
            </header>

            {/* Contenu principal */}
            <main 
              role="main" 
              className="flex-1"
              id="main-content"
            >
              <Suspense fallback={<LoadingFallback />}>
                {children || <Outlet />}
              </Suspense>
            </main>

            {/* Skip link pour accessibilité */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 text-sm font-medium"
            >
              Aller au contenu principal
            </a>
          </div>

          {/* Toast notifications optimisées */}
          <Toaster 
            position="top-right"
            closeButton
            richColors
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))'
              }
            }}
          />

          {/* Région d'annonces pour les lecteurs d'écran */}
          <div 
            aria-live="polite" 
            aria-atomic="true" 
            className="sr-only"
            id="announcements"
          />
          
          <div 
            aria-live="assertive" 
            aria-atomic="true" 
            className="sr-only"
            id="urgent-announcements"
          />
        </ErrorBoundary>
      </div>
    </AccessibilityProvider>
  );
});

OptimizedLayout.displayName = 'OptimizedLayout';