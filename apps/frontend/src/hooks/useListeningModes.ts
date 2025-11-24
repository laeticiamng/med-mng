import logger from '@/lib/logger';
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ListeningMode = {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  playlist_criteria: {
    tempo_range: [number, number];
    mood: string[];
    genres: string[];
    energy_level: number;
  };
  effects: {
    background_sounds?: string;
    volume_curve?: string;
    break_intervals?: number;
  };
  icon: string;
  color: string;
};

const PREDEFINED_MODES: ListeningMode[] = [
  {
    id: 'focus-intense',
    name: 'Focus Intense',
    description: 'Concentration maximale pour apprentissage complexe',
    duration_minutes: 45,
    playlist_criteria: {
      tempo_range: [60, 80],
      mood: ['concentration', 'calme'],
      genres: ['ambient', 'instrumental'],
      energy_level: 0.6
    },
    effects: {
      background_sounds: 'white_noise',
      volume_curve: 'gradual_increase',
      break_intervals: 25
    },
    icon: '🎯',
    color: 'blue'
  },
  {
    id: 'revision-rapide',
    name: 'Révision Rapide',
    description: 'Révision efficace de concepts acquis',
    duration_minutes: 20,
    playlist_criteria: {
      tempo_range: [90, 120],
      mood: ['motivation', 'énergie'],
      genres: ['pop', 'electronic'],
      energy_level: 0.8
    },
    effects: {
      background_sounds: 'nature',
      volume_curve: 'steady',
      break_intervals: 15
    },
    icon: '⚡',
    color: 'orange'
  },
  {
    id: 'memorisation',
    name: 'Mémorisation',
    description: 'Optimisé pour retenir et ancrer les informations',
    duration_minutes: 30,
    playlist_criteria: {
      tempo_range: [70, 90],
      mood: ['mémorisation', 'rythmé'],
      genres: ['classical', 'neoclassical'],
      energy_level: 0.7
    },
    effects: {
      background_sounds: 'binaural_beats',
      volume_curve: 'waves',
      break_intervals: 20
    },
    icon: '🧠',
    color: 'purple'
  },
  {
    id: 'detente-studieuse',
    name: 'Détente Studieuse',
    description: 'Apprentissage décontracté et sans stress',
    duration_minutes: 60,
    playlist_criteria: {
      tempo_range: [50, 70],
      mood: ['détente', 'zen'],
      genres: ['ambient', 'chillout'],
      energy_level: 0.4
    },
    effects: {
      background_sounds: 'rain',
      volume_curve: 'soft',
      break_intervals: 30
    },
    icon: '🌿',
    color: 'green'
  },
  {
    id: 'pre-examen',
    name: 'Pré-Examen',
    description: 'Boost de confiance avant un examen',
    duration_minutes: 15,
    playlist_criteria: {
      tempo_range: [100, 130],
      mood: ['confiance', 'motivation'],
      genres: ['motivational', 'upbeat'],
      energy_level: 0.9
    },
    effects: {
      background_sounds: 'none',
      volume_curve: 'energizing',
      break_intervals: 0
    },
    icon: '🚀',
    color: 'red'
  },
  {
    id: 'creativite',
    name: 'Créativité',
    description: 'Stimule la réflexion créative et les connexions',
    duration_minutes: 40,
    playlist_criteria: {
      tempo_range: [75, 95],
      mood: ['créativité', 'inspiration'],
      genres: ['jazz', 'world'],
      energy_level: 0.65
    },
    effects: {
      background_sounds: 'cafe',
      volume_curve: 'dynamic',
      break_intervals: 20
    },
    icon: '🎨',
    color: 'pink'
  }
];

export const useListeningModes = () => {
  const [activeMode, setActiveMode] = useState<ListeningMode | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { toast } = useToast();

  const startMode = useCallback(async (mode: ListeningMode) => {
    try {
      // Sauvegarder le mode actif
      const { error } = await supabase
        .from('med_mng_listening_modes' as any)
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          mode_id: mode.id,
          mode_config: mode,
          started_at: new Date().toISOString(),
          duration_minutes: mode.duration_minutes,
          is_active: true
        });

      if (error) throw error;

      setActiveMode(mode);
      setSessionStartTime(new Date());
      setTimeRemaining(mode.duration_minutes * 60);
      setIsSessionActive(true);

      toast({
        title: `Mode ${mode.name} activé !`,
        description: `Session de ${mode.duration_minutes} minutes démarrée.`
      });

      // Démarrer le timer
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return timer;
    } catch (error) {
      logger.error('Erreur démarrage mode:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le mode d'écoute.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const endSession = useCallback(async () => {
    if (!activeMode || !sessionStartTime) return;

    try {
      const sessionDuration = Math.round((Date.now() - sessionStartTime.getTime()) / 60000);

      // Mettre à jour la session
      const { error } = await supabase
        .from('med_mng_listening_modes' as any)
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
          actual_duration_minutes: sessionDuration
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('is_active', true);

      if (error) throw error;

      toast({
        title: "Session terminée !",
        description: `Mode ${activeMode.name} : ${sessionDuration} minutes d'étude.`
      });

      setActiveMode(null);
      setSessionStartTime(null);
      setTimeRemaining(0);
      setIsSessionActive(false);
    } catch (error) {
      logger.error('Erreur fin de session:', error);
    }
  }, [activeMode, sessionStartTime, toast]);

  const pauseSession = useCallback(() => {
    setIsSessionActive(false);
    toast({
      title: "Session mise en pause",
      description: "Votre mode d'écoute est en pause."
    });
  }, [toast]);

  const resumeSession = useCallback(() => {
    setIsSessionActive(true);
    toast({
      title: "Session reprise",
      description: "Votre mode d'écoute a repris."
    });
  }, [toast]);

  const getRecommendedPlaylist = useCallback(async (mode: ListeningMode) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          action: 'get_specialized_playlist',
          mode_config: mode,
          user_context: 'listening_mode'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erreur playlist recommandée:', error);
      return null;
    }
  }, []);

  return {
    predefinedModes: PREDEFINED_MODES,
    activeMode,
    sessionStartTime,
    timeRemaining,
    isSessionActive,
    startMode,
    endSession,
    pauseSession,
    resumeSession,
    getRecommendedPlaylist
  };
};