// ============================================
// ORCHESTRATEUR UNIFIÉ POUR LA MUSIQUE MÉDICALE
// ============================================

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { errorService } from '@/services/core/ErrorService';
import type { 
  MedicalMusicTrack, 
  UnifiedPlayerState, 
  MusicGenerationParams, 
  GenerationStatus,
  QuotaConfig,
  MusicAnalytics,
  AccessibilityConfig,
  PerformanceConfig
} from '@/types/music-unified';

// ==========================================
// HOOK PRINCIPAL - ORCHESTRATEUR UNIFIÉ
// ==========================================

interface UseMedicalMusicOrchestratorOptions {
  autoPlay?: boolean;
  enableAnalytics?: boolean;
  enableOffline?: boolean;
  accessibilityConfig?: Partial<AccessibilityConfig>;
  performanceConfig?: Partial<PerformanceConfig>;
}

interface UseMedicalMusicOrchestratorReturn {
  // État global
  playerState: UnifiedPlayerState;
  generationStatus: Record<string, GenerationStatus>;
  quotaConfig: QuotaConfig | null;
  analytics: MusicAnalytics | null;
  
  // Actions de lecture
  play: (track: MedicalMusicTrack) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  
  // Actions de navigation
  playNext: () => void;
  playPrevious: () => void;
  setRepeatMode: (mode: 'none' | 'track' | 'playlist') => void;
  toggleShuffle: () => void;
  
  // Actions de génération
  generateMusic: (params: MusicGenerationParams) => Promise<string>;
  cancelGeneration: (taskId: string) => void;
  checkGenerationStatus: (taskId: string) => Promise<GenerationStatus>;
  
  // Actions de bibliothèque
  addToLibrary: (track: MedicalMusicTrack) => Promise<void>;
  removeFromLibrary: (trackId: string) => Promise<void>;
  toggleLike: (trackId: string) => Promise<void>;
  
  // Actions de playlist
  createPlaylist: (tracks: MedicalMusicTrack[]) => void;
  addToPlaylist: (track: MedicalMusicTrack) => void;
  removeFromPlaylist: (trackId: string) => void;
  
  // Gestion des quotas
  checkQuota: () => Promise<QuotaConfig>;
  
  // Accessibilité
  announceToScreenReader: (message: string) => void;
  enableHighContrast: () => void;
  enableReducedMotion: () => void;
  
  // Analytics
  trackEvent: (event: string, data?: Record<string, any>) => void;
  getAnalytics: (period?: 'day' | 'week' | 'month') => Promise<MusicAnalytics>;
  
  // État et statut
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

export const useMedicalMusicOrchestrator = (
  options: UseMedicalMusicOrchestratorOptions = {}
): UseMedicalMusicOrchestratorReturn => {
  
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const screenReaderRef = useRef<HTMLDivElement | null>(null);
  
  // ==========================================
  // ÉTAT CENTRAL UNIFIÉ
  // ==========================================
  
  const [playerState, setPlayerState] = useState<UnifiedPlayerState>({
    isPlaying: false,
    isLoading: false,
    hasError: false,
    currentTime: 0,
    duration: 0,
    bufferedTime: 0,
    volume: 0.8,
    isMuted: false,
    playbackRate: 1,
    repeatMode: 'none',
    shuffleMode: false,
    playlist: [],
    currentIndex: -1,
    isMinimized: false,
    showLyrics: false,
    showVisualizer: false
  });
  
  const [generationStatus, setGenerationStatus] = useState<Record<string, GenerationStatus>>({});
  const [quotaConfig, setQuotaConfig] = useState<QuotaConfig | null>(null);
  const [analytics, setAnalytics] = useState<MusicAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // ==========================================
  // CONFIGURATION D'ACCESSIBILITÉ
  // ==========================================
  
  const accessibilityConfig: AccessibilityConfig = useMemo(() => ({
    keyboardNavigation: true,
    focusVisible: true,
    ariaLabels: true,
    liveRegions: true,
    reducedMotion: false,
    highContrast: false,
    largeFonts: false,
    audioDescriptions: false,
    closedCaptions: false,
    ...options.accessibilityConfig
  }), [options.accessibilityConfig]);
  
  // ==========================================
  // GESTION DES ERREURS UNIFIÉE
  // ==========================================
  
  const handleError = useCallback((error: any, context: string) => {
    errorService.handleError(error, 'user_action', true);
    
    const errorMsg = error?.message || 'Erreur inconnue';
    setHasError(true);
    setErrorMessage(errorMsg);
    
    toast({
      title: `Erreur ${context}`,
      description: errorMsg,
      variant: "destructive"
    });
    
    // Analytics d'erreur
    if (options.enableAnalytics) {
      trackEvent('error_occurred', { context, error: errorMsg });
    }
  }, [toast, options.enableAnalytics]);
  
  // ==========================================
  // ACTIONS DE LECTURE AUDIO
  // ==========================================
  
  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Event listeners pour l'audio
      audioRef.current.addEventListener('loadstart', () => {
        setPlayerState(prev => ({ ...prev, isLoading: true, hasError: false }));
      });
      
      audioRef.current.addEventListener('canplay', () => {
        setPlayerState(prev => ({ ...prev, isLoading: false }));
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setPlayerState(prev => ({ 
            ...prev, 
            currentTime: audioRef.current!.currentTime,
            bufferedTime: audioRef.current!.buffered.length > 0 
              ? audioRef.current!.buffered.end(0) 
              : 0
          }));
        }
      });
      
