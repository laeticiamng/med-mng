import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Save,
  Volume2,
  Settings,
  Sparkles,
  Headphones,
  Waves,
  Heart,
  Brain,
  Timer,
  RotateCcw,
  Copy,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent: string;
  description: string;
  category: 'meditation' | 'professional' | 'therapeutic' | 'nature';
  preview_url?: string;
  is_premium: boolean;
}

interface VoiceSettings {
  speed: number;
  pitch: number;
  volume: number;
  stability: number;
  similarity: number;
  clarity: number;
  breathingPauses: boolean;
  naturalVariation: boolean;
  emotionalTone: string;
}

interface GeneratedAudio {
  id: string;
  text: string;
  voice_id: string;
  voice_name: string;
  settings: VoiceSettings;
  audio_url: string;
  duration: number;
  created_at: string;
  waveform: number[];
}

export const AdvancedVoiceSynthesis: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudio | null>(null);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    speed: 100,
    pitch: 100,
    volume: 100,
    stability: 75,
    similarity: 75,
    clarity: 75,
    breathingPauses: true,
    naturalVariation: true,
    emotionalTone: 'calm'
  });

  const voices: Voice[] = [
    {
      id: 'aria-meditation',
      name: 'Aria - Méditation',
      gender: 'female',
      accent: 'Français neutre',
      description: 'Voix douce et apaisante, idéale pour la méditation guidée',
      category: 'meditation',
      is_premium: false
    },
    {
      id: 'claude-therapeutic',
      name: 'Claude - Thérapeutique',
      gender: 'male',
      accent: 'Français chaleureux',
      description: 'Voix masculine rassurante pour thérapies et relaxation',
      category: 'therapeutic',
      is_premium: false
    },
    {
      id: 'luna-nature',
      name: 'Luna - Nature',
      gender: 'female',
      accent: 'Français doux',
      description: 'Voix féminine harmonieuse qui évoque la nature',
      category: 'nature',
      is_premium: true
    },
    {
      id: 'sage-professional',
      name: 'Sage - Professionnel',
      gender: 'neutral',
      accent: 'Français standard',
      description: 'Voix neutre et claire pour formations et conférences',
      category: 'professional',
      is_premium: true
    }
  ];

  const emotionalTones = [
    { id: 'calm', name: 'Calme', description: 'Voix sereine et paisible' },
    { id: 'warm', name: 'Chaleureuse', description: 'Voix accueillante et bienveillante' },
    { id: 'confident', name: 'Confiante', description: 'Voix assurée et motivante' },
    { id: 'gentle', name: 'Douce', description: 'Voix tendre et délicate' },
    { id: 'energetic', name: 'Énergique', description: 'Voix dynamique et stimulante' }
  ];

  const meditationTemplates = [
    {
      id: 'breathing',
      title: 'Respiration Guidée',
      text: `Installez-vous confortablement et fermez les yeux. Prenez une profonde inspiration par le nez... et expirez lentement par la bouche. Laissez votre respiration retrouver son rythme naturel. À chaque inspiration, sentez votre corps se détendre davantage. À chaque expiration, relâchez toutes les tensions de la journée.`
    },
    {
      id: 'body_scan',
      title: 'Scan Corporel',
      text: `Commençons par porter notre attention sur le sommet de votre tête. Ressentez les sensations présentes... Maintenant, descendez vers votre front, détendez tous les muscles de votre visage. Relâchez vos épaules, laissez-les tomber naturellement. Votre poitrine se soulève et s'abaisse avec votre respiration...`
    },
    {
      id: 'mindfulness',
      title: 'Pleine Conscience',
      text: `Dans cet instant présent, observez simplement ce qui se passe en vous. Vos pensées vont et viennent comme des nuages dans le ciel. Vous n'avez pas besoin de les suivre ou de les juger. Revenez simplement à votre respiration, votre ancrage dans le moment présent.`
    }
  ];

  const generateVoice = useCallback(async () => {
    if (!inputText.trim()) {
      toast.error('Veuillez saisir du texte à synthétiser');
      return;
    }

    if (!selectedVoice) {
      toast.error('Veuillez sélectionner une voix');
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-voice', {
        body: {
          text: inputText,
          voice_id: selectedVoice,
          settings: voiceSettings
        }
      });

      if (error) throw error;

      const newAudio: GeneratedAudio = {
        id: Date.now().toString(),
        text: inputText,
        voice_id: selectedVoice,
        voice_name: voices.find(v => v.id === selectedVoice)?.name || '',
        settings: voiceSettings,
        audio_url: data.audio_url || URL.createObjectURL(new Blob([data.audioContent], { type: 'audio/mp3' })),
        duration: Math.ceil(inputText.length / 10), // Estimation
        created_at: new Date().toISOString(),
        waveform: Array.from({ length: 100 }, () => Math.random() * 100)
      };

      setGeneratedAudios(prev => [newAudio, ...prev]);
      setCurrentAudio(newAudio);
      
      toast.success('🎤 Voix générée avec succès !');
    } catch (error) {
      console.error('Erreur génération voix:', error);
      toast.error('Erreur lors de la génération de la voix');
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, selectedVoice, voiceSettings]);

  const playAudio = (audio: GeneratedAudio) => {
    if (audioRef.current) {
      audioRef.current.src = audio.audio_url;
      audioRef.current.play();
      setCurrentAudio(audio);
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetSettings = () => {
    setVoiceSettings({
      speed: 100,
      pitch: 100,
      volume: 100,
      stability: 75,
      similarity: 75,
      clarity: 75,
      breathingPauses: true,
      naturalVariation: true,
      emotionalTone: 'calm'
    });
    toast.success('Paramètres réinitialisés');
  };

  const selectedVoiceData = voices.find(v => v.id === selectedVoice);

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Interface Principale */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
              <Mic className="w-6 h-6 text-white" />
            </div>
            Synthèse Vocale Avancée
            <Badge className="bg-gradient-to-r from-success to-success-glow text-white">
              OpenAI TTS Pro
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Sélection de Voix */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sélection de la Voix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {voices.map((voice) => (
                <motion.div
                  key={voice.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedVoice === voice.id 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{voice.name}</h4>
                          {voice.is_premium && (
                            <Badge className="bg-gradient-to-r from-accent to-accent-glow text-white text-xs">
                              Pro
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">{voice.description}</p>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {voice.gender}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {voice.category}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">{voice.accent}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Zone de Texte */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Texte à Synthétiser</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {inputText.length} caractères
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText('')}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Saisissez votre texte de méditation guidée ici..."
              className="min-h-32 resize-none"
              maxLength={5000}
            />

            {/* Templates de Méditation */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Templates de Méditation</h4>
              <div className="flex flex-wrap gap-2">
                {meditationTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputText(template.text)}
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {template.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Paramètres Vocaux */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Paramètres Vocaux</h3>
              <Button variant="outline" size="sm" onClick={resetSettings}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Vitesse: {voiceSettings.speed}%
                </label>
                <Slider
                  value={[voiceSettings.speed]}
                  onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, speed: value[0] }))}
                  max={200}
                  min={50}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Hauteur: {voiceSettings.pitch}%
                </label>
                <Slider
                  value={[voiceSettings.pitch]}
                  onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, pitch: value[0] }))}
                  max={150}
                  min={50}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Volume: {voiceSettings.volume}%
                </label>
                <Slider
                  value={[voiceSettings.volume]}
                  onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, volume: value[0] }))}
                  max={100}
                  min={0}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Stabilité: {voiceSettings.stability}%
                </label>
                <Slider
                  value={[voiceSettings.stability]}
                  onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, stability: value[0] }))}
                  max={100}
                  min={0}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Similarité: {voiceSettings.similarity}%
                </label>
                <Slider
                  value={[voiceSettings.similarity]}
                  onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, similarity: value[0] }))}
                  max={100}
                  min={0}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Clarté: {voiceSettings.clarity}%
                </label>
                <Slider
                  value={[voiceSettings.clarity]}
                  onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, clarity: value[0] }))}
                  max={100}
                  min={0}
                  className="w-full"
                />
              </div>
            </div>

            {/* Options Avancées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-3">
                <label className="text-sm font-medium">Ton Émotionnel</label>
                <Select
                  value={voiceSettings.emotionalTone}
                  onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, emotionalTone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {emotionalTones.map((tone) => (
                      <SelectItem key={tone.id} value={tone.id}>
                        <div>
                          <div className="font-medium">{tone.name}</div>
                          <div className="text-xs text-muted-foreground">{tone.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Pauses Respiratoires</label>
                  <Switch
                    checked={voiceSettings.breathingPauses}
                    onCheckedChange={(checked) => setVoiceSettings(prev => ({ ...prev, breathingPauses: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Variation Naturelle</label>
                  <Switch
                    checked={voiceSettings.naturalVariation}
                    onCheckedChange={(checked) => setVoiceSettings(prev => ({ ...prev, naturalVariation: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Génération */}
          <div className="flex items-center justify-center pt-4">
            <Button
              onClick={generateVoice}
              disabled={isGenerating || !inputText.trim() || !selectedVoice}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Générer la Voix
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audios Générés */}
      {generatedAudios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="w-5 h-5" />
              Audios Générés ({generatedAudios.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {generatedAudios.map((audio, index) => (
                  <motion.div
                    key={audio.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors ${
                      currentAudio?.id === audio.id ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => isPlaying && currentAudio?.id === audio.id ? pauseAudio() : playAudio(audio)}
                        >
                          {isPlaying && currentAudio?.id === audio.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <div>
                          <h4 className="font-medium">{audio.voice_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {audio.duration}s • {new Date(audio.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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

                    <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {audio.text}
                    </div>

                    {/* Forme d'onde */}
                    <div className="h-12 flex items-end gap-1">
                      {audio.waveform.slice(0, 80).map((height, i) => (
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