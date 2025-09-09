import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Star, 
  BookOpen, 
  Music, 
  Brain, 
  Play,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Filter,
  SortAsc,
  Trash2,
  Share2,
  Download,
  Eye
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

interface FavoriteItem {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  hasMusic: boolean;
  hasScene: boolean;
  hasQuiz: boolean;
  lastAccessed: string;
  dateAdded: string;
  personalRating?: number;
  personalNotes?: string;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  estimatedTimeRemaining: number; // minutes
  tags: string[];
  studyStreak: number; // nombre de jours consécutifs
}

interface StudyCollection {
  id: string;
  name: string;
  description: string;
  items: string[]; // IDs des items
  color: string;
  icon: string;
  created: string;
}

interface EdnFavoritesProps {
  onItemSelect?: (item: FavoriteItem) => void;
  compact?: boolean;
}

export const EdnFavorites: React.FC<EdnFavoritesProps> = ({
  onItemSelect,
  compact = false
}) => {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [collections, setCollections] = useState<StudyCollection[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'added' | 'progress' | 'rating'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);

  // Données simulées
  const mockFavorites: FavoriteItem[] = [
    {
      id: '1',
      item_code: 'IC-001',
      title: 'Insuffisance cardiaque aiguë',
      subtitle: 'Diagnostic et prise en charge',
      slug: 'insuffisance-cardiaque-aigue',
      category: 'Cardiologie',
      difficulty: 'moyen',
      hasMusic: true,
      hasScene: true,
      hasQuiz: true,
      lastAccessed: '2024-01-15T10:30:00',
      dateAdded: '2024-01-10T15:20:00',
      personalRating: 4,
      personalNotes: 'Excellent pour les cas complexes',
      completionStatus: 'in_progress',
      progressPercentage: 67,
      estimatedTimeRemaining: 15,
      tags: ['cardio', 'urgence'],
      studyStreak: 3
    },
    {
      id: '2',
      item_code: 'IC-002',
      title: 'Pneumonie communautaire',
      subtitle: 'Évaluation et antibiothérapie',
      slug: 'pneumonie-communautaire',
      category: 'Pneumologie',
      difficulty: 'facile',
      hasMusic: true,
      hasScene: false,
      hasQuiz: true,
      lastAccessed: '2024-01-14T16:45:00',
      dateAdded: '2024-01-08T09:15:00',
      personalRating: 5,
      completionStatus: 'completed',
      progressPercentage: 100,
      estimatedTimeRemaining: 0,
      tags: ['pneumo', 'antibiotiques'],
      studyStreak: 1
    },
    {
      id: '3',
      item_code: 'IC-003',
      title: 'AVC ischémique aigu',
      subtitle: 'Thrombolyse et thrombectomie',
      slug: 'avc-ischemique-aigu',
      category: 'Neurologie',
      difficulty: 'difficile',
      hasMusic: false,
      hasScene: true,
      hasQuiz: true,
      lastAccessed: '2024-01-12T14:20:00',
      dateAdded: '2024-01-05T11:30:00',
      personalNotes: 'Difficile mais très complet',
      completionStatus: 'not_started',
      progressPercentage: 0,
      estimatedTimeRemaining: 60,
      tags: ['neurologie', 'urgence'],
      studyStreak: 0
    }
  ];

  const mockCollections: StudyCollection[] = [
    {
      id: 'c1',
      name: 'Urgences vitales',
      description: 'Pathologies nécessitant une prise en charge immédiate',
      items: ['1', '3'],
      color: 'bg-red-500',
      icon: '🚨',
      created: '2024-01-10'
    },
    {
      id: 'c2',
      name: 'Cardiologie approfondie',
      description: 'Approfondissement des pathologies cardiovasculaires',
      items: ['1'],
      color: 'bg-blue-500',
      icon: '❤️',
      created: '2024-01-08'
    }
  ];

  useEffect(() => {
    setFavorites(mockFavorites);
    setCollections(mockCollections);
  }, []);

  const filteredAndSortedFavorites = React.useMemo(() => {
    let filtered = favorites;

    // Filtrage par statut
    if (filterBy !== 'all') {
      filtered = filtered.filter(item => item.completionStatus === filterBy);
    }

    // Filtrage par collection
    if (selectedCollection) {
      const collection = collections.find(c => c.id === selectedCollection);
      if (collection) {
        filtered = filtered.filter(item => collection.items.includes(item.id));
      }
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        case 'added':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'progress':
          return b.progressPercentage - a.progressPercentage;
        case 'rating':
          return (b.personalRating || 0) - (a.personalRating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [favorites, filterBy, sortBy, selectedCollection, collections]);

  const removeFavorite = (itemId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Favori supprimé",
      description: "L'item a été retiré de vos favoris"
    });
  };

  const updatePersonalRating = (itemId: string, rating: number) => {
    setFavorites(prev => prev.map(item =>
      item.id === itemId ? { ...item, personalRating: rating } : item
    ));
    toast({
      title: "Note mise à jour",
      description: `Note personnelle: ${rating}/5 étoiles`
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-100 text-green-800';
      case 'moyen': return 'bg-orange-100 text-orange-800';
      case 'difficile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'not_started': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'not_started': return 'Non commencé';
      default: return 'Inconnu';
    }
  };

  // Statistiques
  const stats = React.useMemo(() => {
    const total = favorites.length;
    const completed = favorites.filter(f => f.completionStatus === 'completed').length;
    const inProgress = favorites.filter(f => f.completionStatus === 'in_progress').length;
    const avgProgress = favorites.reduce((sum, f) => sum + f.progressPercentage, 0) / total || 0;
    const totalTimeRemaining = favorites.reduce((sum, f) => sum + f.estimatedTimeRemaining, 0);
    
    return { total, completed, inProgress, avgProgress, totalTimeRemaining };
  }, [favorites]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Heart className="h-7 w-7 fill-current" />
                Mes Favoris
              </CardTitle>
              <CardDescription className="text-pink-100 mt-2">
                Vos items EDN préférés et collections personnalisées
              </CardDescription>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-pink-200">Items favoris</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
              <div className="text-sm text-green-600">Terminés</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
              <div className="text-sm text-blue-600">En cours</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Eye className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{Math.round(stats.avgProgress)}%</div>
              <div className="text-sm text-purple-600">Progression moy.</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">{Math.round(stats.totalTimeRemaining / 60)}h</div>
              <div className="text-sm text-orange-600">Temps restant</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contrôles et filtres */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">Tous les statuts</option>
              <option value="not_started">Non commencé</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="recent">Récemment consulté</option>
              <option value="added">Récemment ajouté</option>
              <option value="progress">Progression</option>
              <option value="rating">Note personnelle</option>
            </select>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? 'Masquer' : 'Afficher'} les stats
        </Button>
      </div>

      <Tabs defaultValue="favorites">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="favorites">Items favoris</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-4">
          {filteredAndSortedFavorites.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun favori trouvé</h3>
                <p className="text-muted-foreground">
                  {filterBy !== 'all' ? 'Aucun item ne correspond aux filtres sélectionnés' : 'Commencez à ajouter des items à vos favoris'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedFavorites.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => onItemSelect?.(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {item.item_code}
                          </Badge>
                          
                          <Badge className={getDifficultyColor(item.difficulty)}>
                            {item.difficulty}
                          </Badge>
                          
                          <Badge variant="secondary">
                            {item.category}
                          </Badge>
                          
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(item.completionStatus)}`} title={getStatusLabel(item.completionStatus)} />
                          
                          {item.studyStreak > 0 && (
                            <Badge variant="outline" className="text-orange-600">
                              🔥 {item.studyStreak} jours
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                        {item.subtitle && (
                          <p className="text-sm text-muted-foreground mb-2">{item.subtitle}</p>
                        )}
                        
                        {item.personalNotes && (
                          <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded mb-3 italic">
                            💭 {item.personalNotes}
                          </p>
                        )}
                        
                        {/* Progression */}
                        {item.completionStatus !== 'not_started' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progression</span>
                              <span>{item.progressPercentage}%</span>
                            </div>
                            <Progress value={item.progressPercentage} className="h-2" />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Ajouté le {new Date(item.dateAdded).toLocaleDateString('fr-FR')}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Vu le {new Date(item.lastAccessed).toLocaleDateString('fr-FR')}
                          </span>
                          
                          {item.estimatedTimeRemaining > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.estimatedTimeRemaining} min restantes
                            </span>
                          )}
                        </div>
                        
                        {/* Tags */}
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 ml-4">
                        {/* Note personnelle */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePersonalRating(item.id, star);
                              }}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  star <= (item.personalRating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        
                        {/* Icônes de contenu */}
                        <div className="flex items-center gap-1">
                          {item.hasMusic && <Music className="h-4 w-4 text-purple-600" />}
                          {item.hasScene && <Play className="h-4 w-4 text-green-600" />}
                          {item.hasQuiz && <Brain className="h-4 w-4 text-blue-600" />}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Partager
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(item.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <Card
                key={collection.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCollection(
                  selectedCollection === collection.id ? null : collection.id
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 ${collection.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                      {collection.icon}
                    </div>
                    
                    <Badge variant="outline">
                      {collection.items.length} items
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{collection.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {collection.description}
                  </p>
                  
                  <div className="text-xs text-muted-foreground">
                    Créé le {new Date(collection.created).toLocaleDateString('fr-FR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-medium mb-2">Créer une nouvelle collection</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Organisez vos favoris par thème ou objectif d'apprentissage
              </p>
              <Button variant="outline">
                Nouvelle collection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};