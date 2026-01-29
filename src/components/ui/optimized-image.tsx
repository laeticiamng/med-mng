import React, { useEffect, useRef, useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * OptimizedImage - Composant d'image optimisé pour la performance
 * 
 * Fonctionnalités:
 * - Lazy loading natif
 * - Intersection Observer pour chargement progressif
 * - Support srcSet/sizes pour images responsives
 * - Placeholder pendant le chargement
 * - Attribut alt obligatoire pour accessibilité
 */

// Placeholder SVG inline pour éviter les requêtes réseau externes
const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='hsl(220 14.3%% 95.9%%)' width='400' height='300'/%3E%3Cpath d='M160 120 L240 120 L200 80 Z' fill='hsl(220 13%% 91%%)' /%3E%3Crect x='175' y='120' width='50' height='60' fill='hsl(220 13%% 91%%)' /%3E%3Ccircle cx='280' cy='100' r='20' fill='hsl(220 13%% 91%%)' /%3E%3C/svg%3E`;

// Génère un srcSet pour les images Shopify/CDN avec paramètres de taille
const generateSrcSet = (src: string, widths: number[]): string => {
  // Support des URLs Shopify CDN
  if (src.includes('cdn.shopify.com')) {
    return widths
      .map(w => `${src.replace(/(_\d+x\d+)?(\.[a-zA-Z]+)(\?|$)/, `_${w}x$2$3`)} ${w}w`)
      .join(', ');
  }
  // Support générique pour les URLs avec paramètres de resize
  if (src.includes('?') || src.includes('width=')) {
    return widths
      .map(w => {
        const separator = src.includes('?') ? '&' : '?';
        return `${src}${separator}width=${w} ${w}w`;
      })
      .join(', ');
  }
  return '';
};

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string; // Obligatoire pour accessibilité
  fallbackSrc?: string;
  placeholderClassName?: string;
  /** Largeurs pour srcSet (défaut: [320, 640, 768, 1024, 1280]) */
  responsiveWidths?: number[];
  /** Attribut sizes pour le responsive (défaut: 100vw) */
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className,
  placeholderClassName,
  responsiveWidths = [320, 640, 768, 1024, 1280],
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
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

  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;
  const shouldLoad = isInView;
  const srcSet = shouldLoad ? generateSrcSet(imageSrc, responsiveWidths) : undefined;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        ref={imgRef}
        src={shouldLoad ? imageSrc : PLACEHOLDER_SVG}
        srcSet={srcSet || undefined}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300 w-full h-full',
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

/** Placeholder SVG réutilisable pour les composants legacy */
export const ImagePlaceholder: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-muted flex items-center justify-center', className)}>
    <svg 
      className="w-12 h-12 text-muted-foreground/50" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  </div>
);

/** URL du placeholder pour utilisation directe */
export const PLACEHOLDER_IMAGE_URL = PLACEHOLDER_SVG;
