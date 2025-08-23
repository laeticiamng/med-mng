import React from 'react';
import { Input } from '@/components/ui/input';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { cn } from '@/lib/utils';

interface TabletOptimizedInputProps extends React.ComponentProps<"input"> {
  touchFriendly?: boolean;
  tabletVariant?: 'default' | 'large' | 'compact';
}

export const TabletOptimizedInput: React.FC<TabletOptimizedInputProps> = ({
  className,
  touchFriendly = true,
  tabletVariant = 'default',
  ...props
}) => {
  const { isMobile, isTablet, isTabletPortrait } = useBreakpoints();

  const getInputClasses = () => {
    const baseClasses = [];
    
    if (isTablet) {
      // Hauteur optimisée pour le tactile sur tablette
      if (touchFriendly) {
        switch (tabletVariant) {
          case 'large':
            baseClasses.push('h-14 text-lg px-4');
            break;
          case 'compact':
            baseClasses.push('h-10 text-sm px-3');
            break;
          default:
            baseClasses.push('h-12 text-base px-4');
        }
      }
      
      // Amélioration du focus pour tablettes
      baseClasses.push(
        'focus:ring-2 focus:ring-primary/20 focus:border-primary',
        'transition-all duration-200'
      );
      
      // Padding adaptatif selon l'orientation
      if (isTabletPortrait) {
        baseClasses.push('py-3');
      } else {
        baseClasses.push('py-2');
      }
    } else if (isMobile) {
      // Mobile - touch targets encore plus grands
      if (touchFriendly) {
        baseClasses.push('h-12 text-base px-4 py-3');
      }
    }
    
    return baseClasses.join(' ');
  };

  return (
    <Input
      className={cn(getInputClasses(), className)}
      {...props}
    />
  );
};