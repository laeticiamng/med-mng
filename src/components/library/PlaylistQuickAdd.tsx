import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Check, ListMusic, Loader2, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface Playlist {
  id: string;
  name: string;
  song_count: number;
}

interface PlaylistQuickAddProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId: string;
  songTitle: string;
  onSuccess?: () => void;
}

export const PlaylistQuickAdd: React.FC<PlaylistQuickAddProps> = ({
  open,
  onOpenChange,
  songId,
  songTitle,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  // Charger les playlists quand le dialog s'ouvre
  React.useEffect(() => {
    if (open && user) {
      loadPlaylists();
    }
  }, [open, user]);

  const loadPlaylists = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_playlists')
        .select('id, name, song_ids')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPlaylists(
        (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          song_count: Array.isArray(p.song_ids) ? p.song_ids.length : 0,
        }))
      );
    } catch (err) {
      console.error('Erreur chargement playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToPlaylist = async (playlistId: string) => {
    if (!user) return;
    
    setAdding(playlistId);
    try {
      // Récupérer la playlist actuelle
      const { data: playlist, error: fetchError } = await supabase
        .from('user_playlists')
        .select('song_ids')
        .eq('id', playlistId)
        .single();

      if (fetchError) throw fetchError;

      const currentSongs: string[] = Array.isArray((playlist as any)?.song_ids) ? (playlist as any).song_ids : [];

      // Vérifier si la chanson est déjà dans la playlist
      if (currentSongs.includes(songId)) {
        toast.info('Cette chanson est déjà dans la playlist');
        setAdding(null);
        return;
      }

      // Ajouter la chanson
      const { error: updateError } = await supabase
        .from('user_playlists')
        .update({ song_ids: [...currentSongs, songId] })
        .eq('id', playlistId);

      if (updateError) throw updateError;

      toast.success('Chanson ajoutée à la playlist');
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Erreur ajout à la playlist:', err);
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setAdding(null);
    }
  };

  const createNewPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;

    setCreatingNew(true);
    try {
      const { error } = await supabase
        .from('user_playlists')
        .insert({
          user_id: user.id,
          name: newPlaylistName.trim(),
          song_ids: [songId],
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success(`Playlist "${newPlaylistName}" créée`);
      setNewPlaylistName('');
      setShowNewForm(false);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Erreur création playlist:', err);
      toast.error('Erreur lors de la création');
    } finally {
      setCreatingNew(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5 text-primary" />
            Ajouter à une playlist
          </DialogTitle>
          <DialogDescription className="truncate">
            "{songTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Liste des playlists existantes */}
              {playlists.length > 0 ? (
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-2">
                    {playlists.map(playlist => (
                      <button
                        key={playlist.id}
                        onClick={() => addToPlaylist(playlist.id)}
                        disabled={adding === playlist.id}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card hover:bg-card/80 transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <ListMusic className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-foreground">{playlist.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {playlist.song_count} chanson{playlist.song_count > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        {adding === playlist.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Aucune playlist. Créez-en une !
                </p>
              )}

              {/* Formulaire nouvelle playlist */}
              {showNewForm ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Nom de la playlist"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="h-10"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewForm(false);
                        setNewPlaylistName('');
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={createNewPlaylist}
                      disabled={!newPlaylistName.trim() || creatingNew}
                      className="flex-1"
                    >
                      {creatingNew ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Créer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowNewForm(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle playlist
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
