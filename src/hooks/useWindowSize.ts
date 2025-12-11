import { useState, useEffect, useCallback, useRef } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export interface ExtendedWindowSize extends WindowSize {
  // Dimensions du viewport
  viewportWidth: number;
  viewportHeight: number;
  // Dimensions de l'écran
  screenWidth: number;
  screenHeight: number;
  // Ratios
  aspectRatio: number;
  isLandscape: boolean;
  isPortrait: boolean;
  isSquare: boolean;
  // Informations supplémentaires
  scrollbarWidth: number;
  availableWidth: number;
  availableHeight: number;
  devicePixelRatio: number;
  // Breakpoints
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

export interface UseWindowSizeOptions {
  debounceMs?: number;
  enableRealtimeUpdates?: boolean;
  trackScrollbar?: boolean;
  initialWidth?: number;
  initialHeight?: number;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  largeDesktop: 1536
};

// Fonction utilitaire pour calculer la largeur de la scrollbar
function getScrollbarWidth(): number {
  if (typeof window === 'undefined') return 0;

  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);

  return scrollbarWidth;
}

// Hook basique pour les dimensions de la fenêtre
export const useWindowSize = (options: UseWindowSizeOptions = {}): WindowSize => {
  const {
    debounceMs = 100,
    initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1200,
    initialHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  } = options;

  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: initialWidth,
    height: initialHeight
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleResize = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, debounceMs);
  }, [debounceMs]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleResize]);

  return windowSize;
};

// Hook étendu avec plus d'informations
export const useExtendedWindowSize = (options: UseWindowSizeOptions = {}): ExtendedWindowSize => {
  const {
    debounceMs = 100,
    trackScrollbar = true,
    initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1200,
    initialHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  } = options;

  const [size, setSize] = useState<ExtendedWindowSize>(() => {
    const width = initialWidth;
    const height = initialHeight;
    const aspectRatio = width / height;

    return {
      width,
      height,
      viewportWidth: width,
      viewportHeight: height,
      screenWidth: width,
      screenHeight: height,
      aspectRatio,
      isLandscape: width > height,
      isPortrait: height > width,
      isSquare: Math.abs(aspectRatio - 1) < 0.1,
      scrollbarWidth: 0,
      availableWidth: width,
      availableHeight: height,
      devicePixelRatio: 1,
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
      isDesktop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.largeDesktop,
      isLargeDesktop: width >= BREAKPOINTS.largeDesktop
    };
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculateSize = useCallback((): ExtendedWindowSize => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const screenWidth = window.screen?.width || width;
    const screenHeight = window.screen?.height || height;
    const scrollbarWidth = trackScrollbar ? getScrollbarWidth() : 0;
    const aspectRatio = width / height;

    return {
      width,
      height,
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: document.documentElement.clientHeight,
      screenWidth,
      screenHeight,
      aspectRatio,
      isLandscape: width > height,
      isPortrait: height > width,
      isSquare: Math.abs(aspectRatio - 1) < 0.1,
      scrollbarWidth,
      availableWidth: width - scrollbarWidth,
      availableHeight: height,
      devicePixelRatio: window.devicePixelRatio || 1,
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
      isDesktop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.largeDesktop,
      isLargeDesktop: width >= BREAKPOINTS.largeDesktop
    };
  }, [trackScrollbar]);

  const handleResize = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setSize(calculateSize());
    }, debounceMs);
  }, [debounceMs, calculateSize]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial size
    setSize(calculateSize());

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Observer pour les changements de zoom
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const handleZoomChange = () => setSize(calculateSize());
    mediaQuery.addEventListener('change', handleZoomChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      mediaQuery.removeEventListener('change', handleZoomChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleResize, calculateSize]);

  return size;
};

// Hook pour observer les dimensions d'un élément spécifique
export const useElementSize = <T extends HTMLElement>(
  ref: React.RefObject<T>
): { width: number; height: number } => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(ref.current);

    // Initial size
    const rect = ref.current.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    return () => observer.disconnect();
  }, [ref]);

  return size;
};

// Hook pour les dimensions avec SSR safety
export const useWindowSizeSSR = (
  serverWidth = 1200,
  serverHeight = 800
): WindowSize & { isClient: boolean } => {
  const [isClient, setIsClient] = useState(false);
  const [size, setSize] = useState<WindowSize>({
    width: serverWidth,
    height: serverHeight
  });

  useEffect(() => {
    setIsClient(true);
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { ...size, isClient };
};

// Hook pour obtenir les dimensions disponibles (sans scrollbar)
export const useAvailableSize = (): WindowSize => {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? document.documentElement.clientWidth : 1200,
    height: typeof window !== 'undefined' ? document.documentElement.clientHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

// Utilitaires de calcul
export const calculateResponsiveValue = (
  width: number,
  minValue: number,
  maxValue: number,
  minWidth = 320,
  maxWidth = 1920
): number => {
  if (width <= minWidth) return minValue;
  if (width >= maxWidth) return maxValue;

  const ratio = (width - minWidth) / (maxWidth - minWidth);
  return minValue + ratio * (maxValue - minValue);
};

export const getColumnsForWidth = (width: number): number => {
  if (width < 640) return 1;
  if (width < 768) return 2;
  if (width < 1024) return 3;
  if (width < 1280) return 4;
  return 5;
};

export default useWindowSize;
