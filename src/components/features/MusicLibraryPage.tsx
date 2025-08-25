import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Music, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Heart, 
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  duration: number;
  rang: 'A' | 'B';
  style: string;
  createdAt: Date;
  plays: number;
  liked: boolean;
  audioUrl: string;
}

export const MusicLibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  const tracks: MusicTrack[] = [
    {
      id: '1',
      title: 'Anatomie Cardiaque - Rang A',
      duration: 180,
      rang: 'A',
      style: 'Éducatif Pop',
      createdAt: new Date('2024-01-15'),
      plays: 45,
      liked: true,
      audioUrl: 'track1.mp3'
    },
    {
      id: '2',
      title: 'Système Respiratoire - Rang B',
      duration: 210,
      rang: 'B',
      style: 'Folk Médical',
      createdAt: new Date('2024-01-14'),
      plays: 32,
      liked: false,
      audioUrl: 'track2.mp3'
    },
    {
      id: '3',
      title: 'Pharmacologie Base - Rang A',
      duration: 195,
      rang: 'A',
      style: 'Rap Éducatif',
      createdAt: new Date('2024-01-13'),
      plays: 67,
      liked: true,
      audioUrl: 'track3.mp3'
    },
  ];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = (trackId: string) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId);
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.style.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Ma Bibliothèque Musicale
          </h1>
          <p className="text-xl text-muted-foreground">
            Collection de vos créations musicales éducatives
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans votre bibliothèque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle création
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Music className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold">{tracks.length}</div>
              <div className="text-sm text-muted-foreground">Pistes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Play className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{tracks.reduce((sum, t) => sum + t.plays, 0)}</div>
              <div className="text-sm text-muted-foreground">Écoutes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{tracks.filter(t => t.liked).length}</div>
              <div className="text-sm text-muted-foreground">Favoris</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{Math.floor(tracks.reduce((sum, t) => sum + t.duration, 0) / 60)}</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </CardContent>
          </Card>
        </div>

        {/* Music Library */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map((track) => (
              <Card key={track.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{track.title}</span>
                    <Badge variant={track.rang === 'A' ? 'default' : 'secondary'}>
                      Rang {track.rang}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{track.style}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatDuration(track.duration)}</span>
                    <span>{track.plays} écoutes</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handlePlay(track.id)}
                      className="flex-1"
                    >
                      {playingTrack === track.id ? (
                        <Pause className="h-4 w-4 mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {playingTrack === track.id ? 'Pause' : 'Écouter'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className={`h-4 w-4 ${track.liked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="divide-y">
                  {filteredTracks.map((track) => (
                    <div key={track.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePlay(track.id)}
                        >
                          {playingTrack === track.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <div className="font-medium">{track.title}</div>
                          <div className="text-sm text-muted-foreground">{track.style}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant={track.rang === 'A' ? 'default' : 'secondary'}>
                          Rang {track.rang}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(track.duration)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {track.plays} écoutes
                        </span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Heart className={`h-3 w-3 ${track.liked ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};