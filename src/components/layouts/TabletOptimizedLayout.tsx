import React from 'react';
import { useBreakpoints, useResponsiveSpacing } from '@/hooks/useBreakpoints';
import { cn } from '@/lib/utils';

interface TabletOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  centered?: boolean;
}

export const TabletOptimizedLayout: React.FC<TabletOptimizedLayoutProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = true,
  centered = true
}) => {
  const { isTablet, isTabletPortrait } = useBreakpoints();
  const spacing = useResponsiveSpacing();

  const getContainerClasses = () => {
    const baseClasses = [];
    
    // Largeur maximale adaptative
    if (maxWidth !== 'full') {
      const maxWidthClasses = {
        'sm': 'max-w-sm',
        'md': 'max-w-md', 
        'lg': 'max-w-lg',
        'xl': 'max-w-6xl', // Plus large pour tablettes
        '2xl': 'max-w-7xl'
      };
      baseClasses.push(maxWidthClasses[maxWidth]);
    }
    
    // Centrage
    if (centered) {
      baseClasses.push('mx-auto');
    }
    
    // Padding adaptatif
    if (padding) {
      baseClasses.push(spacing.container);
    }
    
    // Optimisations spécifiques tablettes
    if (isTablet) {
      // Amélioration de la lisibilité sur tablette
      baseClasses.push('relative');
      
      // Padding additionnel sur les côtés pour tablettes en paysage
      if (!isTabletPortrait) {
        baseClasses.push('px-8 md:px-12');
      }
    }
    
    return baseClasses.join(' ');
  };

  return (
    <div className={cn(getContainerClasses(), className)}>
      {children}
    </div>
  );
};