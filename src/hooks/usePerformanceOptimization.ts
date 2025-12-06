import { useState, useEffect, useCallback } from 'react';

export const usePerformanceOptimization = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    score: 100
  });
  
  const [isOptimized, setIsOptimized] = useState(true);
  const [optimizations, setOptimizations] = useState([]);

  const measurePerformance = useCallback(() => {
    // Mesure du temps de chargement
    const loadTime = performance.timing ? 
      performance.timing.loadEventEnd - performance.timing.navigationStart : 0;

    // Mesure de la mémoire (si disponible)
    const memoryUsage = (performance as any).memory ? 
      Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 0;

    // Performance Observer pour mesurer les métriques
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => ({
              ...prev,
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              networkLatency: navEntry.responseStart - navEntry.requestStart
            }));
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      
      return () => observer.disconnect();
    }

    setMetrics(prev => ({
      ...prev,
      loadTime: loadTime,
      memoryUsage: memoryUsage
    }));
  }, []);

  const calculateOptimizationScore = useCallback(() => {
    let score = 100;
    const suggestions = [];

    // Pénalités basées sur les métriques
    if (metrics.loadTime > 3000) {
      score -= 20;
      suggestions.push('Optimiser le temps de chargement (>3s)');
    }
    
    if (metrics.memoryUsage > 100) {
      score -= 15;
      suggestions.push('Réduire l\'utilisation mémoire (>100MB)');
    }
    
    if (metrics.networkLatency > 1000) {
      score -= 10;
      suggestions.push('Améliorer la latence réseau (>1s)');
    }

    setMetrics(prev => ({ ...prev, score }));
    setOptimizations(suggestions);
    setIsOptimized(score >= 80);
  }, [metrics.loadTime, metrics.memoryUsage, metrics.networkLatency]);

  const optimizeResources = useCallback(() => {
    // Image lazy loading
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });

    // Preload critical resources
    const criticalLinks = document.querySelectorAll('link[rel="stylesheet"]');
    criticalLinks.forEach(link => {
      if (!link.getAttribute('as')) {
        link.setAttribute('rel', 'preload');
        link.setAttribute('as', 'style');
      }
    });

    return 'Optimisations appliquées avec succès';
  }, []);

  useEffect(() => {
    measurePerformance();
    
    const interval = setInterval(() => {
      calculateOptimizationScore();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [measurePerformance, calculateOptimizationScore]);

  return {
    metrics,
    isOptimized,
    optimizations,
    measurePerformance,
    optimizeResources,
    calculateOptimizationScore
  };
};