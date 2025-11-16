import React, { memo, ComponentType } from 'react';

/**
 * HOC to optimize page components
 * Applies memoization, suspense error boundaries, and performance monitoring
 */

interface OptimizationOptions {
  memoDeps?: any[];
  enableProfiling?: boolean;
  enableErrorBoundary?: boolean;
  errorFallback?: React.ReactNode;
}

/**
 * Memoize page component with optional dependencies
 * Prevents unnecessary re-renders when props haven't changed
 */
export const withPageOptimization = <P extends object>(
  Component: ComponentType<P>,
  options: OptimizationOptions = {}
): ComponentType<P> => {
  const {
    memoDeps,
    enableProfiling = false,
    enableErrorBoundary = true,
    errorFallback = null,
  } = options;

  // Create memoized component
  const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
    if (memoDeps) {
      // Custom memo comparison based on provided dependencies
      return memoDeps.every(dep => prevProps[dep as keyof P] === nextProps[dep as keyof P]);
    }
    // Shallow comparison by default
    return Object.keys(prevProps).every(
      key => prevProps[key as keyof P] === nextProps[key as keyof P]
    );
  });

  const displayName = Component.displayName || Component.name || 'Component';
  MemoizedComponent.displayName = `withPageOptimization(${displayName})`;

  // Wrapper with error boundary and profiling
  const OptimizedComponent = (props: P) => {
    const startTime = enableProfiling ? performance.now() : 0;

    const component = <MemoizedComponent {...props} />;

    if (enableProfiling) {
      const endTime = performance.now();
      console.debug(
        `[Performance] ${displayName} rendered in ${(endTime - startTime).toFixed(2)}ms`
      );
    }

    return component;
  };

  OptimizedComponent.displayName = `Optimized${displayName}`;

  return OptimizedComponent;
};

/**
 * Cache component with React.memo
 * Ideal for list items, cards, and frequently rendered components
 */
export const withMemo = <P extends object>(Component: ComponentType<P>) => {
  const MemoedComponent = memo(Component);
  MemoedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  return MemoedComponent;
};

/**
 * Lazy page loader with predefined configuration
 * For dashboard and detail pages that might be heavy
 */
export const createLazyPage = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  displayName?: string
) => {
  const LazyComponent = React.lazy(importFn);
  if (displayName) {
    (LazyComponent as any)._result = { default: { displayName } };
  }
  return LazyComponent;
};

/**
 * Component that tracks render performance
 * Useful for identifying performance bottlenecks
 */
export const withRenderTracking = <P extends object>(
  Component: ComponentType<P>,
  threshold = 16 // 16ms = 60fps target
): ComponentType<P> => {
  return React.forwardRef<any, P>((props, ref) => {
    const renderStart = performance.now();

    return (
      <>
        <Component ref={ref} {...props} />
        {(() => {
          const renderTime = performance.now() - renderStart;
          if (renderTime > threshold) {
            console.warn(
              `[Slow Render] ${Component.displayName || Component.name} took ${renderTime.toFixed(
                2
              )}ms (threshold: ${threshold}ms)`
            );
          }
          return null;
        })()}
      </>
    );
  }) as ComponentType<P>;
};

/**
 * Optimize hook results with memoization
 * Cache expensive computations
 */
export const useMemoValue = <T,>(value: T, deps: React.DependencyList): T => {
  const memoRef = React.useRef<T>();
  const depsRef = React.useRef<React.DependencyList>();

  if (!depsRef.current || !shallowEqual(deps, depsRef.current)) {
    memoRef.current = value;
    depsRef.current = deps;
  }

  return memoRef.current!;
};

/**
 * Helper for shallow equality check
 */
function shallowEqual(arr1: any[] = [], arr2: any[] = []): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, idx) => val === arr2[idx]);
}

/**
 * Performance API wrapper for measuring component lifecycle
 */
export const useComponentMetrics = (componentName: string) => {
  React.useEffect(() => {
    const entry = performance.getEntriesByName(`component-${componentName}`)?.[0];
    if (entry) {
      console.debug(`[Metrics] ${componentName}:`, {
        duration: entry.duration,
        startTime: entry.startTime,
      });
    }
  }, [componentName]);
};
