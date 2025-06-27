
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

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(error.message || 'Erreur lors de l\'appel à la fonction');
      }

      if (data.status === 'error') {
        setLastError(data.error);
        throw new Error(data.error);
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
      setLastError(error.message);
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer la musique. Veuillez réessayer.",
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
