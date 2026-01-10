/**
 * 🔍 Filtres avancés pour l'historique des générations
 * Filtres par date, style, rang avec interface moderne
 */

import React from 'react';
import { Calendar, Tag, Layers, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TranslatedText } from '@/components/TranslatedText';
import { cn } from '@/lib/utils';

export type DateRangeType = 'all' | 'today' | 'week' | 'month' | 'custom';
export type FilterType = 'all' | 'favorites' | 'rang_a' | 'rang_b' | 'rang_ab';
export type SortType = 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'style_asc';

interface GenerationHistoryFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  dateRange: DateRangeType;
  setDateRange: (range: DateRangeType) => void;
  styleFilter: string;
  setStyleFilter: (style: string) => void;
  sortBy: SortType;
  setSortBy: (sort: SortType) => void;
  availableStyles: string[];
  activeFiltersCount: number;
  onResetFilters: () => void;
  className?: string;
}

export const GenerationHistoryFilters: React.FC<GenerationHistoryFiltersProps> = ({
  filter,
  setFilter,
  dateRange,
  setDateRange,
  styleFilter,
  setStyleFilter,
  sortBy,
  setSortBy,
  availableStyles,
  activeFiltersCount,
  onResetFilters,
  className
}) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Filtre principal */}
      <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue placeholder="Filtrer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="favorites">Favoris ❤️</SelectItem>
          <SelectItem value="rang_a">Rang A</SelectItem>
          <SelectItem value="rang_b">Rang B</SelectItem>
          <SelectItem value="rang_ab">Rang A+B</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtre période */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            {dateRange === 'all' ? 'Toutes dates' : 
             dateRange === 'today' ? 'Aujourd\'hui' :
             dateRange === 'week' ? 'Cette semaine' : 
             dateRange === 'month' ? 'Ce mois' : 'Personnalisé'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2">
          <div className="space-y-1">
            {(['all', 'today', 'week', 'month'] as DateRangeType[]).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setDateRange(range)}
              >
                {range === 'all' ? 'Toutes dates' :
                 range === 'today' ? 'Aujourd\'hui' :
                 range === 'week' ? 'Cette semaine' : 'Ce mois'}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Filtre style musical */}
      {availableStyles.length > 0 && (
        <Select value={styleFilter} onValueChange={setStyleFilter}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <Tag className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les styles</SelectItem>
            {availableStyles.map((style) => (
              <SelectItem key={style} value={style}>{style}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Tri */}
      <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <Layers className="h-3 w-3 mr-1" />
          <SelectValue placeholder="Trier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date_desc">Plus récent</SelectItem>
          <SelectItem value="date_asc">Plus ancien</SelectItem>
          <SelectItem value="title_asc">Titre A-Z</SelectItem>
          <SelectItem value="title_desc">Titre Z-A</SelectItem>
          <SelectItem value="style_asc">Style A-Z</SelectItem>
        </SelectContent>
      </Select>

      {/* Indicateur filtres actifs + Reset */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={onResetFilters}
        >
          <X className="h-3 w-3" />
          Réinitialiser
          <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">
            {activeFiltersCount}
          </Badge>
        </Button>
      )}
    </div>
  );
};
