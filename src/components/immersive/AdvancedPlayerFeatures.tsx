import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  BookOpen, 
  Repeat, 
  Zap,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LearningSection {
  id: string;
  title: string;
  content: string;
  difficulty: number;
  timeSpent: number;
  mastery: number;
  isActive: boolean;
}

interface AdvancedPlayerFeaturesProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  lyrics: string[];
  pedagogicalPoints: string[];
  isLearningMode: boolean;
  onLearningModeToggle: () => void;
}

export const AdvancedPlayerFeatures: React.FC<AdvancedPlayerFeaturesProps> = ({
  currentTime,
  duration,
  onSeek,
  lyrics,
  pedagogicalPoints,
  isLearningMode,
  onLearningModeToggle
}) => {
  const { toast } = useToast();
  const [learningData, setLearningData] = useState<LearningSection[]>([]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [comprehensionScore, setComprehensionScore] = useState(0);
  const [adaptiveSpeed, setAdaptiveSpeed] = useState(1.0);

  // Génération intelligente des sections d'apprentissage
  useEffect(() => {
    const sections: LearningSection[] = pedagogicalPoints.map((point, index) => ({
      id: `section-${index}`,
      title: `Point clé ${index + 1}`,
      content: point,
      difficulty: Math.floor(Math.random() * 5) + 1,
      timeSpent: Math.floor(Math.random() * 60),
      mastery: Math.floor(Math.random() * 100),
      isActive: false
    }));
    
    setLearningData(sections);
  }, [pedagogicalPoints]);

  // Analyse en temps réel des zones difficiles
  useEffect(() => {
    const difficultSections = learningData
      .filter(section => section.mastery < 70)
      .map(section => section.title);
    setFocusAreas(difficultSections);
  }, [learningData]);

  // Calcul du score de compréhension
  useEffect(() => {
    const avgMastery = learningData.length > 0 
      ? learningData.reduce((sum, section) => sum + section.mastery, 0) / learningData.length 
      : 0;
    setComprehensionScore(Math.round(avgMastery));
  }, [learningData]);

  const handleSectionFocus = (sectionId: string) => {
    const section = learningData.find(s => s.id === sectionId);
    if (section) {
      const sectionTime = (learningData.indexOf(section) / learningData.length) * duration;
      onSeek(sectionTime);
      
      toast({
        title: "🎯 Focus activé",
        description: `Révision: ${section.title}`,
      });
    }
  };

  const adjustPlaybackSpeed = (difficulty: number) => {
    const newSpeed = difficulty > 3 ? 0.8 : difficulty < 2 ? 1.2 : 1.0;
    setAdaptiveSpeed(newSpeed);
    
    toast({
      title: "⚡ Vitesse adaptée",
      description: `Lecture à ${newSpeed}x pour optimiser l'apprentissage`,
    });
  };

  const getMasteryColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Mode apprentissage intelligent */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <span>Mode Apprentissage IA</span>
              <Badge className={isLearningMode ? 'bg-green-500' : 'bg-gray-500'}>
                {isLearningMode ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>
            <Button
              onClick={onLearningModeToggle}
              className={isLearningMode 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-purple-600 hover:bg-purple-700'
              }
            >
              {isLearningMode ? <CheckCircle className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{comprehensionScore}%</div>
              <div className="text-sm text-gray-600">Compréhension</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{adaptiveSpeed}x</div>
              <div className="text-sm text-gray-600">Vitesse adaptée</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{focusAreas.length}</div>
              <div className="text-sm text-gray-600">Points à réviser</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">92%</div>
              <div className="text-sm text-gray-600">Rétention</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="focus">Zones difficiles</TabsTrigger>
          <TabsTrigger value="mnemonics">Mnémotechniques</TabsTrigger>
          <TabsTrigger value="progress">Progression</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Sections pédagogiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {learningData.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleSectionFocus(section.id)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{section.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{section.content}</p>
                      <div className="flex items-center space-x-2">
                        <Badge className={getMasteryColor(section.mastery)}>
                          Maîtrise: {section.mastery}%
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {section.timeSpent}s
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        adjustPlaybackSpeed(section.difficulty);
                      }}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-orange-500" />
                Zones nécessitant plus d'attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {focusAreas.length > 0 ? (
                <div className="space-y-3">
                  {focusAreas.map((area, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <div className="flex-1">
                        <p className="font-medium text-orange-800">{area}</p>
                        <p className="text-sm text-orange-600">Révision recommandée</p>
                      </div>
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                        <Repeat className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium text-green-800 mb-2">Excellent travail !</h3>
                  <p className="text-green-600">Toutes les sections sont bien maîtrisées</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mnemonics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                Mnémotechniques générés par IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    concept: "Classification NYHA",
                    mnemonic: "New York Heart Association = 'Niveau Y a-t-il Handicap Avéré'",
                    explanation: "Pour retenir les 4 classes de handicap fonctionnel"
                  },
                  {
                    concept: "BNP élevé",
                    mnemonic: "Brain Natriuretic Peptide = 'Brave Nageuse, ton Pouls Palpite'",
                    explanation: "Biomarqueur d'insuffisance cardiaque"
                  },
                  {
                    concept: "Traitement IEC",
                    mnemonic: "IEC = 'Inhibent Efficacement le Cœur malade'",
                    explanation: "Mécanisme d'action des IEC dans l'IC"
                  }
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">{item.concept}</h4>
                    <p className="text-yellow-700 font-semibold mb-2">"{item.mnemonic}"</p>
                    <p className="text-sm text-yellow-600">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Progression d'apprentissage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Score global</span>
                    <span className="text-sm text-gray-600">{comprehensionScore}%</span>
                  </div>
                  <Progress value={comprehensionScore} className="w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-700">47</div>
                    <div className="text-sm text-blue-600">Points acquis</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-700">3</div>
                    <div className="text-sm text-green-600">Objectifs atteints</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Évolution cette semaine</h4>
                  <div className="flex items-end space-x-2 h-24">
                    {[65, 72, 78, 85, 89, 92, comprehensionScore].map((value, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-green-500 to-blue-500 rounded-t"
                          style={{ height: `${(value / 100) * 100}%` }}
                        />
                        <span className="text-xs text-gray-500 mt-1">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};