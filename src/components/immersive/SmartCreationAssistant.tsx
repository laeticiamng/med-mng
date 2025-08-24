import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Brain, Zap, Target, Clock, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreationSuggestion {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  popularity: number;
  aiConfidence: number;
  tags: string[];
}

interface SmartCreationAssistantProps {
  onSuggestionSelect: (suggestion: CreationSuggestion) => void;
  currentContent?: string;
  userPreferences?: any;
}

export const SmartCreationAssistant: React.FC<SmartCreationAssistantProps> = ({
  onSuggestionSelect,
  currentContent,
  userPreferences
}) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<CreationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Suggestions intelligentes basées sur l'IA
  const mockSuggestions: CreationSuggestion[] = [
    {
      id: 'sug-1',
      title: 'Diabète Type 2 - Style Afrobeat',
      description: 'Optimisé pour la mémorisation des critères diagnostiques et du traitement',
      difficulty: 'Intermédiaire',
      estimatedTime: '4-5 min',
      popularity: 94,
      aiConfidence: 96,
      tags: ['endocrinologie', 'diabète', 'diagnostic']
    },
    {
      id: 'sug-2',
      title: 'Arythmies Cardiaques - Lo-Fi Étude',
      description: 'Parfait pour réviser les différents types d\'arythmies en mode concentration',
      difficulty: 'Avancé',
      estimatedTime: '6-7 min',
      popularity: 89,
      aiConfidence: 92,
      tags: ['cardiologie', 'arythmies', 'ECG']
    },
    {
      id: 'sug-3',
      title: 'Antibiothérapie - Pop Médical',
      description: 'Mémorisation optimale des indications et posologies principales',
      difficulty: 'Intermédiaire',
      estimatedTime: '3-4 min',
      popularity: 91,
      aiConfidence: 88,
      tags: ['infectiologie', 'antibiotiques', 'pharmacologie']
    }
  ];

  // Simulation de l'analyse IA
  useEffect(() => {
    if (currentContent) {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsAnalyzing(false);
            setSuggestions(mockSuggestions);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setSuggestions(mockSuggestions);
    }
  }, [currentContent]);

  const handleSuggestionClick = (suggestion: CreationSuggestion) => {
    toast({
      title: "🧠 Suggestion IA sélectionnée",
      description: `Préparation de: ${suggestion.title}`,
    });
    onSuggestionSelect(suggestion);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'débutant': return 'bg-green-100 text-green-800';
      case 'intermédiaire': return 'bg-blue-100 text-blue-800';
      case 'avancé': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <span>Assistant IA de Création</span>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            Smart
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Analyse IA en cours...</h3>
              <p className="text-gray-600 text-sm mb-4">
                L'IA analyse votre contenu pour générer des suggestions optimisées
              </p>
              <Progress value={analysisProgress} className="mb-2" />
              <p className="text-xs text-gray-500">{analysisProgress}% complété</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-gray-800">Suggestions optimisées</span>
              </div>
              <p className="text-sm text-gray-600">
                Basées sur vos préférences, votre historique et les dernières recherches en neurosciences
              </p>
            </div>

            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-300 border-l-4 border-l-purple-500"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {suggestion.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {suggestion.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={getDifficultyColor(suggestion.difficulty)}>
                            {suggestion.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {suggestion.estimatedTime}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Target className="h-3 w-3 mr-1" />
                            {suggestion.popularity}% popularité
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-2">
                          <Zap className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">
                            {suggestion.aiConfidence}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">IA Confiance</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {suggestion.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Brain className="h-4 w-4 mr-2" />
              Générer plus de suggestions IA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};