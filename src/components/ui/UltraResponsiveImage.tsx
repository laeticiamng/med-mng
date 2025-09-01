import React, { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAdvancedDeviceDetection } from '@/hooks/useAdvancedDeviceDetection';

interface UltraResponsiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'loading'> {
  src: string;
  alt: string;
  // Dimensions de base
  width?: number;
  height?: number;
  aspectRatio?: number;
  // Configuration avancée
  priority?: boolean;
  quality?: 'auto' | 'low' | 'medium' | 'high' | 'ultra' | number;
  format?: 'auto' | 'avif' | 'webp' | 'jpeg' | 'png';
  // Responsive
  breakpoints?: Record<string, { width: number; quality?: number }>;
  sizes?: string | 'auto';
  // Optimisations
  enableArtDirection?: boolean;
  enableCriticalResource?: boolean;
  enableProgressiveLoading?: boolean;
  // Fallbacks
  fallback?: string;
  placeholder?: 'blur' | 'shimmer' | 'skeleton' | React.ReactNode;
  // Comportement
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  // Callbacks
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onLoadStart?: () => void;
}

export const UltraResponsiveImage: React.FC<UltraResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  priority = false,
  quality = 'auto',
  format = 'auto',
  breakpoints,
  sizes = 'auto',
  enableArtDirection = false,
  enableCriticalResource = false,
  enableProgressiveLoading = true,
  fallback = '/placeholder.svg',
  placeholder = 'shimmer',
  objectFit = 'cover',
  loading = 'lazy',
  className,
  onLoad,
  onError,
  onLoadStart,
  ...props
}) => {
  const {
    capabilities,
    getOptimalImageQuality,
    getOptimalImageFormat,
    shouldUseLazyLoading,
    isMobile,
    isTablet,
    isDesktop,
    isHighDPI,
    isLowPerformance,
    isSlowNetwork,
  } = useAdvancedDeviceDetection();

  const [currentSrc, setCurrentSrc] = useState(src);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Calcul des dimensions optimales
  const optimalDimensions = useMemo(() => {
    const { screenSize, pixelDensity } = capabilities;
    const maxWidth = Math.min(screenSize.width, 3840); // 4K max
    
    let targetWidth = width || maxWidth;
    let targetHeight = height;

    // Ajustement selon le type d'appareil
    if (isMobile) {
      targetWidth = Math.min(targetWidth, screenSize.width);
    } else if (isTablet) {
      targetWidth = Math.min(targetWidth, screenSize.width * 0.8);
    }

    // Application du DPR pour les écrans haute résolution
    if (isHighDPI && !isSlowNetwork) {
      targetWidth *= Math.min(pixelDensity.dpr, 2.5);
    }

    // Calcul de la hauteur si aspect ratio fourni
    if (aspectRatio && !targetHeight) {
      targetHeight = Math.round(targetWidth / aspectRatio);
    } else if (!targetHeight && width && height) {
      targetHeight = Math.round((targetWidth / width) * height);
    }

    return {
      width: Math.round(targetWidth),
      height: targetHeight ? Math.round(targetHeight) : undefined,
    };
  }, [capabilities, width, height, aspectRatio, isMobile, isTablet, isHighDPI, isSlowNetwork]);

  // Génération des breakpoints adaptatifs
  const adaptiveBreakpoints = useMemo(() => {
    const defaultBreakpoints = {
      mobile: { width: 640, quality: isLowPerformance ? 60 : 75 },
      tablet: { width: 1024, quality: isLowPerformance ? 70 : 80 },
      desktop: { width: 1920, quality: isLowPerformance ? 75 : 85 },
      xl: { width: 2560, quality: isLowPerformance ? 80 : 90 },
    };

    return breakpoints || defaultBreakpoints;
  }, [breakpoints, isLowPerformance]);

  // Qualité optimale
  const optimalQuality = useMemo(() => {
    if (typeof quality === 'number') return quality;
    
    const autoQuality = getOptimalImageQuality();
    
    switch (quality) {
      case 'low': return Math.max(30, autoQuality - 25);
      case 'medium': return Math.max(50, autoQuality - 10);
      case 'high': return Math.min(95, autoQuality + 10);
      case 'ultra': return 95;
      case 'auto':
      default: return autoQuality;
    }
  }, [quality, getOptimalImageQuality]);

  // Format optimal
  const optimalFormat = useMemo(() => {
    if (format !== 'auto') return format;
    return getOptimalImageFormat();
  }, [format, getOptimalImageFormat]);

  // Génération de l'URL optimisée
  const generateOptimizedUrl = (targetWidth: number, targetQuality?: number) => {
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) {
      return src; // URL externe, pas d'optimisation possible
    }

    const params = new URLSearchParams({
      w: targetWidth.toString(),
      q: (targetQuality || optimalQuality).toString(),
      f: optimalFormat,
      fit: objectFit === 'contain' ? 'contain' : 'cover',
    });

    // Optimisations supplémentaires
    if (enableProgressiveLoading) params.set('progressive', 'true');
    if (isSlowNetwork) params.set('optimize', 'bandwidth');

    return `${src}?${params.toString()}`;
  };

  // Génération du srcSet
  const srcSet = useMemo(() => {
    if (!isInView && !priority) return '';

    return Object.entries(adaptiveBreakpoints)
      .map(([_, config]) => {
        const url = generateOptimizedUrl(config.width, config.quality);
        return `${url} ${config.width}w`;
      })
      .join(', ');
  }, [adaptiveBreakpoints, isInView, priority, optimalQuality, optimalFormat]);

  // Calcul des sizes
  const responsiveSizes = useMemo(() => {
    if (sizes !== 'auto') return sizes;

    if (isMobile) return '100vw';
    if (isTablet) return '(orientation: portrait) 100vw, 50vw';
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  }, [sizes, isMobile, isTablet]);

  // Intersection Observer pour lazy loading
  useEffect(() => {
    if (priority || !shouldUseLazyLoading()) {
      setIsInView(true);
      return;
    }

    if (capabilities.browser.supportsIntersectionObserver) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        },
        {
          threshold: 0.1,
          rootMargin: isSlowNetwork ? '50px' : '200px',
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback pour les navigateurs sans support
      setIsInView(true);
    }

    return () => observerRef.current?.disconnect();
  }, [priority, shouldUseLazyLoading, capabilities.browser.supportsIntersectionObserver, isSlowNetwork]);

  // Préchargement pour les ressources critiques
  useEffect(() => {
    if (enableCriticalResource && isInView) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = generateOptimizedUrl(optimalDimensions.width);
      if (srcSet) link.setAttribute('imagesrcset', srcSet);
      if (responsiveSizes) link.setAttribute('imagesizes', responsiveSizes);
      
      document.head.appendChild(link);
      
      return () => {
        try {
          document.head.removeChild(link);
        } catch (e) {
          // Link déjà supprimé
        }
      };
    }
  }, [enableCriticalResource, isInView, optimalDimensions.width, srcSet, responsiveSizes]);

  // Gestion du chargement
  const handleLoadStart = () => {
    setLoadingState('loading');
    onLoadStart?.();
  };

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setLoadingState('loaded');
    onLoad?.(event);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setLoadingState('error');
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
    onError?.(event);
  };

  // Composant de placeholder
  const renderPlaceholder = () => {
    if (React.isValidElement(placeholder)) return placeholder;

    const placeholderClass = cn(
      'absolute inset-0 flex items-center justify-center',
      placeholder === 'shimmer' && 'bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer',
      placeholder === 'blur' && 'bg-muted/80 backdrop-blur-sm',
      placeholder === 'skeleton' && 'bg-muted animate-pulse'
    );

    return (
      <div className={placeholderClass}>
        {loadingState === 'loading' && (
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        )}
      </div>
    );
  };

  // Détermination du mode de chargement
  const loadingMode = loading === 'lazy' && !priority ? 'lazy' : 'eager';

  return (
    <div 
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        loadingState === 'loading' && 'animate-pulse',
        className
      )}
      style={{
        aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
      }}
    >
      {/* Placeholder pendant le chargement */}
      {loadingState !== 'loaded' && renderPlaceholder()}
      
      {/* Image principale */}
      {isInView && (
        <img
          src={generateOptimizedUrl(optimalDimensions.width)}
          srcSet={srcSet}
          sizes={responsiveSizes}
          alt={alt}
          width={optimalDimensions.width}
          height={optimalDimensions.height}
          loading={loadingMode}
          decoding={priority ? 'sync' : 'async'}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-all duration-300',
            'max-w-full h-auto',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down',
            loadingState === 'loaded' ? 'opacity-100' : 'opacity-0',
            loadingState === 'error' && 'opacity-50 grayscale'
          )}
          {...props}
        />
      )}
      
      {/* Message d'erreur */}
      {loadingState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 text-muted-foreground text-sm">
          <div className="text-center">
            <div className="mb-1">🖼️</div>
            <div>Image indisponible</div>
          </div>
        </div>
      )}
    </div>
  );
};