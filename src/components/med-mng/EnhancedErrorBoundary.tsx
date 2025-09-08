import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Bug, Home, Mail } from 'lucide-react';
import { logger, logErrorBoundary } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    logErrorBoundary(error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Store error info in state
    this.setState({ errorInfo });

    // Send error to monitoring service
    this.sendErrorReport(error, errorInfo);
  }

  private async sendErrorReport(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getUserId(),
        errorId: this.state.errorId,
      };

      // Send to error reporting service
      await fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      });

      logger.info('Error report sent successfully', 'ErrorBoundary', { errorId: this.state.errorId });
    } catch (reportError) {
      logger.error('Failed to send error report', 'ErrorBoundary', { 
        originalError: error.message,
        reportError: reportError instanceof Error ? reportError.message : String(reportError),
      });
    }
  }

  private getUserId(): string | undefined {
    // Get user ID from auth context or localStorage
    try {
      const userData = localStorage.getItem('supabase.auth.token');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed?.user?.id;
      }
    } catch {
      // Ignore errors when getting user ID
    }
    return undefined;
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      logger.info(`Retrying after error (attempt ${this.retryCount})`, 'ErrorBoundary');
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    } else {
      logger.warn('Max retry attempts reached', 'ErrorBoundary');
    }
  };

  private handleReload = () => {
    logger.info('Reloading page after error', 'ErrorBoundary');
    window.location.reload();
  };

  private handleGoHome = () => {
    logger.info('Navigating to home after error', 'ErrorBoundary');
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const subject = `Bug Report - Error ID: ${this.state.errorId}`;
    const body = `
Error Details:
- Error ID: ${this.state.errorId}
- Message: ${this.state.error?.message || 'Unknown error'}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}
- User Agent: ${navigator.userAgent}

Steps to Reproduce:
1. [Please describe what you were doing when the error occurred]

Additional Information:
[Any other relevant information]
    `.trim();

    const mailtoUrl = `mailto:support@med-mng.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.retryCount < this.maxRetries;
      const { error, errorInfo, errorId } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-red-900">
          <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Oups ! Une erreur s'est produite
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Nous nous excusons pour ce désagrément. L'erreur a été automatiquement signalée à notre équipe.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Information */}
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <div className="space-y-2">
                    <div>
                      <strong>ID d'erreur:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">{errorId}</code>
                    </div>
                    {error && (
                      <div>
                        <strong>Message:</strong> {error.message}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && error && (
                <details className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium text-sm mb-2">
                    Détails techniques (développement)
                  </summary>
                  <div className="text-xs font-mono space-y-2">
                    <div>
                      <strong>Stack trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs bg-white dark:bg-gray-900 p-2 rounded border overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                    {errorInfo && (
                      <div>
                        <strong>Component stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs bg-white dark:bg-gray-900 p-2 rounded border overflow-auto max-h-32">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry} 
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Réessayer ({this.maxRetries - this.retryCount} tentatives restantes)
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReload} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recharger la page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Retour à l'accueil
                </Button>
                
                <Button 
                  onClick={this.handleReportBug} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Signaler le problème
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t">
                <p>
                  Si le problème persiste, contactez notre support à{' '}
                  <a 
                    href="mailto:support@med-mng.com" 
                    className="text-primary hover:underline"
                  >
                    support@med-mng.com
                  </a>
                  {' '}avec l'ID d'erreur ci-dessus.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;