/**
 * Gestionnaire de playlists
 * ✅ NOUVEAU: Créer, modifier, supprimer des playlists
 */

import { useAuth } from '@/components/med-mng/AuthProvider';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import {
    Check,
    Edit2,
    FolderPlus,
    ListMusic,
    MoreVertical,
    Music,
    Plus,
    Trash2,
    X
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  track_count?: number;
  play_count?: number;
  created_at: string;
  updated_at: string;
  tracks?: any;
}

interface PlaylistManagerProps {
  onPlaylistSelect?: (playlistId: string) => void;
  selectedTrackIds?: string[];
  className?: string;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  onPlaylistSelect,
  selectedTrackIds = [],
  className = ''
}) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Charger les playlists
  const loadPlaylists = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Note: Table music_playlists doit exister
      const { data, error } = await supabase
        .from('music_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Mapper les données pour correspondre à notre interface
      const mappedData: Playlist[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        track_count: p.play_count || (Array.isArray(p.tracks) ? p.tracks.length : 0),
        created_at: p.created_at,
        updated_at: p.updated_at
      }));
      
      setPlaylists(mappedData);
    } catch (error) {
      console.error('Erreur chargement playlists:', error);
      // Fallback: playlists locales
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  // Créer une playlist
  const createPlaylist = useCallback(async () => {
    if (!user || !newPlaylistName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('music_playlists')
        .insert({
          user_id: user.id,
          name: newPlaylistName.trim(),
          tracks: []
        })
        .select()
        .single();

      if (error) throw error;

      const newPlaylist: Playlist = {
        id: data.id,
        name: data.name,
        description: data.description,
        track_count: 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setPlaylists(prev => [newPlaylist, ...prev]);
      setNewPlaylistName('');
      setIsDialogOpen(false);
      toast.success('Playlist créée !');
    } catch (error) {
      console.error('Erreur création playlist:', error);
      toast.error('Erreur lors de la création');
    }
  }, [user, newPlaylistName]);

  // Renommer une playlist
  const renamePlaylist = useCallback(async (id: string) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('music_playlists')
        .update({ name: editingName.trim(), updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setPlaylists(prev => prev.map(p => 
        p.id === id ? { ...p, name: editingName.trim() } : p
      ));
      setEditingId(null);
      toast.success('Playlist renommée');
    } catch (error) {
      console.error('Erreur renommage:', error);
      toast.error('Erreur lors du renommage');
    }
  }, [editingName]);

  // Supprimer une playlist
  const deletePlaylist = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('music_playlists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPlaylists(prev => prev.filter(p => p.id !== id));
      toast.success('Playlist supprimée');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  }, []);

  // Ajouter les tracks sélectionnés à une playlist
  const addTracksToPlaylist = useCallback(async (playlistId: string) => {
    if (selectedTrackIds.length === 0) {
      toast.error('Aucune piste sélectionnée');
      return;
    }
    
    try {
      // Mettre à jour la playlist avec les nouveaux tracks
      const playlist = playlists.find(p => p.id === playlistId);
      const existingTracks = Array.isArray(playlist?.tracks) ? playlist.tracks : [];
      const newTracks = [...existingTracks, ...selectedTrackIds];
      
      const { error } = await supabase
        .from('music_playlists')
        .update({
          tracks: newTracks,
          updated_at: new Date().toISOString()
        })
        .eq('id', playlistId);

      if (error) throw error;
      
      await loadPlaylists();
      toast.success(`${selectedTrackIds.length} piste(s) ajoutée(s)`);
    } catch (error) {
      console.error('Erreur ajout à playlist:', error);
      toast.error('Erreur lors de l\'ajout');
    }
  }, [selectedTrackIds, loadPlaylists, playlists]);

  if (!user) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <ListMusic className="h-4 w-4" />
          <TranslatedText text="Playlists" />
          <Badge variant="secondary">{playlists.length}</Badge>
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-48">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <FolderPlus className="h-8 w-8 opacity-50" />
            <p className="text-sm">Aucune playlist</p>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
              Créer une playlist
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {playlists.map(playlist => (
              <div
                key={playlist.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group"
              >
                {editingId === playlist.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renamePlaylist(playlist.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => renamePlaylist(playlist.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onPlaylistSelect?.(playlist.id)}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      <Music className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{playlist.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {playlist.track_count}
                      </Badge>
                    </button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {selectedTrackIds.length > 0 && (
                          <DropdownMenuItem onClick={() => addTracksToPlaylist(playlist.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter {selectedTrackIds.length} piste(s)
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => {
                          setEditingId(playlist.id);
                          setEditingName(playlist.name);
                        }}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Renommer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deletePlaylist(playlist.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Dialog création */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <TranslatedText text="Nouvelle playlist" />
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Nom de la playlist"
            onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={createPlaylist} disabled={!newPlaylistName.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
