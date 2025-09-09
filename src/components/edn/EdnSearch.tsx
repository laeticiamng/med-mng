import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  BookOpen, 
  Music, 
  Brain, 
  Play,
  Target,
  Clock,
  Star,
  Bookmark,
  X,
  Sparkles
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  query: string;
  category: string;
  difficulty: string;
  hasMusic: boolean | null;
  hasScene: boolean | null;
  hasQuiz: boolean | null;
  completionRate: string;
  duration: string;
  sortBy: 'relevance' | 'title' | 'difficulty' | 'completion' | 'recent';
  sortOrder: 'asc' | 'desc';
}

interface EdnSearchItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  hasMusic: boolean;
  hasScene: boolean;
  hasQuiz: boolean;
  completionRate: number;
  estimatedDuration: number; // en minutes
  rating: number;
  isBookmarked: boolean;
  lastUpdated: string;
  tags: string[];
  description?: string;
}

interface EdnSearchProps {
  onItemSelect?: (item: EdnSearchItem) => void;
  showFilters?: boolean;
  compact?: boolean;
}

export const EdnSearch: React.FC<EdnSearchProps> = ({
  onItemSelect,
  showFilters = true,
  compact = false
}) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    difficulty: 'all',
    hasMusic: null,
    hasScene: null,
    hasQuiz: null,
    completionRate: 'all',
    duration: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const [searchResults, setSearchResults] = useState<EdnSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Données simulées pour la démonstration
  const mockItems: EdnSearchItem[] = [
    {
      id: '1',
      item_code: 'IC-001',
      title: 'Insuffisance cardiaque aiguë',
      subtitle: 'Diagnostic et prise en charge',
      slug: 'insuffisance-cardiaque-aigue',
      category: 'Cardiologie',
      difficulty: 'moyen',
      hasMusic: true,
      hasScene: true,
      hasQuiz: true,
      completionRate: 87,
      estimatedDuration: 45,
      rating: 4.5,
      isBookmarked: false,
      lastUpdated: '2024-01-15',
      tags: ['urgence', 'diagnostic', 'traitement'],
      description: 'Approche systématique du diagnostic et de la prise en charge de l\'insuffisance cardiaque aiguë'
    },
    {
      id: '2',
      item_code: 'IC-002',
      title: 'Pneumonie communautaire',
      subtitle: 'Évaluation et antibiothérapie',
      slug: 'pneumonie-communautaire',
      category: 'Pneumologie',
      difficulty: 'facile',
      hasMusic: true,
      hasScene: false,
      hasQuiz: true,
      completionRate: 92,
      estimatedDuration: 30,
      rating: 4.7,
      isBookmarked: true,
      lastUpdated: '2024-01-12',
      tags: ['infection', 'antibiotiques', 'radiologie'],
      description: 'Diagnostic et traitement de la pneumonie acquise en communauté'
    },
    {
      id: '3',
      item_code: 'IC-003',
      title: 'AVC ischémique aigu',
      subtitle: 'Thrombolyse et thrombectomie',
      slug: 'avc-ischemique-aigu',
      category: 'Neurologie',
      difficulty: 'difficile',
      hasMusic: false,
      hasScene: true,
      hasQuiz: true,
      completionRate: 73,
      estimatedDuration: 60,
      rating: 4.3,
      isBookmarked: false,
      lastUpdated: '2024-01-10',
      tags: ['urgence', 'neurologie', 'imaging'],
      description: 'Prise en charge de l\'AVC ischémique en phase aiguë'
    }
  ];

  // Simulation des suggestions de recherche
  const mockSuggestions = [
    'insuffisance cardiaque',
    'pneumonie',
    'AVC aigu',
    'diagnostic différentiel',
    'urgences cardiologiques',
    'antibiothérapie',
    'imagerie médicale'
  ];

  // Recherche et filtrage
  const filteredResults = useMemo(() => {
    let results = mockItems;

    // Filtrage par requête
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      results = results.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    // Filtres additionnels
    if (filters.category !== 'all') {
      results = results.filter(item => item.category === filters.category);
    }

    if (filters.difficulty !== 'all') {
      results = results.filter(item => item.difficulty === filters.difficulty);
    }

    if (filters.hasMusic !== null) {
      results = results.filter(item => item.hasMusic === filters.hasMusic);
    }

    if (filters.hasScene !== null) {
      results = results.filter(item => item.hasScene === filters.hasScene);
    }

    if (filters.hasQuiz !== null) {
      results = results.filter(item => item.hasQuiz === filters.hasQuiz);
    }

    if (filters.completionRate !== 'all') {
      const threshold = parseInt(filters.completionRate);
      results = results.filter(item => item.completionRate >= threshold);
    }

    if (filters.duration !== 'all') {
      const [min, max] = filters.duration.split('-').map(Number);
      results = results.filter(item => {
        if (max) {
          return item.estimatedDuration >= min && item.estimatedDuration <= max;
        }
        return item.estimatedDuration >= min;
      });
    }

    // Tri
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'difficulty':
          const difficultyOrder = { 'facile': 1, 'moyen': 2, 'difficile': 3 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        case 'completion':
          comparison = a.completionRate - b.completionRate;
          break;
        case 'recent':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
        case 'relevance':
        default:
          comparison = b.rating - a.rating;
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return results;
  }, [filters]);

  // Mise à jour du compteur de filtres actifs
  useEffect(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.difficulty !== 'all') count++;
    if (filters.hasMusic !== null) count++;
    if (filters.hasScene !== null) count++;
    if (filters.hasQuiz !== null) count++;
    if (filters.completionRate !== 'all') count++;
    if (filters.duration !== 'all') count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Gestion de la recherche
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
    
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      difficulty: 'all',
      hasMusic: null,
      hasScene: null,
      hasQuiz: null,
      completionRate: 'all',
      duration: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    
    toast({
      title: "Filtres effacés",
      description: "Tous les filtres ont été remis à zéro"
    });
  };

  const toggleBookmark = (itemId: string) => {
    // Simulation de toggle bookmark
    toast({
      title: "Favori mis à jour",
      description: "L'item a été ajouté/retiré de vos favoris"
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-100 text-green-800 border-green-200';
      case 'moyen': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'difficile': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  };

  return (
    <div className="space-y-6">
      {/* Barre de recherche principale */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher des items EDN... (ex: cardiologie, pneumonie, urgence)"
                value={filters.query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2"
              >
                {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                Tri
              </Button>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </div>

          {/* Suggestions de recherche */}
          {filters.query.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {mockSuggestions
                .filter(suggestion => suggestion.toLowerCase().includes(filters.query.toLowerCase()))
                .slice(0, 5)
                .map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch(suggestion)}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}

          {/* Historique de recherche */}
          {filters.query.length === 0 && searchHistory.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-2">Recherches récentes</div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearch(search)}
                    className="text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtres avancés */}
      {showFilters && (
        <Tabs defaultValue="filters" className="w-full">
          <TabsList>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filters">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Catégorie */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Catégorie</label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => handleFilterChange('category', value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                        <SelectItem value="Pneumologie">Pneumologie</SelectItem>
                        <SelectItem value="Neurologie">Neurologie</SelectItem>
                        <SelectItem value="Gastroentérologie">Gastroentérologie</SelectItem>
                        <SelectItem value="Urgences">Urgences</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulté */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulté</label>
                    <Select
                      value={filters.difficulty}
                      onValueChange={(value) => handleFilterChange('difficulty', value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="facile">Facile</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="difficile">Difficile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Taux de completion */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Completion</label>
                    <Select
                      value={filters.completionRate}
                      onValueChange={(value) => handleFilterChange('completionRate', value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous taux</SelectItem>
                        <SelectItem value="90">90%+</SelectItem>
                        <SelectItem value="80">80%+</SelectItem>
                        <SelectItem value="70">70%+</SelectItem>
                        <SelectItem value="60">60%+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Durée */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Durée</label>
                    <Select
                      value={filters.duration}
                      onValueChange={(value) => handleFilterChange('duration', value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toute durée</SelectItem>
                        <SelectItem value="0-30">0-30 min</SelectItem>
                        <SelectItem value="30-60">30-60 min</SelectItem>
                        <SelectItem value="60-120">1-2 heures</SelectItem>
                        <SelectItem value="120">2+ heures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tri */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Trier par</label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Pertinence</SelectItem>
                        <SelectItem value="title">Titre</SelectItem>
                        <SelectItem value="difficulty">Difficulté</SelectItem>
                        <SelectItem value="completion">Completion</SelectItem>
                        <SelectItem value="recent">Récent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filtres de contenu */}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium mb-3">Type de contenu</div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant={filters.hasMusic === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('hasMusic', filters.hasMusic === true ? null : true)}
                      className="flex items-center gap-2"
                    >
                      <Music className="h-4 w-4" />
                      Avec musique
                    </Button>
                    
                    <Button
                      variant={filters.hasScene === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('hasScene', filters.hasScene === true ? null : true)}
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Scène immersive
                    </Button>
                    
                    <Button
                      variant={filters.hasQuiz === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('hasQuiz', filters.hasQuiz === true ? null : true)}
                      className="flex items-center gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      Quiz interactif
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Résultats de recherche */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Résultats de recherche
              </CardTitle>
              <CardDescription>
                {filteredResults.length} item{filteredResults.length > 1 ? 's' : ''} trouvé{filteredResults.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche ou vos filtres
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                Effacer les filtres
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                  onClick={() => onItemSelect?.(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {item.item_code}
                          </Badge>
                          
                          <Badge className={getDifficultyColor(item.difficulty)}>
                            {item.difficulty}
                          </Badge>
                          
                          <Badge variant="secondary">
                            {item.category}
                          </Badge>
                          
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">{item.rating}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-1 text-foreground">
                          {item.title}
                        </h3>
                        
                        {item.subtitle && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.subtitle}
                          </p>
                        )}
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(item.estimatedDuration)}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {item.completionRate}% de réussite
                          </span>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs px-2 py-0 cursor-pointer hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSearch(tag);
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(item.id);
                          }}
                          className={item.isBookmarked ? "text-yellow-600" : "text-muted-foreground"}
                        >
                          <Bookmark className={`h-4 w-4 ${item.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <div className="flex items-center gap-1 text-xs">
                          {item.hasMusic && <Music className="h-3 w-3 text-purple-600" />}
                          {item.hasScene && <Play className="h-3 w-3 text-green-600" />}
                          {item.hasQuiz && <Brain className="h-3 w-3 text-blue-600" />}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          MAJ: {new Date(item.lastUpdated).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};