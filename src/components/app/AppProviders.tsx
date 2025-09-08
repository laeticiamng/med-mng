/**
 * 🌟 APP PROVIDERS - MED-MNG v3.0
 * Providers centralisés et optimisés
 */

import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HelmetProvider } from 'react-helmet-async';

// Store global
import { useAuthStore } from '@/stores/authStore';

// Accessibility Provider
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';

// Performance et sécurité
import { logger } from '@/lib/logger';

// Query client optimisé
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error Fallback Component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ error, resetErrorBoundary }) => {
  React.useEffect(() => {
    logger.error('app', 'Application error boundary triggered', { error: error.message, stack: error.stack });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-6">
        <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Une erreur s'est produite</h1>
        <p className="text-muted-foreground max-w-md">
          L'application a rencontré une erreur inattendue. Veuillez recharger la page ou contactez le support.
        </p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Recharger
          </button>
        </div>
        {import.meta.env.DEV && (
          <details className="text-left mt-4 p-3 bg-muted rounded-lg text-sm">
            <summary className="cursor-pointer font-medium">Détails de l'erreur (dev only)</summary>
            <pre className="mt-2 text-xs overflow-auto">{error.stack}</pre>
          </details>
        )}
      </div>
    </div>
  );
};

// Loading Component
const AppLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center mx-auto animate-pulse">
        <span className="text-white font-bold">M</span>
      </div>
      <div className="text-lg font-medium text-foreground">Initialisation MED-MNG...</div>
      <div className="w-32 h-1 bg-secondary rounded-full mx-auto overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-primary to-primary/60 animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Auth Initializer
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialize, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
};

// Main Providers Component
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        logger.error('app', 'Error boundary caught error', { error: error.message, errorInfo });
      }}
    >
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="system" 
              enableSystem
              disableTransitionOnChange
            >
              <AccessibilityProvider>
                <TooltipProvider>
                  <AuthInitializer>
                    <Suspense fallback={<AppLoading />}>
                      {children}
                    </Suspense>
                  </AuthInitializer>
                  <Toaster />
                </TooltipProvider>
              </AccessibilityProvider>
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;