
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

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
  interaction_config: Json;
  quiz_questions: Json;
  reward_messages: Json;
}

export const useImmersiveLogic = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<EdnItemImmersive | null>(null);
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
        const { _data, _error } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (_error) {
          return;
        }

        if (!_data) {
          return;
        }

        setItem(_data);
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
    sections,
    toggleAudio,
    nextSection,
    prevSection,
    setSection
  };
};
