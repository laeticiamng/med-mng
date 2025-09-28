import React, { createContext, useContext, useState, useEffect } from 'react';

const ViewportContext = createContext();

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const ViewportProvider = ({ children }) => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    breakpoint: 'lg'
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint = 'sm';
      let isMobile = true;
      let isTablet = false;
      let isDesktop = false;

      if (width >= breakpoints['2xl']) {
        breakpoint = '2xl';
        isDesktop = true;
        isMobile = false;
      } else if (width >= breakpoints.xl) {
        breakpoint = 'xl';
        isDesktop = true;
        isMobile = false;
      } else if (width >= breakpoints.lg) {
        breakpoint = 'lg';
        isDesktop = true;
        isMobile = false;
      } else if (width >= breakpoints.md) {
        breakpoint = 'md';
        isTablet = true;
        isMobile = false;
      } else if (width >= breakpoints.sm) {
        breakpoint = 'sm';
        isTablet = true;
        isMobile = false;
      }

      setViewport({ width, height, isMobile, isTablet, isDesktop, breakpoint });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const isBreakpoint = (bp) => viewport.breakpoint === bp;
  const isMinBreakpoint = (bp) => viewport.width >= breakpoints[bp];
  const isMaxBreakpoint = (bp) => viewport.width <= breakpoints[bp];

  return (
    <ViewportContext.Provider value={{
      ...viewport,
      breakpoints,
      isBreakpoint,
      isMinBreakpoint,
      isMaxBreakpoint
    }}>
      {children}
    </ViewportContext.Provider>
  );
};

export const useViewport = () => {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error('useViewport must be used within ViewportProvider');
  }
  return context;
};