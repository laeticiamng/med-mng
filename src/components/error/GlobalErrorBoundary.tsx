import React, { Component, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { captureException } from '@/utils/monitoring/sentry';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const isChunkError = error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError');
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card rounded-lg border shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <h1 className="text-xl font-semibold text-card-foreground mb-2">
          {isChunkError ? 'Mise à jour requise' : 'Erreur inattendue'}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {isChunkError ? (
            'Une nouvelle version de l\'application est disponible. Veuillez recharger la page.'
          ) : isNetworkError ? (
            'Problème de connexion réseau. Vérifiez votre connexion internet.'
          ) : (
            'Une erreur inattendue s\'est produite. Nos équipes ont été notifiées.'
          )}
        </p>

        {import.meta.env.DEV && (
          <div className="mb-6 p-3 bg-muted rounded text-left">
            <p className="text-sm font-mono text-muted-foreground">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {isChunkError ? (
            <Button onClick={handleReload} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Recharger
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={resetErrorBoundary}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
              <Button 
                onClick={handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Accueil
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    // Log to Sentry with component stack
    captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: 'global',
      },
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group('🚨 Global Error Boundary');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  };

  const handleReset = () => {
    // Clear any error state and reload if necessary
    window.location.reload();
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};

export default GlobalErrorBoundary;