import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  Waves,
  BarChart3,
  Filter,
  Zap,
  Music,
  Headphones,
  RadioIcon,
  Mic,
  Speaker,
  Play,
  Pause,
  RotateCcw,
  Save,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface AudioTrack {
  id: string;
  name: string;
  type: 'ambient' | 'binaural' | 'music' | 'voice' | 'sfx';
  url: string;
  volume: number;
  muted: boolean;
  pan: number;
  lowpass: number;
  highpass: number;
  reverb: number;
  delay: number;
  solo: boolean;
  color: string;
  icon: React.ComponentType<any>;
}

interface EffectPreset {
  id: string;
  name: string;
  description: string;
  effects: {
    reverb: number;
    delay: number;
    lowpass: number;
    highpass: number;
    stereoWidth: number;
  };
}

export const UltimateAudioMixer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState([75]);
  const [crossfade, setCrossfade] = useState([50]);
  const [stereoWidth, setStereoWidth] = useState([100]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [analysisData, setAnalysisData] = useState<number[]>([]);

  const [tracks, setTracks] = useState<AudioTrack[]>([
    {
      id: '1',
      name: 'Ambiance Forêt',
      type: 'ambient',
      url: '/audio/forest-ambient.mp3',
      volume: 70,
      muted: false,
      pan: 0,
      lowpass: 100,
      highpass: 0,
      reverb: 20,
      delay: 0,
      solo: false,
      color: 'from-green-500 to-emerald-600',
      icon: Waves
    },
    {
      id: '2',
      name: 'Battements Binauraux',
      type: 'binaural',
      url: '/audio/binaural-40hz.mp3',
      volume: 45,
      muted: false,
      pan: 0,
      lowpass: 80,
      highpass: 10,
      reverb: 0,
      delay: 0,
      solo: false,
      color: 'from-purple-500 to-indigo-600',
      icon: RadioIcon
    },
    {
      id: '3',
      name: 'Musique Douce',
      type: 'music',
      url: '/audio/soft-music.mp3',
      volume: 60,
      muted: false,
      pan: -20,
      lowpass: 90,
      highpass: 5,
      reverb: 30,
      delay: 15,
      solo: false,
      color: 'from-blue-500 to-cyan-600',
      icon: Music
    },
    {
      id: '4',
      name: 'Voix Guidée',
      type: 'voice',
      url: '/audio/guided-voice.mp3',
      volume: 80,
      muted: false,
      pan: 0,
      lowpass: 85,
      highpass: 15,
      reverb: 10,
      delay: 0,
      solo: false,
      color: 'from-orange-500 to-red-600',
      icon: Mic
    }
  ]);

  const effectPresets: EffectPreset[] = [
    {
      id: 'meditation_deep',
      name: 'Méditation Profonde',
      description: 'Réverbération espacée, filtre passe-bas doux',
      effects: { reverb: 40, delay: 20, lowpass: 80, highpass: 5, stereoWidth: 120 }
    },
    {
      id: 'focus_sharp',
      name: 'Focus Intense',
      description: 'Clarté maximale, stéréo large',
      effects: { reverb: 10, delay: 0, lowpass: 100, highpass: 10, stereoWidth: 150 }
    },
    {
      id: 'ambient_space',
      name: 'Espace Ambiant',
      description: 'Réverbération large, délai spatial',
      effects: { reverb: 60, delay: 35, lowpass: 85, highpass: 0, stereoWidth: 200 }
    },
    {
      id: 'binaural_enhance',
      name: 'Amélioration Binaurale',
      description: 'Optimisé pour les battements binauraux',
      effects: { reverb: 0, delay: 0, lowpass: 75, highpass: 20, stereoWidth: 100 }
    }
  ];

  // Simulation de l'analyse audio en temps réel
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setAnalysisData(Array.from({ length: 32 }, () => Math.random() * 100));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const updateTrack = (id: string, updates: Partial<AudioTrack>) => {
    setTracks(prev => prev.map(track => 
      track.id === id ? { ...track, ...updates } : track
    ));
  };

  const toggleMute = (id: string) => {
    updateTrack(id, { muted: !tracks.find(t => t.id === id)?.muted });
  };

  const toggleSolo = (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (track) {
      setTracks(prev => prev.map(t => ({
        ...t,
        solo: t.id === id ? !t.solo : false
      })));
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = effectPresets.find(p => p.id === presetId);
    if (preset) {
      setTracks(prev => prev.map(track => ({
        ...track,
        reverb: preset.effects.reverb,
        delay: preset.effects.delay,
        lowpass: preset.effects.lowpass,
        highpass: preset.effects.highpass
      })));
      setStereoWidth([preset.effects.stereoWidth]);
      setSelectedPreset(presetId);
      toast.success(`Preset "${preset.name}" appliqué`);
    }
  };

  const resetMixer = () => {
    setTracks(prev => prev.map(track => ({
      ...track,
      volume: 70,
      muted: false,
      pan: 0,
      lowpass: 100,
      highpass: 0,
      reverb: 0,
      delay: 0,
      solo: false
    })));
    setMasterVolume([75]);
    setCrossfade([50]);
    setStereoWidth([100]);
    setSelectedPreset('');
    toast.success('Mixeur réinitialisé');
  };

  const exportMix = () => {
    const mixData = {
      tracks: tracks.map(({ url, ...track }) => track),
      masterVolume: masterVolume[0],
      crossfade: crossfade[0],
      stereoWidth: stereoWidth[0],
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(mixData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meditation-mix-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Mix exporté avec succès');
  };

  return (
    <div className="space-y-6">
      {/* Console Principale */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              Mixeur Audio Ultimate
              <Badge className="bg-gradient-to-r from-success to-success-glow text-white">
                100% Pro
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-gradient-to-r from-primary to-accent text-white"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="outline" onClick={resetMixer}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={exportMix}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Contrôles Master */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Volume Master: {masterVolume[0]}%
              </label>
              <Slider
                value={masterVolume}
                onValueChange={setMasterVolume}
                max={100}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Crossfade: {crossfade[0]}%
              </label>
              <Slider
                value={crossfade}
                onValueChange={setCrossfade}
                max={100}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                Largeur Stéréo: {stereoWidth[0]}%
              </label>
              <Slider
                value={stereoWidth}
                onValueChange={setStereoWidth}
                max={200}
                min={0}
                className="w-full"
              />
            </div>
          </div>

          {/* Analyseur Spectral */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-black/10 rounded-lg"
            >
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Analyseur Spectral Temps Réel
              </h3>
              <div className="h-24 flex items-end gap-1">
                {analysisData.map((height, index) => (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-t from-primary to-accent rounded-sm flex-1"
                    style={{ height: `${Math.max(2, height)}%` }}
                    animate={{ height: `${Math.max(2, height)}%` }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Pistes Audio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pistes Audio ({tracks.length})</h3>
            <AnimatePresence>
              {tracks.map((track, index) => {
                const IconComponent = track.icon;
                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      track.solo ? 'border-warning bg-warning/10' :
                      track.muted ? 'border-muted bg-muted/20 opacity-50' :
                      'border-border bg-card'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* En-tête de piste */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${track.color}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">{track.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {track.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={track.solo ? "default" : "outline"}
                            onClick={() => toggleSolo(track.id)}
                            className="h-8 px-3 text-xs"
                          >
                            S
                          </Button>
                          <Button
                            size="sm"
                            variant={track.muted ? "destructive" : "outline"}
                            onClick={() => toggleMute(track.id)}
                            className="h-8 px-3"
                          >
                            {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>

                      {/* Contrôles de piste */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Volume</label>
                          <Slider
                            value={[track.volume]}
                            onValueChange={(value) => updateTrack(track.id, { volume: value[0] })}
                            max={100}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{track.volume}%</span>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium">Pan</label>
                          <Slider
                            value={[track.pan]}
                            onValueChange={(value) => updateTrack(track.id, { pan: value[0] })}
                            max={100}
                            min={-100}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'C'}</span>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium">Low Pass</label>
                          <Slider
                            value={[track.lowpass]}
                            onValueChange={(value) => updateTrack(track.id, { lowpass: value[0] })}
                            max={100}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{track.lowpass}%</span>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium">High Pass</label>
                          <Slider
                            value={[track.highpass]}
                            onValueChange={(value) => updateTrack(track.id, { highpass: value[0] })}
                            max={100}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{track.highpass}%</span>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium">Reverb</label>
                          <Slider
                            value={[track.reverb]}
                            onValueChange={(value) => updateTrack(track.id, { reverb: value[0] })}
                            max={100}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{track.reverb}%</span>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium">Delay</label>
                          <Slider
                            value={[track.delay]}
                            onValueChange={(value) => updateTrack(track.id, { delay: value[0] })}
                            max={100}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{track.delay}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Presets d'Effets */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Presets d'Effets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {effectPresets.map((preset) => (
                <motion.div
                  key={preset.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedPreset === preset.id 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => applyPreset(preset.id)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {preset.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Rev {preset.effects.reverb}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Del {preset.effects.delay}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Options Avancées */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={recordingEnabled}
                  onCheckedChange={setRecordingEnabled}
                />
                <label className="text-sm font-medium">Enregistrement</label>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};