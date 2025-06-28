
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Heart, Trash2, Music, MoreVertical } from 'lucide-react';
import { useMedMngApi } from '@/hooks/useMedMngApi';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  const [isLoading, setIsLoading] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

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

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-white">
      <CardContent className="p-0">
        {/* Cover Image */}
        <div className="relative aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
          <Music className="h-12 w-12 text-white/80" />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              onClick={onPlay}
              size="lg"
              className="rounded-full bg-white text-blue-600 hover:bg-white/90 shadow-lg"
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>
          </div>

          {/* Actions */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  <Heart className={`h-4 w-4 mr-2 ${song.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                  {song.is_liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleRemove} 
                  disabled={isLoading}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Retirer de la bibliothèque
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Song Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
            {song.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>{getDuration()}</span>
            <span>{formatDate(song.added_to_library_at)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleLike}
              disabled={isLikeLoading}
              className={`${song.is_liked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
            >
              <Heart className={`h-4 w-4 ${song.is_liked ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              onClick={onPlay}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4 mr-1" />
              Écouter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
