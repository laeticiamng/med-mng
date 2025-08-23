/**
 * MONITORING PERFORMANCE EN TEMPS RÉEL
 * ====================================
 * Système de monitoring des performances et Web Vitals
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userId?: string;
}

export interface PerformanceBudget {
  lcp: number;     // Largest Contentful Paint (ms)
  inp: number;     // Interaction to Next Paint (ms) - replaces FID
  cls: number;     // Cumulative Layout Shift (score)
  fcp: number;     // First Contentful Paint (ms)
  ttfb: number;    // Time to First Byte (ms)
}

const PERFORMANCE_BUDGET: PerformanceBudget = {
  lcp: 2500,   // 2.5s
  inp: 200,    // 200ms (replaces FID)
  cls: 0.1,    // 0.1 score
  fcp: 1800,   // 1.8s
  ttfb: 800    // 800ms
};

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isInitialized = false;

  init(userId?: string) {
    if (this.isInitialized) return;
    
    // Mesurer tous les Core Web Vitals
    onCLS((metric) => this.recordMetric('CLS', metric.value, userId));
    onINP((metric) => this.recordMetric('INP', metric.value, userId));
    onFCP((metric) => this.recordMetric('FCP', metric.value, userId));
    onLCP((metric) => this.recordMetric('LCP', metric.value, userId));
    onTTFB((metric) => this.recordMetric('TTFB', metric.value, userId));
    
    // Observer pour les métriques custom
    this.observeCustomMetrics();
    
    // Observer pour les ressources
    this.observeResourceTiming();
    
    this.isInitialized = true;
  }

  private recordMetric(name: string, value: number, userId?: string) {
    const rating = this.getPerformanceRating(name, value);
    
    const metric: PerformanceMetric = {
      name,
      value: Math.round(value),
      rating,
      timestamp: Date.now(),
      url: window.location.href,
      userId
    };
    
    this.metrics.push(metric);
    
    // Envoyer à l'analytics
    this.sendToAnalytics(metric);
    
    // Logger les problèmes de performance
    if (rating === 'poor') {
      console.warn(`🐌 Performance Warning: ${name} = ${value.toFixed(2)} (budget: ${this.getBudget(name)})`);
    }
  }

  private getPerformanceRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const budget = this.getBudget(name);
    if (!budget) return 'good';
    
    const threshold = {
      good: budget,
      poor: budget * 1.5 // 50% au-dessus du budget = poor
    };
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private getBudget(name: string): number | null {
    const budgetMap: Record<string, number> = {
      'LCP': PERFORMANCE_BUDGET.lcp,
      'INP': PERFORMANCE_BUDGET.inp, 
      'CLS': PERFORMANCE_BUDGET.cls,
      'FCP': PERFORMANCE_BUDGET.fcp,
      'TTFB': PERFORMANCE_BUDGET.ttfb
    };
    
    return budgetMap[name] || null;
  }

  private observeCustomMetrics() {
    // Observer pour les Long Tasks (> 50ms)
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          this.recordMetric('LONG_TASK', entry.duration);
          console.warn(`🐌 Long Task detected: ${entry.duration.toFixed(2)}ms`);
        }
      });
    });
    
    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', longTaskObserver);
    } catch (e) {
      // Long tasks not supported in this browser
    }

    // Observer pour les Layout Shifts
    const layoutShiftObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput && entry.value > 0) {
          console.log(`📐 Layout Shift detected: ${entry.value.toFixed(4)}`);
        }
      });
    });
    
    try {
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('layout-shift', layoutShiftObserver);
    } catch (e) {
      // Layout shift not supported
    }
  }

  private observeResourceTiming() {
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: PerformanceResourceTiming) => {
        const duration = entry.responseEnd - entry.requestStart;
        
        // Logger les ressources lentes (> 2s)
        if (duration > 2000) {
          console.warn(`🐌 Slow resource: ${entry.name} (${duration.toFixed(2)}ms)`);
        }
        
        // Tracker les échecs de ressources
        if (entry.transferSize === 0 && entry.decodedBodySize === 0) {
          console.error(`❌ Resource failed to load: ${entry.name}`);
        }
      });
    });
    
    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (e) {
      // Resource timing not supported
    }
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Envoyer à Google Analytics si disponible
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const gtag = (window as any).gtag;
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.rating,
        value: metric.value,
        non_interaction: true,
        custom_map: {
          dimension1: metric.url,
          dimension2: metric.userId || 'anonymous'
        }
      });
    }

    // Envoyer à un service analytics custom
    this.sendToCustomAnalytics(metric);
  }

  private async sendToCustomAnalytics(metric: PerformanceMetric) {
    try {
      // En production, envoyer à votre service d'analytics
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric)
        });
      }
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  // Méthodes publiques
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  getBudgetViolations(): PerformanceMetric[] {
    return this.metrics.filter(m => m.rating === 'poor');
  }

  generateReport(): {
    summary: Record<string, { average: number; worst: number; rating: string }>;
    violations: PerformanceMetric[];
    recommendations: string[];
  } {
    const summary: Record<string, { average: number; worst: number; rating: string }> = {};
    const violations = this.getBudgetViolations();
    const recommendations: string[] = [];

    // Calculer les moyennes par métrique
    const metricNames = [...new Set(this.metrics.map(m => m.name))];
    
    metricNames.forEach(name => {
      const nameMetrics = this.getMetricsByName(name);
      const values = nameMetrics.map(m => m.value);
      
      summary[name] = {
        average: values.reduce((a, b) => a + b, 0) / values.length,
        worst: Math.max(...values),
        rating: nameMetrics[nameMetrics.length - 1]?.rating || 'unknown'
      };
    });

    // Générer des recommandations
    if (summary.LCP?.average > PERFORMANCE_BUDGET.lcp) {
      recommendations.push('Optimiser le Largest Contentful Paint : réduire la taille des images, utiliser un CDN');
    }
    
    if (summary.INP?.average > PERFORMANCE_BUDGET.inp) {
      recommendations.push('Réduire Interaction to Next Paint : code splitting, defer des scripts non-critiques');
    }
    
    if (summary.CLS?.average > PERFORMANCE_BUDGET.cls) {
      recommendations.push('Éliminer les Layout Shifts : définir les dimensions des images et contenus dynamiques');
    }

    return { summary, violations, recommendations };
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.length = 0;
    this.isInitialized = false;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utilitaires pour mesurer les performances custom
export const measurePerformance = <T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> => {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      
      if (duration > 100) {
        console.warn(`🐌 Slow operation detected: ${name} (${duration.toFixed(2)}ms)`);
      }
    });
  } else {
    const duration = performance.now() - start;
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    
    if (duration > 50) {
      console.warn(`🐌 Slow operation detected: ${name} (${duration.toFixed(2)}ms)`);
    }
    
    return result;
  }
};

// Hook React pour monitoring des composants
import React from 'react';

export const useComponentPerformance = (componentName: string) => {
  const renderStart = performance.now();
  
  React.useEffect(() => {
    const renderTime = performance.now() - renderStart;
    
    if (import.meta.env.DEV && renderTime > 16) {
      console.warn(`🎭 Slow component render: ${componentName} (${renderTime.toFixed(2)}ms)`);
    }
  });
};