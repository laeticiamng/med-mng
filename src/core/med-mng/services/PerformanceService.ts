/**
 * ⚡ Service de Performance MED-MNG
 * Optimisation avancée des performances et monitoring en temps réel
 */

import { MED_MNG_CONFIG } from '../config/AppConfig';
import { logger } from '@/utils/logger';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  
  // Application Metrics
  renderTime: number;
  loadTime: number;
  interactionTime: number;
  memoryUsage: number;
  networkRequests: number;
  
  // Audio/Music Metrics
  audioLoadTime: number;
  musicGenerationTime: number;
  speechSynthesisTime: number;
  
  // Learning Metrics
  pageInteractionRate: number;
  sessionDuration: number;
  errorRate: number;
}

export interface PerformanceRecommendation {
  type: 'critical' | 'warning' | 'info';
  metric: keyof PerformanceMetrics;
  currentValue: number;
  recommendedValue: number;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

class PerformanceService {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: Map<string, PerformanceObserver> = new Map();
  private startTime: number = performance.now();
  private sessionId: string = '';

  constructor() {
    this.sessionId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring() {
    // Core Web Vitals monitoring
    this.observeWebVitals();
    
    // Resource timing
    this.observeResourceTiming();
    
    // Memory monitoring
    this.observeMemoryUsage();
    
    // User interaction monitoring
    this.observeUserInteractions();

    logger.info('Performance monitoring initialized', 'PerformanceService', {
      sessionId: this.sessionId
    });
  }

  private observeWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.lcp = lastEntry.startTime;
        this.analyzeMetric('lcp', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        logger.warn('LCP observer not supported', 'PerformanceService');
      }

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.analyzeMetric('fid', this.metrics.fid);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        logger.warn('FID observer not supported', 'PerformanceService');
      }

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
            this.analyzeMetric('cls', clsValue);
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        logger.warn('CLS observer not supported', 'PerformanceService');
      }
    }

    // Navigation timing pour FCP et TTFB
    this.captureNavigationTiming();
  }

  private captureNavigationTiming() {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigationTiming) {
      this.metrics.ttfb = navigationTiming.responseStart - navigationTiming.fetchStart;
      this.metrics.loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
      
      // FCP via Paint Timing API
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        this.analyzeMetric('fcp', fcpEntry.startTime);
      }
    }
  }

  private observeResourceTiming() {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let totalRequests = 0;
      let audioLoadTime = 0;
      
      entries.forEach((entry: any) => {
        totalRequests++;
        
        // Monitor audio/music loading specifically
        if (entry.name.includes('.mp3') || entry.name.includes('.wav') || entry.name.includes('audio')) {
          audioLoadTime = Math.max(audioLoadTime, entry.responseEnd - entry.startTime);
        }
      });
      
      this.metrics.networkRequests = (this.metrics.networkRequests || 0) + totalRequests;
      if (audioLoadTime > 0) {
        this.metrics.audioLoadTime = audioLoadTime;
        this.analyzeMetric('audioLoadTime', audioLoadTime);
      }
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (error) {
      logger.warn('Resource observer not supported', 'PerformanceService');
    }
  }

  private observeMemoryUsage() {
    // Monitor memory usage periodically
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        this.metrics.memoryUsage = memoryInfo.usedJSHeapSize / (1024 * 1024); // MB
        this.analyzeMetric('memoryUsage', this.metrics.memoryUsage);
      }
    };

    monitorMemory();
    setInterval(monitorMemory, 10000); // Check every 10 seconds
  }

  private observeUserInteractions() {
    let interactionCount = 0;
    let totalInteractionTime = 0;

    const trackInteraction = (event: Event) => {
      const startTime = performance.now();
      
      // Use requestIdleCallback to measure interaction processing time
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const endTime = performance.now();
          const interactionTime = endTime - startTime;
          
          interactionCount++;
          totalInteractionTime += interactionTime;
          
          this.metrics.interactionTime = totalInteractionTime / interactionCount;
          this.analyzeMetric('interactionTime', this.metrics.interactionTime);
        });
      }
    };

    // Track key user interactions
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, trackInteraction, { passive: true });
    });
  }

  private analyzeMetric(metric: keyof PerformanceMetrics, value: number) {
    const thresholds = this.getMetricThresholds(metric);
    
    if (value > thresholds.critical) {
      logger.warn(`Performance issue detected: ${metric}`, 'PerformanceService', {
        metric,
        value,
        threshold: thresholds.critical,
        sessionId: this.sessionId
      });
    }
  }

  private getMetricThresholds(metric: keyof PerformanceMetrics) {
    const thresholds = {
      lcp: { good: 2500, critical: 4000 },
      fid: { good: 100, critical: 300 },
      cls: { good: 0.1, critical: 0.25 },
      fcp: { good: 1800, critical: 3000 },
      ttfb: { good: 800, critical: 1800 },
      renderTime: { good: 16, critical: 50 }, // 60fps = 16ms per frame
      loadTime: { good: 3000, critical: 5000 },
      interactionTime: { good: 50, critical: 100 },
      memoryUsage: { good: 50, critical: 100 }, // MB
      audioLoadTime: { good: 2000, critical: 5000 },
      musicGenerationTime: { good: 30000, critical: 60000 }, // 30s, 60s
      speechSynthesisTime: { good: 3000, critical: 8000 },
      errorRate: { good: 0.01, critical: 0.05 }, // 1%, 5%
      sessionDuration: { good: 600000, critical: 1800000 }, // 10min, 30min
      pageInteractionRate: { good: 0.7, critical: 0.3 }, // 70%, 30%
      networkRequests: { good: 50, critical: 100 }
    };

    return thresholds[metric] || { good: 0, critical: Infinity };
  }

  // Public API methods
  public startRenderTiming(componentName: string) {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.metrics.renderTime = renderTime;
      this.analyzeMetric('renderTime', renderTime);
      
      logger.info(`Component render time: ${componentName}`, 'PerformanceService', {
        componentName,
        renderTime: renderTime.toFixed(2),
        sessionId: this.sessionId
      });
    };
  }

  public trackMusicGeneration(startTime: number) {
    const generationTime = performance.now() - startTime;
    this.metrics.musicGenerationTime = generationTime;
    this.analyzeMetric('musicGenerationTime', generationTime);
    
    return generationTime;
  }

  public trackSpeechSynthesis(startTime: number) {
    const synthesisTime = performance.now() - startTime;
    this.metrics.speechSynthesisTime = synthesisTime;
    this.analyzeMetric('speechSynthesisTime', synthesisTime);
    
    return synthesisTime;
  }

  public reportError() {
    const currentErrorRate = (this.metrics.errorRate || 0) + 1;
    this.metrics.errorRate = currentErrorRate;
    this.analyzeMetric('errorRate', currentErrorRate);
  }

  public updateSessionDuration() {
    const sessionDuration = performance.now() - this.startTime;
    this.metrics.sessionDuration = sessionDuration;
    this.analyzeMetric('sessionDuration', sessionDuration);
    
    return sessionDuration;
  }

  public getMetrics(): PerformanceMetrics {
    this.updateSessionDuration();
    return this.metrics as PerformanceMetrics;
  }

  public getPerformanceScore(): number {
    const metrics = this.getMetrics();
    let score = 100;
    let validMetrics = 0;

    // Calculate weighted score based on Core Web Vitals and app-specific metrics
    const weights = {
      lcp: 0.25,
      fid: 0.25,
      cls: 0.25,
      fcp: 0.1,
      renderTime: 0.1,
      interactionTime: 0.05
    };

    Object.entries(weights).forEach(([metric, weight]) => {
      const value = metrics[metric as keyof PerformanceMetrics];
      if (value !== undefined) {
        const thresholds = this.getMetricThresholds(metric as keyof PerformanceMetrics);
        let metricScore = 100;
        
        if (value > thresholds.critical) {
          metricScore = 0;
        } else if (value > thresholds.good) {
          metricScore = 50;
        }
        
        score -= (100 - metricScore) * weight;
        validMetrics++;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  public getRecommendations(): PerformanceRecommendation[] {
    const metrics = this.getMetrics();
    const recommendations: PerformanceRecommendation[] = [];

    Object.entries(metrics).forEach(([metric, value]) => {
      const metricKey = metric as keyof PerformanceMetrics;
      const thresholds = this.getMetricThresholds(metricKey);
      
      if (value > thresholds.critical) {
        recommendations.push({
          type: 'critical',
          metric: metricKey,
          currentValue: value,
          recommendedValue: thresholds.good,
          suggestion: this.getMetricSuggestion(metricKey),
          impact: 'high'
        });
      } else if (value > thresholds.good) {
        recommendations.push({
          type: 'warning',
          metric: metricKey,
          currentValue: value,
          recommendedValue: thresholds.good,
          suggestion: this.getMetricSuggestion(metricKey),
          impact: 'medium'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 3, warning: 2, info: 1 };
      return priorityOrder[b.type] - priorityOrder[a.type];
    });
  }

  private getMetricSuggestion(metric: keyof PerformanceMetrics): string {
    const suggestions = {
      lcp: 'Optimisez les images et utilisez le lazy loading pour améliorer le LCP',
      fid: 'Réduisez le JavaScript et utilisez des Web Workers pour les tâches lourdes',
      cls: 'Définissez les dimensions des images et évitez l\'ajout dynamique de contenu',
      fcp: 'Minimisez les ressources critiques et utilisez la précharge',
      ttfb: 'Optimisez les requêtes serveur et utilisez un CDN',
      renderTime: 'Optimisez les composants React avec React.memo et useMemo',
      loadTime: 'Réduisez la taille des bundles et activez la compression',
      interactionTime: 'Optimisez les gestionnaires d\'événements et utilisez la debounce',
      memoryUsage: 'Vérifiez les fuites mémoire et optimisez les données en cache',
      audioLoadTime: 'Compressez les fichiers audio et utilisez le streaming',
      musicGenerationTime: 'Optimisez les paramètres de génération Suno AI',
      speechSynthesisTime: 'Utilisez des voix optimisées et cachez les résultats',
      errorRate: 'Implémentez une meilleure gestion d\'erreurs et monitoring',
      sessionDuration: 'Optimisez l\'engagement utilisateur avec de meilleures UX',
      pageInteractionRate: 'Améliorez l\'interface utilisateur et la navigabilité',
      networkRequests: 'Regroupez les requêtes et utilisez la mise en cache'
    };

    return suggestions[metric] || 'Optimisez cette métrique pour de meilleures performances';
  }

  public generateReport(): string {
    const metrics = this.getMetrics();
    const score = this.getPerformanceScore();
    const recommendations = this.getRecommendations();

    let report = `
🚀 RAPPORT DE PERFORMANCE MED-MNG
Session ID: ${this.sessionId}
Score global: ${score.toFixed(1)}/100

📊 MÉTRIQUES PRINCIPALES:
• LCP: ${metrics.lcp?.toFixed(0)}ms
• FID: ${metrics.fid?.toFixed(0)}ms  
• CLS: ${metrics.cls?.toFixed(3)}
• FCP: ${metrics.fcp?.toFixed(0)}ms
• TTFB: ${metrics.ttfb?.toFixed(0)}ms

🎵 MÉTRIQUES AUDIO:
• Temps de chargement audio: ${metrics.audioLoadTime?.toFixed(0)}ms
• Génération musicale: ${metrics.musicGenerationTime?.toFixed(0)}ms
• Synthèse vocale: ${metrics.speechSynthesisTime?.toFixed(0)}ms

💡 RECOMMANDATIONS:
`;

    recommendations.slice(0, 5).forEach((rec, index) => {
      const icon = rec.type === 'critical' ? '🔴' : rec.type === 'warning' ? '🟡' : '🔵';
      report += `${icon} ${rec.suggestion}\n`;
    });

    return report;
  }

  public dispose() {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    logger.info('Performance monitoring disposed', 'PerformanceService', {
      sessionId: this.sessionId,
      finalScore: this.getPerformanceScore()
    });
  }
}

// Singleton instance
export const performanceService = new PerformanceService();