
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Heart, Trash2, Music, MoreVertical, ListPlus, Flame, Star } from 'lucide-react';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { toast } from 'sonner';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useItemTitle } from '@/hooks/useItemTitle';
import { AIGeneratedBadge } from '@/components/common/AIGeneratedBadge';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

interface Song {
  id: string;
  title: string;
  suno_audio_id: string;
  meta: any;
  created_at: string;
  added_to_library_at: string;
  is_liked: boolean;
}

interface SongCardProps {
  song: Song;
  onPlay: () => void;
  onRemove: () => void;
  onToggleLike: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  onPlay, 
  onRemove, 
  onToggleLike 
}) => {
  const medMngApi = useMedMngApi();
  const { playlists, addSongToPlaylist } = usePlaylists();
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();
  const hasTrackedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  
  // Get the item code from metadata, or fallback to parsing the title
  const itemCode = song.meta?.itemCode || song.meta?.selectedItem || song.meta?.item_code;
  const { title: itemTitle } = useItemTitle(itemCode);
  
  // Si pas de itemCode dans les métas, essayer d'extraire du titre (ex: "Rang A - EDN - style")
  const titleParts = !itemCode && song.title ? song.title.split(' - ') : [];
  const fallbackItemCode = titleParts.length >= 2 ? titleParts[1].trim() : null;
  const { title: fallbackTitle } = useItemTitle(fallbackItemCode || undefined);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      logActivity({
        activity_type: 'music_generation',
        count: 1,
        metadata: { component: 'song_card', action: 'view', songId: song.id }
      });
    }
  }, [song.id]);

  const handlePlay = async () => {
    logActivity({
      activity_type: 'music_generation',
      count: 1,
      metadata: { component: 'song_card', action: 'play', songId: song.id }
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await addPoints(user.id, 'itemReviewed');
    }
    
    onPlay();
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await medMngApi.removeFromLibrary(song.id);
      toast.success('Chanson retirée de la bibliothèque');
      logActivity({
        activity_type: 'music_generation',
        count: 1,
        metadata: { component: 'song_card', action: 'remove', songId: song.id }
      });
      onRemove();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error removing song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = async () => {
    setIsLikeLoading(true);
    try {
      const result = await medMngApi.toggleLike(song.id);
      toast.success(result.liked ? 'Chanson aimée ❤️' : 'Like retiré');
      logActivity({
        activity_type: 'music_generation',
        count: 1,
        metadata: { component: 'song_card', action: result.liked ? 'like' : 'unlike', songId: song.id }
      });
      onToggleLike();
    } catch (error) {
      toast.error('Erreur lors du like');
      console.error('Error toggling like:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      const success = await addSongToPlaylist(playlistId, song.id);
      if (success) {
        toast.success('Chanson ajoutée à la playlist');
        logActivity({
          activity_type: 'music_generation',
          count: 1,
          metadata: { component: 'song_card', action: 'add_to_playlist', songId: song.id, playlistId }
        });
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout à la playlist');
      console.error('Error adding to playlist:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDuration = () => {
    return song.meta?.duration || '3:30';
  };

  // Parse le titre pour extraire les informations (ex: "Rang A - EDN - electropop")
  const parseTitle = () => {
    const parts = song.title.split(' - ');
    if (parts.length >= 2) {
      return {
        rang: parts[0], // "Rang A"
        item: parts[1], // "EDN"
        style: parts[2] || '', // "electropop"
        fullTitle: song.title
      };
    }
    return {
      rang: '',
      item: '',
      style: '',
      fullTitle: song.title
    };
  };

  const titleInfo = parseTitle();

  return (
    <Card className="group hover:shadow-soft transition-all duration-200 bg-card border-border/40 hover:border-border/60">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Play Button */}
          <button
            onClick={handlePlay}
            className="relative w-12 h-12 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors"
          >
            <Play className="h-5 w-5 text-primary ml-0.5" />
          </button>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground text-sm leading-tight truncate">
              {itemTitle || fallbackTitle || titleInfo.item || song.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {titleInfo.rang && <span>{titleInfo.rang}</span>}
              {titleInfo.style && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="truncate">{titleInfo.style}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">{getDuration()}</span>
              {song.is_liked && (
                <Heart className="h-3 w-3 fill-destructive text-destructive" />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleLike}
              disabled={isLikeLoading}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              {isLikeLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
              ) : (
                <Heart className={`h-4 w-4 ${song.is_liked ? 'fill-current text-destructive' : ''}`} />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePlay}>
                  <Play className="h-4 w-4 mr-2" />
                  Écouter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ListPlus className="h-4 w-4 mr-2" />
                    Ajouter à une playlist
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {playlists && playlists.length > 0 ? (
                      playlists.map((playlist) => (
                        <DropdownMenuItem 
                          key={playlist.id}
                          onClick={() => handleAddToPlaylist(playlist.id)}
                        >
                          {playlist.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        Aucune playlist
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleRemove} 
                  disabled={isLoading}
                  className="text-destructive focus:text-destructive"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Retirer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
