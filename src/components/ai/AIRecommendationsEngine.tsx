import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, TrendingUp, Zap, Star, Users, Activity, BookOpen } from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { toast } from 'sonner';

interface SmartRecommendation {
  id: string;
  type: 'study' | 'music' | 'break' | 'exercise' | 'nutrition';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeToComplete: string;
  aiReasoning: string;
  personalizedScore: number;
}

const AIRecommendationsEngine: React.FC = () => {
  const { generateRecommendations, isLoading } = useAIRecommendations();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState({
    studyHours: 6,
    stressLevel: 'medium',
    performanceScore: 78,
    preferredTime: 'morning'
  });

  useEffect(() => {
    loadSmartRecommendations();
  }, []);

  const loadSmartRecommendations = async () => {
    try {
      const data = await generateRecommendations();
      
      // Simuler des recommandations IA avancées
      const smartRecs: SmartRecommendation[] = [
        {
          id: '1',
          type: 'study',
          title: 'Session Neurologie Intensive',
          description: 'Optimisée selon votre rythme circadien et performance récente',
          confidence: 94,
          impact: 'high',
          timeToComplete: '45min',
          aiReasoning: 'Votre pic de concentration est détecté à 09h-11h avec 23% de rétention supplémentaire',
          personalizedScore: 96
        },
        {
          id: '2',
          type: 'music',
          title: 'Playlist Binaural Focus',
          description: 'Fréquences 40Hz pour améliorer la concentration',
          confidence: 89,
          impact: 'high',
          timeToComplete: '30min',
          aiReasoning: 'Vos sessions précédentes montrent +31% d\'efficacité avec sons binauraux',
          personalizedScore: 91
        },
        {
          id: '3',
          type: 'break',
          title: 'Micro-pause Active',
          description: 'Exercices oculaires et étirements ciblés',
          confidence: 87,
          impact: 'medium',
          timeToComplete: '5min',
          aiReasoning: 'Prévention fatigue visuelle après 2h d\'étude continue détectées',
          personalizedScore: 85
        }
      ];
      
      setRecommendations(smartRecs);
    } catch (error) {
      toast.error('Erreur lors du chargement des recommandations');
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study': return <BookOpen className="h-4 w-4" />;
      case 'music': return <Activity className="h-4 w-4" />;
      case 'break': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-purple-900">Moteur de Recommandations IA</CardTitle>
              <CardDescription className="text-purple-700">
                Algorithmes adaptatifs basés sur vos patterns d'apprentissage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommandations
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Profil IA
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recommandations Personnalisées</h3>
            <Button 
              onClick={loadSmartRecommendations} 
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isLoading ? 'Génération...' : 'Actualiser IA'}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {rec.confidence}% confiance
                  </Badge>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(rec.type)}
                    <CardTitle className="text-sm">{rec.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    {rec.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Impact:</span>
                    <span className={`font-medium ${getImpactColor(rec.impact)}`}>
                      {rec.impact.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Durée:</span>
                    <span className="font-medium">{rec.timeToComplete}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Score Personnel</span>
                      <span className="font-medium">{rec.personalizedScore}%</span>
                    </div>
                    <Progress value={rec.personalizedScore} className="h-2" />
                  </div>
                  
                  <div className="p-2 bg-gray-50 rounded text-xs">
                    <strong>IA Reasoning:</strong> {rec.aiReasoning}
                  </div>
                  
                  <Button size="sm" className="w-full">
                    Appliquer Recommandation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profil d'Apprentissage IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Heures d'étude/jour</label>
                  <div className="text-2xl font-bold text-blue-600">{userProfile.studyHours}h</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Score Performance</label>
                  <div className="text-2xl font-bold text-green-600">{userProfile.performanceScore}%</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Niveau de Stress</label>
                <Progress value={50} className="h-3" />
                <span className="text-sm text-muted-foreground">Modéré - Optimisations recommandées</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">94%</div>
                    <div className="text-sm text-muted-foreground">Précision IA</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">+23%</div>
                    <div className="text-sm text-muted-foreground">Amélioration</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">Recommandations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIRecommendationsEngine;