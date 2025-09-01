import React from 'react';
import { OptimizedImage } from './OptimizedImage';
import { cn } from '@/lib/utils';

interface ResponsiveImageContainerProps {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  fallback?: string;
  overlay?: React.ReactNode;
  loading?: 'lazy' | 'eager';
}

export const ResponsiveImageContainer: React.FC<ResponsiveImageContainerProps> = ({
  src,
  alt,
  aspectRatio = 'auto',
  priority = false,
  className,
  sizes,
  quality = 85,
  fallback,
  overlay,
  loading = 'lazy',
}) => {
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      default:
        return '';
    }
  };

  const getResponsiveSizes = () => {
    if (sizes) return sizes;
    
    // Tailles par défaut basées sur les breakpoints courants
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-lg bg-muted group',
        getAspectRatioClass(),
        className
      )}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill={aspectRatio !== 'auto'}
        width={aspectRatio === 'auto' ? 800 : undefined}
        height={aspectRatio === 'auto' ? 600 : undefined}
        priority={priority}
        quality={quality}
        sizes={getResponsiveSizes()}
        fallback={fallback}
        loading={loading}
        objectFit="cover"
        className={cn(
          'transition-transform duration-300 group-hover:scale-105',
          aspectRatio === 'auto' && 'w-full h-auto'
        )}
      />
      
      {overlay && (
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {overlay}
        </div>
      )}
    </div>
  );
};