import logger from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  Share2, 
  Plus, 
  Shuffle,
  Repeat,
  SkipForward,
  SkipBack,
  Headphones,
  Mic,
  Save,
  List,
  Filter
} from 'lucide-react';

interface MusicTrack {
  id: string;
  title: string;
  url: string;
  duration: number;
  genre: string;
  rang: 'A' | 'B' | 'AB';
  item_code: string;
  created_at: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: MusicTrack[];
  is_public: boolean;
  tags: string[];
  created_at: string;
}

export const AdvancedMusicPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentTracks, setRecentTracks] = useState<MusicTrack[]>([]);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [audioSettings, setAudioSettings] = useState({
    binauralBeats: false,
    ambient: true,
    focusMode: false,
    autoPlay: true
  });
  
  const { toast } = useToast();

  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    is_public: false,
    tags: [] as string[]
  });

  useEffect(() => {
    loadUserPlaylists();
    loadRecentTracks();
    loadUserPreferences();
  }, []);

  const loadUserPlaylists = async () => {
    try {
      // Simuler des playlists pour éviter les erreurs de type
      const mockPlaylists: Playlist[] = [
        {
          id: '1',
          name: 'Cardiologie Focus',
          description: 'Musiques pour étudier la cardiologie',
          tracks: [],
          is_public: false,
          tags: ['cardiologie', 'focus'],
          created_at: new Date().toISOString()
        }
      ];
      setPlaylists(mockPlaylists);
    } catch (error) {
      logger.error('Erreur chargement playlists:', error);
    }
  };

  const loadRecentTracks = async () => {
    try {
      // Simuler des tracks récentes depuis les générations
      const mockTracks: MusicTrack[] = [
        {
          id: '1',
          title: 'IC-156 - Cardiologie Focus',
          url: 'https://example.com/track1.mp3',
          duration: 240,
          genre: 'Educational',
          rang: 'A',
          item_code: 'IC-156',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'IC-289 - Neurologie Deep Study',
          url: 'https://example.com/track2.mp3',
          duration: 300,
          genre: 'Ambient',
          rang: 'B',
          item_code: 'IC-289',
          created_at: new Date().toISOString()
        }
      ];
      setRecentTracks(mockTracks);
    } catch (error) {
      logger.error('Erreur chargement tracks récentes:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('user_preferences_extended')
        .select('music_volume, auto_play, binaural_enabled')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (data) {
        setVolume(data.music_volume || 75);
        setAudioSettings(prev => ({
          ...prev,
          autoPlay: data.auto_play,
          binauralBeats: data.binaural_enabled
        }));
      }
    } catch (error) {
      logger.error('Erreur chargement préférences:', error);
    }
  };

  const createPlaylist = async () => {
    try {
      // Simulation de création de playlist
      const newPlaylistData: Playlist = {
        id: Date.now().toString(),
        name: newPlaylist.name,
        description: newPlaylist.description,
        tracks: [],
        is_public: newPlaylist.is_public,
        tags: newPlaylist.tags,
        created_at: new Date().toISOString()
      };

      setPlaylists(prev => [newPlaylistData, ...prev]);
      setNewPlaylist({ name: '', description: '', is_public: false, tags: [] });
      setShowCreatePlaylist(false);

      toast({
        title: "Playlist créée (simulation)",
        description: "Votre nouvelle playlist a été créée avec succès",
      });
    } catch (error) {
      logger.error('Erreur création playlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la playlist",
        variant: "destructive"
      });
    }
  };

  const saveSettings = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('user_preferences_extended')
        .upsert({
          user_id: user.user.id,
          music_volume: volume,
          auto_play: audioSettings.autoPlay,
          binaural_enabled: audioSettings.binauralBeats
        });

      if (error) throw error;

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences audio ont été mises à jour",
      });
    } catch (error) {
      logger.error('Erreur sauvegarde paramètres:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Ici vous intégreriez votre logique audio réelle
  };

  return (
    <div className="space-y-6">
      {/* Lecteur principal */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          {currentTrack ? (
            <div className="space-y-6">
              {/* Informations de la piste */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">{currentTrack.title}</h3>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline">{currentTrack.genre}</Badge>
                  <Badge variant="secondary">Rang {currentTrack.rang}</Badge>
                  <Badge variant="outline">{currentTrack.item_code}</Badge>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Contrôles */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="sm">
                  <SkipBack className="w-5 h-5" />
                </Button>
                
                <Button size="lg" onClick={togglePlay} className="rounded-full w-16 h-16">
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>
                
                <Button variant="ghost" size="sm">
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              {/* Volume et options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <div className="w-24">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{volume}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Shuffle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Repeat className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Aucune piste sélectionnée</h3>
              <p className="text-muted-foreground">
                Choisissez une musique dans votre bibliothèque ou créez-en une nouvelle
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paramètres audio avancés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5" />
            Paramètres Audio Avancés
          </CardTitle>
          <CardDescription>
            Personnalisez votre expérience d'écoute pour l'étude
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sons binauraux</Label>
                <p className="text-sm text-muted-foreground">Améliore la concentration</p>
              </div>
              <Switch
                checked={audioSettings.binauralBeats}
                onCheckedChange={(checked) => 
                  setAudioSettings(prev => ({ ...prev, binauralBeats: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Ambiance naturelle</Label>
                <p className="text-sm text-muted-foreground">Sons d'environnement</p>
              </div>
              <Switch
                checked={audioSettings.ambient}
                onCheckedChange={(checked) => 
                  setAudioSettings(prev => ({ ...prev, ambient: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mode Focus</Label>
                <p className="text-sm text-muted-foreground">Réduit les distractions</p>
              </div>
              <Switch
                checked={audioSettings.focusMode}
                onCheckedChange={(checked) => 
                  setAudioSettings(prev => ({ ...prev, focusMode: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Lecture automatique</Label>
                <p className="text-sm text-muted-foreground">Démarre automatiquement</p>
              </div>
              <Switch
                checked={audioSettings.autoPlay}
                onCheckedChange={(checked) => 
                  setAudioSettings(prev => ({ ...prev, autoPlay: checked }))
                }
              />
            </div>
          </div>

          <Button onClick={saveSettings} className="gap-2">
            <Save className="w-4 h-4" />
            Sauvegarder les paramètres
          </Button>
        </CardContent>
      </Card>

      {/* Bibliothèque musicale */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tracks récentes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Récemment Générées
              </CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filtrer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTracks.map((track) => (
                <div 
                  key={track.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => setCurrentTrack(track)}
                >
                  <Button variant="ghost" size="sm" className="p-0 w-8 h-8">
                    <Play className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {track.genre} • {formatTime(track.duration)}
                    </p>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    Rang {track.rang}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Playlists */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Mes Playlists
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreatePlaylist(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <List className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-medium mb-2">Aucune playlist</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Créez votre première playlist personnalisée
                </p>
                <Button onClick={() => setShowCreatePlaylist(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Créer une playlist
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {playlists.map((playlist) => (
                  <div key={playlist.id} className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{playlist.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {playlist.tracks.length} pistes
                        </p>
                      </div>
                      {playlist.is_public && (
                        <Badge variant="secondary" className="text-xs">Public</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {playlist.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formulaire création playlist */}
      {showCreatePlaylist && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une nouvelle playlist</CardTitle>
            <CardDescription>
              Organisez vos musiques d'étude par thème ou matière
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="playlist_name">Nom de la playlist</Label>
                <Input
                  id="playlist_name"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                  placeholder="Ex: Cardiologie Focus"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={newPlaylist.is_public}
                  onCheckedChange={(checked) => setNewPlaylist({...newPlaylist, is_public: checked})}
                />
                <Label htmlFor="is_public">Playlist publique</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                placeholder="Décrivez le contenu de cette playlist..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreatePlaylist(false)}>
                Annuler
              </Button>
              <Button onClick={createPlaylist} disabled={!newPlaylist.name}>
                Créer la playlist
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};