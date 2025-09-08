import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Music, 
  Book, 
  Users, 
  Settings,
  Play,
  Clock,
  TrendingUp,
  Filter,
  X,
  Loader2,
  ArrowRight,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'song' | 'page' | 'user' | 'playlist' | 'edn' | 'feature';
  title: string;
  description?: string;
  url: string;
  category: string;
  tags: string[];
  popularity?: number;
  lastAccessed?: Date;
  thumbnail?: string;
}

interface SearchCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  count: number;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'song',
    title: 'Anatomie Cardiaque - Version Rythmée',
    description: 'Chanson d\'apprentissage sur l\'anatomie du cœur',
    url: '/med-mng/player/1',
    category: 'Musique',
    tags: ['anatomie', 'cardiologie', 'cœur'],
    popularity: 95,
    lastAccessed: new Date('2024-01-15')
  },
  {
    id: '2',
    type: 'edn',
    title: 'Item 236 - Insuffisance cardiaque',
    description: 'Contenu EDN complet avec quiz et simulations',
    url: '/edn/IC-236',
    category: 'EDN',
    tags: ['cardiologie', 'insuffisance', 'EDN'],
    popularity: 88,
    lastAccessed: new Date('2024-01-14')
  },
  {
    id: '3',
    type: 'page',
    title: 'Tableau de bord',
    description: 'Vue d\'ensemble de vos activités',
    url: '/med-mng/dashboard',
    category: 'Navigation',
    tags: ['dashboard', 'accueil'],
    popularity: 92
  },
  {
    id: '4',
    type: 'playlist',
    title: 'Cardiologie Essentielle',
    description: 'Playlist complète pour maîtriser la cardiologie',
    url: '/med-mng/playlists/cardio-essential',
    category: 'Playlists',
    tags: ['cardiologie', 'playlist', 'essentiel'],
    popularity: 85
  },
  {
    id: '5',
    type: 'feature',
    title: 'Générateur Musical IA',
    description: 'Créez vos propres chansons d\'apprentissage',
    url: '/med-mng/create',
    category: 'Outils',
    tags: ['création', 'IA', 'musique'],
    popularity: 90
  }
];

const getIconForType = (type: SearchResult['type']) => {
  switch (type) {
    case 'song': return Music;
    case 'edn': return Book;
    case 'page': return Settings;
    case 'playlist': return Music;
    case 'user': return Users;
    case 'feature': return TrendingUp;
    default: return Search;
  }
};

