import React, { useState, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Play, 
  Pause, 
  Search, 
  Music,
  Star,
  Clock,
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Loader2
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

interface FavoriteSong {
  id: string;
  song_id: string;
  title: string;
  suno_audio_id: string;
  created_at: string;
}

const FavoriteSongItem = memo(({ song, onPlay, onRemove, isPlaying, isCurrentSong }: {
  song: FavoriteSong;
  onPlay: (song: FavoriteSong) => void;
  onRemove: (id: string) => void;
  isPlaying: boolean;
  isCurrentSong: boolean;
}) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = useCallback(async () => {
    setIsRemoving(true);
    try {
      await onRemove(song.id);
    } finally {
      setIsRemoving(false);
    }
  }, [song.id, onRemove]);

  return (
    <div className={`group p-3 rounded-lg border transition-all duration-200 hover:bg-accent/50 ${
      isCurrentSong ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Button
            size="sm"
            variant={isCurrentSong ? "default" : "ghost"}
            onClick={() => onPlay(song)}
            className="flex-shrink-0"
            disabled={isRemoving}
            aria-label={isPlaying && isCurrentSong ? "Pause" : "Play"}
          >
            {isPlaying && isCurrentSong ? (
              <Pause size={14} />
            ) : (
              <Play size={14} />
            )}
          </Button>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate" title={song.title}>
              {song.title}
            </h4>
            <p className="text-xs text-muted-foreground flex items-center">
              <Clock size={10} className="mr-1" />
              {new Date(song.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-destructive hover:text-destructive"
            aria-label="Retirer des favoris"
          >
            {isRemoving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

FavoriteSongItem.displayName = 'FavoriteSongItem';

export const FavoritesSidebar: React.FC = memo(() => {
  const { favorites, loading, removeFavorite, clearAllFavorites } = useFavorites();
  const { currentTrack, isPlaying, play, pause } = useGlobalAudio();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtrer et trier les favoris
  const filteredAndSortedFavorites = React.useMemo(() => {
    let filtered = favorites.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [favorites, searchQuery, sortOrder]);

  const handlePlay = useCallback(async (song: FavoriteSong) => {
    try {
      if (currentTrack?.url === song.suno_audio_id && isPlaying) {
        pause();
      } else {
        await play({
          title: song.title,
          url: song.suno_audio_id,
          duration: 0
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire cette chanson",
        variant: "destructive"
      });
    }
  }, [currentTrack, isPlaying, play, pause, toast]);

  const handleRemoveFavorite = useCallback(async (favoriteId: string) => {
    const success = await removeFavorite(favoriteId);
    if (success) {
      toast({
        title: "Favori supprimé",
        description: "La chanson a été retirée de vos favoris"
      });
    }
  }, [removeFavorite, toast]);

  const handleClearAll = useCallback(async () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
      return;
    }

    const success = await clearAllFavorites();
    if (success) {
      setShowClearConfirm(false);
      toast({
        title: "Favoris supprimés",
        description: "Tous vos favoris ont été supprimés"
      });
    }
  }, [showClearConfirm, clearAllFavorites, toast]);

  return (
    <Card className="h-full border-0 rounded-none bg-background/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Heart className="text-primary" size={20} />
          <span>
            <TranslatedText text="Mes Favoris" />
          </span>
          <Badge variant="secondary" className="ml-auto">
            {favorites.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Rechercher dans les favoris..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Contrôles */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="text-xs"
          >
            {sortOrder === 'desc' ? (
              <>
                <SortDesc size={12} className="mr-1" />
                Plus récent
              </>
            ) : (
              <>
                <SortAsc size={12} className="mr-1" />
                Plus ancien
              </>
            )}
          </Button>

          {favorites.length > 0 && (
            <Button
              size="sm"
              variant={showClearConfirm ? "destructive" : "ghost"}
              onClick={handleClearAll}
              className="text-xs"
            >
              <Trash2 size={12} className="mr-1" />
              {showClearConfirm ? "Confirmer ?" : "Tout vider"}
            </Button>
          )}
        </div>

        <Separator />

        {/* Liste des favoris */}
        <ScrollArea className="h-[calc(100vh-240px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : filteredAndSortedFavorites.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              {searchQuery ? (
                <>
                  <Search className="mx-auto text-muted-foreground" size={32} />
                  <p className="text-muted-foreground text-sm">
                    Aucun favori trouvé pour "{searchQuery}"
                  </p>
                </>
              ) : (
                <>
                  <Heart className="mx-auto text-muted-foreground" size={32} />
                  <p className="text-muted-foreground text-sm">
                    <TranslatedText text="Aucun favori pour le moment" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <TranslatedText text="Ajoutez des chansons à vos favoris en cliquant sur ❤️" />
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedFavorites.map((song) => (
                <FavoriteSongItem
                  key={song.id}
                  song={song}
                  onPlay={handlePlay}
                  onRemove={handleRemoveFavorite}
                  isPlaying={isPlaying}
                  isCurrentSong={currentTrack?.url === song.suno_audio_id}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Stats */}
        {favorites.length > 0 && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground text-center">
              <Star size={12} className="inline mr-1" />
              {favorites.length} chanson{favorites.length !== 1 ? 's' : ''} favorite{favorites.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

FavoritesSidebar.displayName = 'FavoritesSidebar';

export default FavoritesSidebar;