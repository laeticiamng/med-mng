import React, { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionFeedbackProps {
  children: React.ReactNode;
  onAction: () => Promise<void> | void;
  successMessage?: string;
  errorMessage?: string;
  loadingText?: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

type ActionState = 'idle' | 'loading' | 'success' | 'error';

export const ActionFeedback: React.FC<ActionFeedbackProps> = ({
  children,
  onAction,
  successMessage = 'Action réussie !',
  errorMessage = 'Une erreur est survenue',
  loadingText,
  disabled = false,
  variant = 'default',
  size = 'default',
  className
}) => {
  const [state, setState] = useState<ActionState>('idle');

  const handleAction = useCallback(async () => {
    if (disabled || state === 'loading') return;

    setState('loading');

    try {
      await onAction();
      setState('success');
      
      toast({
        title: 'Succès',
        description: successMessage,
        variant: 'default'
      });

      // Reset to idle after success animation
      setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      setState('error');
      
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : errorMessage,
        variant: 'destructive'
      });

      // Reset to idle after error display
      setTimeout(() => setState('idle'), 3000);
    }
  }, [onAction, successMessage, errorMessage, disabled, state]);

  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getVariant = () => {
    if (state === 'success') return 'default';
    if (state === 'error') return 'destructive';
    return variant;
  };

  const isDisabled = disabled || state === 'loading';

  return (
    <Button
      onClick={handleAction}
      disabled={isDisabled}
      variant={getVariant()}
      size={size}
      className={cn(
        'relative transition-all duration-200 touch-target',
        state === 'success' && 'bg-success hover:bg-success/90 text-success-foreground',
        state === 'error' && 'animate-pulse',
        className
      )}
      aria-live="polite"
      aria-describedby={state === 'loading' ? 'loading-description' : undefined}
    >
      <span className={cn(
        'flex items-center gap-2',
        state === 'loading' && 'opacity-75'
      )}>
        {getIcon()}
        {state === 'loading' && loadingText ? loadingText : children}
      </span>
      
      {state === 'loading' && (
        <span id="loading-description" className="sr-only">
          Action en cours, veuillez patienter
        </span>
      )}
    </Button>
  );
};