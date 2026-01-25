import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWebVitals } from '@/utils/webVitals';
import { Activity, Clock, Eye, Wifi, Zap } from 'lucide-react';

export const PerformanceMonitor = () => {
  const { metrics, performanceScore, isGood, generateReport } = useWebVitals();

  const getMetricIcon = (name: string) => {
    switch (name) {
      case 'CLS': return <Activity className="h-4 w-4" />;
      case 'INP': return <Zap className="h-4 w-4" />;
      case 'LCP': return <Eye className="h-4 w-4" />;
      case 'FCP': return <Clock className="h-4 w-4" />;
      case 'TTFB': return <Wifi className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-success';
      case 'needs-improvement': return 'bg-warning';
      case 'poor': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Monitor
            </CardTitle>
            <CardDescription>
              Surveillance en temps réel des Web Vitals
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
              {performanceScore}/100
            </div>
            <Badge variant={isGood ? 'default' : 'destructive'}>
              {isGood ? 'Bon' : 'À améliorer'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Score global */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Score de performance</span>
              <span className={getScoreColor(performanceScore)}>{performanceScore}%</span>
            </div>
            <Progress value={performanceScore} className="h-2" />
          </div>

          {/* Métriques détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMetricIcon(metric.name)}
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getMetricColor(metric.rating)} text-primary-foreground border-none`}
                  >
                    {metric.rating === 'good' ? 'Bon' : 
                     metric.rating === 'needs-improvement' ? 'Moyen' : 'Faible'}
                  </Badge>
                </div>
                
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {Math.round(metric.value)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {metric.name === 'CLS' ? '' : 'ms'}
                    </span>
                  </div>
                  
                  {metric.name === 'CLS' && (
                    <div className="text-xs text-muted-foreground">
                      Stabilité du layout
                    </div>
                  )}
                  {metric.name === 'INP' && (
                    <div className="text-xs text-muted-foreground">
                      Délai première interaction
                    </div>
                  )}
                  {metric.name === 'LCP' && (
                    <div className="text-xs text-muted-foreground">
                      Plus grand élément affiché
                    </div>
                  )}
                  {metric.name === 'FCP' && (
                    <div className="text-xs text-muted-foreground">
                      Premier affichage de contenu
                    </div>
                  )}
                  {metric.name === 'TTFB' && (
                    <div className="text-xs text-muted-foreground">
                      Temps première réponse
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Recommandations */}
          {!isGood && (
            <Card className="p-4 border-warning/20 bg-warning/5">
              <CardTitle className="text-sm text-warning-foreground mb-2">
                Recommandations d'amélioration
              </CardTitle>
              <div className="space-y-1 text-sm text-warning-foreground/80">
                {generateReport().recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-warning mt-0.5">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Informations debug */}
          {import.meta.env.MODE === 'development' && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Détails de debug (développement uniquement)
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(generateReport(), null, 2)}
              </pre>
            </details>
          )}
        </div>
      </CardContent>
    </Card>
  );
};