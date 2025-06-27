
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

  const generateMusic = async (rang: 'A' | 'B', paroles: string[], selectedStyle: string) => {
    if (!selectedStyle) {
      toast({
        title: "Style musical requis",
        description: "Veuillez sélectionner un style musical avant de générer la musique.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(prev => ({ ...prev, [rang === 'A' ? 'rangA' : 'rangB']: true }));
    setLastError('');
    const parolesIndex = rang === 'A' ? 0 : 1;
    const parolesText = paroles[parolesIndex];

    try {
      console.log(`Génération musique Rang ${rang} avec style ${selectedStyle} - Durée: 4 minutes`);
      
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          lyrics: parolesText,
          style: selectedStyle,
          rang: rang
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
        description: "Chanson de 4 minutes générée avec succès !",
      });

      console.log(`Musique 4 minutes générée avec succès:`, data.audioUrl);
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
