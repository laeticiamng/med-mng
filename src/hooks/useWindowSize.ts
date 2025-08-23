import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 375, // Default mobile width
    height: typeof window !== 'undefined' ? window.innerHeight : 667, // Default mobile height
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