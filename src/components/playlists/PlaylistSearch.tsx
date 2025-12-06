import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TranslatedText } from '@/components/TranslatedText';

interface PlaylistSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  className?: string;
}

interface SearchFilters {
  privacy?: 'all' | 'public' | 'private';
  sortBy?: 'updated_at' | 'created_at' | 'name' | 'song_count';
  sortOrder?: 'asc' | 'desc';
}

export const PlaylistSearch: React.FC<PlaylistSearchProps> = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    privacy: 'all',
    sortBy: 'updated_at',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const clearFilters = () => {
    setQuery('');
    setFilters({
      privacy: 'all',
      sortBy: 'updated_at',
      sortOrder: 'desc'
    });
    onSearch('', {
      privacy: 'all',
      sortBy: 'updated_at',
      sortOrder: 'desc'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== 'updated_at' && value !== 'desc'
  ).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barre de recherche principale */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans vos playlists..."
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
          <TranslatedText text="Rechercher" />
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          <TranslatedText text="Filtres" />
          {activeFiltersCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-muted/50 p-4 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">
              <TranslatedText text="Filtres avancés" />
            </h4>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              <TranslatedText text="Effacer" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre de confidentialité */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                <TranslatedText text="Confidentialité" />
              </label>
              <Select
                value={filters.privacy}
                onValueChange={(value: 'all' | 'public' | 'private') =>
                  setFilters(prev => ({ ...prev, privacy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <TranslatedText text="Toutes" />
                  </SelectItem>
                  <SelectItem value="public">
                    <TranslatedText text="Publiques" />
                  </SelectItem>
                  <SelectItem value="private">
                    <TranslatedText text="Privées" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tri par */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                <TranslatedText text="Trier par" />
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={(value: 'updated_at' | 'created_at' | 'name' | 'song_count') =>
                  setFilters(prev => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated_at">
                    <TranslatedText text="Date de modification" />
                  </SelectItem>
                  <SelectItem value="created_at">
                    <TranslatedText text="Date de création" />
                  </SelectItem>
                  <SelectItem value="name">
                    <TranslatedText text="Nom" />
                  </SelectItem>
                  <SelectItem value="song_count">
                    <TranslatedText text="Nombre de chansons" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordre de tri */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                <TranslatedText text="Ordre" />
              </label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value: 'asc' | 'desc') =>
                  setFilters(prev => ({ ...prev, sortOrder: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">
                    <TranslatedText text="Décroissant" />
                  </SelectItem>
                  <SelectItem value="asc">
                    <TranslatedText text="Croissant" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full bg-primary hover:bg-primary/90">
            <TranslatedText text="Appliquer les filtres" />
          </Button>
        </div>
      )}
    </div>
  );
};
