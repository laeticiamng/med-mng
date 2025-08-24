import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const useAPI = <T>() => {
  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: false,
    error: null
  });
  
  const { toast } = useToast();

  const callFunction = async (
    functionName: string,
    body: any = {},
    options: { 
      showSuccess?: boolean;
      successMessage?: string;
      showError?: boolean;
      errorMessage?: string;
    } = {}
  ): Promise<APIResponse<T>> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log(`🚀 Appel ${functionName}:`, body);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body
      });

      if (error) {
        throw new Error(error.message);
      }

      setState({
        data: data,
        loading: false,
        error: null
      });

      if (options.showSuccess !== false) {
        toast({
          title: "✅ Succès",
          description: options.successMessage || "Opération réussie",
        });
      }

      console.log(`✅ ${functionName} réussi:`, data);
      return { success: true, data };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage
      });

      if (options.showError !== false) {
        toast({
          title: "❌ Erreur",
          description: options.errorMessage || errorMessage,
          variant: "destructive"
        });
      }

      console.error(`❌ ${functionName} échoué:`, error);
      return { success: false, error: errorMessage };
    }
  };

  const reset = () => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  };

  return {
    ...state,
    callFunction,
    reset
  };
};

// Hook spécialisé pour la génération musicale
export const useMusicGeneration = () => {
  const api = useAPI<any>();
  
  const generateMusic = async (params: {
    lyrics?: string[];
    medical_content: string;
    style: string;
    difficulty: string;
    duration: number;
    title?: string;
  }) => {
    return api.callFunction('music-generation-secure', params, {
      successMessage: "🎵 Musique générée avec succès !",
      errorMessage: "Erreur lors de la génération musicale"
    });
  };

  return {
    ...api,
    generateMusic
  };
};

// Hook pour l'IA conversationnelle
export const useAIChat = () => {
  const api = useAPI<{ response: string }>();
  
  const sendMessage = async (params: {
    message: string;
    context?: string;
    medical_topic?: string;
  }) => {
    return api.callFunction('contextual-ai-chat', params, {
      showSuccess: false,
      errorMessage: "Erreur de communication avec l'IA"
    });
  };

  return {
    ...api,
    sendMessage
  };
};

// Hook pour la génération de contenu IA
export const useContentGeneration = () => {
  const api = useAPI<any>();
  
  const generateContent = async (params: {
    type: 'lyrics' | 'tableau' | 'quiz' | 'scene';
    medical_content: string;
    style?: string;
    difficulty?: string;
    parameters?: any;
  }) => {
    return api.callFunction('content-ai-generator', params, {
      successMessage: "✨ Contenu généré avec succès !",
      errorMessage: "Erreur lors de la génération de contenu"
    });
  };

  return {
    ...api,
    generateContent
  };
};

// Hook pour les recommandations IA
export const useAIRecommendations = () => {
  const api = useAPI<any>();
  
  const getRecommendations = async (params: {
    user_id?: string;
    current_topic?: string;
    learning_history?: any[];
    preferences?: any;
    recommendation_type?: 'next_topics' | 'similar_content' | 'review_suggestions';
  }) => {
    return api.callFunction('ai-recommendations', params, {
      showSuccess: false,
      errorMessage: "Erreur lors de la récupération des recommandations"
    });
  };

  return {
    ...api,
    getRecommendations
  };
};