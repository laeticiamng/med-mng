import { useState, useEffect } from 'react';
import { Music, Plus, Trash2, Edit2, Play, MoreHorizontal, ListMusic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  song_ids: string[];
  is_public: boolean;
  cover_image_url?: string;
  play_count: number;
  created_at: string;
  updated_at: string;
}

export const PlaylistsTab = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      
      const { _data, _error } = await supabase
        .from('user_playlists')
        .select('*')
        .order('updated_at', { ascending: false });

      if (_error) {
        console.error('Erreur playlists:', _error);
        setPlaylists([]);
        return;
      }

      if (!_data) {
        setPlaylists([]);
        return;
      }

      // Parser song_ids comme JSON et typer correctement
      const parsedPlaylists: Playlist[] = _data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        song_ids: Array.isArray(p.song_ids) ? (p.song_ids as string[]) : [],
        is_public: p.is_public || false,
        cover_image_url: p.cover_image_url || undefined,
        play_count: p.play_count || 0,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));

      setPlaylists(parsedPlaylists);
    } catch (error) {
      console.error('Erreur:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la playlist est requis",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour créer une playlist",
          variant: "destructive"
        });
        return;
      }

      const { _data, _error } = await supabase
        .from('user_playlists')
        .insert({
          name: newPlaylistName.trim(),
          description: newPlaylistDesc.trim() || null,
          user_id: userData.user.id,
          song_ids: [],
          is_public: false,
          play_count: 0
        })
        .select()
        .maybeSingle();

      if (_error) throw _error;

      const newPlaylist: Playlist = {
        id: _data.id,
        name: _data.name,
        description: _data.description || undefined,
        song_ids: Array.isArray(_data.song_ids) ? (_data.song_ids as string[]) : [],
        is_public: _data.is_public || false,
        cover_image_url: _data.cover_image_url || undefined,
        play_count: _data.play_count || 0,
        created_at: _data.created_at,
        updated_at: _data.updated_at
      };

      setPlaylists(prev => [newPlaylist, ...prev]);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setIsCreateOpen(false);
      
      toast({
        title: "Playlist créée",
        description: `"${_data.name}" a été créée avec succès`
      });
    } catch (error) {
      console.error('Erreur création playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la playlist",
        variant: "destructive"
      });
    }
  };

  const deletePlaylist = async (playlistId: string, playlistName: string) => {
    try {
      const { _error } = await supabase
        .from('user_playlists')
        .delete()
        .eq('id', playlistId);

      if (_error) throw _error;

      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      toast({
        title: "Playlist supprimée",
        description: `"${playlistName}" a été supprimée`
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la playlist",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Mes Playlists
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-24 w-full rounded-lg mb-3" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Mes Playlists
          {playlists.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {playlists.length}
            </Badge>
          )}
        </CardTitle>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input
                  placeholder="Ma super playlist..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optionnelle)</label>
                <Input
                  placeholder="Mes musiques préférées..."
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={createPlaylist}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <ListMusic className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium mb-2">Aucune playlist</p>
            <p className="text-muted-foreground mb-4">
              Créez votre première playlist pour organiser vos musiques.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Créer une playlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map(playlist => (
              <Card 
                key={playlist.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                  {playlist.cover_image_url ? (
                    <img 
                      src={playlist.cover_image_url} 
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ListMusic className="h-16 w-16 text-muted-foreground/50" />
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="default" className="gap-1">
                      <Play className="h-4 w-4" />
                      Lire
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium truncate">{playlist.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {playlist.song_ids.length} piste{playlist.song_ids.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deletePlaylist(playlist.id, playlist.name)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {playlist.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {playlist.description}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
