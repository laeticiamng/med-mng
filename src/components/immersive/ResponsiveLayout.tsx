import { ReactNode } from 'react';
import { useBreakpoints } from '@/hooks/useBreakpoints';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  mobileFirst?: boolean;
  noOverlays?: boolean;
}

export const ResponsiveLayout = ({ 
  children, 
  className = '', 
  mobileFirst = true, 
  noOverlays = true 
}: ResponsiveLayoutProps) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  const baseClasses = `
    ${mobileFirst ? 'w-full' : ''}
    ${noOverlays ? 'relative' : ''}
    ${isMobile ? 'px-4 py-3' : isTablet ? 'px-6 py-4' : 'px-8 py-6'}
    ${className}
  `;

  const containerClasses = `
    ${isMobile ? 'max-w-sm mx-auto' : isTablet ? 'max-w-4xl mx-auto' : 'max-w-7xl mx-auto'}
    ${isMobile ? 'space-y-4' : isTablet ? 'space-y-6' : 'space-y-8'}
  `;

  return (
    <div className={baseClasses}>
      <div className={containerClasses}>
        {children}
      </div>
    </div>
  );
};