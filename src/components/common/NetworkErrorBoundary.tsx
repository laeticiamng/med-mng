import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface NetworkErrorBoundaryProps {
  error: Error | null;
  onRetry: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  maxRetries?: number;
  retryDelay?: number;
}

export const NetworkErrorBoundary: React.FC<NetworkErrorBoundaryProps> = ({
  error,
  onRetry,
  isLoading = false,
  children,
  maxRetries = 3,
  retryDelay = 3000
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-retry logic
  useEffect(() => {
    if (error && isOnline && retryCount < maxRetries && !isAutoRetrying) {
      setIsAutoRetrying(true);
      setCountdown(retryDelay / 1000);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);

      const retryTimeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsAutoRetrying(false);
        onRetry();
      }, retryDelay);

      return () => {
        clearInterval(countdownInterval);
        clearTimeout(retryTimeout);
      };
    }
  }, [error, isOnline, retryCount, maxRetries, retryDelay, isAutoRetrying, onRetry]);

  // Reset retry count on successful load
  useEffect(() => {
    if (!error && !isLoading) {
      setRetryCount(0);
    }
  }, [error, isLoading]);

  const handleManualRetry = useCallback(() => {
    setRetryCount(0);
    setIsAutoRetrying(false);
    onRetry();
  }, [onRetry]);

  // Detect error type
  const getErrorType = (error: Error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
      return 'network';
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout';
    }
    if (message.includes('401') || message.includes('403') || message.includes('unauthorized')) {
      return 'auth';
    }
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'server';
    }
    return 'unknown';
  };

  if (!error) {
    return <>{children}</>;
  }

  const errorType = getErrorType(error);
  const hasRetriesLeft = retryCount < maxRetries;

  return (
    <PremiumCard variant="glass" className="p-6 border-destructive/30 bg-destructive/5">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon based on error type */}
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center
          ${errorType === 'network' || !isOnline 
            ? 'bg-warning/20' 
            : 'bg-destructive/20'
          }
        `}>
          {!isOnline ? (
            <WifiOff className="h-8 w-8 text-warning" />
          ) : errorType === 'network' ? (
            <Wifi className="h-8 w-8 text-warning" />
          ) : errorType === 'timeout' ? (
            <Clock className="h-8 w-8 text-warning" />
          ) : (
            <AlertCircle className="h-8 w-8 text-destructive" />
          )}
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {!isOnline 
              ? 'Connexion perdue'
              : errorType === 'network' 
                ? 'Erreur de connexion'
                : errorType === 'timeout'
                  ? 'Délai dépassé'
                  : errorType === 'server'
                    ? 'Erreur serveur'
                    : 'Une erreur est survenue'
            }
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {!isOnline 
              ? 'Vérifiez votre connexion internet et réessayez.'
              : error.message || 'Impossible de charger le contenu. Veuillez réessayer.'
            }
          </p>
        </div>

        {/* Retry status */}
        {hasRetriesLeft && isOnline && (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Tentative {retryCount + 1} / {maxRetries}</span>
              {isAutoRetrying && <span>Nouvelle tentative dans {countdown}s</span>}
            </div>
            <Progress 
              value={((retryCount) / maxRetries) * 100} 
              className="h-1.5"
            />
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? 'outline' : 'destructive'} className="gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Badge>
          {isAutoRetrying && (
            <Badge variant="secondary" className="gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Reconnexion...
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleManualRetry}
            disabled={isLoading || isAutoRetrying}
            className="min-w-32"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </>
            )}
          </Button>
          
          {!hasRetriesLeft && (
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </Button>
          )}
        </div>

        {/* Technical details (collapsible) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-muted-foreground mt-4">
            <summary className="cursor-pointer hover:text-foreground">
              Détails techniques
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto max-w-full">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </PremiumCard>
  );
};
