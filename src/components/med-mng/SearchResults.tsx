import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Play, 
  Heart, 
  Download, 
  Clock,
  Music,
  BookOpen,
  Users,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'song' | 'playlist' | 'course' | 'user';
  title: string;
  description: string;
  author: string;
  duration?: number;
  tags: string[];
  popularity: number;
  thumbnailUrl?: string;
  createdAt: Date;
}

interface SearchResultsProps {
  query: string;
  onQueryChange: (query: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  onQueryChange,
  isVisible,
  onClose
}) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'song' | 'playlist' | 'course' | 'user'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'recent'>('relevance');
  const { toast } = useToast();

  // Mock data for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'song',
      title: 'Anatomie du Cœur - Rythmique',
      description: 'Musique éducative pour mémoriser les parties du cœur humain',
      author: 'MED-MNG AI',
      duration: 180,
      tags: ['cardiologie', 'anatomie', 'cœur'],
      popularity: 95,
      createdAt: new Date(2024, 11, 5)
    },
    {
      id: '2',
      type: 'course',
      title: 'Cours Complet - Système Cardiovasculaire',
      description: 'Formation complète sur le système cardiovasculaire avec musiques mnémotechniques',
      author: 'Dr. Martin Leclerc',
      tags: ['cardiologie', 'formation', 'système'],
      popularity: 88,
      createdAt: new Date(2024, 11, 3)
    },
    {
      id: '3',
      type: 'playlist',
      title: 'Playlist Neurologie - Édition 2024',
      description: 'Collection de musiques éducatives pour la neurologie',
      author: 'Collectif MED-MNG',
      tags: ['neurologie', 'playlist', 'collection'],
      popularity: 92,
      createdAt: new Date(2024, 11, 1)
    }
  ];

  useEffect(() => {
    if (query.trim()) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const filtered = mockResults.filter(result => 
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        
        setResults(filtered);
        setLoading(false);
      }, 500);
    } else {
      setResults([]);
    }
  }, [query]);

  const filteredResults = results.filter(result => 
    selectedType === 'all' || result.type === selectedType
  ).sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.popularity - a.popularity;
      case 'recent':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'relevance':
      default:
        return b.popularity - a.popularity; // Simplified relevance
    }
  });

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'song': return <Music className="h-4 w-4" />;
      case 'playlist': return <BookOpen className="h-4 w-4" />;
      case 'course': return <Sparkles className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'song': return 'bg-blue-500';
      case 'playlist': return 'bg-green-500';
      case 'course': return 'bg-purple-500';
      case 'user': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handlePlay = (result: SearchResult) => {
    if (result.type === 'song') {
      toast({
        title: "Lecture en cours",
        description: `Lecture de "${result.title}"`
      });
    }
  };

  const handleFavorite = (result: SearchResult) => {
    toast({
      title: "Ajouté aux favoris",
      description: `"${result.title}" a été ajouté à vos favoris`
    });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute top-full left-0 right-0 mt-2 z-50"
    >
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Résultats de recherche
              {query && (
                <span className="text-base font-normal text-muted-foreground ml-2">
                  pour "{query}"
                </span>
              )}
            </CardTitle>
            <Badge variant="secondary">
              {filteredResults.length} résultat{filteredResults.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Tabs value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
              <TabsList className="grid grid-cols-5 w-full max-w-md">
                <TabsTrigger value="all" className="text-xs">Tout</TabsTrigger>
                <TabsTrigger value="song" className="text-xs">Musiques</TabsTrigger>
                <TabsTrigger value="playlist" className="text-xs">Playlists</TabsTrigger>
                <TabsTrigger value="course" className="text-xs">Cours</TabsTrigger>
                <TabsTrigger value="user" className="text-xs">Utilisateurs</TabsTrigger>
              </TabsList>
            </Tabs>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 text-sm border rounded-md bg-background ml-auto"
            >
              <option value="relevance">Pertinence</option>
              <option value="popularity">Popularité</option>
              <option value="recent">Plus récents</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Recherche en cours...</span>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Aucun résultat trouvé</p>
              <p className="text-sm">
                Essayez avec d'autres mots-clés ou modifiez vos filtres
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all hover:border-primary/20">
                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div className={`w-10 h-10 ${getTypeColor(result.type)} rounded-lg flex items-center justify-center text-white`}>
                        {getTypeIcon(result.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate">{result.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {result.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{result.author}</span>
                              {result.duration && (
                                <>
                                  <span>•</span>
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(result.duration)}</span>
                                </>
                              )}
                              <span>•</span>
                              <TrendingUp className="h-3 w-3" />
                              <span>{result.popularity}% pertinence</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1">
                            {result.type === 'song' && (
                              <Button
                                size="sm"
                                onClick={() => handlePlay(result)}
                                className="h-8 w-8 p-0"
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFavorite(result)}
                              className="h-8 w-8 p-0"
                            >
                              <Heart className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {result.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};