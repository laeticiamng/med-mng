import React, { useEffect, useState } from 'react';
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, AlertTriangle, TrendingUp, TrendingDown, 
  Target, ArrowRight, Sparkles, RefreshCw, Clock, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LearningInsight {
  type: 'strength' | 'weakness' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  relatedItems?: string[];
  actionUrl?: string;
}

export const LearningInsights: React.FC = () => {
  const navigate = useNavigate();
  const { insights, generateInsights, loading } = useLearningAnalytics();
  const { getTodayStats } = useActivityTracking();
  const [localInsights, setLocalInsights] = useState<LearningInsight[]>([]);
  const [todayStats, setTodayStats] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const [result, today] = await Promise.all([
        generateInsights(),
        getTodayStats()
      ]);
      setLocalInsights(result);
      setTodayStats(today);
    };
    load();
  }, [generateInsights, getTodayStats]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <TrendingUp className="h-5 w-5 text-success" />;
      case 'weakness':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-primary" />;
      case 'prediction':
        return <Target className="h-5 w-5 text-accent" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'strength':
        return 'Point fort';
      case 'weakness':
        return 'À améliorer';
      case 'recommendation':
        return 'Conseil';
      case 'prediction':
        return 'Prédiction';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Analyse en cours...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (localInsights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            Pas encore assez de données pour générer des insights.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Continuez à étudier pour débloquer des recommandations personnalisées !
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Insights Personnalisés
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => generateInsights()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Today's activity summary */}
        {todayStats && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Activité d'aujourd'hui
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{todayStats.total}</p>
                <p className="text-xs text-muted-foreground">activités</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{todayStats.totalTime || 0}</p>
                <p className="text-xs text-muted-foreground">min</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{todayStats.avgScore || 0}%</p>
                <p className="text-xs text-muted-foreground">score moy.</p>
              </div>
            </div>
          </div>
        )}
        
        {localInsights.map((insight, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg border transition-colors ${
              insight.type === 'weakness' ? 'border-warning/30 bg-warning/5' :
              insight.type === 'strength' ? 'border-success/30 bg-success/5' :
              insight.type === 'recommendation' ? 'border-primary/30 bg-primary/5' :
              'border-border bg-muted/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <Badge variant={getPriorityVariant(insight.priority)} className="text-xs">
                    {getTypeLabel(insight.type)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
                {insight.relatedItems && insight.relatedItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {insight.relatedItems.slice(0, 5).map((item, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        Item {item}
                      </Badge>
                    ))}
                  </div>
                )}
                {insight.actionUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 -ml-2 h-7 text-xs"
                    onClick={() => navigate(insight.actionUrl!)}
                  >
                    Commencer
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LearningInsights;
