import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Target,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Music,
  BookOpen
} from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAPI';
import { useToast } from '@/hooks/use-toast';
import { useBreakpoints } from '@/hooks/useBreakpoints';

interface Recommendation {
  title: string;
  description: string;
  type: 'next_topic' | 'similar_content' | 'review';
  relevance_score: number;
  difficulty: string;
  estimated_time: number;
  tags: string[];
  action?: () => void;
}

interface AIRecommendationsProps {
  currentTopic?: string;
  userHistory?: any[];
  className?: string;
  variant?: 'compact' | 'full';
}

export const AIRecommendations = ({ 
  currentTopic, 
  userHistory = [], 
  className = '',
  variant = 'full' 
}: AIRecommendationsProps) => {
  const { toast } = useToast();
  const { isMobile, isTablet } = useBreakpoints();
  const { data, loading, getRecommendations } = useAIRecommendations();
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeType, setActiveType] = useState<'next_topics' | 'similar_content' | 'review_suggestions'>('next_topics');

  useEffect(() => {
    loadRecommendations();
  }, [currentTopic, activeType]);

  const loadRecommendations = async () => {
    try {
      const result = await getRecommendations({
        current_topic: currentTopic,
        learning_history: userHistory,
        recommendation_type: activeType,
        user_id: 'current-user' // À remplacer par l'ID utilisateur réel
      });

      if (result.success && result.data?.recommendations) {
        // Simuler des recommandations structurées si l'API retourne du texte
        const mockRecommendations: Recommendation[] = [
          {
            title: "Cardiologie Avancée",
            description: "Approfondir l'insuffisance cardiaque et les arythmies",
            type: "next_topic",
            relevance_score: 95,
            difficulty: "Avancé",
            estimated_time: 45,
            tags: ["cardiologie", "physiopathologie", "urgences"]
          },
          {
            title: "Neurologie Clinique",
            description: "Exploration des AVC et neuropathies",
            type: "next_topic",
            relevance_score: 88,
            difficulty: "Expert",
            estimated_time: 60,
            tags: ["neurologie", "diagnostic", "imagerie"]
          },
          {
            title: "Révision Pneumologie",
            description: "Consolider vos connaissances sur l'asthme",
            type: "review",
            relevance_score: 82,
            difficulty: "Intermédiaire",
            estimated_time: 30,
            tags: ["pneumologie", "révision", "therapeutique"]
          }
        ];
        
        setRecommendations(mockRecommendations);
      }
    } catch (error) {
      console.error('Erreur chargement recommandations:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'next_topics': return <TrendingUp className="h-4 w-4" />;
      case 'similar_content': return <BookOpen className="h-4 w-4" />;
      case 'review_suggestions': return <RefreshCw className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'next_topics': return 'Prochains sujets';
      case 'similar_content': return 'Contenu similaire';
      case 'review_suggestions': return 'À réviser';
      default: return 'Recommandations';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleRecommendationClick = (rec: Recommendation) => {
    toast({
      title: "🧠 Recommandation sélectionnée",
      description: `Chargement de ${rec.title}...`,
    });

    // Action spécifique selon le type
    if (rec.action) {
      rec.action();
    } else {
      // Action par défaut - redirection vers création
      setTimeout(() => {
        window.location.href = `/med-mng/create?topic=${encodeURIComponent(rec.title)}`;
      }, 1000);
    }
  };

  if (variant === 'compact') {
    return (
      <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>IA Recommande</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : (
              recommendations.slice(0, 2).map((rec, index) => (
                <div 
                  key={index}
                  onClick={() => handleRecommendationClick(rec)}
                  className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg cursor-pointer hover:from-purple-100 hover:to-blue-100 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-800">{rec.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                    </div>
                    <div className="ml-3 text-right">
                      <Badge className={`text-xs ${getRelevanceColor(rec.relevance_score)}`}>
                        {rec.relevance_score}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Recommandations IA</span>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={loadRecommendations}
            disabled={loading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
        </div>

        {/* Filtres de type */}
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'} mt-4`}>
          {['next_topics', 'similar_content', 'review_suggestions'].map((type) => (
            <Button
              key={type}
              size="sm"
              variant={activeType === type ? 'default' : 'outline'}
              onClick={() => setActiveType(type as any)}
              className={`flex items-center space-x-1 ${isMobile ? 'justify-start' : ''}`}
            >
              {getTypeIcon(type)}
              <span>{getTypeLabel(type)}</span>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className={`grid gap-4 ${
          isMobile 
            ? 'grid-cols-1' 
            : isTablet 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
        }`}>
          {loading ? (
            // Skeleton loader
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg"></div>
              </div>
            ))
          ) : recommendations.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune recommandation disponible pour le moment</p>
              <Button
                onClick={loadRecommendations}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <Card 
                key={index}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-white to-purple-50"
                onClick={() => handleRecommendationClick(rec)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header avec score */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {rec.type === 'next_topic' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                        {rec.type === 'similar_content' && <BookOpen className="h-4 w-4 text-green-600" />}
                        {rec.type === 'review' && <RefreshCw className="h-4 w-4 text-orange-600" />}
                        <Badge className={`text-xs ${getRelevanceColor(rec.relevance_score)}`}>
                          {rec.relevance_score}%
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>

                    {/* Titre et description */}
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                        {rec.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {rec.description}
                      </p>
                    </div>

                    {/* Métadonnées */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          {rec.difficulty}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {rec.estimated_time} min
                        </span>
                      </div>

                      {/* Barre de pertinence */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Pertinence</span>
                          <span className="font-medium">{rec.relevance_score}%</span>
                        </div>
                        <Progress 
                          value={rec.relevance_score} 
                          className="h-2"
                        />
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rec.tags.slice(0, isMobile ? 2 : 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {rec.tags.length > (isMobile ? 2 : 3) && (
                          <Badge variant="outline" className="text-xs">
                            +{rec.tags.length - (isMobile ? 2 : 3)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Action globale */}
        {recommendations.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Voir toutes les recommandations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};