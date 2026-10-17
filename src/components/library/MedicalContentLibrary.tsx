import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { GlowingCard } from '@/components/ui/glowing-card';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { usePlayer } from '@/hooks/usePlayer';
import { Heart, Music, Pause, Play, Search, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';

// Les spécialités, années et difficultés ne sont pas des données du produit :
// elles étaient déduites de tranches de numéros d'item et ont été retirées.
// La recherche porte sur le titre et le code d'item.

export const MedicalContentLibrary = () => {
  const { tracks, loading, toggleFavorite, totalTracks } = useMusicLibrary();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [search, setSearch] = useState('');

  const enrichedTracks = useMemo(() =>
    tracks.map(t => ({
      ...t,
      durationLabel: t.duration ? `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2, '0')}` : '—',
    })),
  [tracks]);

  const filtered = useMemo(() =>
    enrichedTracks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.item_code?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
  [enrichedTracks, search]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-0"><Skeleton className="h-64 w-full rounded-lg" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par titre ou code d'item…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} chanson{filtered.length > 1 ? 's' : ''} sur {totalTracks}
      </p>

      {/* Song cards grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Music className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Aucune chanson trouvée</h3>
            <p className="text-sm text-muted-foreground">Essayez une autre recherche</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(track => {
            const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
            const gradient = 'from-primary/80 to-primary/60';

            return (
              <GlowingCard key={track.id} className="overflow-hidden group">
                {/* Cover area */}
                <div className={`relative aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Music className="h-16 w-16 text-white/30" />

                  {/* Language flag */}
                  <span className="absolute top-3 right-3 text-lg drop-shadow-md">🇫🇷</span>

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <Button
                      onClick={() => playTrack(track)}
                      size="lg"
                      className="rounded-full h-14 w-14 bg-white text-foreground hover:bg-white/90 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-0.5" />
                      )}
                    </Button>
                  </div>

                  {/* Duration */}
                  <span className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {track.durationLabel}
                  </span>
                </div>

                {/* Info section */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">{track.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{track.item_code || 'N/A'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0"
                      onClick={() => toggleFavorite(track.id)}
                    >
                      <Heart className={`h-4 w-4 ${track.is_favorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                </div>
              </GlowingCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
