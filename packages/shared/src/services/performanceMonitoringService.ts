/**
 * Performance Monitoring Service
 * Tracks and reports application performance metrics
 */

interface PerformanceMetrics {
  timestamp: number;
  pageName: string;
  metrics: {
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte
    tti?: number; // Time to Interactive
    renderTime?: number;
    memoryUsage?: number;
    networkLatency?: number;
  };
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled = true;

  constructor() {
    this.initializeNativeMetrics();
    this.initializeCustomMetrics();
  }

  /**
   * Initialize Web Vitals measurement
   */
  private initializeNativeMetrics() {
    // Measure First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.recordMetric('fcp', entry.startTime);
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        console.debug('Paint observer not supported:', error);
      }

      // Measure Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('lcp', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.debug('LCP observer not supported:', error);
      }

      // Measure Cumulative Layout Shift
      try {
        let cls = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              cls += entry.value;
              this.recordMetric('cls', cls);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.debug('CLS observer not supported:', error);
      }

      // Measure First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            this.recordMetric('fid', entry.processingDuration);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.debug('FID observer not supported:', error);
      }
    }

    // Measure Time to First Byte using Navigation Timing API
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0] as any;
      if (navTiming) {
        this.recordMetric('ttfb', navTiming.responseStart - navTiming.fetchStart);
      }
    });
  }

  /**
   * Initialize custom metrics (memory, network latency)
   */
  private initializeCustomMetrics() {
    // Memory usage (Chrome only)
    if ((performance as any).memory) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memoryUsage', memory.usedJSHeapSize / 1048576); // Convert to MB
      }, 5000);
    }

    // Network latency test
    this.measureNetworkLatency();
  }

  /**
   * Measure network latency
   */
  private async measureNetworkLatency() {
    try {
      const startTime = performance.now();
      await fetch('/api/health', { method: 'HEAD' });
      const latency = performance.now() - startTime;
      this.recordMetric('networkLatency', latency);
    } catch (error) {
      console.debug('Network latency measurement failed:', error);
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metricName: string, value: number) {
    if (!this.isEnabled) return;

    const lastMetric = this.metrics[this.metrics.length - 1];
    const timestamp = Date.now();

    if (lastMetric && lastMetric.timestamp === timestamp) {
      // Update existing metric for this timestamp
      (lastMetric.metrics as any)[metricName] = value;
    } else {
      // Create new metric entry
      this.metrics.push({
        timestamp,
        pageName: this.getCurrentPageName(),
        metrics: { [metricName]: value },
      });
    }

    // Report immediately for critical metrics
    if (['fcp', 'lcp', 'cls', 'fid'].includes(metricName)) {
      this.reportMetric(metricName, value);
    }
  }

  /**
   * Get current page name for tracking
   */
  private getCurrentPageName(): string {
    return window.location.pathname;
  }

  /**
   * Report metric to server/analytics
   */
  private reportMetric(name: string, value: number) {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', `performance_${name}`, {
        value: Math.round(value),
        page_path: this.getCurrentPageName(),
      });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Measure component render time
   */
  public measureComponentRender(componentName: string, fn: () => void) {
    const startTime = performance.now();
    fn();
    const renderTime = performance.now() - startTime;

    this.recordMetric(`render_${componentName}`, renderTime);

    if (renderTime > 16) {
      console.warn(`[Slow Render] ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }

  /**
   * Measure async operation
   */
  public async measureAsync<T>(
    operationName: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - startTime;
      this.recordMetric(`async_${operationName}`, duration);

      if (duration > 1000) {
        console.warn(`[Slow Operation] ${operationName}: ${duration.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Get performance summary
   */
  public getSummary(): {
    totalMetrics: number;
    averageRenderTime: number;
    memoryUsage: number;
    networkLatency: number;
  } {
    const renderMetrics = this.metrics.filter((m) =>
      Object.keys(m.metrics).some((k) => k.startsWith('render_'))
    );

    const avgRender =
      renderMetrics.length > 0
        ? renderMetrics.reduce(
            (sum, m) => sum + Object.values(m.metrics).reduce((a, b) => a + (b || 0), 0),
            0
          ) / renderMetrics.length
        : 0;

    const latestMemory = [...this.metrics]
      .reverse()
      .find((m) => m.metrics.memoryUsage !== undefined)?.metrics.memoryUsage || 0;

    const latestLatency = [...this.metrics]
      .reverse()
      .find((m) => m.metrics.networkLatency !== undefined)?.metrics.networkLatency || 0;

    return {
      totalMetrics: this.metrics.length,
      averageRenderTime: avgRender,
      memoryUsage: latestMemory,
      networkLatency: latestLatency,
    };
  }

  /**
   * Export metrics for analysis
   */
  public exportMetrics() {
    return {
      metrics: this.metrics,
      summary: this.getSummary(),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Clear metrics
   */
  public clearMetrics() {
    this.metrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Cleanup observers
   */
  public dispose() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitoringService();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.dispose();
  });
}

export default performanceMonitor;

// Type extensions for gtag
declare global {
  interface Window {
    gtag?: (event: string, name: string, params: any) => void;
  }
}
