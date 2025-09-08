import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, X, SortAsc, SortDesc, Music, BookOpen, Users, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccessibility } from '@/components/ui/AccessibilityProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'music' | 'course' | 'user' | 'item';
  description?: string;
  tags?: string[];
  category?: string;
  createdAt?: string;
  popularity?: number;
  url?: string;
}

interface EnhancedSearchResultsProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  placeholder?: string;
  maxResults?: number;
  enableVoiceSearch?: boolean;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Cardiologie - Rythmes cardiaques',
    type: 'music',
    description: 'Apprenez les arythmies avec cette mélodie mémorable',
    tags: ['cardiologie', 'arythmie', 'ECG'],
    category: 'Médecine cardiovasculaire',
    popularity: 95
  },
  {
    id: '2',
    title: 'Neurologie - Anatomie du cerveau',
    type: 'course',
    description: 'Cours complet sur l\'anatomie cérébrale',
    tags: ['neurologie', 'anatomie', 'cerveau'],
    category: 'Neurosciences',
    popularity: 87
  },
  {
    id: '3',
    title: 'Dr. Marie Dubois',
    type: 'user',
    description: 'Professeure de cardiologie, CHU de Lyon',
    tags: ['cardiologie', 'enseignement'],
    category: 'Professeurs',
    popularity: 78
  },
  {
    id: '4',
    title: 'Item 230 - Fibrillation auriculaire',
    type: 'item',
    description: 'Item EDN sur la fibrillation auriculaire',
    tags: ['EDN', 'cardiologie', 'fibrillation'],
    category: 'Items EDN',
    popularity: 92
  }
];

