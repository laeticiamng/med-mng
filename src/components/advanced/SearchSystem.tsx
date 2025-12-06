import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, Filter, Star, Clock, TrendingUp, 
  BookOpen, Music, Users, X
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: 'edn' | 'ecos' | 'music' | 'quiz';
  category: string;
  rating: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  description: string;
  tags: string[];
  trending?: boolean;
  new?: boolean;
}

interface SearchSystemProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export const SearchSystem: React.FC<SearchSystemProps> = ({
  onResultSelect,
  placeholder = "Rechercher des contenus médicaux...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    'Cardiologie ECG', 'ECOS urgences', 'Neurologie items', 'Pédiatrie quiz'
  ]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock results pour démo
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'ECG et troubles du rythme',
      type: 'edn',
      category: 'Cardiologie',
      rating: 4.8,
      difficulty: 'intermediate',
      duration: 45,
      description: 'Compréhension approfondie des ECG et identification des troubles rythmiques',
      tags: ['ECG', 'Cardiologie', 'Diagnostic'],
      trending: true
    },
    {
      id: '2', 
      title: 'Simulation ECOS - Urgences pédiatriques',
      type: 'ecos',
      category: 'Pédiatrie',
      rating: 4.9,
      difficulty: 'advanced',
      duration: 30,
      description: 'Cas clinique urgent en pédiatrie avec approche diagnostique',
      tags: ['Urgences', 'Pédiatrie', 'Simulation'],
      new: true
    },
    {
      id: '3',
      title: 'Mémorisation anatomie - Système nerveux',
      type: 'music',
      category: 'Neurologie',
      rating: 4.7,
      difficulty: 'beginner',
      duration: 25,
      description: 'Musique mnémotechnique pour retenir l\'anatomie du système nerveux',
      tags: ['Anatomie', 'Neurologie', 'Mémorisation']
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulation d'API call
    setTimeout(() => {
      const filtered = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setResults(filtered);
      setIsLoading(false);
    }, 300);

    // Sauvegarder dans les recherches récentes
    const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recent-searches', JSON.stringify(newRecent));
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowResults(true);
    handleSearch(value);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    setShowResults(false);
    setQuery('');
  };

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'edn': return <BookOpen className="w-4 h-4" />;
      case 'ecos': return <Users className="w-4 h-4" />;
      case 'music': return <Music className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: SearchResult['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* Input de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="pl-10 pr-12 h-12 text-lg border-2 focus:border-primary"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Résultats de recherche */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {/* Recherches rapides */}
            {!query && (
              <div className="p-4 border-b">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recherches populaires
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <Badge
                      key={search}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleQuickSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recherches récentes */}
            {!query && recentSearches.length > 0 && (
              <div className="p-4 border-b">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recherches récentes
                </h4>
                <div className="space-y-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleQuickSearch(search)}
                      className="block text-left w-full p-2 hover:bg-muted rounded text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && query && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Recherche en cours...</p>
              </div>
            )}

            {/* Résultats */}
            {!isLoading && query && results.length > 0 && (
              <div className="p-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getTypeIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium truncate">{result.title}</h5>
                          {result.trending && (
                            <Badge variant="secondary" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                          {result.new && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {result.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {result.rating}
                          </span>
                          <span>•</span>
                          <span>{result.category}</span>
                          <span>•</span>
                          <span>{result.duration} min</span>
                          <Badge variant="outline" className={`text-xs ${getDifficultyColor(result.difficulty)}`}>
                            {result.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Aucun résultat */}
            {!isLoading && query && results.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-muted-foreground">Aucun résultat trouvé pour "{query}"</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};