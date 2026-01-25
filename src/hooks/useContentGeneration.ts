import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useState } from 'react';

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
  metadata: Record<string, any>;
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
      let payload: any = {
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

      const { _data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw error;
      }

      if (!_data.success) {
        throw new Error(_data.error || 'Erreur de génération');
      }

      const result: GeneratedContent = {
        id: _data.trackId || crypto.randomUUID(),
        type: request.type,
        content: _data.audioUrl || _data.audioBase64 || _data.imageBase64 || '',
        metadata: _data.metadata || {},
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
          ...(music._data || []).map(item => ({ ...item, type: 'music' as const })),
          ...(voice._data || []).map(item => ({ ...item, type: 'voice' as const })),
          ...(images._data || []).map(item => ({ ...item, type: 'image' as const }))
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

  // Générer du contenu en batch
  const generateBatch = useCallback(async (
    requests: ContentGenerationRequest[]
  ): Promise<GeneratedContent[]> => {
    const results: GeneratedContent[] = [];

    for (const request of requests) {
      const result = await generateContent(request);
      if (result) results.push(result);
    }

    return results;
  }, [generateContent]);

  // Obtenir les statistiques de génération
  const getGenerationStats = useCallback(async (): Promise<{
    totalGenerated: number;
    byType: Record<string, number>;
    lastGeneration: string | null;
  }> => {
    try {
      const content = await getUserGeneratedContent();

      const byType = content.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sortedContent = [...content].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        totalGenerated: content.length,
        byType,
        lastGeneration: sortedContent[0]?.created_at || null
      };
    } catch (error) {
      return {
        totalGenerated: 0,
        byType: {},
        lastGeneration: null
      };
    }
  }, [getUserGeneratedContent]);

  // Supprimer un contenu généré
  const deleteGeneratedContent = useCallback(async (
    contentId: string,
    type: 'music' | 'voice' | 'image'
  ): Promise<boolean> => {
    try {
      const tables = {
        music: 'generated_music_tracks',
        voice: 'generated_voice_tracks',
        image: 'generated_ambient_images'
      };

      const { error } = await (supabase as any)
        .from(tables[type])
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès"
      });

      return true;
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le contenu",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Rechercher dans le contenu généré
  const searchGeneratedContent = useCallback(async (
    query: string,
    type?: 'music' | 'voice' | 'image'
  ): Promise<any[]> => {
    const allContent = await getUserGeneratedContent(type);

    if (!query.trim()) return allContent;

    const queryLower = query.toLowerCase();
    return allContent.filter(item =>
      item.title?.toLowerCase().includes(queryLower) ||
      item.prompt?.toLowerCase().includes(queryLower) ||
      item.description?.toLowerCase().includes(queryLower)
    );
  }, [getUserGeneratedContent]);

  // Estimer le coût de génération
  const estimateCost = (type: 'music' | 'voice' | 'image', options?: any): number => {
    const baseCosts = {
      music: 5,
      voice: 2,
      image: 3
    };

    let cost = baseCosts[type];

    if (type === 'music' && options?.duration) {
      cost += Math.ceil(options.duration / 60);
    }

    if (type === 'image' && options?.quality === 'hd') {
      cost += 1;
    }

    return cost;
  };

  // Vérifier si un type de génération est disponible
  const isGenerationAvailable = useCallback(async (_type: 'music' | 'voice' | 'image'): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }, []);

  return {
    generateContent,
    generateBatch,
    getUserGeneratedContent,
    getGenerationStats,
    deleteGeneratedContent,
    searchGeneratedContent,
    estimateCost,
    isGenerationAvailable,
    isGenerating,
    progress
  };
};