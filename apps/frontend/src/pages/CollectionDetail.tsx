/**
 * Collection Detail Page
 * View and manage a specific collection
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Folder,
  Edit,
  Trash2,
  Share2,
  Plus,
  MoreVertical,
  FileText,
  Video,
  Music,
  Image,
  Link as LinkIcon,
  Calendar,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CollectionItem {
  id: string;
  item_type: string;
  item_id: string;
  item_metadata: {
    title?: string;
    description?: string;
    thumbnail?: string;
    [key: string]: any;
  };
  added_at: string;
  order_index: number;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const getItemIcon = (type: string) => {
  switch (type) {
    case 'edn_item':
      return <FileText className="h-5 w-5" />;
    case 'ecos_scenario':
      return <Video className="h-5 w-5" />;
    case 'song':
      return <Music className="h-5 w-5" />;
    case 'image':
      return <Image className="h-5 w-5" />;
    case 'link':
      return <LinkIcon className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

export const CollectionDetail: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{id: string; title: string} | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);

  useEffect(() => {
    if (collectionId) {
      fetchCollection();
      fetchItems();
    }
  }, [collectionId]);

  const fetchCollection = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (error) throw error;

      setCollection(data);
      setEditName(data.name);
      setEditDescription(data.description || '');
      setEditIsPublic(data.is_public);
    } catch (error: any) {
      console.error('Error fetching collection:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la collection',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collectionId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      setItems(data || []);
    } catch (error: any) {
      console.error('Error fetching items:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim()) {
      toast({
        title: 'Validation',
        description: 'Le nom est requis',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('collections')
        .update({
          name: editName.trim(),
          description: editDescription.trim() || null,
          is_public: editIsPublic,
        })
        .eq('id', collectionId);

      if (error) throw error;

      toast({
        title: 'Collection mise à jour',
        description: 'Les modifications ont été enregistrées',
      });

      setIsEditDialogOpen(false);
      fetchCollection();
    } catch (error: any) {
      console.error('Error updating collection:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la collection',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      toast({
        title: 'Collection supprimée',
        description: 'La collection a été supprimée avec succès',
      });

      navigate('/collections');
    } catch (error: any) {
      console.error('Error deleting collection:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la collection',
        variant: 'destructive',
      });
    }
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;

    try {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('id', itemToRemove.id);

      if (error) throw error;

      toast({
        title: 'Item retiré',
        description: `"${itemToRemove.title}" a été retiré de la collection`,
      });

      fetchItems();
      setItemToRemove(null);
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer l\'item',
        variant: 'destructive',
      });
      setItemToRemove(null);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/collections/${collectionId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Lien copié',
        description: 'Le lien de la collection a été copié dans le presse-papiers',
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le lien',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Collection non trouvée</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Folder className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
              {collection.description && (
                <p className="text-muted-foreground">{collection.description}</p>
              )}
              <div className="flex gap-2 mt-3">
                <Badge variant={collection.is_public ? 'default' : 'secondary'}>
                  {collection.is_public ? 'Public' : 'Privé'}
                </Badge>
                <Badge variant="outline">{items.length} items</Badge>
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(collection.created_at).toLocaleDateString('fr-FR')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contenu de la Collection</CardTitle>
              <CardDescription>{items.length} items sauvegardés</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Collection vide</h3>
              <p className="text-muted-foreground mb-4">
                Commencez à ajouter des items à votre collection
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {getItemIcon(item.item_type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {item.item_metadata?.title || 'Sans titre'}
                          </h4>
                          {item.item_metadata?.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.item_metadata.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.item_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Ajouté le {new Date(item.added_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setItemToRemove({
                          id: item.id,
                          title: item.item_metadata?.title || 'Cet item'
                        })}
                        aria-label="Retirer l'item de la collection"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la Collection</DialogTitle>
            <DialogDescription>Mettez à jour les informations de la collection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nom de la collection"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description..."
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={editIsPublic}
                onChange={(e) => setEditIsPublic(e.target.checked)}
              />
              <label htmlFor="isPublic" className="text-sm">
                Rendre cette collection publique
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la Collection</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{collection.name}" ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Removal Confirmation Dialog */}
      <Dialog open={!!itemToRemove} onOpenChange={() => setItemToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer l'item de la collection</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir retirer "{itemToRemove?.title}" de cette collection ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToRemove(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmRemoveItem}>
              Retirer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionDetail;