      audioRef.current.addEventListener('durationchange', () => {
        if (audioRef.current) {
          setPlayerState(prev => ({ ...prev, duration: audioRef.current!.duration }));
        }
      });
      
      audioRef.current.addEventListener('ended', () => {
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
        
        // Auto-play next selon le mode
        if (playerState.repeatMode === 'track') {
          audioRef.current?.play();
        } else {
          playNext();
        }
      });
      
      audioRef.current.addEventListener('error', (e) => {
        handleError(e, 'audio_playback');
        setPlayerState(prev => ({ ...prev, isPlaying: false, hasError: true }));
      });
    }
  }, [playerState.repeatMode, handleError]);
  
  const play = useCallback(async (track: MedicalMusicTrack) => {
    try {
      initializeAudio();
      
      if (!audioRef.current) {
        throw new Error('Lecteur audio non disponible');
      }
      
      setPlayerState(prev => ({ 
        ...prev, 
        currentTrack: track,
        isLoading: true,
        hasError: false 
      }));
      
      // Charger la nouvelle source
      audioRef.current.src = track.stream_url || track.audio_url;
      audioRef.current.volume = playerState.volume;
      audioRef.current.playbackRate = playerState.playbackRate;
      
      await audioRef.current.play();
      
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: true, 
        isLoading: false 
      }));
      
      // Analytics
      if (options.enableAnalytics) {
        trackEvent('playback_started', { 
          track_id: track.id, 
          item_code: track.medical_metadata.item_code 
        });
      }
      
      // Accessibilité
      announceToScreenReader(`Lecture de ${track.title}`);
      
    } catch (error) {
      handleError(error, 'play');
    }
  }, [playerState.volume, playerState.playbackRate, options.enableAnalytics, initializeAudio, handleError]);
  
  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      announceToScreenReader('Lecture en pause');
    }
  }, []);
  
  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().then(() => {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
        announceToScreenReader('Lecture reprise');
      }).catch(error => handleError(error, 'resume'));
    }
  }, [handleError]);
  
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        currentTime: 0,
        currentTrack: undefined 
      }));
      announceToScreenReader('Lecture arrêtée');
    }
  }, []);
  
  const seekTo = useCallback((time: number) => {
    if (audioRef.current && playerState.duration > 0) {
      const clampedTime = Math.max(0, Math.min(time, playerState.duration));
      audioRef.current.currentTime = clampedTime;
      setPlayerState(prev => ({ ...prev, currentTime: clampedTime }));
      
      announceToScreenReader(`Position: ${Math.floor(clampedTime / 60)}:${Math.floor(clampedTime % 60).toString().padStart(2, '0')}`);
    }
  }, [playerState.duration]);
  
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    
    setPlayerState(prev => ({ 
      ...prev, 
      volume: clampedVolume,
      isMuted: clampedVolume === 0 
    }));
    
    announceToScreenReader(`Volume: ${Math.round(clampedVolume * 100)}%`);
  }, []);
  
  const setPlaybackRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.25, Math.min(3, rate));
    
    if (audioRef.current) {
      audioRef.current.playbackRate = clampedRate;
    }
    
    setPlayerState(prev => ({ ...prev, playbackRate: clampedRate }));
    announceToScreenReader(`Vitesse: ${clampedRate}x`);
  }, []);
  
  // ==========================================
  // NAVIGATION DANS LA PLAYLIST
  // ==========================================
  
  const playNext = useCallback(() => {
    const { playlist, currentIndex, shuffleMode } = playerState;
    
    if (playlist.length === 0) return;
    
    let nextIndex: number;
    
    if (shuffleMode) {
      // Mode aléatoire
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
    } else {
      // Mode séquentiel
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        nextIndex = 0; // Boucle au début
      }
    }
    
    setPlayerState(prev => ({ ...prev, currentIndex: nextIndex }));
    play(playlist[nextIndex]);
  }, [playerState, play]);
  
  const playPrevious = useCallback(() => {
    const { playlist, currentIndex } = playerState;
    
    if (playlist.length === 0) return;
    
    const prevIndex = currentIndex - 1 < 0 ? playlist.length - 1 : currentIndex - 1;
    
    setPlayerState(prev => ({ ...prev, currentIndex: prevIndex }));
    play(playlist[prevIndex]);
  }, [playerState, play]);
  
  const setRepeatMode = useCallback((mode: 'none' | 'track' | 'playlist') => {
    setPlayerState(prev => ({ ...prev, repeatMode: mode }));
    announceToScreenReader(`Mode répétition: ${mode}`);
  }, []);
  
  const toggleShuffle = useCallback(() => {
    setPlayerState(prev => ({ ...prev, shuffleMode: !prev.shuffleMode }));
    announceToScreenReader(`Mode aléatoire ${playerState.shuffleMode ? 'désactivé' : 'activé'}`);
  }, [playerState.shuffleMode]);
  
  // ==========================================
  // GÉNÉRATION MUSICALE UNIFIÉE
  // ==========================================
  
  const generateMusic = useCallback(async (params: MusicGenerationParams): Promise<string> => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      console.log('🎵 Génération musicale démarrée:', params);
      
      // Vérifier le quota
      const quota = await checkQuota();
      if (!quota || quota.monthly_used >= quota.monthly_limit) {
        throw new Error('Quota de génération épuisé pour ce mois');
      }
      
      // Appel à l'edge function de génération
      const { data, error } = await supabase.functions.invoke('suno-music-optimized', {
        body: {
          ...params,
          callback_url: `${window.location.origin}/api/music-callback`
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const taskId = data.task_id || data.trackId;
      
      // Initialiser le statut de génération
      setGenerationStatus(prev => ({
        ...prev,
        [taskId]: {
          task_id: taskId,
          status: 'generating',
          progress: 0,
          started_at: new Date().toISOString()
        }
      }));
      
      // Analytics
      if (options.enableAnalytics) {
        trackEvent('generation_started', {
          task_id: taskId,
          item_code: params.item_code,
          model: params.model,
          style: params.style
        });
      }
      
      toast({
        title: "🎵 Génération démarrée",
        description: `Musique pour ${params.item_code} en cours de génération...`
      });
      
      return taskId;
      
    } catch (error) {
      handleError(error, 'music_generation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options.enableAnalytics, toast, handleError]);
  
  const checkGenerationStatus = useCallback(async (taskId: string): Promise<GenerationStatus> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-generation-status', {
        body: { task_id: taskId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const status = data as GenerationStatus;
      
      // Mettre à jour le statut local
      setGenerationStatus(prev => ({
        ...prev,
        [taskId]: status
      }));
      
      // Si complété, ajouter à la playlist
      if (status.status === 'completed' && status.audio_url) {
        const track: MedicalMusicTrack = {
          id: taskId,
          title: `Musique générée - ${taskId.substring(0, 8)}`,
          audio_url: status.audio_url,
          stream_url: status.stream_url,
          image_url: status.image_url,
          medical_metadata: {
            item_code: 'Generated',
            rang: 'A',
            style: 'Generated',
            difficulty_level: 1,
            medical_domain: 'General',
            learning_objectives: [],
            keywords: [],
            competencies: []
          },
          generation_metadata: {
            model_used: 'V4',
            language: 'fr',
            suno_track_id: taskId,
            task_id: taskId
          },
          interaction_metadata: {
            play_count: 0,
            like_count: 0
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Ajouter à la playlist
        setPlayerState(prev => ({
          ...prev,
          playlist: [...prev.playlist, track]
        }));
        
        // Analytics
        if (options.enableAnalytics) {
          trackEvent('generation_completed', {
            task_id: taskId,
            duration: status.completed_at ? 
              new Date(status.completed_at).getTime() - new Date(status.started_at).getTime() 
              : undefined
          });
        }
        
        toast({
          title: "🎉 Génération terminée !",
          description: "Votre musique est prête à être écoutée."
        });
      }
      
      return status;
      
    } catch (error) {
      handleError(error, 'status_check');
      throw error;
    }
  }, [options.enableAnalytics, toast, handleError]);
  
  const cancelGeneration = useCallback((taskId: string) => {
    setGenerationStatus(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status: 'failed',
        error_message: 'Génération annulée par l\'utilisateur'
      }
    }));
    
    announceToScreenReader('Génération annulée');
  }, []);
  
  // ==========================================
  // GESTION DES QUOTAS
  // ==========================================
  
  const checkQuota = useCallback(async (): Promise<QuotaConfig> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-quota', {
        body: { user_id: 'current' }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setQuotaConfig(data);
      return data;
      
    } catch (error) {
      handleError(error, 'quota_check');
      throw error;
    }
  }, [handleError]);
  
  // ==========================================
  // ACTIONS DE BIBLIOTHÈQUE
  // ==========================================
  
  const addToLibrary = useCallback(async (track: MedicalMusicTrack) => {
    try {
      // Simulation d'ajout à la bibliothèque (table à créer)
      console.log('Ajout à la bibliothèque:', track.id);
      
      // Mettre à jour les métadonnées du track
      track.interaction_metadata.is_in_library = true;
      
      toast({
        title: "✅ Ajouté à la bibliothèque",
        description: track.title
      });
      
      announceToScreenReader(`${track.title} ajouté à la bibliothèque`);
      
    } catch (error) {
      handleError(error, 'add_to_library');
    }
  }, [toast, handleError]);
  
  const removeFromLibrary = useCallback(async (trackId: string) => {
    try {
      // Simulation de suppression de la bibliothèque
      console.log('Suppression de la bibliothèque:', trackId);
      
      toast({
        title: "🗑️ Retiré de la bibliothèque",
        description: "Track supprimé"
      });
      
    } catch (error) {
      handleError(error, 'remove_from_library');
    }
  }, [toast, handleError]);
  
  const toggleLike = useCallback(async (trackId: string) => {
    try {
      const track = playerState.playlist.find(t => t.id === trackId);
      if (!track) return;
      
      const isLiked = track.interaction_metadata.is_liked;
      
      // Simulation de toggle like (tables à créer)
      track.interaction_metadata.is_liked = !isLiked;
      track.interaction_metadata.like_count += isLiked ? -1 : 1;
      console.log('Toggle like:', trackId, track.interaction_metadata.is_liked);
      
      announceToScreenReader(`${track.title} ${isLiked ? 'retiré des' : 'ajouté aux'} favoris`);
      
    } catch (error) {
      handleError(error, 'toggle_like');
    }
  }, [playerState.playlist, handleError]);
  
  // ==========================================
  // GESTION DES PLAYLISTS
  // ==========================================
  
  const createPlaylist = useCallback((tracks: MedicalMusicTrack[]) => {
    setPlayerState(prev => ({
      ...prev,
      playlist: tracks,
      currentIndex: tracks.length > 0 ? 0 : -1
    }));
    
    announceToScreenReader(`Playlist créée avec ${tracks.length} morceaux`);
  }, []);
  
  const addToPlaylist = useCallback((track: MedicalMusicTrack) => {
    setPlayerState(prev => ({
      ...prev,
      playlist: [...prev.playlist, track]
    }));
    
    announceToScreenReader(`${track.title} ajouté à la playlist`);
  }, []);
  
  const removeFromPlaylist = useCallback((trackId: string) => {
    setPlayerState(prev => {
      const newPlaylist = prev.playlist.filter(t => t.id !== trackId);
      const trackIndex = prev.playlist.findIndex(t => t.id === trackId);
      
      let newCurrentIndex = prev.currentIndex;
      
      if (trackIndex === prev.currentIndex) {
        // Si c'est le track actuel, passer au suivant ou arrêter
        if (newPlaylist.length === 0) {
          newCurrentIndex = -1;
          stop();
        } else if (trackIndex >= newPlaylist.length) {
          newCurrentIndex = 0;
        }
      } else if (trackIndex < prev.currentIndex) {
        newCurrentIndex--;
      }
      
      return {
        ...prev,
        playlist: newPlaylist,
        currentIndex: newCurrentIndex
      };
    });
    
    announceToScreenReader('Morceau retiré de la playlist');
  }, [stop]);
  
  // ==========================================
  // ACCESSIBILITÉ
  // ==========================================
  
  const announceToScreenReader = useCallback((message: string) => {
    if (!accessibilityConfig.liveRegions) return;
    
    // Créer ou utiliser la région live pour les annonces
    if (!screenReaderRef.current) {
      const div = document.createElement('div');
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('aria-atomic', 'true');
      div.style.position = 'absolute';
      div.style.left = '-10000px';
      div.style.width = '1px';
      div.style.height = '1px';
      div.style.overflow = 'hidden';
      document.body.appendChild(div);
      screenReaderRef.current = div;
    }
    
    screenReaderRef.current.textContent = message;
    
    // Nettoyer après 1 seconde
    setTimeout(() => {
      if (screenReaderRef.current) {
        screenReaderRef.current.textContent = '';
      }
    }, 1000);
  }, [accessibilityConfig.liveRegions]);
  
  const enableHighContrast = useCallback(() => {
    document.body.classList.add('high-contrast');
    announceToScreenReader('Mode contraste élevé activé');
  }, []);
  
  const enableReducedMotion = useCallback(() => {
    document.body.classList.add('reduced-motion');
    announceToScreenReader('Mode mouvement réduit activé');
  }, []);
  
  // ==========================================
  // ANALYTICS ET ÉVÉNEMENTS
  // ==========================================
  
  const trackEvent = useCallback((event: string, data?: Record<string, any>) => {
    if (!options.enableAnalytics) return;
    
    console.log(`📊 [Analytics] ${event}:`, data);
    
    // Ici on pourrait intégrer avec un service d'analytics réel
    // comme Mixpanel, Amplitude, ou Google Analytics
  }, [options.enableAnalytics]);
  
  const getAnalytics = useCallback(async (period: 'day' | 'week' | 'month' = 'month'): Promise<MusicAnalytics> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-analytics', {
        body: { period, user_id: 'current' }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setAnalytics(data);
      return data;
      
    } catch (error) {
      handleError(error, 'analytics');
      throw error;
    }
  }, [handleError]);
  
  // ==========================================
  // EFFECTS ET NETTOYAGE
  // ==========================================
  
  // Nettoyage à la fermeture
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (screenReaderRef.current) {
        document.body.removeChild(screenReaderRef.current);
        screenReaderRef.current = null;
      }
    };
  }, []);
  
  // Gestion des raccourcis clavier
  useEffect(() => {
    if (!accessibilityConfig.keyboardNavigation) return;
    
    const handleKeyPress = (event: KeyboardEvent) => {
      // Éviter les conflits avec les champs de saisie
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (playerState.isPlaying) {
            pause();
          } else {
            resume();
          }
          break;
        case 'ArrowRight':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            playNext();
          }
          break;
        case 'ArrowLeft':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            playPrevious();
          }
          break;
        case 'ArrowUp':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setVolume(Math.min(1, playerState.volume + 0.1));
          }
          break;
        case 'ArrowDown':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setVolume(Math.max(0, playerState.volume - 0.1));
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [accessibilityConfig.keyboardNavigation, playerState.isPlaying, playerState.volume, pause, resume, playNext, playPrevious, setVolume]);
  
  // Initialisation des quotas
  useEffect(() => {
    checkQuota().catch(error => {
      errorService.handleWarning('Impossible de charger les quotas', 'user_action');
    });
  }, [checkQuota]);
  
  // ==========================================
  // RETOUR DE L'INTERFACE PUBLIQUE
  // ==========================================
  
  return {
    // État
    playerState,
    generationStatus,
    quotaConfig,
    analytics,
    
    // Actions de lecture
    play,
    pause,
    resume,
    stop,
    seekTo,
    setVolume,
    setPlaybackRate,
    
    // Navigation
    playNext,
    playPrevious,
    setRepeatMode,
    toggleShuffle,
    
    // Génération
    generateMusic,
    cancelGeneration,
    checkGenerationStatus,
    
    // Bibliothèque
    addToLibrary,
    removeFromLibrary,
    toggleLike,
    
    // Playlists
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    
    // Quotas
    checkQuota,
    
    // Accessibilité
    announceToScreenReader,
    enableHighContrast,
    enableReducedMotion,
    
    // Analytics
    trackEvent,
    getAnalytics,
    
    // État global
    isLoading,
    hasError,
    errorMessage
  };
};