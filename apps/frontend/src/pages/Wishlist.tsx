/**
 * Wishlist Page
 * Displays user's wishlist items with management options
 */

import React, { useState } from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Heart,
  Trash2,
  ShoppingCart,
  Star,
  Filter,
  SortAsc,
  Package,
  BookOpen,
  FileText,
  Stethoscope,
  Music,
  MoreHorizontal,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const getItemIcon = (itemType: string) => {
  switch (itemType) {
    case 'product':
      return <Package className="h-5 w-5" />;
    case 'course':
      return <BookOpen className="h-5 w-5" />;
    case 'edn_item':
      return <FileText className="h-5 w-5" />;
    case 'ecos_scenario':
      return <Stethoscope className="h-5 w-5" />;
    case 'playlist':
      return <Music className="h-5 w-5" />;
    default:
      return <Heart className="h-5 w-5" />;
  }
};

const getItemTypeLabel = (itemType: string) => {
  const labels: Record<string, string> = {
    product: 'Produit',
    course: 'Cours',
    edn_item: 'Item EDN',
    ecos_scenario: 'Scénario ECOS',
    playlist: 'Playlist',
    other: 'Autre',
  };
  return labels[itemType] || itemType;
};

export const Wishlist: React.FC = () => {
  const {
    wishlist,
    loading,
    error,
    removeFromWishlist,
    updatePriority,
    updateNotes,
    markAsPurchased,
  } = useWishlist();
  const { toast } = useToast();

  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  const handleRemove = async (itemType: string, itemId: string, title?: string) => {
    const success = await removeFromWishlist(itemType, itemId);

    if (success) {
      toast({
        title: 'Supprimé',
        description: `${title || 'L\'item'} a été retiré de votre liste de souhaits`,
      });
    }
  };

  const handlePriorityChange = async (wishlistId: string, priority: number) => {
    await updatePriority(wishlistId, priority);
  };

  const handleSaveNotes = async (wishlistId: string) => {
    const success = await updateNotes(wishlistId, notesValue);

    if (success) {
      toast({
        title: 'Notes mises à jour',
        description: 'Vos notes ont été enregistrées avec succès',
      });
      setEditingNotes(null);
    }
  };

  const handleMarkPurchased = async (wishlistId: string, title?: string) => {
    const success = await markAsPurchased(wishlistId);

    if (success) {
      toast({
        title: 'Marqué comme acheté',
        description: `${title || 'L\'item'} a été marqué comme acheté`,
      });
    }
  };

  // Filter and sort wishlist
  const filteredWishlist = React.useMemo(() => {
    let filtered = [...wishlist];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.item_type === filterType);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (b.priority || 0) - (a.priority || 0);
        case 'date-new':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-old':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'type':
          return a.item_type.localeCompare(b.item_type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [wishlist, filterType, sortBy]);

  // Get unique item types for filter
  const itemTypes = React.useMemo(() => {
    const types = new Set(wishlist.map((item) => item.item_type));
    return Array.from(types);
  }, [wishlist]);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          Ma Liste de Souhaits
        </h1>
        <p className="text-muted-foreground">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} dans votre liste
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {itemTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {getItemTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priorité</SelectItem>
            <SelectItem value="date-new">Plus récent</SelectItem>
            <SelectItem value="date-old">Plus ancien</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Wishlist Items */}
      {filteredWishlist.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Votre liste est vide</h3>
            <p className="text-muted-foreground">
              {filterType !== 'all'
                ? 'Aucun item de ce type dans votre liste'
                : 'Commencez à ajouter des items à votre liste de souhaits'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredWishlist.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      {getItemIcon(item.item_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl">
                          {item.item_metadata?.title || `Item ${item.item_id}`}
                        </CardTitle>
                        <Badge variant="outline">{getItemTypeLabel(item.item_type)}</Badge>
                      </div>
                      {item.item_metadata?.description && (
                        <CardDescription className="line-clamp-2">
                          {item.item_metadata.description}
                        </CardDescription>
                      )}
                      {item.item_metadata?.price && (
                        <div className="mt-2 text-lg font-semibold text-primary">
                          {item.item_metadata.price} €
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Priority Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 cursor-pointer transition-colors ${
                          star <= (item.priority || 0)
                            ? 'text-yellow-500 fill-current'
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => handlePriorityChange(item.id, star)}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Notes Section */}
                {editingNotes === item.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      placeholder="Ajoutez des notes..."
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveNotes(item.id)}>
                        Enregistrer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingNotes(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : item.notes ? (
                  <div
                    className="text-sm text-muted-foreground mb-3 cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => {
                      setEditingNotes(item.id);
                      setNotesValue(item.notes || '');
                    }}
                  >
                    {item.notes}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-3"
                    onClick={() => {
                      setEditingNotes(item.id);
                      setNotesValue('');
                    }}
                  >
                    Ajouter des notes...
                  </Button>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Marquer comme acheté
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmer l'achat</DialogTitle>
                        <DialogDescription>
                          Êtes-vous sûr d'avoir acheté "{item.item_metadata?.title || 'cet item'}"
                          ?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          onClick={() =>
                            handleMarkPurchased(item.id, item.item_metadata?.title)
                          }
                        >
                          Confirmer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleRemove(item.item_type, item.item_id, item.item_metadata?.title)
                    }
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Retirer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
