/**
 * COMPOSANTS OPTIMISÉS POUR PERFORMANCE
 * ====================================
 * Collection de composants React optimisés avec memoization et virtualization
 */

import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect, 
  useState,
  forwardRef
} from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import { cn } from '@/lib/utils';
import { useVirtualList, useIntersectionObserver } from '@/hooks/useOptimizedState';

// ===== LISTE VIRTUALISÉE OPTIMISÉE =====
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  height?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  overscan?: number;
}

export const VirtualizedList = memo(<T,>({
  items,
  itemHeight,
  renderItem,
  height = 400,
  className,
  onScroll,
  overscan = 5
}: VirtualizedListProps<T>) => {
  const listRef = useRef<any>(null);
  
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    return renderItem(items[index], index, style);
  }, [items, renderItem]);

  const handleScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    onScroll?.(scrollTop);
  }, [onScroll]);

  const getItemSize = useCallback((index: number) => {
    return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
  }, [itemHeight]);

  if (typeof itemHeight === 'function') {
    return (
      <VariableSizeList
        ref={listRef}
        height={height}
        itemCount={items.length}
        itemSize={getItemSize}
        onScroll={handleScroll}
        overscanCount={overscan}
        className={className}
      >
        {Row}
      </VariableSizeList>
    );
  }

  return (
    <List
      ref={listRef}
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      onScroll={handleScroll}
      overscanCount={overscan}
      className={className}
    >
      {Row}
    </List>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// ===== IMAGE LAZY LOADING AVEC INTERSECTION OBSERVER =====
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholder?: string;
  fallback?: string;
  threshold?: number;
  rootMargin?: string;
}

export const LazyImage = memo(forwardRef<HTMLImageElement, LazyImageProps>(({
  src,
  placeholder,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className,
  alt,
  ...props
}, ref) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { isIntersecting, setElement } = useIntersectionObserver({
    threshold,
    rootMargin
  });

  useEffect(() => {
    if (isIntersecting && !isLoaded && !hasError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        if (fallback) {
          setImageSrc(fallback);
        }
        setHasError(true);
      };
      
      img.src = src;
    }
  }, [isIntersecting, src, fallback, isLoaded, hasError]);

  return (
    <img
      ref={(node) => {
        setElement(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    />
  );
}));

LazyImage.displayName = 'LazyImage';

// ===== COMPOSANT AVEC SKELETON LOADING =====
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
}

export const Skeleton = memo<SkeletonProps>(({ 
  width = '100%', 
  height = '1rem', 
  className,
  animate = true 
}) => (
  <div
    className={cn(
      'rounded-md bg-muted',
      animate && 'animate-pulse',
      className
    )}
    style={{ width, height }}
  />
));

Skeleton.displayName = 'Skeleton';

// ===== CARD OPTIMISÉE AVEC SKELETON =====
interface OptimizedCardProps {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  loadingLines?: number;
}

export const OptimizedCard = memo<OptimizedCardProps>(({ 
  children, 
  isLoading, 
  className,
  loadingLines = 3 
}) => {
  if (isLoading) {
    return (
      <div className={cn('p-4 border rounded-lg', className)}>
        <Skeleton height="1.5rem" className="mb-2" />
        {Array.from({ length: loadingLines }, (_, i) => (
          <Skeleton key={i} height="1rem" className="mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('p-4 border rounded-lg', className)}>
      {children}
    </div>
  );
});

OptimizedCard.displayName = 'OptimizedCard';

// ===== BUTTON AVEC DEBOUNCE INTÉGRÉ =====
interface DebouncedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  debounceMs?: number;
  children: React.ReactNode;
}

export const DebouncedButton = memo<DebouncedButtonProps>(({ 
  onClick,
  debounceMs = 300,
  disabled,
  children,
  ...props
}) => {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDebouncing || disabled) return;

    setIsDebouncing(true);
    onClick?.(e);

    timeoutRef.current = setTimeout(() => {
      setIsDebouncing(false);
    }, debounceMs);
  }, [onClick, debounceMs, isDebouncing, disabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled || isDebouncing}
    >
      {children}
    </button>
  );
});

DebouncedButton.displayName = 'DebouncedButton';

// ===== TEXT AVEC TRUNCATION INTELLIGENTE =====
interface SmartTextProps {
  text: string;
  maxLength?: number;
  showTooltip?: boolean;
  className?: string;
}

export const SmartText = memo<SmartTextProps>(({ 
  text, 
  maxLength = 100, 
  showTooltip = true,
  className 
}) => {
  const truncatedText = useMemo(() => {
    if (text.length <= maxLength) return text;
    
    // Trouve le dernier espace avant la limite pour éviter de couper au milieu d'un mot
    const cutIndex = text.lastIndexOf(' ', maxLength);
    return text.substring(0, cutIndex > 0 ? cutIndex : maxLength) + '...';
  }, [text, maxLength]);

  const needsTruncation = text.length > maxLength;

  if (!needsTruncation) {
    return <span className={className}>{text}</span>;
  }

  if (showTooltip) {
    return (
      <span className={className} title={text}>
        {truncatedText}
      </span>
    );
  }

  return <span className={className}>{truncatedText}</span>;
});

SmartText.displayName = 'SmartText';

// ===== INTERSECTION OBSERVER WRAPPER =====
interface InViewProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const InView = memo<InViewProps>(({ 
  children, 
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true
}) => {
  const [hasTriggered, setHasTriggered] = useState(false);
  const { isIntersecting, setElement } = useIntersectionObserver({
    threshold,
    rootMargin
  });

  useEffect(() => {
    if (isIntersecting && !hasTriggered && triggerOnce) {
      setHasTriggered(true);
    }
  }, [isIntersecting, hasTriggered, triggerOnce]);

  const shouldRender = triggerOnce ? (hasTriggered || isIntersecting) : isIntersecting;

  return (
    <div ref={setElement}>
      {shouldRender ? children : fallback}
    </div>
  );
});

InView.displayName = 'InView';

// ===== GRID RESPONSIVE OPTIMISÉE =====
interface ResponsiveGridProps {
  children: React.ReactNode;
  minItemWidth?: number;
  gap?: number;
  className?: string;
}

export const ResponsiveGrid = memo<ResponsiveGridProps>(({ 
  children, 
  minItemWidth = 300,
  gap = 16,
  className 
}) => {
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
    gap: `${gap}px`
  }), [minItemWidth, gap]);

  return (
    <div className={className} style={gridStyle}>
      {children}
    </div>
  );
});

ResponsiveGrid.displayName = 'ResponsiveGrid';