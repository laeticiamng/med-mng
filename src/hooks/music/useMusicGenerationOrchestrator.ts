
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

      // Afficher un message informatif à l'utilisateur
      toast({
        title: "Génération démarrée",
        description: `Suno AI traite votre demande pour le Rang ${rang}. Cela peut prendre quelques minutes...`,
      });

      // Commencer le polling avec progression visuelle améliorée
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
          let errorMessage = error.message;
          let toastTitle = "Erreur de génération Suno";
          
          // Messages plus informatifs selon le type d'erreur
          if (errorMessage.includes('Délai d\'attente dépassé')) {
            toastTitle = "Génération en cours...";
            errorMessage = "La génération prend plus de temps que prévu. L'API Suno est peut-être occupée. Vous pouvez réessayer dans quelques minutes.";
          } else if (errorMessage.includes('Trop d\'erreurs consécutives')) {
            errorMessage = "Problème de connexion avec l'API Suno. Veuillez vérifier votre connexion internet et réessayer.";
          }
          
          toast({
            title: toastTitle,
            description: errorMessage,
            variant: "destructive"
          });
          
          onError(error);
        }
      });
      
    } catch (error) {
      console.error(`❌ ERREUR GÉNÉRATION SUNO Rang ${rang}:`, error);
      
      const errorMessage = (error instanceof Error ? error.message : String(error)) || "Impossible de générer la musique avec Suno. Veuillez réessayer.";
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
