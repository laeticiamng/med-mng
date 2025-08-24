import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImmersiveCard } from './ImmersiveCard';

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'popular' | 'suggested';
  count?: number;
}

interface SmartSearchProps {
  placeholder?: string;
  onSearch: (query: string, filters: SearchFilters) => void;
  suggestions?: SearchSuggestion[];
  filters?: FilterOption[];
  showAdvanced?: boolean;
  className?: string;
}

interface FilterOption {
  id: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
}

interface SearchFilters {
  category?: string;
  sortBy?: string;
  difficulty?: string;
  timeRange?: string;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  placeholder = "Rechercher...",
  onSearch,
  suggestions = [],
  filters = [],
  showAdvanced = true,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 || Object.keys(currentFilters).length > 0) {
        onSearch(query, currentFilters);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentFilters, onSearch]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    onSearch(suggestion.text, currentFilters);
  };

  const handleFilterChange = (filterId: string, value: string) => {
    const newFilters = { ...currentFilters, [filterId]: value };
    setCurrentFilters(newFilters);
  };

  const clearFilters = () => {
    setCurrentFilters({});
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent': return <Clock className="h-4 w-4 text-gray-400" />;
      case 'popular': return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'suggested': return <Sparkles className="h-4 w-4 text-purple-400" />;
      default: return null;
    }
  };

  const activeFiltersCount = Object.values(currentFilters).filter(v => v && v !== 'all').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-12 pr-20 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 h-12 text-lg rounded-xl backdrop-blur-sm"
          />
          
          {/* Search Actions */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {showAdvanced && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className={`h-8 px-3 text-xs ${
                  activeFiltersCount > 0 
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-400/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Filter className="h-3 w-3 mr-1" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 min-w-[16px] p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-gray-400 hover:text-white hover:bg-white/10"
              onClick={() => onSearch(query, currentFilters)}
            >
              <Search className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <ImmersiveCard 
            variant="neon" 
            className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-auto"
          >
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {getSuggestionIcon(suggestion.type)}
                    <span className="text-gray-200 group-hover:text-white">
                      {suggestion.text}
                    </span>
                  </div>
                  {suggestion.count && (
                    <span className="text-xs text-gray-400">
                      {suggestion.count} résultats
                    </span>
                  )}
                </button>
              ))}
            </div>
          </ImmersiveCard>
        )}
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && filters.length > 0 && (
        <ImmersiveCard variant="glass" className="animate-slide-down">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres avancés
              </h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Effacer tout
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label className="text-sm text-gray-300 font-medium">
                    {filter.label}
                  </label>
                  <Select
                    value={currentFilters[filter.id as keyof SearchFilters] || 'all'}
                    onValueChange={(value) => handleFilterChange(filter.id, value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20 backdrop-blur-xl">
                      <SelectItem value="all" className="text-white hover:bg-white/10">
                        Tous
                      </SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="text-white hover:bg-white/10 flex justify-between"
                        >
                          <span>{option.label}</span>
                          {option.count && (
                            <span className="ml-2 text-xs text-gray-400">
                              ({option.count})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </ImmersiveCard>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Filtres actifs:</span>
          {Object.entries(currentFilters).map(([key, value]) => {
            if (!value || value === 'all') return null;
            const filter = filters.find(f => f.id === key);
            const option = filter?.options.find(o => o.value === value);
            
            return (
              <Badge
                key={key}
                variant="outline"
                className="bg-purple-600/20 text-purple-300 border-purple-400/30 cursor-pointer hover:bg-purple-600/30"
                onClick={() => handleFilterChange(key, 'all')}
              >
                {filter?.label}: {option?.label}
                <span className="ml-1 text-xs">×</span>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};