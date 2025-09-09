import React, { useState, useEffect } from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Music, 
  Play, 
  Pause, 
  SkipForward,
  Volume2,
  Heart,
  Share2,
  Download,
  Headphones,
  Mic,
  Activity,
  Star,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  Award,
  Zap,
  Sparkles,
  Radio,
  Shuffle,
  Repeat,
  PlusCircle,
  Library,
  Search
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useNavAction } from '@/hooks/useNavAction';

// Mock data avancé pour MED-MNG
const mockMusicStats = {
  totalTracks: 47,
  totalListens: 892,
  totalHours: 67.5,
  favoriteGenres: ['Rap Médical', 'Pop Clinique', 'Electronic EDN'],
  currentStreak: 15,
  weeklyGoal: 25,
  weeklyProgress: 18,
  level: 8,
  experience: 2450,
  nextLevelExp: 3000,
  achievements: ['Premier Hit', 'Mélomane', 'Créateur Pro'],
  premiumFeatures: true
};

const mockRecentTracks = [
  {
    id: 'track-1',
    title: 'IC-331 Flow (Arrêt Cardiaque)',
    artist: 'Dr. Rhythm',
    genre: 'Rap Médical',
    duration: 180,
    plays: 156,
    likes: 89,
    createdAt: '2024-01-15',
    isPlaying: false,
    waveformData: [0.2, 0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.9, 0.4, 0.6],
    mood: 'Énergique',
    itemCode: 'IC-331',
    difficulty: 'Expert',
    cover: '/api/placeholder/150/150'
  },
  {
    id: 'track-2', 
    title: 'Pneumothorax Symphony',
    artist: 'Medical Beats',
    genre: 'Electronic EDN',
    duration: 210,
    plays: 98,
    likes: 67,
    createdAt: '2024-01-14',
    isPlaying: true,
    waveformData: [0.3, 0.5, 0.4, 0.7, 0.6, 0.8, 0.5, 0.6, 0.7, 0.4],
    mood: 'Méditatif',
    itemCode: 'IC-155',
    difficulty: 'Intermédiaire',
    cover: '/api/placeholder/150/150'
  }
];

const mockPlaylists = [
  {
    id: 'playlist-1',
    name: 'Cardiologie Hits',
    description: 'Les meilleurs sons pour réviser la cardio',
    trackCount: 12,
    totalDuration: 2400,
    cover: '/api/placeholder/200/200',
    isPublic: true,
    plays: 234
  },
  {
    id: 'playlist-2',
    name: 'Chill EDN Study',
    description: 'Ambiance relaxante pour étudier',
    trackCount: 8,
    totalDuration: 1680,
    cover: '/api/placeholder/200/200',
    isPublic: false,
    plays: 89
  }
];

const mockTrendingTracks = [
  { title: 'IC-290 Trap Remix', artist: 'DJ Medic', plays: 1204, trend: '+15%' },
  { title: 'Anatomie Lofi', artist: 'Study Beats', plays: 956, trend: '+8%' },
  { title: 'Emergency Room Bass', artist: 'Clinic Sounds', plays: 742, trend: '+22%' }
];

