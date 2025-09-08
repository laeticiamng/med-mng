import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Brain, 
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Users,
  Trophy
} from 'lucide-react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useAccessibility } from '@/hooks/useAccessibility';

interface SmartRecommendationProps {
  className?: string;
}

export const SmartRecommendations: React.FC<SmartRecommendationProps> = ({ className = "" }) => {
  const [recommendations, setRecommendations] = useState<Array<{
    id: string;
    type: 'study' | 'performance' | 'accessibility' | 'engagement';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    action: string;
    progress?: number;
  }>>([]);

  const { getPerformanceScore, getRecommendations } = usePerformanceMonitoring('SmartRecommendations');
  const { preferences } = useAccessibility();

  useEffect(() => {
    // Generate smart recommendations based on user behavior and performance
    const generateRecommendations = () => {
      const newRecommendations = [
        {
          id: '1',
          type: 'study' as const,
          priority: 'high' as const,
          title: 'Optimisez votre temps d\'étude',
          description: 'Basé sur vos sessions, vous apprenez mieux le matin. Planifiez vos sessions importantes avant 11h.',
          action: 'Planifier une session',
          progress: 75
        },
        {
          id: '2',
          type: 'performance' as const,
          priority: 'medium' as const,
          title: 'Améliorez vos performances',
          description: 'Vos scores en cardiologie sont excellents (92%), mais la neurologie nécessite plus de révisions.',
          action: 'Réviser neurologie',
          progress: 60
        },
        {
          id: '3',
          type: 'engagement' as const,
          priority: 'low' as const,
          title: 'Restez engagé',
          description: 'Vous avez terminé 8 sessions cette semaine. Objectif 10 sessions atteint à 80%.',
          action: 'Continuer',
          progress: 80
        }
      ];

      // Add performance-based recommendations
      const perfRecommendations = getRecommendations();
      perfRecommendations.forEach((rec, index) => {
        newRecommendations.push({
          id: `perf-${index}`,
          type: 'performance' as const,
          priority: 'medium' as const,
          title: 'Optimisation technique',
          description: rec,
          action: 'Optimiser',
          progress: 0
        });
      });

      setRecommendations(newRecommendations);
    };

    generateRecommendations();
  }, [getRecommendations]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study': return <Brain className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'accessibility': return <Target className="h-4 w-4" />;
      case 'engagement': return <Trophy className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Recommandations intelligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(rec.type)}
                    <h4 className="font-medium">{rec.title}</h4>
                  </div>
                  <Badge variant={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {rec.description}
                </p>
                
                {rec.progress && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{rec.progress}%</span>
                    </div>
                    <Progress value={rec.progress} className="h-2" />
                  </div>
                )}
                
                <Button size="sm" variant="outline" className="w-full">
                  {rec.action}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

interface PerformanceDashboardProps {
  className?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className = "" }) => {
  const { metrics, getPerformanceScore } = usePerformanceMonitoring('PerformanceDashboard');
  const [score, setScore] = useState(0);

  useEffect(() => {
    setScore(getPerformanceScore());
  }, [getPerformanceScore]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Performance de l'application
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {Math.round(score)}
          </div>
          <p className="text-sm text-muted-foreground">Score de performance</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-semibold">
              {Math.round(metrics.renderTime)}ms
            </div>
            <p className="text-xs text-muted-foreground">Temps de rendu</p>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-semibold">
              {Math.round(metrics.memoryUsage)}MB
            </div>
            <p className="text-xs text-muted-foreground">Mémoire utilisée</p>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-semibold">
              {Math.round(metrics.interactionDelay)}ms
            </div>
            <p className="text-xs text-muted-foreground">Délai d'interaction</p>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-semibold">
              {metrics.networkRequests}
            </div>
            <p className="text-xs text-muted-foreground">Requêtes réseau</p>
          </div>
        </div>

        {score < 70 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Les performances peuvent être optimisées. Consultez les recommandations.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

interface LearningAnalyticsProps {
  className?: string;
}

export const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({ className = "" }) => {
  const [analytics, setAnalytics] = useState({
    totalStudyTime: 245, // minutes
    averageSessionLength: 35,
    completedSessions: 8,
    averageScore: 85,
    strongTopics: ['Cardiologie', 'Pneumologie'],
    weakTopics: ['Neurologie', 'Psychiatrie'],
    streak: 5,
    weeklyGoal: 10,
    weeklyProgress: 8
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Analytiques d'apprentissage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Study Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.floor(analytics.totalStudyTime / 60)}h {analytics.totalStudyTime % 60}m
            </div>
            <p className="text-xs text-muted-foreground">Temps total</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {analytics.averageScore}%
            </div>
            <p className="text-xs text-muted-foreground">Score moyen</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {analytics.completedSessions}
            </div>
            <p className="text-xs text-muted-foreground">Sessions terminées</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {analytics.streak}
            </div>
            <p className="text-xs text-muted-foreground">Jours consécutifs</p>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Objectif hebdomadaire</span>
            <span className="text-sm text-muted-foreground">
              {analytics.weeklyProgress}/{analytics.weeklyGoal} sessions
            </span>
          </div>
          <Progress 
            value={(analytics.weeklyProgress / analytics.weeklyGoal) * 100} 
            className="h-3" 
          />
        </div>

        {/* Strong/Weak Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Points forts
            </h4>
            <div className="space-y-1">
              {analytics.strongTopics.map((topic) => (
                <Badge key={topic} variant="secondary" className="mr-1">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-1">
              <Target className="h-4 w-4" />
              À améliorer
            </h4>
            <div className="space-y-1">
              {analytics.weakTopics.map((topic) => (
                <Badge key={topic} variant="outline" className="mr-1">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};