import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { logger } from '@/utils/logger';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Brain, 
  Zap,
  Activity,
  BarChart3
} from 'lucide-react';

interface StudyMetrics {
  sessionsCompleted: number;
  averageScore: number;
  timeSpent: number;
  streakDays: number;
  weakAreas: string[];
  strongAreas: string[];
  learningVelocity: number;
}

interface AIInsights {
  personalizedRecommendations: string[];
  adaptiveDifficulty: number;
  nextOptimalSession: string;
  cognitiveLoad: number;
  retentionPrediction: number;
}

export const AdvancedAnalytics: React.FC = () => {
  const [studyMetrics, setStudyMetrics] = useState<StudyMetrics>({
    sessionsCompleted: 47,
    averageScore: 87.5,
    timeSpent: 342,
    streakDays: 12,
    weakAreas: ['Cardiologie', 'Neurologie'],
    strongAreas: ['Anatomie', 'Physiologie'],
    learningVelocity: 1.8
  });

  const [aiInsights, setAiInsights] = useState<AIInsights>({
    personalizedRecommendations: [
      'Focus sur les pathologies cardiaques complexes',
      'Révision des syndromes neurologiques rares',
      'Pratique de cas cliniques intégrés'
    ],
    adaptiveDifficulty: 75,
    nextOptimalSession: '16:30 - Période de concentration optimale',
    cognitiveLoad: 68,
    retentionPrediction: 92
  });

  const performance = usePerformanceMonitoring('AdvancedAnalytics');

  useEffect(() => {
    performance.startRenderTiming();
    logger.info('Advanced analytics loaded', 'AdvancedAnalytics', { studyMetrics, aiInsights });
  }, []);

  const handleOptimizeStudy = () => {
    performance.startInteractionTiming();
    logger.info('Study optimization requested', 'AdvancedAnalytics');
    
    // Simulate AI optimization
    setAiInsights(prev => ({
      ...prev,
      adaptiveDifficulty: Math.min(prev.adaptiveDifficulty + 5, 100),
      cognitiveLoad: Math.max(prev.cognitiveLoad - 10, 0)
    }));
    
    performance.endInteractionTiming();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Complétées</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyMetrics.sessionsCompleted}</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyMetrics.averageScore}%</div>
            <Progress value={studyMetrics.averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps d'Étude</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyMetrics.timeSpent}h</div>
            <p className="text-xs text-muted-foreground">
              Série actuelle: {studyMetrics.streakDays} jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vélocité</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyMetrics.learningVelocity}x</div>
            <p className="text-xs text-muted-foreground">
              Vitesse d'apprentissage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights IA Personnalisés
          </CardTitle>
          <CardDescription>
            Recommandations adaptées à votre profil d'apprentissage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cognitive Load */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Charge Cognitive</span>
              <span className="text-sm text-muted-foreground">{aiInsights.cognitiveLoad}%</span>
            </div>
            <Progress value={aiInsights.cognitiveLoad} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Niveau optimal pour maximiser l'apprentissage
            </p>
          </div>

          {/* Retention Prediction */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Prédiction de Rétention</span>
              <span className="text-sm text-muted-foreground">{aiInsights.retentionPrediction}%</span>
            </div>
            <Progress value={aiInsights.retentionPrediction} className="h-2" />
          </div>

          <Separator />

          {/* Personalized Recommendations */}
          <div>
            <h4 className="text-sm font-medium mb-3">Recommandations Personnalisées</h4>
            <div className="space-y-2">
              {aiInsights.personalizedRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{recommendation}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Learning Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-destructive">Domaines à Renforcer</h4>
              <div className="space-y-1">
                {studyMetrics.weakAreas.map((area, index) => (
                  <Badge key={index} variant="destructive" className="mr-1">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 text-green-600">Points Forts</h4>
              <div className="space-y-1">
                {studyMetrics.strongAreas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="mr-1">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Optimization Button */}
          <div className="flex justify-center pt-4">
            <Button onClick={handleOptimizeStudy} className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Optimiser Mon Parcours d'Étude
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Session Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Prochaine Session Optimale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
            <div className="text-lg font-semibold mb-2">
              {aiInsights.nextOptimalSession}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Basé sur vos patterns d'apprentissage et votre rythme circadien
            </p>
            <Badge variant="outline">
              Difficulté Adaptative: {aiInsights.adaptiveDifficulty}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};