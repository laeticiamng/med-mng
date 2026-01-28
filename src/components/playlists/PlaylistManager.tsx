import { TranslatedText } from '@/components/TranslatedText';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { usePlaylists, type Playlist } from '@/hooks/usePlaylists';
import { Edit2, Globe, Lock, Music, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistSearch } from './PlaylistSearch';

export const PlaylistManager = () => {
  const { playlists, loading, createPlaylist, updatePlaylist, deletePlaylist } = usePlaylists();
  const navigate = useNavigate();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });

  // Mettre à jour les playlists filtrées quand les playlists changent
  React.useEffect(() => {
    setFilteredPlaylists(playlists);
  }, [playlists]);

  // Fonction de recherche et filtrage
  const handleSearch = (query: string, filters: any) => {
    let filtered = [...playlists];

    // Filtrer par texte de recherche
    if (query.trim()) {
      filtered = filtered.filter(playlist =>
        playlist.name.toLowerCase().includes(query.toLowerCase()) ||
        (playlist.description && playlist.description.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Filtrer par confidentialité
    if (filters.privacy !== 'all') {
      filtered = filtered.filter(playlist =>
        filters.privacy === 'public' ? playlist.is_public : !playlist.is_public
      );
    }

    // Trier
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'song_count':
          aValue = a.song_count;
          bValue = b.song_count;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPlaylists(filtered);
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const result = await createPlaylist(formData.name, formData.description, formData.is_public);
    if (result) {
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', is_public: false });
    }
  };

  const handleUpdatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaylist || !formData.name.trim()) return;

    const result = await updatePlaylist(editingPlaylist.id, {
      name: formData.name,
      description: formData.description,
      is_public: formData.is_public
    });

    if (result) {
      setEditingPlaylist(null);
      setFormData({ name: '', description: '', is_public: false });
    }
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${playlist.name}" ?`)) {
      await deletePlaylist(playlist.id);
    }
  };

  const openEditDialog = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || '',
      is_public: playlist.is_public
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            <TranslatedText text="Mes Playlists" />
          </h2>
          <p className="text-muted-foreground">
            <TranslatedText text={`${filteredPlaylists.length} playlist${filteredPlaylists.length > 1 ? 's' : ''} trouvée${filteredPlaylists.length > 1 ? 's' : ''} sur ${playlists.length}`} />
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              <TranslatedText text="Nouvelle Playlist" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <TranslatedText text="Créer une nouvelle playlist" />
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <Label htmlFor="name">
                  <TranslatedText text="Nom de la playlist" />
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ma nouvelle playlist"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">
                  <TranslatedText text="Description (optionnelle)" />
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de votre playlist..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                />
                <Label htmlFor="is_public">
                  <TranslatedText text="Playlist publique" />
                </Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  <TranslatedText text="Annuler" />
                </Button>
                <Button type="submit">
                  <TranslatedText text="Créer" />
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche */}
      <PlaylistSearch
        onSearch={handleSearch}
        className="mb-6"
      />

      {/* Liste des playlists */}
      {filteredPlaylists.length === 0 && playlists.length === 0 ? (
        <Card className="p-12 text-center">
          <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            <TranslatedText text="Aucune playlist" />
          </h3>
          <p className="text-muted-foreground mb-6">
            <TranslatedText text="Créez votre première playlist pour organiser vos chansons" />
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            <TranslatedText text="Créer ma première playlist" />
          </Button>
        </Card>
      ) : filteredPlaylists.length === 0 ? (
        <Card className="p-12 text-center">
          <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            <TranslatedText text="Aucune playlist trouvée" />
          </h3>
          <p className="text-muted-foreground mb-6">
            <TranslatedText text="Modifiez vos critères de recherche ou créez une nouvelle playlist" />
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => (
            <Card key={playlist.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => navigate(`/med-mng/playlists/${playlist.id}`)}>
                    <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
                      {playlist.name}
                    </CardTitle>
                    {playlist.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(playlist);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent onClick={() => navigate(`/med-mng/playlists/${playlist.id}`)}>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span>{playlist.song_count} chanson{playlist.song_count > 1 ? 's' : ''}</span>
                    <div className="flex items-center space-x-1">
                      {playlist.is_public ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      <span>{playlist.is_public ? 'Publique' : 'Privée'}</span>
                    </div>
                  </div>
                  <span>{formatDate(playlist.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog d'édition */}
      <Dialog open={!!editingPlaylist} onOpenChange={() => setEditingPlaylist(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <TranslatedText text="Modifier la playlist" />
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePlaylist} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">
                <TranslatedText text="Nom de la playlist" />
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">
                <TranslatedText text="Description" />
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
              <Label htmlFor="edit-is_public">
                <TranslatedText text="Playlist publique" />
              </Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingPlaylist(null)}>
                <TranslatedText text="Annuler" />
              </Button>
              <Button type="submit">
                <TranslatedText text="Sauvegarder" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};