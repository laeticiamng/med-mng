import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import {
    AudioWaveform,
    Download,
    Image as ImageIcon,
    Layers,
    Mic,
    Music,
    Pause,
    Play,
    Plus,
    Settings,
    Square,
    Trash2,
    Volume2,
    VolumeX
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AudioTrack {
  id: string;
  name: string;
  type: 'music' | 'voice' | 'ambient';
  url?: string;
  base64?: string;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  audio?: HTMLAudioElement;
}

interface VisualLayer {
  id: string;
  name: string;
  imageBase64: string;
  opacity: number;
  isVisible: boolean;
}

export const AdvancedMixer = () => {
  const { toast } = useToast();
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [visualLayers, setVisualLayers] = useState<VisualLayer[]>([]);
  const [masterVolume, setMasterVolume] = useState(80);
  const [_isRecording, _setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'music_generation', metadata: { action: 'view_mixer' } });
  }, []);

  const addTrack = (type: 'music' | 'voice' | 'ambient') => {
    logActivity({ activity_type: 'music_generation', metadata: { action: 'add_track', trackType: type } });
    const newTrack: AudioTrack = {
      id: crypto.randomUUID(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Track ${tracks.length + 1}`,
      type,
      volume: 70,
      isMuted: false,
      isPlaying: false
    };
    setTracks(prev => [...prev, newTrack]);
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        if (track.audio) {
          track.audio.volume = volume / 100;
        }
        return { ...track, volume };
      }
      return track;
    }));
  };

  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        const isMuted = !track.isMuted;
        if (track.audio) {
          track.audio.muted = isMuted;
        }
        return { ...track, isMuted };
      }
      return track;
    }));
  };

  const playTrack = async (trackId: string) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        if (track.audio && !track.isPlaying) {
          track.audio.play().catch(console.error);
          return { ...track, isPlaying: true };
        } else if (track.audio && track.isPlaying) {
          track.audio.pause();
          return { ...track, isPlaying: false };
        }
      }
      return track;
    }));
  };

  const removeTrack = (trackId: string) => {
    setTracks(prev => {
      const track = prev.find(t => t.id === trackId);
      if (track?.audio) {
        track.audio.pause();
        track.audio.src = '';
      }
      return prev.filter(t => t.id !== trackId);
    });
  };

  const addVisualLayer = () => {
    const newLayer: VisualLayer = {
      id: crypto.randomUUID(),
      name: `Layer ${visualLayers.length + 1}`,
      imageBase64: '', // Sera rempli par l'utilisateur
      opacity: 100,
      isVisible: true
    };
    setVisualLayers(prev => [...prev, newLayer]);
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setVisualLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  };

  const toggleLayerVisibility = (layerId: string) => {
    setVisualLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, isVisible: !layer.isVisible } : layer
    ));
  };

  const removeVisualLayer = (layerId: string) => {
    setVisualLayers(prev => prev.filter(layer => layer.id !== layerId));
  };

  const playAllTracks = () => {
    setIsPlaying(!isPlaying);
    tracks.forEach(track => {
      if (track.audio) {
        if (!isPlaying) {
          track.audio.play().catch(console.error);
        } else {
          track.audio.pause();
        }
      }
    });
    setTracks(prev => prev.map(track => ({ ...track, isPlaying: !isPlaying })));
  };

  const stopAllTracks = () => {
    setIsPlaying(false);
    tracks.forEach(track => {
      if (track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
      }
    });
    setTracks(prev => prev.map(track => ({ ...track, isPlaying: false })));
  };

  const exportMix = () => {
    toast({
      title: "Export en cours",
      description: "Votre composition sera bientôt prête au téléchargement."
    });
    // Ici vous pourriez implémenter la logique d'export réel
  };

  const getTrackIcon = (type: string) => {
    switch (type) {
      case 'music': return <Music className="h-4 w-4" />;
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'ambient': return <AudioWaveform className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Mixeur Avancé</h1>
        <p className="text-muted-foreground">
          Mixez vos créations IA pour des sessions immersives personnalisées
        </p>
      </div>

      {/* Contrôles principaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Contrôles principaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={playAllTracks} size="lg">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isPlaying ? 'Pause' : 'Lecture'}
            </Button>
            
            <Button onClick={stopAllTracks} variant="outline" size="lg">
              <Square className="h-5 w-5" />
              Stop
            </Button>

            <div className="flex-1 flex items-center gap-2">
              <Label>Volume Master</Label>
              <Slider
                value={[masterVolume]}
                onValueChange={([value]) => setMasterVolume(value)}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12">{masterVolume}%</span>
            </div>

            <Button onClick={exportMix} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pistes Audio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Pistes Audio ({tracks.length})
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addTrack('music')}>
                  <Music className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => addTrack('voice')}>
                  <Mic className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => addTrack('ambient')}>
                  <AudioWaveform className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Gérez vos pistes audio et leurs niveaux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tracks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune piste ajoutée</p>
                <p className="text-sm">Cliquez sur les boutons ci-dessus pour ajouter des pistes</p>
              </div>
            ) : (
              tracks.map((track) => (
                <div key={track.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getTrackIcon(track.type)}
                        {track.type}
                      </Badge>
                      <span className="font-medium">{track.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playTrack(track.id)}
                      >
                        {track.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTrackMute(track.id)}
                      >
                        {track.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeTrack(track.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Volume</Label>
                    <Slider
                      value={[track.volume]}
                      onValueChange={([value]) => updateTrackVolume(track.id, value)}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs font-medium w-10">{track.volume}%</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Couches Visuelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Couches Visuelles ({visualLayers.length})
              </div>
              <Button size="sm" variant="outline" onClick={addVisualLayer}>
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </CardTitle>
            <CardDescription>
              Superposez des images pour créer des ambiances visuelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {visualLayers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune couche visuelle</p>
                <p className="text-sm">Ajoutez des images d'ambiance à superposer</p>
              </div>
            ) : (
              visualLayers.map((layer) => (
                <div key={layer.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        Visuel
                      </Badge>
                      <span className="font-medium">{layer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleLayerVisibility(layer.id)}
                      >
                        {layer.isVisible ? '👁️' : '👁️‍🗨️'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeVisualLayer(layer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Opacité</Label>
                    <Slider
                      value={[layer.opacity]}
                      onValueChange={([value]) => updateLayerOpacity(layer.id, value)}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs font-medium w-10">{layer.opacity}%</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prévisualisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Prévisualisation
          </CardTitle>
          <CardDescription>
            Aperçu de votre composition audio-visuelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
            {visualLayers.filter(layer => layer.isVisible).length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>Prévisualisation de votre composition</p>
                <p className="text-sm">Ajoutez des couches visuelles pour voir le résultat</p>
              </div>
            ) : (
              <div className="text-center text-primary-foreground">
                <p className="font-medium">Composition active</p>
                <p className="text-sm opacity-80">
                  {tracks.filter(t => !t.isMuted).length} pistes audio • 
                  {visualLayers.filter(l => l.isVisible).length} couches visuelles
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};