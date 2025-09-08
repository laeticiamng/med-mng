import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/structuredLogger';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  loadTime: number;
  interactionDelay: number;
  cacheHitRate: number;
  errorRate: number;
}

interface PerformanceState {
  metrics: PerformanceMetrics;
  isOptimized: boolean;
  warnings: string[];
  recommendations: string[];
}

export const useEnhancedPerformance = (componentName?: string) => {
  const [state, setState] = useState<PerformanceState>({
    metrics: {
      renderTime: 0,
      memoryUsage: 0,
      bundleSize: 0,
      loadTime: 0,
      interactionDelay: 0,
      cacheHitRate: 0,
      errorRate: 0
    },
    isOptimized: true,
    warnings: [],
    recommendations: []
  });

  const renderStartRef = useRef<number>(0);
  const interactionStartRef = useRef<number>(0);
  const cacheStats = useRef({ hits: 0, misses: 0 });
  const errorCount = useRef(0);
  const totalRequests = useRef(0);

  // Mesure du temps de rendu
  const startRenderMeasurement = useCallback(() => {
    renderStartRef.current = performance.now();
  }, []);

  const endRenderMeasurement = useCallback(() => {
    const renderTime = performance.now() - renderStartRef.current;
    
    setState(prev => ({
      ...prev,
      metrics: { ...prev.metrics, renderTime }
    }));

    if (renderTime > 16) { // > 60fps
      logger.warn(`Rendu lent détecté: ${renderTime.toFixed(2)}ms`, {
        component: componentName || 'Performance',
        metadata: { renderTime }
      });
    }

    return renderTime;
  }, [componentName]);

  // Mesure de la mémoire
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024); // MB
      
      setState(prev => ({
        ...prev,
        metrics: { ...prev.metrics, memoryUsage }
      }));

      if (memoryUsage > 100) { // > 100MB
        logger.warn(`Utilisation mémoire élevée: ${memoryUsage.toFixed(2)}MB`, {
          component: componentName || 'Performance',
          metadata: { memoryUsage }
        });
      }

      return memoryUsage;
    }
    return 0;
  }, [componentName]);

  // Mesure du temps d'interaction
  const startInteraction = useCallback((action: string) => {
    interactionStartRef.current = performance.now();
    logger.debug(`Interaction démarrée: ${action}`, {
      component: componentName || 'Performance',
      action
    });
  }, [componentName]);

  const endInteraction = useCallback((action: string) => {
    const interactionDelay = performance.now() - interactionStartRef.current;
    
    setState(prev => ({
      ...prev,
      metrics: { ...prev.metrics, interactionDelay }
    }));

    if (interactionDelay > 100) { // > 100ms
      logger.warn(`Interaction lente: ${action} (${interactionDelay.toFixed(2)}ms)`, {
        component: componentName || 'Performance',
        metadata: { action, interactionDelay }
      });
    }

    return interactionDelay;
  }, [componentName]);

  // Cache performance tracking
  const trackCacheHit = useCallback(() => {
    cacheStats.current.hits++;
    updateCacheHitRate();
  }, []);

  const trackCacheMiss = useCallback(() => {
    cacheStats.current.misses++;
    updateCacheHitRate();
  }, []);

  const updateCacheHitRate = useCallback(() => {
    const total = cacheStats.current.hits + cacheStats.current.misses;
    const cacheHitRate = total > 0 ? (cacheStats.current.hits / total) * 100 : 0;
    
    setState(prev => ({
      ...prev,
      metrics: { ...prev.metrics, cacheHitRate }
    }));
  }, []);

  // Error rate tracking
  const trackError = useCallback((error: Error, context?: string) => {
    errorCount.current++;
    totalRequests.current++;
    
    const errorRate = (errorCount.current / totalRequests.current) * 100;
    
    setState(prev => ({
      ...prev,
      metrics: { ...prev.metrics, errorRate }
    }));

    logger.error(`Erreur trackée: ${error.message}`, {
      component: componentName || 'Performance',
      metadata: { context, errorRate }
    }, error);
  }, [componentName]);

  const trackSuccess = useCallback(() => {
    totalRequests.current++;
    
    const errorRate = (errorCount.current / totalRequests.current) * 100;
    
    setState(prev => ({
      ...prev,
      metrics: { ...prev.metrics, errorRate }
    }));
  }, []);

  // Analyse des Core Web Vitals
  const measureWebVitals = useCallback(() => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
        onLCP((metric) => {
          logger.info(`LCP: ${metric.value}ms`, {
            component: 'WebVitals',
            metadata: { metric: 'LCP', value: metric.value }
          });
        });

        onINP((metric) => {
          logger.info(`INP: ${metric.value}ms`, {
            component: 'WebVitals',
            metadata: { metric: 'INP', value: metric.value }
          });
        });

        onCLS((metric) => {
          logger.info(`CLS: ${metric.value}`, {
            component: 'WebVitals',
            metadata: { metric: 'CLS', value: metric.value }
          });
        });

        onFCP((metric) => {
          setState(prev => ({
            ...prev,
            metrics: { ...prev.metrics, loadTime: metric.value }
          }));
        });

        onTTFB((metric) => {
          logger.debug(`TTFB: ${metric.value}ms`, {
            component: 'WebVitals',
            metadata: { metric: 'TTFB', value: metric.value }
          });
        });
      }).catch(() => {
        logger.debug('Web Vitals non disponible', { component: 'WebVitals' });
      });
    }
  }, []);

  // Génération de recommandations
  const generateRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];
    const { metrics } = state;

    if (metrics.renderTime > 16) {
      recommendations.push('Optimiser le rendu avec React.memo ou useMemo');
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push('Nettoyer les références et optimiser la gestion mémoire');
    }

    if (metrics.interactionDelay > 100) {
      recommendations.push('Débouncer les interactions ou utiliser des Web Workers');
    }

    if (metrics.cacheHitRate < 50) {
      recommendations.push('Améliorer la stratégie de mise en cache');
    }

    if (metrics.errorRate > 5) {
      recommendations.push('Implémenter une meilleure gestion d\'erreurs');
    }

    if (metrics.loadTime > 3000) {
      recommendations.push('Optimiser le temps de chargement avec du lazy loading');
    }

    return recommendations;
  }, [state]);

  // Score de performance global
  const getPerformanceScore = useCallback((): number => {
    const { metrics } = state;
    let score = 100;

    // Pénalités
    if (metrics.renderTime > 16) score -= 10;
    if (metrics.memoryUsage > 100) score -= 15;
    if (metrics.interactionDelay > 100) score -= 10;
    if (metrics.loadTime > 3000) score -= 20;
    if (metrics.cacheHitRate < 50) score -= 10;
    if (metrics.errorRate > 5) score -= 15;

    return Math.max(0, score);
  }, [state]);

  // Rapport de performance
  const generatePerformanceReport = useCallback(() => {
    const report = {
      component: componentName || 'Global',
      timestamp: new Date().toISOString(),
      score: getPerformanceScore(),
      metrics: state.metrics,
      recommendations: generateRecommendations(),
      summary: {
        isOptimized: getPerformanceScore() >= 80,
        criticalIssues: state.warnings.length,
        improvementAreas: generateRecommendations().length
      }
    };

    logger.info('Rapport de performance généré', {
      component: componentName || 'Performance',
      metadata: report
    });

    return report;
  }, [componentName, getPerformanceScore, generateRecommendations, state]);

  // Effect principal
  useEffect(() => {
    measureWebVitals();
    
    // Mesure périodique de la mémoire
    const memoryInterval = setInterval(measureMemoryUsage, 30000); // 30s
    
    // Mesure de la taille du bundle
    if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const bundleSize = (estimate.usage || 0) / (1024 * 1024); // MB
        setState(prev => ({
          ...prev,
          metrics: { ...prev.metrics, bundleSize }
        }));
      });
    }

    return () => {
      clearInterval(memoryInterval);
    };
  }, [measureMemoryUsage, measureWebVitals]);

  // Mise à jour des recommandations
  useEffect(() => {
    const recommendations = generateRecommendations();
    const score = getPerformanceScore();
    
    setState(prev => ({
      ...prev,
      recommendations,
      isOptimized: score >= 80,
      warnings: recommendations.length > 3 ? ['Performance dégradée détectée'] : []
    }));
  }, [state.metrics, generateRecommendations, getPerformanceScore]);

  return {
    ...state,
    
    // Méthodes de mesure
    startRenderMeasurement,
    endRenderMeasurement,
    measureMemoryUsage,
    startInteraction,
    endInteraction,
    
    // Tracking
    trackCacheHit,
    trackCacheMiss,
    trackError,
    trackSuccess,
    
    // Analyse
    getPerformanceScore,
    generatePerformanceReport,
    
    // Helpers
    isPerformant: getPerformanceScore() >= 80,
    needsOptimization: getPerformanceScore() < 60,
    criticalIssues: state.warnings.length > 0
  };
};