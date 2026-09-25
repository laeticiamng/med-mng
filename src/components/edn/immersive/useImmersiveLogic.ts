import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { useContenuImmersifItem } from '@/hooks/useContenuImmersifItem';

interface EdnItemImmersive {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  item_code: string;
  pitch_intro: string;
  visual_ambiance: Json;
  audio_ambiance: Json;
  tableau_rang_a: Json;
  tableau_rang_b: Json;
  scene_immersive: Json;
  paroles_musicales: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  interaction_config: Json;
  quiz_questions: Json;
  reward_messages: Json;
}

/**
 * Parcours immersif d'un item (/edn/:slug/immersive).
 *
 * Ligne publique d'`edn_items_complete` (colonnes explicites, jamais `*`),
 * puis paroles et quiz par la RPC `mm_contenu_immersif_item` : le serveur ne
 * les renvoie que pour un item d'essai ou un abonné Premium
 * (`contenuVerrouille` sinon, et la page affiche l'encart Premium).
 */
export const useImmersiveLogic = () => {
  const { slug } = useParams();
  const [ligne, setLigne] = useState<Omit<EdnItemImmersive, 'paroles_musicales' | 'quiz_questions'> | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const sections = [
    'Pitch d\'introduction',
    'Scène immersive',
    'Tableau Rang A',
    'Tableau Rang B',
    'Paroles musicales',
    'Bande dessinée',
    'Interaction',
    'Quiz final'
  ];

  useEffect(() => {
    const fetchItem = async () => {
      try {
        // Utiliser edn_items_complete au lieu de edn_items_immersive pour avoir les bonnes compétences OIC
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('id, slug, title, subtitle, item_code, pitch_intro, visual_ambiance, audio_ambiance, tableau_rang_a, tableau_rang_b, scene_immersive, interaction_config, reward_messages')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          return;
        }

        if (!data) {
          return;
        }

        setLigne({
          ...data,
          subtitle: data.subtitle ?? '',
          pitch_intro: data.pitch_intro ?? '',
        });
      } catch (error) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchItem();
    }
  }, [slug]);

  const {
    contenu: contenuImmersif,
    verrouille: contenuVerrouille,
    chargement: chargementContenu,
    etat: etatContenu,
  } = useContenuImmersifItem(ligne?.item_code, { actif: Boolean(ligne) });

  // Mémoïsé : `item` est une dépendance d'effets dans EdnImmersive (suivi
  // d'activité) ; un nouvel objet à chaque rendu les relancerait sans fin.
  const item = useMemo<EdnItemImmersive | null>(() => ligne
    ? {
        ...ligne,
        paroles_musicales: contenuImmersif?.paroles_musicales ?? [],
        paroles_rang_a: contenuImmersif?.paroles_rang_a,
        paroles_rang_b: contenuImmersif?.paroles_rang_b,
        paroles_rang_ab: contenuImmersif?.paroles_rang_ab,
        quiz_questions: (contenuImmersif?.quiz_questions ?? null) as Json,
      }
    : null, [ligne, contenuImmersif]);

  useEffect(() => {
    const newProgress = ((currentSection + 1) / sections.length) * 100;
    setProgress(newProgress);
  }, [currentSection]);

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const setSection = (index: number) => {
    setCurrentSection(index);
  };

  return {
    item,
    currentSection,
    isAudioPlaying,
    progress,
    loading,
    contenuVerrouille,
    chargementContenu,
    etatContenu,
    sections,
    toggleAudio,
    nextSection,
    prevSection,
    setSection
  };
};