export const EnhancedSearchResults: React.FC<EnhancedSearchResultsProps> = ({
  isOpen,
  onClose,
  className,
  placeholder = "Rechercher dans MED-MNG...",
  maxResults = 50,
  enableVoiceSearch = true
}) => {
  const { announceToScreenReader, keyboardNavigation, screenReaderMode } = useAccessibility();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'popularity' | 'recent' | 'alphabetical'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = mockResults;

    // Filter by search term
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(result => 
        result.title.toLowerCase().includes(term) ||
        result.description?.toLowerCase().includes(term) ||
        result.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filter by types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(result => selectedTypes.includes(result.type));
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(result => 
        result.category && selectedCategories.includes(result.category)
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'popularity':
          comparison = (b.popularity || 0) - (a.popularity || 0);
          break;
        case 'alphabetical':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'recent':
          comparison = new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
          break;
        default: // relevance
          // Simple relevance scoring based on search term match
          const aScore = debouncedSearchTerm ? 
            (a.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ? 2 : 0) +
            (a.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ? 1 : 0)
            : a.popularity || 0;
          const bScore = debouncedSearchTerm ?
            (b.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ? 2 : 0) +
            (b.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ? 1 : 0)
            : b.popularity || 0;
          comparison = bScore - aScore;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered.slice(0, maxResults);
  }, [debouncedSearchTerm, selectedTypes, selectedCategories, sortBy, sortOrder, maxResults]);

  // Get unique categories and types
  const availableCategories = useMemo(() => 
    [...new Set(mockResults.map(r => r.category).filter(Boolean))].sort(),
    []
  );

  const availableTypes = useMemo(() => 
    [...new Set(mockResults.map(r => r.type))].sort(),
    []
  );

  // Keyboard navigation
  useEffect(() => {
    if (!keyboardNavigation || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < filteredResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          if (focusedIndex >= 0 && filteredResults[focusedIndex]) {
            handleResultClick(filteredResults[focusedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNavigation, isOpen, focusedIndex, filteredResults, onClose]);

  // Voice search functionality
  const startVoiceSearch = useCallback(() => {
    if (!enableVoiceSearch || !('webkitSpeechRecognition' in window)) return;

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    recognition.onstart = () => {
      setIsVoiceActive(true);
      announceToScreenReader('Recherche vocale activée, parlez maintenant', 'assertive');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
      announceToScreenReader('Recherche vocale terminée', 'polite');
    };

    recognition.onerror = () => {
      setIsVoiceActive(false);
      announceToScreenReader('Erreur de reconnaissance vocale', 'assertive');
    };

    recognition.start();
  }, [enableVoiceSearch, announceToScreenReader]);

  const handleResultClick = useCallback((result: SearchResult) => {
    announceToScreenReader(`Ouverture de ${result.title}`, 'polite');
    // Handle navigation to result
    console.log('Navigate to:', result);
    onClose();
  }, [announceToScreenReader, onClose]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'music': return <Music className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      case 'item': return <Hash className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'music': return 'Musique';
      case 'course': return 'Cours';
      case 'user': return 'Utilisateur';
      case 'item': return 'Item EDN';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
      )}
      role="dialog"
      aria-labelledby="search-dialog-title"
      aria-modal="true"
    >
      <div className="fixed top-16 left-1/2 transform -translate-x-1/2 w-full max-w-4xl mx-auto px-4">
        <Card className="shadow-2xl border-2">
          <CardContent className="p-0">
            {/* Search Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 pr-4 py-2 text-base"
                    autoFocus
                    aria-label="Champ de recherche"
                    aria-describedby="search-help"
                  />
                  {enableVoiceSearch && 'webkitSpeechRecognition' in window && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={startVoiceSearch}
                      disabled={isVoiceActive}
                      aria-label="Recherche vocale"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full bg-current",
                        isVoiceActive && "animate-pulse bg-red-500"
                      )} />
                    </Button>
                  )}
                </div>

                {/* Filters */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="Filtres de recherche">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtres
                      {(selectedTypes.length + selectedCategories.length > 0) && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                          {selectedTypes.length + selectedCategories.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Types de contenu</h4>
                        <div className="space-y-2">
                          {availableTypes.map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`type-${type}`}
                                checked={selectedTypes.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedTypes([...selectedTypes, type]);
                                  } else {
                                    setSelectedTypes(selectedTypes.filter(t => t !== type));
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`type-${type}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                              >
                                {getTypeIcon(type)}
                                {getTypeLabel(type)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Catégories</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {availableCategories.map(category => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-${category}`}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCategories([...selectedCategories, category]);
                                  } else {
                                    setSelectedCategories(selectedCategories.filter(c => c !== category));
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`category-${category}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Pertinence</SelectItem>
                    <SelectItem value="popularity">Popularité</SelectItem>
                    <SelectItem value="recent">Récent</SelectItem>
                    <SelectItem value="alphabetical">Alphabétique</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  aria-label={`Tri ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label="Fermer la recherche"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Active filters */}
              {(selectedTypes.length > 0 || selectedCategories.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTypes.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {getTypeLabel(type)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto w-auto p-0 ml-1"
                        onClick={() => setSelectedTypes(selectedTypes.filter(t => t !== type))}
                        aria-label={`Supprimer le filtre ${getTypeLabel(type)}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {selectedCategories.map(category => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto w-auto p-0 ml-1"
                        onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                        aria-label={`Supprimer le filtre ${category}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              <p id="search-help" className="text-xs text-muted-foreground mt-2">
                {filteredResults.length} résultat{filteredResults.length !== 1 ? 's' : ''} trouvé{filteredResults.length !== 1 ? 's' : ''}
                {keyboardNavigation && " • Utilisez ↑↓ pour naviguer, Entrée pour sélectionner"}
              </p>
            </div>

            {/* Results */}
            <div 
              ref={resultsContainerRef}
              className="max-h-96 overflow-y-auto"
              role="listbox"
              aria-label="Résultats de recherche"
            >
              {filteredResults.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Aucun résultat trouvé</h3>
                  <p className="text-muted-foreground">
                    Essayez de modifier vos termes de recherche ou vos filtres
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredResults.map((result, index) => (
                    <div
                      key={result.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors",
                        "hover:bg-muted/50 focus:bg-muted/50",
                        focusedIndex === index && "bg-muted/50 ring-2 ring-primary/20"
                      )}
                      onClick={() => handleResultClick(result)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      role="option"
                      aria-selected={focusedIndex === index}
                      tabIndex={0}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg text-primary">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {result.title}
                          </h4>
                          {result.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(result.type)}
                            </Badge>
                            {result.category && (
                              <Badge variant="secondary" className="text-xs">
                                {result.category}
                              </Badge>
                            )}
                            {result.tags && result.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {result.popularity && (
                          <div className="text-right text-xs text-muted-foreground">
                            {result.popularity}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};