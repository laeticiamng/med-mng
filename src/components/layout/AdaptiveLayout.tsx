import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAdvancedDeviceDetection } from '@/hooks/useAdvancedDeviceDetection';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  // Configuration responsive
  mobileFirst?: boolean;
  enableFluidTypography?: boolean;
  enableOptimalSpacing?: boolean;
  enablePerformanceMode?: boolean;
  // Layout adaptatif
  containerType?: 'fluid' | 'constrained' | 'adaptive';
  maxWidth?: number | string;
  // Optimisations
  enableViewportUnits?: boolean;
  enableContainerQueries?: boolean;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  className,
  mobileFirst = true,
  enableFluidTypography = true,
  enableOptimalSpacing = true,
  enablePerformanceMode = true,
  containerType = 'adaptive',
  maxWidth = '1400px',
  enableViewportUnits = true,
  enableContainerQueries = true,
}) => {
  const {
    capabilities,
    isMobile,
    isTablet,
    isDesktop,
    isLowPerformance,
    isSlowNetwork,
  } = useAdvancedDeviceDetection();

  // Calcul des classes CSS adaptatives
  const adaptiveClasses = useMemo(() => {
    const classes: string[] = [];
    
    // Classes de base selon l'appareil
    if (isMobile) {
      classes.push('mobile-layout');
      if (capabilities.screenSize.diagonal < 4.5) classes.push('mobile-small');
      if (capabilities.screenSize.diagonal > 6.5) classes.push('mobile-large');
    } else if (isTablet) {
      classes.push('tablet-layout');
      if (capabilities.orientation === 'portrait') classes.push('tablet-portrait');
      else classes.push('tablet-landscape');
    } else if (isDesktop) {
      classes.push('desktop-layout');
      if (capabilities.screenSize.width > 2560) classes.push('desktop-xl');
    }
    
    // Classes de densité
    switch (capabilities.pixelDensity.category) {
      case 'ultra': classes.push('ultra-hd'); break;
      case 'retina': classes.push('retina'); break;
      case 'high': classes.push('high-dpi'); break;
      default: classes.push('standard-dpi');
    }
    
    // Classes de performance
    if (isLowPerformance) classes.push('low-performance');
    if (isSlowNetwork) classes.push('slow-network');
    if (capabilities.preferences.reducedMotion) classes.push('reduced-motion');
    
    // Container type
    switch (containerType) {
      case 'fluid':
        classes.push('w-full min-h-screen');
        break;
      case 'constrained':
        classes.push('container mx-auto px-4');
        break;
      case 'adaptive':
        if (isMobile) classes.push('w-full px-4');
        else if (isTablet) classes.push('max-w-4xl mx-auto px-6');
        else classes.push('container mx-auto px-8');
        break;
    }
    
    return classes;
  }, [
    capabilities,
    isMobile,
    isTablet,
    isDesktop,
    isLowPerformance,
    isSlowNetwork,
    containerType,
  ]);

  // Styles CSS adaptatifs
  const adaptiveStyles = useMemo(() => {
    const styles: React.CSSProperties = {};
    
    // Max width adaptatif
    if (typeof maxWidth === 'string') {
      styles.maxWidth = maxWidth;
    } else if (typeof maxWidth === 'number') {
      // Ajustement selon l'appareil
      let adaptiveMaxWidth = maxWidth;
      if (isMobile) adaptiveMaxWidth = Math.min(maxWidth, 480);
      else if (isTablet) adaptiveMaxWidth = Math.min(maxWidth, 1024);
      
      styles.maxWidth = `${adaptiveMaxWidth}px`;
    }
    
    // Typography fluide
    if (enableFluidTypography) {
      const baseSize = isMobile ? 14 : isTablet ? 15 : 16;
      const scaleFactor = capabilities.pixelDensity.dpr > 1.5 ? 1.1 : 1;
      styles.fontSize = `${baseSize * scaleFactor}px`;
    }
    
    // Espacement optimal
    if (enableOptimalSpacing) {
      const spacing = isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem';
      styles.padding = spacing;
    }
    
    // Unités viewport adaptatives
    if (enableViewportUnits) {
      // Gestion des viewports problématiques (iOS Safari, etc.)
      if (capabilities.deviceType === 'mobile') {
        styles.minHeight = '100dvh'; // Dynamic viewport height
      }
    }
    
    return styles;
  }, [
    maxWidth,
    enableFluidTypography,
    enableOptimalSpacing,
    enableViewportUnits,
    capabilities,
    isMobile,
    isTablet,
  ]);

  // CSS Variables pour les container queries
  const cssVariables = useMemo(() => {
    if (!enableContainerQueries) return {};
    
    return {
      '--container-width': `${capabilities.screenSize.width}px`,
      '--container-height': `${capabilities.screenSize.height}px`,
      '--device-pixel-ratio': capabilities.pixelDensity.dpr.toString(),
      '--screen-diagonal': `${capabilities.screenSize.diagonal}in`,
    };
  }, [enableContainerQueries, capabilities]);

  return (
    <div
      className={cn(
        // Classes de base
        'adaptive-layout',
        // Classes adaptatives calculées
        ...adaptiveClasses,
        // Mode performance réduit
        enablePerformanceMode && isLowPerformance && 'performance-mode',
        // Classes personnalisées
        className
      )}
      style={{
        ...adaptiveStyles,
        ...cssVariables,
      }}
      data-device-type={capabilities.deviceType}
      data-orientation={capabilities.orientation}
      data-pixel-density={capabilities.pixelDensity.category}
      data-performance={capabilities.performance.level}
      data-network={capabilities.network.speed}
    >
      {children}
    </div>
  );
};