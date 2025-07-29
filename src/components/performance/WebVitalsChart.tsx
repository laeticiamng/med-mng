import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WebVital {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface WebVitalsData {
  LCP: WebVital;
  FID: WebVital;
  CLS: WebVital;
  TTFB: WebVital;
}

interface WebVitalsChartProps {
  data: WebVitalsData;
  detailed?: boolean;
}

export const WebVitalsChart: React.FC<WebVitalsChartProps> = ({ data, detailed = false }) => {
  const vitalsConfig = {
    LCP: {
      name: 'Largest Contentful Paint',
      description: 'Temps de chargement du plus gros élément',
      unit: 'ms',
      thresholds: { good: 2500, poor: 4000 },
      format: (value: number) => `${Math.round(value)}ms`,
    },
    FID: {
      name: 'First Input Delay',
      description: 'Délai de première interaction',
      unit: 'ms',
      thresholds: { good: 100, poor: 300 },
      format: (value: number) => `${Math.round(value)}ms`,
    },
    CLS: {
      name: 'Cumulative Layout Shift',
      description: 'Changements de mise en page cumulés',
      unit: 'score',
      thresholds: { good: 0.1, poor: 0.25 },
      format: (value: number) => value.toFixed(3),
    },
    TTFB: {
      name: 'Time to First Byte',
      description: 'Temps jusqu\'au premier byte',
      unit: 'ms',
      thresholds: { good: 600, poor: 1500 },
      format: (value: number) => `${Math.round(value)}ms`,
    },
  };

  const getRatingColor = (rating: WebVital['rating']) => {
    switch (rating) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'poor':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRatingLabel = (rating: WebVital['rating']) => {
    switch (rating) {
      case 'good':
        return 'Bon';
      case 'needs-improvement':
        return 'À améliorer';
      case 'poor':
        return 'Mauvais';
      default:
        return 'Inconnu';
    }
  };

  const getProgressValue = (vital: string, value: number) => {
    const config = vitalsConfig[vital as keyof typeof vitalsConfig];
    if (!config) return 0;
    
    // Calculer le pourcentage basé sur les seuils
    if (value <= config.thresholds.good) {
      return (value / config.thresholds.good) * 30; // 0-30% pour "good"
    } else if (value <= config.thresholds.poor) {
      return 30 + ((value - config.thresholds.good) / (config.thresholds.poor - config.thresholds.good)) * 40; // 30-70% pour "needs-improvement"
    } else {
      return Math.min(70 + ((value - config.thresholds.poor) / config.thresholds.poor) * 30, 100); // 70-100% pour "poor"
    }
  };

  const getProgressColor = (rating: WebVital['rating']) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500';
      case 'needs-improvement':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (detailed) {
    return (
      <div className="space-y-6">
        {Object.entries(data).map(([key, vital]) => {
          const config = vitalsConfig[key as keyof typeof vitalsConfig];
          const progressValue = getProgressValue(key, vital.value);
          
          return (
            <Card key={key}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold">{config.name}</h4>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                  <Badge className={getRatingColor(vital.rating)}>
                    {getRatingLabel(vital.rating)}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{config.format(vital.value)}</span>
                    <span className="text-sm text-muted-foreground">
                      Cible: {config.format(config.thresholds.good)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={progressValue} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Bon (≤{config.format(config.thresholds.good)})</span>
                      <span>À améliorer (≤{config.format(config.thresholds.poor)})</span>
                      <span>Mauvais (&gt;{config.format(config.thresholds.poor)})</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(data).map(([key, vital]) => {
        const config = vitalsConfig[key as keyof typeof vitalsConfig];
        
        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{key}</span>
              <Badge className={getRatingColor(vital.rating)} variant="secondary">
                {getRatingLabel(vital.rating)}
              </Badge>
            </div>
            <div className="text-xl font-bold">{config.format(vital.value)}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(vital.rating)}`}
                style={{ width: `${Math.min(getProgressValue(key, vital.value), 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};