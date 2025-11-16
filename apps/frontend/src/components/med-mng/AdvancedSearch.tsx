import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, Tag, User, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { TranslatedText } from '@/components/TranslatedText';
import { cn } from '@/lib/utils';

interface Song {
  id: string;
  title: string;
  artist?: string;
  genre?: string;
  tags?: string[];
  description?: string;
}

interface AdvancedSearchProps {
  songs: Song[];
  onFilteredSongs: (songs: Song[]) => void;
  placeholder?: string;
  className?: string;
}

interface SearchFilters {
  searchIn: {
    title: boolean;
    artist: boolean;
    genre: boolean;
    tags: boolean;
    description: boolean;
  };
  genres: string[];
  tags: string[];
}

// Hook personnalisé pour le debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Fonction pour mettre en évidence les termes de recherche
export const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) return text;

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return parts.map((part, index) => 
    part.toLowerCase() === searchTerm.toLowerCase() 
      ? <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">{part}</mark>
      : part
  );
};

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  songs,
  onFilteredSongs,
  placeholder = "Rechercher...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    searchIn: {
      title: true,
      artist: true,
      genre: false,
      tags: true,
      description: false,
    },
    genres: [],
    tags: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Debounce de la recherche pour éviter trop de filtres
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Extraire tous les genres et tags disponibles
  const availableGenres = useMemo(() => {
    if (!Array.isArray(songs)) return [];
    
    const genres = new Set<string>();
    songs.forEach(song => {
      if (song?.genre) genres.add(song.genre);
    });
    return Array.from(genres).sort();
  }, [songs]);

  const availableTags = useMemo(() => {
    if (!Array.isArray(songs)) return [];
    
    const tags = new Set<string>();
    songs.forEach(song => {
      song?.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [songs]);

  // Fonction de filtrage avancée
  const filteredSongs = useMemo(() => {
    if (!Array.isArray(songs)) return [];
    
    let filtered = [...songs];

    // Filtrage par terme de recherche
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(song => {
        const searchableFields = [];
        
        if (filters.searchIn.title && song.title) {
          searchableFields.push(song.title.toLowerCase());
        }
        if (filters.searchIn.artist && song.artist) {
          searchableFields.push(song.artist.toLowerCase());
        }
        if (filters.searchIn.genre && song.genre) {
          searchableFields.push(song.genre.toLowerCase());
        }
        if (filters.searchIn.description && song.description) {
          searchableFields.push(song.description.toLowerCase());
        }
        if (filters.searchIn.tags && song.tags) {
          searchableFields.push(...song.tags.map(tag => tag.toLowerCase()));
        }

        return searchableFields.some(field => field.includes(term));
      });
    }

    // Filtrage par genres
    if (filters.genres.length > 0) {
      filtered = filtered.filter(song => 
        song.genre && filters.genres.includes(song.genre)
      );
    }

    // Filtrage par tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(song =>
        song.tags && song.tags.some(tag => filters.tags.includes(tag))
      );
    }

    return filtered;
  }, [songs, debouncedSearchTerm, filters]);

  // Mettre à jour les résultats filtrés
  useEffect(() => {
    onFilteredSongs(filteredSongs);
  }, [filteredSongs, onFilteredSongs]);

  const clearSearch = () => {
    setSearchTerm('');
    setFilters({
      searchIn: {
        title: true,
        artist: true,
        genre: false,
        tags: true,
        description: false,
      },
      genres: [],
      tags: []
    });
  };

  const hasActiveFilters = filters.genres.length > 0 || filters.tags.length > 0 || 
    !filters.searchIn.title || !filters.searchIn.artist || filters.searchIn.genre || 
    !filters.searchIn.tags || filters.searchIn.description;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barre de recherche principale */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Bouton filtres */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button 
              variant={hasActiveFilters ? "default" : "outline"}
              size="icon"
              className="relative"
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 bg-background border shadow-lg" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filtres de recherche</h4>
                <Button variant="ghost" size="sm" onClick={clearSearch}>
                  <TranslatedText text="Tout effacer" />
                </Button>
              </div>

              {/* Rechercher dans */}
              <div>
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Search className="h-3 w-3" />
                  Rechercher dans
                </h5>
                <div className="space-y-2">
                  {Object.entries(filters.searchIn).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setFilters(prev => ({
                            ...prev,
                            searchIn: { ...prev.searchIn, [key]: !!checked }
                          }))
                        }
                      />
                      <label htmlFor={key} className="text-sm capitalize cursor-pointer">
                        {key === 'title' ? 'Titre' : 
                         key === 'artist' ? 'Artiste' :
                         key === 'genre' ? 'Genre' :
                         key === 'tags' ? 'Tags' : 'Description'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtres par genre */}
              {availableGenres.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Music className="h-3 w-3" />
                    Genres
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableGenres.map(genre => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre}`}
                          checked={filters.genres.includes(genre)}
                          onCheckedChange={(checked) =>
                            setFilters(prev => ({
                              ...prev,
                              genres: checked 
                                ? [...prev.genres, genre]
                                : prev.genres.filter(g => g !== genre)
                            }))
                          }
                        />
                        <label htmlFor={`genre-${genre}`} className="text-sm cursor-pointer">
                          {genre}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtres par tags */}
              {availableTags.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    Tags
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={filters.tags.includes(tag)}
                          onCheckedChange={(checked) =>
                            setFilters(prev => ({
                              ...prev,
                              tags: checked 
                                ? [...prev.tags, tag]
                                : prev.tags.filter(t => t !== tag)
                            }))
                          }
                        />
                        <label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Badges des filtres actifs */}
      {(searchTerm || filters.genres.length > 0 || filters.tags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.genres.map(genre => (
            <Badge key={genre} variant="outline" className="flex items-center gap-1">
              <Music className="h-3 w-3" />
              {genre}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  genres: prev.genres.filter(g => g !== genre)
                }))}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          {filters.tags.map(tag => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  tags: prev.tags.filter(t => t !== tag)
                }))}
                className="h-4 w-4 p-0 ml-1"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Résultats de recherche */}
      <div className="text-sm text-muted-foreground">
        {filteredSongs.length} résultat{filteredSongs.length > 1 ? 's' : ''} trouvé{filteredSongs.length > 1 ? 's' : ''}
        {searchTerm && (
          <span> pour "{searchTerm}"</span>
        )}
      </div>
    </div>
  );
};