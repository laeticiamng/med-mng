import { useAuth } from '@/components/med-mng/AuthProvider';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTE_PATHS } from '@/config/routes';
import { fetchItemsWithMeta } from '@/services/medMngItemsService';
import type { ItemStatus } from '@/types/medMngItems';
import { normalizeSearchText } from '@/utils/searchNormalization';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Heart, LayoutGrid, List, Music2, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
    <MedMngLayout className="bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header - Simplifié */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Bibliothèque des items
          </h1>
          <p className="text-muted-foreground text-sm">
            Filtre par spécialité, type ou mots-clés pour aller vite.
          </p>
        </div>

        {/* Barre de recherche principale - Mise en avant */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher un item, un code, une spécialité..."
            className="pl-12 h-12 text-base rounded-xl border-border/50 bg-card/50"
          />
          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <p className="text-xs text-muted-foreground mt-1.5 ml-1">
              Saisissez au moins 3 caractères
            </p>
          )}
        </div>

        {/* Filtres - Présentés comme outils */}
        <Card className="border-border/30 bg-card/40 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                Filtrer les items
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
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

            {/* Filtres actifs - Badges cliquables */}
            {(debouncedSearch.length >= 3 || specialtyFilter !== 'all' || tagFilter !== 'all' || typeFilter !== 'all' || rangFilter !== 'all' || statusFilter !== 'all') && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground py-1">Actifs :</span>
                {debouncedSearch.length >= 3 && (
                  <Badge variant="secondary" className="text-xs">
                    "{debouncedSearch}"
                  </Badge>
                )}
                {specialtyFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/20" onClick={() => setSpecialtyFilter('all')}>
                    {specialtyFilter} ✕
                  </Badge>
                )}
                {tagFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/20" onClick={() => setTagFilter('all')}>
                    {tagFilter} ✕
                  </Badge>
                )}
                {typeFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/20" onClick={() => setTypeFilter('all')}>
                    {typeFilter} ✕
                  </Badge>
                )}
                {rangFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/20" onClick={() => setRangFilter('all')}>
                    Rang {rangFilter} ✕
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/20" onClick={() => setStatusFilter('all')}>
                    {statusLabel[statusFilter as ItemStatus]} ✕
                  </Badge>
                )}
              </div>
            )}

            {/* Compteur de résultats + Vue */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {filteredItems.length} item{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* États loading/error/empty */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-border/30">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
            <p className="col-span-full text-center text-sm text-muted-foreground">Un instant…</p>
          </div>
        )}

        {isError && (
          <Card className="border-border/30">
            <CardContent className="p-8 text-center space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />
              <h2 className="text-lg font-medium">Quelque chose n'a pas fonctionné</h2>
              <p className="text-sm text-muted-foreground">
                Tu peux réessayer tranquillement.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && filteredItems.length === 0 && (
          <Card className="border-border/30">
            <CardContent className="p-8 text-center space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />
              <h2 className="text-lg font-medium">Rien ici pour l'instant</h2>
              <p className="text-sm text-muted-foreground">
                Ajuste tes filtres ou essaie un autre terme.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Liste des items - Cards aérées */}
        {!isLoading && !isError && filteredItems.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {filteredItems.map(item => (
              <Card 
                key={item.id} 
                className="border-border/30 bg-card/60 hover:bg-card hover:shadow-md hover:border-border/50 transition-all duration-200 cursor-pointer rounded-xl overflow-hidden group"
                onClick={() => navigate(ROUTE_PATHS.medMngItemDetail.replace(':itemCode', item.code))}
              >
                <CardContent className={viewMode === 'grid' ? 'p-5 space-y-3' : 'p-4'}>
                  {/* Titre - Plus visible, plus contrasté */}
                  <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  {/* Spécialité - Plus discret */}
                  <p className="text-sm text-muted-foreground/80">
                    {item.specialty ?? 'Spécialité non précisée'}
                  </p>

                  {/* Tags - Couleurs plus douces, espacement augmenté */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="outline" className="text-xs font-medium bg-muted/30">
                      {item.code}
                    </Badge>
                    {item.rang && (
                      <Badge variant="secondary" className="text-xs bg-secondary/50">
                        Rang {item.rang}
                      </Badge>
                    )}
                    <Badge 
                      variant={statusVariant[item.status]}
                      className="text-xs"
                    >
                      {statusLabel[item.status]}
                    </Badge>
                  </div>

                  {/* Footer avec indicateurs */}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/20">
                    <div className="flex items-center gap-2">
                      {item.hasAudio && (
                        <Badge variant="outline" className="text-xs py-0.5 px-1.5 bg-primary/5 border-primary/20">
                          <Music2 className="h-3 w-3 text-primary" />
                        </Badge>
                      )}
                      {item.isFavorite && (
                        <Heart className="h-3.5 w-3.5 text-destructive fill-current" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{item.score}%</span>
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
