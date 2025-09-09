/**
 * Hook pour optimiser les rendus et éviter les re-renders inutiles
 */

import { useRef, useCallback, useMemo } from 'react';
import { logger } from '@/lib/logger';

interface RenderMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

export function useOptimizedRender(componentName: string) {
  const metricsRef = useRef<RenderMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  const startTime = useRef<number>(performance.now());

  // Mesure le temps de rendu
  const measureRender = useCallback(() => {
    const renderTime = performance.now() - startTime.current;
    const metrics = metricsRef.current;
    
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.averageRenderTime = 
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;

    // Log les rendus lents
    if (renderTime > 16) { // Plus de 16ms = problème potentiel
      logger.warn('Rendu lent détecté', {
        component: componentName,
        action: 'render',
        metadata: {
          renderTime,
          renderCount: metrics.renderCount,
          averageRenderTime: metrics.averageRenderTime
        }
      });
    }

    startTime.current = performance.now();
  }, [componentName]);

  // Factory pour créer des callbacks optimisés
  const createOptimizedCallback = useCallback(
    <T extends (...args: unknown[]) => unknown>(
      callback: T,
      deps: unknown[]
    ): T => {
      return useCallback(callback, deps) as T;
    },
    []
  );

  // Factory pour créer des valeurs memoizées
  const createMemoizedValue = useCallback(
    <T>(factory: () => T, deps: unknown[]): T => {
      return useMemo(factory, deps);
    },
    []
  );

  // Mesure lors de chaque rendu
  measureRender();

  return {
    metrics: metricsRef.current,
    createOptimizedCallback,
    createMemoizedValue
  };
}