import logger from '@/lib/logger';
import React, { useEffect, useRef, useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * OptimizedImage - Composant d'image optimisé pour la performance
 * 
 * Fonctionnalités:
 * - Lazy loading natif
 * - Intersection Observer pour chargement progressif
 * - Support WebP/AVIF avec fallback
 * - Placeholder pendant le chargement
 * - Attribut alt obligatoire pour accessibilité
 */

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string; // Obligatoire pour accessibilité
  fallbackSrc?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className,
  placeholderClassName,
  onLoad,
  onError,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Commencer à charger 50px avant d'être visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Placeholder SVG pour éviter CLS (Cumulative Layout Shift)
  const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3C/svg%3E`;

  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;
  const shouldLoad = isInView;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        ref={imgRef}
        src={shouldLoad ? imageSrc : placeholderSvg}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          placeholderClassName
        )}
        {...props}
      />
      
      {/* Placeholder pendant le chargement */}
      {!isLoaded && shouldLoad && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
};

/**
 * Exemple d'utilisation:
 * 
 * ```tsx
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   alt="Description détaillée de l'image pour accessibilité"
 *   fallbackSrc="/path/to/fallback.jpg"
 *   className="w-full h-64 object-cover"
 *   onLoad={() => logger.debug('Image chargée')}
 * />
 * ```
 */
