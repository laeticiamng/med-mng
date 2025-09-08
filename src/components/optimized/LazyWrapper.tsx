/**
 * 🔄 LAZY WRAPPER - MED-MNG v3.0
 * Composant wrapper intelligent pour le lazy loading
 */

import React, { Suspense, useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { logger } from '@/lib/logger';
import { performanceMonitor } from '@/utils/performanceOptimizer';

// ==========================================
// TYPES
// ==========================================

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  name?: string;
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface LoadingSkeletonProps {
  variant?: 'card' | 'text' | 'list' | 'chart' | 'form';
  rows?: number;
  height?: string;
}

// ==========================================
// SKELETONS OPTIMISÉS
// ==========================================

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'card', 
  rows = 3,
  height = 'auto'
}) => {
  const skeletonClasses = "animate-pulse bg-muted rounded";
  
  switch (variant) {
    case 'card':
      return (
        <div className="space-y-4 p-4 border border-border rounded-lg" style={{ height }}>
          <div className={`${skeletonClasses} h-6 w-3/4`} />
          <div className={`${skeletonClasses} h-4 w-full`} />
          <div className={`${skeletonClasses} h-4 w-2/3`} />
          <div className="flex gap-2 mt-4">
            <div className={`${skeletonClasses} h-8 w-16`} />
            <div className={`${skeletonClasses} h-8 w-20`} />
          </div>
        </div>
      );
      
    case 'text':
      return (
        <div className="space-y-2" style={{ height }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div 
              key={i} 
              className={`${skeletonClasses} h-4`}
              style={{ width: `${Math.random() * 40 + 60}%` }}
            />
          ))}
        </div>
      );
      
    case 'list':
      return (
        <div className="space-y-3" style={{ height }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className={`${skeletonClasses} h-10 w-10 rounded-full`} />
              <div className="flex-1 space-y-2">
                <div className={`${skeletonClasses} h-4 w-3/4`} />
                <div className={`${skeletonClasses} h-3 w-1/2`} />
              </div>
            </div>
          ))}
        </div>
      );
      
    case 'chart':
      return (
        <div className="space-y-4" style={{ height: height || '300px' }}>
          <div className={`${skeletonClasses} h-6 w-1/3`} />
          <div className="flex items-end space-x-2" style={{ height: '200px' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={i} 
                className={`${skeletonClasses} w-8`}
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
        </div>
      );
      
    case 'form':
      return (
        <div className="space-y-4" style={{ height }}>
          <div className={`${skeletonClasses} h-4 w-1/4`} />
          <div className={`${skeletonClasses} h-10 w-full`} />
          <div className={`${skeletonClasses} h-4 w-1/3`} />
          <div className={`${skeletonClasses} h-10 w-full`} />
          <div className={`${skeletonClasses} h-10 w-24 mt-6`} />
        </div>
      );
      
    default:
      return <div className={`${skeletonClasses} h-32 w-full`} />;
  }
};

// ==========================================
// ERROR FALLBACK
// ==========================================

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({
  error,
  resetError
}) => (
  <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 text-center">
    <div className="text-destructive font-medium mb-2">
      Erreur de chargement
    </div>
    <div className="text-sm text-muted-foreground mb-4">
      {import.meta.env.DEV ? error.message : 'Un problème est survenu'}
    </div>
    <button
      onClick={resetError}
      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm hover:bg-destructive/90 transition-colors"
    >
      Réessayer
    </button>
  </div>
);

// ==========================================
// LAZY WRAPPER PRINCIPAL
// ==========================================

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  errorFallback = DefaultErrorFallback,
  name = 'unnamed-component',
  priority = 'medium',
  timeout = 10000,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [startTime] = useState(() => performance.now());

  // Timeout de chargement
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        const error = new Error(`Timeout: ${name} took longer than ${timeout}ms to load`);
        setLoadError(error);
        setIsLoading(false);
        onError?.(error);
        logger.error('performance', `Component timeout: ${name}`, {
          timeout,
          component: name,
          priority
        });
      }
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [isLoading, name, timeout, onError]);

  // Callback quand le composant est chargé
  useEffect(() => {
    if (!isLoading && !loadError) {
      const loadTime = performance.now() - startTime;
      performanceMonitor.recordMetric(`lazy_load_${name}`, loadTime);
      
      logger.debug('performance', `Component loaded: ${name}`, {
        loadTime: Math.round(loadTime),
        priority
      });
      
      onLoad?.();
    }
  }, [isLoading, loadError, name, startTime, priority, onLoad]);

  if (loadError) {
    return React.createElement(errorFallback, {
      error: loadError,
      resetError: () => {
        setLoadError(null);
        setIsLoading(true);
      }
    });
  }

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => 
        React.createElement(errorFallback, { error, resetError: resetErrorBoundary })
      }
      onError={(error, errorInfo) => {
        setLoadError(error);
        logger.error('performance', `Component error: ${name}`, {
          error: error.message,
          errorInfo,
          component: name
        });
        onError?.(error);
      }}
    >
      <Suspense
        fallback={
          fallback 
            ? React.createElement(fallback)
            : <LoadingSkeleton variant="card" />
        }
      >
        <div onLoad={() => setIsLoading(false)}>
          {children}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

// ==========================================
// HOOKS UTILITAIRES
// ==========================================

export const useLazyComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options: {
    name?: string;
    fallback?: React.ComponentType;
    priority?: 'high' | 'medium' | 'low';
  } = {}
) => {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    
    importFn()
      .then(module => {
        setComponent(() => module.default);
        setLoading(false);
        
        const loadTime = performance.now() - startTime;
        performanceMonitor.recordMetric(
          `dynamic_import_${options.name || 'component'}`, 
          loadTime
        );
        
        logger.debug('performance', `Dynamic import completed: ${options.name}`, {
          loadTime: Math.round(loadTime)
        });
      })
      .catch(err => {
        setError(err);
        setLoading(false);
        logger.error('performance', `Dynamic import failed: ${options.name}`, {
          error: err.message
        });
      });
  }, [importFn, options.name]);

  return { Component, loading, error };
};

// ==========================================
// EXPORTS
// ==========================================

export { LoadingSkeleton };
export default LazyWrapper;