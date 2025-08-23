import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useBreakpoints } from '@/hooks/useBreakpoints';
import { cn } from '@/lib/utils';

interface MobileOptimizedButtonProps extends ButtonProps {
  mobileSize?: 'sm' | 'default' | 'lg' | 'icon';
  touchFriendly?: boolean;
  fullWidth?: boolean;
  hapticFeedback?: boolean;
}

export const MobileOptimizedButton: React.FC<MobileOptimizedButtonProps> = ({
  className,
  size,
  mobileSize,
  touchFriendly = true,
  fullWidth = false,
  hapticFeedback = true,
  children,
  onClick,
  ...props
}) => {
  const { isMobile, isMobileSmall } = useBreakpoints();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Haptic feedback sur mobile (si supporté)
    if (hapticFeedback && isMobile && 'vibrate' in navigator) {
      navigator.vibrate(10); // Courte vibration
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const getSize = () => {
    // Si une taille spécifique pour mobile est définie
    if (isMobile && mobileSize) {
      return mobileSize;
    }
    
    // Logique adaptative par défaut
    if (isMobileSmall) {
      return size || 'sm';
    }
    
    if (isMobile) {
      // Sur mobile, augmenter légèrement la taille par défaut
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

  const getMobileClasses = () => {
    if (!isMobile) return '';
    
    const baseClasses = [];
    
    // Touch targets optimisés pour mobile
    if (touchFriendly) {
      if (isMobileSmall) {
        baseClasses.push('min-h-[44px] min-w-[44px]');
      } else {
        baseClasses.push('min-h-[48px] min-w-[48px]');
      }
    }
    
    // Pleine largeur sur mobile si demandé
    if (fullWidth) {
      baseClasses.push('w-full');
    }
    
    // Amélioration des animations tactiles
    baseClasses.push(
      'active:scale-95 transition-all duration-150',
      'hover:scale-105 active:transition-none',
      'touch-manipulation select-none'
    );
    
    // Styles spéciaux pour les très petits écrans
    if (isMobileSmall) {
      baseClasses.push('text-sm px-3');
    }
    
    return baseClasses.join(' ');
  };

  return (
    <Button
      size={getSize()}
      onClick={handleClick}
      className={cn(getMobileClasses(), className)}
      {...props}
    >
      {children}
    </Button>
  );
};