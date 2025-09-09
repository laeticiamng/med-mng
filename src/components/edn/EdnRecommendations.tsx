import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, TrendingUp, Clock, Heart, 
  Star, BookOpen, Music, Brain 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendedItem {
  slug: string;
  title: string;
  item_code: string;
  score: number;
  reason: string;
  category: 'trending' | 'personalized' | 'similar' | 'recent';
  hasMusic: boolean;
  difficulty: 'A' | 'B';
}

export const EdnRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleToggleFavorite = (itemCode: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemCode)) {
        newFavorites.delete(itemCode);
      } else {
        newFavorites.add(itemCode);
      }
      return newFavorites;
    });
  };

  useEffect(() => {
    // Simulation de données de recommandations personnalisées
    const mockRecommendations: RecommendedItem[] = [
      {
        slug: 'cardio-001',
        title: 'Insuffisance cardiaque aigüe',
        item_code: 'CARD001',
        score: 95,
        reason: 'Basé sur votre activité récente',
        category: 'personalized',
        hasMusic: true,
        difficulty: 'A'
      },
      {
        slug: 'neuro-004',
        title: 'AVC ischémique',
        item_code: 'NEUR004',
        score: 88,
        reason: 'Populaire cette semaine',
        category: 'trending',
        hasMusic: true,
        difficulty: 'A'
      },
      {
        slug: 'resp-002',
        title: 'Pneumonie communautaire',
        item_code: 'RESP002',
        score: 82,
        reason: 'Items similaires consultés',
        category: 'similar',
        hasMusic: false,
        difficulty: 'B'
      }
    ];

    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 1000);
  }, []);

  const getCategoryIcon = (category: RecommendedItem['category']) => {
    switch (category) {
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      case 'personalized': return <Sparkles className="h-4 w-4" />;
      case 'similar': return <Brain className="h-4 w-4" />;
      case 'recent': return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: RecommendedItem['category']) => {
    switch (category) {
      case 'trending': return 'from-red-500/20 to-orange-500/20 border-red-400/30';
      case 'personalized': return 'from-purple-500/20 to-pink-500/20 border-purple-400/30';
      case 'similar': return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
      case 'recent': return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Recommandations Personnalisées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
          Recommandations Personnalisées
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((item, index) => (
          <div
            key={item.slug}
            className={`bg-gradient-to-r ${getCategoryColor(item.category)} rounded-lg p-4 border hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}
            onClick={() => navigate(`/edn/${item.slug}`)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getCategoryIcon(item.category)}
                <Badge 
                  variant="outline" 
                  className="text-xs border-white/30 text-white/80"
                >
                  {item.item_code}
                </Badge>
                <Badge 
                  variant={item.difficulty === 'A' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  Rang {item.difficulty}
                </Badge>
                {item.hasMusic && (
                  <Music className="h-3 w-3 text-purple-400" />
                )}
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs font-medium">{item.score}%</span>
              </div>
            </div>
            
            <h4 className="text-white font-medium mb-2 group-hover:text-purple-200 transition-colors">
              {item.title}
            </h4>
            
            <p className="text-xs text-gray-300 mb-3">{item.reason}</p>
            
            <div className="flex items-center justify-between">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edn/${item.slug}`);
                }}
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Étudier
              </Button>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-red-300 hover:text-red-200 hover:bg-red-500/20 p-2 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(item.item_code);
                }}
              >
                <Heart className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full mt-4 text-white border-white/30 hover:bg-white/10"
          onClick={() => navigate('/features')}
        >
          Voir toutes les recommandations
        </Button>
      </CardContent>
    </Card>
  );
};