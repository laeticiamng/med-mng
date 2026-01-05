import { useState, useEffect, useRef, useCallback } from 'react';
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
 * Transforme le cas clinique en paroles chantables avec cache
 */
export const useEcosLyrics = (scenarioCode: string | null) => {
  const [lyrics, setLyrics] = useState<EcosLyrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, EcosLyrics>>(new Map());

  const fetchAndGenerateLyrics = useCallback(async (code: string) => {
    // Vérifier le cache d'abord
    if (cacheRef.current.has(code)) {
      setLyrics(cacheRef.current.get(code)!);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Récupérer le scénario ECOS
      const { data, error: dbError } = await supabase
        .from('ecos_scenarios')
        .select('scenario_code, title, speciality, clinical_case, difficulty_level')
        .eq('scenario_code', code)
        .single();

      if (dbError) throw dbError;
      if (!data) throw new Error('Scénario non trouvé');

      // Générer les paroles basées sur le cas clinique
      const generatedLyrics = generateEcosLyrics(data);

      const result: EcosLyrics = {
        scenario: data,
        paroles: generatedLyrics,
        isGenerated: true
      };

      // Mettre en cache
      cacheRef.current.set(code, result);
      setLyrics(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      setLyrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!scenarioCode) {
      setLyrics(null);
      setError(null);
      return;
    }

    fetchAndGenerateLyrics(scenarioCode);
  }, [scenarioCode, fetchAndGenerateLyrics]);

  // Fonction pour forcer le refresh
  const refresh = useCallback(() => {
    if (scenarioCode) {
      cacheRef.current.delete(scenarioCode);
      fetchAndGenerateLyrics(scenarioCode);
    }
  }, [scenarioCode, fetchAndGenerateLyrics]);

  return { lyrics, loading, error, refresh };
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
