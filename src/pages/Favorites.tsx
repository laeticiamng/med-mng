import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Heart, Search, Filter, Play, BookOpen, Music,
  ArrowLeft, Star, Clock, Calendar, Tag, Trash2,
  Download, Share2, Plus, FolderPlus, AlertCircle, Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fiche' | 'post' | 'collection'>('all');

  const { useFetchFavorites, useRemoveFavorite } = useFavorites();

  // Fetch favorites from database
  const { data: favoriteItems = [], isLoading, error } = useFetchFavorites(user?.id);
  const removeFromFavoriteMutation = useRemoveFavorite();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fiche': return BookOpen;
      case 'post': return Music;
      case 'collection': return FolderPlus;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fiche': return 'bg-blue-100 text-blue-700';
      case 'post': return 'bg-purple-100 text-purple-700';
      case 'collection': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = favoriteItems;

    // Filter by type
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.item_type === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.item_name?.toLowerCase().includes(query) ||
          item.metadata?.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [favoriteItems, searchQuery, selectedCategory]);

  const handleRemoveFavorite = async (itemId: string, itemType: string) => {
    if (!user) return;

    try {
      await removeFromFavoriteMutation.mutateAsync({
        itemId,
        itemType: itemType as 'fiche' | 'post' | 'collection',
        userId: user.id,
      });

      toast({
        title: 'Supprimé des favoris',
        description: 'Cet élément a été supprimé de vos favoris',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <Helmet>
        <title>Mes Favoris - MED MNG</title>
        <meta name="description" content="Gérez vos contenus favoris, collections personnalisées et éléments sauvegardés." />
        <meta name="keywords" content="favoris, collections, sauvegarde, apprentissage médical" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                Mes Favoris
              </h1>
              <p className="text-gray-600 mt-1">
                Retrouvez tous vos contenus préférés et collections personnalisées
              </p>
            </div>
          </div>
          
          <Button className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4" />
            Nouvelle Collection
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{favoriteItems.length}</div>
              <div className="text-sm text-gray-600">Items Favoris</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {favoriteItems.filter((f) => f.item_type === 'fiche').length}
              </div>
              <div className="text-sm text-gray-600">Fiches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {favoriteItems.filter((f) => f.item_type === 'post').length}
              </div>
              <div className="text-sm text-gray-600">Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {favoriteItems.filter((f) => f.item_type === 'collection').length}
              </div>
              <div className="text-sm text-gray-600">Collections</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Mes Favoris</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>

          {/* Items favoris */}
          <TabsContent value="items" className="space-y-6">
            {/* Filtres */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher dans mes favoris..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className="gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Tout ({favoriteItems.length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'fiche' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('fiche')}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Fiches ({favoriteItems.filter((f) => f.item_type === 'fiche').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'post' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('post')}
                    >
                      <Music className="w-4 h-4 mr-1" />
                      Posts ({favoriteItems.filter((f) => f.item_type === 'post').length})
                    </Button>
                    <Button
                      variant={selectedCategory === 'collection' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('collection')}
                    >
                      <FolderPlus className="w-4 h-4 mr-1" />
                      Collections ({favoriteItems.filter((f) => f.item_type === 'collection').length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Erreur lors du chargement des favoris</AlertDescription>
              </Alert>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredItems.length === 0 && !error && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun favori trouvé
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 'Aucun résultat pour votre recherche.' : 'Commencez à ajouter des contenus à vos favoris !'}
                  </p>
                  <Button onClick={() => navigate('/posts')}>
                    Découvrir du contenu
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Liste des favoris */}
            {!isLoading && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredItems.map((item) => {
                const TypeIcon = getTypeIcon(item.item_type);
                return (
                  <Card
                    key={`${item.item_type}-${item.item_id}`}
                    className="hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg ${getTypeColor(item.item_type)}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {item.item_name}
                            </h3>
                            {item.metadata?.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {item.metadata.description}
                              </p>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {item.item_type}
                            </Badge>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2"
                          onClick={() => handleRemoveFavorite(item.item_id, item.item_type)}
                          disabled={removeFromFavoriteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Stats if available */}
                      {item.metadata?.stats && (
                        <div className="flex flex-wrap gap-3 mb-4 text-sm">
                          {item.metadata.stats.views !== undefined && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Eye className="w-4 h-4" />
                              <span>{item.metadata.stats.views} vues</span>
                            </div>
                          )}
                          {item.metadata.stats.comments !== undefined && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <MessageCircle className="w-4 h-4" />
                              <span>{item.metadata.stats.comments} commentaires</span>
                            </div>
                          )}
                          {item.metadata.stats.likes !== undefined && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Heart className="w-4 h-4" />
                              <span>{item.metadata.stats.likes} likes</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Date ajouté */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Ajouté le{' '}
                          {new Date(item.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            )}
          </TabsContent>

          {/* Collections */}
          <TabsContent value="collections" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <FolderPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gestion des collections
                </h3>
                <p className="text-gray-600 mb-6">
                  La gestion des collections est disponible bientôt. Vous pourrez
                  créer et organiser vos collections personnalisées.
                </p>
                <Button disabled>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une collection (Bientôt)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Favorites;