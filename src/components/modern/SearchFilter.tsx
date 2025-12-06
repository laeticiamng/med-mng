import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Filter, X, SlidersHorizontal, 
  Calendar, Star, Clock, Tag, TrendingUp 
} from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
  color?: string;
}

interface FilterCategory {
  id: string;
  label: string;
  type: 'single' | 'multiple' | 'range' | 'date';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

interface SearchFilterProps {
  placeholder?: string;
  categories: FilterCategory[];
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  showAdvanced?: boolean;
  recentSearches?: string[];
  suggestions?: string[];
}

/**
 * Composant de recherche et filtrage avancé
 */
export const SearchFilter: React.FC<SearchFilterProps> = ({
  placeholder = "Rechercher...",
  categories,
  onSearch,
  onFilter,
  showAdvanced = true,
  recentSearches = [],
  suggestions = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filtres populaires prédéfinis
  const popularFilters = [
    { label: 'Récents', value: 'recent', icon: Clock },
    { label: 'Favoris', value: 'favorites', icon: Star },
    { label: 'Tendances', value: 'trending', icon: TrendingUp },
    { label: 'Cette semaine', value: 'week', icon: Calendar }
  ];

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onSearch(query);
    setShowSuggestions(false);
  }, [onSearch]);

  const handleFilterChange = useCallback((categoryId: string, value: any) => {
    const newFilters = { ...activeFilters };
    
    if (value === null || value === undefined || value === '') {
      delete newFilters[categoryId];
    } else {
      newFilters[categoryId] = value;
    }
    
    setActiveFilters(newFilters);
    onFilter(newFilters);
  }, [activeFilters, onFilter]);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    onFilter({});
  }, [onFilter]);

  const clearFilter = useCallback((categoryId: string) => {
    handleFilterChange(categoryId, null);
  }, [handleFilterChange]);

  const activeFilterCount = useMemo(() => {
    return Object.keys(activeFilters).length;
  }, [activeFilters]);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery || !showSuggestions) return [];
    return suggestions.filter(s => 
      s.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, suggestions, showSuggestions]);

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchQuery);
              }
              if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-20 h-12 text-base"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {showAdvanced && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearch(searchQuery)}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Suggestions de recherche */}
        {showSuggestions && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
            <CardContent className="p-2">
              {filteredSuggestions.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    Suggestions
                  </p>
                  {filteredSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearch(suggestion)}
                      className="w-full justify-start h-8 px-2"
                    >
                      <Search className="w-3 h-3 mr-2 text-muted-foreground" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
              
              {recentSearches.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    Recherches récentes
                  </p>
                  {recentSearches.slice(0, 3).map((recent, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearch(recent)}
                      className="w-full justify-start h-8 px-2 text-muted-foreground"
                    >
                      <Clock className="w-3 h-3 mr-2" />
                      {recent}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filtres populaires */}
      <div className="flex flex-wrap gap-2">
        {popularFilters.map((filter) => {
          const IconComponent = filter.icon;
          const isActive = activeFilters[filter.value];
          
          return (
            <Button
              key={filter.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange(filter.value, !isActive)}
              className="h-8"
            >
              <IconComponent className="w-3 h-3 mr-2" />
              {filter.label}
            </Button>
          );
        })}
      </div>

      {/* Filtres actifs */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtres actifs:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            const category = categories.find(c => c.id === key);
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {category?.label}: {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter(key)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs"
          >
            Tout effacer
          </Button>
        </div>
      )}

      {/* Panneau de filtres avancés */}
      {showFilters && showAdvanced && (
        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres Avancés
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Tabs defaultValue={categories[0]?.id} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                {categories.slice(0, 4).map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-3">
                  <h4 className="font-medium">{category.label}</h4>
                  
                  {category.type === 'multiple' && category.options && (
                    <div className="flex flex-wrap gap-2">
                      {category.options.map((option) => {
                        const isSelected = activeFilters[category.id]?.includes?.(option.value);
                        
                        return (
                          <Button
                            key={option.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const currentValues = activeFilters[category.id] || [];
                              const newValues = isSelected
                                ? currentValues.filter((v: string) => v !== option.value)
                                : [...currentValues, option.value];
                              
                              handleFilterChange(category.id, newValues.length > 0 ? newValues : null);
                            }}
                            className="h-8"
                          >
                            <Tag className="w-3 h-3 mr-2" />
                            {option.label}
                            {option.count && (
                              <Badge variant="secondary" className="ml-2">
                                {option.count}
                              </Badge>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {category.type === 'single' && category.options && (
                    <div className="grid grid-cols-2 gap-2">
                      {category.options.map((option) => (
                        <Button
                          key={option.id}
                          variant={activeFilters[category.id] === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const newValue = activeFilters[category.id] === option.value ? null : option.value;
                            handleFilterChange(category.id, newValue);
                          }}
                          className="justify-start h-8"
                        >
                          {option.label}
                          {option.count && (
                            <Badge variant="secondary" className="ml-auto">
                              {option.count}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}

                  {category.type === 'range' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          min={category.min}
                          max={category.max}
                          onChange={(e) => {
                            const range = activeFilters[category.id] || {};
                            handleFilterChange(category.id, { ...range, min: e.target.value });
                          }}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">à</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          min={category.min}
                          max={category.max}
                          onChange={(e) => {
                            const range = activeFilters[category.id] || {};
                            handleFilterChange(category.id, { ...range, max: e.target.value });
                          }}
                          className="w-24"
                        />
                      </div>
                    </div>
                  )}

                  {category.type === 'date' && (
                    <div className="space-y-2">
                      <Input
                        type="date"
                        onChange={(e) => handleFilterChange(category.id, e.target.value)}
                        className="w-full"
                      />
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};