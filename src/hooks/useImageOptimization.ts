import { useState, useEffect, useCallback } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  enableDevicePixelRatio?: boolean;
  enablePreload?: boolean;
}

interface OptimizedImageData {
  src: string;
  srcSet: string;
  sizes: string;
  loading: 'lazy' | 'eager';
}

export const useImageOptimization = (
  baseSrc: string,
  options: ImageOptimizationOptions = {}
) => {
  const {
    quality = 75,
    format = 'auto',
    enableDevicePixelRatio = true,
    enablePreload = false,
  } = options;

  const [optimizedImage, setOptimizedImage] = useState<OptimizedImageData>({
    src: baseSrc,
    srcSet: '',
    sizes: '',
    loading: enablePreload ? 'eager' : 'lazy',
  });

  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(0);

  // Détection du device pixel ratio
  useEffect(() => {
    const updateDeviceInfo = () => {
      setDevicePixelRatio(window.devicePixelRatio || 1);
      setViewportWidth(window.innerWidth);
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  // Génération des breakpoints adaptatifs
  const generateBreakpoints = useCallback(() => {
    const baseBreakpoints = [320, 640, 768, 1024, 1280, 1536, 1920];
    
    if (enableDevicePixelRatio && devicePixelRatio > 1) {
      // Pour les écrans haute résolution, ajouter des tailles plus importantes
      return baseBreakpoints.map(bp => ({
        width: bp,
        actualWidth: Math.round(bp * Math.min(devicePixelRatio, 2))
      }));
    }
    
    return baseBreakpoints.map(bp => ({ width: bp, actualWidth: bp }));
  }, [devicePixelRatio, enableDevicePixelRatio]);

  // Optimisation du format d'image
  const getOptimalFormat = useCallback(() => {
    if (format !== 'auto') return format;
    
    // Détection du support WebP
    const canvas = document.createElement('canvas');
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    return supportsWebP ? 'webp' : 'jpeg';
  }, [format]);

  // Génération de l'URL optimisée
  const generateOptimizedUrl = useCallback((width: number, targetFormat?: string) => {
    const params = new URLSearchParams();
    params.set('w', width.toString());
    params.set('q', quality.toString());
    
    if (targetFormat) {
      params.set('f', targetFormat);
    }
    
    // Si l'image est externe, la retourner telle quelle
    if (baseSrc.startsWith('http') || baseSrc.startsWith('data:')) {
      return baseSrc;
    }
    
    return `${baseSrc}?${params.toString()}`;
  }, [baseSrc, quality]);

  // Calcul des tailles responsive
  const calculateResponsiveSizes = useCallback(() => {
    return [
      '(max-width: 640px) 100vw',
      '(max-width: 768px) 90vw',
      '(max-width: 1024px) 80vw',
      '(max-width: 1280px) 70vw',
      '60vw'
    ].join(', ');
  }, []);

  // Génération du srcSet optimisé
  const generateSrcSet = useCallback(() => {
    const breakpoints = generateBreakpoints();
    const optimalFormat = getOptimalFormat();
    
    return breakpoints
      .map(({ width, actualWidth }) => 
        `${generateOptimizedUrl(actualWidth, optimalFormat)} ${width}w`
      )
      .join(', ');
  }, [generateBreakpoints, getOptimalFormat, generateOptimizedUrl]);

  // Mise à jour des données d'image optimisée
  useEffect(() => {
    const optimalFormat = getOptimalFormat();
    const defaultWidth = Math.min(viewportWidth || 1200, 1920);
    
    setOptimizedImage({
      src: generateOptimizedUrl(defaultWidth, optimalFormat),
      srcSet: generateSrcSet(),
      sizes: calculateResponsiveSizes(),
      loading: enablePreload ? 'eager' : 'lazy',
    });
  }, [
    baseSrc,
    viewportWidth,
    devicePixelRatio,
    generateOptimizedUrl,
    generateSrcSet,
    calculateResponsiveSizes,
    getOptimalFormat,
    enablePreload,
  ]);

  // Préchargement des images critiques
  const preloadImage = useCallback(() => {
    if (!enablePreload) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedImage.src;
    if (optimizedImage.srcSet) {
      link.setAttribute('imagesrcset', optimizedImage.srcSet);
    }
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, [optimizedImage, enablePreload]);

  useEffect(() => {
    const cleanup = preloadImage();
    return cleanup;
  }, [preloadImage]);

  return {
    ...optimizedImage,
    devicePixelRatio,
    viewportWidth,
    isHighDPI: devicePixelRatio > 1,
  };
};

// Hook pour la détection des capacités du navigateur
export const useImageCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    supportsWebP: false,
    supportsAVIF: false,
    supportsLazyLoading: false,
    connectionSpeed: 'unknown' as 'slow' | 'fast' | 'unknown',
  });

  useEffect(() => {
    const detectCapabilities = async () => {
      // Test WebP
      const webpCanvas = document.createElement('canvas');
      const supportsWebP = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      
      // Test AVIF
      const avifCanvas = document.createElement('canvas');
      const supportsAVIF = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
      
      // Test lazy loading
      const supportsLazyLoading = 'loading' in HTMLImageElement.prototype;
      
      // Détection de la vitesse de connexion
      let connectionSpeed: 'slow' | 'fast' | 'unknown' = 'unknown';
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection.effectiveType) {
          connectionSpeed = ['slow-2g', '2g'].includes(connection.effectiveType) ? 'slow' : 'fast';
        }
      }
      
      setCapabilities({
        supportsWebP,
        supportsAVIF,
        supportsLazyLoading,
        connectionSpeed,
      });
    };

    detectCapabilities();
  }, []);

  return capabilities;
};