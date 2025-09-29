import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, Wifi, Database, Zap, AlertTriangle, 
  CheckCircle, Clock, TrendingUp, Smartphone
} from 'lucide-react';

interface PerformanceMetrics {
  loading: number;
  interactive: number;
  cumulative: number;
  firstPaint: number;
  largestPaint: number;
  networkRTT: number;
  memoryUsage: number;
  connectionType: string;
}

interface VitalStatus {
  status: 'good' | 'needs-improvement' | 'poor';
  value: number;
  threshold: { good: number; poor: number };
}

/**
 * Moniteur de performance en temps réel
 */
export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  useEffect(() => {
    // Collecter les métriques de performance
    const collectMetrics = () => {
      if (!performance.getEntriesByType) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime || 0;
      const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;

      // @ts-ignore - Types not fully available
      const memory = (performance as any).memory;
      const connection = (navigator as any).connection;

      setMetrics({
        loading: navigation.loadEventEnd - navigation.loadEventStart,
        interactive: navigation.domInteractive - (navigation.fetchStart || 0),
        cumulative: 0, // CLS would need observer
        firstPaint,
        largestPaint: firstContentfulPaint,
        networkRTT: connection?.rtt || 0,
        memoryUsage: memory ? Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100) : 0,
        connectionType: connection?.effectiveType || 'unknown'
      });

      setConnectionInfo(connection);
    };

    // Observer pour Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            collectMetrics();
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
      } catch (e) {
        console.log('Performance Observer not supported');
      }
    }

    collectMetrics();
    
    // Mise à jour périodique
    const interval = setInterval(collectMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getVitalStatus = (value: number, thresholds: { good: number; poor: number }): VitalStatus => {
    if (value <= thresholds.good) return { status: 'good', value, threshold: thresholds };
    if (value <= thresholds.poor) return { status: 'needs-improvement', value, threshold: thresholds };
    return { status: 'poor', value, threshold: thresholds };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-success';
      case 'needs-improvement': return 'text-warning-foreground';
      case 'poor': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'needs-improvement': return Clock;
      case 'poor': return AlertTriangle;
      default: return Activity;
    }
  };

  if (!metrics || !isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  // Core Web Vitals
  const vitals = [
    {
      name: 'LCP',
      label: 'Largest Contentful Paint',
      value: metrics.largestPaint,
      unit: 'ms',
      thresholds: { good: 2500, poor: 4000 },
      icon: Zap
    },
    {
      name: 'FID',
      label: 'First Input Delay',
      value: metrics.interactive,
      unit: 'ms', 
      thresholds: { good: 100, poor: 300 },
      icon: Clock
    },
    {
      name: 'CLS',
      label: 'Cumulative Layout Shift',
      value: metrics.cumulative,
      unit: '',
      thresholds: { good: 0.1, poor: 0.25 },
      icon: TrendingUp
    }
  ];

  const additionalMetrics = [
    {
      label: 'First Paint',
      value: `${Math.round(metrics.firstPaint)}ms`,
      icon: Zap
    },
    {
      label: 'Memory Usage',
      value: `${metrics.memoryUsage}%`,
      icon: Database
    },
    {
      label: 'Network RTT',
      value: `${metrics.networkRTT}ms`,
      icon: Wifi
    },
    {
      label: 'Connection',
      value: metrics.connectionType,
      icon: Smartphone
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="medical-card shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Core Web Vitals */}
          <div>
            <h4 className="font-medium mb-3 text-sm">Core Web Vitals</h4>
            <div className="space-y-3">
              {vitals.map((vital) => {
                const status = getVitalStatus(vital.value, vital.thresholds);
                const StatusIcon = getStatusIcon(status.status);
                
                return (
                  <div key={vital.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <vital.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{vital.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {Math.round(vital.value)}{vital.unit}
                      </span>
                      <StatusIcon className={`w-4 h-4 ${getStatusColor(status.status)}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Métriques additionnelles */}
          <div>
            <h4 className="font-medium mb-3 text-sm">Métriques Système</h4>
            <div className="space-y-2">
              {additionalMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <metric.icon className="w-3 h-3 text-muted-foreground" />
                    <span>{metric.label}</span>
                  </div>
                  <span className="font-mono">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Memory Usage Progress */}
          {metrics.memoryUsage > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Utilisation Mémoire</span>
                <span>{metrics.memoryUsage}%</span>
              </div>
              <Progress 
                value={metrics.memoryUsage} 
                className="h-2"
              />
            </div>
          )}

          {/* Score global */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score Global</span>
              <Badge 
                variant="secondary"
                className={vitals.every(v => getVitalStatus(v.value, v.thresholds).status === 'good') 
                  ? 'bg-success/10 text-success' 
                  : 'bg-warning/10 text-warning-foreground'
                }
              >
                {vitals.every(v => getVitalStatus(v.value, v.thresholds).status === 'good') 
                  ? 'Excellent' 
                  : 'À améliorer'
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};