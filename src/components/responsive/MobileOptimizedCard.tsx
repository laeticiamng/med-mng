import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'compact' | 'elevated';
  touchOptimized?: boolean;
  swipeable?: boolean;
}

export const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  title,
  children,
  className,
  headerAction,
  variant = 'default',
  touchOptimized = true,
  swipeable = false,
}) => {
  const { isMobile, isMobileSmall } = useBreakpoints();

  const getCardClasses = () => {
    const baseClasses = 'transition-all duration-200 rounded-xl';
    
    // Optimisations spécifiques pour mobile
    const mobileClasses = isMobile 
      ? 'hover:scale-[1.01] active:scale-[0.98] active:transition-none'
      : 'hover:scale-[1.01]';
    
    // Variants optimisés pour mobile
    const variantClasses = {
      default: 'bg-card border shadow-sm hover:shadow-md',
      compact: 'bg-card/80 border border-border/50',
      elevated: 'bg-card shadow-md hover:shadow-lg border-0'
    };

    // Touch targets optimisés pour mobile
    const touchClasses = touchOptimized && isMobile 
      ? 'min-h-[56px] cursor-pointer select-none touch-manipulation'
      : '';

    // Support pour les gestes de swipe
    const swipeClasses = swipeable && isMobile
      ? 'overflow-hidden overscroll-contain'
      : '';

    return cn(
      baseClasses,
      mobileClasses,
      variantClasses[variant],
      touchClasses,
      swipeClasses,
      className
    );
  };

  const getContentClasses = () => {
    if (isMobileSmall) {
      return 'p-3 space-y-2';
    }
    return isMobile 
      ? 'p-4 space-y-3'
      : 'p-6 space-y-4';
  };

  const getTitleClasses = () => {
    if (isMobileSmall) {
      return 'text-sm font-medium';
    }
    return isMobile 
      ? 'text-base font-medium'
      : 'text-lg font-semibold';
  };

  const getHeaderClasses = () => {
    if (isMobileSmall) {
      return 'pb-1 px-3 pt-3';
    }
    return isMobile 
      ? 'pb-2 px-4 pt-4'
      : 'pb-2 px-6 pt-6';
  };

  return (
    <Card className={getCardClasses()}>
      {title && (
        <CardHeader className={getHeaderClasses()}>
          <div className="flex items-center justify-between">
            <CardTitle className={getTitleClasses()}>
              {title}
            </CardTitle>
            {headerAction && (
              <div className={isMobileSmall ? 'scale-90' : ''}>
                {headerAction}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={getContentClasses()}>
        {children}
      </CardContent>
    </Card>
  );
};