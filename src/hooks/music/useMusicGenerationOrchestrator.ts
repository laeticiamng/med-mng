
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMusicPolling } from './useMusicPolling';

interface GenerationConfig {
  rang: 'A' | 'B';
  translatedLyrics: string;
  selectedStyle: string;
  duration: number;
  currentLanguage: string;
  onProgress: (rang: 'A' | 'B', progress: any) => void;
  onSuccess: (rang: 'A' | 'B', audioUrl: string) => void;
  onError: (error: Error) => void;
  validateAndNormalizeAudioUrl: (url: string) => string;
}

export const useMusicGenerationOrchestrator = () => {
  const { toast } = useToast();
  const { startPolling } = useMusicPolling();

  const startGeneration = async ({
    rang,
    translatedLyrics,
    selectedStyle,
    duration,
    currentLanguage,
    onProgress,
    onSuccess,
    onError,
    validateAndNormalizeAudioUrl
  }: GenerationConfig) => {
    try {
      console.log(`🎵 DÉMARRAGE GÉNÉRATION SUNO Rang ${rang} en ${currentLanguage}`);
      
      const requestBody = {
        lyrics: translatedLyrics,
        style: selectedStyle,
        rang,
        duration,
        language: currentLanguage,
        fastMode: true
      };

      // Démarrer la génération initiale
      console.log('🎵 Appel initial pour démarrer la génération...');
      const { data: initialData, error: initialError } = await supabase.functions.invoke('generate-music', {
        body: requestBody
      });

      if (initialError) {
        console.error('❌ Erreur lors du démarrage:', initialError);
        throw new Error(initialError.message || 'Erreur lors du démarrage de la génération');
      }

      console.log('🎵 Réponse initiale:', initialData);

      // Si c'est déjà un succès (peu probable), on termine
      if (initialData?.status === 'success' && initialData?.audioUrl) {
        console.log('🎵 GÉNÉRATION TERMINÉE IMMÉDIATEMENT:', initialData.audioUrl);
        const validatedAudioUrl = validateAndNormalizeAudioUrl(initialData.audioUrl);
        
        toast({
          title: "Génération réussie",
          description: `Musique générée avec succès pour le Rang ${rang}`,
        });
        
        onSuccess(rang, validatedAudioUrl);
        return validatedAudioUrl;
      }

      // Commencer le polling avec progression visuelle
      startPolling({
        rang,
        requestBody,
        onProgress,
        onSuccess: (rangPolling, audioUrl) => {
          const validatedAudioUrl = validateAndNormalizeAudioUrl(audioUrl);
          
          toast({
            title: "Génération réussie",
            description: `Musique générée avec succès pour le Rang ${rangPolling}`,
          });
          
          onSuccess(rangPolling, validatedAudioUrl);
        },
        onError: (error) => {
          toast({
            title: "Erreur de génération Suno",
            description: error.message,
            variant: "destructive"
          });
          onError(error);
        }
      });
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION SUNO Rang ${rang}:`, error);
      
      const errorMessage = error.message || "Impossible de générer la musique avec Suno. Veuillez réessayer.";
      toast({
        title: "Erreur de génération Suno",
        description: errorMessage,
        variant: "destructive"
      });
      
      onError(error as Error);
    }
  };

  return {
    startGeneration
  };
};
