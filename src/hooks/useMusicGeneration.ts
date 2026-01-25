import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMusicLibrary } from './useMusicLibrary';
import { supabase } from '@/integrations/supabase/client';

export type RangType = 'A' | 'B' | 'Mix';

interface TableauSection {
  title?: string;
  content?: string;
}

interface TableauData {
  sections?: TableauSection[];
}

interface GenerationRequest {
  itemCode: string;
  rang: RangType;
  tableauData?: TableauData;
}

interface GenerationResponse {
  id: string;
  suno_audio_id: string;
  title: string;
  meta: {
    itemCode: string;
    rang: RangType;
    structure: string;
    style: string;
  };
}

export const useMusicGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const { toast } = useToast();
  const { loadLibrary } = useMusicLibrary();

  const generateMusic = useCallback(async ({
    itemCode,
    rang,
    tableauData
  }: GenerationRequest): Promise<GenerationResponse | null> => {
    setIsGenerating(true);
    setGenerationProgress('Préparation du prompt médical...');

    try {
      // Construire le prompt basé sur le tableau et le rang
      const prompt = buildMedicalPrompt(itemCode, rang, tableauData);
      
      setGenerationProgress('Génération de la musique...');

      // Use Supabase edge function instead of /api endpoint
      const { _data: result, error } = await supabase.functions.invoke('generate-music', {
        body: {
          title: `${itemCode} Rang ${rang} - Compétences Médicales`,
          suno_audio_id: `${itemCode}-${rang}-${Date.now()}`,
          meta: {
            itemCode,
            rang,
            prompt,
            structure: 'couplet-refrain-couplet-refrain-couplet-refrain',
            style: 'educatif-medical',
            generated_at: new Date().toISOString()
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Erreur lors de la génération musicale');
      }
      
      setGenerationProgress('Ajout à votre bibliothèque...');

      // Add to library via Supabase directly
      const { data: { user } } = await supabase.auth.getUser();
      if (user && result?.id) {
        await supabase.from('med_mng_library' as any).insert({
          user_id: user.id,
          song_id: result.id,
          added_at: new Date().toISOString()
        });
      }

      // Rafraîchir la bibliothèque
      await loadLibrary();

      toast({
        title: "🎵 Musique générée avec succès !",
        description: `${itemCode} Rang ${rang} ajouté à votre bibliothèque`,
      });

      return { ...result, id: result.id || result.suno_audio_id };
    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer la musique. Réessayez plus tard.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  }, [toast, loadLibrary]);

  return {
    generateMusic,
    isGenerating,
    generationProgress
  };
};

// Helper function pour construire le prompt médical structuré
function buildMedicalPrompt(itemCode: string, rang: RangType, tableauData?: TableauData): string {
  const baseStructure = `
Structure imposée :
[Couplet 1] - Introduction des concepts
[Refrain] - Points clés à retenir
[Couplet 2] - Développement pratique
[Refrain] - Points clés à retenir
[Couplet 3] - Application clinique
[Refrain] - Points clés à retenir
`;

  let contentPrompt = '';
  
  if (rang === 'A') {
    contentPrompt = `Générer une chanson éducative sur les compétences fondamentales de ${itemCode}.
Focus sur les bases essentielles, les définitions claires, et les concepts accessibles.`;
  } else if (rang === 'B') {
    contentPrompt = `Générer une chanson éducative sur l'expertise avancée de ${itemCode}.
Focus sur les nuances expertes, les cas complexes, et la maîtrise approfondie.`;
  } else { // Mix
    contentPrompt = `Générer une chanson éducative combinant les fondamentaux et l'expertise de ${itemCode}.
Équilibre entre bases essentielles (Rang A) et expertise avancée (Rang B).`;
  }

  // Ajouter le contenu du tableau si disponible
  if (tableauData?.sections) {
    const sectionsContent = tableauData.sections
      .map((section: TableauSection) => `${section.title || ''}: ${section.content || ''}`)
      .join('\n');
    contentPrompt += `\n\nContenu médical à intégrer:\n${sectionsContent}`;
  }

  return `${contentPrompt}\n\n${baseStructure}\n
Style musical : Educatif et mémorable, rythme entraînant pour l'apprentissage médical.
Langage : Professionnel mais accessible, termes médicaux précis.`;
}