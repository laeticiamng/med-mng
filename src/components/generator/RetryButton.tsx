import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetryButtonProps {
  onRetry: () => void;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  nextRetryIn?: number;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  nextRetryIn,
  disabled = false,
  className,
  variant = 'outline',
  size = 'default'
}) => {
  const canRetry = retryCount < maxRetries && !isRetrying && !disabled;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onRetry}
      disabled={!canRetry}
      className={cn('gap-2', className)}
    >
      {isRetrying ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Nouvelle tentative...</span>
        </>
      ) : nextRetryIn && nextRetryIn > 0 ? (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>Réessayer dans {Math.ceil(nextRetryIn / 1000)}s</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>
            Réessayer
            {retryCount > 0 && ` (${retryCount}/${maxRetries})`}
          </span>
        </>
      )}
    </Button>
  );
};
