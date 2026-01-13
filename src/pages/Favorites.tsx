import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, Search, Filter, Play, BookOpen, Music, 
  ArrowLeft, Star, Clock, Calendar, Tag, Trash2,
  Download, Share2, Plus, FolderPlus, Flame, Trophy, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { stats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();
  const { 
    loading, 
    ednFavorites, 
    musicFavorites, 
    stats: favStats,
    loadAllFavorites,
    removeEdnFavorite,
    removeMusicFavorite
  } = useFavorites();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadStats(user.id);
        await loadAllFavorites(user.id);
        await logActivity({ activity_type: 'study', metadata: { action: 'favorites_viewed' } });
      } else {
        navigate(ROUTE_PATHS.medMngLogin);
      }
    };
    init();
  }, [loadStats, logActivity, loadAllFavorites, navigate]);

  // Combiner et filtrer les favoris
  const allFavorites = [
    ...ednFavorites.map(f => ({
      id: f.id,
      type: 'edn' as const,
      title: f.item_title || f.item_code,
      code: f.item_code,
      addedAt: new Date(f.created_at),
      tags: [f.item_code.split('-')[0]]
    })),
    ...musicFavorites.map(f => ({
      id: f.id,
      type: 'music' as const,
      title: (f.meta as any)?.title || f.track_id,
      code: f.track_id,
      addedAt: new Date(f.created_at),
      tags: ['musique']
    }))
  ];

  const filteredItems = allFavorites.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRemoveFavorite = async (item: typeof allFavorites[0]) => {
    if (!user) return;
    if (item.type === 'edn') {
      await removeEdnFavorite(user.id, item.code);
    } else {
      await removeMusicFavorite(user.id, item.code);
    }
    await loadAllFavorites(user.id);
  };

  const getTypeIcon = (type: 'edn' | 'music') => {
    switch (type) {
      case 'edn': return BookOpen;
      case 'music': return Music;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: 'edn' | 'music') => {
    switch (type) {
      case 'edn': return 'bg-primary/10 text-primary';
      case 'music': return 'bg-accent/10 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
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
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Heart className="w-8 h-8 text-destructive" />
                Mes Favoris
              </h1>
              <p className="text-muted-foreground mt-1">
                Retrouvez tous vos contenus préférés et collections personnalisées
              </p>
            </div>
          </div>
          
          <Button className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4" />
            Nouvelle Collection
          </Button>
        </div>

        {/* Statistiques avec gamification */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{favStats?.totalEdnFavorites || 0}</div>
              <div className="text-sm text-muted-foreground">Items EDN</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{favStats?.totalMusicFavorites || 0}</div>
              <div className="text-sm text-muted-foreground">Musiques</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/30">
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{stats?.currentStreak || 0}</div>
              <div className="text-sm text-muted-foreground">Jours Streak</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30">
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 text-warning mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">Niv. {stats?.level || 1}</div>
              <div className="text-sm text-muted-foreground">Niveau</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="p-4 text-center">
              <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{stats?.badges?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Badges</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="items">Mes Favoris ({allFavorites.length})</TabsTrigger>
              <TabsTrigger value="edn">Items EDN ({ednFavorites.length})</TabsTrigger>
            </TabsList>

            {/* Items favoris */}
            <TabsContent value="items" className="space-y-6">
              {/* Filtres */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Rechercher dans mes favoris..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('all')}
                      >
                        Tout
                      </Button>
                      <Button
                        variant={selectedCategory === 'edn' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('edn')}
                      >
                        Items EDN
                      </Button>
                      <Button
                        variant={selectedCategory === 'music' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('music')}
                      >
                        Musique
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des favoris */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredItems.map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                    <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {item.code}
                              </Badge>
                            </div>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveFavorite(item)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          <Badge variant="secondary" className="text-xs">
                            {item.type === 'edn' ? 'Item EDN' : 'Musique'}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Ajouté {new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(
                              Math.ceil((item.addedAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 'day'
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                if (item.type === 'edn') {
                                  navigate(`${ROUTE_PATHS.ednComplete}/${item.code}`);
                                }
                              }}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Ouvrir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredItems.length === 0 && !loading && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Aucun favori trouvé
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery ? 'Aucun résultat pour votre recherche.' : 'Commencez à ajouter des contenus à vos favoris !'}
                    </p>
                    <Button onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
                      Découvrir du contenu
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Items EDN */}
            <TabsContent value="edn" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ednFavorites.map((fav) => (
                  <Card key={fav.id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">{fav.item_code}</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                          onClick={() => user && removeEdnFavorite(user.id, fav.item_code)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-3 line-clamp-2">{fav.item_title}</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {new Date(fav.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`${ROUTE_PATHS.ednComplete}/${fav.item_code}`)}
                        >
                          Étudier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {ednFavorites.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Aucun item EDN en favoris
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Ajoutez des items depuis la page EDN pour les retrouver ici
                    </p>
                    <Button onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
                      Explorer les items EDN
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Favorites;