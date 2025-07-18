import React, { useState, useRef, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(placeholder || '')
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentSrc(src)
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1 }
      )

      observer.observe(imgRef.current)
      return () => observer.disconnect()
    } else {
      setCurrentSrc(src)
    }
  }, [src, loading])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc || hasError) return ''

    const sizes = [480, 768, 1024, 1280]

    return sizes
      .map((size) => `${baseSrc.replace(/\.[^.]+$/, `_${size}w.webp`)} ${size}w`)
      .join(', ')
  }

  if (hasError) {
    return (
      <div className={`image-error ${className}`} style={{ width, height }}>
        <span>Image non disponible</span>
      </div>
    )
  }

  return (
    <div className={`optimized-image-container ${className}`}>
      <img
        ref={imgRef}
        src={currentSrc}
        srcSet={generateSrcSet(currentSrc)}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`optimized-image ${isLoaded ? 'loaded' : 'loading'}`}
      />

      {!isLoaded && currentSrc && (
        <div className="image-placeholder">
          <div className="placeholder-shimmer" />
        </div>
      )}
    </div>
  )
}