const getColorForType = (type: SearchResult['type']) => {
  switch (type) {
    case 'song': return 'text-blue-600 dark:text-blue-400';
    case 'edn': return 'text-green-600 dark:text-green-400';
    case 'page': return 'text-purple-600 dark:text-purple-400';
    case 'playlist': return 'text-orange-600 dark:text-orange-400';
    case 'user': return 'text-pink-600 dark:text-pink-400';
    case 'feature': return 'text-indigo-600 dark:text-indigo-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
};

const SearchResultItem: React.FC<{
  result: SearchResult;
  onClick: () => void;
  isSelected: boolean;
  searchTerm: string;
}> = ({ result, onClick, isSelected, searchTerm }) => {
  const Icon = getIconForType(result.type);
  const colorClass = getColorForType(result.type);

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-accent/50",
        isSelected ? "bg-primary/10 border-primary/30" : "bg-card border-border"
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className={cn("mt-1", colorClass)}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm truncate">
              {highlightText(result.title, searchTerm)}
            </h4>
            {result.popularity && (
              <Badge variant="secondary" className="text-xs ml-2">
                <Star size={10} className="mr-1" />
                {result.popularity}%
              </Badge>
            )}
          </div>
          {result.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {highlightText(result.description, searchTerm)}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {result.category}
              </Badge>
              {result.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
            {result.lastAccessed && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock size={10} className="mr-1" />
                {result.lastAccessed.toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        </div>
        <ArrowRight size={14} className="text-muted-foreground mt-1" />
      </div>
    </div>
  );
};

export const SearchResults: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Simulation de recherche avec loading
  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [debouncedSearchTerm]);

  // Raccourcis clavier pour la recherche
  useKeyboardShortcuts({
    'Ctrl+K': (e) => {
      e.preventDefault();
      setIsSearchOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    },
    'Escape': () => {
      if (isSearchOpen) {
        setIsSearchOpen(false);
        setSearchTerm('');
        setSelectedIndex(-1);
      }
    }
  });

  // Filtrer les résultats
  const filteredResults = useMemo(() => {
    if (!debouncedSearchTerm) return [];
    
    return mockSearchResults.filter(result => {
      const matchesSearch = 
        result.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        result.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || result.type === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [debouncedSearchTerm, selectedCategory]);

  // Catégories avec compteurs
  const categories: SearchCategory[] = useMemo(() => {
    const baseCats = [
      { id: 'all', name: 'Tout', icon: Search, color: 'text-gray-600' },
      { id: 'song', name: 'Musique', icon: Music, color: 'text-blue-600' },
      { id: 'edn', name: 'EDN', icon: Book, color: 'text-green-600' },
      { id: 'playlist', name: 'Playlists', icon: Music, color: 'text-orange-600' },
      { id: 'feature', name: 'Outils', icon: TrendingUp, color: 'text-indigo-600' }
    ];

    return baseCats.map(cat => ({
      ...cat,
      count: cat.id === 'all' 
        ? filteredResults.length 
        : filteredResults.filter(r => r.type === cat.id).length
    }));
  }, [filteredResults]);

  const handleResultClick = useCallback((result: SearchResult) => {
    navigate(result.url);
    setIsSearchOpen(false);
    setSearchTerm('');
    setSelectedIndex(-1);
  }, [navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!filteredResults.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
          handleResultClick(filteredResults[selectedIndex]);
        }
        break;
    }
  }, [filteredResults, selectedIndex, handleResultClick]);

  return (
    <div className="relative flex-1 max-w-2xl">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          ref={searchInputRef}
          placeholder="Rechercher (Ctrl+K)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
          aria-label="Barre de recherche globale"
        />
        {searchTerm && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearchTerm('');
              setSelectedIndex(-1);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            aria-label="Effacer la recherche"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Résultats de recherche */}
      {isSearchOpen && searchTerm && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-2xl border-2">
          <div className="p-4">
            {/* En-tête avec filtres */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  <TranslatedText text="Résultats" />
                </span>
                {isLoading && (
                  <Loader2 className="animate-spin text-muted-foreground" size={16} />
                )}
              </div>
              <div className="flex items-center space-x-1">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    size="sm"
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs h-7"
                    disabled={category.count === 0}
                  >
                    <category.icon size={12} className="mr-1" />
                    {category.name}
                    {category.count > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {category.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Liste des résultats */}
            <ScrollArea className="max-h-96">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-muted-foreground" size={24} />
                  <span className="ml-2 text-muted-foreground">
                    <TranslatedText text="Recherche en cours..." />
                  </span>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <Search className="mx-auto text-muted-foreground" size={32} />
                  <p className="text-muted-foreground">
                    <TranslatedText text="Aucun résultat trouvé" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <TranslatedText text="Essayez avec d'autres mots-clés" />
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredResults.map((result, index) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      onClick={() => handleResultClick(result)}
                      isSelected={index === selectedIndex}
                      searchTerm={debouncedSearchTerm}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer avec raccourcis */}
            {filteredResults.length > 0 && (
              <>
                <Separator className="mt-4 mb-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {filteredResults.length} résultat{filteredResults.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span>↑↓ Naviguer</span>
                    <span>↵ Sélectionner</span>
                    <span>Esc Fermer</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Overlay pour fermer la recherche */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchTerm('');
            setSelectedIndex(-1);
          }}
        />
      )}
    </div>
  );
};

SearchResults.displayName = 'SearchResults';

export default SearchResults;