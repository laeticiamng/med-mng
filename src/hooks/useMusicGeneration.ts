
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeneratingState {
  rangA: boolean;
  rangB: boolean;
}

export const useMusicGeneration = () => {
  const [isGenerating, setIsGenerating] = useState<GeneratingState>({
    rangA: false,
    rangB: false
  });
  const [generatedAudio, setGeneratedAudio] = useState<{ rangA?: string; rangB?: string }>({});
  const [lastError, setLastError] = useState<string>('');
  const { toast } = useToast();

  const generateMusic = async (rang: 'A' | 'B', paroles: string[], selectedStyle: string, duration: number = 240) => {
    if (!selectedStyle) {
      toast({
        title: "Style musical requis",
        description: "Veuillez sélectionner un style musical avant de générer la musique.",
        variant: "destructive"
      });
      return;
    }

    if (!paroles || paroles.length === 0) {
      toast({
        title: "Paroles manquantes",
        description: "Aucune parole disponible pour générer la musique.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(prev => ({ ...prev, [rang === 'A' ? 'rangA' : 'rangB']: true }));
    setLastError('');
    const parolesIndex = rang === 'A' ? 0 : 1;
    const parolesText = paroles[parolesIndex];

    if (!parolesText || parolesText.trim() === '') {
      setLastError(`Aucune parole disponible pour le Rang ${rang}`);
      toast({
        title: "Paroles manquantes",
        description: `Aucune parole n'est disponible pour le Rang ${rang}.`,
        variant: "destructive"
      });
      setIsGenerating(prev => ({ ...prev, [rang === 'A' ? 'rangA' : 'rangB']: false }));
      return;
    }

    try {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      console.log(`Génération musique Rang ${rang} avec style ${selectedStyle} - Durée: ${durationText}`);
      console.log(`Paroles à intégrer (${parolesText.length} caractères):`, parolesText.substring(0, 200) + '...');
      
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          lyrics: parolesText,
          style: selectedStyle,
          rang: rang,
          duration: duration
        }
      });

      // Gestion des erreurs Supabase
      if (error) {
        console.error('Erreur Supabase Functions:', error);
        let errorMessage = 'Erreur lors de la génération musicale';
        
        // Vérifier si c'est une erreur d'API Key
        if (error.message?.includes('Authorization') || error.message?.includes('401')) {
          errorMessage = 'Clé API Suno manquante ou invalide. Veuillez vérifier la configuration.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = 'Timeout: La génération prend trop de temps. Veuillez réessayer.';
        } else {
          errorMessage = error.message || errorMessage;
        }
        
        setLastError(errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier si la réponse contient une erreur
      if (!data) {
        throw new Error('Aucune donnée reçue de l\'API');
      }

      if (data.error || data.status === 'error') {
        let errorMessage = data.error || data.message || 'Erreur inconnue lors de la génération';
        
        // Messages d'erreur spécifiques selon le code d'erreur
        if (data.error_code === 429) {
          errorMessage = '💳 Crédits Suno épuisés. Rechargez votre compte sur https://apibox.erweima.ai';
        } else if (data.error_code === 401) {
          errorMessage = '🔑 Clé API Suno invalide. Vérifiez votre configuration dans Supabase.';
        } else if (data.error_code === 408) {
          errorMessage = '⏰ Génération trop longue. Réessayez avec des paroles plus courtes.';
        } else if (data.error_code === 400 && data.error?.includes('sensitive')) {
          errorMessage = '🚫 Paroles non autorisées par Suno AI. Modifiez le contenu.';
        }
        
        console.error('Erreur API Suno:', errorMessage);
        setLastError(errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier si on a bien reçu une URL audio
      if (!data.audioUrl) {
        throw new Error('Aucune URL audio générée par l\'API');
      }

      const audioKey = rang === 'A' ? 'rangA' : 'rangB';
      setGeneratedAudio(prev => ({
        ...prev,
        [audioKey]: data.audioUrl
      }));

      toast({
        title: `Musique Rang ${rang} générée`,
        description: `Chanson de ${durationText} avec paroles chantées générée avec succès !`,
      });

      console.log(`Musique ${durationText} avec paroles générée:`, {
        audioUrl: data.audioUrl,
        lyricsIntegrated: data.lyrics_integrated,
        vocalsIncluded: data.vocals_included
      });
      
    } catch (error) {
      console.error('Erreur génération musique:', error);
      const errorMessage = error.message || "Impossible de générer la musique. Veuillez réessayer.";
      setLastError(errorMessage);
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(prev => ({ ...prev, [rang === 'A' ? 'rangA' : 'rangB']: false }));
    }
  };

  return {
    isGenerating,
    generatedAudio,
    lastError,
    generateMusic
  };
};
