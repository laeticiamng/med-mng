import { useEffect, useState } from 'react';
import { Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

// Types pour les métriques Web Vitals
export interface WebVitalsData {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  entries: PerformanceEntry[];
}

// Configuration des seuils pour chaque métrique (selon Google)
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

// Fonction pour déterminer le rating d'une métrique
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS];
  if (!thresholds) return 'good';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
};

// Classe pour gérer le monitoring des Web Vitals
class WebVitalsMonitor {
  private metrics: Map<string, WebVitalsData> = new Map();
  private callbacks: Array<(metric: WebVitalsData) => void> = [];
  private isInitialized = false;

  // Initialiser le monitoring
  init() {
    if (this.isInitialized) return;
    
    const handleMetric = (metric: Metric) => {
      const vitalsData: WebVitalsData = {
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        rating: getRating(metric.name, metric.value),
        entries: metric.entries || [],
      };

      this.metrics.set(metric.name, vitalsData);
      this.notifyCallbacks(vitalsData);
      this.logMetric(vitalsData);
      this.sendToAnalytics(vitalsData);
    };

    // Collecter toutes les métriques Web Vitals
    onCLS(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);

    this.isInitialized = true;
    console.log('🔍 Web Vitals monitoring initialized');
  }

  // Ajouter un callback pour être notifié des nouvelles métriques
  onMetric(callback: (metric: WebVitalsData) => void) {
    this.callbacks.push(callback);
  }

  // Obtenir toutes les métriques collectées
  getMetrics(): WebVitalsData[] {
    return Array.from(this.metrics.values());
  }

  // Obtenir une métrique spécifique
  getMetric(name: string): WebVitalsData | undefined {
    return this.metrics.get(name);
  }

  // Obtenir un score global de performance
  getPerformanceScore(): number {
    const metrics = this.getMetrics();
    if (metrics.length === 0) return 0;

    const scores = metrics.map(metric => {
      switch (metric.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 50;
        case 'poor': return 0;
        default: return 0;
      }
    });

    return Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length) as number;
  }

  // Vérifier si les métriques sont dans les seuils acceptables
  isPerformanceGood(): boolean {
    const metrics = this.getMetrics();
    return metrics.every(metric => metric.rating !== 'poor');
  }

  // Logger les métriques dans la console
  private logMetric(metric: WebVitalsData) {
    const emoji = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴';
    console.log(`${emoji} ${metric.name}: ${metric.value}ms (${metric.rating})`);
  }

  // Envoyer les métriques vers un service d'analytics
  private sendToAnalytics(metric: WebVitalsData) {
    // Envoyer vers Google Analytics 4 (si configuré)
    if (window.gtag) {
      window.gtag('event', metric.name, {
        custom_parameter_value: metric.value,
        custom_parameter_delta: metric.delta,
        custom_parameter_rating: metric.rating,
      });
    }

    // Envoyer vers Sentry (si configuré)
    if (window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'web-vitals',
        message: `${metric.name}: ${metric.value}`,
        level: metric.rating === 'poor' ? 'warning' : 'info',
        data: {
          value: metric.value,
          rating: metric.rating,
        },
      });
    }

    // Log pour debug local
    if (import.meta.env.MODE === 'development') {
      console.table({
        [metric.name]: {
          value: `${metric.value}ms`,
          rating: metric.rating,
          delta: metric.delta,
        }
      });
    }
  }

  // Notifier tous les callbacks
  private notifyCallbacks(metric: WebVitalsData) {
    this.callbacks.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        console.error('Error in Web Vitals callback:', error);
      }
    });
  }

  // Générer un rapport de performance
  generateReport(): {
    score: number;
    metrics: WebVitalsData[];
    recommendations: string[];
    isGood: boolean;
  } {
    const metrics = this.getMetrics();
    const score = this.getPerformanceScore();
    const isGood = this.isPerformanceGood();
    
    const recommendations: string[] = [];
    
    metrics.forEach(metric => {
      if (metric.rating === 'poor') {
        switch (metric.name) {
          case 'CLS':
            recommendations.push('Évitez les changements de layout inattendus');
            break;
          case 'INP':
            recommendations.push('Réduisez le temps de traitement JavaScript');
            break;
          case 'LCP':
            recommendations.push('Optimisez le chargement des ressources critiques');
            break;
          case 'FCP':
            recommendations.push('Réduisez le temps de chargement initial');
            break;
          case 'TTFB':
            recommendations.push('Optimisez la réponse du serveur');
            break;
        }
      }
    });

    return {
      score,
      metrics,
      recommendations,
      isGood,
    };
  }
}

// Instance singleton du monitor
export const webVitalsMonitor = new WebVitalsMonitor();

// Hook React pour utiliser les Web Vitals
export const useWebVitals = () => {
  const [metrics, _setMetrics] = useState<WebVitalsData[]>([]);
  const [performanceScore, _setPerformanceScore] = useState(0);

  useEffect(() => {
    // Initialiser le monitoring
    webVitalsMonitor.init();

    // S'abonner aux nouvelles métriques
    // Nettoyer à la destruction du composant
    return () => {
      // Note: pas de vraie méthode unsubscribe dans cette implémentation simple
      // Dans une vraie app, il faudrait l'implémenter
    };
  }, []);

  return {
    metrics,
    performanceScore,
    isGood: webVitalsMonitor.isPerformanceGood(),
    generateReport: () => webVitalsMonitor.generateReport(),
  };
};

// Fonction utilitaire pour initialiser le monitoring au démarrage de l'app
export const initWebVitals = () => {
  webVitalsMonitor.init();
};

// Types pour window (pour TypeScript)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    Sentry?: any;
  }
}