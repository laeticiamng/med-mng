import React from 'react';
import { Loader2, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LoadingFeedbackProps {
  isLoading: boolean;
  message?: string;
  variant?: 'spinner' | 'dots' | 'skeleton' | 'pulse' | 'smart' | 'progress';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  progress?: number;
  type?: 'default' | 'medical' | 'upload' | 'processing';
}

export const LoadingFeedback: React.FC<LoadingFeedbackProps> = ({
  isLoading,
  message = 'Chargement...',
  variant = 'spinner',
  size = 'md',
  className,
  progress,
  type = 'default'
}) => {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const getIcon = () => {
    switch (type) {
      case 'medical': return <Activity className={cn('text-blue-500', sizeClasses[size])} />;
      case 'upload': return <Zap className={cn('text-green-500', sizeClasses[size])} />;
      case 'processing': return <Loader2 className={cn('animate-spin text-purple-500', sizeClasses[size])} />;
      default: return <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />;
    }
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return getIcon();
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-primary rounded-full animate-pulse',
                  size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      case 'skeleton':
        return (
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn(
            'bg-primary/20 rounded-full animate-pulse',
            sizeClasses[size]
          )} />
        );
      
      case 'smart':
        return (
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {getIcon()}
                <h3 className="font-semibold">{message}</h3>
              </div>
              {progress !== undefined && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{progress}% complété</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'progress':
        return progress !== undefined ? (
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{message}</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          getIcon()
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn(
        'flex items-center justify-center gap-2 p-4',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {renderLoader()}
      {variant !== 'skeleton' && (
        <span className="text-sm text-muted-foreground">
          {message}
        </span>
      )}
    </div>
  );
};

// Hook pour gérer les états de chargement globaux
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingMessage, setLoadingMessage] = React.useState<string>();

  const startLoading = (message?: string) => {
    setIsLoading(true);
    setLoadingMessage(message);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage(undefined);
  };

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading
  };
};