import React, { createContext, useContext, useEffect, useState } from 'react';

interface ViewportContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

const ViewportContext = createContext<ViewportContextType | undefined>(undefined);

export const useViewport = () => {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error('useViewport must be used within ViewportProvider');
  }
  return context;
};

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with defaults to prevent forced reflow during SSR/initial render
  const [dimensions, setDimensions] = useState({
    width: 1024, // Default desktop width - will be updated in effect
    height: 768  // Default desktop height - will be updated in effect
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width >= 768 && dimensions.width < 1024;
  const isDesktop = dimensions.width >= 1024;

  const value = {
    isMobile,
    isTablet,
    isDesktop,
    width: dimensions.width,
    height: dimensions.height
  };

  return (
    <ViewportContext.Provider value={value}>
      {children}
    </ViewportContext.Provider>
  );
};