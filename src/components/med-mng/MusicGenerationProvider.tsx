import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MusicGenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  generatedMusic: GeneratedMusic | null;
  error: string | null;
  quota: QuotaInfo;
  history: GenerationHistory[];
}

interface GeneratedMusic {
  id: string;
  title: string;
  audioUrl: string;
  lyrics: string[];
  style: string;
  duration: number;
  createdAt: Date;
  rang: 'A' | 'B' | 'AB';
}

interface QuotaInfo {
  used: number;
  total: number;
  resetDate: Date;
  planType: 'free' | 'pro' | 'premium';
}

interface GenerationHistory {
  id: string;
  title: string;
  style: string;
  createdAt: Date;
  status: 'completed' | 'failed' | 'generating';
  audioUrl?: string;
}

interface GenerationRequest {
  lyrics: string | string[];
  style: string;
  rang: 'A' | 'B' | 'AB';
  duration?: number;
  language?: string;
}

interface MusicGenerationContextType extends MusicGenerationState {
  generateMusic: (request: GenerationRequest) => Promise<GeneratedMusic | null>;
  cancelGeneration: () => void;
  clearError: () => void;
  refreshQuota: () => Promise<void>;
  loadHistory: () => Promise<void>;
  deleteFromHistory: (id: string) => Promise<boolean>;
  regenerateFromHistory: (id: string) => Promise<GeneratedMusic | null>;
}

const MusicGenerationContext = createContext<MusicGenerationContextType | undefined>(undefined);

const initialState: MusicGenerationState = {
  isGenerating: false,
  progress: 0,
  currentStep: '',
  generatedMusic: null,
  error: null,
  quota: {
    used: 0,
    total: 10,
    resetDate: new Date(),
    planType: 'free'
  },
  history: []
};

export const MusicGenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MusicGenerationState>(initialState);
  const { toast } = useToast();

  // Générer de la musique
  const generateMusic = useCallback(async (request: GenerationRequest): Promise<GeneratedMusic | null> => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      currentStep: 'Préparation...',
      error: null,
      generatedMusic: null
    }));

    try {
      // Vérifier le quota
      setState(prev => ({ ...prev, currentStep: 'Vérification du quota...', progress: 10 }));
      
      const { data: quotaData, error: quotaError } = await supabase.rpc('med_mng_get_remaining_quota');
      if (quotaError) throw quotaError;
      
      if (quotaData <= 0) {
        throw new Error('Quota insuffisant pour générer de la musique');
      }

      // Préparer les données
      setState(prev => ({ ...prev, currentStep: 'Préparation des données...', progress: 20 }));
      
      const lyricsText = Array.isArray(request.lyrics) ? request.lyrics.join('\n') : request.lyrics;
      
      // Appeler l'API de génération
      setState(prev => ({ ...prev, currentStep: 'Génération en cours...', progress: 40 }));
      
      const { data, error } = await supabase.functions.invoke('secure-music-generation', {
        body: {
          lyrics: lyricsText,
          style: request.style,
          rang: request.rang,
          duration: request.duration || 240,
          language: request.language || 'fr'
        }
      });

      if (error) throw error;

      setState(prev => ({ ...prev, currentStep: 'Finalisation...', progress: 80 }));

      // Créer l'objet de musique générée
      const generatedMusic: GeneratedMusic = {
        id: data.id || Date.now().toString(),
        title: data.title || `Chanson ${request.style}`,
        audioUrl: data.audioUrl,
        lyrics: Array.isArray(request.lyrics) ? request.lyrics : [request.lyrics],
        style: request.style,
        duration: data.duration || request.duration || 240,
        createdAt: new Date(),
        rang: request.rang
      };

      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 100,
        currentStep: 'Terminé !',
        generatedMusic,
        quota: {
          ...prev.quota,
          used: prev.quota.used + 1
        }
      }));

      // Ajouter à l'historique
      setState(prev => ({
        ...prev,
        history: [
          {
        id: generatedMusic.id,
        title: generatedMusic.title,
        style: 'generated',
            createdAt: generatedMusic.createdAt,
            status: 'completed',
            audioUrl: generatedMusic.audioUrl
          },
          ...prev.history
        ]
      }));

      toast({
        title: "🎵 Génération réussie !",
        description: `Votre chanson "${generatedMusic.title}" a été créée avec succès.`
      });

      return generatedMusic;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 0,
        currentStep: '',
        error: errorMessage
      }));

      toast({
        title: "❌ Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  }, [toast]);

  // Annuler la génération
  const cancelGeneration = useCallback(() => {
    setState(prev => ({
      ...prev,
      isGenerating: false,
      progress: 0,
      currentStep: '',
      error: null
    }));

    toast({
      title: "Génération annulée",
      description: "La génération de musique a été annulée."
    });
  }, [toast]);

  // Effacer l'erreur
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Actualiser le quota
  const refreshQuota = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('med_mng_get_remaining_quota');
      if (error) throw error;

      setState(prev => ({
        ...prev,
        quota: {
          ...prev.quota,
          used: prev.quota.total - data
        }
      }));
    } catch (error) {
      console.error('Erreur lors de l\'actualisation du quota:', error);
    }
  }, []);

  // Charger l'historique
  const loadHistory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('med_mng_songs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const history: GenerationHistory[] = data?.map(song => ({
        id: song.id,
        title: song.title,
        style: 'Chanson générée',
        createdAt: new Date(song.created_at),
        status: 'completed',
        audioUrl: song.suno_audio_id
      })) || [];

      setState(prev => ({ ...prev, history }));
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  }, []);

  // Supprimer de l'historique
  const deleteFromHistory = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('med_mng_songs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        history: prev.history.filter(item => item.id !== id)
      }));

      toast({
        title: "Chanson supprimée",
        description: "La chanson a été supprimée de votre historique."
      });

      return true;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la chanson.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Régénérer depuis l'historique
  const regenerateFromHistory = useCallback(async (id: string): Promise<GeneratedMusic | null> => {
    const historyItem = state.history.find(item => item.id === id);
    if (!historyItem) return null;

    // Pour la régénération, on utilise les paramètres par défaut
    return generateMusic({
      lyrics: `Régénération de ${historyItem.title}`,
      style: historyItem.style,
      rang: 'A'
    });
  }, [state.history, generateMusic]);

  const contextValue: MusicGenerationContextType = {
    ...state,
    generateMusic,
    cancelGeneration,
    clearError,
    refreshQuota,
    loadHistory,
    deleteFromHistory,
    regenerateFromHistory
  };

  return (
    <MusicGenerationContext.Provider value={contextValue}>
      {children}
    </MusicGenerationContext.Provider>
  );
};

export const useMusicGeneration = (): MusicGenerationContextType => {
  const context = useContext(MusicGenerationContext);
  if (!context) {
    throw new Error('useMusicGeneration must be used within a MusicGenerationProvider');
  }
  return context;
};

export default MusicGenerationProvider;