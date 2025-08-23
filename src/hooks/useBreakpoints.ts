import { useState, useEffect } from 'react';

export const useBreakpoints = () => {
  const [breakpoints, setBreakpoints] = useState({
    isMobileSmall: false,
    isMobile: false,
    isTablet: false,
    isTabletPortrait: false,
    isDesktop: false,
    isDesktopLarge: false,
  });

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      
      setBreakpoints({
        isMobileSmall: width < 480,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isTabletPortrait: width >= 768 && width < 900,
        isDesktop: width >= 1024,
        isDesktopLarge: width >= 1440,
      });
    };

    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  return breakpoints;
};

export const useResponsiveGrid = () => {
  const { isMobile, isTablet } = useBreakpoints();
  
  return {
    stats: isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'grid-cols-5',
    navigation: isMobile ? 'flex-col' : 'flex-row',
    gap: 'gap-4',
    items: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3',
    cards: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3',
  };
};

export const useResponsiveSpacing = () => {
  const { isMobile } = useBreakpoints();
  
  return {
    container: isMobile ? 'px-4 py-6' : 'px-6 py-8',
    element: isMobile ? 'p-4' : 'p-6',
    section: isMobile ? 'space-y-4' : 'space-y-6',
    header: isMobile ? 'py-4' : 'py-6',
  };
};