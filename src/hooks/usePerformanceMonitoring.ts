import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionDelay: number;
  memoryUsage: number;
  networkRequests: number;
  errors: number;
}

interface ComponentPerformance {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

export const usePerformanceMonitoring = (componentName?: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    interactionDelay: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errors: 0,
  });

  const [componentPerformance, setComponentPerformance] = useState<ComponentPerformance>({
    componentName: componentName || 'Unknown',
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  const renderStartTime = useRef<number>(0);
  const interactionStartTime = useRef<number>(0);

  // Monitor page load performance
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      setMetrics(prev => ({
        ...prev,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      }));

      // Monitor network requests
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const networkEntries = entries.filter(entry => 
          entry.entryType === 'resource' || entry.entryType === 'navigation'
        );
        
        setMetrics(prev => ({
          ...prev,
          networkRequests: prev.networkRequests + networkEntries.length,
        }));
      });

      observer.observe({ entryTypes: ['resource', 'navigation'] });

      return () => observer.disconnect();
    }
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }
    };

    const interval = setInterval(monitorMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Monitor component renders
  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    setComponentPerformance(prev => {
      const newRenderCount = prev.renderCount + 1;
      const newAverageRenderTime = 
        (prev.averageRenderTime * prev.renderCount + renderTime) / newRenderCount;
      
      return {
        ...prev,
        renderCount: newRenderCount,
        lastRenderTime: renderTime,
        averageRenderTime: newAverageRenderTime,
      };
    });

    setMetrics(prev => ({
      ...prev,
      renderTime: renderTime,
    }));
  });

  // Start render timing
  const startRenderTiming = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // Monitor interaction delay
  const startInteractionTiming = useCallback(() => {
    interactionStartTime.current = performance.now();
  }, []);

  const endInteractionTiming = useCallback(() => {
    const interactionTime = performance.now() - interactionStartTime.current;
    setMetrics(prev => ({
      ...prev,
      interactionDelay: interactionTime,
    }));
  }, []);

  // Log performance warning if thresholds exceeded
  useEffect(() => {
    const thresholds = {
      renderTime: 16, // 60fps target
      interactionDelay: 100, // Acceptable interaction delay
      memoryUsage: 50, // MB
    };

    Object.entries(thresholds).forEach(([key, threshold]) => {
      const value = metrics[key as keyof PerformanceMetrics];
      if (value > threshold) {
        console.warn(`Performance warning: ${key} exceeded threshold`, {
          current: value,
          threshold,
          component: componentName,
        });
      }
    });
  }, [metrics, componentName]);

  // Get performance score (0-100)
  const getPerformanceScore = useCallback(() => {
    const weights = {
      loadTime: 0.3,
      renderTime: 0.3,
      interactionDelay: 0.2,
      memoryUsage: 0.2,
    };

    const scores = {
      loadTime: Math.max(0, 100 - (metrics.loadTime / 50)), // 5s max
      renderTime: Math.max(0, 100 - (metrics.renderTime / 0.32)), // 32ms max
      interactionDelay: Math.max(0, 100 - (metrics.interactionDelay / 2)), // 200ms max
      memoryUsage: Math.max(0, 100 - (metrics.memoryUsage / 1)), // 100MB max
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);
  }, [metrics]);

  // Get recommendations
  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.renderTime > 16) {
      recommendations.push('Consider optimizing render performance - use React.memo, useMemo, or useCallback');
    }

    if (metrics.interactionDelay > 100) {
      recommendations.push('Interaction delay is high - consider debouncing or optimizing event handlers');
    }

    if (metrics.memoryUsage > 50) {
      recommendations.push('High memory usage detected - check for memory leaks or large objects');
    }

    if (componentPerformance.renderCount > 50 && componentPerformance.averageRenderTime > 5) {
      recommendations.push('Component renders frequently - consider memoization');
    }

    return recommendations;
  }, [metrics, componentPerformance]);

  return {
    metrics,
    componentPerformance,
    startRenderTiming,
    startInteractionTiming,
    endInteractionTiming,
    getPerformanceScore,
    getRecommendations,
  };
};