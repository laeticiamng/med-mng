import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { cn } from '@/lib/utils';

interface TabletOptimizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline';
  touchOptimized?: boolean;
}

export const TabletOptimizedCard: React.FC<TabletOptimizedCardProps> = ({
  title,
  children,
  className,
  headerAction,
  variant = 'default',
  touchOptimized = true,
}) => {
  const { isTablet, isTabletPortrait } = useBreakpoints();

  const getCardClasses = () => {
    const baseClasses = 'transition-all duration-200';
    
    // Optimisations spécifiques pour tablettes
    const tabletClasses = isTablet 
      ? 'hover:scale-[1.02] active:scale-[0.98]'
      : 'hover:scale-[1.01]';
    
    // Padding adaptatif pour tablettes
    const paddingClasses = isTabletPortrait 
      ? 'p-5'
      : isTablet 
        ? 'p-6' 
        : 'p-4';

    // Variants
    const variantClasses = {
      default: 'bg-card border shadow-soft hover:shadow-medium',
      elevated: 'bg-card border shadow-medium hover:shadow-large',
      outline: 'border-2 border-primary/20 hover:border-primary/40 bg-background'
    };

    // Touch targets optimisés pour tablettes
    const touchClasses = touchOptimized && isTablet 
      ? 'min-h-[60px] cursor-pointer select-none'
      : '';

    return cn(
      baseClasses,
      tabletClasses,
      variantClasses[variant],
      touchClasses,
      className
    );
  };

  const getContentClasses = () => {
    return isTabletPortrait 
      ? 'p-5 space-y-4'
      : isTablet 
        ? 'p-6 space-y-4'
        : 'p-4 space-y-3';
  };

  const getTitleClasses = () => {
    return isTablet 
      ? 'text-lg font-semibold'
      : 'text-base font-medium';
  };

  return (
    <Card className={getCardClasses()}>
      {title && (
        <CardHeader className={`pb-2 ${isTablet ? 'px-6 pt-6' : 'px-4 pt-4'}`}>
          <div className="flex items-center justify-between">
            <CardTitle className={getTitleClasses()}>
              {title}
            </CardTitle>
            {headerAction}
          </div>
        </CardHeader>
      )}
      <CardContent className={getContentClasses()}>
        {children}
      </CardContent>
    </Card>
  );
};