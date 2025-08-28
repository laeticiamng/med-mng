import { useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { 
  Search,
  Filter,
  Heart,
  BookOpen,
  Activity,
  Star,
  Clock,
  TrendingUp,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Download,
  Share2,
  Bookmark,
  Eye,
  Music
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const quickFilters = [
  { label: 'Tous', value: 'all', icon: BookOpen },
  { label: 'Favoris', value: 'favorites', icon: Heart },
  { label: 'Récents', value: 'recent', icon: Clock },
  { label: 'Populaires', value: 'popular', icon: TrendingUp },
  { label: 'Avec Musique', value: 'music', icon: Music },
  { label: 'Complétés', value: 'completed', icon: Activity },
];

const sortOptions = [
  { label: 'Alphabétique A-Z', value: 'name-asc', icon: SortAsc },
  { label: 'Alphabétique Z-A', value: 'name-desc', icon: SortDesc },
  { label: 'Plus récents', value: 'date-desc', icon: Clock },
  { label: 'Plus anciens', value: 'date-asc', icon: Clock },
  { label: 'Plus populaires', value: 'popular', icon: Star },
];

interface EdnNavigationProps {
  itemCount?: number;
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
  onViewChange?: (view: 'grid' | 'list') => void;
  className?: string;
}

export const EdnNavigation = ({
  itemCount = 0,
  onSearch,
  onFilterChange,
  onSortChange,
  onViewChange,
  className
}: EdnNavigationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentFilter, setCurrentFilter] = useState(searchParams.get('filter') || 'all');
  const [currentSort, setCurrentSort] = useState(searchParams.get('sort') || 'name-asc');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      searchParams.set('search', query);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
    onSearch?.(query);
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    if (filter !== 'all') {
      searchParams.set('filter', filter);
    } else {
      searchParams.delete('filter');
    }
    setSearchParams(searchParams);
    onFilterChange?.(filter);
  };

  const handleSortChange = (sort: string) => {
    setCurrentSort(sort);
    searchParams.set('sort', sort);
    setSearchParams(searchParams);
    onSortChange?.(sort);
  };

  const handleViewChange = (view: 'grid' | 'list') => {
    setCurrentView(view);
    onViewChange?.(view);
  };

  return (
    <div className={cn("bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30", className)}>
      <div className="p-6 space-y-6">
        {/* Header with Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Items EDN</h2>
            <p className="text-gray-600">
              {itemCount} item{itemCount !== 1 ? 's' : ''} disponible{itemCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Partager
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Rechercher par titre, code item, spécialité..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg bg-white/90 border-gray-300 focus:border-primary focus:ring-primary"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearch('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              ×
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {quickFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = currentFilter === filter.value;
            return (
              <Button
                key={filter.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(filter.value)}
                className={cn(
                  "flex items-center space-x-2 whitespace-nowrap transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{filter.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Advanced Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Trier par:</span>
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres avancés
            </Button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={currentView === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={currentView === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900">Filtres avancés</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Spécialité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialité
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Toutes les spécialités</option>
                  <option value="cardiologie">Cardiologie</option>
                  <option value="neurologie">Neurologie</option>
                  <option value="pediatrie">Pédiatrie</option>
                  <option value="psychiatrie">Psychiatrie</option>
                  <option value="gynecologie">Gynécologie</option>
                </select>
              </div>

              {/* Rang */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rang de priorité
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Tous les rangs</option>
                  <option value="A">Rang A (Prioritaire)</option>
                  <option value="B">Rang B (Complémentaire)</option>
                </select>
              </div>

              {/* Difficulté */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau de difficulté
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Tous les niveaux</option>
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdvancedFilters(false)}>
                Annuler
              </Button>
              <Button variant="default" size="sm">
                Appliquer les filtres
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(searchQuery || currentFilter !== 'all') && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filtres actifs:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                <Search className="h-3 w-3" />
                "{searchQuery}"
                <button
                  onClick={() => handleSearch('')}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
            {currentFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                <Filter className="h-3 w-3" />
                {quickFilters.find(f => f.value === currentFilter)?.label}
                <button
                  onClick={() => handleFilterChange('all')}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};