// Utilitaires pour l'optimisation d'images

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface OptimizationConfig {
  quality: number;
  format: 'webp' | 'jpeg' | 'png' | 'auto';
  progressive: boolean;
  blur: number;
  devicePixelRatio: number;
}

// Breakpoints responsive standard
export const RESPONSIVE_BREAKPOINTS = [
  { name: 'mobile', width: 320, maxWidth: 640 },
  { name: 'tablet', width: 768, maxWidth: 1024 },
  { name: 'desktop', width: 1200, maxWidth: 1920 },
  { name: 'xl', width: 1920, maxWidth: 3840 },
] as const;

// Configurations prédéfinies par type de contenu
export const OPTIMIZATION_PRESETS = {
  hero: {
    quality: 90,
    format: 'webp' as const,
    progressive: true,
    blur: 0,
    devicePixelRatio: 2,
    sizes: '100vw',
  },
  thumbnail: {
    quality: 75,
    format: 'webp' as const,
    progressive: true,
    blur: 0,
    devicePixelRatio: 1.5,
    sizes: '(max-width: 768px) 50vw, 25vw',
  },
  gallery: {
    quality: 85,
    format: 'webp' as const,
    progressive: true,
    blur: 0,
    devicePixelRatio: 1.5,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  avatar: {
    quality: 80,
    format: 'webp' as const,
    progressive: false,
    blur: 0,
    devicePixelRatio: 2,
    sizes: '(max-width: 768px) 64px, 96px',
  },
  background: {
    quality: 70,
    format: 'webp' as const,
    progressive: true,
    blur: 2,
    devicePixelRatio: 1,
    sizes: '100vw',
  },
} as const;

/**
 * Calcule les dimensions optimales pour différents breakpoints
 */
export const calculateResponsiveDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 1920
): { width: number; height: number; breakpoints: Array<{ width: number; height: number; breakpoint: string }> } => {
  const aspectRatio = originalWidth / originalHeight;
  
  // Limiter la largeur maximale
  const finalWidth = Math.min(originalWidth, maxWidth);
  const finalHeight = Math.round(finalWidth / aspectRatio);
  
  // Générer les breakpoints
  const breakpoints = RESPONSIVE_BREAKPOINTS
    .filter(bp => bp.width <= finalWidth)
    .map(bp => ({
      width: bp.width,
      height: Math.round(bp.width / aspectRatio),
      breakpoint: bp.name,
    }));
  
  return {
    width: finalWidth,
    height: finalHeight,
    breakpoints,
  };
};

/**
 * Génère une URL d'image optimisée avec paramètres
 */
export const generateOptimizedImageUrl = (
  baseSrc: string,
  width: number,
  config: Partial<OptimizationConfig> = {}
): string => {
  // Ne pas traiter les URLs externes ou data URLs
  if (baseSrc.startsWith('http') || baseSrc.startsWith('data:') || baseSrc.startsWith('blob:')) {
    return baseSrc;
  }
  
  const params = new URLSearchParams();
  
  // Paramètres de base
  params.set('w', Math.round(width).toString());
  
  if (config.quality) {
    params.set('q', config.quality.toString());
  }
  
  if (config.format && config.format !== 'auto') {
    params.set('fm', config.format);
  }
  
  if (config.progressive) {
    params.set('p', 'true');
  }
  
  if (config.blur && config.blur > 0) {
    params.set('blur', config.blur.toString());
  }
  
  if (config.devicePixelRatio && config.devicePixelRatio > 1) {
    params.set('dpr', config.devicePixelRatio.toString());
  }
  
  return `${baseSrc}?${params.toString()}`;
};

/**
 * Génère un srcSet complet pour une image
 */
export const generateSrcSet = (
  baseSrc: string,
  dimensions: ReturnType<typeof calculateResponsiveDimensions>,
  config: Partial<OptimizationConfig> = {}
): string => {
  return dimensions.breakpoints
    .map(bp => {
      const url = generateOptimizedImageUrl(baseSrc, bp.width, config);
      return `${url} ${bp.width}w`;
    })
    .join(', ');
};

/**
 * Détecte les capacités du navigateur pour l'optimisation
 */
export const detectBrowserCapabilities = (): Promise<{
  supportsWebP: boolean;
  supportsAVIF: boolean;
  supportsLazyLoading: boolean;
  connectionSpeed: 'slow' | 'fast' | 'unknown';
}> => {
  return new Promise((resolve) => {
    const capabilities = {
      supportsWebP: false,
      supportsAVIF: false,
      supportsLazyLoading: 'loading' in HTMLImageElement.prototype,
      connectionSpeed: 'unknown' as 'slow' | 'fast' | 'unknown',
    };
    
    // Test WebP
    const webpCanvas = document.createElement('canvas');
    webpCanvas.width = 1;
    webpCanvas.height = 1;
    capabilities.supportsWebP = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    // Test AVIF
    const avifImg = new Image();
    avifImg.onload = avifImg.onerror = () => {
      capabilities.supportsAVIF = avifImg.height === 1;
      
      // Détection de la vitesse de connexion
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection && connection.effectiveType) {
          capabilities.connectionSpeed = ['slow-2g', '2g'].includes(connection.effectiveType) ? 'slow' : 'fast';
        }
      }
      
      resolve(capabilities);
    };
    avifImg.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

/**
 * Calcule la taille optimale d'image basée sur l'élément container
 */
export const calculateOptimalImageSize = (
  container: HTMLElement,
  devicePixelRatio: number = window.devicePixelRatio || 1
): ImageDimensions => {
  const rect = container.getBoundingClientRect();
  
  return {
    width: Math.ceil(rect.width * devicePixelRatio),
    height: Math.ceil(rect.height * devicePixelRatio),
  };
};

/**
 * Précharge une image de manière optimisée
 */
export const preloadImage = (
  src: string,
  srcSet?: string,
  sizes?: string
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    
    if (srcSet) img.srcset = srcSet;
    if (sizes) img.sizes = sizes;
    
    img.src = src;
  });
};

/**
 * Applique un preset d'optimisation
 */
export const applyOptimizationPreset = (
  baseSrc: string,
  preset: keyof typeof OPTIMIZATION_PRESETS,
  customConfig?: Partial<OptimizationConfig>
) => {
  const presetConfig = OPTIMIZATION_PRESETS[preset];
  const finalConfig = { ...presetConfig, ...customConfig };
  
  const dimensions = calculateResponsiveDimensions(1920, 1080, 3840);
  
  return {
    src: generateOptimizedImageUrl(baseSrc, dimensions.width, finalConfig),
    srcSet: generateSrcSet(baseSrc, dimensions, finalConfig),
    sizes: presetConfig.sizes,
  };
};