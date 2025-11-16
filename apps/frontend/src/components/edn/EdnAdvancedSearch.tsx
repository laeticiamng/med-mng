/**
 * Composant de Recherche Avancée EDN
 * Recherche full-text avec filtres avancés et ranking de pertinence
 */

import { useState, useEffect } from 'react';
import { Search, Filter, X, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEdnSearch, useEdnAdvancedSearch } from '@/hooks/useEdnSearch';
import { useEdnStatsBySpecialite } from '@/hooks/useEdnQuality';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface SearchFilters {
  searchTerm: string;
  specialite?: string;
  minScore: number;
  maxScore: number;
  validatedOnly: boolean;
}

export default function EdnAdvancedSearch() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    specialite: undefined,
    minScore: 0,
    maxScore: 100,
    validatedOnly: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.searchTerm]);

  // Charger les spécialités pour le filtre
  const { data: specialties } = useEdnStatsBySpecialite();

  // Recherche simple ou avancée selon les filtres actifs
  const useSimpleSearch =
    !filters.specialite &&
    filters.minScore === 0 &&
    filters.maxScore === 100 &&
    !filters.validatedOnly;

  const { data: simpleResults, isLoading: simpleLoading } = useEdnSearch(
    debouncedSearch,
    {
      limit: 20,
      enabled: useSimpleSearch && debouncedSearch.length >= 2,
    }
  );

  const { data: advancedResults, isLoading: advancedLoading } = useEdnAdvancedSearch({
    searchTerm: debouncedSearch,
    specialite: filters.specialite,
    minScore: filters.minScore === 0 ? undefined : filters.minScore,
    maxScore: filters.maxScore === 100 ? undefined : filters.maxScore,
    validated: filters.validatedOnly || undefined,
    limit: 20,
  });

  const results = useSimpleSearch ? simpleResults : advancedResults;
  const isLoading = useSimpleSearch ? simpleLoading : advancedLoading;

  const handleReset = () => {
    setFilters({
      searchTerm: '',
      specialite: undefined,
      minScore: 0,
      maxScore: 100,
      validatedOnly: false,
    });
    setShowAdvanced(false);
  };

  const activeFiltersCount =
    (filters.specialite ? 1 : 0) +
    (filters.minScore > 0 ? 1 : 0) +
    (filters.maxScore < 100 ? 1 : 0) +
    (filters.validatedOnly ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Barre de recherche principale */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un item EDN (titre, code, mots-clés...)"
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
            }
            className="pl-10 pr-10"
          />
          {filters.searchTerm && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchTerm: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={handleReset}>
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Spécialité */}
            <div className="space-y-2">
              <Label htmlFor="specialite">Spécialité médicale</Label>
              <Select
                value={filters.specialite || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    specialite: value === 'all' ? undefined : value,
                  }))
                }
              >
                <SelectTrigger id="specialite">
                  <SelectValue placeholder="Toutes les spécialités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les spécialités</SelectItem>
                  {specialties?.map((spec) => (
                    <SelectItem key={spec.specialite} value={spec.specialite}>
                      {spec.specialite} ({spec.item_count} items)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Score de complétude */}
            <div className="space-y-4">
              <Label>Score de complétude</Label>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Minimum</span>
                    <span className="font-medium">{filters.minScore}%</span>
                  </div>
                  <Slider
                    value={[filters.minScore]}
                    onValueChange={([value]) =>
                      setFilters((prev) => ({ ...prev, minScore: value }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Maximum</span>
                    <span className="font-medium">{filters.maxScore}%</span>
                  </div>
                  <Slider
                    value={[filters.maxScore]}
                    onValueChange={([value]) =>
                      setFilters((prev) => ({ ...prev, maxScore: value }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Items validés uniquement */}
            <div className="flex items-center justify-between">
              <Label htmlFor="validated" className="cursor-pointer">
                Items validés uniquement
              </Label>
              <Switch
                id="validated"
                checked={filters.validatedOnly}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({ ...prev, validatedOnly: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats de recherche */}
      <div className="space-y-4">
        {/* Info résultats */}
        {debouncedSearch && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {isLoading ? (
                'Recherche en cours...'
              ) : (
                <>
                  {results?.length || 0} résultat
                  {(results?.length || 0) > 1 ? 's' : ''} pour "{debouncedSearch}"
                </>
              )}
            </span>

            {!useSimpleSearch && (
              <Badge variant="secondary">Recherche avancée</Badge>
            )}
          </div>
        )}

        {/* Liste des résultats */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : debouncedSearch && results && results.length > 0 ? (
          <div className="space-y-3">
            {results.map((item) => (
              <SearchResultCard
                key={item.item_code}
                item={item}
                onClick={() => navigate(`/edn-complete/${item.item_code}`)}
              />
            ))}
          </div>
        ) : debouncedSearch && results && results.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
              <p className="text-sm text-muted-foreground">
                Essayez de modifier vos filtres ou votre terme de recherche
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Recherchez un item EDN
              </h3>
              <p className="text-sm text-muted-foreground">
                Utilisez la barre de recherche ci-dessus pour trouver des items
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================
// Sous-composants
// ============================================

function SearchResultCard({
  item,
  onClick,
}: {
  item: any;
  onClick: () => void;
}) {
  const scoreColor =
    item.completeness_score >= 80
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : item.completeness_score >= 60
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

  return (
    <Card
      className="cursor-pointer hover:bg-accent transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* En-tête */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono">
                {item.item_code}
              </Badge>

              {item.specialite && (
                <Badge variant="secondary">{item.specialite}</Badge>
              )}

              {/* Score de pertinence pour recherche simple */}
              {item.rank !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {(item.rank * 100).toFixed(0)}% pertinent
                </Badge>
              )}
            </div>

            {/* Titre */}
            <h3 className="font-medium text-lg leading-tight">
              {item.title}
            </h3>

            {/* Subtitle */}
            {item.subtitle && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.subtitle}
              </p>
            )}
          </div>

          {/* Score de complétude */}
          <div className="text-right">
            <Badge className={scoreColor}>
              {item.completeness_score}%
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Complétude
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
