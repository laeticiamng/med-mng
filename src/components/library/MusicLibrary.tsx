import { useState } from 'react';
import { Search, Filter, Heart, Play, MoreHorizontal, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { usePlayer } from '@/hooks/usePlayer';

export const MusicLibrary = () => {
  const {
    tracks,
    loading,
    filters,
    updateFilters,
    resetFilters,
    toggleFavorite,
    removeFromLibrary,
    totalTracks,
    favoriteTracks,
    tracksByType
  } = useMusicLibrary();

  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rang_a': return 'Rang A';
      case 'rang_b': return 'Rang B';
      case 'mix': return 'Mix A+B';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rang_a': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'rang_b': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'mix': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ma Bibliothèque</h1>
          <p className="text-muted-foreground">
            {totalTracks} piste{totalTracks > 1 ? 's' : ''} • {favoriteTracks} favori{favoriteTracks > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalTracks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rang A</p>
                <p className="text-2xl font-bold">{tracksByType.rang_a}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rang B</p>
                <p className="text-2xl font-bold">{tracksByType.rang_b}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Mix A+B</p>
                <p className="text-2xl font-bold">{tracksByType.mix}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une piste ou un item..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.type} onValueChange={(value: any) => updateFilters({ type: value })}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="rang_a">Rang A</SelectItem>
                <SelectItem value="rang_b">Rang B</SelectItem>
                <SelectItem value="mix">Mix A+B</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value: any) => updateFilters({ sortBy: value })}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
                <SelectItem value="item_code">Item</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={filters.favorites ? "default" : "outline"}
              onClick={() => updateFilters({ favorites: !filters.favorites })}
              className="w-full sm:w-auto"
            >
              <Heart className={`h-4 w-4 mr-2 ${filters.favorites ? 'fill-current' : ''}`} />
              Favoris
            </Button>

            <Button variant="outline" onClick={resetFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Track List */}
      {tracks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune piste trouvée</h3>
            <p className="text-muted-foreground">
              {filters.search || filters.type !== 'all' || filters.favorites
                ? 'Aucune piste ne correspond à vos filtres'
                : 'Votre bibliothèque est vide. Générez votre première musique !'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <Card key={track.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Play Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playTrack(track)}
                    className="h-12 w-12 rounded-full hover:bg-primary hover:text-primary-foreground"
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                        <div className="bg-current animate-pulse"></div>
                        <div className="bg-current animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="bg-current animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="bg-current animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <Badge className={getTypeColor(track.type)}>
                        {getTypeLabel(track.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {track.item_code} • {new Date(track.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(track.id)}
                      className="h-8 w-8"
                    >
                      <Heart className={`h-4 w-4 ${track.is_favorite ? 'fill-current text-red-500' : ''}`} />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => playTrack(track)}>
                          <Play className="h-4 w-4 mr-2" />
                          Lire
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleFavorite(track.id)}>
                          <Heart className="h-4 w-4 mr-2" />
                          {track.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => removeFromLibrary(track.id)}
                          className="text-destructive"
                        >
                          Supprimer de la bibliothèque
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};