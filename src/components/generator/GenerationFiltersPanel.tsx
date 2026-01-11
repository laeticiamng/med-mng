/**
 * Panel de filtres pour l'historique de génération
 * ✅ NOUVEAU: UI complète pour filtrer/trier les tracks
 */

import React from 'react';
import { 
  Filter, X, Search, Calendar, Music2, Heart, SortAsc, SortDesc, 
  RotateCcw, ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { TranslatedText } from '@/components/TranslatedText';
import { 
  GenerationFilterType, 
  GenerationSortType, 
  GenerationDateRangeType 
} from '@/types/music';

interface GenerationFiltersPanelProps {
  filter: GenerationFilterType;
  sort: GenerationSortType;
  dateRange: GenerationDateRangeType;
  searchQuery: string;
  selectedStyles: string[];
  availableStyles: string[];
  activeFilterCount: number;
  filterStats: {
    total: number;
    filtered: number;
    favorites: number;
    byRang: { A: number; B: number; AB: number };
  };
  onFilterChange: (filter: GenerationFilterType) => void;
  onSortChange: (sort: GenerationSortType) => void;
  onDateRangeChange: (range: GenerationDateRangeType) => void;
  onSearchChange: (query: string) => void;
  onStylesChange: (styles: string[]) => void;
  onReset: () => void;
}

const FILTER_OPTIONS: { value: GenerationFilterType; label: string; icon?: typeof Heart }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'favorites', label: 'Favoris', icon: Heart },
  { value: 'rang_a', label: 'Rang A' },
  { value: 'rang_b', label: 'Rang B' },
  { value: 'rang_ab', label: 'Rang AB' },
  { value: 'completed', label: 'Terminées' },
  { value: 'generating', label: 'En cours' },
];

const SORT_OPTIONS: { value: GenerationSortType; label: string }[] = [
  { value: 'date_desc', label: 'Plus récent' },
  { value: 'date_asc', label: 'Plus ancien' },
  { value: 'title_asc', label: 'Titre A-Z' },
  { value: 'title_desc', label: 'Titre Z-A' },
  { value: 'duration_desc', label: 'Plus long' },
  { value: 'duration_asc', label: 'Plus court' },
];

const DATE_RANGE_OPTIONS: { value: GenerationDateRangeType; label: string }[] = [
  { value: 'all', label: 'Toutes dates' },
  { value: 'today', label: 'Aujourd\'hui' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'year', label: 'Cette année' },
];

export const GenerationFiltersPanel: React.FC<GenerationFiltersPanelProps> = ({
  filter,
  sort,
  dateRange,
  searchQuery,
  selectedStyles,
  availableStyles,
  activeFilterCount,
  filterStats,
  onFilterChange,
  onSortChange,
  onDateRangeChange,
  onSearchChange,
  onStylesChange,
  onReset,
}) => {
  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      onStylesChange(selectedStyles.filter(s => s !== style));
    } else {
      onStylesChange([...selectedStyles, style]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Barre de recherche + Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher par titre, code, style..."
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Tri */}
        <Select value={sort} onValueChange={(v) => onSortChange(v as GenerationSortType)}>
          <SelectTrigger className="w-full sm:w-40">
            <SortDesc className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        {activeFilterCount > 0 && (
          <Button variant="outline" size="icon" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtres rapides */}
      <div className="flex flex-wrap gap-2">
        {/* Filtre type */}
        {FILTER_OPTIONS.map(opt => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? 'default' : 'outline'}
            size="sm"
            className="h-8"
            onClick={() => onFilterChange(opt.value)}
          >
            {opt.icon && <opt.icon className="h-3.5 w-3.5 mr-1" />}
            {opt.label}
            {opt.value === 'favorites' && filterStats.favorites > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {filterStats.favorites}
              </Badge>
            )}
          </Button>
        ))}

        {/* Date range */}
        <Select value={dateRange} onValueChange={(v) => onDateRangeChange(v as GenerationDateRangeType)}>
          <SelectTrigger className="w-auto h-8">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Styles dropdown */}
        {availableStyles.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Music2 className="h-3.5 w-3.5 mr-1.5" />
                Styles
                {selectedStyles.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {selectedStyles.length}
                  </Badge>
                )}
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              {selectedStyles.length > 0 && (
                <>
                  <DropdownMenuItem onClick={() => onStylesChange([])}>
                    <X className="h-3.5 w-3.5 mr-2" />
                    Effacer sélection
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {availableStyles.map(style => (
                <DropdownMenuCheckboxItem
                  key={style}
                  checked={selectedStyles.includes(style)}
                  onCheckedChange={() => toggleStyle(style)}
                >
                  {style}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Résumé des filtres */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>
            {filterStats.filtered} sur {filterStats.total} résultat{filterStats.filtered !== 1 ? 's' : ''}
          </span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={onReset}
          >
            Réinitialiser
          </Button>
        </div>
      )}
    </div>
  );
};
