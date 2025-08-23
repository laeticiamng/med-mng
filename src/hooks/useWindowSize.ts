import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = (): WindowSize => {
  // Initialize with defaults to prevent initial forced reflow
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 375, // Default mobile width - will be updated in effect
    height: 667, // Default mobile height - will be updated in effect
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    function handleResize() {
      // Debounce resize events to prevent excessive reflows
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Use requestAnimationFrame to batch layout reads
        requestAnimationFrame(() => {
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        });
      }, 16); // ~60fps throttling
    }

    // Set initial size with RAF to avoid initial reflow
    requestAnimationFrame(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};