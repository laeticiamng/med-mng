import React, { useState, useEffect } from 'react';
import { Search, Music, Book, Users, BarChart3, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'content' | 'user' | 'feature';
  url: string;
  category: string;
  icon: React.ComponentType<any>;
}

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  // Données de recherche simulées
  const searchData: SearchResult[] = [
    {
      id: '1',
      title: 'Générateur Musical IA',
      description: 'Créez des musiques éducatives personnalisées',
      type: 'page',
      url: '/generator',
      category: 'Création',
      icon: Music
    },
    {
      id: '2',
      title: 'Bibliothèque Musicale',
      description: 'Accédez à toutes vos créations musicales',
      type: 'page',
      url: '/library',
      category: 'Collection',
      icon: Music
    },
    {
      id: '3',
      title: 'Scénarios ECOS',
      description: 'Simulations cliniques immersives',
      type: 'content',
      url: '/ecos',
      category: 'Apprentissage',
      icon: Book
    },
    {
      id: '4',
      title: 'Analytics & Statistiques',
      description: 'Suivez vos performances et progrès',
      type: 'page',
      url: '/analytics',
      category: 'Données',
      icon: BarChart3
    },
    {
      id: '5',
      title: 'Assistant IA Médical',
      description: 'Chat intelligent spécialisé en médecine',
      type: 'feature',
      url: '/med-chat',
      category: 'IA',
      icon: Book
    },
    {
      id: '6',
      title: 'IC-103 Vertige',
      description: 'Item EDN sur les vertiges et troubles de l\'équilibre',
      type: 'content',
      url: '/edn-item/IC-103',
      category: 'EDN',
      icon: Book
    },
    {
      id: '7',
      title: 'Administration',
      description: 'Gestion et supervision du système',
      type: 'page',
      url: '/admin',
      category: 'Système',
      icon: Settings
    },
    {
      id: '8',
      title: 'Export & Rapports',
      description: 'Exportation des données et génération de rapports',
      type: 'feature',
      url: '/export',
      category: 'Outils',
      icon: BarChart3
    }
  ];

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Simulation d'une recherche
    setTimeout(() => {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      setResults(filtered);
      setIsLoading(false);
    }, 200);
  }, [debouncedQuery]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page': return 'bg-blue-100 text-blue-800';
      case 'content': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      case 'feature': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'page': return 'Page';
      case 'content': return 'Contenu';
      case 'user': return 'Utilisateur';
      case 'feature': return 'Fonctionnalité';
      default: return type;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 w-64"
        />
      </div>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setQuery('');
            }}
          />
          
          {/* Results */}
          <div className="absolute top-full mt-2 w-96 z-50">
            <Card className="shadow-lg border-0 bg-background/95 backdrop-blur-sm">
              <CardContent className="p-0">
                {!query.trim() ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tapez pour rechercher...</p>
                    <p className="text-xs mt-1">Pages, contenus, fonctionnalités</p>
                  </div>
                ) : isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Recherche...</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun résultat trouvé</p>
                    <p className="text-xs mt-1">Essayez avec d'autres termes</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-96">
                    <div className="p-2">
                      <div className="text-xs text-muted-foreground mb-2 px-2">
                        {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                      </div>
                      <div className="space-y-1">
                        {results.map((result) => (
                          <Button
                            key={result.id}
                            variant="ghost"
                            className="w-full justify-start h-auto p-3 hover:bg-muted/50"
                            onClick={() => handleResultClick(result)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="p-2 bg-muted rounded-lg">
                                <result.icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium truncate">
                                    {result.title}
                                  </h4>
                                  <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                                    {getTypeLabel(result.type)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {result.category}
                                </p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};