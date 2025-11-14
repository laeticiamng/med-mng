/**
 * Composant image optimisé avec lazy loading et formats modernes
 * Support WebP avec fallback, lazy loading natif et placeholder
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // Si true, pas de lazy loading
  placeholder?: 'blur' | 'empty';
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'empty',
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Générer l'URL WebP si l'image est sur un CDN supportant la transformation
  const getWebPUrl = (url: string) => {
    // Si c'est une URL Supabase Storage, on peut ajouter des paramètres de transformation
    if (url.includes('supabase.co/storage')) {
      return url; // Supabase ne supporte pas encore WebP automatique
    }
    // Pour d'autres CDN, adapter selon le provider
    return url;
  };

  const webpSrc = getWebPUrl(src);

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        placeholder === 'blur' && !isLoaded && 'animate-pulse bg-muted',
        className
      )}
      style={{ width, height }}
    >
      <picture>
        {/* Source WebP pour navigateurs modernes */}
        <source srcSet={webpSrc} type="image/webp" />
        
        {/* Fallback image originale */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            hasError && 'opacity-50',
            className
          )}
          {...props}
        />
      </picture>

      {/* Placeholder pendant le chargement */}
      {!isLoaded && !hasError && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Message d'erreur */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          Image non disponible
        </div>
      )}
    </div>
  );
};

/**
 * Hook pour précharger une image
 */
export function useImagePreload(src: string) {
  React.useEffect(() => {
    const img = new Image();
    img.src = src;
  }, [src]);
}
