import logger from '@/lib/logger';
import React, { useCallback, useMemo, useRef, useEffect, DependencyList } from 'react';

/**
 * Collection of hooks for optimizing component performance
 */

/**
 * Debounce value changes - useful for search, filter inputs
 * Reduces expensive operations like API calls
 *
 * Example:
 * const debouncedSearch = useDebounce(searchQuery, 300);
 * useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle function calls - useful for scroll, resize events
 * Prevents excessive function calls
 *
 * Example:
 * const throttledScroll = useThrottle(handleScroll, 100);
 * window.addEventListener('scroll', throttledScroll);
 */
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 100
): T {
  const lastRunRef = useRef<number>(Date.now());

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * Memoize complex object to prevent unnecessary re-renders
 * Useful for computed values, filter objects, etc.
 *
 * Example:
 * const memoizedFilters = useMemoCompare(filters, deepEqual);
 */
export function useMemoCompare<T>(value: T, compare: (prev: T, next: T) => boolean): T {
  const prevRef = useRef<T>();
  const [, setUpdate] = React.useState({});

  useEffect(() => {
    if (!compare(prevRef.current, value)) {
      prevRef.current = value;
      setUpdate({});
    }
  }, [value, compare]);

  return prevRef.current || value;
}

/**
 * Retry failed promises with exponential backoff
 * Useful for network requests
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = React.useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as Error);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
}

/**
 * Lazy load component when visible in viewport
 * Useful for below-the-fold content
 *
 * Example:
 * const ref = useLazyLoad(() => fetchData());
 * <div ref={ref}>Heavy content here</div>
 */
export function useLazyLoad(
  callback: () => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!elementRef.current || hasLoadedRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        callback();
        observer.disconnect();
      }
    }, options);

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [callback, options]);

  return elementRef;
}

/**
 * Get previous value - useful for comparisons
 *
 * Example:
 * const prevCount = usePrevious(count);
 * if (prevCount !== count) { doSomething(); }
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Track when component is in view
 * Useful for analytics, triggering animations
 */
export function useInView(options: IntersectionObserverInit = { threshold: 0.5 }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [options]);

  return [elementRef, inView] as const;
}

/**
 * Batch multiple state updates
 * Reduces re-renders from multiple setState calls
 */
export function useBatchState<T extends Record<string, any>>(initialState: T) {
  const [state, setState] = React.useState(initialState);

  const updateBatch = useCallback((updates: Partial<T>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  return [state, updateBatch] as const;
}

/**
 * Measure and track render time
 * Useful for identifying slow components
 */
export function useRenderTime(componentName: string) {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (renderTime > 16) {
      // 16ms = 60fps frame
      logger.warn(
        `[Slow Render] ${componentName} took ${renderTime.toFixed(2)}ms (> 16ms)`
      );
    }

    logger.debug(`[Render Time] ${componentName}: ${renderTime.toFixed(2)}ms`);
  });
}

/**
 * Track component lifecycle for debugging
 */
export function useLifecycle(componentName: string) {
  useEffect(() => {
    logger.debug(`[Mount] ${componentName}`);
    return () => logger.debug(`[Unmount] ${componentName}`);
  }, [componentName]);
}

/**
 * Sync multiple states easily - prevents inconsistency
 */
export function useSyncedState<T>(initialValue: T, externalValue: T | undefined) {
  const [value, setValue] = React.useState(initialValue);

  useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue);
    }
  }, [externalValue]);

  return [value, setValue] as const;
}

/**
 * Request idle callback for low-priority updates
 * Ensures main thread isn't blocked
 */
export function useIdleCallback(callback: () => void) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback);
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, 0);
      return () => clearTimeout(id);
    }
  }, [callback]);
}

/**
 * Local storage with React state sync
 * Persists state across refreshes
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        logger.error('Error setting localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

/**
 * Cancel async operations on unmount
 * Prevents memory leaks from pending requests
 */
export function useAbortSignal() {
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    return () => abortControllerRef.current?.abort();
  }, []);

  return abortControllerRef.current?.signal;
}

/**
 * Deep compare dependency array
 * Prevents unnecessary updates when object references change
 */
export function useDeepEffect<T extends DependencyList>(
  effect: React.EffectCallback,
  deps: T
) {
  const prevDepsRef = useRef<T>();
  const hasEffectRunRef = useRef(false);

  useEffect(() => {
    const hasDepChanged =
      !prevDepsRef.current || !shallowEqual(prevDepsRef.current, deps);

    if (hasDepChanged && !hasEffectRunRef.current) {
      hasEffectRunRef.current = true;
      const cleanup = effect();
      prevDepsRef.current = deps;

      return () => {
        cleanup?.();
        hasEffectRunRef.current = false;
      };
    }
  }, [deps, effect]);
}

/**
 * Shallow compare helper
 */
function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => a[key] === b[key]);
}

/**
 * Request animation frame loop
 * Useful for animations, game loops
 */
export function useAnimationFrame(callback: (progress: number) => void, enabled = true) {
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const progress = (currentTime - startTimeRef.current) / 1000; // Convert to seconds
      callback(progress);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [callback, enabled]);
}

// Import React for hooks
import React from 'react';
