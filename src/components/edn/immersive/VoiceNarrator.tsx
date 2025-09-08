import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Mic,
  Languages,
  Radio,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceSettings {
  voice: string;
  speed: number;
  volume: number;
  language: 'fr' | 'en';
  model: string;
}

interface VoiceNarratorProps {
  text: string;
  sectionType: string;
  autoplay?: boolean;
  highlight?: boolean;
}

export const VoiceNarrator: React.FC<VoiceNarratorProps> = ({
  text,
  sectionType,
  autoplay = false,
  highlight = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [hasOpenAI, setHasOpenAI] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [settings, setSettings] = useState<VoiceSettings>({
    voice: '9BWtsMINqrJLrRacOk9x', // Aria - voix féminine claire
    speed: 1.0,
    volume: 0.8,
    language: 'fr',
    model: 'eleven_turbo_v2_5'
  });

  // Voix disponibles avec personnalités
  const availableVoices = [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', personality: 'Claire et pédagogique', gender: 'F' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', personality: 'Douce et rassurante', gender: 'F' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', personality: 'Professionnelle', gender: 'F' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', personality: 'Autoritaire et expert', gender: 'M' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', personality: 'Sage et expérimenté', gender: 'M' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', personality: 'Jeune et dynamique', gender: 'M' }
  ];

  // Modèles ElevenLabs disponibles
  const availableModels = [
    { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5', description: 'Rapide, multilingue' },
    { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Haute qualité émotionnelle' },
    { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'Anglais seulement, très rapide' }
  ];

  // Vérifier si OpenAI est disponible
  useEffect(() => {
    setHasOpenAI(true);
  }, []);

  // Générer l'audio avec ElevenLabs
  const generateAudio = async (textToSpeak: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Simulation d'appel à ElevenLabs - remplacer par vrai appel API
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          voice_id: settings.voice,
          model_id: settings.model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erreur de génération audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return audioUrl;
    } catch (error) {
      console.error('Erreur ElevenLabs:', error);
      
      // Fallback vers Web Speech API
      return generateWithWebSpeech(textToSpeak);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback avec Web Speech API
  const generateWithWebSpeech = (textToSpeak: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject('Web Speech API non supportée');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = settings.language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = settings.speed;
      utterance.volume = settings.volume;

      // Trouver une voix française si possible
      const voices = speechSynthesis.getVoices();
      const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
      };

      speechSynthesis.speak(utterance);
      resolve('web-speech'); // Indicateur que c'est Web Speech
    });
  };

  // Jouer/Pause
  const togglePlayback = async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  };

  const play = async () => {
    if (!text.trim()) return;

    try {
      setIsLoading(true);
      
      if (hasOpenAI) {
        const audioUrl = await generateAudio(text);
        
        if (audioUrl === 'web-speech') {
          // Web Speech API gère la lecture directement
          return;
        }

        // OpenAI TTS audio
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          await audioRef.current.play();
          setIsPlaying(true);
          startProgressTracking();
        }
      } else {
        // Fallback direct vers Web Speech
        await generateWithWebSpeech(text);
      }
    } catch (error) {
      console.error('Erreur de lecture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    stopProgressTracking();
  };

  const restart = () => {
    pause();
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Suivi du progrès
  const startProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (audioRef.current) {
        const current = audioRef.current.currentTime;
        const total = audioRef.current.duration;
        
        setCurrentTime(current);
        setDuration(total);
        setProgress((current / total) * 100);

        if (current >= total) {
          setIsPlaying(false);
          stopProgressTracking();
        }
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Formatage du temps
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-play si demandé
  useEffect(() => {
    if (autoplay && text.trim()) {
      const timer = setTimeout(() => play(), 1000);
      return () => clearTimeout(timer);
    }
  }, [text, autoplay]);

  // Nettoyage
  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      speechSynthesis.cancel();
    };
  }, []);

  const currentVoice = availableVoices.find(v => v.id === settings.voice);
  const currentModel = availableModels.find(m => m.id === settings.model);

  return (
    <div className="space-y-4">
      {/* Lecteur principal */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Contrôles de lecture */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={togglePlayback}
                disabled={isLoading || !text.trim()}
                className="relative"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={restart}
                disabled={!duration}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Informations et progrès */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">
                    {currentVoice?.name} - {sectionType}
                  </span>
                  {hasOpenAI && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      OpenAI TTS
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Progress value={progress} className="flex-1 h-2" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1"
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Aperçu du texte */}
          {text && (
            <div className="mt-3 p-2 bg-white/60 rounded text-sm max-h-20 overflow-y-auto">
              {highlight ? (
                <span className="bg-yellow-200/50 px-1 rounded">
                  {text.substring(0, 150)}
                  {text.length > 150 && '...'}
                </span>
              ) : (
                text.substring(0, 150) + (text.length > 150 ? '...' : '')
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel des paramètres */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Paramètres Vocaux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sélection de voix */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Voix</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableVoices.map((voice) => (
                      <Button
                        key={voice.id}
                        size="sm"
                        variant={settings.voice === voice.id ? 'default' : 'outline'}
                        onClick={() => setSettings(prev => ({ ...prev, voice: voice.id }))}
                        className="justify-start text-xs"
                      >
                        <User className="w-3 h-3 mr-2" />
                        <div className="text-left">
                          <div>{voice.name} ({voice.gender})</div>
                          <div className="text-xs opacity-70">{voice.personality}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Modèle */}
                {hasOpenAI && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Modèle</label>
                    <div className="space-y-1">
                      {availableModels.map((model) => (
                        <Button
                          key={model.id}
                          size="sm"
                          variant={settings.model === model.id ? 'default' : 'outline'}
                          onClick={() => setSettings(prev => ({ ...prev, model: model.id }))}
                          className="w-full justify-start text-xs"
                        >
                          <div>
                            <div>{model.name}</div>
                            <div className="text-xs opacity-70">{model.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vitesse */}
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center justify-between">
                    <span>Vitesse</span>
                    <span className="text-xs text-gray-500">{settings.speed}x</span>
                  </label>
                  <Slider
                    value={[settings.speed]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, speed: value }))}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Volume */}
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center justify-between">
                    <span>Volume</span>
                    <span className="text-xs text-gray-500">{Math.round(settings.volume * 100)}%</span>
                  </label>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, volume: value }))}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Langue */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Langue</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={settings.language === 'fr' ? 'default' : 'outline'}
                      onClick={() => setSettings(prev => ({ ...prev, language: 'fr' }))}
                    >
                      <Languages className="w-3 h-3 mr-1" />
                      Français
                    </Button>
                    <Button
                      size="sm"
                      variant={settings.language === 'en' ? 'default' : 'outline'}
                      onClick={() => setSettings(prev => ({ ...prev, language: 'en' }))}
                    >
                      <Languages className="w-3 h-3 mr-1" />
                      English
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio element pour OpenAI TTS */}
      <audio
        ref={audioRef}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(100);
          stopProgressTracking();
        }}
        style={{ display: 'none' }}
      />
    </div>
  );
};