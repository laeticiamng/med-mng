import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Book,
  Music2,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { useUnifiedMedicalMusicGeneration } from '@/hooks/useUnifiedMedicalMusicGeneration';
import { useToast } from '@/hooks/use-toast';

interface LearningSession {
  id: string;
  subject: string;
  duration: number;
  efficiency: number;
  retention: number;
  musicUsed: boolean;
  timestamp: Date;
}

interface OptimizationSuggestion {
  type: 'style' | 'timing' | 'content' | 'repetition';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export const MedicalLearningOptimizer: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [optimizationScore, setOptimizationScore] = useState(85);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const { generateMedicalMusic, stats } = useUnifiedMedicalMusicGeneration();
  const { toast } = useToast();

  // Suggestions d'optimisation basées sur l'IA et les neurosciences
  const [suggestions] = useState<OptimizationSuggestion[]>([
    {
      type: 'style',
      title: 'Adaptez le style musical à l\'heure',
      description: 'Les rythmes énergiques (Trap) sont plus efficaces le matin, le Lo-Fi convient mieux l\'après-midi.',
      impact: 'high',
      actionable: true
    },
    {
      type: 'timing',
      title: 'Optimisez vos sessions d\'apprentissage',
      description: 'Des sessions de 25 minutes avec 5 minutes de pause maximisent la rétention.',
      impact: 'high',
      actionable: true
    },
    {
      type: 'repetition',
      title: 'Répétition espacée intelligente',
      description: 'Réécoutez vos musiques selon la courbe d\'oubli d\'Ebbinghaus.',
      impact: 'medium',
      actionable: true
    },
    {
      type: 'content',
      title: 'Personnalisation du contenu',
      description: 'Adaptez la complexité des paroles à votre niveau de maîtrise du sujet.',
      impact: 'medium',
      actionable: true
    }
  ]);

  const [learningMetrics] = useState({
    weeklyHours: 12.5,
    retentionRate: 89,
    efficiency: 76,
    musicEffectiveness: 94,
    focusScore: 82,
    comprehensionSpeed: 118 // pourcentage par rapport à la moyenne
  });

  const startOptimization = async () => {
    setIsOptimizing(true);
    
    try {
      // Simulation d'optimisation IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newScore = Math.min(100, optimizationScore + Math.floor(Math.random() * 10) + 5);
      setOptimizationScore(newScore);
      
      toast({
        title: "🧠 Optimisation terminée !",
        description: `Votre score d'apprentissage est passé à ${newScore}%. Nouvelles recommandations disponibles.`
      });
      
    } catch (error) {
      toast({
        title: "Erreur d'optimisation",
        description: "Impossible de compléter l'analyse. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const applySuggestion = async (suggestion: OptimizationSuggestion) => {
    if (!suggestion.actionable) return;
    
    toast({
      title: `Optimisation appliquée : ${suggestion.title}`,
      description: "Vos prochaines sessions d'apprentissage seront automatiquement ajustées."
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      
      {/* Score d'optimisation global */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Score d'Optimisation Neuro-Cognitive</h2>
              <p className="text-muted-foreground">Basé sur vos habitudes d'apprentissage et les neurosciences</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(optimizationScore)}`}>
                {optimizationScore}%
              </div>
              <Badge variant={optimizationScore >= 90 ? 'default' : optimizationScore >= 70 ? 'secondary' : 'destructive'}>
                {optimizationScore >= 90 ? 'Excellent' : optimizationScore >= 70 ? 'Bon' : 'À améliorer'}
              </Badge>
            </div>
          </div>
          
          <Progress value={optimizationScore} className="h-3 mb-4" />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Dernière analyse : {new Date().toLocaleDateString()}
            </div>
            <Button 
              onClick={startOptimization}
              disabled={isOptimizing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              {isOptimizing ? 'Optimisation...' : 'Lancer l\'analyse IA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Métriques d'apprentissage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Métriques Cognitives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taux de rétention</span>
              <div className="text-right">
                <span className="font-bold text-green-600">{learningMetrics.retentionRate}%</span>
                <Progress value={learningMetrics.retentionRate} className="w-20 h-2 mt-1" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Efficacité d'étude</span>
              <div className="text-right">
                <span className="font-bold text-blue-600">{learningMetrics.efficiency}%</span>
                <Progress value={learningMetrics.efficiency} className="w-20 h-2 mt-1" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Impact musical</span>
              <div className="text-right">
                <span className="font-bold text-purple-600">{learningMetrics.musicEffectiveness}%</span>
                <Progress value={learningMetrics.musicEffectiveness} className="w-20 h-2 mt-1" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score de concentration</span>
              <div className="text-right">
                <span className="font-bold text-orange-600">{learningMetrics.focusScore}%</span>
                <Progress value={learningMetrics.focusScore} className="w-20 h-2 mt-1" />
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vitesse de compréhension</span>
                <div className="text-right">
                  <span className="font-bold text-green-600">{learningMetrics.comprehensionSpeed}%</span>
                  <span className="text-xs text-muted-foreground block">vs moyenne</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session actuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Session en Cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentSession ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{currentSession.subject}</span>
                  <Badge variant="outline">
                    {Math.floor(currentSession.duration / 60)}m {currentSession.duration % 60}s
                  </Badge>
                </div>
                <Progress value={currentSession.efficiency} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  Efficacité actuelle: {currentSession.efficiency}%
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Aucune session active</p>
                <Button size="sm" variant="outline">
                  Démarrer une session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques de génération */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Performance IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.completedCount}</div>
                <div className="text-xs text-muted-foreground">Pistes créées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.activeCount}</div>
                <div className="text-xs text-muted-foreground">En génération</div>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Progrès global</span>
                <span className="text-sm font-medium">{Math.round(stats.totalProgress)}%</span>
              </div>
              <Progress value={stats.totalProgress} className="h-2" />
            </div>
            
            <div className="text-center pt-2">
              <div className="text-sm text-muted-foreground">
                Temps restant: {Math.ceil(stats.estimatedTimeRemaining / 60)}min
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions d'optimisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Recommandations IA Personnalisées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{suggestion.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getImpactColor(suggestion.impact)}`}
                  >
                    {suggestion.impact}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {suggestion.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {suggestion.actionable ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {suggestion.actionable ? 'Actionnable' : 'Informatif'}
                    </span>
                  </div>
                  
                  {suggestion.actionable && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      Appliquer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};