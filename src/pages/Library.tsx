import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Music, 
  Search, 
  Filter, 
  Play, 
  Heart, 
  Share2, 
  Download, 
  Clock, 
  Star, 
  Folder,
  Grid,
  List,
  SortAsc,
  Calendar,
  Tag,
  Volume2,
  Shuffle,
  Repeat,
  SkipForward,
  SkipBack,
  Pause,
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImmersiveLayout } from '@/components/immersive/ImmersiveLayout';
import { AdvancedGeneratorFeatures } from '@/components/generator/AdvancedGeneratorFeatures';

export default function Library() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPlaylist, setSelectedPlaylist] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playlists = [
    { id: 'all', name: 'Toutes les musiques', count: 156, color: 'bg-gradient-to-r from-purple-500 to-pink-600' },
    { id: 'favorites', name: 'Favoris', count: 28, color: 'bg-gradient-to-r from-red-500 to-pink-600' },
    { id: 'cardiologie', name: 'Cardiologie', count: 34, color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
    { id: 'neurologie', name: 'Neurologie', count: 22, color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { id: 'pneumologie', name: 'Pneumologie', count: 18, color: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
    { id: 'recent', name: 'Récemment ajoutées', count: 12, color: 'bg-gradient-to-r from-orange-500 to-red-600' }
  ];

  const tracks = [
    {
      id: '1',
      title: 'Insuffisance Cardiaque Rap',
      item: 'IC-225',
      specialty: 'Cardiologie',
      duration: '3:24',
      plays: 1247,
      likes: 89,
      dateCreated: '2024-01-15',
      style: 'Rap',
      difficulty: 'Intermédiaire',
      isLiked: true,
      score: 94,
      thumbnail: '/api/placeholder/80/80'
    },
    {
      id: '2',
      title: 'Arythmie Électro Beat',
      item: 'IC-230',
      specialty: 'Cardiologie',
      duration: '2:58',
      plays: 892,
      likes: 67,
      dateCreated: '2024-01-12',
      style: 'Électro',
      difficulty: 'Avancé',
      isLiked: false,
      score: 87,
      thumbnail: '/api/placeholder/80/80'
    },
    {
      id: '3',
      title: 'AVC Mélodie Douce',
      item: 'IC-91',
      specialty: 'Neurologie',
      duration: '4:12',
      plays: 1056,
      likes: 92,
      dateCreated: '2024-01-10',
      style: 'Pop',
      difficulty: 'Facile',
      isLiked: true,
      score: 96,
      thumbnail: '/api/placeholder/80/80'
    },
    {
      id: '4',
      title: 'Asthme Trap Lourd',
      item: 'IC-174',
      specialty: 'Pneumologie',
      duration: '3:45',
      plays: 743,
      likes: 54,
      dateCreated: '2024-01-08',
      style: 'Trap',
      difficulty: 'Intermédiaire',
      isLiked: false,
      score: 91,
      thumbnail: '/api/placeholder/80/80'
    }
  ];

  const recentStats = {
    totalTracks: 156,
    totalPlays: 12847,
    totalLikes: 2156,
    averageScore: 89,
    weeklyGrowth: 12
  };

  const handlePlay = (trackId: string) => {
    if (currentTrack === trackId && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(trackId);
      setIsPlaying(true);
    }
  };

  const handleLike = (trackId: string) => {
    // Toggle like status
    console.log('Toggle like for track:', trackId);
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          track.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          track.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlaylist = selectedPlaylist === 'all' || 
                           (selectedPlaylist === 'favorites' && track.isLiked) ||
                           (selectedPlaylist === 'cardiologie' && track.specialty === 'Cardiologie') ||
                           (selectedPlaylist === 'neurologie' && track.specialty === 'Neurologie') ||
                           (selectedPlaylist === 'pneumologie' && track.specialty === 'Pneumologie');
    
    return matchesSearch && matchesPlaylist;
  });

  return (
    <ImmersiveLayout
      variant="music"
      header={{
        title: "Bibliothèque Musicale",
        subtitle: `${recentStats.totalTracks} créations • ${recentStats.totalPlays} écoutes`,
        icon: <Music className="h-6 w-6" />,
        badge: { text: `+${recentStats.weeklyGrowth}%`, color: "green" },
        actions: (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/generator')}>
              <Plus className="h-4 w-4 mr-2" />
              Créer
            </Button>
          </div>
        )
      }}
    >
      <div className="space-y-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Créations', value: recentStats.totalTracks, icon: Music, color: 'from-purple-500 to-pink-600' },
            { label: 'Écoutes', value: recentStats.totalPlays.toLocaleString(), icon: Volume2, color: 'from-blue-500 to-indigo-600' },
            { label: 'Likes', value: recentStats.totalLikes.toLocaleString(), icon: Heart, color: 'from-red-500 to-pink-600' },
            { label: 'Score Moyen', value: `${recentStats.averageScore}%`, icon: Star, color: 'from-yellow-500 to-orange-600' }
          ].map((stat, index) => (
            <Card key={index} className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres et recherche */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par titre, item ou spécialité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Plus récent</SelectItem>
                    <SelectItem value="popular">Plus populaire</SelectItem>
                    <SelectItem value="liked">Plus likés</SelectItem>
                    <SelectItem value="score">Meilleur score</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Playlists */}
          <div className="lg:col-span-1">
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Playlists
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => setSelectedPlaylist(playlist.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedPlaylist === playlist.id 
                        ? 'bg-white/20 border border-white/30' 
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${playlist.color} rounded-lg flex items-center justify-center`}>
                        <Music className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{playlist.name}</p>
                        <p className="text-gray-400 text-xs">{playlist.count} musiques</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Liste des musiques */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="tracks" className="space-y-4">
              <TabsList className="bg-black/20 border border-white/10">
                <TabsTrigger value="tracks" className="data-[state=active]:bg-white/20">
                  Musiques ({filteredTracks.length})
                </TabsTrigger>
                <TabsTrigger value="generator">
                  Générateur Avancé
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tracks" className="space-y-4">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTracks.map((track) => (
                      <Card key={track.id} className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 group">
                        <CardContent className="p-4">
                          <div className="relative mb-4">
                            <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <Music className="h-12 w-12 text-white" />
                            </div>
                            <button
                              onClick={() => handlePlay(track.id)}
                              className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {currentTrack === track.id && isPlaying ? (
                                <Pause className="h-12 w-12 text-white" />
                              ) : (
                                <Play className="h-12 w-12 text-white" />
                              )}
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-white font-medium text-sm line-clamp-2">{track.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-blue-500/20 text-blue-300 text-xs">{track.item}</Badge>
                              <Badge className="bg-purple-500/20 text-purple-300 text-xs">{track.specialty}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>{track.duration}</span>
                              <span>{track.plays} écoutes</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleLike(track.id)}
                                  className={`p-1 rounded ${track.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                                >
                                  <Heart className={`h-4 w-4 ${track.isLiked ? 'fill-current' : ''}`} />
                                </button>
                                <span className="text-xs text-gray-400">{track.likes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Share2 className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTracks.map((track) => (
                      <Card key={track.id} className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handlePlay(track.id)}
                              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
                            >
                              {currentTrack === track.id && isPlaying ? (
                                <Pause className="h-5 w-5 text-white" />
                              ) : (
                                <Play className="h-5 w-5 text-white" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium text-sm mb-1 truncate">{track.title}</h3>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-blue-500/20 text-blue-300 text-xs">{track.item}</Badge>
                                <Badge className="bg-purple-500/20 text-purple-300 text-xs">{track.specialty}</Badge>
                                <Badge className="bg-green-500/20 text-green-300 text-xs">{track.style}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>{track.duration}</span>
                                <span>{track.plays} écoutes</span>
                                <span>Score: {track.score}%</span>
                                <span>{new Date(track.dateCreated).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleLike(track.id)}
                                className={`p-2 rounded-full hover:bg-white/10 ${track.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                              >
                                <Heart className={`h-4 w-4 ${track.isLiked ? 'fill-current' : ''}`} />
                              </button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/edn/${track.item.toLowerCase()}`)}>
                                <BookOpen className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="generator">
                <AdvancedGeneratorFeatures />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ImmersiveLayout>
  );
}