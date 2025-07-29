import React from 'react';
import { useViewport } from './ViewportProvider';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  mobileFirst?: boolean;
  breakpoints?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  mobileFirst = true,
  breakpoints = {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2 lg:grid-cols-3',
    desktop: 'xl:grid-cols-4 2xl:grid-cols-5'
  }
}) => {
  const { isMobile, isTablet, isDesktop } = useViewport();

  const getResponsiveClasses = () => {
    const classes = [];
    
    if (mobileFirst) {
      // Mobile first approach
      classes.push(breakpoints.mobile);
      if (!isMobile) classes.push(breakpoints.tablet);
      if (isDesktop) classes.push(breakpoints.desktop);
    } else {
      // Desktop first approach
      if (isDesktop) classes.push(breakpoints.desktop);
      else if (isTablet) classes.push(breakpoints.tablet);
      else classes.push(breakpoints.mobile);
    }
    
    return classes.join(' ');
  };

  return (
    <div 
      className={cn(
        'grid gap-4 w-full',
        getResponsiveClasses(),
        className
      )}
      data-responsive-layout={`${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}
    >
      {children}
    </div>
  );
};

// Hook pour gérer les breakpoints personnalisés
export const useResponsiveBreakpoint = () => {
  const { width } = useViewport();
  
  const getBreakpoint = () => {
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  };

  return {
    breakpoint: getBreakpoint(),
    isXS: width < 640,
    isSM: width >= 640 && width < 768,
    isMD: width >= 768 && width < 1024,
    isLG: width >= 1024 && width < 1280,
    isXL: width >= 1280 && width < 1536,
    is2XL: width >= 1536
  };
};

// Composant pour contenu conditionnel selon le breakpoint
interface ResponsiveContentProps {
  showOn: 'mobile' | 'tablet' | 'desktop' | 'mobile-tablet' | 'tablet-desktop';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ResponsiveContent: React.FC<ResponsiveContentProps> = ({
  showOn,
  children,
  fallback = null
}) => {
  const { isMobile, isTablet, isDesktop } = useViewport();
  
  const shouldShow = () => {
    switch (showOn) {
      case 'mobile': return isMobile;
      case 'tablet': return isTablet;
      case 'desktop': return isDesktop;
      case 'mobile-tablet': return isMobile || isTablet;
      case 'tablet-desktop': return isTablet || isDesktop;
      default: return true;
    }
  };

  return shouldShow() ? <>{children}</> : <>{fallback}</>;
};