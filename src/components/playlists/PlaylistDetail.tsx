import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, GripVertical, X, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePlaylists, type Playlist, type PlaylistSong } from '@/hooks/usePlaylists';
import { TranslatedText } from '@/components/TranslatedText';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { ROUTE_PATHS } from '@/config/routes';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
  SortableContext as SortableContextProvider,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSongItemProps {
  song: PlaylistSong;
  isPlaying: boolean;
  onPlay: () => void;
  onRemove: () => void;
}

const SortableSongItem: React.FC<SortableSongItemProps> = ({ song, isPlaying, onPlay, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.song_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center p-4 bg-card rounded-lg border border-border hover:bg-muted transition-colors ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing mr-3">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Position */}
      <div className="w-8 text-sm text-muted-foreground mr-4">
        {song.position + 1}
      </div>

      {/* Play Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPlay}
        className="mr-3"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{song.title}</h4>
        <p className="text-sm text-muted-foreground">
          Ajoutée le {formatDate(song.added_at)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const PlaylistDetail = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { getPlaylistDetails, removeSongFromPlaylist, reorderPlaylistSongs } = usePlaylists();
  const { currentTrack, isPlaying, play, pause, resume } = useGlobalAudio();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<PlaylistSong[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (playlistId) {
      loadPlaylistDetails();
    }
  }, [playlistId]);

  const loadPlaylistDetails = async () => {
    if (!playlistId) return;
    
    setLoading(true);
    const details = await getPlaylistDetails(playlistId);
    if (details) {
      setPlaylist(details);
      setSongs(details.songs || []);
    } else {
      navigate(ROUTE_PATHS.medMngPlaylists);
    }
    setLoading(false);
  };

  const handlePlay = (song: PlaylistSong) => {
    const audioUrl = `https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/secure-audio-stream?audioId=${song.suno_audio_id}`;
    
    if (currentTrack?.url === audioUrl) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      play({
        url: audioUrl,
        title: song.title,
        rang: 'A' // Par défaut
      });
    }
  };

  const handleRemoveSong = async (song: PlaylistSong) => {
    if (!playlist) return;
    
    if (confirm(`Retirer "${song.title}" de cette playlist ?`)) {
      const success = await removeSongFromPlaylist(playlist.id, song.song_id);
      if (success) {
        setSongs(prev => prev.filter(s => s.song_id !== song.song_id));
        setPlaylist(prev => prev ? { ...prev, song_count: prev.song_count - 1 } : null);
      }
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = songs.findIndex(song => song.song_id === active.id);
    const newIndex = songs.findIndex(song => song.song_id === over.id);

    const newSongs = arrayMove(songs, oldIndex, newIndex);
    setSongs(newSongs);

    // Mise à jour des positions
    const songOrders = newSongs.map((song, index) => ({
      song_id: song.song_id,
      position: index
    }));

    if (playlist) {
      await reorderPlaylistSongs(playlist.id, songOrders);
    }
  };

  const getTotalDuration = () => {
    // Estimation: 4 minutes par chanson
    const totalMinutes = songs.length * 4;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-6 text-center">
        <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          <TranslatedText text="Playlist introuvable" />
        </h2>
        <Button onClick={() => navigate(ROUTE_PATHS.medMngPlaylists)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <TranslatedText text="Retour aux playlists" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(ROUTE_PATHS.medMngPlaylists)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <TranslatedText text="Retour aux playlists" />
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-muted-foreground mb-4">{playlist.description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>{playlist.song_count} chanson{playlist.song_count > 1 ? 's' : ''}</span>
              <span>{getTotalDuration()}</span>
              <span>{playlist.is_public ? 'Publique' : 'Privée'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des chansons */}
      {songs.length === 0 ? (
        <Card className="p-12 text-center">
          <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            <TranslatedText text="Playlist vide" />
          </h3>
          <p className="text-muted-foreground mb-6">
            <TranslatedText text="Ajoutez des chansons à cette playlist depuis votre bibliothèque" />
          </p>
          <Button onClick={() => navigate(ROUTE_PATHS.medMngLibrary)}>
            <TranslatedText text="Parcourir ma bibliothèque" />
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={songs.map(s => s.song_id)} strategy={verticalListSortingStrategy}>
              {songs.map((song) => {
                const audioUrl = `https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/secure-audio-stream?audioId=${song.suno_audio_id}`;
                const isCurrentlyPlaying = currentTrack?.url === audioUrl && isPlaying;
                
                return (
                  <SortableSongItem
                    key={song.song_id}
                    song={song}
                    isPlaying={isCurrentlyPlaying}
                    onPlay={() => handlePlay(song)}
                    onRemove={() => handleRemoveSong(song)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};