import { useState, useEffect } from 'react';
import { Heart, Play, Clock, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { usePlayer } from '@/hooks/usePlayer';
import { useToast } from '@/hooks/use-toast';

interface FavoriteTrack {
  id: string;
  song_id: string;
  created_at: string;
  song?: {
    id: string;
    title: string;
    item_code?: string;
    audio_url?: string;
    rang?: string;
  };
}

export const FavoritesTab = () => {
  const [favorites, setFavorites] = useState<FavoriteTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      
      // D'abord récupérer les favoris de l'utilisateur
      const { data: favoritesData, error: favError } = await supabase
        .from('med_mng_user_favorites')
        .select('id, song_id, created_at')
        .order('created_at', { ascending: false });

      if (favError) {
        console.error('Erreur favorites:', favError);
        setFavorites([]);
        return;
      }

      // Puis récupérer les détails des chansons
      if (favoritesData && favoritesData.length > 0) {
        const songIds = favoritesData.map(f => f.song_id);
        const { data: songsData } = await supabase
          .from('user_generated_music')
          .select('id, title, item_code, audio_url, rang')
          .in('id', songIds);

        const enrichedFavorites = favoritesData.map(fav => ({
          ...fav,
          song: songsData?.find(s => s.id === fav.song_id)
        }));

        setFavorites(enrichedFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('med_mng_user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({
        title: "Retiré des favoris",
        description: "La piste a été retirée de vos favoris"
      });
    } catch (error) {
      console.error('Erreur suppression favori:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive"
      });
    }
  };

  const handlePlay = (favorite: FavoriteTrack) => {
    if (favorite.song) {
      playTrack({
        id: favorite.song.id,
        title: favorite.song.title,
        item_code: favorite.song.item_code || 'N/A',
        type: favorite.song.rang === 'A' ? 'rang_a' : favorite.song.rang === 'B' ? 'rang_b' : 'mix',
        stream_url: favorite.song.audio_url,
        created_at: favorite.created_at
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Mes Favoris
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Mes Favoris
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium mb-2">Aucun favori</p>
          <p className="text-muted-foreground">
            Marquez vos pistes préférées avec ❤️ pour les retrouver ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-destructive fill-destructive" />
          Mes Favoris
          <Badge variant="secondary" className="ml-2">
            {favorites.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {favorites.map(favorite => (
          <div 
            key={favorite.id}
            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePlay(favorite)}
              className="h-10 w-10 rounded-full hover:bg-primary hover:text-primary-foreground"
            >
              {currentTrack?.id === favorite.song?.id && isPlaying ? (
                <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                  <div className="bg-current animate-pulse" />
                  <div className="bg-current animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="bg-current animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="bg-current animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">
                {favorite.song?.title || 'Piste inconnue'}
              </h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{favorite.song?.item_code || 'N/A'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(favorite.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFavorite(favorite.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Heart className="h-4 w-4 fill-current" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
