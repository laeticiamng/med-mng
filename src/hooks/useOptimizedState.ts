/**
 * HOOKS D'OPTIMISATION PERFORMANCE
 * ================================
 * Hooks personnalisés pour optimiser les re-renders et performances
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce, throttle } from 'lodash';

// Hook d'état optimisé avec comparaison intelligente
export const useOptimizedState = <T>(
  initialValue: T,
  dependencies: any[] = []
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState(initialValue);
  
  const optimizedSetState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevState)
        : newValue;
        
      // Évite les re-renders inutiles avec comparaison profonde simple
      if (JSON.stringify(prevState) === JSON.stringify(nextValue)) {
        return prevState;
      }
      return nextValue;
    });
  }, dependencies);

  return [state, optimizedSetState];
};

// Hook pour debounce optimisé
export const useDebounced = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: any[] = []
) => {
  return useMemo(
    () => debounce(callback, delay),
    [delay, ...deps]
  );
};

// Hook pour throttle optimisé  
export const useThrottled = <T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: any[] = []
) => {
  return useMemo(
    () => throttle(callback, limit),
    [limit, ...deps]
  );
};

// Hook pour mémoriser des calculs coûteux avec cache
export const useExpensiveComputation = <T>(
  computeFn: () => T,
  dependencies: any[],
  cacheSize: number = 10
) => {
  const cacheRef = useRef<Map<string, T>>(new Map());
  
  return useMemo(() => {
    const key = JSON.stringify(dependencies);
    
    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key)!;
    }
    
    const result = computeFn();
    
    // Gérer la taille du cache
    if (cacheRef.current.size >= cacheSize) {
      const firstKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(firstKey);
    }
    
    cacheRef.current.set(key, result);
    return result;
  }, dependencies);
};

// Hook pour intersection observer optimisé
export const useIntersectionObserver = (
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);
  
  const observer = useMemo(
    () => new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    ),
    [options?.threshold, options?.rootMargin]
  );
  
  useEffect(() => {
    if (!element) return;
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, observer]);
  
  return { isIntersecting, setElement };
};

// Hook pour mesurer les performances de rendu
export const useRenderMetrics = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now() - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎭 ${componentName}: Render #${renderCount.current} (${renderTime.toFixed(2)}ms)`);
    }
    
    startTime.current = performance.now();
  });
  
  return {
    renderCount: renderCount.current,
    resetMetrics: () => {
      renderCount.current = 0;
      startTime.current = performance.now();
    }
  };
};

// Hook pour virtual scrolling
export const useVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, items.length);
    
    return {
      start: Math.max(0, start - 1), // Buffer d'1 item avant
      end,
      visibleItems: items.slice(Math.max(0, start - 1), end)
    };
  }, [items, itemHeight, containerHeight, scrollTop]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  return {
    visibleItems: visibleRange.visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
};