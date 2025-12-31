import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EcosScenario {
  scenario_code: string;
  title: string;
  speciality: string;
  clinical_case: string;
  difficulty_level: string;
}

interface EcosLyrics {
  scenario: EcosScenario;
  paroles: string[];
  isGenerated: boolean;
}

/**
 * Hook pour générer des paroles à partir des scénarios ECOS
 * Transforme le cas clinique en paroles chantables
 */
export const useEcosLyrics = (scenarioCode: string | null) => {
  const [lyrics, setLyrics] = useState<EcosLyrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scenarioCode) {
      setLyrics(null);
      return;
    }

    const fetchAndGenerateLyrics = async () => {
      setLoading(true);
      setError(null);

      try {
        // Récupérer le scénario ECOS
        const { data, error: dbError } = await supabase
          .from('ecos_scenarios')
          .select('scenario_code, title, speciality, clinical_case, difficulty_level')
          .eq('scenario_code', scenarioCode)
          .single();

        if (dbError) throw dbError;
        if (!data) throw new Error('Scénario non trouvé');

        // Générer les paroles basées sur le cas clinique
        const generatedLyrics = generateEcosLyrics(data);

        setLyrics({
          scenario: data,
          paroles: generatedLyrics,
          isGenerated: true
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(message);
        setLyrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAndGenerateLyrics();
  }, [scenarioCode]);

  return { lyrics, loading, error };
};

/**
 * Génère des paroles structurées à partir d'un scénario ECOS
 */
function generateEcosLyrics(scenario: EcosScenario): string[] {
  const { scenario_code, title, speciality, clinical_case, difficulty_level } = scenario;

  // Structure de chanson éducative pour ECOS
  const verses: string[] = [
    // Intro - Présentation du cas
    `[Intro]`,
    `Aujourd'hui nous allons voir`,
    `Un cas de ${speciality}`,
    `${title}`,
    `Écoutez bien cette histoire`,
    ``,
    // Couplet 1 - Le cas clinique
    `[Couplet 1]`,
    `${clinical_case}`,
    `C'est un examen ${difficulty_level === 'difficile' ? 'complexe' : difficulty_level === 'moyen' ? 'classique' : 'fondamental'}`,
    `Prenez le temps d'observer`,
    `Et de bien tout examiner`,
    ``,
    // Refrain
    `[Refrain]`,
    `ECOS, ${scenario_code}`,
    `${speciality} c'est notre métier`,
    `Observer, diagnostiquer`,
    `Et le patient accompagner`,
    ``,
    // Couplet 2 - L'approche
    `[Couplet 2]`,
    `L'approche systématique`,
    `Est la clé du diagnostic`,
    `Interrogatoire, examen`,
    `Hypothèses et bilan`,
    ``,
    // Refrain 2
    `[Refrain]`,
    `ECOS, ${scenario_code}`,
    `${speciality} c'est notre métier`,
    `Observer, diagnostiquer`,
    `Et le patient accompagner`,
    ``,
    // Bridge
    `[Bridge]`,
    `Dans chaque cas il y a`,
    `Des signes qui nous guideront`,
    `Avec méthode et rigueur`,
    `On trouvera la solution`,
    ``,
    // Outro
    `[Outro]`,
    `${title}`,
    `Maintenant tu maîtrises`,
    `Ce cas de ${speciality}`,
    `Pour l'ECOS tu es prêt`
  ];

  return verses;
}

export default useEcosLyrics;
