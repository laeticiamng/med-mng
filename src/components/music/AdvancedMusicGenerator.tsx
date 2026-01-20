import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  Download,
  Share2,
  MoreHorizontal,
  Shuffle,
  Repeat,
  SkipBack,
  SkipForward,
  Mic,
  Settings,
  Sparkles,
  Brain,
  Clock,
  Headphones,
  Activity,
  Flame,
  Star,
  Zap
} from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  genre: string;
  itemCode?: string;
  specialty?: string;
  isGenerating?: boolean;
  isLiked?: boolean;
  waveform?: number[];
  lyrics?: string[];
  binaural?: boolean;
  frequency?: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: MusicTrack[];
  coverImage?: string;
  isPublic: boolean;
  createdAt: string;
}

interface GenerationRequest {
  prompt: string;
  style: string;
  duration: number;
  specialty?: string;
  itemCode?: string;
  binaural: boolean;
  frequency?: string;
  lyrics?: string[];
}

export const AdvancedMusicGenerator: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentTracks, setRecentTracks] = useState<MusicTrack[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationRequest, setGenerationRequest] = useState<GenerationRequest>({
    prompt: '',
    style: 'lofi',
    duration: 120,
    binaural: false,
    lyrics: []
  });

  useEffect(() => {
    loadMusicLibrary();
  }, []);

  const loadMusicLibrary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les morceaux générés depuis Supabase
      const { data: songsData, error } = await supabase
        .from('med_mng_songs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const mappedTracks: MusicTrack[] = (songsData || []).map((song: any) => ({
        id: song.id,
        title: song.title,
        artist: 'MED-AI',
        duration: (song.meta as any)?.duration || 180,
        genre: (song.meta as any)?.style || 'LoFi Medical',
        itemCode: (song.meta as any)?.item_code,
        specialty: (song.meta as any)?.specialty || '',
        isLiked: (song.meta as any)?.is_favorite || false,
        binaural: (song.meta as any)?.binaural || false,
        frequency: (song.meta as any)?.frequency,
        waveform: Array.from({ length: 100 }, () => Math.random() * 100),
        lyrics: song.lyrics ? (typeof song.lyrics === 'string' ? (song.lyrics as string).split('\n') : song.lyrics as string[]) : [],
        audioUrl: (song.meta as any)?.audio_url
      }));

      if (mappedTracks.length > 0) {
        setRecentTracks(mappedTracks);
        setCurrentTrack(mappedTracks[0]);
      }

      // Charger les playlists depuis Supabase
      const { data: playlistsData } = await supabase
        .from('med_mng_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (playlistsData && playlistsData.length > 0) {
        const mappedPlaylists: Playlist[] = playlistsData.map(pl => ({
          id: pl.id,
          name: pl.name,
          description: pl.description || '',
          tracks: [],
          isPublic: pl.is_public || false,
          createdAt: pl.created_at
        }));
        setPlaylists(mappedPlaylists);
      }
    } catch (error) {
      console.error('Erreur chargement bibliothèque musicale:', error);
    }
  };

  const generateMusic = async () => {
    if (!generationRequest.prompt) return;

    setIsGenerating(true);
    
    // Simulation de génération IA
    setTimeout(() => {
      const newTrack: MusicTrack = {
        id: Date.now().toString(),
        title: `Generated: ${generationRequest.prompt.slice(0, 20)}...`,
        artist: 'MED-AI',
        duration: generationRequest.duration,
        genre: generationRequest.style,
        itemCode: generationRequest.itemCode,
        specialty: generationRequest.specialty,
        isLiked: false,
        binaural: generationRequest.binaural,
        frequency: generationRequest.frequency,
        waveform: Array.from({ length: 100 }, () => Math.random() * 100),
        lyrics: generationRequest.lyrics
      };

      setRecentTracks(prev => [newTrack, ...prev]);
      setCurrentTrack(newTrack);
      setIsGenerating(false);
      
      // Reset form
      setGenerationRequest({
        prompt: '',
        style: 'lofi',
        duration: 120,
        binaural: false,
        lyrics: []
      });
    }, 3000);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleLike = (trackId: string) => {
    setRecentTracks(prev => 
      prev.map(track => 
        track.id === trackId 
          ? { ...track, isLiked: !track.isLiked }
          : track
      )
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addLyricLine = () => {
    setGenerationRequest(prev => ({
      ...prev,
      lyrics: [...prev.lyrics, '']
    }));
  };

  const updateLyricLine = (index: number, value: string) => {
    setGenerationRequest(prev => ({
      ...prev,
      lyrics: prev.lyrics.map((line, i) => i === index ? value : line)
    }));
  };

  const removeLyricLine = (index: number) => {
    setGenerationRequest(prev => ({
      ...prev,
      lyrics: prev.lyrics.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Lecteur audio principal */}
      <Card className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
        <CardContent className="p-6">
          {currentTrack ? (
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <Music className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">{currentTrack.title}</h3>
                <p className="text-muted-foreground">{currentTrack.artist} • {currentTrack.genre}</p>
                <div className="flex items-center gap-2 mt-2">
                  {currentTrack.itemCode && (
                    <Badge variant="outline">{currentTrack.itemCode}</Badge>
                  )}
                  {currentTrack.specialty && (
                    <Badge variant="secondary">{currentTrack.specialty}</Badge>
                  )}
                  {currentTrack.binaural && (
                    <Badge variant="default" className="bg-accent">
                      Binaural {currentTrack.frequency}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button onClick={togglePlay} size="lg" className="rounded-full">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <SkipForward className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleLike(currentTrack.id)}
                >
                  <Heart className={`w-5 h-5 ${currentTrack.isLiked ? 'fill-destructive text-destructive' : ''}`} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Sélectionnez une musique pour commencer</p>
            </div>
          )}

          {currentTrack && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1">
                  <Progress value={(currentTime / currentTrack.duration) * 100} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground w-12">
                  {formatTime(currentTrack.duration)}
                </span>
              </div>

              {currentTrack.waveform && (
                <div className="flex items-center gap-1 h-12 bg-muted/50 rounded p-2">
                  {currentTrack.waveform.map((height, index) => (
                    <div
                      key={index}
                      className="bg-primary/60 rounded-sm transition-all duration-200"
                      style={{
                        height: `${Math.max(2, height / 10)}px`,
                        width: '2px',
                        opacity: index < (currentTime / currentTrack.duration) * 100 ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Shuffle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Repeat className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  <div className="w-20">
                    <Progress value={volume} className="h-1" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Générateur IA</TabsTrigger>
          <TabsTrigger value="library">Bibliothèque</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Générateur Musical IA Avancé
              </CardTitle>
              <CardDescription>
                Créez des musiques personnalisées optimisées pour l'apprentissage médical
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Prompt créatif</label>
                    <Textarea
                      placeholder="Décrivez le type de musique que vous souhaitez... Ex: 'Musique relaxante pour étudier la cardiologie avec des battements de cœur subtils'"
                      value={generationRequest.prompt}
                      onChange={(e) => setGenerationRequest(prev => ({ ...prev, prompt: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Style musical</label>
                      <Select
                        value={generationRequest.style}
                        onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, style: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lofi">LoFi Hip-Hop</SelectItem>
                          <SelectItem value="ambient">Ambient</SelectItem>
                          <SelectItem value="classical">Classique</SelectItem>
                          <SelectItem value="electronic">Électronique</SelectItem>
                          <SelectItem value="nature">Sons de nature</SelectItem>
                          <SelectItem value="binaural">Battements binauraux</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Durée (secondes)</label>
                      <Input
                        type="number"
                        min={60}
                        max={600}
                        value={generationRequest.duration}
                        onChange={(e) => setGenerationRequest(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Item EDN (optionnel)</label>
                      <Input
                        placeholder="IC-042"
                        value={generationRequest.itemCode || ''}
                        onChange={(e) => setGenerationRequest(prev => ({ ...prev, itemCode: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Spécialité</label>
                      <Select
                        value={generationRequest.specialty || ''}
                        onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, specialty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardiologie">Cardiologie</SelectItem>
                          <SelectItem value="neurologie">Neurologie</SelectItem>
                          <SelectItem value="psychiatrie">Psychiatrie</SelectItem>
                          <SelectItem value="urgences">Urgences</SelectItem>
                          <SelectItem value="pediatrie">Pédiatrie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Battements binauraux</label>
                    <Button
                      variant={generationRequest.binaural ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGenerationRequest(prev => ({ ...prev, binaural: !prev.binaural }))}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {generationRequest.binaural ? 'Activé' : 'Désactivé'}
                    </Button>
                  </div>

                  {generationRequest.binaural && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Fréquence binaurale</label>
                      <Select
                        value={generationRequest.frequency || ''}
                        onValueChange={(value) => setGenerationRequest(prev => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8Hz">8Hz - Relaxation Alpha</SelectItem>
                          <SelectItem value="10Hz">10Hz - Concentration</SelectItem>
                          <SelectItem value="40Hz">40Hz - Focus Gamma</SelectItem>
                          <SelectItem value="6Hz">6Hz - Méditation Theta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Paroles personnalisées</label>
                      <Button variant="outline" size="sm" onClick={addLyricLine}>
                        <Mic className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {generationRequest.lyrics.map((line, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Ligne ${index + 1}...`}
                            value={line}
                            onChange={(e) => updateLyricLine(index, e.target.value)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLyricLine(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Génération estimée: 30-60 secondes
                </div>
                <Button 
                  onClick={generateMusic} 
                  disabled={isGenerating || !generationRequest.prompt}
                  className="min-w-[120px]"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Générer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bibliothèque musicale</CardTitle>
              <CardDescription>Toutes vos musiques générées par IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTracks.map((track) => (
                  <div 
                    key={track.id} 
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      currentTrack?.id === track.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setCurrentTrack(track)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{track.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {track.artist} • {formatTime(track.duration)}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {track.itemCode && (
                            <Badge variant="outline" className="text-xs">{track.itemCode}</Badge>
                          )}
                          {track.binaural && (
                            <Badge variant="secondary" className="text-xs">Binaural</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${track.isLiked ? 'fill-destructive text-destructive' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playlists" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="cursor-pointer hover:shadow-sm">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gradient-to-br from-primary/80 to-primary rounded-lg mb-4 flex items-center justify-center">
                    <Headphones className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{playlist.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{playlist.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{playlist.tracks.length} titres</span>
                    <Badge variant={playlist.isPublic ? 'default' : 'secondary'}>
                      {playlist.isPublic ? 'Public' : 'Privé'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Music className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{recentTracks.length}</p>
                <p className="text-sm text-muted-foreground">Musiques générées</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold">47h</p>
                <p className="text-sm text-muted-foreground">Temps d'écoute</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold">{recentTracks.filter(t => t.isLiked).length}</p>
                <p className="text-sm text-muted-foreground">Favoris</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};