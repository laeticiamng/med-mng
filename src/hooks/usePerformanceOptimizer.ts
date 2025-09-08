/**
 * 🎯 PERFORMANCE HOOKS - MED-MNG v3.0
 * Hooks React optimisés pour les performances
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import { performanceMonitor, debounce, throttle } from '@/utils/performanceOptimizer';

// ==========================================
// RENDER MONITOR HOOK
// ==========================================

export const useRenderMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // Log les re-renders excessifs
    if (renderCount.current > 1 && timeSinceLastRender < 16) { // Plus de 60 FPS
      logger.warn('performance', `Excessive re-renders detected: ${componentName}`, {
        renderCount: renderCount.current,
        timeSinceLastRender: Math.round(timeSinceLastRender),
        component: componentName
      });
    }

    performanceMonitor.recordMetric(`render_${componentName}`, timeSinceLastRender);
  });

  const logPerformance = useCallback((action?: string) => {
    const totalTime = performance.now() - mountTime.current;
    logger.debug('performance', `Component performance: ${componentName}`, {
      action,
      renderCount: renderCount.current,
      totalTime: Math.round(totalTime),
      component: componentName
    });
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    logPerformance
  };
};

// ==========================================
// DEBOUNCED STATE HOOK
// ==========================================

export const useDebouncedState = <T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  const debouncedSetValue = useMemo(
    () => debounce((newValue: T) => setDebouncedValue(newValue), delay),
    [delay]
  );

  useEffect(() => {
    debouncedSetValue(value);
  }, [value, debouncedSetValue]);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
  }, []);

  return [value, debouncedValue, updateValue];
};

// ==========================================
// THROTTLED CALLBACK HOOK
// ==========================================

export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T => {
  return useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  ) as T;
};

// ==========================================
// MEMORY USAGE HOOK
// ==========================================

export const useMemoryMonitor = (componentName: string) => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: string;
    total: string;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        const percentage = Math.round((used / total) * 100);

        setMemoryInfo({
          used: `${used} MB`,
          total: `${total} MB`,
          percentage
        });

        // Alert si utilisation mémoire élevée
        if (percentage > 80) {
          logger.warn('performance', `High memory usage in ${componentName}`, {
            used,
            total,
            percentage,
            component: componentName
          });
        }
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, [componentName]);

  return memoryInfo;
};

// ==========================================
// INTERSECTION OBSERVER HOOK
// ==========================================

export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<Element | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
        
        // Log pour les éléments importants
        if (entry.isIntersecting) {
          performanceMonitor.recordMetric('element_visible', entry.intersectionRatio);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return {
    elementRef,
    isIntersecting,
    entry
  };
};

// ==========================================
// ASYNC OPERATION HOOK
// ==========================================

export const useAsyncOperation = <T>(
  operation: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const result = await operation();
      
      if (mountedRef.current) {
        setData(result);
        const duration = performance.now() - startTime;
        performanceMonitor.recordMetric('async_operation', duration);
        
        if (duration > 1000) {
          logger.warn('performance', 'Slow async operation detected', {
            duration: Math.round(duration),
            operation: operation.name || 'anonymous'
          });
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        logger.error('performance', 'Async operation failed', {
          error: error.message,
          operation: operation.name || 'anonymous'
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [operation]);

  useEffect(() => {
    execute();
  }, dependencies);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    retry: execute
  };
};

// ==========================================
// OPTIMIZED SCROLL HOOK
// ==========================================

export const useOptimizedScroll = (
  callback: (scrollY: number) => void,
  throttleMs: number = 16
) => {
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateScrollY = useCallback(() => {
    callback(lastScrollY.current);
    ticking.current = false;
  }, [callback]);

  const onScroll = useCallback(() => {
    lastScrollY.current = window.scrollY;
    
    if (!ticking.current) {
      requestAnimationFrame(updateScrollY);
      ticking.current = true;
    }
  }, [updateScrollY]);

  const throttledOnScroll = useThrottledCallback(onScroll, throttleMs);

  useEffect(() => {
    window.addEventListener('scroll', throttledOnScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledOnScroll);
  }, [throttledOnScroll]);
};

// ==========================================
// CLEANUP HOOK
// ==========================================

export const useCleanup = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((fn: () => void) => {
    cleanupFunctions.current.push(fn);
  }, []);

  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(fn => {
        try {
          fn();
        } catch (error) {
          logger.error('performance', 'Cleanup function failed', { error });
        }
      });
    };
  }, []);

  return addCleanup;
};

// ==========================================
// BATCH UPDATE HOOK
// ==========================================

export const useBatchUpdate = <T>(
  initialState: T,
  batchDelay: number = 16
) => {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef<Partial<T>[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchedUpdate = useCallback((update: Partial<T>) => {
    pendingUpdates.current.push(update);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        const newState = { ...prevState };
        pendingUpdates.current.forEach(update => {
          Object.assign(newState, update);
        });
        pendingUpdates.current = [];
        return newState;
      });
    }, batchDelay);
  }, [batchDelay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchedUpdate] as const;
};

// ==========================================
// EXPORT PRINCIPAL
// ==========================================

export default {
  useRenderMonitor,
  useDebouncedState,
  useThrottledCallback,
  useMemoryMonitor,
  useIntersectionObserver,
  useAsyncOperation,
  useOptimizedScroll,
  useCleanup,
  useBatchUpdate
};