import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { cn } from '@/lib/utils';

interface TabletOptimizedButtonProps extends ButtonProps {
  tabletSize?: 'sm' | 'lg' | 'default' | 'icon';
  touchFriendly?: boolean;
}

export const TabletOptimizedButton: React.FC<TabletOptimizedButtonProps> = ({
  className,
  size,
  tabletSize,
  touchFriendly = true,
  children,
  ...props
}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  const getSize = () => {
    // Si une taille spécifique pour tablette est définie
    if (isTablet && tabletSize) {
      return tabletSize;
    }
    
    // Sinon, logique adaptative par défaut
    if (isMobile) {
      return size || 'sm';
    }
    
    if (isTablet) {
      // Sur tablette, augmenter légèrement la taille par défaut
      switch (size) {
        case 'sm': return 'default';
        case 'default': return 'lg';
        case 'lg': return 'lg';
        case 'icon': return 'icon';
        default: return 'default';
      }
    }
    
    return size || 'default';
  };

  const getTabletClasses = () => {
    if (!isTablet) return '';
    
    const baseClasses = [];
    
    // Touch targets optimisés pour tablettes
    if (touchFriendly) {
      baseClasses.push('min-h-[48px] min-w-[48px]');
    }
    
    // Amélioration des animations tactiles
    baseClasses.push(
      'active:scale-95 transition-transform duration-150',
      'hover:scale-105 active:transition-none'
    );
    
    return baseClasses.join(' ');
  };

  return (
    <Button
      size={getSize()}
      className={cn(getTabletClasses(), className)}
      {...props}
    >
      {children}
    </Button>
  );
};