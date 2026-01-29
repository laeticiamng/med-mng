/**
 * 📦 Data Loader Component
 * Standardized loading, error, and empty states for data fetching
 */

import { Button } from '@/components/ui/button';
import { AlertCircle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import React, { ReactNode } from 'react';

interface DataLoaderProps<T> {
  loading: boolean;
  error?: string | null;
  data: T | null | undefined;
  isEmpty?: (data: T) => boolean;
  onRetry?: () => void;
  children: (data: T) => ReactNode;
  loadingText?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  className?: string;
}

export function DataLoader<T>({
  loading,
  error,
  data,
  isEmpty,
  onRetry,
  children,
  loadingText = 'Chargement...',
  emptyTitle = 'Aucune donnée',
  emptyDescription = 'Aucun élément à afficher pour le moment.',
  emptyAction,
  className = '',
}: DataLoaderProps<T>): React.ReactElement {
  // Loading state
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-destructive mb-2">Erreur</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  const isDataEmpty = data === null || 
                       data === undefined || 
                       (Array.isArray(data) && data.length === 0) ||
                       (isEmpty && isEmpty(data));

  if (isDataEmpty) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">{emptyTitle}</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-4">
          {emptyDescription}
        </p>
        {emptyAction}
      </div>
    );
  }

  // Data loaded successfully
  return <>{children(data)}</>;
}

// Simpler version for when you just need loading/content
interface SimpleLoaderProps {
  loading: boolean;
  children: ReactNode;
  className?: string;
}

export const SimpleLoader: React.FC<SimpleLoaderProps> = ({
  loading,
  children,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default DataLoader;
