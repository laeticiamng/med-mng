import React, { useState, useCallback, memo, ImgHTMLAttributes } from 'react';
import { logger } from '@/utils/structuredLogger';
import { Loader2, ImageOff } from 'lucide-react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
  quality?: number;
  onLoadComplete?: () => void;
  onLoadError?: (error: Event) => void;
  showLoadingSpinner?: boolean;
  showErrorState?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  fallbackSrc,
  loading = 'lazy',
  priority = false,
  sizes,
  quality = 80,
  onLoadComplete,
  onLoadError,
  showLoadingSpinner = true,
  showErrorState = true,
  className = '',
  ...props
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setImageState('loaded');
    onLoadComplete?.();
    
    logger.debug('Image chargée avec succès', {
      component: 'OptimizedImage',
      metadata: { src: currentSrc, alt }
    });
  }, [currentSrc, alt, onLoadComplete]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    logger.warn('Erreur de chargement d\'image', {
      component: 'OptimizedImage',
      metadata: { src: currentSrc, alt, hasFallback: !!fallbackSrc }
    });

    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      logger.info('Utilisation de l\'image de secours', {
        component: 'OptimizedImage',
        metadata: { fallbackSrc, originalSrc: src }
      });
    } else {
      setImageState('error');
      onLoadError?.(event.nativeEvent);
    }
  }, [currentSrc, alt, fallbackSrc, src, onLoadError]);

  // Optimisation de l'URL avec paramètres de qualité
  const getOptimizedSrc = useCallback((imageSrc: string): string => {
    if (!imageSrc) return '';
    
    // Pour les URLs Supabase Storage, ajouter les paramètres d'optimisation
    if (imageSrc.includes('supabase.co/storage')) {
      const url = new URL(imageSrc);
      url.searchParams.set('quality', quality.toString());
      if (sizes) {
        url.searchParams.set('resize', 'cover');
      }
      return url.toString();
    }
    
    return imageSrc;
  }, [quality, sizes]);

  const optimizedSrc = getOptimizedSrc(currentSrc);

  // État de chargement
  if (imageState === 'loading' && showLoadingSpinner) {
    return (
      <div 
        className={`bg-muted/50 animate-pulse flex items-center justify-center ${className}`}
        style={{ minHeight: '120px' }}
        role="img"
        aria-label={`Chargement de ${alt}`}
      >
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  // État d'erreur
  if (imageState === 'error' && showErrorState) {
    return (
      <div 
        className={`bg-muted/30 border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center p-4 ${className}`}
        style={{ minHeight: '120px' }}
        role="img"
        aria-label={`Erreur de chargement: ${alt}`}
      >
        <ImageOff className="w-8 h-8 text-muted-foreground/50 mb-2" />
        <span className="text-xs text-muted-foreground text-center">
          Image non disponible
        </span>
      </div>
    );
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading={priority ? 'eager' : loading}
      sizes={sizes}
      onLoad={handleLoad}
      onError={handleError}
      className={`transition-opacity duration-200 ${
        imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{
        objectFit: 'cover',
        ...props.style
      }}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';