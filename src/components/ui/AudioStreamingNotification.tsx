import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AudioStreamingNotificationProps {
  isGenerating?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  estimatedTime?: number;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const AudioStreamingNotification: React.FC<AudioStreamingNotificationProps> = ({
  isGenerating = false,
  isLoading = false,
  hasError = false,
  errorMessage,
  estimatedTime,
  onRetry,
  onDismiss
}) => {
  const [countdown, setCountdown] = useState(estimatedTime || 0);

  useEffect(() => {
    if (isGenerating && estimatedTime && estimatedTime > 0) {
      setCountdown(estimatedTime);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isGenerating, estimatedTime]);

  // Ne pas afficher si aucun état actif
  if (!isGenerating && !isLoading && !hasError) {
    return null;
  }

  const getIcon = () => {
    if (hasError) return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (isLoading) return <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />;
    if (isGenerating) return <Clock className="h-4 w-4 text-blue-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getMessage = () => {
    if (hasError) {
      return errorMessage || 'Erreur lors du chargement audio';
    }
    
    if (isLoading) {
      return 'Préparation de la lecture...';
    }
    
    if (isGenerating) {
      if (countdown > 0) {
        return `Suno génère votre musique... ${countdown}s restantes`;
      }
      return 'Patience, Suno prépare la musique...';
    }
    
    return 'Audio prêt !';
  };

  const getAlertVariant = () => {
    if (hasError) return 'destructive';
    return 'default';
  };

  return (
    <Alert variant={getAlertVariant()} className="border-l-4 border-l-amber-500">
      <div className="flex items-center gap-3">
        {getIcon()}
        
        <div className="flex-1">
          <AlertDescription className="font-medium">
            {getMessage()}
          </AlertDescription>
          
          {isGenerating && countdown > 60 && (
            <div className="text-xs text-muted-foreground mt-1">
              Les générations complexes peuvent prendre quelques minutes
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {hasError && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="h-8 px-3"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Réessayer
            </Button>
          )}
          
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          )}
        </div>
      </div>
      
      {/* Barre de progression pour la génération */}
      {isGenerating && estimatedTime && countdown > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${Math.max(0, ((estimatedTime - countdown) / estimatedTime) * 100)}%`
              }}
            />
          </div>
        </div>
      )}
    </Alert>
  );
};