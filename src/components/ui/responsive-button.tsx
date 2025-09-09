import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { cn } from '@/lib/utils';

interface ResponsiveButtonProps extends ButtonProps {
  mobileSize?: 'sm' | 'default' | 'lg' | 'icon';
  tabletSize?: 'sm' | 'default' | 'lg' | 'icon';
  touchFriendly?: boolean;
  fullWidth?: boolean;
  hapticFeedback?: boolean;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  className,
  size,
  mobileSize,
  tabletSize,
  touchFriendly = true,
  fullWidth = false,
  hapticFeedback = true,
  children,
  onClick,
  ...props
}) => {
  const { isMobile, isMobileSmall, isTablet } = useBreakpoints();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Haptic feedback sur mobile (si supporté)
    if (hapticFeedback && isMobile && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const getResponsiveSize = () => {
    // Taille spécifique pour mobile
    if (isMobile && mobileSize) {
      return mobileSize;
    }
    
    // Taille spécifique pour tablette
    if (isTablet && tabletSize) {
      return tabletSize;
    }
    
    // Logique adaptative par défaut
    if (isMobileSmall) {
      return size || 'sm';
    }
    
    if (isMobile) {
      switch (size) {
        case 'sm': return 'default';
        case 'default': return 'lg';
        case 'lg': return 'lg';
        case 'icon': return 'icon';
        default: return 'default';
      }
    }
    
    if (isTablet) {
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

  const getResponsiveClasses = () => {
    const baseClasses = [];
    
    if (isMobile || isTablet) {
      // Touch targets optimisés
      if (touchFriendly) {
        if (isMobileSmall) {
          baseClasses.push('min-h-[44px] min-w-[44px]');
        } else {
          baseClasses.push('min-h-[48px] min-w-[48px]');
        }
      }
      
      // Pleine largeur sur mobile si demandé
      if (fullWidth && isMobile) {
        baseClasses.push('w-full');
      }
      
      // Animations tactiles améliorées
      baseClasses.push(
        'active:scale-95 transition-all duration-150',
        'hover:scale-105 active:transition-none',
        'touch-manipulation select-none'
      );
      
      // Styles spéciaux pour les très petits écrans
      if (isMobileSmall) {
        baseClasses.push('text-sm px-3');
      }
    }
    
    return baseClasses.join(' ');
  };

  return (
    <Button
      size={getResponsiveSize()}
      onClick={handleClick}
      className={cn(getResponsiveClasses(), className)}
      {...props}
    >
      {children}
    </Button>
  );
};