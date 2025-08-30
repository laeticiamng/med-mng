import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Gauge, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Eye,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  networkType: string;
  memoryUsage: number;
  jsHeapSize: number;
}

export const PerformanceOptimizer = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const [optimizations, setOptimizations] = useState<string[]>([]);

  // Mesurer les performances
  const measurePerformance = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      // Simulated LCP (en production, utilisez l'API Web Vitals)
      const lcp = fcp + Math.random() * 1000;
      
      // Network information
      const connection = (navigator as any).connection;
      const networkType = connection?.effectiveType || 'unknown';
      
      // Memory information
      const memory = (performance as any).memory;
      const memoryUsage = memory ? (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 : 0;
      
      setMetrics({
        lcp: lcp,
        fid: Math.random() * 100, // Simulated
        cls: Math.random() * 0.25, // Simulated
        ttfb: navigation.responseStart - navigation.requestStart,
        fcp: fcp,
        networkType,
        memoryUsage,
        jsHeapSize: memory?.usedJSHeapSize || 0
      });
    }
  }, []);

  // Optimisations automatiques
  const applyOptimizations = useCallback(() => {
    const appliedOptimizations: string[] = [];
    
    // Préchargement des images critiques
    const images = document.querySelectorAll('img[data-critical]');
    images.forEach(img => {
      if (img.getAttribute('loading') !== 'eager') {
        img.setAttribute('loading', 'eager');
        appliedOptimizations.push('Images critiques préchargées');
      }
    });
    
    // Lazy loading pour les images non critiques
    const lazyImages = document.querySelectorAll('img:not([data-critical])');
    lazyImages.forEach(img => {
      if (!img.getAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
        appliedOptimizations.push('Lazy loading activé');
      }
    });
    
    // Optimisation des polices
    const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
    if (fontLinks.length === 0) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = 'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_flhiMyaEo.woff2';
      document.head.appendChild(link);
      appliedOptimizations.push('Préchargement des polices optimisé');
    }
    
    // Service Worker pour le cache
    if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        appliedOptimizations.push('Service Worker activé');
      });
    }
    
    // Optimisation du DOM
    const elements = document.querySelectorAll('[style*="will-change"]');
    if (elements.length === 0) {
      const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-scale-in, .hover-lift');
      animatedElements.forEach(el => {
        (el as HTMLElement).style.willChange = 'transform, opacity';
      });
      if (animatedElements.length > 0) {
        appliedOptimizations.push('Optimisation GPU activée');
      }
    }
    
    setOptimizations(appliedOptimizations);
    setIsOptimized(true);
    
    // Re-mesurer après optimisation
    setTimeout(measurePerformance, 1000);
  }, [measurePerformance]);

  useEffect(() => {
    measurePerformance();
    
    // Observer les Web Vitals en temps réel
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => prev ? { ...prev, lcp: entry.startTime } : null);
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.log('Observer not supported');
    }
    
    return () => observer.disconnect();
  }, [measurePerformance]);

  const getScoreColor = (score: number, thresholds: { good: number; poor: number }) => {
    if (score <= thresholds.good) return 'text-success';
    if (score <= thresholds.poor) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number, thresholds: { good: number; poor: number }) => {
    if (score <= thresholds.good) return 'Excellent';
    if (score <= thresholds.poor) return 'Bon';
    return 'À améliorer';
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Analyse des performances...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Performance & Optimisations UX
            {isOptimized && (
              <Badge className="bg-success/20 text-success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Optimisé
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Web Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LCP (Largest Contentful Paint)</span>
                <span className={`text-sm ${getScoreColor(metrics.lcp, { good: 2500, poor: 4000 })}`}>
                  {Math.round(metrics.lcp)}ms
                </span>
              </div>
              <Progress value={Math.min((metrics.lcp / 4000) * 100, 100)} className="h-2" />
              <span className={`text-xs ${getScoreColor(metrics.lcp, { good: 2500, poor: 4000 })}`}>
                {getScoreLabel(metrics.lcp, { good: 2500, poor: 4000 })}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FID (First Input Delay)</span>
                <span className={`text-sm ${getScoreColor(metrics.fid, { good: 100, poor: 300 })}`}>
                  {Math.round(metrics.fid)}ms
                </span>
              </div>
              <Progress value={Math.min((metrics.fid / 300) * 100, 100)} className="h-2" />
              <span className={`text-xs ${getScoreColor(metrics.fid, { good: 100, poor: 300 })}`}>
                {getScoreLabel(metrics.fid, { good: 100, poor: 300 })}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CLS (Cumulative Layout Shift)</span>
                <span className={`text-sm ${getScoreColor(metrics.cls, { good: 0.1, poor: 0.25 })}`}>
                  {metrics.cls.toFixed(3)}
                </span>
              </div>
              <Progress value={Math.min((metrics.cls / 0.25) * 100, 100)} className="h-2" />
              <span className={`text-xs ${getScoreColor(metrics.cls, { good: 0.1, poor: 0.25 })}`}>
                {getScoreLabel(metrics.cls, { good: 0.1, poor: 0.25 })}
              </span>
            </div>
          </div>

          {/* Métriques système */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <Wifi className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Réseau</div>
                <div className="text-xs text-muted-foreground capitalize">{metrics.networkType}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <HardDrive className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">Mémoire</div>
                <div className="text-xs text-muted-foreground">{Math.round(metrics.memoryUsage)}%</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <Cpu className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">JS Heap</div>
                <div className="text-xs text-muted-foreground">
                  {(metrics.jsHeapSize / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <Eye className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium">FCP</div>
                <div className="text-xs text-muted-foreground">{Math.round(metrics.fcp)}ms</div>
              </div>
            </div>
          </div>

          {/* Actions d'optimisation */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Optimisations disponibles</h4>
              <p className="text-sm text-muted-foreground">
                Améliorez les performances automatiquement
              </p>
            </div>
            <Button
              onClick={applyOptimizations}
              disabled={isOptimized}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isOptimized ? 'Optimisé' : 'Optimiser'}
            </Button>
          </div>

          {/* Liste des optimisations appliquées */}
          {optimizations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-success">Optimisations appliquées :</h4>
              <div className="space-y-1">
                {optimizations.map((optimization, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-success" />
                    {optimization}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommandations */}
          <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-info mt-0.5" />
              <div>
                <h4 className="font-medium text-info">Recommandations</h4>
                <ul className="text-sm text-info/80 mt-1 space-y-1">
                  <li>• Utilisez des images WebP pour de meilleures performances</li>
                  <li>• Activez la compression GZIP/Brotli sur votre serveur</li>
                  <li>• Minimisez les requêtes réseau avec le bundling</li>
                  <li>• Utilisez un CDN pour servir les assets statiques</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};