import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Wand2, 
  Download, 
  Share2, 
  Play, 
  Pause,
  Volume2,
  Settings,
  Sparkles,
  Heart,
  Brain,
  Waves,
  Zap,
  Timer,
  Shuffle,
  RotateCcw,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface MusicStyle {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ComponentType<any>;
  binaural?: boolean;
  frequency?: string;
}

interface GeneratedTrack {
  id: string;
  title: string;
  style: string;
  duration: number;
  url: string;
  waveform: number[];
  tags: string[];
  generated_at: string;
}

export const PremiumMusicGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [duration, setDuration] = useState([300]); // 5 minutes par défaut
  const [intensity, setIntensity] = useState([7]);
  const [binauralFreq, setBinauralFreq] = useState([40]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<GeneratedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const musicStyles: MusicStyle[] = [
    {
      id: 'deep_meditation',
      name: 'Méditation Profonde',
      description: 'Sons apaisants avec battement binaural pour méditation',
      color: 'from-purple-500 to-indigo-600',
      icon: Brain,
      binaural: true,
      frequency: '6-8 Hz (Theta)'
    },
    {
      id: 'nature_ambient',
      name: 'Ambiance Nature',
      description: 'Sons de la nature avec musique douce',
      color: 'from-green-500 to-emerald-600',
      icon: Waves,
      binaural: false
    },
    {
      id: 'healing_frequencies',
      name: 'Fréquences Curatives',
      description: 'Musique basée sur les fréquences Solfeggio',
      color: 'from-blue-500 to-cyan-600',
      icon: Zap,
      binaural: true,
      frequency: '528 Hz (Amour)'
    },
    {
      id: 'chakra_balancing',
      name: 'Équilibrage Chakras',
      description: 'Musique alignée sur les 7 chakras principaux',
      color: 'from-pink-500 to-rose-600',
      icon: Heart,
      binaural: true,
      frequency: '256-963 Hz'
    },
    {
      id: 'focus_concentration',
      name: 'Focus & Concentration',
      description: 'Rythmes binauraux pour améliorer la concentration',
      color: 'from-orange-500 to-red-600',
      icon: Sparkles,
      binaural: true,
      frequency: '12-15 Hz (Beta)'
    },
    {
      id: 'sleep_induction',
      name: 'Induction du Sommeil',
      description: 'Musique progressive pour favoriser l\'endormissement',
      color: 'from-indigo-600 to-purple-700',
      icon: Timer,
      binaural: true,
      frequency: '1-4 Hz (Delta)'
    }
  ];

  const handleGenerate = async () => {
    if (!selectedStyle) {
      toast.error('Veuillez sélectionner un style musical');
      return;
    }

    setIsGenerating(true);
    
    try {
      const style = musicStyles.find(s => s.id === selectedStyle);
      const prompt = customPrompt || `Créer une musique de ${style?.name} d'une durée de ${Math.floor(duration[0] / 60)} minutes, avec une intensité de ${intensity[0]}/10${style?.binaural ? `, incluant des battements binauraux à ${style.frequency}` : ''}`;

      // Simulation d'appel API Suno (remplacer par vraie API)
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          duration: duration[0],
          intensity: intensity[0],
          binaural_frequency: style?.binaural ? binauralFreq[0] : null
        })
      });

      if (!response.ok) throw new Error('Erreur génération');

      const data = await response.json();
      
      const newTrack: GeneratedTrack = {
        id: Date.now().toString(),
        title: `${style?.name} - ${new Date().toLocaleTimeString()}`,
        style: style?.name || '',
        duration: duration[0],
        url: data.audio_url || '/demo-meditation-track.mp3',
        waveform: Array.from({ length: 100 }, () => Math.random() * 100),
        tags: [style?.name || '', `${Math.floor(duration[0] / 60)}min`, `Intensité ${intensity[0]}`],
        generated_at: new Date().toISOString()
      };

      setGeneratedTracks(prev => [newTrack, ...prev]);
      setCurrentTrack(newTrack);
      
      toast.success('🎵 Piste générée avec succès !');
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedStyleData = musicStyles.find(s => s.id === selectedStyle);

  return (
    <div className="space-y-6">
      {/* Générateur Principal */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
              <Music className="w-6 h-6 text-white" />
            </div>
            Générateur Musical IA Premium
            <Badge className="bg-gradient-to-r from-success to-success-glow text-white">
              100% IA
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Sélection du Style */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Style Musical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {musicStyles.map((style) => {
                const IconComponent = style.icon;
                return (
                  <motion.div
                    key={style.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        selectedStyle === style.id 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedStyle(style.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${style.color}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{style.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {style.description}
                            </p>
                            {style.binaural && (
                              <Badge className="bg-info/10 text-info text-xs mt-2">
                                🎧 {style.frequency}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Paramètres Avancés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Durée: {Math.floor(duration[0] / 60)}:{(duration[0] % 60).toString().padStart(2, '0')}
              </label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                max={1800} // 30 minutes max
                min={60}   // 1 minute min
                step={30}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 min</span>
                <span>30 min</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">
                Intensité: {intensity[0]}/10
              </label>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Douce</span>
                <span>Intense</span>
              </div>
            </div>

            {selectedStyleData?.binaural && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Fréquence Binaurale: {binauralFreq[0]} Hz
                </label>
                <Slider
                  value={binauralFreq}
                  onValueChange={setBinauralFreq}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 Hz</span>
                  <span>100 Hz</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Personnalisé */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Instructions Personnalisées (optionnel)</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Décrivez le type de musique que vous souhaitez..."
              className="w-full h-20 px-3 py-2 border border-border rounded-lg bg-background resize-none text-sm"
            />
          </div>

          {/* Bouton de Génération */}
          <div className="flex items-center justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedStyle}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-3"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Générer la Musique IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pistes Générées */}
      {generatedTracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Pistes Générées ({generatedTracks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {generatedTracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors ${
                      currentTrack?.id === track.id ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentTrack(track);
                            setIsPlaying(!isPlaying);
                          }}
                        >
                          {isPlaying && currentTrack?.id === track.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <div>
                          <h4 className="font-medium">{track.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {track.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(track.duration)}
                        </span>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Forme d'onde */}
                    <div className="mt-3 h-12 flex items-end gap-1">
                      {track.waveform.slice(0, 60).map((height, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-t from-primary to-accent rounded-sm flex-1 transition-all"
                          style={{ height: `${Math.max(2, height / 3)}%` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};