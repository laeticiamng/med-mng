import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, SlidersHorizontal, Star, LayoutGrid, List, Heart, Music2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTE_PATHS } from '@/config/routes';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { fetchItemsWithMeta } from '@/services/medMngItemsService';
import type { ItemStatus } from '@/types/medMngItems';
import { normalizeSearchText } from '@/utils/searchNormalization';

const statusLabel: Record<ItemStatus, string> = {
  not_started: 'À réviser',
  in_progress: 'En cours',
  revised: 'Révisé',
};

const statusVariant: Record<ItemStatus, 'default' | 'secondary' | 'outline'> = {
  not_started: 'secondary',
  in_progress: 'default',
  revised: 'outline',
};

const MedMngItemsLibraryComponent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [specialtyFilter, setSpecialtyFilter] = useState(searchParams.get('specialty') ?? 'all');
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') ?? 'all');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') ?? 'all');
  const [rangFilter, setRangFilter] = useState(searchParams.get('rang') ?? 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') ?? 'recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (searchParams.get('view') as 'grid' | 'list') ?? 'grid'
  );

  const { data: items, isLoading, isError } = useQuery({
    queryKey: ['med-mng-items-library', user?.id],
    queryFn: () => fetchItemsWithMeta(user?.id),
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch && debouncedSearch.length >= 3) {
      params.set('q', debouncedSearch);
    }
    if (specialtyFilter !== 'all') {
      params.set('specialty', specialtyFilter);
    }
    if (tagFilter !== 'all') {
      params.set('tag', tagFilter);
    }
    if (typeFilter !== 'all') {
      params.set('type', typeFilter);
    }
    if (rangFilter !== 'all') {
      params.set('rang', rangFilter);
    }
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    if (sortBy !== 'recent') {
      params.set('sort', sortBy);
    }
    if (viewMode !== 'grid') {
      params.set('view', viewMode);
    }
    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    specialtyFilter,
    tagFilter,
    typeFilter,
    rangFilter,
    statusFilter,
    sortBy,
    viewMode,
    setSearchParams,
  ]);

  const specialties = useMemo(() => {
    const values = new Map<string, number>();
    (items ?? []).forEach(item => {
      if (item.specialty) {
        values.set(item.specialty, (values.get(item.specialty) ?? 0) + 1);
      }
    });
    return Array.from(values.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const tags = useMemo(() => {
    const values = new Set<string>();
    (items ?? []).forEach(item => {
      item.tags.forEach(tag => values.add(tag));
    });
    return Array.from(values).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!items) {
      return [];
    }

    const trimmedSearch = debouncedSearch.trim();
    const isSearchActive = trimmedSearch.length >= 3;
    const searchLower = normalizeSearchText(trimmedSearch);

    const result = items.filter(item => {
      const matchesSearch =
        !isSearchActive ||
        normalizeSearchText(item.title).includes(searchLower) ||
        normalizeSearchText(item.code).includes(searchLower) ||
        normalizeSearchText(item.specialty ?? '').includes(searchLower) ||
        item.keywords.some(keyword => normalizeSearchText(keyword).includes(searchLower));
      const matchesSpecialty =
        specialtyFilter === 'all' || item.specialty === specialtyFilter;
      const matchesTag = tagFilter === 'all' || item.tags.includes(tagFilter);
      const matchesType = typeFilter === 'all' || item.itemType === typeFilter;
      const matchesRang = rangFilter === 'all' || item.rang === rangFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesTag &&
        matchesType &&
        matchesRang &&
        matchesStatus
      );
    });

    if (sortBy === 'progress') {
      return result.sort((a, b) => b.score - a.score);
    }

    if (sortBy === 'alpha') {
      return result.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === 'popularity') {
      return result.sort((a, b) => b.popularityScore - a.popularityScore);
    }

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [items, debouncedSearch, specialtyFilter, tagFilter, typeFilter, rangFilter, statusFilter, sortBy]);

  return (
    <MedMngLayout className="bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Bibliothèque des items
            </h1>
            <p className="text-muted-foreground">
              {filteredItems.length} item{filteredItems.length > 1 ? 's' : ''} à explorer
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTE_PATHS.medMngProgress)}
            className="gap-2"
          >
            <Star className="h-4 w-4" />
            Voir ma progression
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Rechercher un item, un code, une spécialité..."
                  className="pl-9"
                />
                {searchTerm.length > 0 && searchTerm.length < 3 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Saisissez au moins 3 caractères pour lancer la recherche.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                Filtres rapides
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSpecialtyFilter('all');
                    setTagFilter('all');
                    setTypeFilter('all');
                    setRangFilter('all');
                    setStatusFilter('all');
                    setSortBy('recent');
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les spécialités</SelectItem>
                  {specialties.map(([specialty, count]) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty} ({count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les tags</SelectItem>
                  {tags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="EDN">EDN</SelectItem>
                  <SelectItem value="ECOS">ECOS</SelectItem>
                  <SelectItem value="SD">SD</SelectItem>
                </SelectContent>
              </Select>

              <Select value={rangFilter} onValueChange={setRangFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Rang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rangs</SelectItem>
                  <SelectItem value="A">Rang A</SelectItem>
                  <SelectItem value="B">Rang B</SelectItem>
                  <SelectItem value="AB">Mix</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="not_started">À réviser</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="revised">Révisé</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Récents</SelectItem>
                  <SelectItem value="alpha">Alphabétique</SelectItem>
                  <SelectItem value="progress">% progression</SelectItem>
                  <SelectItem value="popularity">Popularité</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {debouncedSearch.length >= 3 && (
                <Badge variant="secondary">
                  Recherche: {debouncedSearch}
                </Badge>
              )}
              {specialtyFilter !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSpecialtyFilter('all')}>
                  Spécialité: {specialtyFilter} ✕
                </Badge>
              )}
              {tagFilter !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setTagFilter('all')}>
                  Tag: {tagFilter} ✕
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setTypeFilter('all')}>
                  Type: {typeFilter} ✕
                </Badge>
              )}
              {rangFilter !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setRangFilter('all')}>
                  Rang: {rangFilter} ✕
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setStatusFilter('all')}>
                  Statut: {statusLabel[statusFilter as ItemStatus]} ✕
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <BookOpen className="h-10 w-10 mx-auto text-destructive" />
              <h2 className="text-lg font-semibold">Impossible de charger les items</h2>
              <p className="text-muted-foreground">
                Une erreur est survenue. Réessayez dans quelques instants.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && filteredItems.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />
              <h2 className="text-lg font-semibold">Aucun item trouvé</h2>
              <p className="text-muted-foreground">
                Ajustez vos filtres ou essayez un autre terme de recherche.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && filteredItems.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
            {filteredItems.map(item => (
              <Card key={item.id} className="transition hover:shadow-md">
                <CardContent className={viewMode === 'grid' ? 'p-6 space-y-4' : 'p-4'}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{item.code}</Badge>
                        {item.rang && <Badge variant="secondary">Rang {item.rang}</Badge>}
                        <Badge variant={statusVariant[item.status]}>
                          {statusLabel[item.status]}
                        </Badge>
                        {item.hasAudio && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Music2 className="h-3 w-3" />
                            Audio
                          </Badge>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.specialty ?? 'Spécialité non précisée'} • {item.itemType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className={`h-4 w-4 ${item.isFavorite ? 'text-destructive' : 'text-muted-foreground'}`} />
                      <Badge variant="outline">{item.score}%</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.tags.length === 0 ? (
                      <Badge variant="secondary">Sans tag</Badge>
                    ) : (
                      item.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    )}
                  </div>

                  <div className={viewMode === 'grid' ? '' : 'flex justify-end'}>
                    <Button
                      className={viewMode === 'grid' ? 'w-full' : ''}
                      onClick={() =>
                        navigate(ROUTE_PATHS.medMngItemDetail.replace(':itemCode', item.code))
                      }
                    >
                      Voir la fiche
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MedMngLayout>
  );
};

export const MedMngItemsLibrary = withAuth(MedMngItemsLibraryComponent);
