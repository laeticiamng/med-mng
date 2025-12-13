import React, { useState, useEffect } from 'react';
import { Search, Filter, History, Bookmark, Tag, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSearch, SearchFilters } from '@/hooks/useSearch';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

export const AdvancedSearch: React.FC = () => {
  const {
    results,
    loading,
    error,
    totalResults,
    searchHistory,
    suggestions,
    search,
    realtimeSearch,
    searchSuggestions,
    clearHistory,
    removeFromHistory
  } = useSearch();

  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [savedSearches, setSavedSearches] = useState<string[]>([]);

  const handleSearch = () => {
    if (query.trim()) {
      search(query, filters);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.length > 1) {
      searchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    search(suggestion, filters);
  };

  const selectFromHistory = (historyQuery: string) => {
    setQuery(historyQuery);
    search(historyQuery, filters);
  };

  const saveSearch = async () => {
    if (query.trim() && !savedSearches.includes(query)) {
      const newSaved = [...savedSearches, query];
      setSavedSearches(newSaved);
      
      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from('user_saved_searches').upsert({
          user_id: user.id,
          query: query,
          name: query,
          saved_at: new Date().toISOString()
        }, { onConflict: 'user_id,query' });
      } else {
        localStorage.setItem('saved-searches', JSON.stringify(newSaved));
      }
    }
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (query.trim()) {
      search(query, newFilters);
    }
  };

  const clearFilters = () => {
    setFilters({});
    if (query.trim()) {
      search(query, {});
    }
  };

  const getResultIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      music: '🎵',
      edn: '📚',
      quiz: '❓',
      article: '📄',
      video: '🎥',
      default: '📄'
    };
    return iconMap[category] || iconMap.default;
  };

  // Load saved searches from Supabase
  useEffect(() => {
    const loadSavedSearches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const saved = localStorage.getItem('saved-searches');
        if (saved) setSavedSearches(JSON.parse(saved));
        return;
      }
      
      const { data } = await (supabase as any)
        .from('user_saved_searches')
        .select('query')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });
      
      if (data) {
        setSavedSearches(data.map((d: any) => d.query));
      }
    };
    loadSavedSearches();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Barre de recherche principale */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Rechercher dans tout le contenu..."
                  className="pl-10"
                />
                
                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <Card className="absolute top-full left-0 right-0 z-50 mt-1">
                    <CardContent className="p-2">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => selectSuggestion(suggestion)}
                          className="px-3 py-2 hover:bg-muted rounded cursor-pointer text-sm"
                        >
                          <Search className="inline h-3 w-3 mr-2" />
                          {suggestion}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Recherche...' : 'Rechercher'}
              </Button>
              
              <Button
                variant="outline"
                onClick={saveSearch}
                disabled={!query.trim()}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtres et historique */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="category">
                  <AccordionTrigger>Catégorie</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {['music', 'edn', 'quiz', 'article'].map(category => (
                        <label key={category} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="category"
                            checked={filters.category === category}
                            onChange={() => updateFilter('category', category)}
                          />
                          <span className="text-sm capitalize">{category}</span>
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="rating">
                  <AccordionTrigger>Note minimum</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <label key={rating} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="rating"
                            checked={filters.rating === rating}
                            onChange={() => updateFilter('rating', rating)}
                          />
                          <div className="flex">
                            {[...Array(rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                            ))}
                          </div>
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="date">
                  <AccordionTrigger>Période</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {[
                        { label: 'Aujourd\'hui', days: 1 },
                        { label: 'Cette semaine', days: 7 },
                        { label: 'Ce mois', days: 30 },
                        { label: 'Cette année', days: 365 }
                      ].map(period => (
                        <label key={period.label} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="period"
                            onChange={() => {
                              const end = new Date();
                              const start = new Date();
                              start.setDate(start.getDate() - period.days);
                              updateFilter('dateRange', { start, end });
                            }}
                          />
                          <span className="text-sm">{period.label}</span>
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full mt-4"
              >
                Effacer les filtres
              </Button>
            </CardContent>
          </Card>

          {/* Historique et recherches sauvegardées */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="history">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="history">
                    <History className="h-4 w-4 mr-1" />
                    Historique
                  </TabsTrigger>
                  <TabsTrigger value="saved">
                    <Bookmark className="h-4 w-4 mr-1" />
                    Sauvées
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                  <div className="space-y-2">
                    {searchHistory.length > 0 ? (
                      <>
                        {searchHistory.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => selectFromHistory(item)}
                            className="p-2 hover:bg-muted rounded cursor-pointer text-sm flex items-center justify-between"
                          >
                            <span>{item}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromHistory(item);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearHistory}
                          className="w-full"
                        >
                          Vider l'historique
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune recherche récente
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="saved">
                  <div className="space-y-2">
                    {savedSearches.length > 0 ? (
                      savedSearches.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => selectFromHistory(item)}
                          className="p-2 hover:bg-muted rounded cursor-pointer text-sm"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune recherche sauvegardée
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Résultats */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Résultats de recherche
                  {totalResults > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({totalResults} résultat{totalResults > 1 ? 's' : ''})
                    </span>
                  )}
                </CardTitle>
                
                {Object.keys(filters).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.category && (
                      <Badge variant="secondary">
                        {filters.category}
                      </Badge>
                    )}
                    {filters.rating && (
                      <Badge variant="secondary">
                        {filters.rating}+ étoiles
                      </Badge>
                    )}
                    {filters.dateRange && (
                      <Badge variant="secondary">
                        <Calendar className="h-3 w-3 mr-1" />
                        Période
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {error ? (
                <div className="text-center py-8 text-destructive">
                  Erreur: {error}
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : results.length === 0 && query ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun résultat trouvé pour "{query}"
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => window.open(result.url, '_blank')}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">
                            {getResultIcon(result.category)}
                          </span>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm">
                                {result.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {result.category}
                              </Badge>
                              {result.rating && (
                                <div className="flex">
                                  {[...Array(Math.floor(result.rating))].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {result.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-4">
                                {result.author && (
                                  <span>Par {result.author}</span>
                                )}
                                <span>
                                  {formatDistanceToNow(result.createdAt, { 
                                    addSuffix: true, 
                                    locale: fr 
                                  })}
                                </span>
                                {result.duration && (
                                  <span>{result.duration}s</span>
                                )}
                              </div>
                              
                              {result.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {result.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      <Tag className="h-2 w-2 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};