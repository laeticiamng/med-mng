/**
 * ⚡ PREMIUM PERFORMANCE PROVIDER - MED-MNG v4.0
 * Monitoring et optimisation des performances en temps réel
 */

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage: number;
  bundleSize: number;
  cacheHitRate: number;
  errorRate: number;
  loadTime: number;
}

interface PerformanceSettings {
  enableMonitoring: boolean;
  enableOptimizations: boolean;
  reportingInterval: number;
  memoryThreshold: number;
  performanceMode: 'eco' | 'balanced' | 'performance';
}

interface PerformanceContext {
  metrics: PerformanceMetrics;
  settings: PerformanceSettings;
  updateMetric: (key: keyof PerformanceMetrics, value: number) => void;
  updateSetting: (key: keyof PerformanceSettings, value: any) => void;
  startPerformanceTrace: (name: string) => () => void;
  reportPerformance: () => void;
}

const PerformanceContext = createContext<PerformanceContext | null>(null);

export const usePremiumPerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePremiumPerformance must be used within PremiumPerformanceProvider');
  }
  return context;
};

interface PremiumPerformanceProviderProps {
  children: React.ReactNode;
}

export const PremiumPerformanceProvider: React.FC<PremiumPerformanceProviderProps> = ({ children }) => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    cacheHitRate: 100,
    errorRate: 0,
    loadTime: 0
  });

  const [settings, setSettings] = React.useState<PerformanceSettings>({
    enableMonitoring: true,
    enableOptimizations: true,
    reportingInterval: 30000, // 30 secondes
    memoryThreshold: 100, // MB
    performanceMode: 'balanced'
  });

  const updateMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSetting = useCallback((key: keyof PerformanceSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Appliquer les optimisations selon le mode de performance
    if (key === 'performanceMode') {
      const html = document.documentElement;
      
      switch (value) {
        case 'eco':
          html.style.setProperty('--animation-duration', '0.1s');
          html.classList.add('reduce-animations');
          break;
        case 'performance':
          html.style.setProperty('--animation-duration', '0.5s');
          html.classList.remove('reduce-animations');
          break;
        default: // balanced
          html.style.setProperty('--animation-duration', '0.3s');
          html.classList.remove('reduce-animations');
      }
    }
    
    logger.debug('performance', 'Setting updated', { key, value });
  }, []);

  const startPerformanceTrace = useCallback((name: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.debug('performance', 'Trace completed', { 
        name, 
        duration: Math.round(duration) 
      });
      
      // Mettre à jour les métriques de rendu
      updateMetric('lastRenderTime', duration);
      updateMetric('renderCount', metrics.renderCount + 1);
      
      // Calculer la moyenne
      const newAverage = (metrics.averageRenderTime * metrics.renderCount + duration) / (metrics.renderCount + 1);
      updateMetric('averageRenderTime', newAverage);
    };
  }, [metrics.averageRenderTime, metrics.renderCount, updateMetric]);

  const reportPerformance = useCallback(() => {
    if (!settings.enableMonitoring) return;
    
    // Mesures Web Vitals
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        updateMetric('loadTime', navigation.loadEventEnd - navigation.fetchStart);
      }
      
      // Mesure de la mémoire (si disponible)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        updateMetric('memoryUsage', usedMB);
        
        // Alerte si seuil dépassé
        if (usedMB > settings.memoryThreshold) {
          logger.warn('performance', 'High memory usage detected', { 
            usage: Math.round(usedMB),
            threshold: settings.memoryThreshold 
          });
        }
      }
    }
    
    logger.info('performance', 'Performance report', {
      ...metrics,
      settings: settings.performanceMode
    });
  }, [metrics, settings, updateMetric]);

  // Monitoring automatique des performances
  useEffect(() => {
    if (!settings.enableMonitoring) return;
    
    const interval = setInterval(reportPerformance, settings.reportingInterval);
    
    return () => clearInterval(interval);
  }, [settings.enableMonitoring, settings.reportingInterval, reportPerformance]);

  // Observer les mutations DOM pour optimiser les rendus
  useEffect(() => {
    if (!settings.enableOptimizations) return;
    
    const observer = new MutationObserver((mutations) => {
      const significantMutations = mutations.filter(mutation => 
        mutation.type === 'childList' && mutation.addedNodes.length > 5
      );
      
      if (significantMutations.length > 0) {
        logger.debug('performance', 'Significant DOM mutations detected', {
          count: significantMutations.length
        });
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, [settings.enableOptimizations]);

  // Optimisations automatiques
  useEffect(() => {
    if (settings.enableOptimizations) {
      // Lazy loading des images
      const images = document.querySelectorAll('img[data-src]');
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = img.dataset.src || '';
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          });
        });
        
        images.forEach(img => imageObserver.observe(img));
      }
      
      // Préchargement des routes critiques
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Précharger les modules critiques
          import('@/components/sidebar/PremiumSidebar');
          import('@/components/header/PremiumHeader');
        });
      }
    }
  }, [settings.enableOptimizations]);

  return (
    <PerformanceContext.Provider value={{
      metrics,
      settings,
      updateMetric,
      updateSetting,
      startPerformanceTrace,
      reportPerformance
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};