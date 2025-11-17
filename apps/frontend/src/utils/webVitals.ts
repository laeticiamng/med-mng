import { useState, useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

/**
 * Web Vitals metric type
 */
export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Performance report
 */
export interface PerformanceReport {
  recommendations: string[];
}

/**
 * Web Vitals hook result
 */
export interface UseWebVitalsResult {
  metrics: WebVitalMetric[];
  performanceScore: number;
  isGood: boolean;
  generateReport: () => PerformanceReport;
}

/**
 * Get rating for CLS (Cumulative Layout Shift)
 */
function getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 0.1) return 'good';
  if (value <= 0.25) return 'needs-improvement';
  return 'poor';
}

/**
 * Get rating for INP (Interaction to Next Paint)
 */
function getINPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 200) return 'good';
  if (value <= 500) return 'needs-improvement';
  return 'poor';
}

/**
 * Get rating for LCP (Largest Contentful Paint)
 */
function getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 2500) return 'good';
  if (value <= 4000) return 'needs-improvement';
  return 'poor';
}

/**
 * Get rating for FCP (First Contentful Paint)
 */
function getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 1800) return 'good';
  if (value <= 3000) return 'needs-improvement';
  return 'poor';
}

/**
 * Get rating for TTFB (Time to First Byte)
 */
function getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 800) return 'good';
  if (value <= 1800) return 'needs-improvement';
  return 'poor';
}

/**
 * Calculate overall performance score (0-100)
 */
function calculatePerformanceScore(metrics: WebVitalMetric[]): number {
  if (metrics.length === 0) return 0;

  let score = 0;
  metrics.forEach((metric) => {
    if (metric.rating === 'good') score += 100;
    else if (metric.rating === 'needs-improvement') score += 50;
    else score += 0;
  });

  return Math.round(score / metrics.length);
}

/**
 * Generate performance report with recommendations
 */
function generatePerformanceReport(metrics: WebVitalMetric[]): PerformanceReport {
  const recommendations: string[] = [];

  metrics.forEach((metric) => {
    if (metric.rating === 'poor') {
      switch (metric.name) {
        case 'CLS':
          recommendations.push('Reduce layout shifts by setting dimensions for images and ads');
          break;
        case 'INP':
          recommendations.push('Optimize JavaScript execution and reduce main thread blocking');
          break;
        case 'LCP':
          recommendations.push('Optimize image loading and server response time');
          break;
        case 'FCP':
          recommendations.push('Reduce render-blocking resources and optimize critical CSS');
          break;
        case 'TTFB':
          recommendations.push('Improve server response time and use CDN');
          break;
      }
    } else if (metric.rating === 'needs-improvement') {
      switch (metric.name) {
        case 'CLS':
          recommendations.push('Further reduce layout shifts for better user experience');
          break;
        case 'INP':
          recommendations.push('Continue optimizing interactivity and responsiveness');
          break;
        case 'LCP':
          recommendations.push('Further optimize largest contentful paint timing');
          break;
        case 'FCP':
          recommendations.push('Continue reducing time to first contentful paint');
          break;
        case 'TTFB':
          recommendations.push('Further improve server response time');
          break;
      }
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('All metrics are performing well! Keep up the good work.');
  }

  return { recommendations };
}

/**
 * React hook for monitoring Web Vitals
 */
export function useWebVitals(): UseWebVitalsResult {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([]);

  useEffect(() => {
    // Collect CLS
    onCLS((metric) => {
      setMetrics((prev) => [
        ...prev.filter((m) => m.name !== 'CLS'),
        { name: 'CLS', value: metric.value, rating: getCLSRating(metric.value) },
      ]);
    });

    // Collect INP
    onINP((metric) => {
      setMetrics((prev) => [
        ...prev.filter((m) => m.name !== 'INP'),
        { name: 'INP', value: metric.value, rating: getINPRating(metric.value) },
      ]);
    });

    // Collect LCP
    onLCP((metric) => {
      setMetrics((prev) => [
        ...prev.filter((m) => m.name !== 'LCP'),
        { name: 'LCP', value: metric.value, rating: getLCPRating(metric.value) },
      ]);
    });

    // Collect FCP
    onFCP((metric) => {
      setMetrics((prev) => [
        ...prev.filter((m) => m.name !== 'FCP'),
        { name: 'FCP', value: metric.value, rating: getFCPRating(metric.value) },
      ]);
    });

    // Collect TTFB
    onTTFB((metric) => {
      setMetrics((prev) => [
        ...prev.filter((m) => m.name !== 'TTFB'),
        { name: 'TTFB', value: metric.value, rating: getTTFBRating(metric.value) },
      ]);
    });
  }, []);

  const performanceScore = calculatePerformanceScore(metrics);
  const isGood = performanceScore >= 80;

  const generateReport = () => generatePerformanceReport(metrics);

  return {
    metrics,
    performanceScore,
    isGood,
    generateReport,
  };
}
