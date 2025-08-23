import { useWindowSize } from './useWindowSize';
import { useMemo } from 'react';

interface BreakpointState {
  isMobile: boolean;
  isMobileSmall: boolean;
  isMobileLarge: boolean;
  isTablet: boolean;
  isTabletPortrait: boolean;
  isTabletLandscape: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

export const useBreakpoints = (): BreakpointState => {
  const { width, height } = useWindowSize();

  return useMemo(() => {
    const isMobile = width < 768;
    const isMobileSmall = width < 375; // iPhone SE et plus petits
    const isMobileLarge = width >= 375 && width < 430; // iPhone 14 Pro Max et similaires
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024 && width < 1440;
    const isLargeDesktop = width >= 1440;
    const orientation = width > height ? 'landscape' : 'portrait';
    
    // Détection spécifique pour tablettes en mode télétravail
    const isTabletPortrait = isTablet && orientation === 'portrait';
    const isTabletLandscape = isTablet && orientation === 'landscape';

    return {
      isMobile,
      isMobileSmall,
      isMobileLarge,
      isTablet,
      isTabletPortrait,
      isTabletLandscape,
      isDesktop,
      isLargeDesktop,
      width,
      height,
      orientation,
    };
  }, [width, height]);
};

// Hook utilitaire pour obtenir les classes de grille optimisées par breakpoint
export const useResponsiveGrid = () => {
  const { isMobile, isMobileSmall, isTabletPortrait, isTabletLandscape, isDesktop, isLargeDesktop } = useBreakpoints();

  return useMemo(() => {
    // Configuration optimisée pour chaque type d'écran
    if (isMobileSmall) {
      return {
        cards: 'grid-cols-1',
        stats: 'grid-cols-1', // Une seule colonne sur très petits écrans
        navigation: 'flex-col',
        gap: 'gap-3'
      };
    }
    
    if (isMobile) {
      return {
        cards: 'grid-cols-1',
        stats: 'grid-cols-2',
        navigation: 'flex-col',
        gap: 'gap-4'
      };
    }
    
    if (isTabletPortrait) {
      return {
        cards: 'grid-cols-2', // 2 colonnes en mode portrait
        stats: 'grid-cols-3', // 3 stats par ligne
        navigation: 'flex-row flex-wrap',
        gap: 'gap-5'
      };
    }
    
    if (isTabletLandscape) {
      return {
        cards: 'grid-cols-3', // 3 colonnes en mode paysage
        stats: 'grid-cols-4', // 4 stats par ligne
        navigation: 'flex-row',
        gap: 'gap-6'
      };
    }
    
    if (isDesktop) {
      return {
        cards: 'grid-cols-4',
        stats: 'grid-cols-5',
        navigation: 'flex-row',
        gap: 'gap-6'
      };
    }
    
    // Large desktop
    return {
      cards: 'grid-cols-5',
      stats: 'grid-cols-6',
      navigation: 'flex-row',
      gap: 'gap-8'
    };
  }, [isMobile, isMobileSmall, isTabletPortrait, isTabletLandscape, isDesktop, isLargeDesktop]);
};

// Hook pour les espacements adaptatifs
export const useResponsiveSpacing = () => {
  const { isMobile, isMobileSmall, isTablet } = useBreakpoints();

  return useMemo(() => {
    if (isMobileSmall) {
      return {
        container: 'px-3 py-4',
        section: 'py-6',
        header: 'mb-4',
        element: 'p-3',
        text: 'text-sm'
      };
    }
    
    if (isMobile) {
      return {
        container: 'px-4 py-6',
        section: 'py-8',
        header: 'mb-6',
        element: 'p-4',
        text: 'text-base'
      };
    }
    
    if (isTablet) {
      return {
        container: 'px-6 py-8',
        section: 'py-10',
        header: 'mb-8',
        element: 'p-5',
        text: 'text-base'
      };
    }
    
    // Desktop et plus
    return {
      container: 'px-8 py-12',
      section: 'py-12',
      header: 'mb-10',
      element: 'p-6',
      text: 'text-lg'
    };
  }, [isMobile, isMobileSmall, isTablet]);
};