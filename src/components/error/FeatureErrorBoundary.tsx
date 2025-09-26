// Feature-specific Error Boundary with recovery actions
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Home, AlertTriangle, Bug } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { errorService } from '@/services/core/ErrorService';

interface Props {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Track error
    analytics.trackError(error, this.props.featureName, {
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    errorService.handleError(error, 'system', false);
  }

  handleRetry = () => {
    this.setState(prev => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prev.retryCount + 1
    }));

    analytics.trackUserAction('error_retry', this.props.featureName, {
      retryCount: this.state.retryCount + 1
    });
  };

  handleGoHome = () => {
    analytics.trackNavigation('/', `error-${this.props.featureName}`);
    window.location.href = '/';
  };

  handleReportError = () => {
    const errorReport = {
      feature: this.props.featureName,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Open support with pre-filled error report
    const subject = encodeURIComponent(`Erreur dans ${this.props.featureName}`);
    const body = encodeURIComponent(`Rapport d'erreur automatique:\n\n${JSON.stringify(errorReport, null, 2)}`);
    window.open(`mailto:support@med-mng.com?subject=${subject}&body=${body}`);

    analytics.trackUserAction('error_report', this.props.featureName);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>Erreur dans {this.props.featureName}</CardTitle>
              </div>
              <CardDescription>
                Une erreur inattendue s'est produite. Vous pouvez réessayer ou retourner à l'accueil.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {this.state.retryCount < 3 && (
                <Alert>
                  <AlertDescription>
                    Si le problème persiste, essayez de rafraîchir la page ou contactez le support.
                  </AlertDescription>
                </Alert>
              )}

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive">
                  <AlertDescription className="font-mono text-xs">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                {this.state.retryCount < 3 && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réessayer {this.state.retryCount > 0 && `(${this.state.retryCount + 1}/3)`}
                  </Button>
                )}
                
                <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
                
                <Button variant="ghost" onClick={this.handleReportError} className="w-full">
                  <Bug className="mr-2 h-4 w-4" />
                  Signaler le problème
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  featureName: string,
  fallback?: ReactNode
) {
  return function ErrorBoundaryWrapper(props: P) {
    return (
      <FeatureErrorBoundary featureName={featureName} fallback={fallback}>
        <Component {...props} />
      </FeatureErrorBoundary>
    );
  };
}