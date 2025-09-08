import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type RangType = 'A' | 'B' | 'Mix';

interface GenerationRequest {
  itemCode: string;
  rang: RangType;
  tableauData?: any;
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

// ⚠️ DEPRECATED: Use useUnifiedMedicalMusicGeneration instead
export const useMusicGeneration = () => {
  console.warn('🚨 useMusicGeneration is deprecated. Use useUnifiedMedicalMusicGeneration instead.');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const { toast } = useToast();

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
      
      setGenerationProgress('Génération de la musique Suno...');

      const response = await fetch('/api/med-mng/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${itemCode} Rang ${rang} - Compétences Médicales`,
          suno_audio_id: `${itemCode}-${rang}-${Date.now()}`, // Temporaire, sera remplacé par Suno
          meta: {
            itemCode,
            rang,
            prompt,
            structure: 'couplet-refrain-couplet-refrain-couplet-refrain',
            style: 'educatif-medical',
            generated_at: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération musicale');
      }

      const result = await response.json();
      
      setGenerationProgress('Ajout à votre bibliothèque...');

      // Ajouter automatiquement à la bibliothèque
      await fetch('/api/med-mng/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          song_id: result.id
        }),
      });

      // Library refresh removed (deprecated)

      toast({
        title: "🎵 Musique générée avec succès !",
        description: `${itemCode} Rang ${rang} ajouté à votre bibliothèque`,
      });

      return { ...result, id: result.id || result.suno_audio_id };
    } catch (error) {
      console.error('Erreur génération musicale:', error);
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
  }, [toast]);

  return {
    generateMusic,
    isGenerating,
    generationProgress
  };
};

// Helper function pour construire le prompt médical structuré
function buildMedicalPrompt(itemCode: string, rang: RangType, tableauData?: any): string {
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
  if (tableauData && tableauData.sections) {
    const sectionsContent = tableauData.sections
      .map((section: any) => `${section.title}: ${section.content || ''}`)
      .join('\n');
    contentPrompt += `\n\nContenu médical à intégrer:\n${sectionsContent}`;
  }

  return `${contentPrompt}\n\n${baseStructure}\n
Style musical : Educatif et mémorable, rythme entraînant pour l'apprentissage médical.
Langage : Professionnel mais accessible, termes médicaux précis.`;
}