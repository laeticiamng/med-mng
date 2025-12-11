import * as React from "react";

// Breakpoints standards
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  isTouchDevice: boolean;
  isRetina: boolean;
  devicePixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  breakpoint: BreakpointKey;
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
}

export interface UseResponsiveOptions {
  debounceMs?: number;
  ssr?: boolean;
}

// Hook principal pour détecter le mobile
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < BREAKPOINTS.md);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// Hook pour détecter la tablette
export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = React.useState(false);

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg);
    };

    checkTablet();
    window.addEventListener("resize", checkTablet);
    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  return isTablet;
}

// Hook pour détecter le desktop
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.lg);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  return isDesktop;
}

// Hook pour vérifier un breakpoint spécifique
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`);
    const onChange = () => setMatches(mql.matches);

    mql.addEventListener("change", onChange);
    setMatches(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return matches;
}

// Hook pour obtenir le breakpoint actuel
export function useCurrentBreakpoint(): BreakpointKey {
  const [breakpoint, setBreakpoint] = React.useState<BreakpointKey>('xs');

  React.useEffect(() => {
    const getBreakpoint = (): BreakpointKey => {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS['2xl']) return '2xl';
      if (width >= BREAKPOINTS.xl) return 'xl';
      if (width >= BREAKPOINTS.lg) return 'lg';
      if (width >= BREAKPOINTS.md) return 'md';
      if (width >= BREAKPOINTS.sm) return 'sm';
      return 'xs';
    };

    const handleResize = () => setBreakpoint(getBreakpoint());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

// Hook pour détecter l'orientation
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const handleOrientation = () => {
      if (window.screen?.orientation?.type) {
        setOrientation(
          window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape'
        );
      } else {
        setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      }
    };

    handleOrientation();
    window.addEventListener("resize", handleOrientation);
    window.addEventListener("orientationchange", handleOrientation);

    return () => {
      window.removeEventListener("resize", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);

  return orientation;
}

// Hook pour détecter les appareils tactiles
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}

// Hook pour détecter les préférences utilisateur
export function useMediaPreferences() {
  const [preferences, setPreferences] = React.useState({
    prefersReducedMotion: false,
    prefersDarkMode: false,
    prefersHighContrast: false
  });

  React.useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
    const highContrast = window.matchMedia('(prefers-contrast: more)');

    const update = () => {
      setPreferences({
        prefersReducedMotion: reducedMotion.matches,
        prefersDarkMode: darkMode.matches,
        prefersHighContrast: highContrast.matches
      });
    };

    update();
    reducedMotion.addEventListener('change', update);
    darkMode.addEventListener('change', update);
    highContrast.addEventListener('change', update);

    return () => {
      reducedMotion.removeEventListener('change', update);
      darkMode.removeEventListener('change', update);
      highContrast.removeEventListener('change', update);
    };
  }, []);

  return preferences;
}

// Hook complet avec toutes les informations de l'appareil
export function useDeviceInfo(options: UseResponsiveOptions = {}): DeviceInfo {
  const { debounceMs = 100 } = options;

  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLandscape: true,
    isPortrait: false,
    isTouchDevice: false,
    isRetina: false,
    devicePixelRatio: 1,
    screenWidth: 1920,
    screenHeight: 1080,
    viewportWidth: 1920,
    viewportHeight: 1080,
    breakpoint: 'lg' as BreakpointKey,
    prefersReducedMotion: false,
    prefersDarkMode: false
  }));

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateDeviceInfo = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const getBreakpoint = (): BreakpointKey => {
          if (width >= BREAKPOINTS['2xl']) return '2xl';
          if (width >= BREAKPOINTS.xl) return 'xl';
          if (width >= BREAKPOINTS.lg) return 'lg';
          if (width >= BREAKPOINTS.md) return 'md';
          if (width >= BREAKPOINTS.sm) return 'sm';
          return 'xs';
        };

        setDeviceInfo({
          isMobile: width < BREAKPOINTS.md,
          isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
          isDesktop: width >= BREAKPOINTS.lg,
          isLandscape: width > height,
          isPortrait: height > width,
          isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
          isRetina: window.devicePixelRatio > 1,
          devicePixelRatio: window.devicePixelRatio || 1,
          screenWidth: window.screen?.width || width,
          screenHeight: window.screen?.height || height,
          viewportWidth: width,
          viewportHeight: height,
          breakpoint: getBreakpoint(),
          prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
        });
      }, debounceMs);
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, [debounceMs]);

  return deviceInfo;
}

// Hook pour les media queries personnalisées
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    mql.addEventListener('change', onChange);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// Utilitaire pour conditionner le rendu selon le device
export function useConditionalRender() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  return {
    renderOnMobile: <T,>(content: T): T | null => (isMobile ? content : null),
    renderOnTablet: <T,>(content: T): T | null => (isTablet ? content : null),
    renderOnDesktop: <T,>(content: T): T | null => (isDesktop ? content : null),
    renderOnMobileOrTablet: <T,>(content: T): T | null => (isMobile || isTablet ? content : null),
    renderOnTabletOrDesktop: <T,>(content: T): T | null => (isTablet || isDesktop ? content : null)
  };
}

export default useIsMobile;
