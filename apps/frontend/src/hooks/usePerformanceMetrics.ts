/**
 * Hook pour mesurer et tracker les métriques de performance web-vitals
 * Mesure: FCP, LCP, CLS, INP (remplace FID), TTFB
 */

import logger from '@/lib/logger';
import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import { trackPerformanceMetric } from '@/lib/indexedDB';

export function usePerformanceMetrics() {
  useEffect(() => {
    // First Contentful Paint (FCP)
    // Mesure quand le premier contenu est affiché
    onFCP((metric) => {
      logger.debug(`[Web Vitals] FCP: ${metric.value.toFixed(2)}ms`);
      trackPerformanceMetric('FCP', metric.value);
    });

    // Largest Contentful Paint (LCP)
    // Mesure quand le plus gros élément visible est affiché
    onLCP((metric) => {
      logger.debug(`[Web Vitals] LCP: ${metric.value.toFixed(2)}ms`);
      trackPerformanceMetric('LCP', metric.value);
    });

    // Interaction to Next Paint (INP) - remplace FID
    // Mesure la réactivité globale de la page
    onINP((metric) => {
      logger.debug(`[Web Vitals] INP: ${metric.value.toFixed(2)}ms`);
      trackPerformanceMetric('FID', metric.value); // Utilise FID pour compatibilité
    });

    // Cumulative Layout Shift (CLS)
    // Mesure la stabilité visuelle (moins de déplacements = mieux)
    onCLS((metric) => {
      logger.debug(`[Web Vitals] CLS: ${metric.value.toFixed(4)}`);
      trackPerformanceMetric('CLS', metric.value);
    });

    // Time to First Byte (TTFB)
    // Mesure le temps de réponse du serveur
    onTTFB((metric) => {
      logger.debug(`[Web Vitals] TTFB: ${metric.value.toFixed(2)}ms`);
      trackPerformanceMetric('TTFB', metric.value);
    });
  }, []);
}

/**
 * Hook pour mesurer le temps de chargement d'une page spécifique
 */
export function usePageLoadTime(pageName: string) {
  useEffect(() => {
    const startTime = performance.now();

    // Mesurer quand la page est complètement chargée
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime;
      logger.debug(`[Performance] ${pageName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Enregistrer comme métrique TTI (Time to Interactive approximé)
      trackPerformanceMetric('TTI', loadTime);
    };

    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
      return () => window.removeEventListener('load', measureLoadTime);
    }
  }, [pageName]);
}

/**
 * Hook pour mesurer le temps passé sur une page
 */
export function useTimeOnPage(onTimeUpdate?: (seconds: number) => void) {
  useEffect(() => {
    const startTime = Date.now();
    let intervalId: NodeJS.Timeout;

    // Mettre à jour toutes les secondes
    if (onTimeUpdate) {
      intervalId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        onTimeUpdate(elapsed);
      }, 1000);
    }

    // Enregistrer le temps total à la sortie
    return () => {
      if (intervalId) clearInterval(intervalId);
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      logger.debug(`[Performance] Time on page: ${totalTime}s`);
    };
  }, [onTimeUpdate]);
}
