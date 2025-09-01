import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  className,
  fallback = '/placeholder.svg',
  loading = 'lazy',
  objectFit = 'cover',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (priority) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Génération des sources responsive
  const generateResponsiveSrc = (baseSrc: string, targetWidth: number) => {
    // Si l'image est déjà optimisée ou externe, la retourner telle quelle
    if (baseSrc.startsWith('http') || baseSrc.startsWith('data:')) {
      return baseSrc;
    }
    
    // Pour les images locales, on peut ajouter des paramètres de redimensionnement
    return `${baseSrc}?w=${targetWidth}&q=${quality}`;
  };

  // Calcul des breakpoints responsive
  const getResponsiveSizes = () => {
    if (sizes) return sizes;
    
    if (fill) return '100vw';
    
    if (width && height) {
      return `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`;
    }
    
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  };

  // Génération du srcSet pour différentes résolutions
  const getSrcSet = () => {
    if (!isInView) return '';
    
    const breakpoints = [320, 640, 768, 1024, 1280, 1920];
    const targetWidth = width || 1200;
    
    return breakpoints
      .filter(bp => bp <= targetWidth * 2) // Éviter les images trop grandes
      .map(bp => `${generateResponsiveSrc(imageSrc, bp)} ${bp}w`)
      .join(', ');
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  // Styles responsive et adaptatifs
  const getImageStyles = () => {
    const baseStyles: React.CSSProperties = {
      objectFit,
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      opacity: isLoading ? 0 : 1,
    };

    if (fill) {
      return {
        ...baseStyles,
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      };
    }

    if (width && height) {
      return {
        ...baseStyles,
        maxWidth: '100%',
        height: 'auto',
        aspectRatio: `${width}/${height}`,
      };
    }

    return {
      ...baseStyles,
      maxWidth: '100%',
      height: 'auto',
    };
  };

  // Container pour images avec fill
  if (fill) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          'relative overflow-hidden',
          className
        )}
        style={{ width: width || '100%', height: height || '100%' }}
      >
        {isLoading && (
          <div 
            className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        
        {isInView && (
          <img
            src={imageSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            srcSet={getSrcSet()}
            sizes={getResponsiveSizes()}
            onLoad={handleLoad}
            onError={handleError}
            style={getImageStyles()}
            className={cn(
              'transition-all duration-300',
              isLoading && 'opacity-0',
              hasError && 'opacity-50'
            )}
            {...props}
          />
        )}
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={cn('relative inline-block overflow-hidden', className)}
    >
      {isLoading && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center rounded"
          style={{ 
            width: width || '100%', 
            height: height || 'auto',
            minHeight: height ? `${height}px` : '200px'
          }}
          aria-hidden="true"
        >
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          srcSet={getSrcSet()}
          sizes={getResponsiveSizes()}
          onLoad={handleLoad}
          onError={handleError}
          style={getImageStyles()}
          className={cn(
            'rounded transition-all duration-300 hover:scale-[1.02]',
            isLoading && 'opacity-0',
            hasError && 'opacity-50 grayscale'
          )}
          {...props}
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 text-muted-foreground text-sm">
          Image indisponible
        </div>
      )}
    </div>
  );
};