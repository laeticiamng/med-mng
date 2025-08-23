import React from 'react';
import { useBreakpoints, useResponsiveSpacing } from '@/hooks/useBreakpoints';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: boolean;
  safeArea?: boolean;
  scrollable?: boolean;
  fullHeight?: boolean;
}

export const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  className,
  header,
  footer,
  padding = true,
  safeArea = true,
  scrollable = true,
  fullHeight = true
}) => {
  const { isMobile, isMobileSmall } = useBreakpoints();
  const spacing = useResponsiveSpacing();

  const getLayoutClasses = () => {
    const baseClasses = ['flex flex-col'];
    
    // Hauteur complète sur mobile
    if (fullHeight && isMobile) {
      baseClasses.push('min-h-screen');
    }
    
    // Safe area pour les encochures et barres
    if (safeArea && isMobile) {
      baseClasses.push('safe-area-inset');
    }
    
    return baseClasses.join(' ');
  };

  const getContentClasses = () => {
    const baseClasses = ['flex-1'];
    
    // Scroll optimisé pour mobile
    if (scrollable && isMobile) {
      baseClasses.push('overflow-auto overscroll-contain');
      // Amélioration du scroll momentum sur iOS
      baseClasses.push('scroll-smooth [-webkit-overflow-scrolling:touch]');
    }
    
    // Padding adaptatif
    if (padding) {
      baseClasses.push(spacing.container);
    }
    
    return baseClasses.join(' ');
  };

  const getHeaderClasses = () => {
    if (!isMobile) return '';
    
    return cn(
      'sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b',
      safeArea ? 'pt-safe' : '',
      isMobileSmall ? 'px-3 py-2' : 'px-4 py-3'
    );
  };

  const getFooterClasses = () => {
    if (!isMobile) return '';
    
    return cn(
      'sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t',
      safeArea ? 'pb-safe' : '',
      isMobileSmall ? 'px-3 py-2' : 'px-4 py-3'
    );
  };

  // Layout spécifique pour mobile
  if (isMobile) {
    return (
      <div className={cn(getLayoutClasses(), className)}>
        {header && (
          <header className={getHeaderClasses()}>
            {header}
          </header>
        )}
        
        <main className={getContentClasses()}>
          {children}
        </main>
        
        {footer && (
          <footer className={getFooterClasses()}>
            {footer}
          </footer>
        )}
      </div>
    );
  }

  // Layout standard pour desktop/tablette
  return (
    <div className={cn('container mx-auto', spacing.container, className)}>
      {header}
      <main>{children}</main>
      {footer}
    </div>
  );
};