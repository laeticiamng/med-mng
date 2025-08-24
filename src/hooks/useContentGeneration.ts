import { ContentGenerationPayload } from '@/types/hooks';
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentGenerationRequest {
  type: 'music' | 'voice' | 'image';
  prompt: string;
  options?: {
    style?: string;
    mood?: string;
    voiceId?: string;
    duration?: number;
    size?: string;
    quality?: string;
  };
}

export interface GeneratedContent {
  id: string;
  type: 'music' | 'voice' | 'image';
  content: string; // URL or base64
  metadata: Record<string, unknown>;
  createdAt: string;
}

export const useContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const generateContent = useCallback(async (request: ContentGenerationRequest): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentification requise');
      }

      let functionName: string;
      let payload: ContentGenerationPayload = {
        ...request,
        userId: user.id
      };

      // Sélectionner la bonne Edge Function
      switch (request.type) {
        case 'music':
          functionName = 'generate-music';
          payload = {
            prompt: request.prompt,
            style: request.options?.style || 'ambient',
            mood: request.options?.mood || 'relaxing',
            duration: request.options?.duration || 120,
            userId: user.id
          };
          break;
        
        case 'voice':
          functionName = 'generate-voice';
          payload = {
            text: request.prompt,
            voiceId: request.options?.voiceId || '9BWtsMINqrJLrRacOk9x', // Aria par défaut
            userId: user.id
          };
          break;
        
        case 'image':
          functionName = 'generate-image';
          payload = {
            prompt: request.prompt,
            style: request.options?.style || 'ambient',
            mood: request.options?.mood || 'serene',
            size: request.options?.size || '1024x1024',
            quality: request.options?.quality || 'hd',
            userId: user.id
          };
          break;
        
        default:
          throw new Error('Type de contenu non supporté');
      }

      // Simuler le progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log(`🎯 Génération ${request.type}:`, payload);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur de génération');
      }

      const result: GeneratedContent = {
        id: data.trackId || crypto.randomUUID(),
        type: request.type,
        content: data.audioUrl || data.audioBase64 || data.imageBase64 || '',
        metadata: data.metadata || {},
        createdAt: new Date().toISOString()
      };

      toast({
        title: "Contenu généré !",
        description: `${request.type === 'music' ? 'Musique' : request.type === 'voice' ? 'Voix' : 'Image'} créé(e) avec succès.`
      });

      return result;

    } catch (error) {
      console.error('Erreur génération:', error);
      
      toast({
        title: "Erreur de génération",
        description: error.message || 'Impossible de générer le contenu.',
        variant: "destructive"
      });

      return null;
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [toast]);

  const getUserGeneratedContent = useCallback(async (type?: 'music' | 'voice' | 'image') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      if (!type) {
        // Récupérer tout
        const [music, voice, images] = await Promise.all([
          supabase.from('generated_music_tracks').select('*').eq('user_id', user.id),
          supabase.from('generated_voice_tracks').select('*').eq('user_id', user.id),
          supabase.from('generated_ambient_images').select('*').eq('user_id', user.id)
        ]);

        return [
          ...(music.data || []).map(item => ({ ...item, type: 'music' as const })),
          ...(voice.data || []).map(item => ({ ...item, type: 'voice' as const })),
          ...(images.data || []).map(item => ({ ...item, type: 'image' as const }))
        ];
      }

      // Récupérer un type spécifique
      let query;
      switch (type) {
        case 'music':
          query = supabase.from('generated_music_tracks').select('*').eq('user_id', user.id);
          break;
        case 'voice':
          query = supabase.from('generated_voice_tracks').select('*').eq('user_id', user.id);
          break;
        case 'image':
          query = supabase.from('generated_ambient_images').select('*').eq('user_id', user.id);
          break;
        default:
          return [];
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({ ...item, type }));

    } catch (error) {
      console.error('Erreur récupération contenu:', error);
      return [];
    }
  }, []);

  return {
    generateContent,
    getUserGeneratedContent,
    isGenerating,
    progress
  };
};