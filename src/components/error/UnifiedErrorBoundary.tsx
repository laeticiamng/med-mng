/**
 * Error Boundary unifié pour toute l'application
 * Gestion centralisée des erreurs React avec fallbacks élégants
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { errorService } from '@/services/core/ErrorService';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  goHome: () => void;
}

export class UnifiedErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log l'erreur via le service centralisé
    errorService.handleError(error, 'system', false);
    
    // Log détaillé pour le debugging
    errorService.handleInfo(
      `React Error Boundary: Component stack error`,
      'system',
      {
        errorMessage: error.message,
        componentStack: errorInfo.componentStack,
        stack: error.stack,
      }
    );

    this.setState({ errorInfo });

    // Callback personnalisé si fourni
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  goHome = () => {
    this.resetError();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          goHome={this.goHome}
        />
      );
    }

    return this.props.children;
  }
}

// Composant de fallback par défaut avec design premium
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  goHome 
}) => {
  const isDev = import.meta.env.DEV;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 text-destructive rounded-full mb-6">
            <AlertTriangle size={40} />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Oups, quelque chose s'est mal passé
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Une erreur inattendue s'est produite. Nos équipes techniques ont été automatiquement notifiées.
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={resetError}
            className="w-full"
            size="lg"
          >
            <RefreshCw size={20} className="mr-2" />
            Réessayer
          </Button>
          
          <Button 
            onClick={goHome}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Home size={20} className="mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        {isDev && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              Détails techniques (dev)
            </summary>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-destructive mb-1">
                    Message d'erreur:
                  </h4>
                  <p className="text-xs font-mono text-foreground">
                    {error.message}
                  </p>
                </div>
                
                {error.stack && (
                  <div>
                    <h4 className="font-semibold text-sm text-destructive mb-1">
                      Stack trace:
                    </h4>
                    <pre className="text-xs font-mono text-foreground overflow-auto max-h-32 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </details>
        )}
        
        <p className="text-xs text-muted-foreground mt-6">
          Si le problème persiste, contactez le support technique.
        </p>
      </div>
    </div>
  );
};

// Error Boundary léger pour les composants spécifiques
export const ComponentErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallbackMessage?: string;
}> = ({ children, fallbackMessage = "Erreur de composant" }) => {
  return (
    <UnifiedErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-destructive" />
            <h3 className="font-medium text-destructive">{fallbackMessage}</h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "Une erreur s'est produite dans ce composant"}
          </p>
          
          <Button 
            onClick={resetError}
            variant="outline"
            size="sm"
          >
            <RefreshCw size={16} className="mr-2" />
            Réessayer
          </Button>
        </div>
      )}
    >
      {children}
    </UnifiedErrorBoundary>
  );
};

export default UnifiedErrorBoundary;