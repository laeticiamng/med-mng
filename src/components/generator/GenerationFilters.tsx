/**
 * Filtres avancés pour l'historique des générations
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Calendar, Filter, Music, Star, Tag } from 'lucide-react';
import React from 'react';

export type FilterType = 'all' | 'favorites' | 'rang_a' | 'rang_b' | 'rang_ab';
export type SortType = 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc';
export type DateRangeType = 'all' | 'today' | 'week' | 'month' | 'custom';

interface GenerationFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  sortBy: SortType;
  setSortBy: (sort: SortType) => void;
  dateRange: DateRangeType;
  setDateRange: (range: DateRangeType) => void;
  styleFilter: string;
  setStyleFilter: (style: string) => void;
  availableStyles: string[];
  activeFiltersCount: number;
  onClearFilters: () => void;
  className?: string;
}

export const GenerationFilters: React.FC<GenerationFiltersProps> = ({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  styleFilter,
  setStyleFilter,
  availableStyles,
  activeFiltersCount,
  onClearFilters,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Filtre rapide par rang */}
      <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Tous les rangs" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="favorites">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-warning" />
              Favoris
            </span>
          </SelectItem>
          <SelectItem value="rang_a">Rang A</SelectItem>
          <SelectItem value="rang_b">Rang B</SelectItem>
          <SelectItem value="rang_ab">Rang A+B</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtres avancés dans un popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Filter className="h-3 w-3" />
            <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filtres avancés</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-6 text-xs">
                  Réinitialiser
                </Button>
              )}
            </div>
            
            <Separator />
            
            {/* Période */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Période
              </Label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeType)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Style musical */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Music className="h-3 w-3" />
                Style musical
              </Label>
              <Select value={styleFilter} onValueChange={setStyleFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tous les styles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les styles</SelectItem>
                  {availableStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tri */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Trier par
              </Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Plus récent</SelectItem>
                  <SelectItem value="date_asc">Plus ancien</SelectItem>
                  <SelectItem value="title_asc">Titre A-Z</SelectItem>
                  <SelectItem value="title_desc">Titre Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Tags des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {filter !== 'all' && (
            <Badge variant="secondary" className="text-xs gap-1">
              {filter === 'favorites' ? '⭐ Favoris' : `Rang ${filter.replace('rang_', '').toUpperCase()}`}
              <button onClick={() => setFilter('all')} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {dateRange !== 'all' && (
            <Badge variant="secondary" className="text-xs gap-1">
              {dateRange === 'today' ? "Aujourd'hui" : dateRange === 'week' ? 'Semaine' : 'Mois'}
              <button onClick={() => setDateRange('all')} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {styleFilter && styleFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs gap-1">
              {styleFilter}
              <button onClick={() => setStyleFilter('all')} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
