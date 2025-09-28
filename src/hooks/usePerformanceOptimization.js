import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for performance monitoring and optimization
 */
export const usePerformanceOptimization = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    fps: 0
  });

  const [isOptimized, setIsOptimized] = useState(false);

  // Performance monitoring
  const measurePerformance = useCallback(() => {
    if (typeof window === 'undefined') return;

    const timing = window.performance?.timing;
    if (timing) {
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime }));
    }

    // Memory usage (if available)
    if (window.performance?.memory) {
      const memoryUsage = window.performance.memory.usedJSHeapSize;
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, []);

  // Optimize images lazy loading
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
    return () => images.forEach(img => imageObserver.unobserve(img));
  }, []);

  // Bundle optimization check
  const checkOptimization = useCallback(() => {
    const bundleSize = document.scripts.length;
    const cssFiles = document.styleSheets.length;
    
    setIsOptimized(bundleSize < 10 && cssFiles < 5);
  }, []);

  useEffect(() => {
    measurePerformance();
    optimizeImages();
    checkOptimization();

    // Performance observer for paint metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'paint') {
            setMetrics(prev => ({ 
              ...prev, 
              renderTime: entry.startTime 
            }));
          }
        });
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

      return () => observer.disconnect();
    }
  }, [measurePerformance, optimizeImages, checkOptimization]);

  return {
    metrics,
    isOptimized,
    optimizeImages,
    measurePerformance
  };
};

export default usePerformanceOptimization;