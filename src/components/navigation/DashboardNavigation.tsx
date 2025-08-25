import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Music, 
  Play, 
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Heart,
  Share2,
  Download,
  Plus,
  Search,
  Filter,
  Shuffle,
  Repeat,
  Library,
  Mic,
  Headphones,
  Radio,
  TrendingUp,
  Clock,
  Users,
  Star,
  Calendar,
  BarChart3,
  Award,
  Zap,
  Sparkles,
  Layers,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  Disc,
  Album,
  PlayCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";

export const DashboardNavigation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(75);

  const musicModules = [
    {
      id: "library",
      title: "Ma Bibliothèque",
      description: "Vos créations musicales",
      icon: Library,
      color: "bg-blue-500",
      count: 127,
      subModules: [
        { id: "all", name: "Toutes", icon: Music, count: 127 },
        { id: "favorites", name: "Favoris", icon: Heart, count: 23 },
        { id: "recent", name: "Récentes", icon: Clock, count: 15 },
        { id: "playlists", name: "Playlists", icon: Layers, count: 8 }
      ]
    },
    {
      id: "create",
      title: "Création",
      description: "Générer nouvelle musique",
      icon: Sparkles,
      color: "bg-purple-500",
      count: 45,
      subModules: [
        { id: "generator", name: "Générateur", icon: Zap, count: null },
        { id: "templates", name: "Templates", icon: Layers, count: 25 },
        { id: "styles", name: "Styles", icon: Disc, count: 12 },
        { id: "collaborative", name: "Collaboratif", icon: Users, count: 8 }
      ]
    },
    {
      id: "discover",
      title: "Découverte",
      description: "Musiques populaires",
      icon: TrendingUp,
      color: "bg-green-500",
      count: 892,
      subModules: [
        { id: "trending", name: "Tendances", icon: TrendingUp, count: 50 },
        { id: "categories", name: "Catégories", icon: Grid, count: 15 },
        { id: "artists", name: "Artistes", icon: Mic, count: 127 },
        { id: "recommendations", name: "Recommandés", icon: Star, count: 35 }
      ]
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Statistiques d'écoute",
      icon: BarChart3,
      color: "bg-orange-500",
      count: null,
      subModules: [
        { id: "listening", name: "Écoutes", icon: Headphones, count: null },
        { id: "engagement", name: "Engagement", icon: TrendingUp, count: null },
        { id: "sharing", name: "Partages", icon: Share2, count: null },
        { id: "performance", name: "Performance", icon: Award, count: null }
      ]
    }
  ];

  const recentTracks = [
    {
      id: "track-1",
      title: "Cardiologie Rhythm",
      artist: "Dr. Marie L.",
      genre: "EDN-Folk",
      duration: "3:24",
      plays: 1247,
      likes: 89,
      created: "Il y a 2h",
      cover: "/music-cover-1.jpg"
    },
    {
      id: "track-2",
      title: "Neurological Symphony",
      artist: "Prof. Jean D.",
      genre: "Classical-Medical",
      duration: "4:15",
      plays: 856,
      likes: 67,
      created: "Hier",
      cover: "/music-cover-2.jpg"
    },
    {
      id: "track-3",
      title: "Urgences Beat",
      artist: "Dr. Sophie M.",
      genre: "Electronic-EDN",
      duration: "2:48",
      plays: 2134,
      likes: 156,
      created: "Il y a 3 jours",
      cover: "/music-cover-3.jpg"
    }
  ];

  const topPlaylists = [
    {
      id: "playlist-1",
      name: "Items EDN Essentiels",
      description: "Les 50 items les plus importants en musique",
      trackCount: 50,
      plays: 15420,
      cover: "/playlist-cover-1.jpg",
      author: "LiSA Team"
    },
    {
      id: "playlist-2", 
      name: "Révisions Cardiologie",
      description: "Tous les concepts cardio en rythme",
      trackCount: 23,
      plays: 8965,
      cover: "/playlist-cover-2.jpg",
      author: "Dr. Cardiac"
    },
    {
      id: "playlist-3",
      name: "Focus Study",
      description: "Musiques pour concentration maximale",
      trackCount: 35,
      plays: 12304,
      cover: "/playlist-cover-3.jpg",
      author: "StudyBeats"
    }
  ];

  const musicStats = [
    { name: "Pistes créées", value: "127", change: "+12 cette semaine", icon: Music },
    { name: "Temps d'écoute", value: "42h", change: "+8h cette semaine", icon: Headphones },
    { name: "Likes reçus", value: "1,247", change: "+89 cette semaine", icon: Heart },
    { name: "Partages", value: "346", change: "+23 cette semaine", icon: Share2 }
  ];

  return (
    <div className="space-y-6">
      {/* Header Dashboard Musique */}
      <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Music className="h-6 w-6" />
              Dashboard Musical LiSA
            </h2>
            <p className="text-white/90">
              Votre centre de création et d'écoute musicale médicale
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Créer
            </Button>
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
              <Shuffle className="h-4 w-4 mr-2" />
              Aléatoire
            </Button>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {musicStats.map((stat, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-purple-600" />
                <Badge variant="secondary" className="text-xs">
                  +{Math.floor(Math.random() * 20)}%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.name}</div>
              <div className="text-xs text-green-600 mt-1">{stat.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation par modules */}
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          {musicModules.map((module) => (
            <TabsTrigger key={module.id} value={module.id} className="text-sm">
              <module.icon className="h-4 w-4 mr-2" />
              {module.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {musicModules.map((module) => (
          <TabsContent key={module.id} value={module.id} className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {module.subModules.map((subModule) => (
                <Link key={subModule.id} to={`/dashboard/${module.id}/${subModule.id}`}>
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`h-10 w-10 ${module.color} rounded-lg flex items-center justify-center`}>
                          <subModule.icon className="h-5 w-5 text-white" />
                        </div>
                        {subModule.count && (
                          <Badge variant="secondary" className="text-xs">
                            {subModule.count}
                          </Badge>
                        )}
                      </div>
                      <div className="font-medium text-gray-900">{subModule.name}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pistes récentes */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Créations Récentes
              </CardTitle>
              <Button size="sm" variant="outline">
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {recentTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={track.cover} />
                        <AvatarFallback>
                          <Music className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/60"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 text-white" />
                        ) : (
                          <Play className="h-4 w-4 text-white" />
                        )}
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{track.title}</div>
                      <div className="text-xs text-gray-600">{track.artist} • {track.genre}</div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{track.duration}</span>
                        <span>{track.plays} écoutes</span>
                        <span>{track.likes} ♥</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Heart className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Playlists populaires */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-600" />
                Playlists Populaires
              </CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer group"
                >
                  <div className="relative">
                    <Avatar className="h-16 w-16 rounded-lg">
                      <AvatarImage src={playlist.cover} />
                      <AvatarFallback className="rounded-lg">
                        <Album className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute inset-0 w-full h-full rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/60"
                    >
                      <PlayCircle className="h-6 w-6 text-white" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{playlist.name}</div>
                    <div className="text-sm text-gray-600 line-clamp-1">{playlist.description}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{playlist.trackCount} pistes</span>
                      <span>{playlist.plays.toLocaleString()} écoutes</span>
                      <span>par {playlist.author}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 z-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/current-track.jpg" />
                <AvatarFallback>
                  <Music className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">Aucune piste sélectionnée</div>
                <div className="text-xs text-gray-600">Choisissez une musique</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost">
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-10 w-10 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button size="sm" variant="ghost">
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Progress value={volume} className="w-20 h-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};