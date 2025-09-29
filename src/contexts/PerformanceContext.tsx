import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useInternationalization } from './InternationalizationContext';

interface PerformanceContextType {
  // Core Web Vitals
  webVitals: {
    LCP: number | null; // Largest Contentful Paint
    FID: number | null; // First Input Delay  
    CLS: number | null; // Cumulative Layout Shift
    TTFB: number | null; // Time to First Byte
    FCP: number | null; // First Contentful Paint
  };
  
  // Loading Performance
  loadingMetrics: {
    bundleSize: number;
    assetsLoaded: number;
    totalAssets: number;
    loadTime: number;
  };
  
  // Memory Usage
  memoryUsage: {
    jsHeapSize: number;
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
  };
  
  // Network Performance
  networkMetrics: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  
  // Performance Actions
  measurePageLoad: () => void;
  reportMetric: (name: string, value: number) => void;
  getPerformanceScore: () => number;
  optimizeBundle: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const { t } = useInternationalization();
  
  const [webVitals, setWebVitals] = useState({
    LCP: null as number | null,
    FID: null as number | null,
    CLS: null as number | null,
    TTFB: null as number | null,
    FCP: null as number | null,
  });
  
  const [loadingMetrics, setLoadingMetrics] = useState({
    bundleSize: 0,
    assetsLoaded: 0,
    totalAssets: 0,
    loadTime: 0,
  });
  
  const [memoryUsage, setMemoryUsage] = useState({
    jsHeapSize: 0,
    jsHeapSizeLimit: 0,
    totalJSHeapSize: 0,
  });
  
  const [networkMetrics, setNetworkMetrics] = useState({
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });

  // Mesurer les Core Web Vitals
  useEffect(() => {
    const measureWebVitals = async () => {
      try {
        // Mesurer LCP
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          setWebVitals(prev => ({ ...prev, LCP: lastEntry.startTime }));
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        // Mesurer FCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0] as any;
          setWebVitals(prev => ({ ...prev, FCP: firstEntry.startTime }));
        }).observe({ entryTypes: ['paint'] });

        // Mesurer CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          setWebVitals(prev => ({ ...prev, CLS: clsValue }));
        }).observe({ entryTypes: ['layout-shift'] });

        // Mesurer TTFB
        const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
        if (navigationEntry) {
          const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
          setWebVitals(prev => ({ ...prev, TTFB: ttfb }));
        }

      } catch (error) {
        console.warn('Performance measurement not supported:', error);
      }
    };

    measureWebVitals();
  }, []);

  // Mesurer l'utilisation mémoire
  useEffect(() => {
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage({
          jsHeapSize: memory.usedJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize,
        });
      }
    };

    const interval = setInterval(measureMemory, 5000);
    measureMemory(); // Mesure initiale

    return () => clearInterval(interval);
  }, []);

  // Mesurer les métriques réseau
  useEffect(() => {
    const measureNetwork = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkMetrics({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
        });
      }
    };

    measureNetwork();
    
    // Écouter les changements de connexion
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', measureNetwork);
    }

    return () => {
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', measureNetwork);
      }
    };
  }, []);

  const measurePageLoad = () => {
    const startTime = performance.now();
    
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      setLoadingMetrics(prev => ({ ...prev, loadTime }));
      
      // Mesurer la taille des ressources
      const resources = performance.getEntriesByType('resource');
      let totalSize = 0;
      
      resources.forEach((resource: any) => {
        if (resource.transferSize) {
          totalSize += resource.transferSize;
        }
      });
      
      setLoadingMetrics(prev => ({
        ...prev,
        bundleSize: totalSize,
        assetsLoaded: resources.length,
        totalAssets: resources.length,
      }));
    });
  };

  const reportMetric = (name: string, value: number) => {
    // Reporter la métrique à un service d'analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance_metric', {
        custom_parameter: name,
        value: value,
      });
    }
    
    console.log(`📊 Performance Metric - ${name}: ${value}`);
  };

  const getPerformanceScore = (): number => {
    let score = 100;
    
    // Pénalités basées sur les Core Web Vitals
    if (webVitals.LCP && webVitals.LCP > 2500) score -= 20;
    if (webVitals.FID && webVitals.FID > 100) score -= 15;
    if (webVitals.CLS && webVitals.CLS > 0.1) score -= 15;
    if (webVitals.FCP && webVitals.FCP > 1800) score -= 10;
    if (webVitals.TTFB && webVitals.TTFB > 600) score -= 10;
    
    // Pénalités basées sur la mémoire
    const memoryUsagePercent = memoryUsage.jsHeapSize / memoryUsage.jsHeapSizeLimit;
    if (memoryUsagePercent > 0.8) score -= 15;
    
    // Pénalités basées sur la taille du bundle
    if (loadingMetrics.bundleSize > 1024 * 1024) score -= 10; // > 1MB
    
    return Math.max(0, Math.min(100, score));
  };

  const optimizeBundle = () => {
    // Suggestions d'optimisation
    const suggestions = [];
    
    if (loadingMetrics.bundleSize > 1024 * 1024) {
      suggestions.push(t('performance.suggestions.reduceBundle'));
    }
    
    if (webVitals.LCP && webVitals.LCP > 2500) {
      suggestions.push(t('performance.suggestions.optimizeLCP'));
    }
    
    if (memoryUsage.jsHeapSize / memoryUsage.jsHeapSizeLimit > 0.8) {
      suggestions.push(t('performance.suggestions.optimizeMemory'));
    }
    
    console.log('🔧 Optimizations suggérées:', suggestions);
    return suggestions;
  };

  const value: PerformanceContextType = {
    webVitals,
    loadingMetrics,
    memoryUsage,
    networkMetrics,
    measurePageLoad,
    reportMetric,
    getPerformanceScore,
    optimizeBundle,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};