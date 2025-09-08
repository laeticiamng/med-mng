// ==========================================
// MED-MNG PERFORMANCE SERVICE
// Surveillance et optimisation des performances
// ==========================================

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'api' | 'render' | 'navigation' | 'user';
}

interface APICallMetric {
  service: string;
  endpoint: string;
  duration: number;
  success: boolean;
  timestamp: number;
}

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private apiCalls: APICallMetric[] = [];
  private webVitals: WebVitalsMetric[] = [];
  private observer: PerformanceObserver | null = null;
  
  constructor() {
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Observer pour les métriques de performance
    this.observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordPerformanceEntry(entry);
      });
    });

    // Observer différents types d'événements
    try {
      this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] });
    } catch (error) {
      console.warn('Performance Observer non supporté:', error);
    }

    // Surveiller les Web Vitals
    this.monitorWebVitals();
    
    // Surveiller les erreurs
    window.addEventListener('error', (event) => {
      this.recordError(event.error);
    });

    // Surveiller la mémoire (si disponible)
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMemoryUsage();
      }, 30000); // Toutes les 30 secondes
    }
  }

  private recordPerformanceEntry(entry: PerformanceEntry) {
    const metric: PerformanceMetric = {
      name: entry.name,
      value: entry.duration || (entry as any).value || 0,
      timestamp: Date.now(),
      category: this.categorizeEntry(entry)
    };

    this.metrics.push(metric);
    
    // Limiter le nombre de métriques en mémoire
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  private categorizeEntry(entry: PerformanceEntry): 'api' | 'render' | 'navigation' | 'user' {
    if (entry.entryType === 'navigation') return 'navigation';
    if (entry.entryType === 'paint') return 'render';
    if (entry.name.includes('api') || entry.name.includes('fetch')) return 'api';
    return 'user';
  }

  private monitorWebVitals() {
    // Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // First Input Delay (FID)
    this.observeFID();
    
    // First Contentful Paint (FCP)
    this.observeFCP();
    
    // Largest Contentful Paint (LCP)
    this.observeLCP();
  }

  private observeCLS() {
    if (typeof PerformanceObserver === 'undefined') return;

    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
          clsEntries.push(entry);
        }
      }
      
      this.recordWebVital('CLS', clsValue);
    });

    try {
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch {}
  }

  private observeFID() {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventTiming = entry as any;
        this.recordWebVital('FID', eventTiming.processingStart - eventTiming.startTime);
      }
    });

    try {
      observer.observe({ type: 'first-input', buffered: true });
    } catch {}
  }

  private observeFCP() {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordWebVital('FCP', entry.startTime);
        }
      }
    });

    try {
      observer.observe({ type: 'paint', buffered: true });
    } catch {}
  }

  private observeLCP() {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordWebVital('LCP', lastEntry.startTime);
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
  }

  private recordWebVital(name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB', value: number) {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name];
    const rating = value <= threshold.good ? 'good' : 
                   value <= threshold.poor ? 'needs-improvement' : 'poor';

    const vital: WebVitalsMetric = {
      name,
      value,
      rating,
      timestamp: Date.now()
    };

    this.webVitals.push(vital);
    
    // Limiter les métriques stockées
    if (this.webVitals.length > 100) {
      this.webVitals = this.webVitals.slice(-50);
    }
  }

  private recordMemoryUsage() {
    const memory = (performance as any).memory;
    if (!memory) return;

    this.metrics.push({
      name: 'memory-used',
      value: memory.usedJSHeapSize,
      timestamp: Date.now(),
      category: 'user'
    });

    this.metrics.push({
      name: 'memory-limit',
      value: memory.jsHeapSizeLimit,
      timestamp: Date.now(),
      category: 'user'
    });
  }

  private recordError(error: Error) {
    this.metrics.push({
      name: 'error',
      value: 1,
      timestamp: Date.now(),
      category: 'user'
    });
  }

  // Méthodes publiques

  recordAPICall(service: string, endpoint: string, duration: number, success: boolean) {
    const call: APICallMetric = {
      service,
      endpoint,
      duration,
      success,
      timestamp: Date.now()
    };

    this.apiCalls.push(call);
    
    // Limiter les appels stockés
    if (this.apiCalls.length > 500) {
      this.apiCalls = this.apiCalls.slice(-250);
    }
  }

  recordCustomMetric(name: string, value: number, category: 'api' | 'render' | 'navigation' | 'user' = 'user') {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      category
    });
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    return fn().then((result) => {
      const duration = performance.now() - start;
      this.recordCustomMetric(name, duration, 'user');
      return result;
    }).catch((error) => {
      const duration = performance.now() - start;
      this.recordCustomMetric(`${name}-error`, duration, 'user');
      throw error;
    });
  }

  getMetrics() {
    return {
      performance: this.metrics,
      apiCalls: this.apiCalls,
      webVitals: this.webVitals,
      summary: this.getSummary()
    };
  }

  private getSummary() {
    const now = Date.now();
    const lastHour = now - 3600000; // 1 heure
    
    const recentMetrics = this.metrics.filter(m => m.timestamp > lastHour);
    const recentAPICalls = this.apiCalls.filter(c => c.timestamp > lastHour);
    const recentWebVitals = this.webVitals.filter(v => v.timestamp > lastHour);

    return {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      avgResponseTime: recentAPICalls.length > 0 ? 
        recentAPICalls.reduce((sum, call) => sum + call.duration, 0) / recentAPICalls.length : 0,
      apiSuccessRate: recentAPICalls.length > 0 ?
        recentAPICalls.filter(call => call.success).length / recentAPICalls.length : 1,
      webVitalsScore: this.calculateWebVitalsScore(recentWebVitals),
      memoryUsage: this.getLatestMemoryUsage()
    };
  }

  private calculateWebVitalsScore(vitals: WebVitalsMetric[]): number {
    if (vitals.length === 0) return 100;

    const scores = vitals.map(vital => {
      switch (vital.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 50;
        case 'poor': return 0;
        default: return 50;
      }
    });

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private getLatestMemoryUsage(): number | null {
    const memoryMetrics = this.metrics
      .filter(m => m.name === 'memory-used')
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return memoryMetrics.length > 0 ? memoryMetrics[0].value : null;
  }

  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      metrics: this.getMetrics()
    }, null, 2);
  }

  clearMetrics() {
    this.metrics = [];
    this.apiCalls = [];
    this.webVitals = [];
  }

  dispose() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export default PerformanceService;