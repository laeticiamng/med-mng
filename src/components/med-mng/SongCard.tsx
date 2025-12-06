
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Heart, Trash2, Music, MoreVertical, ListPlus } from 'lucide-react';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { toast } from 'sonner';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useItemTitle } from '@/hooks/useItemTitle';
import { AIGeneratedBadge } from '@/components/common/AIGeneratedBadge';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  
  // Get the item code from metadata, or fallback to parsing the title
  const itemCode = song.meta?.itemCode || song.meta?.selectedItem || song.meta?.item_code;
  const { title: itemTitle } = useItemTitle(itemCode);
  
  // Si pas de itemCode dans les métas, essayer d'extraire du titre (ex: "Rang A - EDN - style")
  const titleParts = !itemCode && song.title ? song.title.split(' - ') : [];
  const fallbackItemCode = titleParts.length >= 2 ? titleParts[1].trim() : null;
  const { title: fallbackTitle } = useItemTitle(fallbackItemCode || undefined);

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await medMngApi.removeFromLibrary(song.id);
      toast.success('Chanson retirée de la bibliothèque');
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
    <Card className="group hover:shadow-lg transition-all duration-200 bg-white touch-manipulation">
      <CardContent className="p-0">
        {/* Cover Image */}
        <div className="relative aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
          <Music className="h-8 w-8 sm:h-12 sm:w-12 text-white/80" />
          
          {/* AI Badge (Conformité AI Act) */}
          <div className="absolute top-2 left-2">
            <AIGeneratedBadge type="music" provider="Suno AI" model="v4.5 Plus" variant="compact" />
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 rounded-t-lg opacity-0 group-hover:opacity-100 md:transition-opacity md:duration-200 flex items-center justify-center">
            <Button
              onClick={onPlay}
              size="lg"
              className="rounded-full bg-card text-primary hover:bg-card/90 shadow-lg min-h-[48px] min-w-[48px]"
            >
              <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-1" />
            </Button>
          </div>

          {/* Actions */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 md:transition-opacity min-h-[44px] min-w-[44px]"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPlay}>
                  <Play className="h-4 w-4 mr-2" />
                  Écouter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleLike} disabled={isLikeLoading}>
                  {isLikeLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : (
                    <Heart className={`h-4 w-4 mr-2 ${song.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                  )}
                  {song.is_liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
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
                  className="text-red-600 focus:text-red-600"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Retirer de la bibliothèque
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Song Info */}
        <div className="p-3 sm:p-4">
          {/* Item name (highlighted) */}
          <div className="mb-2">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
              {itemTitle || fallbackTitle || titleInfo.item || song.title}
            </h3>
            {titleInfo.rang && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {titleInfo.rang} • {titleInfo.style}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3">
            <span>{getDuration()}</span>
            <span className="hidden sm:inline">{formatDate(song.added_to_library_at)}</span>
            <span className="sm:hidden">{formatDate(song.added_to_library_at).split(' ')[0]}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleLike}
              disabled={isLikeLoading}
              className={`${song.is_liked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]`}
            >
              {isLikeLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Heart className={`h-4 w-4 ${song.is_liked ? 'fill-current' : ''}`} />
              )}
            </Button>
            
            <Button
              onClick={onPlay}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors flex-1 min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm"
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Écouter</span>
              <span className="sm:hidden">Play</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
