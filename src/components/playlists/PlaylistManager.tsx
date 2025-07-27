import React, { useState } from 'react';
import { Plus, Music, Edit2, Trash2, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePlaylists, type Playlist } from '@/hooks/usePlaylists';
import { TranslatedText } from '@/components/TranslatedText';
import { useNavigate } from 'react-router-dom';

export const PlaylistManager = () => {
  const { playlists, loading, createPlaylist, updatePlaylist, deletePlaylist } = usePlaylists();
  const navigate = useNavigate();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });

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
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">
            <TranslatedText text="Mes Playlists" />
          </h2>
          <p className="text-gray-600">
            <TranslatedText text={`${playlists.length} playlist${playlists.length > 1 ? 's' : ''} créée${playlists.length > 1 ? 's' : ''}`} />
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
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

      {/* Liste des playlists */}
      {playlists.length === 0 ? (
        <Card className="p-12 text-center">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            <TranslatedText text="Aucune playlist" />
          </h3>
          <p className="text-gray-600 mb-6">
            <TranslatedText text="Créez votre première playlist pour organiser vos chansons" />
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            <TranslatedText text="Créer ma première playlist" />
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => navigate(`/med-mng/playlists/${playlist.id}`)}>
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {playlist.name}
                    </CardTitle>
                    {playlist.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
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
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent onClick={() => navigate(`/med-mng/playlists/${playlist.id}`)}>
                <div className="flex items-center justify-between text-sm text-gray-600">
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