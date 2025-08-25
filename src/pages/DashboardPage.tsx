import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, 
  Play, 
  Pause, 
  Download, 
  Heart, 
  TrendingUp, 
  Clock, 
  Users,
  Headphones,
  Mic,
  Volume2,
  Share,
  BarChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  genre: string;
  plays: number;
  likes: number;
  createdAt: Date;
  audioUrl: string;
  waveform: number[];
}

interface PlaylistItem {
  id: string;
  name: string;
  description: string;
  tracksCount: number;
  totalDuration: number;
  isPublic: boolean;
  createdAt: Date;
}

export function DashboardPage() {
  const [recentTracks, setRecentTracks] = useState<Track[]>([
    {
      id: '1',
      title: 'IC-1 - Relation médecin-malade',
      artist: 'MED-MNG AI',
      duration: 180,
      genre: 'Médical Pop',
      plays: 1247,
      likes: 89,
      createdAt: new Date(Date.now() - 86400000),
      audioUrl: '/audio/track1.mp3',
      waveform: Array.from({ length: 50 }, () => Math.random() * 100)
    },
    {
      id: '2', 
      title: 'Cardiologie - Rang A',
      artist: 'MED-MNG AI',
      duration: 145,
      genre: 'Medical Rock',
      plays: 892,
      likes: 67,
      createdAt: new Date(Date.now() - 172800000),
      audioUrl: '/audio/track2.mp3',
      waveform: Array.from({ length: 50 }, () => Math.random() * 100)
    },
    {
      id: '3',
      title: 'Neurologie - Diagnostics',
      artist: 'MED-MNG AI',
      duration: 210,
      genre: 'Medical Jazz',
      plays: 634,
      likes: 45,
      createdAt: new Date(Date.now() - 259200000),
      audioUrl: '/audio/track3.mp3',
      waveform: Array.from({ length: 50 }, () => Math.random() * 100)
    }
  ]);

  const [playlists, setPlaylists] = useState<PlaylistItem[]>([
    {
      id: '1',
      name: 'Fondamentaux médicaux',
      description: 'Les bases essentielles',
      tracksCount: 12,
      totalDuration: 2160,
      isPublic: true,
      createdAt: new Date(Date.now() - 604800000)
    },
    {
      id: '2',
      name: 'Spécialités avancées',
      description: 'Contenus spécialisés',
      tracksCount: 8,
      totalDuration: 1440,
      isPublic: false,
      createdAt: new Date(Date.now() - 1209600000)
    }
  ]);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { toast } = useToast();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const likeTrack = (trackId: string) => {
    setRecentTracks(tracks => 
      tracks.map(track => 
        track.id === trackId 
          ? { ...track, likes: track.likes + 1 }
          : track
      )
    );
    toast({
      title: "Ajouté aux favoris",
      description: "La piste a été ajoutée à vos favoris"
    });
  };

  const shareTrack = (track: Track) => {
    navigator.clipboard.writeText(`https://medmng.fr/track/${track.id}`);
    toast({
      title: "Lien copié",
      description: "Le lien de partage a été copié dans le presse-papier"
    });
  };

  const downloadTrack = (track: Track) => {
    // Simulate download
    toast({
      title: "Téléchargement lancé",
      description: `Téléchargement de "${track.title}" en cours...`
    });
  };

  const totalTracks = recentTracks.length;
  const totalPlays = recentTracks.reduce((acc, track) => acc + track.plays, 0);
  const totalLikes = recentTracks.reduce((acc, track) => acc + track.likes, 0);
  const totalDuration = recentTracks.reduce((acc, track) => acc + track.duration, 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Dashboard Musical
        </h1>
        <p className="text-lg text-muted-foreground">
          Votre centre de contrôle pour la création musicale médicale
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pistes créées</p>
                <p className="text-2xl font-bold">{totalTracks}</p>
                <p className="text-xs text-green-600">+{Math.floor(totalTracks * 0.2)} ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Headphones className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total écoutes</p>
                <p className="text-2xl font-bold">{totalPlays.toLocaleString()}</p>
                <p className="text-xs text-green-600">+15% cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">J'aime reçus</p>
                <p className="text-2xl font-bold">{totalLikes}</p>
                <p className="text-xs text-green-600">+{Math.floor(totalLikes * 0.1)} aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Durée totale</p>
                <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
                <p className="text-xs text-muted-foreground">de contenu créé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Player */}
      {currentTrack && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  size="lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-full w-12 h-12"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <div>
                  <CardTitle className="text-lg">{currentTrack.title}</CardTitle>
                  <CardDescription>{currentTrack.artist} • {currentTrack.genre}</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600">
                  <Volume2 className="h-3 w-3 mr-1" />
                  En lecture
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(currentTrack.duration)}</span>
              </div>
              <Progress value={(currentTime / currentTrack.duration) * 100} className="w-full" />
            </div>
            <div className="flex items-center space-x-2 h-12">
              {currentTrack.waveform.map((height, index) => (
                <div
                  key={index}
                  className="bg-primary/20 flex-1 rounded-sm transition-all"
                  style={{ 
                    height: `${Math.max(4, height * 0.4)}px`,
                    backgroundColor: index < (currentTime / currentTrack.duration) * 50 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.2)'
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Récentes</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Recent Tracks */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Music className="h-5 w-5" />
                <span>Pistes récentes</span>
              </CardTitle>
              <CardDescription>Vos dernières créations musicales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playTrack(track)}
                        className="rounded-full w-10 h-10 p-0"
                      >
                        {currentTrack?.id === track.id && isPlaying ? 
                          <Pause className="h-4 w-4" /> : 
                          <Play className="h-4 w-4" />
                        }
                      </Button>
                      <div className="space-y-1">
                        <h4 className="font-medium">{track.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{track.genre}</Badge>
                          <span>{formatDuration(track.duration)}</span>
                          <span>{track.plays} écoutes</span>
                          <span>{track.likes} ❤️</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => likeTrack(track.id)}>
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => shareTrack(track)}>
                        <Share className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => downloadTrack(track)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Playlists */}
        <TabsContent value="playlists" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="h-5 w-5" />
                    <span>Mes playlists</span>
                  </CardTitle>
                  <CardDescription>Collections organisées de vos créations</CardDescription>
                </div>
                <Button>
                  <Music className="h-4 w-4 mr-2" />
                  Nouvelle playlist
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playlists.map((playlist) => (
                  <Card key={playlist.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{playlist.name}</CardTitle>
                          <CardDescription>{playlist.description}</CardDescription>
                        </div>
                        <Badge variant={playlist.isPublic ? "default" : "secondary"}>
                          {playlist.isPublic ? "Public" : "Privé"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{playlist.tracksCount} pistes</span>
                          <span>{formatDuration(playlist.totalDuration)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Créée le {playlist.createdAt.toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <Button size="sm" className="flex-1">
                            <Play className="h-3 w-3 mr-1" />
                            Lire
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5" />
                  <span>Performances des pistes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTracks.map((track, index) => (
                    <div key={track.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate flex-1">{track.title}</span>
                        <span className="text-sm text-muted-foreground">{track.plays} écoutes</span>
                      </div>
                      <Progress value={(track.plays / Math.max(...recentTracks.map(t => t.plays))) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Tendances par genre</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...new Set(recentTracks.map(t => t.genre))].map((genre) => {
                    const genreTracks = recentTracks.filter(t => t.genre === genre);
                    const totalGenrePlays = genreTracks.reduce((acc, t) => acc + t.plays, 0);
                    return (
                      <div key={genre} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{genre}</span>
                          <span className="text-sm text-muted-foreground">{totalGenrePlays} écoutes</span>
                        </div>
                        <Progress value={(totalGenrePlays / totalPlays) * 100} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Music className="h-4 w-4 text-purple-600" />
                  <span>Nouvelle piste créée: "{recentTracks[0]?.title}"</span>
                  <span className="text-muted-foreground">Il y a 1 jour</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span>+{Math.floor(Math.random() * 10)} nouveaux j'aime</span>
                  <span className="text-muted-foreground">Il y a 2 heures</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Playlist partagée avec 5 utilisateurs</span>
                  <span className="text-muted-foreground">Il y a 1 semaine</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}