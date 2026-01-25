/**
 * 🛡️ ADVANCED ERROR BOUNDARY
 * Gestion d'erreurs robuste avec monitoring et recovery
 */

import type { AppError } from '@/types/global';
import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
  maxRetries?: number;
  showReportButton?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }

  private static errorCounter = 0;
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${(++ErrorBoundary.errorCounter).toString(36).padStart(6, '0')}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Create structured error object
    const appError: AppError = {
      code: 'REACT_ERROR_BOUNDARY',
      message: error.message,
      details: {
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
        retryCount: this.state.retryCount
      },
      timestamp: new Date().toISOString(),
      stack: error.stack,
      context: 'ErrorBoundary'
    };

    // Report error to monitoring service
    this.reportError(appError);
    
    // Call custom error handler
    this.props.onError?.(appError);
  }

  private reportError = async (error: AppError) => {
    try {
      // Send to Sentry or other monitoring service
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(new Error(error.message), {
          tags: {
            errorBoundary: true,
            errorId: error.context
          },
          extra: error.details,
          level: 'error'
        });
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Error Boundary Caught Error');
        console.error('Error:', error.message);
        console.error('Details:', error.details);
        console.error('Stack:', error.stack);
        console.groupEnd();
      }

      // Log errors via console in Lovable (no /api endpoint available)
      // Error tracking should be done via Sentry or Supabase edge functions if configured
      console.error('[ErrorBoundary] Error logged:', error);
    } catch (reportingError) {
      // Silently fail - don't let error reporting break the error boundary
      console.warn('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    const maxRetries = this.props.maxRetries ?? 3;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const errorReport = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    const githubUrl = new URL('https://github.com/your-repo/issues/new');
    githubUrl.searchParams.set('title', `Bug Report: ${this.state.error?.message}`);
    githubUrl.searchParams.set('body', `
## Error Report

**Error ID:** ${errorReport.errorId}
**Message:** ${errorReport.message}
**URL:** ${errorReport.url}
**Timestamp:** ${errorReport.timestamp}
**User Agent:** ${errorReport.userAgent}

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
<!-- Describe what you expected to happen -->

## Actual Behavior
<!-- Describe what actually happened -->

## Additional Context
<!-- Add any other context about the problem here -->
    `);

    window.open(githubUrl.toString(), '_blank');
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const maxRetries = this.props.maxRetries ?? 3;
      const canRetry = this.state.retryCount < maxRetries;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
                Oops! Quelque chose s'est mal passé
              </h1>
              <p className="text-muted-foreground text-sm">
                Une erreur inattendue s'est produite. Nous avons été notifiés et travaillons à la résoudre.
              </p>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-muted p-3 rounded text-left text-xs">
                <p className="font-mono text-destructive">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}

            {/* Retry Information */}
            {this.state.retryCount > 0 && (
              <div className="text-sm text-muted-foreground">
                Tentative {this.state.retryCount} sur {maxRetries}
              </div>
            )}

            {/* Error ID */}
            <div className="text-xs text-muted-foreground font-mono">
              ID: {this.state.errorId}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleRefresh}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Accueil
                </button>
              </div>

              {this.props.showReportButton && (
                <button
                  onClick={this.handleReportBug}
                  className="w-full bg-muted text-muted-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Bug className="w-4 h-4" />
                  Signaler le problème
                </button>
              )}
            </div>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground">
              Si le problème persiste, contactez le support technique.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 🎯 HOOK VERSION FOR FUNCTIONAL COMPONENTS
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: { componentStack?: string }) => {
    const appError: AppError = {
      code: 'REACT_USE_ERROR_HANDLER',
      message: error.message,
      details: {
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo?.componentStack
      },
      timestamp: new Date().toISOString(),
      stack: error.stack,
      context: 'useErrorHandler'
    };

    // Report error
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { useErrorHandler: true },
        extra: appError.details
      });
    }

    console.error('🚨 useErrorHandler caught error:', appError);
  }, []);

  return { handleError };
};

// 🛡️ ASYNC ERROR BOUNDARY FOR SUSPENSE
export const AsyncErrorBoundary: React.FC<{
  children: ReactNode;
  fallback: ReactNode;
}> = ({ children, fallback }) => {
  return (
    <ErrorBoundary fallback={fallback}>
      <React.Suspense fallback={<div>Chargement...</div>}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
};

export default ErrorBoundary;