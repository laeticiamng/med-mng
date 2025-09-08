/**
 * 🚀 PERFORMANCE OPTIMIZER HOOK - MED-MNG v3.0
 * Hook avancé pour optimiser les performances des composants
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface PerformanceMetrics {
  renderCount: number;
  renderTime: number;
  lastRender: number;
  averageRenderTime: number;
}

interface OptimizationConfig {
  logRenders?: boolean;
  maxRenderWarning?: number;
  trackRenderTime?: boolean;
  memoize?: boolean;
}

/**
 * Hook pour optimiser les performances des composants
 */
export const usePerformanceOptimizer = (
  componentName: string,
  config: OptimizationConfig = {}
) => {
  const {
    logRenders = false,
    maxRenderWarning = 10,
    trackRenderTime = true,
    memoize = true
  } = config;

  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    renderTime: 0,
    lastRender: 0,
    averageRenderTime: 0
  });

  const renderStartTime = useRef<number>(0);

  // Démarrer le tracking du temps de render
  const startRenderTracking = useCallback(() => {
    if (trackRenderTime) {
      renderStartTime.current = performance.now();
    }
  }, [trackRenderTime]);

  // Finaliser le tracking du temps de render
  const endRenderTracking = useCallback(() => {
    if (trackRenderTime && renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      const metrics = metricsRef.current;
      
      metrics.renderCount++;
      metrics.renderTime = renderTime;
      metrics.lastRender = Date.now();
      metrics.averageRenderTime = (metrics.averageRenderTime + renderTime) / 2;

      // Log des renders lents
      if (renderTime > 16) { // Plus de 16ms = dropping frames
        logger.warn('performance', `Slow render detected in ${componentName}`, {
          renderTime,
          renderCount: metrics.renderCount
        });
      }

      // Avertissement pour trop de renders
      if (metrics.renderCount > maxRenderWarning) {
        logger.warn('performance', `High render count in ${componentName}`, {
          renderCount: metrics.renderCount,
          averageRenderTime: metrics.averageRenderTime
        });
      }

      if (logRenders) {
        logger.debug('performance', `${componentName} rendered`, {
          renderTime,
          renderCount: metrics.renderCount
        });
      }
    }
  }, [componentName, trackRenderTime, maxRenderWarning, logRenders]);

  // Hook pour créer des callbacks optimisés
  const createOptimizedCallback = useCallback(<T extends (...args: unknown[]) => unknown>(
    callback: T,
    deps: React.DependencyList
  ) => {
    if (memoize) {
      return useCallback(callback, deps);
    }
    return callback;
  }, [memoize]);

  // Hook pour créer des valeurs memoizées
  const createOptimizedValue = useCallback(<T>(
    factory: () => T,
    deps: React.DependencyList
  ) => {
    if (memoize) {
      return useMemo(factory, deps);
    }
    return factory();
  }, [memoize]);

  // Tracker automatique des renders
  useEffect(() => {
    startRenderTracking();
    endRenderTracking();
  });

  // API publique
  return {
    // Métriques
    getMetrics: useCallback(() => ({ ...metricsRef.current }), []),
    
    // Helpers d'optimisation
    optimizedCallback: createOptimizedCallback,
    optimizedValue: createOptimizedValue,
    
    // Tracking manuel
    startRenderTracking,
    endRenderTracking,
    
    // Logger de performance
    logPerformance: useCallback((message: string, data?: unknown) => {
      logger.performance(`[${componentName}] ${message}`, data);
    }, [componentName])
  };
};

/**
 * Hook simplifié pour le monitoring de base
 */
export const useRenderMonitor = (componentName: string) => {
  return usePerformanceOptimizer(componentName, {
    logRenders: import.meta.env.DEV,
    trackRenderTime: true,
    memoize: true
  });
};