export default function EnhancedMedMngDashboard() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(mockRecentTracks[1]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState(45);
  const executeAction = useNavAction();

  const handlePlayerAction = (action: string) => {
    switch (action) {
      case 'play-pause':
        setIsPlaying(!isPlaying);
        break;
      case 'next':
        // Logic for next track
        break;
      case 'previous':
        // Logic for previous track
        break;
    }
  };

  const handleQuickAction = async (action: string, target?: string) => {
    switch (action) {
      case 'create':
        await executeAction({ type: "route", to: "/med-mng/create" });
        break;
      case 'library':
        await executeAction({ type: "route", to: "/med-mng/library" });
        break;
      case 'discover':
        await executeAction({ type: "route", to: "/med-mng/community" });
        break;
      default:
        if (target) {
          await executeAction({ type: "route", to: target });
        }
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "primary" }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">{value}</span>
          {trend && (
            <Badge variant="secondary" className="text-xs">
              {trend}
            </Badge>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  const TrackCard = ({ track, showWaveform = false }: { track: any; showWaveform?: boolean }) => (
    <Card className="hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 rounded-lg">
              <AvatarImage src={track.cover} alt={track.title} />
              <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                <Music className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
              <Button size="sm" variant="secondary" className="rounded-full w-8 h-8 p-0">
                {track.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-base leading-tight">{track.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{track.artist}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">{track.genre}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="w-3 h-3" />
                {track.likes}
              </div>
            </div>

            {showWaveform && (
              <div className="flex items-center gap-1 h-8">
                {track.waveformData.map((height: number, index: number) => (
                  <div
                    key={index}
                    className="bg-primary/30 rounded-full flex-1 transition-all"
                    style={{ 
                      height: `${height * 100}%`,
                      backgroundColor: index <= 4 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)'
                    }}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </span>
                <span className="flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  {track.plays}
                </span>
                <Badge variant="outline" className="text-xs">
                  {track.itemCode}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ConsistentBackground variant="secondary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="MED-MNG Studio"
          subtitle="Votre plateforme de création musicale médicale"
          icon={Music}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleQuickAction('library')}>
                <Library className="w-4 h-4 mr-2" />
                Ma Bibliothèque
              </Button>
              <Button onClick={() => handleQuickAction('create')} className="bg-gradient-to-r from-primary to-accent">
                <PlusCircle className="w-4 h-4 mr-2" />
                Créer
              </Button>
            </div>
          }
        />

        <div className="space-y-8">
          {/* Mini Player */}
          {currentlyPlaying && (
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 rounded-lg">
                    <AvatarImage src={currentlyPlaying.cover} />
                    <AvatarFallback className="rounded-lg">
                      <Music className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{currentlyPlaying.title}</h4>
                    <p className="text-xs text-muted-foreground">{currentlyPlaying.artist}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handlePlayerAction('previous')}>
                      <SkipForward className="w-4 h-4 rotate-180" />
                    </Button>
                    <Button size="sm" onClick={() => handlePlayerAction('play-pause')}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handlePlayerAction('next')}>
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{Math.floor((progress / 100) * currentlyPlaying.duration / 60)}:{Math.floor(((progress / 100) * currentlyPlaying.duration % 60)).toString().padStart(2, '0')}</span>
                    <span>{Math.floor(currentlyPlaying.duration / 60)}:{(currentlyPlaying.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Dashboard */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Music}
              title="Tracks créées"
              value={mockMusicStats.totalTracks}
              subtitle="Ce mois"
              trend="+8"
            />
            <StatCard
              icon={Headphones}
              title="Écoutes totales"
              value={mockMusicStats.totalListens}
              subtitle="Toutes plateformes"
              trend="+23%"
            />
            <StatCard
              icon={Clock}
              title="Temps d'écoute"
              value={`${mockMusicStats.totalHours}h`}
              subtitle="Cette semaine"
              trend="+12h"
            />
            <StatCard
              icon={TrendingUp}
              title="Série créative"
              value={`${mockMusicStats.currentStreak} jours`}
              subtitle="Record personnel"
              trend="🔥"
            />
          </div>

          {/* Level Progress */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-yellow-500" />
                    Niveau {mockMusicStats.level} - Producteur Avancé
                  </CardTitle>
                  <CardDescription>
                    {mockMusicStats.nextLevelExp - mockMusicStats.experience} XP pour le niveau suivant
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {mockMusicStats.experience} XP
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress 
                  value={(mockMusicStats.experience / mockMusicStats.nextLevelExp) * 100} 
                  className="h-4"
                />
                <div className="flex flex-wrap gap-2">
                  {mockMusicStats.achievements.map((achievement) => (
                    <Badge key={achievement} className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      <Star className="w-3 h-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="recent" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recent">Récents</TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
              <TabsTrigger value="trending">Tendances</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Dernières créations
                  </CardTitle>
                  <CardDescription>
                    Vos tracks récemment créées avec waveform interactive
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentTracks.map((track) => (
                      <TrackCard key={track.id} track={track} showWaveform={true} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="playlists" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {mockPlaylists.map((playlist) => (
                  <Card key={playlist.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                          <div className="text-center">
                            <Music className="w-12 h-12 mx-auto text-primary mb-2" />
                            <p className="text-2xl font-bold">{playlist.trackCount}</p>
                            <p className="text-sm text-muted-foreground">tracks</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="lg" className="rounded-full">
                            <Play className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{playlist.name}</h4>
                            <p className="text-sm text-muted-foreground">{playlist.description}</p>
                          </div>
                          {playlist.isPublic && (
                            <Badge variant="outline">Public</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{Math.floor(playlist.totalDuration / 60)} min</span>
                          <span className="flex items-center gap-1">
                            <Headphones className="w-3 h-3" />
                            {playlist.plays}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5" />
                    Trending dans la communauté
                  </CardTitle>
                  <CardDescription>
                    Les tracks les plus écoutées cette semaine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTrendingTracks.map((track, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{track.title}</p>
                            <p className="text-sm text-muted-foreground">{track.artist}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{track.plays.toLocaleString()}</p>
                          <p className="text-sm text-green-600">{track.trend}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Genres favoris
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockMusicStats.favoriteGenres.map((genre, index) => (
                        <div key={genre} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{genre}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${100 - (index * 15)}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {100 - (index * 15)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Insights créatifs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Heure de création préférée</span>
                        <span className="font-semibold">20h-22h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Style le plus créé</span>
                        <span className="font-semibold">Rap Médical</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Durée moyenne</span>
                        <span className="font-semibold">3:25</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Taux de like</span>
                        <span className="font-semibold text-green-600">94%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ConsistentBackground>
  );
}