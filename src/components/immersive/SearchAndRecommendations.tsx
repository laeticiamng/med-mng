import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Sparkles, TrendingUp, Clock, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'item' | 'specialty' | 'topic';
  description: string;
  popularity: number;
  difficulty: string;
}

interface Recommendation {
  id: string;
  title: string;
  reason: string;
  style: string;
  estimated_time: string;
}

export const SearchAndRecommendations: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Résultats de recherche simulés
  const mockSearchResults: SearchResult[] = [
    {
      id: 'ic-221',
      title: 'IC-221 - Hypertension artérielle',
      type: 'item',
      description: 'Hypertension artérielle de l\'adulte - Diagnostic et traitement',
      popularity: 95,
      difficulty: 'Intermédiaire'
    },
    {
      id: 'cardio',
      title: 'Cardiologie',
      type: 'specialty',
      description: '45 items de connaissances en cardiologie',
      popularity: 88,
      difficulty: 'Avancé'
    },
    {
      id: 'ic-232',
      title: 'IC-232 - Insuffisance cardiaque',
      type: 'item',
      description: 'Insuffisance cardiaque chronique et aiguë',
      popularity: 92,
      difficulty: 'Avancé'
    }
  ];

  // Recommandations personnalisées
  const mockRecommendations: Recommendation[] = [
    {
      id: 'rec-1',
      title: 'Arythmies Cardiaques Trap',
      reason: 'Basé sur votre intérêt pour la cardiologie',
      style: 'Trap',
      estimated_time: '4 min'
    },
    {
      id: 'rec-2',
      title: 'Neurologie Cognitive Lo-Fi',
      reason: 'Complément à vos dernières révisions',
      style: 'Lo-Fi',
      estimated_time: '6 min'
    },
    {
      id: 'rec-3',
      title: 'Pharmacologie Pop',
      reason: 'Sujet populaire cette semaine',
      style: 'Pop',
      estimated_time: '3 min'
    }
  ];

  useEffect(() => {
    setRecommendations(mockRecommendations);
  }, []);

  // Recherche en temps réel
  useEffect(() => {
    if (searchTerm.length > 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = mockSearchResults.filter(result =>
          result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleSearch = (result: SearchResult) => {
    toast({
      title: "🎵 Création en cours",
      description: `Génération d'une musique pour: ${result.title}`,
    });
    navigate('/med-mng/create', { state: { selectedTopic: result } });
  };

  const handleRecommendation = (rec: Recommendation) => {
    toast({
      title: "✨ Recommandation sélectionnée",
      description: `Génération: ${rec.title}`,
    });
    navigate('/med-mng/create', { state: { recommendation: rec } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Barre de recherche intelligente */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
          <Input
            type="text"
            placeholder="Rechercher un item EDN, une spécialité ou un sujet médical..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300 text-base"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Suggestions populaires */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['Cardiologie', 'Neurologie', 'IC-232', 'Pneumologie', 'Diabète'].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm(suggestion)}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Résultats de recherche
          </h3>
          <div className="grid gap-3">
            {searchResults.map((result) => (
              <Card
                key={result.id}
                className="bg-black/20 backdrop-blur-xl border border-white/10 hover:border-pink-400/50 cursor-pointer transition-all duration-300 hover:shadow-lg"
                onClick={() => handleSearch(result)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{result.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{result.description}</p>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                          {result.type === 'item' ? 'Item EDN' : result.type === 'specialty' ? 'Spécialité' : 'Sujet'}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs">
                          {result.difficulty}
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs">
                          {result.popularity}% popularité
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                      Créer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommandations IA */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-pink-400" />
          Recommandations IA personnalisées
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              className="bg-black/20 backdrop-blur-xl border border-white/10 hover:border-purple-400/50 cursor-pointer transition-all duration-300 hover:shadow-lg group"
              onClick={() => handleRecommendation(rec)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-gray-300 text-sm">{rec.reason}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30 text-xs">
                        {rec.style}
                      </Badge>
                      <span className="text-xs text-white/70 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {rec.estimated_time}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20">
                      <Target className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};