import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw, Download, Upload, Music, Stethoscope } from 'lucide-react';

// Types pour les différents états de chargement
export type LoadingVariant = 'default' | 'medical' | 'music' | 'minimal' | 'pulse' | 'shimmer';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  className?: string;
  message?: string;
  showMessage?: boolean;
}

// Composant de base pour les spinners
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  variant = 'default', 
  size = 'md', 
  className, 
  message = 'Chargement...',
  showMessage = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variants = {
    default: (
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
    ),
    medical: (
      <Stethoscope className={cn('animate-pulse text-primary', sizeClasses[size], className)} />
    ),
    music: (
      <Music className={cn('animate-bounce text-primary', sizeClasses[size], className)} />
    ),
    minimal: (
      <div className={cn('border-2 border-primary border-t-transparent rounded-full animate-spin', sizeClasses[size], className)} />
    ),
    pulse: (
      <div className={cn('bg-primary rounded-full animate-pulse', sizeClasses[size], className)} />
    ),
    shimmer: (
      <div className={cn('bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded animate-shimmer', sizeClasses[size], className)} />
    )
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {variants[variant]}
      {showMessage && message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
};

// États de chargement spécialisés
interface SkeletonProps {
  className?: string;
  lines?: number;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  lines = 1, 
  width = '100%', 
  height = '1rem' 
}) => {
  if (lines === 1) {
    return (
      <div 
        className={cn('medical-skeleton rounded-md', className)}
        style={{ width, height }}
      />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className="medical-skeleton rounded-md h-4"
          style={{ 
            width: index === lines - 1 ? `${Math.random() * 30 + 70}%` : '100%' 
          }}
        />
      ))}
    </div>
  );
};

// Card de chargement
interface LoadingCardProps {
  className?: string;
  title?: boolean;
  content?: boolean;
  actions?: boolean;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ 
  className, 
  title = true, 
  content = true, 
  actions = true 
}) => {
  return (
    <div className={cn('medical-card p-6 space-y-4', className)}>
      {title && <Skeleton height="1.5rem" width="60%" />}
      {content && <Skeleton lines={3} />}
      {actions && (
        <div className="flex space-x-2">
          <Skeleton width="80px" height="2rem" />
          <Skeleton width="80px" height="2rem" />
        </div>
      )}
    </div>
  );
};

// États de chargement pour listes
interface LoadingListProps {
  items?: number;
  className?: string;
}

export const LoadingList: React.FC<LoadingListProps> = ({ items = 5, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
          <Skeleton width="40px" height="40px" className="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton height="1rem" width="70%" />
            <Skeleton height="0.75rem" width="40%" />
          </div>
          <Skeleton width="60px" height="1.5rem" />
        </div>
      ))}
    </div>
  );
};

// États spécialisés pour différentes actions
interface ActionLoadingProps {
  action: 'download' | 'upload' | 'refresh' | 'generate';
  message?: string;
  className?: string;
}

export const ActionLoading: React.FC<ActionLoadingProps> = ({ action, message, className }) => {
  const icons = {
    download: <Download className="w-6 h-6 animate-bounce text-primary" />,
    upload: <Upload className="w-6 h-6 animate-bounce text-primary" />,
    refresh: <RefreshCw className="w-6 h-6 animate-spin text-primary" />,
    generate: <Music className="w-6 h-6 animate-pulse text-primary" />
  };

  const messages = {
    download: 'Téléchargement en cours...',
    upload: 'Téléversement en cours...',
    refresh: 'Actualisation...',
    generate: 'Génération en cours...'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3 p-6', className)}>
      {icons[action]}
      <p className="text-sm text-muted-foreground animate-pulse">
        {message || messages[action]}
      </p>
    </div>
  );
};

// État de chargement fullscreen
interface FullScreenLoadingProps {
  message?: string;
  variant?: LoadingVariant;
  className?: string;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({ 
  message = 'Chargement de l\'application...', 
  variant = 'medical',
  className 
}) => {
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-background/80 backdrop-blur-sm',
      className
    )}>
      <div className="text-center space-y-4">
        <LoadingSpinner variant={variant} size="xl" showMessage={false} />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">MED-MNG</h2>
          <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Hook pour gérer les états de chargement
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [message, setMessage] = React.useState<string>('');

  const startLoading = (loadingMessage?: string) => {
    setIsLoading(true);
    if (loadingMessage) setMessage(loadingMessage);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setMessage('');
  };

  const updateMessage = (newMessage: string) => {
    setMessage(newMessage);
  };

  return {
    isLoading,
    message,
    startLoading,
    stopLoading,
    updateMessage,
    setIsLoading,
    setMessage
  };
};

// Loading boundary pour suspense
interface LoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  variant?: LoadingVariant;
}

export const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({ 
  children, 
  fallback, 
  variant = 'medical' 
}) => {
  if (fallback) {
    return (
      <React.Suspense fallback={fallback}>
        {children}
      </React.Suspense>
    );
  }

  return (
    <React.Suspense 
      fallback={
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner variant={variant} size="lg" />
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
};