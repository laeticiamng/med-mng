/**
 * LOADING SPINNER OPTIMISÉ
 * =========================
 * Composant de loading performant avec animations CSS pures
 */

import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const spinnerVariants = cva(
  "animate-spin border-solid border-t-transparent rounded-full",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2", 
        lg: "h-8 w-8 border-3",
        xl: "h-12 w-12 border-4"
      },
      variant: {
        primary: "border-primary",
        secondary: "border-secondary",
        muted: "border-muted-foreground",
        white: "border-white"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "primary"
    }
  }
);

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size, 
  variant, 
  className 
}) => {
  return (
    <div 
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label="Chargement en cours"
    >
      <span className="sr-only">Chargement...</span>
    </div>
  );
};