
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMusicPolling } from './useMusicPolling';

interface GenerationConfig {
  rang: 'A' | 'B' | 'AB';
  translatedLyrics: string;
  selectedStyle: string;
  duration: number;
  currentLanguage: string;
  onProgress: (rang: 'A' | 'B' | 'AB', progress: any) => void;
  onSuccess: (rang: 'A' | 'B' | 'AB', audioUrl: string) => void;
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
      const requestBody = {
        lyrics: translatedLyrics,
        style: selectedStyle,
        rang,
        duration,
        language: currentLanguage,
        fastMode: true
      };

      // Démarrer la génération initiale
      const { data: initialData, error: initialError } = await supabase.functions.invoke('generate-music', {
        body: requestBody
      });

      if (initialError) {
        throw new Error(initialError.message || 'Erreur lors du démarrage de la génération');
      }

      // Si c'est déjà un succès (peu probable), on termine
      if (initialData?.status === 'success' && initialData?.audioUrl) {
        const validatedAudioUrl = validateAndNormalizeAudioUrl(initialData.audioUrl);
        
        toast({
          title: "Génération réussie",
          description: `Musique générée avec succès pour le Rang ${rang}`,
        });
        
        onSuccess(rang, validatedAudioUrl);
        return validatedAudioUrl;
      }

      // ✅ CORRECTION: Utiliser le trackId pour le polling
      const taskId = initialData?.trackId;
      if (!taskId) {
        throw new Error('Aucun trackId reçu de l\'API - impossible de suivre la génération');
      }

      // Afficher un message informatif à l'utilisateur
      toast({
        title: "Génération démarrée",
        description: `Suno AI traite votre demande pour le Rang ${rang}. Cela peut prendre 2-3 minutes...`,
      });

      // ✅ CORRECTION: Commencer le polling avec taskId au lieu de requestBody
      startPolling({
        taskId,
        rang,
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
          let errorMessage = error.message;
          let toastTitle = "Erreur de génération Suno";
          
          // Messages plus informatifs selon le type d'erreur
          if (errorMessage.includes('Timeout')) {
            toastTitle = "Génération trop longue";
            errorMessage = "L'API Suno est peut-être occupée. Réessayez dans quelques minutes.";
          } else if (errorMessage.includes('réseau') || errorMessage.includes('consécutives')) {
            errorMessage = "Problème de connexion avec l'API Suno. Vérifiez votre connexion et réessayez.";
          }
          
          toast({
            title: toastTitle,
            description: errorMessage,
            variant: "destructive"
          });
          
          onError(error);
        }
      });

      return taskId;
      
    } catch (error) {
      const errorMessage = (error as Error).message || "Impossible de générer la musique. Veuillez réessayer.";
      toast({
        title: "Erreur de génération",
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
