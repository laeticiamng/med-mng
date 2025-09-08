import React, { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FixedSizeList as List } from 'react-window';
import { useInView } from 'framer-motion';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { logger } from '@/utils/logger';

// Lazy loaded heavy components (removed for now to fix build)
// const HeavyAnalyticsChart = lazy(() => import('./AnalyticsDashboard'));  
// const HeavyMusicPlayer = lazy(() => import('./InteractiveStudyTools'));

interface VirtualizedListProps {
  items: any[];
  height: number;
  itemHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

// Virtualized list for large datasets
export const VirtualizedList: React.FC<VirtualizedListProps> = memo(({
  items,
  height,
  itemHeight,
  renderItem,
  className = ''
}) => {
  const { startRenderTiming } = usePerformanceMonitoring('VirtualizedList');
  
  startRenderTiming();

  const Item = memo(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  ));
  
  Item.displayName = 'VirtualizedListItem';

  return (
    <div className={className} style={{ height }}>
      <List
        height={height}
        width="100%"
        itemCount={items.length}
        itemSize={itemHeight}
        overscanCount={5}
        itemData={items}
      >
        {Item}
      </List>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
}

// Lazy loading image with intersection observer
export const LazyImage: React.FC<LazyImageProps> = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '50px' });
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    logger.debug('Image loaded successfully', 'LazyImage', { src });
  }, [src]);

  const handleError = useCallback(() => {
    setError(true);
    logger.warn('Image failed to load', 'LazyImage', { src });
  }, [src]);

  return (
    <div 
      ref={ref} 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {isInView && (
        <>
          {!loaded && !error && (
            <Skeleton className="absolute inset-0 animate-pulse" />
          )}
          
          <motion.img
            src={src}
            alt={alt}
            className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
            decoding="async"
          />
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">Image non disponible</span>
            </div>
          )}
        </>
      )}
      
      {!isInView && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">{placeholder}</span>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

interface MemoizedCardProps {
  id: string;
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

// Memoized card component for lists
export const MemoizedCard: React.FC<MemoizedCardProps> = memo(({
  id,
  title,
  description,
  badge,
  onClick,
  className = ''
}) => {
  const handleClick = useCallback(() => {
    logger.userAction('Card click', undefined, { cardId: id, title });
    onClick?.();
  }, [id, title, onClick]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${className}`}
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium truncate">{title}</CardTitle>
            {badge && (
              <Badge variant="secondary" className="ml-2 shrink-0">
                {badge}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.badge === nextProps.badge
  );
});

MemoizedCard.displayName = 'MemoizedCard';

interface OptimizedGridProps {
  items: MemoizedCardProps[];
  columns?: number;
  gap?: number;
  className?: string;
}

// Optimized grid with virtualization for large datasets
export const OptimizedGrid: React.FC<OptimizedGridProps> = memo(({
  items,
  columns = 3,
  gap = 4,
  className = ''
}) => {
  const { startRenderTiming } = usePerformanceMonitoring('OptimizedGrid');
  
  startRenderTiming();

  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap * 0.25}rem`,
  }), [columns, gap]);

  const memoizedItems = useMemo(() => 
    items.map((item) => (
      <MemoizedCard key={item.id} {...item} />
    )), [items]
  );

  return (
    <div 
      className={className}
      style={gridStyle}
    >
      {memoizedItems}
    </div>
  );
});

OptimizedGrid.displayName = 'OptimizedGrid';

interface LazyComponentWrapperProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  props?: any;
  fallback?: React.ReactNode;
  className?: string;
}

// Wrapper for lazy loaded components with performance monitoring
export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = memo(({
  component: Component,
  props = {},
  fallback,
  className = ''
}) => {
  const { startRenderTiming, endInteractionTiming } = usePerformanceMonitoring('LazyComponent');

  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="space-y-3 text-center">
        <Skeleton className="h-8 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
    </div>
  );

  React.useEffect(() => {
    startRenderTiming();
    return () => endInteractionTiming();
  }, [startRenderTiming, endInteractionTiming]);

  return (
    <div className={className}>
      <Suspense fallback={fallback || defaultFallback}>
        <Component {...props} />
      </Suspense>
    </div>
  );
});

LazyComponentWrapper.displayName = 'LazyComponentWrapper';

interface PerformanceOptimizedListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  keyExtractor: (item: any, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  className?: string;
}

// Performance optimized list with infinite scroll
export const PerformanceOptimizedList: React.FC<PerformanceOptimizedListProps> = memo(({
  items,
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.8,
  className = ''
}) => {
  const { startRenderTiming, endInteractionTiming } = usePerformanceMonitoring('PerformanceOptimizedList');
  const scrollElementRef = React.useRef<HTMLDivElement>(null);

  startRenderTiming();

  // Virtualization for large lists
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated item height
    overscan: 5,
  });

  // Handle infinite scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const element = scrollElementRef.current;
      if (!element || !onEndReached) return;

      const { scrollTop, scrollHeight, clientHeight } = element;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage >= onEndReachedThreshold) {
        onEndReached();
      }
    };

    const element = scrollElementRef.current;
    element?.addEventListener('scroll', handleScroll);
    return () => element?.removeEventListener('scroll', handleScroll);
  }, [onEndReached, onEndReachedThreshold]);

  React.useEffect(() => {
    endInteractionTiming();
  });

  return (
    <div 
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: '100%' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={keyExtractor(items[virtualItem.index], virtualItem.index)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
});

PerformanceOptimizedList.displayName = 'PerformanceOptimizedList';

// Hook for debounced search
export const useDebouncedSearch = (searchTerm: string, delay: number = 300) => {
  const [debouncedTerm, setDebouncedTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(handler);
  }, [searchTerm, delay]);

  return debouncedTerm;
};

// Hook for optimized state management
export const useOptimizedState = <T,>(initialState: T) => {
  const [state, setState] = React.useState(initialState);
  
  const optimizedSetState = useCallback((newState: T | ((prev: T) => T)) => {
    setState(prev => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev) 
        : newState;
      
      // Shallow comparison for objects
      if (typeof nextState === 'object' && nextState !== null) {
        const prevKeys = Object.keys(prev as any);
        const nextKeys = Object.keys(nextState as any);
        
        if (prevKeys.length !== nextKeys.length) return nextState;
        
        for (const key of prevKeys) {
          if ((prev as any)[key] !== (nextState as any)[key]) {
            return nextState;
          }
        }
        return prev;
      }
      
      return nextState === prev ? prev : nextState;
    });
  }, []);

  return [state, optimizedSetState] as const;
};

export default {
  VirtualizedList,
  LazyImage,
  MemoizedCard,
  OptimizedGrid,
  LazyComponentWrapper,
  PerformanceOptimizedList,
  useDebouncedSearch,
  useOptimizedState,
};