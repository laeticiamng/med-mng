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
  Download, Share2, Plus, FolderPlus, Flame, Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface FavoriteItem {
  id: string;
  type: 'edn' | 'music' | 'playlist' | 'quiz';
  title: string;
  description: string;
  category: string;
  addedAt: Date;
  lastAccessed?: Date;
  progress?: number;
  duration?: string;
  tags: string[];
}

interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  createdAt: Date;
  color: string;
}

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { stats, loadStats } = useGamification();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadStats(user.id);
      }
    };
    init();
  }, [loadStats]);

  // Données de démo
  const favoriteItems: FavoriteItem[] = [
    {
      id: '1',
      type: 'edn',
      title: 'IC-157 Diabète',
      description: 'Physiopathologie et prise en charge du diabète',
      category: 'Endocrinologie',
      addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastAccessed: new Date(Date.now() - 1 * 60 * 60 * 1000),
      progress: 85,
      tags: ['diabète', 'endocrinologie', 'physiopathologie']
    },
    {
      id: '2',
      type: 'music',
      title: 'Cardiologie LoFi Mix',
      description: 'Musique relaxante pour étudier la cardiologie',
      category: 'Cardiologie',
      addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastAccessed: new Date(Date.now() - 3 * 60 * 60 * 1000),
      duration: '45:32',
      tags: ['cardiologie', 'lofi', 'relaxation']
    },
    {
      id: '3',
      type: 'edn',
      title: 'IC-042 Hypertension',
      description: 'Approche clinique de l\'hypertension artérielle',
      category: 'Cardiologie',
      addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      progress: 100,
      tags: ['hypertension', 'cardiologie', 'traitement']
    },
    {
      id: '4',
      type: 'playlist',
      title: 'Ma Playlist Urgences',
      description: 'Compilation musicale pour l\'apprentissage des urgences',
      category: 'Urgences',
      addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      duration: '2:18:45',
      tags: ['urgences', 'playlist', 'compilation']
    }
  ];

  const collections: Collection[] = [
    {
      id: '1',
      name: 'Cardiologie Complète',
      description: 'Tous mes items préférés en cardiologie',
      itemCount: 12,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      color: 'bg-destructive/10 text-destructive'
    },
    {
      id: '2',
      name: 'Révisions ECN',
      description: 'Collection spéciale pour les révisions',
      itemCount: 8,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      color: 'bg-primary/10 text-primary'
    },
    {
      id: '3',
      name: 'Musiques Focus',
      description: 'Mes musiques préférées pour la concentration',
      itemCount: 15,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      color: 'bg-accent/10 text-accent'
    }
  ];

  const getTypeIcon = (type: FavoriteItem['type']) => {
    switch (type) {
      case 'edn': return BookOpen;
      case 'music': return Music;
      case 'playlist': return Music;
      case 'quiz': return Star;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: FavoriteItem['type']) => {
    switch (type) {
      case 'edn': return 'bg-primary/10 text-primary';
      case 'music': return 'bg-accent/10 text-accent';
      case 'playlist': return 'bg-success/10 text-success';
      case 'quiz': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredItems = favoriteItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
              <div className="text-2xl font-bold text-foreground">{favoriteItems.length}</div>
              <div className="text-sm text-muted-foreground">Items Favoris</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{collections.length}</div>
              <div className="text-sm text-muted-foreground">Collections</div>
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
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Progression ou durée */}
                      {item.progress !== undefined && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progression</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {item.duration && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Clock className="w-4 h-4" />
                          {item.duration}
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
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
                          <Button size="sm" variant="outline">
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

            {filteredItems.length === 0 && (
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

          {/* Collections */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${collection.color}`}>
                        <FolderPlus className="w-6 h-6" />
                      </div>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-2">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{collection.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {collection.itemCount} éléments
                      </div>
                      <Button size="sm">
                        Ouvrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Favorites;