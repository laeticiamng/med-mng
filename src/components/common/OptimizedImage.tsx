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
  sizes?: string; // Pour srcset responsive
  srcSet?: string; // srcSet personnalisé
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'empty',
  className,
  sizes,
  srcSet,
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

  // Générer srcSet responsive si non fourni
  const generateSrcSet = (url: string) => {
    if (srcSet) return srcSet;
    
    // Si l'image est locale et en WebP, générer des variantes
    const baseUrl = url.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const ext = url.match(/\.(webp)$/i) ? 'webp' : 'jpg';
    
    return `${baseUrl}-640w.${ext} 640w, ${baseUrl}-1024w.${ext} 1024w, ${baseUrl}-1920w.${ext} 1920w`;
  };

  const webpSrc = getWebPUrl(src);
  const responsiveSrcSet = generateSrcSet(webpSrc);

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
        {/* Source WebP pour navigateurs modernes avec srcSet responsive */}
        <source 
          srcSet={srcSet || responsiveSrcSet} 
          sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          type="image/webp" 
        />
        
        {/* Fallback image originale */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'low'}
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
