import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Play, 
  Pause, 
  Plus, 
  Share2, 
  Heart, 
  Clock, 
  Users,
  Music,
  Search,
  Filter,
  Shuffle,
  MoreHorizontal,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Playlist {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  trackCount: number;
  duration: number;
  isPublic: boolean;
  owner: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  createdAt: string;
  plays: number;
  likes: number;
  isLiked?: boolean;
  isOwned?: boolean;
}

interface Track {
  id: string;
  title: string;
  itemCode: string;
  duration: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  style: string;
}

const Playlists = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [playlists] = useState<Playlist[]>([
    {
      id: '1',
      name: 'Révisions Cardiologie',
      description: 'Collection complète pour maîtriser la cardiologie',
      trackCount: 23,
      duration: 1847, // en secondes
      isPublic: true,
      owner: {
        name: 'Dr. Martin',
        avatar: undefined
      },
      category: 'Cardiologie',
      tags: ['arythmies', 'insuffisance-cardiaque', 'ecg'],
      createdAt: '2024-01-10',
      plays: 156,
      likes: 28,
      isLiked: true,
      isOwned: true
    },
    {
      id: '2',
      name: 'Urgences Vitales',
      description: 'Situations d\'urgence et protocoles de réanimation',
      trackCount: 15,
      duration: 1205,
      isPublic: true,
      owner: {
        name: 'Sophie Chen'
      },
      category: 'Urgences',
      tags: ['acr', 'choc', 'intoxication'],
      createdAt: '2024-01-08',
      plays: 89,
      likes: 45,
      isLiked: false,
      isOwned: false
    },
    {
      id: '3',
      name: 'Neurologie Clinique',
      description: 'AVC, épilepsie, démences - L\'essentiel en neurologie',
      trackCount: 18,
      duration: 1456,
      isPublic: false,
      owner: {
        name: 'Vous'
      },
      category: 'Neurologie',
      tags: ['avc', 'epilepsie', 'demence'],
      createdAt: '2024-01-05',
      plays: 67,
      likes: 12,
      isLiked: false,
      isOwned: true
    },
    {
      id: '4',
      name: 'Pédiatrie Essentielle',
      description: 'Les pathologies pédiatriques incontournables',
      trackCount: 20,
      duration: 1632,
      isPublic: true,
      owner: {
        name: 'Emma Bernard'
      },
      category: 'Pédiatrie',
      tags: ['vaccins', 'croissance', 'urgences-pediatriques'],
      createdAt: '2024-01-03',
      plays: 134,
      likes: 37,
      isLiked: true,
      isOwned: false
    }
  ]);

  const categories = ['all', 'Cardiologie', 'Neurologie', 'Pédiatrie', 'Urgences', 'Psychiatrie'];

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playlist.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playlist.tags.some(tag => tag.includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || playlist.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlay = (playlistId: string) => {
    if (currentPlaying === playlistId) {
      setCurrentPlaying(null);
      toast({
        title: "Lecture arrêtée",
        description: "La playlist a été mise en pause.",
      });
    } else {
      setCurrentPlaying(playlistId);
      toast({
        title: "Lecture démarrée",
        description: "La playlist est en cours de lecture.",
      });
    }
  };

  const handleLike = (playlistId: string) => {
    toast({
      title: "Playlist ajoutée aux favoris",
      description: "Vous pouvez la retrouver dans vos favoris.",
    });
  };

  const handleShare = (playlistId: string) => {
    navigator.clipboard.writeText(`https://medmng.com/playlists/${playlistId}`);
    toast({
      title: "Lien copié",
      description: "Le lien de la playlist a été copié.",
    });
  };

  const handleEdit = (playlistId: string) => {
    navigate(`/med-mng/playlists/${playlistId}/edit`);
  };

  const handleDelete = (playlistId: string) => {
    toast({
      title: "Playlist supprimée",
      description: "La playlist a été supprimée de votre bibliothèque.",
    });
  };

  const createPlaylist = () => {
    setShowCreateModal(true);
  };

  return (
    <MedMngLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Playlists Musicales</h1>
            <p className="text-gray-600">
              Organisez vos apprentissages par thème et partagez vos collections
            </p>
          </div>
          <Button onClick={createPlaylist} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Créer une playlist
          </Button>
        </div>

        {/* Recherche et filtres */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher une playlist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category === 'all' ? 'Toutes' : category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Music className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mes playlists</p>
                  <p className="text-xl font-bold">
                    {playlists.filter(p => p.isOwned).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Favoris</p>
                  <p className="text-xl font-bold">
                    {playlists.filter(p => p.isLiked).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Partagées</p>
                  <p className="text-xl font-bold">
                    {playlists.filter(p => !p.isOwned).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temps total</p>
                  <p className="text-xl font-bold">
                    {formatDuration(playlists.reduce((acc, p) => acc + p.duration, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grille des playlists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => (
            <Card key={playlist.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                  {playlist.coverImage ? (
                    <img
                      src={playlist.coverImage}
                      alt={playlist.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <Music className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                
                {/* Overlay de lecture */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    size="lg"
                    onClick={() => handlePlay(playlist.id)}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    {currentPlaying === playlist.id ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                </div>

                {/* Badge de visibilité */}
                <div className="absolute top-2 left-2">
                  <Badge variant={playlist.isPublic ? "default" : "secondary"}>
                    {playlist.isPublic ? 'Publique' : 'Privée'}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    {playlist.isOwned && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(playlist.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(playlist.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleShare(playlist.id)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{playlist.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {playlist.description}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={playlist.owner.avatar} />
                    <AvatarFallback className="text-xs">
                      {playlist.owner.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{playlist.owner.name}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {playlist.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {playlist.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{playlist.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{playlist.trackCount} pistes</span>
                    <span>{formatDuration(playlist.duration)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        {playlist.plays}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {playlist.likes}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLike(playlist.id)}
                        className={playlist.isLiked ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 ${playlist.isLiked ? 'fill-current' : ''}`} />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* État vide */}
        {filteredPlaylists.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune playlist trouvée</h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche ou créez votre première playlist
              </p>
              <Button onClick={createPlaylist}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une playlist
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MedMngLayout>
  );
};

export default withAuth(Playlists);